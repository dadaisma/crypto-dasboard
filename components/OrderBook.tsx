"use client";

import {useState, useEffect} from 'react';
import { fetchBinanceData } from '@/lib/fetchBinanceData';
import { OrderBookData } from '@/lib/types';
import { formatPrice, formatQuantity } from '@/lib/utils';




const OrderBook = ({symbol} : {symbol: string}) => {
    const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchOrderBook() {
    try {
        const data = await fetchBinanceData<OrderBookData>('/api/v3/depth', { symbol });
        setOrderBook(data);
    } catch (error) {
        setError((error as Error).message);
        
    }finally {
        setLoading(false);
    }
}
    useEffect(() => {
        fetchOrderBook()
    }, [symbol]);


    return (
        <div>

            <h2 className='text-center'>Order Book ({symbol})</h2>
        <div className='flex gap-4'>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <div>
                        <h3 className='text-left'>Bids</h3>
                        <ul>
                            {orderBook?.bids?.slice(0, 18).map(([price, quantity]) => (
                                <li key={price} className='bid text-xs sm:text-sm'>
                                    {formatPrice(price)} - {formatQuantity(quantity)}
                                </li>
                            )) || <li>No bids available</li>}
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-right'>Asks</h3>
                        <ul>
                            {orderBook?.asks?.slice(0,18).map(([price, qty]) => (
                                    <li key={price} className="ask text-xs sm:text-sm">
                                         {formatPrice(price)} - {formatQuantity(qty)}
                                    </li>
                                ))
                             || <li>No Asks available</li>
                            }
                        </ul>
                    </div>
                </>
            )}
        </div>
        </div>
    );
}

export default OrderBook