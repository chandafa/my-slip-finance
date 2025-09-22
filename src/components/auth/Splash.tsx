
import { Wallet } from "lucide-react";

export function Splash() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
      <Wallet className="h-16 w-16 animate-pulse text-primary" />
      <h1 className="mt-4 text-2xl font-bold">MySlip</h1>
      <p className="text-muted-foreground">Mengelola keuangan jadi lebih mudah.</p>
    </div>
  );
}
