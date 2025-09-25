
"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Wallet, Eye, EyeOff } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/lib/auth";

type BalanceCardProps = {
  balance: number;
};

export function BalanceCard({ balance }: BalanceCardProps) {
  const { t } = useTranslation();
  const { isBalanceVisible, toggleBalanceVisibility } = useAuth();

  return (
    <Card className="bg-card shadow-lg rounded-xl">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-card-foreground/10 rounded-lg">
             <Wallet className="w-6 h-6 text-card-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground/80">{t('balance_card_title')}</p>
            <p className="text-3xl font-bold text-card-foreground">
              {isBalanceVisible ? formatCurrency(balance) : 'Rp ••••••••'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleBalanceVisibility}>
          {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </CardContent>
    </Card>
  )
}
