import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useUserCredits } from './useUserCredits';

export const useCreditSystem = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refetch: refetchCredits } = useUserCredits();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check and deduct credits for event creation
   * @returns Object with success status and any error message
   */
  const checkAndDeductEventCredits = async (): Promise<{
    success: boolean;
    message?: string;
    insufficientCredits?: boolean;
    requiredCredits?: number;
  }> => {
    if (!user) {
      return { 
        success: false, 
        message: 'You must be logged in to create events' 
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('deduct-event-credit', {
        body: { userId: user.id }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process event credits');
      }

      // Refresh user credits after successful deduction
      await refetchCredits();

      if (data.credits_deducted > 0) {
        showToast(`${data.credits_deducted} credits used for event creation. ${data.remaining_credits} credits remaining.`, 'info');
      } else {
        showToast(`Free event used. ${data.remaining_free_events} free events remaining.`, 'info');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error in event credit check:', err);
      
      // Check if this is an insufficient credits error (status 402)
      if (err.message?.includes('Insufficient credits')) {
        const requiredCredits = 0.5; // Standard event cost
        return { 
          success: false, 
          message: `You need ${requiredCredits} credits to create this event.`,
          insufficientCredits: true,
          requiredCredits
        };
      }
      
      setError(err.message || 'Failed to process event credits');
      return { 
        success: false, 
        message: err.message || 'Failed to process event credits' 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Check and deduct credits for DP generation
   * @param eventId The ID of the event for which the DP is being generated
   * @returns Object with success status and any error message
   */
  const checkAndDeductDPCredits = async (eventId: string): Promise<{
    success: boolean;
    message?: string;
    insufficientCredits?: boolean;
    requiredCredits?: number;
  }> => {
    if (!user) {
      return { 
        success: false, 
        message: 'You must be logged in to generate DPs' 
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('deduct-dp-credit', {
        body: { 
          userId: user.id,
          eventId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to process DP credits');
      }

      // Refresh user credits after successful deduction
      await refetchCredits();

      if (data.credits_deducted > 0) {
        showToast(`${data.credits_deducted} credits used for DP generation. ${data.remaining_credits} credits remaining.`, 'info');
      } else {
        showToast(`Free DP used. ${data.remaining_free_dps} free DPs remaining for this event.`, 'info');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error in DP credit check:', err);
      
      // Check if this is an insufficient credits error
      if (err.message?.includes('Insufficient credits')) {
        const requiredCredits = 0.001; // Standard DP cost (1/1000 of a credit)
        return { 
          success: false, 
          message: `You need more credits to generate this DP.`,
          insufficientCredits: true,
          requiredCredits
        };
      }
      
      setError(err.message || 'Failed to process DP credits');
      return { 
        success: false, 
        message: err.message || 'Failed to process DP credits' 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkAndDeductEventCredits,
    checkAndDeductDPCredits,
    isProcessing,
    error
  };
};