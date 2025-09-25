
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { id, enUS } from 'date-fns/locale'
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs, Timestamp, onSnapshot } from "firebase/firestore"
import { CATEGORIES } from "@/lib/data"
import { onAuthStateChanged } from "firebase/auth"
import React from "react"
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const { language } = useTranslation();
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
  const amountSign = isIncome ? '+' : '-';
  
  const categoryDetails = CATEGORIES[transaction.category] || CATEGORIES['Lainnya'];
  const Icon = categoryDetails.icon;

  const date = transaction.date instanceof Timestamp 
    ? transaction.date.toDate()
    : new Date(transaction.date);

  return (
    <Link href={`/transaksi/${transaction.id}`} className="block hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4 py-3 px-6">
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-muted/50")}>
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{transaction.title}</p>
            <p className="text-sm text-muted-foreground">
            {format(date, "MMM dd", { locale: language === 'id' ? id : enUS })}
            </p>
        </div>
        <p className={cn("font-semibold whitespace-nowrap shrink-0", amountColor)}>
            {amountSign} {formatCurrency(transaction.amount)}
        </p>
        </div>
    </Link>
  )
}

export function TransactionList() {
    const { t } = useTranslation();
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, "transactions"), 
                    where("userId", "==", user.uid),
                    orderBy("date", "desc"),
                    limit(10)
                );

                const dataUnsubscribe = onSnapshot(q, (querySnapshot) => {
                    const transactionsData: Transaction[] = [];
                    querySnapshot.forEach((doc) => {
                        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
                    });
                    setTransactions(transactionsData);
                    setLoading(false);
                });

                return () => dataUnsubscribe();
            } else {
                setTransactions([]);
                setLoading(false);
            }
        });

        return () => authUnsubscribe();
    }, []);

    if (loading) {
        return (
             <Card className="w-full">
                <CardHeader>
                    <CardTitle>{t('tx_list_title')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p>{t('tx_list_loading')}</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('tx_list_title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {transactions.length > 0 ? transactions.map((tx) => (
            <TransactionItem transaction={tx} key={tx.id} />
          )) : (
            <p className="p-6 text-muted-foreground">{t('tx_list_empty')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

    