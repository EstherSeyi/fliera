import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, Mail } from 'lucide-react';

export const PaymentFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState<{ planId: string; type: string } | null>(null);

  useEffect(() => {
    const planId = searchParams.get('plan');
    const type = searchParams.get('type');
    
    if (planId && type) {
      setPlanDetails({ planId, type });
    }
  }, [searchParams]);

  const handleTryAgain = () => {
    if (planDetails) {
      navigate(`/pricing?plan=${planDetails.planId}&type=${planDetails.type}`);
    } else {
      navigate('/pricing');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Icon */}
        <motion.div
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
        >
          <XCircle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-primary">
            Payment Failed
          </h1>
          <p className="text-secondary">
            Oops! Your payment didn't go through. Don't worry, this happens sometimes.
          </p>
        </motion.div>

        {/* Common Reasons */}
        <motion.div
          className="bg-gray-50 rounded-lg p-6 mb-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-primary mb-3 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Common reasons for payment failure:
          </h3>
          <ul className="text-sm text-secondary space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Insufficient funds in your account
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Card details entered incorrectly
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Bank security restrictions
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Temporary network issues
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleTryAgain}
            className="w-full flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          
          <Link
            to="/pricing"
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Pricing
          </Link>
        </motion.div>

        {/* Support Info */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-secondary mb-3">
            Still having trouble? We're here to help!
          </p>
          <a
            href="mailto:support@eventdp.com"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};