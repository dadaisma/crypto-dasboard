"use client";

import { useEffect, useState } from "react";
import PriceChart from "@/components/PriceChart";
import { fetchBinanceData } from "@/lib/fetchBinanceData";
import { CandlestickData } from "@/lib/types";
import { UTCTimestamp } from "lightweight-charts";
import OrderBook from "@/components/OrderBook";
import PriceTicker from "@/components/PriceTicker";
import { TRADING_PAIRS } from "@/lib/types";
import Header from "@/components/Header";


type CandleStickResponse = [number, string, string, string, string][];


export default function Home() {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string>(TRADING_PAIRS[0].symbol);
  const [selectedInterval, setSelectedInterval] = useState<string>('1h');


  useEffect(() => {
    async function loadChartData() {
      try {
        const response = await fetchBinanceData<CandleStickResponse>("/api/v3/klines", {
          symbol: selectedPair,
          interval: selectedInterval,
          limit: "200",
      });
      const chartData = (response as CandleStickResponse).map(
        ([time, open, high, low, close]) => ({
            time: (time / 1000) as UTCTimestamp, // Convert timestamp to seconds
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: 0,
        })
    );
        setData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChartData();
  }, [selectedPair, selectedInterval]);

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

          <OrderBook symbol={selectedPair} />
       </div>
       
       
      </div>
    </div>
  );
}