
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirstTime: boolean | null;
  isPinEnabled: boolean;
  isPinLocked: boolean;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (email:string, password:string) => Promise<any>;
  loginWithEmail: (email:string, password:string) => Promise<any>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => void;
  enablePin: (enabled: boolean) => void;
  setPin: (pin: string) => void;
  unlockWithPin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  // PIN State
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Check if it's the user's first time
        const firstTime = localStorage.getItem('isFirstTime') === null;
        if (firstTime) {
          localStorage.setItem('isFirstTime', 'false');
          setIsFirstTime(true);
        } else {
           setIsFirstTime(false);
        }
        // PIN check
        const pinEnabled = localStorage.getItem(`pin_enabled_${user.uid}`) === 'true';
        setIsPinEnabled(pinEnabled);
        setIsPinLocked(pinEnabled); // Lock the app if PIN is enabled
      } else {
        // If no user, reset states
        localStorage.removeItem('isFirstTime');
        setIsFirstTime(null);
        setIsPinEnabled(false);
        setIsPinLocked(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Let the onAuthStateChanged handle redirection
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const registerWithEmail = async (email: string, password: string): Promise<any> => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const loginWithEmail = async (email: string, password: string): Promise<any> => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isFirstTime');
      // No need to manually redirect, onAuthStateChanged will trigger a re-render
    } catch (error) {
       console.error("Error signing out:", error);
    }
  };

  const markOnboardingComplete = () => {
    setIsFirstTime(false);
  }

  // --- PIN Methods ---
  const enablePin = (enabled: boolean) => {
    if (user) {
      localStorage.setItem(`pin_enabled_${user.uid}`, String(enabled));
      setIsPinEnabled(enabled);
      if (!enabled) {
        localStorage.removeItem(`pin_${user.uid}`); // Hapus PIN jika fitur dinonaktifkan
        setIsPinLocked(false);
      } else {
        setIsPinLocked(true); // Kunci aplikasi saat PIN diaktifkan
      }
    }
  };

  const setPin = (pin: string) => {
    if (user) {
      localStorage.setItem(`pin_${user.uid}`, pin);
      toast({ title: 'Sukses', description: 'PIN berhasil diatur.' });
    }
  };
  
  const unlockWithPin = (pin: string) => {
    if (user) {
      const storedPin = localStorage.getItem(`pin_${user.uid}`);
      if (pin === storedPin) {
        setIsPinLocked(false);
        return true;
      }
    }
    return false;
  };


  const value = {
    user,
    loading,
    isFirstTime,
    isPinEnabled,
    isPinLocked,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    markOnboardingComplete,
    enablePin,
    setPin,
    unlockWithPin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
