
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Splash } from "@/components/auth/Splash";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // The redirection logic is now handled by the AuthProvider.
    // This page just shows a splash screen while the auth state is being determined.
    // If the user is not logged in after loading, AuthProvider will redirect to /login.
    if (!loading && !user) {
        router.push("/login");
    }
  }, [user, loading, router]);

  return <Splash />;
}
