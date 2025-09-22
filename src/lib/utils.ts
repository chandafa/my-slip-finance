import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'IDR') {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // The default for 'id-ID' might be "Rp", but this makes it explicit.
  return formatter.format(amount).replace(/\u00A0/g, ' ').replace('IDR', 'Rp');
}
