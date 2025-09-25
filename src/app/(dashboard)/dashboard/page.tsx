
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
import { CashFlowCalendar } from '@/components/dashboard/CashFlowCalendar';

import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';

const componentMap = {
  BalanceCard,
  StatCards: (props: any) => (
    <div className="col-span-1 grid grid-cols-2 gap-6 md:col-span-2 lg:col-span-2">
      <StatCard title={props.t('stat_card_income')} value={props.totalIncome} type="income" icon={<ArrowUpRight className="h-5 w-5" />} />
      <StatCard title={props.t('stat_card_expense')} value={props.totalExpense} type="expense" icon={<ArrowDownLeft className="h-5 w-5" />} />
    </div>
  ),
  TransactionList,
  IncomeExpenseChart,
  CashFlowCalendar,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { layout } = useDashboardLayout();
  
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

  const componentProps: { [key: string]: any } = {
    BalanceCard: { balance },
    StatCards: { totalIncome, totalExpense, t },
    TransactionList: {},
    IncomeExpenseChart: {},
    CashFlowCalendar: {},
  };

  const getGridSpanClass = (componentName: string) => {
    switch (componentName) {
      case 'BalanceCard':
      case 'StatCards':
        return 'lg:col-span-2 md:col-span-2';
      case 'TransactionList':
        return 'lg:col-span-2 md:col-span-2';
      case 'IncomeExpenseChart':
      case 'CashFlowCalendar':
        return 'lg:col-span-1 md:col-span-1';
      default:
        return 'lg:col-span-2 md:col-span-2';
    }
  };

  const renderComponent = (componentName: string) => {
    const Component = componentMap[componentName as keyof typeof componentMap];
    if (!Component) return null;
    return <Component {...componentProps[componentName]} />;
  };

  return (
    <div className="space-y-6">
      <DashboardTour />
      <div id="balance-card-tour" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {layout.map((componentName) => (
          <div key={componentName} className={getGridSpanClass(componentName)}>
            {renderComponent(componentName)}
          </div>
        ))}
      </div>
    </div>
  );
}

    
