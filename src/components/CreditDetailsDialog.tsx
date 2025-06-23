import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Zap, 
  Gift, 
  Calendar, 
  Image as ImageIcon,
  CreditCard,
  TrendingUp,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { UserCreditInfo } from '../types';

interface CreditDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  creditInfo: UserCreditInfo;
}

export const CreditDetailsDialog: React.FC<CreditDetailsDialogProps> = ({
  isOpen,
  onClose,
  creditInfo,
}) => {
  const {
    credits,
    is_premium_user,
    eventsCreated,
    totalDPsGenerated,
    freeEventsRemaining,
    freeDPsRemainingForCurrentEvents,
  } = creditInfo;

  const isOnFreeTier = !is_premium_user && credits === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span>Credit Balance & Usage</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Credit Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Balance</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{credits}</span>
                  <span className="text-white/80">credit{credits !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  ≈ ${(credits * 5).toFixed(2)} USD value
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Free Tier Status */}
          {isOnFreeTier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-accent/10 border border-accent/20 rounded-xl p-6"
            >
              <div className="flex items-start space-x-3">
                <Gift className="w-6 h-6 text-accent mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Free Tier Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Free Events</span>
                        <Calendar className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {freeEventsRemaining}
                        </span>
                        <span className="text-gray-500 text-sm">of 3 remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((3 - freeEventsRemaining) / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Free DPs</span>
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {freeDPsRemainingForCurrentEvents}
                        </span>
                        <span className="text-gray-500 text-sm">remaining</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        100 DPs per event
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Usage Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Usage Statistics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Events Created</span>
                  <span className="font-semibold text-primary">{eventsCreated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total DPs Generated</span>
                  <span className="font-semibold text-primary">{totalDPsGenerated}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className={`font-semibold ${is_premium_user ? 'text-accent' : 'text-primary'}`}>
                    {is_premium_user ? 'Premium' : 'Free Tier'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Credits Available</span>
                  <span className="font-semibold text-primary">{credits}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Credit Usage Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  How Credits Work
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• <strong>Events:</strong> After 3 free events, each new event costs 0.5 credits ($2.50)</p>
                  <p>• <strong>DPs:</strong> After 100 free DPs per event, each additional 1,000 DPs costs 1 credit ($5.00)</p>
                  <p>• <strong>Auto-deduction:</strong> Credits are automatically used when free limits are reached</p>
                  <p>• <strong>No expiry:</strong> Your credits never expire and can be used anytime</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/pricing"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              onClick={onClose}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Buy More Credits
            </Link>
            
            <Link
              to="/events"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-accent text-primary rounded-lg hover:bg-accent/90 transition-colors font-medium"
              onClick={onClose}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Browse Events
            </Link>
          </motion.div>

          {/* Low Credit Warning */}
          {credits < 1 && !isOnFreeTier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">
                  Low Credit Balance
                </p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Consider purchasing more credits to continue creating events and generating DPs without interruption.
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};