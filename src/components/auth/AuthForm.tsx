
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
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";


const loginSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok.",
  path: ["confirmPassword"],
});


type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { loginWithGoogle, loginWithGitHub, loginWithEmail, registerWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const schema = mode === "login" ? loginSchema : registerSchema;
  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(data.email, data.password);
      } else {
        await registerWithEmail(data.email, data.password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: `Gagal ${mode === 'login' ? 'Masuk' : 'Daftar'}`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // On successful login, the AuthProvider will handle redirection
    } catch (error: any) {
      toast({
        title: "Gagal Masuk dengan Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    try {
      await loginWithGitHub();
      // On successful login, the AuthProvider will handle redirection
    } catch (error: any) {
      toast({
        title: "Gagal Masuk dengan GitHub",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Masuk ke akun Anda untuk melanjutkan." : "Isi form di bawah untuk mendaftar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="nama@contoh.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
                {mode === "login" && (
                    <Link href="/forgot-password" passHref>
                        <span className="text-sm text-primary hover:underline cursor-pointer">
                            Lupa kata sandi?
                        </span>
                    </Link>
                )}
               </div>
              <Input id="password" type="password" {...register("password")} placeholder="******" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
             {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="******"/>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>
          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">ATAU</span>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isGitHubLoading}>
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
              Lanjutkan dengan Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGitHubSignIn} disabled={isGitHubLoading || isGoogleLoading}>
              {isGitHubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FaGithub className="mr-2 h-5 w-5" />}
              Lanjutkan dengan GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <Link href={mode === "login" ? "/register" : "/login"} className="text-primary hover:underline">
              {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
