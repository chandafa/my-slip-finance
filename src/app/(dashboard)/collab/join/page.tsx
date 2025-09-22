
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import type { Wallet } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';

function JoinWalletContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const walletId = searchParams.get('id');
    const { toast } = useToast();

    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return; // Wait for auth state to be resolved

        if (!user) {
            // Redirect to login, but remember where to come back to
            const currentPath = `/collab/join?id=${walletId}`;
            localStorage.setItem('redirectAfterLogin', currentPath);
            router.push('/login');
            return;
        }

        if (!walletId) {
            setError("ID Dompet tidak valid atau tidak ditemukan.");
            setLoading(false);
            return;
        }

        const walletRef = doc(db, "wallets", walletId);
        getDoc(walletRef).then(docSnap => {
            if (docSnap.exists()) {
                const walletData = docSnap.data() as Wallet;
                if (walletData.memberIds.includes(user.uid)) {
                    // Already a member, redirect to the wallet page
                    toast({ title: "Anda sudah menjadi anggota", description: `Anda akan diarahkan ke dompet ${walletData.name}.` });
                    router.push(`/collab/${walletId}`);
                } else {
                    setWallet({ id: docSnap.id, ...walletData } as Wallet);
                }
            } else {
                setError("Dompet dengan ID ini tidak ditemukan.");
            }
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching wallet:", err);
            setError("Gagal mengambil data dompet.");
            setLoading(false);
        });

    }, [walletId, user, authLoading, router, toast]);

    const handleJoinWallet = async () => {
        if (!user || !wallet) return;

        setJoining(true);
        try {
            const walletRef = doc(db, "wallets", walletId!);
            const newMember = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0],
                photoURL: user.photoURL
            };

            await updateDoc(walletRef, {
                memberIds: arrayUnion(user.uid),
                members: arrayUnion(newMember)
            });

            toast({ title: "Selamat Bergabung!", description: `Anda berhasil bergabung dengan dompet ${wallet.name}.` });
            router.push(`/collab/${walletId}`);
        } catch (error) {
            console.error("Error joining wallet:", error);
            toast({ title: "Gagal Bergabung", description: "Terjadi kesalahan. Silakan coba lagi.", variant: "destructive" });
            setJoining(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">Memuat data...</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center text-destructive">{error}</div>;
    }
    
    if (!wallet) {
         return <div className="text-center text-muted-foreground">Tidak ada informasi dompet untuk ditampilkan.</div>;
    }
    
    const owner = wallet.members.find(m => m.uid === wallet.ownerId);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center">Gabung ke Dompet Kolaborasi</CardTitle>
                <CardDescription className="text-center">Anda diundang untuk bergabung dengan dompet berikut:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-muted/30">
                    <h3 className="text-2xl font-bold text-center">{wallet.name}</h3>
                </div>
                 <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Pemilik Dompet</p>
                     <div className="flex items-center justify-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={owner?.photoURL || `https://i.pravatar.cc/150?u=${owner?.uid}`} />
                            <AvatarFallback>{owner?.name ? owner.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{owner?.name || 'Tidak diketahui'}</p>
                            <p className="text-xs text-muted-foreground">{owner?.email}</p>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Total {wallet.members.length} Anggota</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleJoinWallet} disabled={joining}>
                    {joining && <Loader2 className="mr-2 animate-spin" />}
                    Gabung Sekarang
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function JoinPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Suspense fallback={<Loader2 className="animate-spin h-12 w-12" />}>
                <JoinWalletContent />
            </Suspense>
        </div>
    );
}


    