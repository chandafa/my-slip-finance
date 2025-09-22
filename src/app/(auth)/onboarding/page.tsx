
import { Onboarding } from "@/components/auth/Onboarding";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Selamat Datang di MySlip",
    description: "Mulai perjalanan finansial Anda bersama kami.",
};

export default function OnboardingPage() {
  return <Onboarding />;
}
