
"use client"

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PinSettingsPage() {
    const { isPinEnabled, enablePin, setPin } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const handleTogglePin = (checked: boolean) => {
        if (checked) {
            // Jika mengaktifkan, buka dialog untuk set PIN
            setOpen(true);
        } else {
            // Jika menonaktifkan, langsung nonaktifkan
            enablePin(false);
            toast({
                title: "Kunci PIN Dinonaktifkan",
                description: "Aplikasi tidak akan lagi meminta PIN saat dibuka.",
            });
        }
    };

    const handleSetPin = () => {
        if (newPin.length !== 4) {
            toast({ title: "Gagal", description: "PIN harus terdiri dari 4 digit.", variant: "destructive" });
            return;
        }
        if (newPin !== confirmPin) {
            toast({ title: "Gagal", description: "PIN tidak cocok. Silakan coba lagi.", variant: "destructive" });
            return;
        }

        setPin(newPin);
        enablePin(true);
        setOpen(false);
        setNewPin("");
        setConfirmPin("");
    };
    
     const handlePinChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 4) {
            setter(value);
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold">Kunci Aplikasi (PIN)</h1>
            </div>

            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) { // Reset state on close
                    setNewPin("");
                    setConfirmPin("");
                }
            }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Pengaturan PIN</CardTitle>
                        <CardDescription>Amankan aplikasi Anda dengan PIN 4 digit. Anda akan diminta memasukkan PIN ini setiap kali membuka aplikasi.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg">
                            <Label htmlFor="pin-switch" className="text-base">Aktifkan Kunci PIN</Label>
                            <Switch
                                id="pin-switch"
                                checked={isPinEnabled}
                                onCheckedChange={handleTogglePin}
                            />
                        </div>
                    </CardContent>
                    {isPinEnabled && (
                        <CardFooter>
                            <DialogTrigger asChild>
                                <Button variant="outline">Ubah PIN</Button>
                            </DialogTrigger>
                        </CardFooter>
                    )}
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isPinEnabled ? "Ubah PIN Anda" : "Atur PIN Baru"}</DialogTitle>
                        <DialogDescription>Masukkan PIN 4 digit yang aman dan mudah Anda ingat.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-pin">PIN Baru (4 digit)</Label>
                            <Input
                                id="new-pin"
                                type="password"
                                value={newPin}
                                onChange={handlePinChange(setNewPin)}
                                maxLength={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-pin">Konfirmasi PIN Baru</Label>
                            <Input
                                id="confirm-pin"
                                type="password"
                                value={confirmPin}
                                onChange={handlePinChange(setConfirmPin)}
                                maxLength={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSetPin}>Simpan PIN</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
