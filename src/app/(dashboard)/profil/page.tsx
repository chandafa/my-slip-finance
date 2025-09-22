
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://picsum.photos/seed/10/200/200" alt="User Avatar" data-ai-hint="person avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                <Camera className="h-5 w-5" />
                <span className="sr-only">Ubah Foto Profil</span>
              </Button>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Pengguna</h2>
              <p className="text-muted-foreground">pengguna@contoh.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>Perbarui informasi akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" defaultValue="Pengguna" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" defaultValue="pengguna@contoh.com" disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Simpan Perubahan</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Ubah kata sandi Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata Sandi Baru</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Ubah Kata Sandi</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
