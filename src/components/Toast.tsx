import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast, type Toast } from '../context/ToastContext';

const ToastIcon: React.FC<{ type: Toast['type'] }> = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-600" />;
    case 'info':
    default:
      return <Info {...iconProps} className="w-5 h-5 text-blue-600" />;
  }
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-center justify-between p-4 rounded-lg border shadow-lg max-w-md w-full
        ${getToastStyles(toast.type)}
      `}
    >
      <div className="flex items-center space-x-3">
        <ToastIcon type={toast.type} />
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};