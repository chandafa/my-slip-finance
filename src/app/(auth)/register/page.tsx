
import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar | MySlip",
    description: "Buat akun baru di MySlip.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
