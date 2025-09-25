
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Home, BarChart2, TrendingUp, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/laporan", icon: BarChart2, label: "Laporan" },
  { href: "/tren", icon: TrendingUp, label: "Tren" },
  { href: "/collab", icon: Wallet, label: "Kolaborasi"},
  { href: "/pengaturan", icon: Settings, label: "Pengaturan" },
];

export function MobileNav() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    let foundIndex = navItems.findIndex(item => pathname.startsWith(item.href));
    
    // Special case for root, as / matches everything
    if (pathname === '/') {
        foundIndex = navItems.findIndex(item => item.href === '/dashboard');
    } else {
        // Find the best match
        let bestMatchLength = 0;
        navItems.forEach((item, index) => {
            if (pathname.startsWith(item.href) && item.href.length > bestMatchLength) {
                bestMatchLength = item.href.length;
                foundIndex = index;
            }
        });
    }

    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    } else {
      // Default to home if no match, e.g. for /profil
      const homeIndex = navItems.findIndex(item => item.href === '/dashboard');
      if (homeIndex !== -1) {
          setActiveIndex(homeIndex);
      }
    }
  }, [pathname]);

  return (
    <div id="mobile-nav-tour" className="fixed bottom-0 left-0 right-0 z-10 p-4 md:hidden">
      <div 
        ref={containerRef}
        className="relative flex h-16 items-center justify-around rounded-full bg-card shadow-lg"
      >
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <Link 
              href={item.href} 
              key={item.href}
              className="z-10 flex h-full flex-1 items-center justify-center"
              aria-label={item.label}
              onClick={() => setActiveIndex(index)}
            >
              <item.icon 
                className={cn(
                  "h-7 w-7 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground",
                  "hover:text-primary"
                )} 
              />
            </Link>
          );
        })}
        <div 
          className="absolute left-0 top-0 h-full rounded-full bg-primary/10 transition-all duration-300 ease-out"
          style={{
            width: `${100 / navItems.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
