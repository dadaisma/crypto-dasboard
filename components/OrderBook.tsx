"use client";

import { useState } from 'react';
import { OrderBookData } from '@/lib/types';
import { formatQuantityN, formatPriceRounded } from '@/lib/utils';


const groupOrders = (orders: { price: number, quantity: number }[], interval: number) => {
  const groupedOrders: { price: number, quantity: number }[] = [];

  orders.forEach(order => {
    const roundedPrice = Math.floor(order.price / interval) * interval;
    const existingOrder = groupedOrders.find(o => o.price === roundedPrice);

    if (existingOrder) {
      existingOrder.quantity += order.quantity;
    } else {
      groupedOrders.push({ price: roundedPrice, quantity: order.quantity });
    }
  });

  return groupedOrders;
};


const OrderBook = ({ symbol, orderBook }: { symbol: string, orderBook: OrderBookData | null }) => {
  const [interval, setInterval] = useState<number>(10); 

  const groupedBids = groupOrders(orderBook?.bids || [], interval);
  const groupedAsks = groupOrders(orderBook?.asks || [], interval);

  const maxVolume = Math.max(
    ...groupedBids.map(bid => bid.quantity) || [],
    ...groupedAsks.map(ask => ask.quantity) || []
  );

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(parseFloat(e.target.value));
  };


  return (
    <div className="bg-gray-900 p-2 rounded-lg">
     <div className="flex justify-between items-center  gap-2 ">
        <h2 className="text-white">Order Book ({symbol})</h2>
        <div className="flex items-center">
          <label className="text-white mr-2 text-sm">Group by:</label>
          <select
            value={interval}
            onChange={handleIntervalChange}
            className="p-2 bg-gray-800 text-white rounded text-sm"
          >
            <option value={0.5}>$0.50</option>
            <option value={1}>$1.00</option>
            <option value={10}>$10.00</option>
            <option value={50}>$50.00</option>
            <option value={100}>$100.00</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        {!orderBook ? (
          <p className="text-white">Loading...</p>
        ) : (
          <>
            <div className="w-1/2">
              <h3 className="text-left bid mb-2 ">Bids</h3>
              <ul className="w-full h-96 overflow-y-auto ">
              {groupedBids.filter(bid => bid.quantity > 0).slice(0, 16).map(({ price, quantity }, index) => (
                  <li key={`${price}-${quantity}-${index}`} className="flex justify-between text-xs sm:text-sm bid relative gap-2">
                    <span>{formatPriceRounded(price)}</span>
                    <span className='ml-5'>{formatQuantityN(quantity)}</span>
                    <div
                      className="absolute left-0 top-0 h-full bg-green-900 opacity-50"
                      style={{ width: '100px', background: `linear-gradient(to right, #26a69a ${quantity / maxVolume * 100}%, transparent ${quantity / maxVolume * 100}%)` }}
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2">
              <h3 className="text-right ask mb-2">Asks</h3>
              <ul className="w-full h-96 overflow-y-auto">
              {groupedAsks.filter(ask => ask.quantity > 0).slice(0, 16).map(({ price, quantity }, index) => (
                  <li key={`${price}-${quantity}-${index}`} className="flex justify-between text-xs sm:text-sm ask relative gap-2">
                    <span>{formatPriceRounded(price)}</span>
                    <span className='ml-5'>{formatQuantityN(quantity)}</span>
                    <div
                      className="absolute left-0 top-0 h-full bg-red-900 opacity-50"
                      style={{ width: '100px', background: `linear-gradient(to right, #ef5350 ${quantity / maxVolume * 100}%, transparent ${quantity / maxVolume * 100}%)` }}
                    ></div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

  
  export default OrderBook;