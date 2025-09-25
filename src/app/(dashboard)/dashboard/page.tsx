
"use client"

import { useState, useEffect } from 'react';
import { BalanceCard } from "@/components/dashboard/BalanceCard"
import { StatCard } from "@/components/dashboard/StatCard"
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart"
import { TransactionList } from "@/components/dashboard/TransactionList"
import { DashboardTour } from "@/components/dashboard/DashboardTour"
import { useAuth } from '@/lib/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    if (user) {
      const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(transactionsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <DashboardTour />
      <div id="balance-card-tour" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <BalanceCard balance={balance} />
        </div>
        <div className="col-span-1 grid grid-cols-2 gap-6 md:col-span-2 lg:col-span-2">
            <StatCard title={t('stat_card_income')} value={totalIncome} type="income" icon={<ArrowUpRight className="h-5 w-5" />} />
            <StatCard title={t('stat_card_expense')} value={totalExpense} type="expense" icon={<ArrowDownLeft className="h-5 w-5" />} />
        </div>
        <div className="lg:col-span-2 md:col-span-2">
          <TransactionList />
        </div>
        <div className="lg:col-span-2 md:col-span-2">
          <IncomeExpenseChart />
        </div>
      </div>
    </div>
  );
}

    