
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, query, orderBy, where, getDocs } from 'firebase/firestore';
import type { Wallet, WalletTransaction, TransactionFormData, WalletMember } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, ArrowLeft, Users, Mail, Link as LinkIcon, LogOut, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useTranslation } from '@/hooks/use-translation';

export default function WalletDetailPage() {
  const { user, isBalanceVisible, toggleBalanceVisibility } = useAuth();
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [txTitle, setTxTitle] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [addingTx, setAddingTx] = useState(false);

  useEffect(() => {
    if (!user || !walletId) return;

    const walletRef = doc(db, "wallets", walletId);
    
    // Check if user is a member first
    getDoc(walletRef).then(docSnap => {
      if (docSnap.exists()) {
        const walletData = docSnap.data() as Wallet;
        if (walletData.memberIds.includes(user.uid)) {
          setIsMember(true);
        } else {
          toast({ title: "Akses Ditolak", description: "Anda bukan anggota dompet ini.", variant: "destructive" });
          router.push('/collab');
        }
      } else {
        toast({ title: "Tidak Ditemukan", description: "Dompet ini tidak ada.", variant: "destructive" });
        router.push('/collab');
      }
    });

    const unsubscribeWallet = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        setWallet({ id: doc.id, ...doc.data() } as Wallet);
      }
      setLoading(false);
    });
    
    const transactionsQuery = query(
      collection(db, "wallets", walletId, "transactions"),
      orderBy("createdAt", "desc")
    );
    const unsubscribeTxs = onSnapshot(transactionsQuery, (snapshot) => {
      const txs: WalletTransaction[] = [];
      snapshot.forEach(doc => txs.push({ id: doc.id, ...doc.data() } as WalletTransaction));
      setTransactions(txs);
    });

    return () => {
      unsubscribeWallet();
      unsubscribeTxs();
    };

  }, [user, walletId, router, toast]);

  const isOwner = useMemo(() => user && wallet && wallet.ownerId === user.uid, [user, wallet]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Gagal", description: "Email tidak boleh kosong.", variant: "destructive" });
      return;
    }
    if (!wallet) return;

    setInviting(true);
    try {
      // 1. Find user by email in 'users' collection
      const usersQuery = query(collection(db, 'users'), where('email', '==', inviteEmail.trim()));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        toast({ title: "Gagal", description: "Pengguna dengan email tersebut tidak ditemukan.", variant: "destructive" });
        return;
      }
      
      const userToInviteDoc = querySnapshot.docs[0];
      
      // 2. Check if user is already a member
      if (wallet.memberIds.includes(userToInviteDoc.id)) {
        toast({ title: "Gagal", description: "Pengguna ini sudah menjadi anggota dompet.", variant: "default" });
        return;
      }

      // 3. Add user to the wallet
      const userToInvite = userToInviteDoc.data();
      const walletRef = doc(db, 'wallets', walletId);
      await updateDoc(walletRef, {
        memberIds: arrayUnion(userToInviteDoc.id),
        members: arrayUnion({
          uid: userToInviteDoc.id,
          email: userToInvite.email,
          name: userToInvite.displayName,
          photoURL: userToInvite.photoURL || '',
        })
      });

      toast({ title: "Sukses", description: `${userToInvite.displayName || userToInvite.email} telah ditambahkan ke dompet.` });
      setInviteEmail('');
      setIsInviteOpen(false);

    } catch (error) {
      console.error("Error inviting user:", error);
      toast({ title: "Gagal", description: "Terjadi kesalahan saat mengundang pengguna.", variant: "destructive" });
    } finally {
      setInviting(false);
    }
  };
  
  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/collab/join?id=${walletId}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        toast({ title: "Tautan Disalin", description: "Bagikan tautan ini untuk mengundang anggota baru." });
      })
      .catch(err => {
        console.error("Gagal menyalin tautan:", err);
        toast({ title: "Gagal Menyalin", description: "Gagal menyalin tautan ke clipboard.", variant: "destructive" });
      });
  };
  
  const handleAddTransaction = async () => {
    if (!txTitle || !txAmount) {
        toast({ title: "Gagal", description: "Judul dan Jumlah tidak boleh kosong.", variant: "destructive" });
        return;
    }
    setAddingTx(true);
    try {
        const amountNumber = parseFloat(txAmount);
        if (isNaN(amountNumber)) {
            toast({ title: "Gagal", description: "Jumlah harus berupa angka.", variant: "destructive" });
            return;
        }

        const newBalance = txType === 'income' ? wallet!.balance + amountNumber : wallet!.balance - amountNumber;

        const txCollectionRef = collection(db, "wallets", walletId, "transactions");
        await addDoc(txCollectionRef, {
            title: txTitle,
            amount: amountNumber,
            type: txType,
            authorId: user!.uid,
            authorName: user!.displayName || user!.email,
            createdAt: serverTimestamp(),
        });
        
        const walletRef = doc(db, "wallets", walletId);
        await updateDoc(walletRef, {
            balance: newBalance
        });

        toast({ title: "Sukses", description: "Transaksi berhasil ditambahkan." });
        setIsTxOpen(false);
        setTxTitle("");
        setTxAmount("");
        setTxType("expense");

    } catch (error) {
        console.error("Error adding transaction:", error);
        toast({ title: "Gagal", description: "Gagal menambahkan transaksi.", variant: "destructive" });
    } finally {
        setAddingTx(false);
    }
  };

  const handleLeaveWallet = async () => {
    if (!user || !wallet || isOwner) {
        toast({ title: "Gagal", description: "Pemilik tidak dapat meninggalkan dompet.", variant: "destructive" });
        return;
    }

    if (!confirm("Apakah Anda yakin ingin meninggalkan dompet ini?")) return;

    try {
        const walletRef = doc(db, "wallets", walletId);
        const memberToRemove = wallet.members.find(m => m.uid === user.uid);

        if (memberToRemove) {
          await updateDoc(walletRef, {
              memberIds: arrayRemove(user.uid),
              members: arrayRemove(memberToRemove)
          });
        }
        
        toast({ title: "Berhasil", description: "Anda telah meninggalkan dompet." });
        router.push('/collab');
    } catch (error) {
        console.error("Error leaving wallet: ", error);
        toast({ title: "Gagal", description: "Gagal meninggalkan dompet.", variant: "destructive" });
    }
  }


  if (loading || !isMember) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!wallet) {
    return <div className="text-center">Dompet tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">{wallet.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('collab_detail_balance')}</CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility}>
                  {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">
                  {isBalanceVisible ? formatCurrency(wallet.balance) : 'Rp ••••••••'}
                </p>
            </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('collab_detail_members')} ({wallet.members.length})</CardTitle>
                 {isOwner && (
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2"/> {t('collab_detail_invite_button')}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t('collab_detail_invite_dialog_title')}</DialogTitle>
                                <DialogDescription>{t('collab_detail_invite_dialog_desc')}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invite-email" className="flex items-center gap-2"><Mail/> {t('collab_detail_invite_email_label')}</Label>
                                    <div className="flex gap-2">
                                        <Input id="invite-email" type="email" placeholder="nama@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                                        <Button onClick={handleInvite} disabled={inviting}>
                                            {inviting && <Loader2 className="animate-spin mr-2" />}
                                            {t('collab_detail_invite_email_button')}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invite-link" className="flex items-center gap-2"><LinkIcon/> {t('collab_detail_invite_link_label')}</Label>
                                     <div className="flex gap-2">
                                        <Input readOnly value={`${window.location.origin}/collab/join?id=${walletId}`} />
                                        <Button onClick={handleCopyInviteLink}>{t('collab_detail_invite_copy_button')}</Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                 )}
            </CardHeader>
            <CardContent className="space-y-3">
                {wallet.members.map(member => (
                    <div key={member.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.photoURL || `https://i.pravatar.cc/150?u=${member.uid}`} />
                                <AvatarFallback>{member.name ? member.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                        </div>
                        {wallet.ownerId === member.uid && <span className="text-xs font-semibold text-primary">{t('collab_detail_owner_badge')}</span>}
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('collab_detail_tx_history')}</CardTitle>
                <Dialog open={isTxOpen} onOpenChange={setIsTxOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><Plus className="mr-2" /> {t('collab_detail_add_tx_button')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('collab_detail_add_tx_dialog_title')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input placeholder={t('collab_detail_add_tx_dialog_title_placeholder')} value={txTitle} onChange={e => setTxTitle(e.target.value)} />
                            <Input type="number" placeholder={t('collab_detail_add_tx_dialog_amount_placeholder')} value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                            <Select value={txType} onValueChange={(v) => setTxType(v as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('collab_detail_add_tx_dialog_type_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">{t('add_tx_dialog_type_expense')}</SelectItem>
                                    <SelectItem value="income">{t('add_tx_dialog_type_income')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTransaction} disabled={addingTx}>
                                {addingTx && <Loader2 className="animate-spin mr-2" />} {t('collab_detail_add_tx_dialog_save_button')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {transactions.length > 0 ? (
                    <div className="space-y-4">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", tx.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900')}>
                                        {tx.type === 'income' ? <ArrowUpRight className="text-green-600 dark:text-green-400" /> : <ArrowDownLeft className="text-red-600 dark:text-red-400" />}
                                    </div>
                                    <div>
                                        <p className="font-bold">{tx.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {t('collab_detail_tx_by')} {tx.authorName} {t('collab_detail_tx_at')} {tx.createdAt ? format(tx.createdAt.toDate(), 'd MMM yyyy, HH:mm', { locale: language === 'id' ? id : enUS }) : '...'}
                                        </p>
                                    </div>
                                </div>
                                <p className={cn("font-semibold whitespace-nowrap", tx.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">{t('collab_detail_tx_empty')}</p>
                )}
            </CardContent>
        </Card>

        {!isOwner && (
            <Card>
                <CardHeader>
                    <CardTitle>{t('collab_detail_actions_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLeaveWallet}>
                        <LogOut className="mr-2" /> {t('collab_detail_leave_button')}
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
