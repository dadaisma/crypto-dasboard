"use client";

import { useEffect, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { fetchBinanceData, createWebSocket, closeWebSocket } from "@/lib/fetchBinanceData";
import { CandlestickData, OrderBookData } from "@/lib/types";
import { UTCTimestamp } from "lightweight-charts";
import OrderBook from "@/components/OrderBook";
import { TRADING_PAIRS } from "@/lib/types";
import Header from "@/components/Header";
import { FaArrowCircleDown, FaArrowCircleUp } from "react-icons/fa";
import FlipNumbers from "react-flip-numbers";


type CandleStickResponse = [number, string, string, string, string, string][];


export default function Home() {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>(TRADING_PAIRS[0].symbol);
  const [selectedInterval, setSelectedInterval] = useState<string>('5m');
  const [error, setError] = useState<string | null>(null);
  const [isChartReady, setIsChartReady] = useState<boolean>(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [volume24h, setVolume24h] = useState<number | null>(null);
  const [data24h, setData24h] = useState<CandlestickData[]>([]);


  useEffect(() => {
    let ws: WebSocket;
  
    const initializeData = async () => {
      try {
        
      //  console.log(`Fetching data for ${selectedPair} with interval ${selectedInterval}`);
        const [klines, orderBookData, klines24h] = await Promise.all([
          fetchBinanceData<CandleStickResponse>("/api/v3/klines", {
            symbol: selectedPair,
            interval: selectedInterval,
            limit: "1000",
          }),
          fetchBinanceData<OrderBookData>("/api/v3/depth", {
            symbol: selectedPair,
            limit: "18",
          }),
          fetchBinanceData<CandleStickResponse>("/api/v3/klines", {
            symbol: selectedPair,
            interval: "1h",
            limit: "200",
          }),
        ]);
       
        const chartData = klines.map(
          ([time, open, high, low, close, volume]) => ({
            time: (time / 1000) as UTCTimestamp, // Convert timestamp to seconds
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: parseFloat(volume)
          })
        );

        const chartData24h = klines24h.map(
          ([time, open, high, low, close, volume]) => ({
            time: (time / 1000) as UTCTimestamp, // Convert timestamp to seconds
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: parseFloat(volume),
          })
        );
  
        setData(chartData);
        setData24h(chartData24h);
        setOrderBook(orderBookData);
        setLastPrice(parseFloat(klines[klines.length - 1][4]));
        setVolume(parseFloat(klines[klines.length - 1][5]));
      
 // Calculate 24h change and volume
 const firstPrice24h = parseFloat(klines24h[0][1]);
 const lastPrice24h = parseFloat(klines24h[klines24h.length - 1][4]);
 const volume24h = klines24h.reduce((acc, kline) => acc + parseFloat(kline[5]), 0);

 setPriceChange24h(((lastPrice24h - firstPrice24h) / firstPrice24h) * 100);
 setVolume24h(volume24h);

     
 if (isChartReady) {
  ws = createWebSocket(selectedPair, selectedInterval, (data) => {
    if (data.e === 'kline') {
      const newCandle: CandlestickData = {
        time: data.k.t / 1000 as UTCTimestamp,
        open: parseFloat(data.k.o),
        high: parseFloat(data.k.h),
        low: parseFloat(data.k.l),
        close: parseFloat(data.k.c),
        volume: parseFloat(data.k.v),
      };
  
              setData(prev => {
                const filtered = prev.filter(candle => candle.time !== newCandle.time);
                return [...filtered, newCandle].sort((a, b) => a.time - b.time);
              });
  
              const newPrice = parseFloat(data.k.c);
              setLastPrice(prevPrice => {
                if (prevPrice !== null) {
                  setPriceChange(((newPrice - prevPrice) / prevPrice) * 100);
                }
                return newPrice;
              });
            } else if (data.e === 'depthUpdate') {
             
              setOrderBook({
                lastUpdateId: data.u,
                bids: data.b.map((bid: string[]) => ({
                  price: parseFloat(bid[0]),
                  quantity: parseFloat(bid[1]),
                })),
                asks: data.a.map((ask: string[]) => ({
                  price: parseFloat(ask[0]),
                  quantity: parseFloat(ask[1]),
                })),
              });
            }
          });
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    initializeData();
  
    return () => {
      if (ws) {
        closeWebSocket(ws, selectedPair, selectedInterval);
      }
    };
  }, [selectedPair, selectedInterval, isChartReady]); 

  const handleIntervalChange = (newInterval: string) => {
    setSelectedInterval(newInterval);
  };
 
  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  };

  const calculate24hVolume = () => {
    if (data24h.length === 0 || lastPrice === null) return '$0';
    const volume = data24h.reduce((acc, curr) => acc + curr.volume, 0) * lastPrice;
    return `$${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const calculate24hChange = () => {
    if (data24h.length < 24) return 0;
    const change = ((data24h[data24h.length - 1].close - data24h[0].open) / data24h[0].open) * 100;
    return change;
  };

  const change24h = calculate24hChange();
  const change24hClass = change24h > 0 ? 'text-green-400' : 'text-red-400';


  if (loading) {
    return <div className="loading min-h-screen text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <div className="flex justify-around items-center gap-4 w-full md:w-2/3" >
<div>
<label className="mr-2 text-sm">Pair:</label>
      <select
        value={selectedPair}
        onChange={(e) => setSelectedPair(e.target.value)}
        className="mb-4 p-2 bg-gray-800 text-white"
      >
        {TRADING_PAIRS.map((pair) => (
          <option key={pair.symbol} value={pair.symbol}>
            {pair.baseAsset}/{pair.quoteAsset}
          </option>
        ))}
      </select>
</div>
      <div className="mb-4">
        <label className="mr-2 text-sm">Interval:</label>
        <select
          value={selectedInterval}
          onChange={(e) => handleIntervalChange(e.target.value)}
          className="p-2 bg-gray-800 text-white"
        >
           <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="30m">30m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
          <option value="1w">1w</option>
          <option value="1M">1M</option>
        </select>
      </div>
      </div>
      <div className="mb-4">
      <div className="mb-4  flex justify-around items-center w-full lg:w-2/3 flex-col sm:flex-row">
        <div className="text-3xl font-bold flex gap-2 items-center justify-center">
       <h2 className="text-sm sm:text-md   ">24h Change</h2>
       <div className={`text-xl sm:text-3xl ${change24hClass}`}>
          {change24h.toFixed(2)}%
        </div>
        </div>
        <div>
       Volume: {calculate24hVolume()}
        </div>
        </div>
        <div className="flex justify-around items-center w-full lg:w-2/3 flex-col sm:flex-row ">
         <div className="flex gap-2 items-center text-sm">
    
         <h3 className="text-lg flex gap-2"> $
            {lastPrice !== null && (
                <FlipNumbers
                  height={15}
                  width={30}
                  color="white"
                  background="#2d3748"
                  play
                  perspective={100}
                  numbers={formatNumber(lastPrice)}
                />
              )}
            </h3>
        
            <div className={`flex items-center gap-2 ${priceChange && priceChange < 0 ? 'ask' : 'bid'}`}>

            {priceChange && priceChange > 0 ? <FaArrowCircleUp  /> : <FaArrowCircleDown  />} <span >{priceChange?.toFixed(2)}%</span>
            </div>
         </div>
          {/*
            <h3 className="text-sm sm:text-lg mt-2 sm:mt-0">Volume: {volume?.toFixed(2)}</h3>
            */}
         
        </div>
      </div>
     
      <div className="w-full flex flex-col lg:flex-row gap-4 ">
       <div className="w-full lg:w-2/3">

          <PriceChart data={data} onReady={() => setIsChartReady(true)} interval={selectedInterval} selectedPair={selectedPair} />
       </div>
      
       <div className="flex justify-center">

          <OrderBook symbol={selectedPair} orderBook={orderBook}/>
       </div>
       
       
      </div>
    </div>
  );
}