"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi } from "lightweight-charts";
import { CandlestickData } from "@/lib/types";

interface PriceChartProps {
  data: CandlestickData[];
  onReady: () => void;
}

export default function PriceChart({ data, onReady }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#D9D9D9",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(data);
    chartRef.current = chart;
    onReady();

    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
          chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
              height: chartContainerRef.current.clientHeight,
          });
      }
  });

  resizeObserver.observe(chartContainerRef.current);

  return () => {
      resizeObserver.disconnect();
      chart.remove();
  };
}, [data, onReady]);

  return (
    <div className="w-full h-[400px] bg-black rounded-lg p-4">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
