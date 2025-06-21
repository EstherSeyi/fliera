import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Gift,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'accent';
  popular?: boolean;
  icon: React.ElementType;
}

interface CreditPack {
  id: string;
  credits: number;
  price: number;
  description: string;
  popular?: boolean;
}

const FAQ_ITEMS = [
  {
    question: "What happens when I run out of credits?",
    answer: "You can purchase additional credit packs anytime or upgrade to the Pro Plan for unlimited DP generation."
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer: "Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period."
  },
  {
    question: "Do credits expire?",
    answer: "No, credits never expire. You can use them whenever you need to create DPs or generate AI descriptions."
  },
  {
    question: "What's included in premium templates?",
    answer: "Premium templates include exclusive designs, advanced customization options, and professional layouts created by our design team."
  },
  {
    question: "Is there a refund policy?",
    answer: "We offer a 30-day money-back guarantee for Pro subscriptions. Credit packs are non-refundable once purchased."
  }
];

export const Pricing: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Check if user was redirected after login
  useEffect(() => {
    const fromLogin = searchParams.get('from') === 'login';
    if (fromLogin && isLoggedIn) {
      showToast("You're now logged in — completing your purchase…", 'success');
    }
  }, [isLoggedIn, searchParams, showToast]);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out EventDP',
      features: [
        '2 Events per month',
        '3-5 Display Pictures',
        'Access to basic templates only',
        'Standard support'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'secondary',
      icon: Gift
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$25',
      period: '/month',
      description: 'Best for active event organizers',
      features: [
        'Unlimited DP generation',
        'Up to 5 events per month',
        'AI-generated descriptions',
        'Access to all premium templates',
        'Template picker during creation',
        '30% discount on creator templates',
        'Template duplication & customization',
        'Branded DPs (no watermark)',
        'Priority support'
      ],
      buttonText: 'Subscribe Now',
      buttonVariant: 'primary',
      popular: true,
      icon: Crown
    }
  ];

  const creditPacks: CreditPack[] = [
    {
      id: 'pack-5',
      credits: 5,
      price: 1.50,
      description: 'Perfect for small events'
    },
    {
      id: 'pack-12',
      credits: 12,
      price: 3.00,
      description: 'Great value for regular use',
      popular: true
    },
    {
      id: 'pack-25',
      credits: 25,
      price: 5.00,
      description: 'Best for large events'
    }
  ];

  const handlePurchase = (planId: string, type: 'subscription' | 'credits') => {
    if (!isLoggedIn) {
      // Store the intended purchase and redirect to login
      const currentUrl = `/pricing?plan=${planId}&type=${type}`;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Simulate payment flow - in real app, this would integrate with Stripe
    showToast('Redirecting to payment...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (success) {
        navigate(`/payment-success?plan=${planId}&type=${type}`);
      } else {
        navigate(`/payment-failure?plan=${planId}&type=${type}`);
      }
    }, 2000);
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
          Choose Your Plan
        </h1>
        <p className="text-lg text-secondary max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include our core DP generation features.
        </p>
      </motion.div>

      {/* Subscription Plans */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Subscription Plans</h2>
          <p className="text-secondary">Choose the plan that fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary scale-105' 
                  : 'border-gray-200 hover:border-primary/30'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.popular ? 'bg-primary text-white' : 'bg-gray-100 text-primary'
                  }`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    {plan.period && <span className="text-secondary ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-secondary mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id !== 'free' && handlePurchase(plan.id, 'subscription')}
                  disabled={plan.id === 'free'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl'
                      : plan.buttonVariant === 'secondary'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-thistle text-primary hover:bg-thistle/90'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Credit Packs */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Credit Packs</h2>
          <p className="text-secondary">Pay as you go with flexible credit packs</p>
          <p className="text-sm text-gray-500 mt-2">
            Each credit = 1 DP, 1 AI event description, or 1 extra event
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                  <div className="bg-accent text-primary px-4 py-1 rounded-full text-xs font-semibold">
                    Best Value
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {pack.credits} Credits
                </h3>
                <div className="text-3xl font-bold text-primary mb-2">
                  ${pack.price.toFixed(2)}
                </div>
                <p className="text-secondary text-sm mb-6">{pack.description}</p>
                <p className="text-xs text-gray-500 mb-6">
                  ${(pack.price / pack.credits).toFixed(2)} per credit
                </p>

                <button
                  onClick={() => handlePurchase(pack.id, 'credits')}
                  className="w-full py-3 px-6 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Buy Now
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
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-secondary">
            Everything you need to know about our pricing
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
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to Create Amazing Event DPs?
        </h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join thousands of event organizers who trust EventDP for their display picture needs.
          Start with our free plan or choose the option that works best for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Free Now
          </button>
          <button
            onClick={() => handlePurchase('pro', 'subscription')}
            className="px-8 py-3 bg-thistle text-primary rounded-lg font-semibold hover:bg-thistle/90 transition-colors"
          >
            Start Pro Trial
          </button>
        </div>
      </motion.section>
    </div>
  );
};