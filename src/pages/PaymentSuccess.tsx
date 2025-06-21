import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Crown, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PurchaseDetails {
  type: 'subscription' | 'credits';
  planName: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

export const PaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);

  useEffect(() => {
    const planId = searchParams.get('plan');
    const type = searchParams.get('type') as 'subscription' | 'credits';

    if (planId && type) {
      let details: PurchaseDetails;

      if (type === 'subscription') {
        if (planId === 'pro') {
          details = {
            type: 'subscription',
            planName: 'Pro Plan',
            description: 'Your Pro Plan is now active! Enjoy unlimited DP generation and premium features.',
            icon: Crown,
            color: 'text-purple-600'
          };
        } else {
          details = {
            type: 'subscription',
            planName: 'Unknown Plan',
            description: 'Your subscription is now active!',
            icon: CheckCircle,
            color: 'text-green-600'
          };
        }
      } else {
        // Credits
        const creditMap: Record<string, { credits: number; amount: string }> = {
          'pack-5': { credits: 5, amount: '$1.50' },
          'pack-12': { credits: 12, amount: '$3.00' },
          'pack-25': { credits: 25, amount: '$5.00' }
        };

        const pack = creditMap[planId];
        details = {
          type: 'credits',
          planName: `${pack?.credits || 0} Credits`,
          description: `You now have ${pack?.credits || 0} credits available in your account.`,
          icon: Zap,
          color: 'text-yellow-600'
        };
      }

      setPurchaseDetails(details);
    }
  }, [searchParams]);

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
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
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
            Thank you, <span className="font-semibold text-primary">
              {user?.user_metadata?.full_name || user?.email || 'valued customer'}
            </span>!
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
            <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center ${purchaseDetails.color}`}>
              <purchaseDetails.icon className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            {purchaseDetails.planName}
          </h2>
          <p className="text-secondary text-sm">
            {purchaseDetails.description}
          </p>
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