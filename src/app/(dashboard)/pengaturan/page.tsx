"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Palette, Globe, DollarSign, LogOut, User, Shield, Lock, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { t, setLanguage, language } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('settings_title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('account_security_title')}</CardTitle>
          <CardDescription>{t('account_security_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <Link href="/profil">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{t('edit_profile_link')}</span>
              </div>
            </div>
          </Link>
          <Link href="/profil">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>{t('security_password_link')}</span>
              </div>
            </div>
          </Link>
           <Link href="/pengaturan/pin">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>{t('app_lock_link')}</span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('help_title')}</CardTitle>
          <CardDescription>{t('help_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <Link href="/chatbot">
            <div className="flex items-center justify-between p-4 rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span>{t('chatbot_link')}</span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications_title')}</CardTitle>
          <CardDescription>{t('notifications_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <div className="flex items-center justify-between p-4 rounded-lg">
            <Label htmlFor="promo-notifications" className="flex items-center gap-4 cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span>{t('promo_notifications_label')}</span>
            </Label>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
            <Label htmlFor="transaction-notifications" className="flex items-center gap-4 cursor-pointer">
               <Bell className="h-5 w-5 text-muted-foreground" />
              <span>{t('transaction_notifications_label')}</span>
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearance_title')}</CardTitle>
          <CardDescription>{t('appearance_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y">
          <div className="flex items-center justify-between p-4 rounded-lg">
             <div className="flex items-center gap-4">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="theme-mode">{t('dark_mode_label')}</Label>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg">
             <div className="flex items-center gap-4">
               <Globe className="h-5 w-5 text-muted-foreground" />
               <Label htmlFor="language">{t('language_label')}</Label>
            </div>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'id' | 'en')}>
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
                <Label htmlFor="currency">{t('currency_label')}</Label>
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
          <CardTitle>{t('session_title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer">
            <div className="flex items-center gap-4">
              <LogOut className="h-5 w-5" />
              <span>{t('logout_button')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
