
"use client"

import { useState, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { addTransaction, updateTransaction } from "@/lib/actions"
import type { Transaction, TransactionFormData } from "@/lib/types"
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
import { useTranslation } from "@/hooks/use-translation"

interface AddTransactionDialogProps {
  transactionToEdit?: Transaction | null;
  trigger?: React.ReactNode;
}

export function AddTransactionDialog({ transactionToEdit, trigger }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { t } = useTranslation()
  
  const isEditMode = !!transactionToEdit;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<TransactionFormData>({
      resolver: zodResolver(transactionFormSchema),
  });

  const currentType = watch("type", transactionToEdit?.type || "expense");

  useEffect(() => {
    if (open) {
      if (isEditMode) {
        reset({
          title: transactionToEdit.title,
          amount: transactionToEdit.amount,
          type: transactionToEdit.type,
          category: transactionToEdit.category,
          notes: transactionToEdit.notes || '',
        });
      } else {
        reset({
          type: "expense",
          title: "",
          amount: undefined,
          category: "",
          notes: ""
        });
      }
    }
  }, [open, isEditMode, transactionToEdit, reset]);

  const onSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    if (!user) {
       toast({
        title: "Gagal",
        description: "Anda harus login untuk melanjutkan.",
        variant: "destructive",
      })
      return;
    }

    try {
      if (isEditMode) {
        await updateTransaction(transactionToEdit.id, data, user.uid);
        toast({
          title: "Sukses",
          description: "Transaksi berhasil diperbarui!",
        });
      } else {
        await addTransaction(data, user.uid);
        toast({
          title: "Sukses",
          description: "Transaksi berhasil ditambahkan!",
        });
      }
      setOpen(false);
    } catch (error: any) {
       toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan pada server.",
        variant: "destructive",
      })
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <div id="add-transaction-tour" className="fixed bottom-24 right-4 z-20 md:bottom-6 md:right-6">
            <Button className="h-16 w-16 rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90">
              <Plus className="h-8 w-8" />
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('add_tx_dialog_edit_title') : t('add_tx_dialog_title')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('add_tx_dialog_edit_desc') : t('add_tx_dialog_desc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">{t('add_tx_dialog_title_label')}</Label>
              <Input id="title" {...register("title")} placeholder={t('add_tx_dialog_title_placeholder')} />
              {errors?.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="amount">{t('add_tx_dialog_amount_label')}</Label>
              <Input id="amount" type="number" {...register("amount")} placeholder={t('add_tx_dialog_amount_placeholder')} />
               {errors?.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <Label htmlFor="type">{t('add_tx_dialog_type_label')}</Label>
              <Select name="type" value={currentType} onValueChange={(value) => setValue("type", value as "income" | "expense")}>
                <SelectTrigger id="type">
                  <SelectValue placeholder={t('add_tx_dialog_type_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">{t('add_tx_dialog_type_expense')}</SelectItem>
                  <SelectItem value="income">{t('add_tx_dialog_type_income')}</SelectItem>
                </SelectContent>
              </Select>
               {errors?.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

             <div>
              <Label htmlFor="category">{t('add_tx_dialog_category_label')}</Label>
              <Select name="category" value={watch("category")} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t('add_tx_dialog_category_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makanan">{t('add_tx_dialog_category_food')}</SelectItem>
                  <SelectItem value="Transportasi">{t('add_tx_dialog_category_transport')}</SelectItem>
                  <SelectItem value="Gaji">{t('add_tx_dialog_category_salary')}</SelectItem>
                  <SelectItem value="Tempat Tinggal">{t('add_tx_dialog_category_housing')}</SelectItem>
                  <SelectItem value="Belanja">{t('add_tx_dialog_category_shopping')}</SelectItem>
                  <SelectItem value="Hadiah">{t('add_tx_dialog_category_gifts')}</SelectItem>
                  <SelectItem value="Lainnya">{t('add_tx_dialog_category_other')}</SelectItem>
                </SelectContent>
              </Select>
               {errors?.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes">{t('add_tx_dialog_notes_label')}</Label>
              <Textarea id="notes" {...register("notes")} placeholder={t('add_tx_dialog_notes_placeholder')} />
              {errors?.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
            </div>
          
            <DialogFooter className="pt-4">
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? t('add_tx_dialog_save_edit_button') : t('add_tx_dialog_save_button')}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

    