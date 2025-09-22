
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { TransactionFormData } from '@/lib/types';

export async function addTransaction(data: TransactionFormData, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Pengguna tidak terautentikasi.');
  }

  try {
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

export async function updateTransaction(id: string, data: Partial<TransactionFormData>, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Pengguna tidak terautentikasi.');
  }
  try {
    const transactionRef = doc(db, 'transactions', id);
    // Note: We don't update the date when editing
    await updateDoc(transactionRef, data);
  } catch(e: any) {
    console.error('Error updating document: ', e);
    throw new Error('Terjadi kesalahan pada server saat memperbarui transaksi.');
  }
}

export async function deleteTransaction(id: string, userId: string): Promise<void> {
   if (!userId) {
    throw new Error('Pengguna tidak terautentikasi.');
  }
  try {
    const transactionRef = doc(db, 'transactions', id);
    await deleteDoc(transactionRef);
  } catch(e: any) {
    console.error('Error deleting document: ', e);
    throw new Error('Terjadi kesalahan pada server saat menghapus transaksi.');
  }
}
