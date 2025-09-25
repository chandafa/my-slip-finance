"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { aiSmartAlerts } from '@/ai/flows/ai-smart-alerts';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb } from 'lucide-react';

// This component will run in the background to check for and display smart alerts.
export function SmartAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lastChecked, setLastChecked] = useState<number>(0);

  useEffect(() => {
    const checkAlerts = async () => {
      // Throttle checks to once every 5 minutes
      if (!user || Date.now() - lastChecked < 5 * 60 * 1000) {
        return;
      }

      setLastChecked(Date.now());

      try {
        // 1. Fetch recent transactions
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(50) // Analyze the last 50 transactions
        );
        const querySnapshot = await getDocs(transactionsQuery);
        const transactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        
        if (transactions.length < 5) {
            // Not enough data for meaningful insights
            return;
        }

        // 2. Call the AI flow
        const { alert } = await aiSmartAlerts({
          transactionHistory: JSON.stringify(transactions),
        });

        // 3. Display the toast if an alert is returned
        if (alert) {
          toast({
            title: (
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400"/>
                    <span className="font-bold">Wawasan Cerdas</span>
                </div>
            ),
            description: alert,
            duration: 10000, // Show for 10 seconds
          });
        }
      } catch (error) {
        console.error("Failed to get smart alerts:", error);
        // We don't show an error toast to the user for this background task
      }
    };

    // Check on initial load and then set an interval
    checkAlerts();
    const intervalId = setInterval(checkAlerts, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(intervalId);
  }, [user, lastChecked, toast]);

  return null; // This component does not render anything
}
