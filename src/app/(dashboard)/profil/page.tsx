
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('profile_page_title')}</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://picsum.photos/seed/10/200/200" alt={t('profile_avatar_alt')} data-ai-hint="person avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="absolute bottom-0 right-0 rounded-full bg-background">
                <Camera className="h-5 w-5" />
                <span className="sr-only">{t('profile_change_photo')}</span>
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
          <CardTitle>{t('profile_personal_info_title')}</CardTitle>
          <CardDescription>{t('profile_personal_info_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile_name_label')}</Label>
            <Input id="name" defaultValue="Pengguna" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile_email_label')}</Label>
            <Input id="email" type="email" defaultValue="pengguna@contoh.com" disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button>{t('profile_save_button')}</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile_security_title')}</CardTitle>
          <CardDescription>{t('profile_security_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('profile_current_password_label')}</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t('profile_new_password_label')}</Label>
            <Input id="new-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>{t('profile_change_password_button')}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    