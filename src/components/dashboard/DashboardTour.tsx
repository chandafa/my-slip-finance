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
    },
    {
        title: "Tambah Transaksi Baru",
        description: "Gunakan tombol ini untuk mencatat setiap pemasukan atau pengeluaran baru dengan cepat dan mudah.",
        targetId: 'add-transaction-tour',
    },
    {
        title: "Navigasi Utama",
        description: "Gunakan menu ini untuk menjelajahi fitur lain seperti laporan, tren keuangan, dan pengaturan.",
        targetId: 'mobile-nav-tour',
    }
];

export function DashboardTour() {
    const [step, setStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!hasCompletedTour) {
            // Delay start to ensure DOM is ready
            setTimeout(() => setIsOpen(true), 500);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) {
            if (highlightedElement) {
                highlightedElement.classList.remove('tour-highlight');
            }
            return;
        }

        const currentStep = tourSteps[step];
        const targetElement = document.getElementById(currentStep.targetId);

        if (highlightedElement) {
            highlightedElement.classList.remove('tour-highlight');
        }

        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetElement.classList.add('tour-highlight');
            setHighlightedElement(targetElement);
        }

        // Cleanup on component unmount
        return () => {
            if (targetElement) {
                targetElement.classList.remove('tour-highlight');
            }
        };
    }, [isOpen, step, highlightedElement]);

    const handleNext = () => {
        if (step < tourSteps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    }

    const handleFinish = () => {
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
        setIsOpen(false);
        if (highlightedElement) {
            highlightedElement.classList.remove('tour-highlight');
        }
    };

    if (!isOpen) return null;

    const currentStep = tourSteps[step];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleFinish() }}>
            <DialogContent className="w-[90vw] max-w-[400px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle>{currentStep.title}</DialogTitle>
                    <DialogDescription>{currentStep.description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-between w-full pt-4">
                    <div className="flex items-center gap-2">
                        {tourSteps.map((_, i) => (
                            <div key={i} className={cn("h-2 w-2 rounded-full transition-all", step === i ? 'bg-primary w-4' : 'bg-muted')}/>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {step > 0 && <Button variant="ghost" onClick={handleBack}>Kembali</Button>}
                        <Button onClick={handleNext}>
                            {step === tourSteps.length - 1 ? "Selesai" : "Lanjut"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
