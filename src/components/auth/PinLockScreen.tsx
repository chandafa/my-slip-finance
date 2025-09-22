
"use client"

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PinLockScreen() {
    const [pin, setPin] = useState("");
    const { unlockWithPin } = useAuth();
    const { toast } = useToast();

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Hanya izinkan angka dan batasi hingga 4 digit
        if (/^\d*$/.test(value) && value.length <= 4) {
            setPin(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) {
            toast({
                title: "PIN Tidak Valid",
                description: "PIN harus terdiri dari 4 digit.",
                variant: "destructive",
            });
            return;
        }

        const success = unlockWithPin(pin);
        if (!success) {
            toast({
                title: "PIN Salah",
                description: "Silakan coba lagi.",
                variant: "destructive",
            });
            setPin(""); // Reset PIN input on failure
        }
        // On success, the layout will automatically re-render
    };


    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="text-center mb-8">
                 <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                 <h1 className="text-2xl font-bold">MySlip</h1>
                 <p className="text-muted-foreground">Aplikasi terkunci. Masukkan PIN Anda.</p>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Masukkan PIN</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center space-x-2">
                             <Input
                                id="pin-input"
                                type="password"
                                value={pin}
                                onChange={handlePinChange}
                                maxLength={4}
                                className="text-center text-2xl tracking-[1.5rem] w-48"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full mt-6">
                            <Lock className="mr-2" /> Buka Kunci
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
