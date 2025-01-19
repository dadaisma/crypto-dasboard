"use client";

import {useState, useEffect} from 'react';
import { fetchBinanceData } from '@/lib/fetchBinanceData';

type OrderBookData = {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
};

const OrderBook = () => {
    const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchOrderBook() {
    try {
        const data = await fetchBinanceData<OrderBookData>('/api/v3/depth', { symbol: 'BTCUSDT' });
        console.log("Order",data);
        setOrderBook(data);
    } catch (error) {
        setError((error as Error).message);
        
    }finally {
        setLoading(false);
    }
}
    useEffect(() => {
        fetchOrderBook()
    }, []);


    return (
        <div>
            <h2>Order Book (BTC/USDT)</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <>
                    <div>
                        <h3>Bids</h3>
                        <ul>
                            {orderBook?.bids?.length ? (
                                orderBook.bids.map(([price, quantity]) => (
                                    <li key={price}>
                                        {price} - {quantity}
                                    </li>
                                ))
                            ) : (
                                <li>No bids available</li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3>Vendite (Asks)</h3>
                        <ul>
                            {orderBook?.asks?.length ? (
                                orderBook.asks.map(([price, qty]) => (
                                    <li key={price}>
                                        Price: {price} - Qt: {qty}
                                    </li>
                                ))
                            ) : (
                                <li>No Asks available</li>
                            )}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

export default OrderBook