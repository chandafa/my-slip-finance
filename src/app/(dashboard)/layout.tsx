
"use client";

import { useAuth, AuthProvider } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/dashboard/Header"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { AddTransactionDialog } from "@/components/dashboard/AddTransactionDialog"
import { Splash } from "@/components/auth/Splash";
import { PinLockScreen } from "@/components/auth/PinLockScreen";
import { SmartAlerts } from "@/components/dashboard/SmartAlerts";
import { SearchProvider } from "@/hooks/use-search";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPinEnabled, isPinLocked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Splash />;
  }
  
  if (isPinEnabled && isPinLocked) {
    return <PinLockScreen />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8 pb-24">
        {children}
      </main>
      <SmartAlerts />
      <AddTransactionDialog />
      <MobileNav />
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SearchProvider>
        <ProtectedLayout>{children}</ProtectedLayout>
      </SearchProvider>
    </AuthProvider>
  )
}
