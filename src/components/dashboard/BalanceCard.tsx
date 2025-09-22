import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Wallet } from "lucide-react"

type BalanceCardProps = {
  balance: number;
};

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="bg-card shadow-lg rounded-xl">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-card-foreground/10 rounded-lg">
           <Wallet className="w-6 h-6 text-card-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-card-foreground/80">Balance</p>
          <p className="text-3xl font-bold text-card-foreground">
            {formatCurrency(balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
