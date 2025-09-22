import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction, TransactionFormData } from '@/lib/types';

export async function addTransaction(data: TransactionFormData, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Pengguna tidak terautentikasi.');
  }

  try {
    // Pastikan `userId` disertakan dalam objek yang akan disimpan
    const transactionData = {
      ...data,
      userId: userId,
      date: Timestamp.now(),
      notes: data.notes || '',
    };

    await addDoc(collection(db, 'transactions'), transactionData);

  } catch (e: any) {
    console.error('Error adding document: ', e);
    throw new Error('Terjadi kesalahan pada server saat menambahkan transaksi.');
  }
}
