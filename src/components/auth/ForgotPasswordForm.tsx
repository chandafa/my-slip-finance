
"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { sendPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await sendPasswordReset(data.email);
      setIsSent(true);
    } catch (error: any) {
      toast({
        title: "Gagal Mengirim Email",
        description: error.code === 'auth/user-not-found' 
            ? 'Tidak ada akun yang terdaftar dengan email ini.'
            : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('forgot_password_title')}</CardTitle>
          <CardDescription>
            {isSent 
                ? t('forgot_password_sent')
                : t('forgot_password_desc')
            }
          </CardDescription>
        </CardHeader>
        {!isSent && (
            <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">{t('auth_email_label')}</Label>
                <Input id="email" type="email" {...register("email")} placeholder="nama@contoh.com" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('forgot_password_button')}
                </Button>
            </form>
            </CardContent>
        )}
        <CardFooter className="justify-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              {t('forgot_password_back_to_login')}
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

    