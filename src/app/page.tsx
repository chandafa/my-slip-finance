
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Splash } from "@/components/auth/Splash";

export default function RootPage() {
  const { user, loading, isFirstTime } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isFirstTime) {
        router.push("/onboarding");
      } else if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, isFirstTime, router]);

  return <Splash />;
}
