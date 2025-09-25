"use client";

import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { format } from 'date-fns'
import { id, enUS } from 'date-fns/locale'
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { CATEGORIES } from "@/lib/data"
import { onAuthStateChanged } from "firebase/auth"
import React from "react"
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Loader2 } from "lucide-react"

function SearchResultItem({ transaction, onClick }: { transaction: Transaction, onClick: () => void }) {
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
    <Link href={`/transaksi/${transaction.id}`} className="block hover:bg-muted/50 transition-colors" onClick={onClick}>
        <div className="flex items-center gap-4 py-3 px-6">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-muted/50")}>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{transaction.title}</p>
                <p className="text-sm text-muted-foreground">
                {format(date, "eeee, dd MMM yyyy", { locale: language === 'id' ? id : enUS })}
                </p>
            </div>
            <p className={cn("font-semibold whitespace-nowrap shrink-0", amountColor)}>
                {amountSign} {formatCurrency(transaction.amount)}
            </p>
        </div>
    </Link>
  )
}

interface SearchResultListProps {
    searchTerm: string;
    onItemClick?: () => void;
}

export function SearchResultList({ searchTerm, onItemClick }: SearchResultListProps) {
    const { t } = useTranslation();
    const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(
                    collection(db, "transactions"), 
                    where("userId", "==", user.uid),
                    orderBy("date", "desc")
                );

                const dataUnsubscribe = onSnapshot(q, (querySnapshot) => {
                    const transactionsData: Transaction[] = [];
                    querySnapshot.forEach((doc) => {
                        transactionsData.push({ id: doc.id, ...doc.data() } as Transaction);
                    });
                    setAllTransactions(transactionsData);
                    setLoading(false);
                }, () => setLoading(false));

                return () => dataUnsubscribe();
            } else {
                setAllTransactions([]);
                setLoading(false);
            }
        });

        return () => authUnsubscribe();
    }, []);

    const filteredTransactions = React.useMemo(() => {
      if (!searchTerm) return [];
      return allTransactions.filter(tx => 
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [searchTerm, allTransactions]);
    
    if (!searchTerm) {
        return <p className="p-6 text-center text-muted-foreground">Mulai ketik untuk mencari transaksi...</p>
    }
    
    if (loading) {
        return <div className="p-6 text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="animate-spin"/>Memuat...</div>
    }

    return (
        <div className="divide-y divide-border">
          {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
            <SearchResultItem transaction={tx} key={tx.id} onClick={onItemClick || (() => {})}/>
          )) : (
            <p className="p-6 text-center text-muted-foreground">Tidak ada transaksi yang cocok ditemukan.</p>
          )}
        </div>
    )
}
