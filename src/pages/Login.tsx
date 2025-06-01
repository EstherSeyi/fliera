import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">Welcome Back</h2>
        <form className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-secondary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-4 py-2 border border-primary/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-secondary">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-4 py-2 border border-primary/20 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-neutral py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-4 text-center text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary/80">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};