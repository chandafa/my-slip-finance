"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type TextSizeType = 'text-sm' | 'text-base' | 'text-lg';

interface AccessibilityContextType {
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  textSize: TextSizeType;
  setTextSize: (size: TextSizeType) => void;
  textToSpeech: boolean;
  setTextToSpeech: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [textSize, setTextSizeState] = useState<TextSizeType>('text-base');
  const [textToSpeech, setTextToSpeechState] = useState<boolean>(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    setHighContrastState(storedHighContrast);

    const storedTextSize = localStorage.getItem('accessibility-text-size') as TextSizeType;
    if (['text-sm', 'text-base', 'text-lg'].includes(storedTextSize)) {
      setTextSizeState(storedTextSize);
    }
    
    const storedTextToSpeech = localStorage.getItem('accessibility-tts') === 'true';
    setTextToSpeechState(storedTextToSpeech);
  }, []);

  // Apply high contrast class to body
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility-high-contrast', String(highContrast));
  }, [highContrast]);

  // Apply text size class to body
  useEffect(() => {
    document.body.classList.remove('text-sm', 'text-base', 'text-lg');
    document.body.classList.add(textSize);
    localStorage.setItem('accessibility-text-size', textSize);
  }, [textSize]);

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
  };

  const setTextSize = (size: TextSizeType) => {
    setTextSizeState(size);
  };
  
  const setTextToSpeech = (enabled: boolean) => {
    setTextToSpeechState(enabled);
    localStorage.setItem('accessibility-tts', String(enabled));
  }
  
  const value = {
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    textToSpeech,
    setTextToSpeech,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
