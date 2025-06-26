import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Download, Crown, Zap, CreditCard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUserCredits } from "../hooks/useUserCredits";

interface PurchaseDetails {
  type: "subscription" | "credits";
  planName: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export const PaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const { creditInfo, loading: loadingCredits, refetch } = useUserCredits();
  const [searchParams] = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] =
    useState<PurchaseDetails | null>(null);

  useEffect(() => {
    const planId = searchParams.get("plan");
    const type = searchParams.get("type") as "subscription" | "credits";

    if (planId && type) {
      let details: PurchaseDetails;

      if (type === "subscription") {
        if (planId === "pro") {
          details = {
            type: "subscription",
            planName: "Pro Plan",
            description:
              "Your Pro Plan is now active! Enjoy unlimited DP generation and premium features.",
            icon: Crown,
            color: "text-purple-600",
          };
        } else {
          details = {
            type: "subscription",
            planName: "Unknown Plan",
            description: "Your subscription is now active!",
            icon: CheckCircle,
            color: "text-green-600",
          };
        }
      } else {
        // Credits
        const creditMap: Record<string, { credits: number; amount: string }> = {
          "pack-1": { credits: 1, amount: "$5.00" },
          "pack-2": { credits: 2, amount: "$10.00" },
          "pack-5": { credits: 5, amount: "$25.00" },
          "pack-10": { credits: 10, amount: "$50.00" },
        };

        const pack = creditMap[planId];
        details = {
          type: "credits",
          planName: `${pack?.credits || 0} Credits`,
          description: `Your purchase was successful! Check your dashboard for your updated credit balance.`,
          icon: Zap,
          color: "text-yellow-600",
        };
      }

      setPurchaseDetails(details);
    }
  }, [searchParams]);

  // Refetch credit info when component mounts to get the latest balance
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (!purchaseDetails) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary">Loading purchase details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-primary">
            Payment Successful!
          </h1>
          <p className="text-secondary">
            Thank you,{" "}
            <span className="font-semibold text-primary">
              {user?.user_metadata?.full_name ||
                user?.email ||
                "valued customer"}
            </span>
            !
          </p>
        </motion.div>

        {/* Purchase Details */}
        <motion.div
          className="bg-gray-50 rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div
              className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${purchaseDetails.color}`}
            >
              <purchaseDetails.icon className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            {purchaseDetails.planName}
          </h2>
          <p className="text-secondary text-sm mb-4">
            {purchaseDetails.description}
          </p>

          {/* Current Credit Balance */}
          {purchaseDetails.type === "credits" && (
            <motion.div
              className="bg-primary/10 rounded-lg p-4 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">Current Balance</span>
              </div>
              {loadingCredits ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
              ) : (
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-2xl font-bold text-primary">
                    {creditInfo.credits}
                  </span>
                  <span className="text-primary/80 text-sm">
                    credit{creditInfo.credits !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1">
                ≈ ${(creditInfo.credits * 5).toFixed(2)} USD value
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          <Link
            to="/events"
            className="w-full flex items-center justify-center px-6 py-3 bg-thistle text-primary rounded-lg font-semibold hover:bg-thistle/90 transition-colors"
          >
            Start Creating DPs
            <Download className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gray-500">
            A confirmation email has been sent to your registered email address.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};