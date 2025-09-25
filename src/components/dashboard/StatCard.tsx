
"use client";

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/lib/auth";

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  type: 'income' | 'expense';
};

export function StatCard({ title, value, icon, type }: StatCardProps) {
  const { t } = useTranslation();
  const { isBalanceVisible } = useAuth();
  const cardClass = type === 'income' ? "bg-income text-income-foreground" : "bg-expense text-expense-foreground";

  return (
    <Card className={cn("shadow-lg rounded-xl", cardClass)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg">
                {icon}
            </div>
            <p className="text-sm font-semibold">{title}</p>
        </div>
        <p className="text-2xl font-bold mt-2">
          {isBalanceVisible ? formatCurrency(value) : 'Rp ••••••••'}
        </p>
      </CardContent>
    </Card>
  )
}
