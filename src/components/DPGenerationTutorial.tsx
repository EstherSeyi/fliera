import React from 'react';
import { motion } from 'framer-motion';
import { Search, Upload, Edit3, Download } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Browse Events',
    description: 'Discover exciting events and choose the one you want to create a DP for',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    icon: Upload,
    title: 'Upload Your Photo',
    description: 'Upload your favorite photo and crop it to perfection with our built-in editor',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    icon: Edit3,
    title: 'Customize Your Text',
    description: 'Input personalized text like your name, event details, or custom messages with various styling options',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 4,
    icon: Download,
    title: 'Download & Share',
    description: 'Get your personalized DP instantly and share it across all your social platforms',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export const DPGenerationTutorial: React.FC = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Create your personalized event display picture in just four simple steps
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                whileHover={{ y: -5 }}
              >
                {/* Icon Circle */}
                <motion.div
                  className={`w-16 h-16 mx-auto mb-6 rounded-full ${step.bgColor} flex items-center justify-center shadow-lg relative`}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <step.icon className={`w-8 h-8 ${step.color}`} strokeWidth={2} />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {step.id}
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-primary">
                    {step.title}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                ease: "easeOut"
              }}
            >
              <div className="flex items-start space-x-4">
                {/* Icon Circle */}
                <motion.div
                  className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center shadow-lg relative flex-shrink-0`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <step.icon className={`w-6 h-6 ${step.color}`} strokeWidth={2} />
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                    {step.id}
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  className="flex-1 pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>

              {/* Connecting Line for Mobile */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 -bottom-3 w-1 h-12 bg-gray-300 rounded-full" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.a
            href="/events"
            className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Now
            <motion.div
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              →
            </motion.div>
          </motion.a>
          <p className="text-sm text-secondary mt-3">
            No registration required • Free to use • Instant download
          </p>
        </motion.div>
      </div>
    </section>
  );
};