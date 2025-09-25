
"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Transaction, TransactionFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Pencil, Trash2, Calendar, FileText, Tag, Wallet } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddTransactionDialog } from '@/components/dashboard/AddTransactionDialog';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { CATEGORIES } from "@/lib/data";
import { deleteTransaction, updateTransaction } from '@/lib/actions';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';

export default function TransactionDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!user || !transactionId) return;

    const docRef = doc(db, "transactions", transactionId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Transaction;
        if (data.userId === user.uid) {
          setTransaction(data);
          setIsOwner(true);
        } else {
          toast({ title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk melihat transaksi ini.", variant: "destructive" });
          router.push('/dashboard');
        }
      } else {
        toast({ title: "Tidak Ditemukan", description: "Transaksi ini tidak ada.", variant: "destructive" });
        router.push('/dashboard');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, transactionId, router, toast]);

  const handleDelete = async () => {
    if (!user || !isOwner) return;
    try {
      await deleteTransaction(transactionId, user.uid);
      toast({ title: "Sukses", description: "Transaksi berhasil dihapus." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Gagal Menghapus", description: error.message, variant: "destructive" });
    }
  };
  
  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!transaction) {
    return <div className="text-center">Transaksi tidak ditemukan.</div>;
  }
  
  const isIncome = transaction.type === 'income';
  const categoryDetails = CATEGORIES[transaction.category] || CATEGORIES['Lainnya'];
  const Icon = categoryDetails.icon;

  const date = transaction.date instanceof Timestamp
    ? transaction.date.toDate()
    : new Date(transaction.date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
            </Button>
            <h1 className="text-2xl font-bold">{t('tx_detail_page_title')}</h1>
        </div>
        <div className="flex gap-2">
           <AddTransactionDialog 
              transactionToEdit={transaction}
              trigger={
                <Button variant="outline" size="icon" aria-label={t('tx_detail_edit_button')}><Pencil className="h-4 w-4"/></Button>
              }
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" aria-label={t('tx_detail_delete_button')}><Trash2 className="h-4 w-4"/></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('tx_detail_delete_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('tx_detail_delete_confirm_desc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('tx_detail_cancel_button')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('tx_detail_delete_confirm_button')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className={cn(
          "text-center items-center",
          isIncome ? 'bg-income text-income-foreground' : 'bg-expense text-expense-foreground'
        )}>
            <p className="text-4xl font-bold">
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
            </p>
            <CardTitle className="text-2xl">{transaction.title}</CardTitle>
            <Badge variant={isIncome ? 'default' : 'destructive'} className="mt-1 bg-background/20 text-foreground">{transaction.category}</Badge>
            <CardDescription className={cn("pt-2", isIncome ? 'text-income-foreground/80' : 'text-expense-foreground/80')}>
                {format(date, 'eeee, dd MMMM yyyy, HH:mm', { locale: language === 'id' ? id : enUS })}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid gap-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
                    <Wallet className="h-5 w-5 text-muted-foreground"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{t('tx_detail_type')}</p>
                    <p className="font-medium">{isIncome ? t('add_tx_dialog_type_income') : t('add_tx_dialog_type_expense')}</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg">
                    <Tag className="h-5 w-5 text-muted-foreground"/>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{t('tx_detail_category')}</p>
                    <p className="font-medium">{transaction.category}</p>
                </div>
            </div>
             {transaction.notes && (
                 <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground"/>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('tx_detail_notes')}</p>
                        <p className="font-medium whitespace-pre-wrap">{transaction.notes}</p>
                    </div>
                </div>
             )}
        </CardContent>
      </Card>
    </div>
  );
}
