
"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Download, ChevronDown, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Transaction } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useTranslation } from '@/hooks/use-translation';

async function getTransactionsForRange(userId: string, dateRange?: DateRange): Promise<Transaction[]> {
  if (!userId) return [];

  let transactionsQuery = query(
    collection(db, "transactions"),
    where("userId", "==", userId)
  );

  if (dateRange?.from) {
    transactionsQuery = query(transactionsQuery, where("date", ">=", Timestamp.fromDate(dateRange.from)));
  }
  if (dateRange?.to) {
    // Add 1 day to the end date to make it inclusive
    const toDate = new Date(dateRange.to);
    toDate.setDate(toDate.getDate() + 1);
    transactionsQuery = query(transactionsQuery, where("date", "<", Timestamp.fromDate(toDate)));
  }

  const querySnapshot = await getDocs(transactionsQuery);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
     const data = doc.data();
    transactions.push({ 
      id: doc.id,
       ...data,
       // Ensure date is a string for processing
       date: (data.date as Timestamp).toDate().toISOString(),
    } as Transaction);
  });
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function LaporanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getTransactionsForRange(user.uid, dateRange).then(data => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [user, dateRange]);


  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netValue = totalIncome - totalExpense;

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
      const categoryName = t.category;
      acc[categoryName] = (acc[categoryName] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleExport = async (fileType: 'pdf' | 'xlsx') => {
    if (!user) {
      toast({ title: "Gagal Mengekspor", description: "Anda harus login.", variant: "destructive" });
      return;
    }

    if (!dateRange || !dateRange.from || !dateRange.to) {
       toast({ title: "Gagal Mengekspor", description: "Silakan pilih rentang tanggal.", variant: "destructive" });
       return;
    }

    setExporting(true);
    toast({ title: "Ekspor Dimulai", description: `File ${fileType.toUpperCase()} Anda sedang disiapkan...` });

    try {
      if (transactions.length === 0) {
        toast({ title: "Tidak Ada Data", description: "Tidak ada transaksi pada rentang tanggal ini.", variant: "destructive" });
        return;
      }
      
      if (fileType === 'pdf') {
        generatePdf(transactions, dateRange);
      } else if (fileType === 'xlsx') {
        generateXlsx(transactions, dateRange);
      }
    } catch(error) {
      console.error("Export error:", error);
      toast({ title: "Gagal Mengekspor", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
       setExporting(false);
    }
  };

  const generatePdf = (transactions: Transaction[], range: DateRange) => {
    const doc = new jsPDF();
    const formattedDateRange = `${format(range.from!, 'dd/MM/yyyy')} - ${format(range.to!, 'dd/MM/yyyy')}`;
    doc.setFontSize(18);
    doc.text("Laporan Transaksi Keuangan", 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${formattedDateRange}`, 14, 30);
    const tableData = transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yy'),
        t.title,
        t.category,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatCurrency(t.amount)
    ]);
    autoTable(doc, {
      startY: 40,
      head: [['Tanggal', 'Judul', 'Kategori', 'Tipe', 'Jumlah']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [38, 50, 56] }
    });
    doc.save(`Laporan_MySlip_${formattedDateRange}.pdf`);
  }

  const generateXlsx = (transactions: Transaction[], range: DateRange) => {
    const formattedDateRange = `${format(range.from!, 'yyyy-MM-dd')}_${format(range.to!, 'yyyy-MM-dd')}`;
    const dataToExport = transactions.map(t => ({
      'Tanggal': format(new Date(t.date), 'yyyy-MM-dd'),
      'Judul': t.title,
      'Kategori': t.category,
      'Tipe': t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      'Jumlah': t.amount,
      'Catatan': t.notes || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
    const cols = Object.keys(dataToExport[0]);
    const colWidths = cols.map(col => ({
        wch: Math.max(...dataToExport.map(row => (row[col as keyof typeof row] ?? '').toString().length), col.length) + 2
    }));
    worksheet["!cols"] = colWidths;
    XLSX.writeFile(workbook, `Laporan_MySlip_${formattedDateRange}.xlsx`);
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{t('report_page_title')}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <DateRangePicker onDateChange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto" disabled={exporting}>
                {exporting ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                {t('report_export_button')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                <FileSpreadsheet className="mr-2" /> Excel (XLSX)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title={t('stat_card_income')} value={totalIncome} type="income" icon={<ArrowUpRight />} />
          <StatCard title={t('stat_card_expense')} value={totalExpense} type="expense" icon={<ArrowDownLeft />} />
          <StatCard 
            title={t('report_stat_net')} 
            value={netValue} 
            type={netValue >= 0 ? 'income' : 'expense'} 
            icon={netValue >= 0 ? <ArrowUpRight /> : <ArrowDownLeft />} 
          />
        </div>

        <Card className="lg:col-span-3 md:col-span-2">
          <CardHeader>
            <CardTitle>{t('report_category_breakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <p>{t('chart_loading')}</p> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('report_table_category')}</TableHead>
                    <TableHead className="text-right">{t('report_table_amount')}</TableHead>
                    <TableHead className="text-right hidden sm:table-cell">{t('report_table_percentage')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(categoryTotals).length > 0 ? Object.entries(categoryTotals).map(([category, amount]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {totalExpense > 0 ? `${((amount / totalExpense) * 100).toFixed(1)}%` : '0%'}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">{t('report_table_no_expense')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
             )}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 md:col-span-2">
            <IncomeExpenseChart />
        </div>
      </div>
    </div>
  );
}

    