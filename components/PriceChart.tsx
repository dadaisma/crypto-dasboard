"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { CandlestickData } from "@/lib/types";

interface PriceChartProps {
  data: CandlestickData[];
  interval: string;
  onReady: () => void;
}

export default function PriceChart({ data, onReady, interval }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [ohlc, setOhlc] = useState<CandlestickData | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const barSpacingRef = useRef<number | null>(null);
  const defaultBarSpacing = 0.8;
  const intervalRef = useRef(interval);

  useEffect(() => {
    intervalRef.current = interval;
  }, [interval]);
  // Initialize the chart only once
  useEffect(() => {
   
    if (!chartContainerRef.current || chartRef.current) return;
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

    // Create series
    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Store references
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const handleZoom = (event: WheelEvent) => {
      event.preventDefault();
      if (chartRef.current) {
        const timeScale = chartRef.current.timeScale();
        const currentBarSpacing = timeScale.options().barSpacing;
    
        // Calculate the zoom factor (deltaY > 0 for zoom out, < 0 for zoom in)
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.8;
    
        // Apply new bar spacing
        const newBarSpacing = Math.max(currentBarSpacing * zoomFactor,1); // Prevent barSpacing from being too small
     //   timeScale.applyOptions({ barSpacing: newBarSpacing });
        barSpacingRef.current = newBarSpacing;
      }
    };

    chartContainerRef.current.addEventListener('wheel', handleZoom);

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.seriesData) {
        setOhlc(null);
        return;
      }
    
      const ohlcData = param.seriesData.get(candlestickSeriesRef.current!);
    
      if (ohlcData) {
        // Ensure timestamp comparison matches the data format
        const volumeData = data.find(
          item => Number(item.time) === Number(ohlcData.time)
        );
    
        if (volumeData) {
          setOhlc({
            ...ohlcData,
            volume: volumeData.volume, // Add volume to the data
          } as CandlestickData);
    
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
          timeoutRef.current = setTimeout(() => {
            setOhlc(null);
          }, 5000);
        }
      }
    });

    window.addEventListener('resize', handleResize);
    chartContainerRef.current.addEventListener('wheel', handleZoom);

    onReady();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartContainerRef.current) {
        chartContainerRef.current.removeEventListener('wheel', handleZoom);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onReady]);

  // Update chart data dynamically when `data` changes
  useEffect(() => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current) {
      candlestickSeriesRef.current.setData(data);
      volumeSeriesRef.current.setData(
        data.map((item) => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? "#26a69a" : "#ef5350",
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    if (chartRef.current && candlestickSeriesRef.current) {
      const timeScale = chartRef.current.timeScale();
  
      // Reset bar spacing to default
      timeScale.applyOptions({ barSpacing: defaultBarSpacing });
      barSpacingRef.current = defaultBarSpacing;
     
      // Fit all data into the chart
      chartRef.current.timeScale().fitContent();
  
      // Scroll to the most recent candle on the right
      timeScale.scrollToRealTime();
    }
  }, [interval]);

  return (
    <div className="w-full h-[400px] bg-black rounded-lg p-4 relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      {ohlc && (
        <div className=" text-sm flex flex-col sm:flex-row absolute top-2 left-2 text-white bg-gray-800 sm:gap-4 rounded z-50">
          <p>Open: {ohlc.open}</p>
          <p>Close: {ohlc.close}</p>
          <p>High: {ohlc.high}</p>
          <p>Low: {ohlc.low}</p>
          <p>Volume: {ohlc.volume}</p>
        </div>
      )}
    </div>
  );
}
