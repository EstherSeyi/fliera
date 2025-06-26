import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Star,
  Zap,
  Gift,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useStripeCredits } from '../hooks/useStripeCredits'; // Import the new hook

interface FreeTierPlan {
  id: string;
  name: string;
  description: string;
  features: Array<{
    text: string;
    included: boolean;
  }>;
  note: string;
  icon: React.ElementType;
}

interface CreditPack {
  id: string;
  credits: number;
  price: number;
  description: string;
  coverage: string;
  popular?: boolean;
}

const FAQ_ITEMS = [
  {
    question: "What happens after 3 free events?",
    answer: "You'll need 0.5 credit ($2.50) to create each new event."
  },
  {
    question: "What happens after 100 DPs?",
    answer: "DP generation starts using your credit balance automatically."
  },
  {
    question: "Do credits expire?",
    answer: "No — they stay in your account and can be used anytime."
  },
  {
    question: "How are credits automatically deducted?",
    answer: "Credits are automatically used once your free event or flyer limits are reached. You'll see a clear breakdown before any credits are used."
  },
  {
    question: "Can I see my credit balance?",
    answer: "Yes, your current credit balance is always visible in your dashboard, and you'll get notifications before credits are used."
  }
];

export const Pricing: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [clickedPackId, setClickedPackId] = useState<string | null>(null); // Track which button was clicked
  const { initiateCreditPurchase, isLoading: isPurchasing } = useStripeCredits(); // Use the new hook

  // Check if user was redirected after login
  useEffect(() => {
    const fromLogin = searchParams.get('from') === 'login';
    if (fromLogin && isLoggedIn) {
      showToast("You're now logged in — completing your purchase…", 'success');
    }
  }, [isLoggedIn, searchParams, showToast]);

  // Reset clickedPackId when purchase completes
  useEffect(() => {
    if (!isPurchasing) {
      setClickedPackId(null);
    }
  }, [isPurchasing]);

  const freeTierPlan: FreeTierPlan = {
    id: 'free',
    name: 'Start Free',
    description: 'Perfect for small events. Upgrade any time with credits to grow.',
    features: [
      { text: '3 free events', included: true },
      { text: '100 DP generations per event', included: true },
      { text: 'Basic templates', included: true },
      { text: 'Premium templates', included: false },
      { text: 'Extra events without credits', included: false },
      { text: 'Extra DPs without credits', included: false }
    ],
    note: 'Perfect for small events. Upgrade any time with credits to grow.',
    icon: Gift
  };

  const creditPacks: CreditPack[] = [
    {
      id: 'pack-1',
      credits: 1,
      price: 5.00,
      description: 'Perfect for trying credits',
      coverage: 'Up to 2 Events or 1,000 DPs'
    },
    {
      id: 'pack-2',
      credits: 2,
      price: 8.00,
      description: 'Great for small events',
      coverage: 'Up to 4 Events or 2,000 DPs'
    },
    {
      id: 'pack-5',
      credits: 5,
      price: 16.00,
      description: 'Most popular choice',
      coverage: 'Up to 10 Events or 5,000 DPs',
      popular: true
    },
    {
      id: 'pack-10',
      credits: 10,
      price: 35.00,
      description: 'Best value for large events',
      coverage: 'Up to 20 Events or 10,000 DPs'
    }
  ];

  const handlePurchase = async (packId: string, type: 'credits') => {
    if (!isLoggedIn) {
      // Store the intended purchase and redirect to login
      const currentUrl = `/pricing?plan=${packId}&type=${type}`;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Set which button was clicked before starting the purchase
    setClickedPackId(packId);
    
    // Use the new hook to initiate the purchase
    await initiateCreditPurchase(packId);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="space-y-16">
      {/* Header */}
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Simple, Fair Pricing
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Start free and only pay for what you need. No subscriptions, no surprises.
        </p>
      </motion.div>

      {/* Free Tier Section */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Start Free</h2>
          <p className="text-secondary">Get started with our generous free tier</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow-lg border-2 border-accent p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <freeTierPlan.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">{freeTierPlan.name}</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-4xl font-bold text-primary">$0</span>
                <span className="text-secondary ml-1">/forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {freeTierPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="bg-accent/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 italic">
                {freeTierPlan.note}
              </p>
            </div>

            <button
              onClick={() => navigate('/events')}
              className="w-full py-3 px-6 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Free Now
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Credit System Section */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Pay-as-You-Go with Credits</h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Buy credits and only use them when your free event limits run out.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
              <h3 className="text-xl font-semibold mb-2">Credit Pricing Breakdown</h3>
              <p className="text-white/90">
                Credits are automatically used once your free event or flyer limits are reached.
              </p>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-primary">Feature</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary">Credit Cost</th>
                      <th className="text-left py-3 px-4 font-semibold text-primary">USD Equivalent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-accent mr-2" />
                          <span className="font-medium">1 Credit</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">—</td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">$5.00</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-medium">1,000 DPs</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          1 Credit
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">$5.00</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Gift className="w-5 h-5 text-purple-500 mr-2" />
                          <span className="font-medium">1 Event (after 3 free)</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                          0.5 Credit
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-green-600">$2.50</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Credits are automatically used once your free event or flyer limits are reached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Credit Packs Section */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Buy Credits</h2>
          <p className="text-secondary">Choose the credit pack that fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {creditPacks.map((pack, index) => (
            <motion.div
              key={pack.id}
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl p-6 ${
                pack.popular
                  ? 'border-accent scale-105'
                  : 'border-gray-200 hover:border-accent/30'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -3 }}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-accent text-primary px-4 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Best Value
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {pack.credits} Credit{pack.credits > 1 ? 's' : ''}
                </h3>
                <div className="text-3xl font-bold text-primary mb-2">
                  ${pack.price.toFixed(2)}
                </div>
                <p className="text-secondary text-sm mb-4">{pack.description}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-600 font-medium mb-1">Coverage:</p>
                  <p className="text-sm text-primary font-semibold">{pack.coverage}</p>
                </div>

                <p className="text-xs text-gray-500 mb-6">
                  ${(pack.price / pack.credits).toFixed(2)} per credit
                </p>

                <button
                  onClick={() => handlePurchase(pack.id, 'credits')}
                  disabled={isPurchasing} // Disable all buttons while any purchase is in progress
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg ${
                    pack.popular
                      ? 'bg-accent text-primary hover:bg-accent/90'
                      : 'bg-primary text-white hover:bg-primary/90'
                  } ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Only show "Processing..." for the clicked button */}
                  {isPurchasing && clickedPackId === pack.id ? 'Processing...' : 'Buy Credits'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="space-y-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-secondary">
            Everything you need to know about our credit system
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <HelpCircle className="w-5 h-5 text-primary mr-3" />
                  <span className="font-semibold text-primary">{item.question}</span>
                </div>
                {expandedFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedFAQ === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-4"
                >
                  <p className="text-secondary leading-relaxed pl-8">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Bottom CTA */}
      <motion.section
        className="bg-primary text-white rounded-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to Create Amazing Event DPs?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Start with 3 free events and 100 DPs each. Only pay when you need more.
          No subscriptions, no commitments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Now
          </button>
          <button
            onClick={() => handlePurchase('pack-5', 'credits')}
            disabled={isPurchasing} // Disable button while purchasing
            className={`px-8 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors ${isPurchasing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {/* Only show "Processing..." for the clicked button */}
            {isPurchasing && clickedPackId === 'pack-5' ? 'Processing...' : 'Buy Credits'}
          </button>
        </div>
        <p className="text-sm text-white/70 mt-6">
          3 free events • 100 DPs per event • No credit card required
        </p>
      </motion.section>
    </div>
  );
};