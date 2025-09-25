import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TranslationProvider } from '@/hooks/use-translation';
import InstallPWA from '@/components/pwa/InstallPWA';

export const metadata: Metadata = {
  title: 'MySlip Dashboard',
  description: 'Your personal finance dashboard.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MySlip',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={cn("font-body antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <TranslationProvider>
              {children}
              <InstallPWA />
            </TranslationProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
