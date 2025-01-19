"use client";

import {useState, useEffect} from 'react';
import { fetchBinanceData } from '@/lib/fetchBinanceData';
import { formatPrice } from '@/lib/utils';

type PriceData = {
    symbol: string;
    price: string;
};

const PriceTicker = ({symbol} : {symbol: string}) => {
    const [prices, setPrices] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
   
    async function fetchPrices() {
      try {
        const data = await fetchBinanceData<PriceData[]>('/api/v3/ticker/price');
        setPrices(data);
        setLoading(false);
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    }
  useEffect(() => {
    fetchPrices();
  }, []);  

  return (
    <div>
        <h1 className='font-bold'>Price Ticker</h1>
        {loading ? (
            <p>Loading...</p>
        ) : error ? (
            <p>Error: {error}</p>
        ) : (
            <ul>
                {prices.map((price) => (
                    <li key={price.symbol}>
                        {price.symbol}: {formatPrice(price.price)}
                    </li>
                ))}
            </ul>
        )}
    </div>
  )
}

export default PriceTicker