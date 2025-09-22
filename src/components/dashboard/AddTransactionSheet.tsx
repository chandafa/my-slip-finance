"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

const transactionFormSchema = z.object({
  title: z.string().min(2, { message: "Judul minimal 2 karakter." }),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, { message: "Pilih kategori." }),
  date: z.string(), // In a real app, you'd use a Calendar component here
  notes: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

export function AddTransactionSheet() {
  const [open, setOpen] = useState(false)
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  function onSubmit(data: TransactionFormValues) {
    // TODO: Implement server action to save transaction
    console.log(data)
    // Example: await addTransactionAction(data);
    alert("Transaksi disimulasikan! Cek konsol.")
    setOpen(false)
    form.reset()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-16 w-16 rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tambah Transaksi</SheetTitle>
          <SheetDescription>
            Isi detail transaksi baru Anda. Klik simpan jika sudah selesai.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="cth. Makan Siang" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="cth. 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="income">Pemasukan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="food">Makanan</SelectItem>
                      <SelectItem value="transport">Transportasi</SelectItem>
                      <SelectItem value="salary">Gaji</SelectItem>
                      <SelectItem value="housing">Tempat Tinggal</SelectItem>
                      <SelectItem value="groceries">Belanja</SelectItem>
                      <SelectItem value="gifts">Hadiah</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan tambahan (opsional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-4">
              <Button type="submit">Simpan Transaksi</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
