
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const useStripeCredits = () => {
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCreditPurchase = async (packId: string) => {
    if (!isLoggedIn || !user) {
      showToast("You must be logged in to purchase credits.", "error");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            packId: packId,
            userId: user.id,
          },
        }
      );

      if (invokeError) {
        console.error("Error invoking create-checkout-session function:", invokeError);
        throw new Error(invokeError.message || "Failed to create checkout session.");
      }

      if (data && data.checkout_url) {
        window.location.href = data.checkout_url; // Redirect to Stripe Checkout
      } else {
        throw new Error("No checkout URL received from the server.");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "An unexpected error occurred.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateCreditPurchase,
    isLoading,
    error,
  };
};

