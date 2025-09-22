
import type { MonthlySummary, TransactionCategory } from '@/lib/types';
import { Briefcase, Utensils, Repeat, Home, Gift, ShoppingCart, WalletMinimal, MoreHorizontal } from 'lucide-react';


export const CATEGORIES: Record<string, TransactionCategory> = {
    'Gaji': { name: 'Gaji', icon: Briefcase },
    'Makanan': { name: 'Makanan', icon: Utensils },
    'Transportasi': { name: 'Transportasi', icon: Repeat },
    'Tempat Tinggal': { name: 'Tempat Tinggal', icon: Home },
    'Belanja': { name: 'Belanja', icon: ShoppingCart },
    'Hadiah': { name: 'Hadiah', icon: Gift },
    'Lainnya': { name: 'Lainnya', icon: MoreHorizontal },
    'Income': { name: 'Income', icon: WalletMinimal },
}

export const monthlySummary: MonthlySummary[] = [
  { month: 'Jan', income: 15000000, expense: 8000000 },
  { month: 'Feb', income: 15000000, expense: 8500000 },
  { month: 'Mar', income: 15500000, expense: 9000000 },
  { month: 'Apr', income: 15000000, expense: 7800000 },
  { month: 'May', income: 16000000, expense: 9500000 },
  { month: 'Jun', income: 15000000, expense: 8200000 },
  { month: 'Jul', income: 100000, expense: 30000 },
];
