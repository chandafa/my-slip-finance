
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { monthlySummary } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from '@/lib/auth';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/lib/types';


async function getTransactions(userId: string): Promise<Transaction[]> {
  const transactionsQuery = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(transactionsQuery);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
}


const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const lineChartConfig = {
  income: { label: "Pemasukan", color: "hsl(var(--color-income))" },
  expense: { label: "Pengeluaran", color: "hsl(var(--color-expense))" },
} satisfies ChartConfig;

export default function TrenPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getTransactions(user.uid).then(data => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [user]);

  const categoryTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tren Keuangan</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Tren Pemasukan & Pengeluaran (6 Bulan Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
              <LineChart
                data={monthlySummary}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickFormatter={(value) => `${Number(value) / 1000000}jt`} tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <p>Memuat data...</p> : pieChartData.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
             ) : <p className="text-center text-muted-foreground">Belum ada data pengeluaran.</p>}
          </CardContent>
        </Card>
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Kategori Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <p>Memuat data...</p> : Object.keys(categoryTotals).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categoryTotals)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{category}</span>
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
             ) : <p className="text-center text-muted-foreground">Belum ada data pengeluaran.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
