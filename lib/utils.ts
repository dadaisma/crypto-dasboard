import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: string) => parseFloat(price).toFixed(2);

export const formatQuantity = (quantity: string) => {
    const qty = parseFloat(quantity);
    if (qty >= 1000) {
        return (qty / 1000).toFixed(2) + 'K';
    }
    return qty.toFixed(5);
};

export const formatPriceN = (price: number): number => {
  return Math.round(price * 100) / 100;
};

export const formatQuantityN = (quantity: number): string => {
  if (quantity >= 1000) {
      return (Math.round((quantity / 1000) * 100) / 100) + 'K';
  }
  return (Math.round(quantity * 100000) / 100000).toString();
};