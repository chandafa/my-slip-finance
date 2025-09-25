
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

const PWA_PROMPT_DISMISSED_KEY = 'pwa-prompt-dismissed-timestamp';

const InstallPWA = () => {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      
      const lastDismissed = localStorage.getItem(PWA_PROMPT_DISMISSED_KEY);
      const oneDay = 24 * 60 * 60 * 1000;
      
      // If prompt was dismissed within the last 24 hours, do not show it.
      if (lastDismissed && (Date.now() - parseInt(lastDismissed, 10)) < oneDay) {
        return;
      }
      
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
    // Save the timestamp when the user dismisses the prompt
    localStorage.setItem(PWA_PROMPT_DISMISSED_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-primary text-primary-foreground rounded-lg p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Smartphone className="h-8 w-8" />
          <div>
            <h3 className="font-bold">{t('pwa_install_title')}</h3>
            <p className="text-sm opacity-90">{t('pwa_install_desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleInstallClick} size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            {t('pwa_install_button')}
          </Button>
          <Button onClick={handleCloseClick} variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
