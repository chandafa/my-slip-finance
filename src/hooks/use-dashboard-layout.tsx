
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth';

const DASHBOARD_LAYOUT_STORAGE_KEY = 'dashboard-layout';
const DEFAULT_LAYOUT = [
    'BalanceCard',
    'StatCards',
    'TransactionList',
    'IncomeExpenseChart',
    'CashFlowCalendar',
];

interface DashboardLayoutContextType {
  layout: string[];
  setLayout: React.Dispatch<React.SetStateAction<string[]>>;
  moveCard: (index: number, direction: 'up' | 'down') => void;
  resetLayout: () => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined);

export const DashboardLayoutProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [layout, setLayout] = useState<string[]>(DEFAULT_LAYOUT);

  const getStorageKey = () => user ? `${DASHBOARD_LAYOUT_STORAGE_KEY}-${user.uid}` : null;

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
        try {
            const storedLayout = localStorage.getItem(storageKey);
            if (storedLayout) {
                const parsedLayout = JSON.parse(storedLayout);
                // Simple validation to ensure it's an array of strings
                if (Array.isArray(parsedLayout) && parsedLayout.every(item => typeof item === 'string')) {
                     setLayout(parsedLayout);
                }
            }
        } catch (error) {
            console.error("Failed to parse dashboard layout from localStorage", error);
            setLayout(DEFAULT_LAYOUT);
        }
    }
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(layout));
    }
  }, [layout, user]);

  const moveCard = (index: number, direction: 'up' | 'down') => {
    setLayout(prevLayout => {
      const newLayout = [...prevLayout];
      const cardToMove = newLayout[index];
      
      if (direction === 'up' && index > 0) {
        newLayout.splice(index, 1);
        newLayout.splice(index - 1, 0, cardToMove);
      } else if (direction === 'down' && index < newLayout.length - 1) {
        newLayout.splice(index, 1);
        newLayout.splice(index + 1, 0, cardToMove);
      }

      return newLayout;
    });
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    const storageKey = getStorageKey();
    if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_LAYOUT));
    }
  };

  const value = {
    layout,
    setLayout,
    moveCard,
    resetLayout,
  };

  return (
    <DashboardLayoutContext.Provider value={value}>
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayout = (): DashboardLayoutContextType => {
  const context = useContext(DashboardLayoutContext);
  if (context === undefined) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider');
  }
  return context;
};
