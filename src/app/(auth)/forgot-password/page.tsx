
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lupa Kata Sandi | MySlip",
    description: "Atur ulang kata sandi akun MySlip Anda.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
