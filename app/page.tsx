"use client";

import { useEffect, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { fetchBinanceData, createWebSocket } from "@/lib/fetchBinanceData";
import { CandlestickData, OrderBookData } from "@/lib/types";
import { UTCTimestamp } from "lightweight-charts";
import OrderBook from "@/components/OrderBook";
import PriceTicker from "@/components/PriceTicker";
import { TRADING_PAIRS } from "@/lib/types";
import Header from "@/components/Header";


type CandleStickResponse = [number, string, string, string, string, string][];


export default function Home() {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>(TRADING_PAIRS[0].symbol);
  const [selectedInterval, setSelectedInterval] = useState<string>('1h');
  const [error, setError] = useState<string | null>(null);
  const [isChartReady, setIsChartReady] = useState<boolean>(false);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const initializeData = async () => {
      try {
        console.log(`Fetching data for ${selectedPair} with interval ${selectedInterval}`);
        const [klines, orderBookData] = await Promise.all([
          fetchBinanceData<CandleStickResponse>("/api/v3/klines", {
            symbol: selectedPair,
            interval: selectedInterval,
            limit: "200",
          }),
          fetchBinanceData<OrderBookData>("/api/v3/depth", {
            symbol: selectedPair,
            limit: "18",
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

        setData(chartData);
        setOrderBook(orderBookData);
        setLastPrice(parseFloat(klines[klines.length - 1][4]));

        if (isChartReady) {
          ws = createWebSocket(selectedPair, (data) => {
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
              setOrderBook(prev => ({
                lastUpdateId: data.u,
                bids: data.b.map((bid: string[]) => ({
                  price: parseFloat(bid[0]),
                  quantity: parseFloat(bid[1]),
                })),
                asks: data.a.map((ask: string[]) => ({
                  price: parseFloat(ask[0]),
                  quantity: parseFloat(ask[1]),
                })),
              }));
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
        ws.close();
      }
    };
  }, [selectedPair, selectedInterval, isChartReady, orderBook]);

  if (loading) {
    return <div className="loading min-h-screen text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Header />
      <div className="flex justify-around items-center gap-4 w-full md:w-2/3" >
<div>

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
        <label className="mr-2">Interval:</label>
        <select
          value={selectedInterval}
          onChange={(e) => setSelectedInterval(e.target.value)}
          className="p-2 bg-gray-800 text-white"
        >
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
      <div className="w-full flex flex-col lg:flex-row gap-4 ">
       <div className="w-full lg:w-2/3">

          <PriceChart data={data} onReady={() => console.log("Chart is ready!")} />
       </div>
       <div className="flex justify-center">

          <OrderBook symbol={selectedPair} orderBook={orderBook}/>
       </div>
       
       
      </div>
    </div>
  );
}