"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { LogOut, User, Settings, Search } from "lucide-react"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/hooks/use-translation"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/hooks/use-search"
import { SearchResultList } from "./SearchResultList"

export function Header() {
  const { user, logout } = useAuth();
  const { t, language } = useTranslation();
  const { searchTerm, setSearchTerm } = useSearch();
  const [currentDate, setCurrentDate] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const updateDate = () => {
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      setCurrentDate(new Date().toLocaleString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }));
    };

    updateDate();
  }, [language]);
  
  // Reset search term when dialog is closed
  useEffect(() => {
    if (!isSearchOpen) {
      setSearchTerm('');
    }
  }, [isSearchOpen, setSearchTerm]);


  return (
    <header className="flex items-center justify-between gap-4 p-4 md:p-6 lg:p-8">
      <div className="flex-1">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('dashboard_title')}</h1>
         <p className="text-sm md:text-base text-muted-foreground">{currentDate}</p>
      </div>

       <div className="hidden sm:flex flex-1 max-w-md items-center gap-2">
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Cari transaksi..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

       <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                    <Search />
                    <span className="sr-only">Cari Transaksi</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md top-0 h-full max-h-screen translate-y-0 rounded-none flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Cari Transaksi</DialogTitle>
                </DialogHeader>
                 <div className="relative flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Ketik untuk mencari..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-grow overflow-auto -mx-6">
                    <SearchResultList 
                        searchTerm={searchTerm} 
                        onItemClick={() => setIsSearchOpen(false)}
                    />
                </div>
            </DialogContent>
          </Dialog>

         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/10/100/100"} alt="User Avatar" data-ai-hint="person avatar" />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName ?? 'Pengguna'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profil" passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t('header_profile')}</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/pengaturan" passHref>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('header_settings')}</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('header_logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
