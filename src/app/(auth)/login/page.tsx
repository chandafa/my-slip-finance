
import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | MySlip",
    description: "Masuk ke akun MySlip Anda.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
