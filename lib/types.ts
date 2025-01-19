import { UTCTimestamp } from 'lightweight-charts';

export interface CandlestickData {
   // time:number;
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

export interface OrderBookData {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
};

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
}

export const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
];