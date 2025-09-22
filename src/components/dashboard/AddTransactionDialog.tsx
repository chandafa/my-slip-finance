"use client"

import { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { addTransaction } from "@/lib/actions"
import type { TransactionFormData } from "@/lib/types"
import { transactionFormSchema } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth"


export function AddTransactionDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<TransactionFormData>({
      resolver: zodResolver(transactionFormSchema),
      defaultValues: {
        type: "expense"
      }
  });

  const onSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    if (!user) {
       toast({
        title: "Gagal",
        description: "Anda harus login untuk menambahkan transaksi.",
        variant: "destructive",
      })
      return;
    }

    try {
      await addTransaction(data, user.uid);
      toast({
        title: "Sukses",
        description: "Transaksi berhasil ditambahkan!",
      });
      reset();
      setOpen(false);
    } catch (error: any) {
       toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat menambahkan transaksi.",
        variant: "destructive",
      })
    }
  }


  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-24 right-4 h-16 w-16 rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90 z-20 md:bottom-6 md:right-6">
          <Plus className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Isi detail transaksi baru Anda. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input id="title" {...register("title")} placeholder="cth. Makan Siang" />
              {errors?.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="amount">Jumlah</Label>
              <Input id="amount" type="number" {...register("amount")} placeholder="cth. 50000" />
               {errors?.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <Label htmlFor="type">Tipe</Label>
              <Select name="type" defaultValue="expense" onValueChange={(value) => setValue("type", value as "income" | "expense")}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih tipe transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
               {errors?.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

             <div>
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makanan">Makanan</SelectItem>
                  <SelectItem value="Transportasi">Transportasi</SelectItem>
                  <SelectItem value="Gaji">Gaji</SelectItem>
                  <SelectItem value="Tempat Tinggal">Tempat Tinggal</SelectItem>
                  <SelectItem value="Belanja">Belanja</SelectItem>
                  <SelectItem value="Hadiah">Hadiah</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
               {errors?.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Catatan tambahan (opsional)" />
              {errors?.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>
          
            <DialogFooter className="pt-4">
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Transaksi
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
