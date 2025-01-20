"use client";

import {useState, useEffect} from 'react';
import { fetchBinanceData } from '@/lib/fetchBinanceData';
import { OrderBookData } from '@/lib/types';
import { formatPriceN,  formatQuantityN } from '@/lib/utils';





const OrderBook = ({ symbol, orderBook }: { symbol: string, orderBook: OrderBookData | null }) => {

    return (
      <div>
        <h2 className='text-center'>Order Book ({symbol})</h2>
        <div className='flex gap-4'>
          {!orderBook ? (
            <p>Loading...</p>
          ) : (
            <>
              <div>
                <div className='flex  gap-4'>
                    <div>

                <h3 className='text-left'>Bids</h3>
                <ul className='w-36 whitespace-nowrap overflow-hidden text-ellipsis'>
  {orderBook?.bids.slice(0, 18).map(({ price, quantity }, index) => (
    <li key={`${price}-${quantity}-${index}`} className="bid text-xs sm:text-sm">
      {price} - {quantity}
    </li>
  )) || <li>No bids available</li>}
</ul>
                    </div>
<div >
    <h3 className='text-right'>Asks</h3>
    <ul className='w-36 whitespace-nowrap overflow-hidden text-ellipsis'>
  {orderBook?.asks.slice(0, 18).map(({ price, quantity }, index) => (
    <li key={`${price}-${quantity}-${index}`} className="ask text-xs sm:text-sm">
      {formatPriceN(price)} - {formatQuantityN(quantity)}
    </li>
  )) || <li>No asks available</li>}
</ul>
</div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default OrderBook;