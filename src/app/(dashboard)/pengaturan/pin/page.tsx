
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
import { useTranslation } from "@/hooks/use-translation";

export default function PinSettingsPage() {
    const { isPinEnabled, enablePin, setPin } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const { t } = useTranslation();

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
                <h1 className="text-2xl font-bold">{t('pin_page_title')}</h1>
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
                        <CardTitle>{t('pin_settings_title')}</CardTitle>
                        <CardDescription>{t('pin_settings_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg">
                            <Label htmlFor="pin-switch" className="text-base">{t('pin_enable_switch')}</Label>
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
                                <Button variant="outline">{t('pin_change_button')}</Button>
                            </DialogTrigger>
                        </CardFooter>
                    )}
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isPinEnabled ? t('pin_dialog_change_title') : t('pin_dialog_set_title')}</DialogTitle>
                        <DialogDescription>{t('pin_dialog_desc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-pin">{t('pin_dialog_new_label')}</Label>
                            <Input
                                id="new-pin"
                                type="password"
                                value={newPin}
                                onChange={handlePinChange(setNewPin)}
                                maxLength={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-pin">{t('pin_dialog_confirm_label')}</Label>
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
                        <Button onClick={handleSetPin}>{t('pin_dialog_save_button')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    