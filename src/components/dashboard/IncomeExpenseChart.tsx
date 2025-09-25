
"use client"

import { useState, useEffect } from "react";
import { Bar, BarChart, ResponsiveContainer, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { Transaction } from "@/lib/types";
import { useTranslation } from "@/hooks/use-translation";

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "hsl(var(--color-income))",
  },
  expense: {
    label: "Pengeluaran",
    color: "hsl(var(--color-expense))",
  },
}

export function IncomeExpenseChart() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([{
      month: 'This Month',
      income: 0,
      expense: 0
  }]);

  useEffect(() => {
    if (!user) return;

    const fetchMonthlyData = async () => {
        setLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactionsQuery = query(
            collection(db, "transactions"),
            where("userId", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(startOfMonth)),
            where("date", "<=", Timestamp.fromDate(endOfMonth))
        );

        try {
            const querySnapshot = await getDocs(transactionsQuery);
            let totalIncome = 0;
            let totalExpense = 0;
            querySnapshot.forEach((doc) => {
                const transaction = doc.data() as Transaction;
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpense += transaction.amount;
                }
            });

            const locale = language === 'id' ? 'id-ID' : 'en-US';
            setChartData([{
                month: now.toLocaleString(locale, { month: 'long' }),
                income: totalIncome,
                expense: totalExpense
            }]);

        } catch (error) {
            console.error("Error fetching monthly data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchMonthlyData();
}, [user, language]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('chart_monthly_title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="h-[200px] w-full flex items-center justify-center">
                <p className="text-muted-foreground">{t('chart_loading')}</p>
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }} barSize={60}>
                    <YAxis
                    tickFormatter={(value) => `${Number(value) / 1000000}jt`}
                    domain={[0, 'dataMax + 2500000']}
                    tickCount={5}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    />
                    <Bar dataKey="income" fill="var(--color-income)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expense" fill="var(--color-expense)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

    