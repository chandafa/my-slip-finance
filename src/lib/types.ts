
import type { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

export type TransactionCategory = {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
};

export type Transaction = {
  id: string;
  date: Timestamp | string; // Firestore returns Timestamp, but we might use string on client
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // Storing category name as string
  notes?: string;
  userId: string;
};

export type MonthlySummary = {
  month: string;
  income: number;
  expense: number;
};

export const transactionFormSchema = z.object({
  title: z.string().min(2, { message: "Judul minimal 2 karakter." }),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
  type: z.enum(["income", "expense"], { required_error: "Pilih tipe transaksi."}),
  category: z.string().min(1, { message: "Pilih kategori." }),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export type WalletMember = {
  uid: string;
  email: string | null;
  name: string | null;
}

export type Wallet = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  members: WalletMember[];
  balance: number;
  createdAt: Timestamp;
}

export type WalletTransaction = {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    authorId: string;
    authorName: string;
    createdAt: Timestamp;
}
