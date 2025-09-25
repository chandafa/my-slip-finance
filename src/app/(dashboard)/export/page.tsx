
"use client"

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { Transaction } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useTranslation } from "@/hooks/use-translation";


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


export default function ExportPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [fileType, setFileType] = useState("pdf");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Gagal Mengekspor",
        description: "Anda harus login untuk mengekspor data.",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange || !dateRange.from || !dateRange.to) {
       toast({
        title: "Gagal Mengekspor",
        description: `Silakan pilih rentang tanggal terlebih dahulu.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Ekspor Dimulai",
      description: `File ${fileType.toUpperCase()} Anda sedang disiapkan...`,
    });

    try {
      const transactions = await getTransactionsForRange(user.uid, dateRange);

      if (transactions.length === 0) {
        toast({
          title: "Tidak Ada Data",
          description: "Tidak ada transaksi ditemukan pada rentang tanggal yang dipilih.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      if (fileType === 'pdf') {
        generatePdf(transactions, dateRange);
      } else if (fileType === 'xlsx') {
        generateXlsx(transactions, dateRange);
      }

    } catch(error) {
      console.error("Export error:", error);
      toast({
        title: "Gagal Mengekspor",
        description: "Terjadi kesalahan saat menyiapkan file Anda.",
        variant: "destructive",
      });
    } finally {
       setLoading(false);
    }
  };

  const generatePdf = (transactions: Transaction[], range: DateRange) => {
    const doc = new jsPDF();
    const formattedDateRange = `${format(range.from!, 'dd/MM/yyyy')} - ${format(range.to!, 'dd/MM/yyyy')}`;

    // Add Title
    doc.setFontSize(18);
    doc.text("Laporan Transaksi Keuangan", 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${formattedDateRange}`, 14, 30);
    
    // Add Summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 14, 40);
    doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 14, 46);
    doc.text(`Hasil Bersih: ${formatCurrency(totalIncome - totalExpense)}`, 14, 52);


    // Add Table
    const tableData = transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yy'),
        t.title,
        t.category,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatCurrency(t.amount)
    ]);

    autoTable(doc, {
      startY: 60,
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

    // Auto-fit columns
    const cols = Object.keys(dataToExport[0]);
    const colWidths = cols.map(col => ({
        wch: Math.max(...dataToExport.map(row => (row[col as keyof typeof row] ?? '').toString().length), col.length) + 2
    }));
    worksheet["!cols"] = colWidths;


    XLSX.writeFile(workbook, `Laporan_MySlip_${formattedDateRange}.xlsx`);
  }

  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold">{t('export_page_title')}</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('export_card_title')}</CardTitle>
          <CardDescription>
            {t('export_card_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>{t('export_format_label')}</Label>
            <RadioGroup defaultValue="pdf" value={fileType} onValueChange={setFileType} className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx">Excel (XLSX)</Label>
              </div>
               {/* CSV option can be added back if needed */}
            </RadioGroup>
          </div>
          <div className="space-y-4">
            <Label>{t('export_date_range_label')}</Label>
            <DateRangePicker onDateChange={setDateRange} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleExport} className="w-full sm:w-auto" disabled={loading}>
            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
            {t('export_button')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    