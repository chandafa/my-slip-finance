
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Check if the app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the install prompt
    await installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, so clear it.
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleCloseClick = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-green-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Smartphone className="h-8 w-8" />
          <div>
            <h3 className="font-bold">{t('pwa_install_title')}</h3>
            <p className="text-sm">{t('pwa_install_desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleInstallClick} size="sm" className="bg-white text-green-600 hover:bg-white/90">
            {t('pwa_install_button')}
          </Button>
          <Button onClick={handleCloseClick} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
