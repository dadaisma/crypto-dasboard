"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, UTCTimestamp } from "lightweight-charts";
import { CandlestickData } from "@/lib/types";

interface PriceChartProps {
  data: CandlestickData[];
  onReady: () => void;
}

export default function PriceChart({ data, onReady }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [ohlc, setOhlc] = useState<CandlestickData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

     // Create volume series first (so it appears behind the candlesticks)
     const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume", // Separate scale for volume
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceScaleId: "right", // Main price scale
    });

    // Set the data for both series
    volumeSeries.setData(
      data.map((item) => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? "#26a69a" : "#ef5350",
      }))
    );
    candlestickSeries.setData(data);

    // Configure the volume scale to be overlaid
    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.7, // Reserve 70% of the space for candlesticks
        bottom: 0,
      },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    onReady();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.seriesData) return;
      const ohlcData = param.seriesData.get(candlestickSeries);
      if (ohlcData) {
        const volumeData = data.find(item => item.time === (ohlcData.time as UTCTimestamp));
        if (volumeData) {
          setOhlc({ ...ohlcData, volume: volumeData.volume } as CandlestickData);
           // Clear previous timeout if it exists
           if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set a new timeout to clear the OHLC data after 5 seconds
          timeoutRef.current = setTimeout(() => {
            setOhlc(null);
          }, 5000);
        }
      }
    });


    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, onReady]);

  return (
    <div className="w-full h-[400px] bg-black rounded-lg p-4 relative">
    <div ref={chartContainerRef} className="w-full h-full" />
    {ohlc && (
        <div className=" text-sm flex flex-col sm:flex-row absolute top-2 left-2 text-white bg-gray-800 sm:gap-4  rounded z-50">
        <p>Open: {ohlc.open}</p>
        <p>Close: {ohlc.close}</p>
        <p>High: {ohlc.high}</p>
        <p>Low: {ohlc.low}</p>
        <p >Volume: {ohlc.volume}</p>
      </div>
    )}
  </div>
  );
}