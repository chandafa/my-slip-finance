
"use client"

import { Bar, BarChart, ResponsiveContainer, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { monthlySummary } from "@/lib/data"
import {
  ChartContainer,
} from "@/components/ui/chart"

const chartData = monthlySummary.slice(-1);

const chartConfig = {
  income: {
    label: "Pemasukan",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Pengeluaran",
    color: "hsl(var(--chart-2))",
  },
}

export function IncomeExpenseChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
