
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, arrayUnion } from 'firebase/firestore';
import type { Wallet } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export default function CollabPage() {
  const { user, isBalanceVisible } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [open, setOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const walletsQuery = query(
        collection(db, "wallets"),
        where("memberIds", "array-contains", user.uid)
      );

      const unsubscribe = onSnapshot(walletsQuery, (querySnapshot) => {
        const walletsData: Wallet[] = [];
        querySnapshot.forEach((doc) => {
          walletsData.push({ id: doc.id, ...doc.data() } as Wallet);
        });
        setWallets(walletsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching wallets:", error);
        toast({ title: "Gagal memuat dompet", description: "Terjadi kesalahan saat mengambil data.", variant: "destructive" });
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, toast]);

  const handleCreateWallet = async () => {
    if (!user || !newWalletName.trim()) {
      toast({ title: "Gagal", description: "Nama dompet tidak boleh kosong.", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "wallets"), {
        name: newWalletName,
        ownerId: user.uid,
        memberIds: [user.uid],
        members: [{ 
            uid: user.uid, 
            email: user.email, 
            name: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL 
        }],
        balance: 0,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Sukses", description: "Dompet kolaborasi berhasil dibuat." });
      setNewWalletName('');
      setOpen(false);
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({ title: "Gagal Membuat Dompet", description: "Terjadi kesalahan pada server.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('collab_page_title')}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2"/> {t('collab_create_button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('collab_dialog_title')}</DialogTitle>
              <DialogDescription>
                {t('collab_dialog_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">{t('collab_dialog_name_label')}</Label>
                <Input 
                  id="wallet-name" 
                  placeholder={t('collab_dialog_name_placeholder')}
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateWallet} disabled={creating}>
                {creating && <Loader2 className="animate-spin mr-2" />}
                {t('collab_dialog_create_button')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-primary"/>
        </div>
      ) : wallets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map(wallet => (
            <Link href={`/collab/${wallet.id}`} key={wallet.id} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
              <Card className="flex flex-col h-full hover:bg-card/80 transition-colors">
                <CardHeader>
                  <CardTitle>{wallet.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <Users className="h-4 w-4" /> {wallet.members.length} {t('collab_card_members')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-3xl font-bold">
                    {isBalanceVisible ? formatCurrency(wallet.balance) : 'Rp ••••••••'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">{t('collab_empty_state')}</p>
            <p className="text-muted-foreground">{t('collab_empty_state_hint')}</p>
        </div>
      )}
    </div>
  );
}
