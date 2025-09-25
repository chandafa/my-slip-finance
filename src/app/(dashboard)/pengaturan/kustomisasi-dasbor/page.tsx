
"use client"

import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CustomizeDashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { layout, moveCard, resetLayout } = useDashboardLayout();

    const cardNames: { [key: string]: string } = {
        BalanceCard: t('customize_dashboard_balance_card'),
        StatCards: t('customize_dashboard_stat_cards'),
        TransactionList: t('customize_dashboard_transaction_list'),
        IncomeExpenseChart: t('customize_dashboard_income_expense_chart'),
        CashFlowCalendar: t('customize_dashboard_cash_flow_calendar'),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{t('customize_dashboard_page_title')}</h1>
                    <p className="text-muted-foreground">{t('customize_dashboard_page_desc')}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Urutan Kartu Dasbor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {layout.map((card, index) => (
                            <div key={card} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="font-medium">{cardNames[card] || card}</span>
                                <div className="flex gap-1">
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => moveCard(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="h-5 w-5"/>
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => moveCard(index, 'down')}
                                        disabled={index === layout.length - 1}
                                    >
                                        <ArrowDown className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                    resetLayout();
                }}>
                    <RefreshCw className="mr-2"/> {t('customize_dashboard_reset_button')}
                </Button>
                 <Button onClick={() => router.push('/dashboard')}>
                    Selesai
                </Button>
            </div>
        </div>
    );
}
