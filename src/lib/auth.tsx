"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth, db } from './firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirstTime: boolean | null;
  isPinEnabled: boolean;
  isPinLocked: boolean;
  isBalanceVisible: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  registerWithEmail: (email:string, password:string) => Promise<any>;
  loginWithEmail: (email:string, password:string) => Promise<any>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  markOnboardingComplete: () => void;
  enablePin: (enabled: boolean) => void;
  setPin: (pin: string) => void;
  unlockWithPin: (pin: string) => boolean;
  toggleBalanceVisibility: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create/update user data in Firestore
const updateUserInFirestore = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);

  // Only create/update if the document doesn't exist to avoid unnecessary writes
  if (!docSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0],
        photoURL: user.photoURL
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user in Firestore:", error);
    }
  }
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  // PIN State
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(true);
  
  // Balance Visibility State
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        updateUserInFirestore(user);
        
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath && redirectPath !== pathname) {
            localStorage.removeItem('redirectAfterLogin');
            router.push(redirectPath);
            setLoading(false);
            return;
        }

        const firstTime = localStorage.getItem('isFirstTime') === null;
        if (firstTime) {
          localStorage.setItem('isFirstTime', 'false');
          setIsFirstTime(true);
          router.push('/onboarding');
        } else {
           setIsFirstTime(false);
           if (pathname === '/login' || pathname === '/register' || pathname === '/') {
             router.push('/dashboard');
           }
        }

        // PIN check
        const pinEnabled = localStorage.getItem(`pin_enabled_${user.uid}`) === 'true';
        setIsPinEnabled(pinEnabled);
        setIsPinLocked(pinEnabled);
      } else {
        localStorage.removeItem('isFirstTime');
        setIsFirstTime(null);
        setIsPinEnabled(false);
        setIsPinLocked(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Let the onAuthStateChanged handle redirection
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      toast({ title: 'Gagal Login Google', description: error.message, variant: 'destructive'});
    }
  };

  const loginWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Let the onAuthStateChanged handle redirection
    } catch (error: any) {
      console.error("Error during GitHub sign-in:", error);
      toast({ title: 'Gagal Login GitHub', description: error.message, variant: 'destructive'});
    }
  };

  const registerWithEmail = async (email: string, password: string): Promise<any> => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     // Update profile to set a default displayName
     await updateProfile(userCredential.user, {
       displayName: email.split('@')[0]
     });
     // Manually update the user in our state and firestore
     const updatedUser = { ...userCredential.user, displayName: email.split('@')[0] };
     setUser(updatedUser as User);
     await updateUserInFirestore(updatedUser as User);
     return userCredential;
  }

  const loginWithEmail = async (email: string, password: string): Promise<any> => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const sendPasswordReset = async (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  }

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isFirstTime');
      router.push('/login');
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
  
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  }


  const value = {
    user,
    loading,
    isFirstTime,
    isPinEnabled,
    isPinLocked,
    isBalanceVisible,
    loginWithGoogle,
    loginWithGitHub,
    registerWithEmail,
    loginWithEmail,
    sendPasswordReset,
    logout,
    markOnboardingComplete,
    enablePin,
    setPin,
    unlockWithPin,
    toggleBalanceVisibility
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
