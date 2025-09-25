
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import { isSameDay, startOfMonth, endOfMonth, parseISO } from 'date-fns';

type DayWithTransaction = {
    date: Date;
    income?: boolean;
    expense?: boolean;
    transactions: Transaction[];
};

async function getTransactionsForMonth(userId: string, month: Date): Promise<DayWithTransaction[]> {
    if (!userId) return [];

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end))
    );
    
    const querySnapshot = await getDocs(transactionsQuery);
    const transactionsByDay: { [key: string]: DayWithTransaction } = {};

    querySnapshot.forEach((doc) => {
        const tx = doc.data() as Transaction;
        const txDate = (tx.date as Timestamp).toDate();
        const dayKey = txDate.toISOString().split('T')[0];

        if (!transactionsByDay[dayKey]) {
            transactionsByDay[dayKey] = { date: txDate, transactions: [] };
        }
        
        transactionsByDay[dayKey].transactions.push(tx);
        if (tx.type === 'income') {
            transactionsByDay[dayKey].income = true;
        }
        if (tx.type === 'expense') {
            transactionsByDay[dayKey].expense = true;
        }
    });

    return Object.values(transactionsByDay);
}


export function CashFlowCalendar() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [month, setMonth] = useState(new Date());
    const [daysWithTransactions, setDaysWithTransactions] = useState<DayWithTransaction[]>([]);
    
    useEffect(() => {
        if (user) {
            getTransactionsForMonth(user.uid, month).then(setDaysWithTransactions);
        }
    }, [user, month]);

    const modifiers = {
        income: daysWithTransactions.filter(d => d.income && !d.expense).map(d => d.date),
        expense: daysWithTransactions.filter(d => d.expense && !d.income).map(d => d.date),
        both: daysWithTransactions.filter(d => d.income && d.expense).map(d => d.date),
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('cash_flow_calendar_title')}</CardTitle>
                <CardDescription>{t('cash_flow_calendar_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <TooltipProvider>
                    <Calendar
                        mode="single"
                        month={month}
                        onMonthChange={setMonth}
                        modifiers={modifiers}
                        modifiersClassNames={{
                            income: 'has-income',
                            expense: 'has-expense',
                            both: 'has-both'
                        }}
                        components={{
                            DayContent: ({ date }) => {
                                const dayData = daysWithTransactions.find(d => isSameDay(d.date, date));
                                if (dayData) {
                                    return (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    {date.getDate()}
                                                     <div className="absolute bottom-1.5 flex gap-0.5">
                                                        {dayData.income && <div className="h-1 w-1 rounded-full bg-green-500"></div>}
                                                        {dayData.expense && <div className="h-1 w-1 rounded-full bg-red-500"></div>}
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="space-y-1 p-1">
                                                    {dayData.transactions.map(tx => (
                                                        <div key={tx.id} className="text-xs flex justify-between gap-4">
                                                            <span className="font-semibold">{tx.title}</span>
                                                            <span className={cn(tx.type === 'income' ? "text-green-500" : "text-red-500")}>
                                                                {formatCurrency(tx.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                return <>{date.getDate()}</>;
                            }
                        }}
                        className="p-0"
                    />
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}

