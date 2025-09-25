
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TOUR_STORAGE_KEY = 'dashboard-tour-completed';

const tourSteps = [
    {
        title: "Selamat Datang di Dasbor Anda!",
        description: "Ini adalah pusat kendali keuangan Anda. Di sini, Anda bisa melihat ringkasan saldo Anda saat ini.",
        targetId: 'balance-card-tour',
        position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-[110%]',
    },
    {
        title: "Tambah Transaksi Baru",
        description: "Gunakan tombol ini untuk mencatat setiap pemasukan atau pengeluaran baru dengan cepat dan mudah.",
        targetId: 'add-transaction-tour',
        position: 'top-1/2 -translate-y-1/2 right-0 translate-x-[105%]',
    },
    {
        title: "Navigasi Utama",
        description: "Gunakan menu ini untuk menjelajahi fitur lain seperti laporan, tren keuangan, dan pengaturan.",
        targetId: 'mobile-nav-tour',
        position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-[110%]',
    }
];

export function DashboardTour() {
    const [step, setStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!hasCompletedTour) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (step < tourSteps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const currentStep = tourSteps[step];
    
    // We need to find the element and its position dynamically
    const targetElement = document.getElementById(currentStep.targetId);
    if (targetElement) {
       targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleFinish() }}>
            <DialogContent
                className="w-auto max-w-[350px] shadow-2xl transition-all duration-500"
                style={{
                    position: 'absolute',
                    top: targetElement ? `${targetElement.getBoundingClientRect().top + targetElement.clientHeight / 2}px` : '50%',
                    left: targetElement ? `${targetElement.getBoundingClientRect().left + targetElement.clientWidth / 2}px` : '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <DialogHeader>
                    <DialogTitle>{currentStep.title}</DialogTitle>
                    <DialogDescription>{currentStep.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-between w-full">
                    <div className="flex items-center gap-2">
                        {tourSteps.map((_, i) => (
                            <div key={i} className={cn("h-2 w-2 rounded-full", step === i ? 'bg-primary' : 'bg-muted')}/>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Kembali</Button>}
                        <Button onClick={handleNext}>
                            {step === tourSteps.length - 1 ? "Selesai" : "Lanjut"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
