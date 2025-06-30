import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useUserCredits } from "./useUserCredits";

export const useCreditSystem = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { refetch: refetchCredits } = useUserCredits();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a unique request ID for idempotent operations
   */
  const generateRequestId = (type: "event" | "dp", eventId?: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const userId = user?.id || "anonymous";
    const eventPart = eventId ? `-${eventId}` : "";

    return `${type}-${userId}${eventPart}-${timestamp}-${random}`;
  };

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
        message: "You must be logged in to create events",
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate a unique request ID for idempotency
      const requestId = generateRequestId("event");

      const { data, error: functionError } = await supabase.functions.invoke(
        "deduct-event-credit",
        {
          body: {
            userId: user.id,
            requestId,
          },
        }
      );

      if (functionError) {
        console.error("Supabase function error:", functionError);
        throw new Error(
          functionError.message || "Failed to process event credits"
        );
      }

      if (!data) {
        throw new Error("No response data from credit function");
      }

      // Check if the response indicates an error
      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh user credits after successful deduction
      await refetchCredits();

      if (data.credits_deducted > 0) {
        showToast(
          `${data.credits_deducted} credits used for event creation. ${data.remaining_credits} credits remaining.`,
          "info"
        );
      } else {
        showToast(
          `Free event used. ${data.remaining_free_events} free events remaining.`,
          "info"
        );
      }

      return { success: true };
    } catch (err: any) {
      console.error("Error in event credit check:", err);

      // Check if this is an insufficient credits error (status 402)
      if (err.message?.includes("Insufficient credits")) {
        const requiredCredits = 0.5; // Standard event cost
        return {
          success: false,
          message: `You need ${requiredCredits} credits to create this event.`,
          insufficientCredits: true,
          requiredCredits,
        };
      }

      // Handle network/connection errors
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("fetch")
      ) {
        const errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const errorMessage = err.message || "Failed to process event credits";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
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
  const checkAndDeductDPCredits = async (
    eventId: string
  ): Promise<{
    success: boolean;
    message?: string;
    insufficientCredits?: boolean;
    requiredCredits?: number;
  }> => {
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to generate DPs",
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Generate a unique request ID for idempotency
      const requestId = generateRequestId("dp", eventId);

      const { data, error: functionError } = await supabase.functions.invoke(
        "deduct-dp-credit",
        {
          body: {
            userId: user.id,
            eventId,
            requestId,
          },
        }
      );

      if (functionError) {
        console.error("Supabase function error:", functionError);
        throw new Error(
          functionError.message || "Failed to process DP credits"
        );
      }

      if (!data) {
        throw new Error("No response data from credit function");
      }

      // Check if the response indicates an error
      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh user credits after successful deduction
      await refetchCredits();

      // if (data.credits_deducted > 0) {
      //   showToast(`${data.credits_deducted} credits used for DP generation. ${data.remaining_credits} credits remaining.`, 'info');
      // } else {
      //   showToast(`Free DP used. ${data.remaining_free_dps} free DPs remaining for this event.`, 'info');
      // }

      return { success: true };
    } catch (err: any) {
      console.error("Error in DP credit check:", err);

      // Check if this is an insufficient credits error
      if (err.message?.includes("Insufficient credits")) {
        const requiredCredits = 0.001; // Standard DP cost (1/1000 of a credit)
        return {
          success: false,
          message: `You need more credits to generate this DP.`,
          insufficientCredits: true,
          requiredCredits,
        };
      }

      // Handle network/connection errors
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("fetch")
      ) {
        const errorMessage =
          "Unable to connect to the server. Please check your internet connection and try again.";
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }

      const errorMessage = err.message || "Failed to process DP credits";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkAndDeductEventCredits,
    checkAndDeductDPCredits,
    isProcessing,
    error,
  };
};
