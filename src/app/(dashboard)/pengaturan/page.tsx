"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Palette, Globe, DollarSign, LogOut, User, Shield, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Akun & Keamanan</CardTitle>
          <CardDescription>Kelola informasi akun dan preferensi keamanan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <Link href="/profil">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Edit Profil</span>
              </div>
            </div>
          </Link>
          <Link href="/profil">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Keamanan & Kata Sandi</span>
              </div>
            </div>
          </Link>
           <Link href="/pengaturan/pin">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>Kunci Aplikasi (PIN)</span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
          <CardDescription>Atur preferensi notifikasi Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <div className="flex items-center justify-between p-4 rounded-lg">
            <Label htmlFor="promo-notifications" className="flex items-center gap-4 cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span>Notifikasi Promo</span>
            </Label>
            <Switch id="promo-notifications" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
            <Label htmlFor="transaction-notifications" className="flex items-center gap-4 cursor-pointer">
               <Bell className="h-5 w-5 text-muted-foreground" />
              <span>Notifikasi Transaksi</span>
            </Label>
            <Switch id="transaction-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <div className="flex items-center justify-between p-4 rounded-lg">
             <div className="flex items-center gap-4">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="theme-mode">Mode Gelap</Label>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
             <div className="flex items-center gap-4">
               <Globe className="h-5 w-5 text-muted-foreground" />
               <Label htmlFor="language">Bahasa</Label>
            </div>
            <Select defaultValue="id">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
            <div className="flex items-center gap-4">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="currency">Mata Uang</Label>
            </div>
            <Select defaultValue="idr">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Mata Uang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idr">IDR (Rupiah)</SelectItem>
                <SelectItem value="usd">USD (Dolar AS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Sesi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer">
            <div className="flex items-center gap-4">
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
