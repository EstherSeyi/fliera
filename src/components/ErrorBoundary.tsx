import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleRefresh = () => {
    // Clear the error state and reload the page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  private handleGoHome = () => {
    // Clear the error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  private handleGoBack = () => {
    // Clear the error state and go back
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral via-muted to-thistle/20 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="p-3 bg-white/20 rounded-full"
                >
                  <AlertTriangle className="w-8 h-8" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
                  <p className="text-white/90 mt-1">
                    We encountered an unexpected error
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-4"
              >
                <p className="text-secondary text-lg leading-relaxed">
                  Don't worry! This happens sometimes. Our team has been notified and we're working to fix it.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-primary mb-2 flex items-center">
                    <Bug className="w-4 h-4 mr-2" />
                    What you can try:
                  </h3>
                  <ul className="text-sm text-secondary space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Refresh the page to try again
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Go back to the previous page
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Return to the homepage and start fresh
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Clear your browser cache and cookies
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleRefresh}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:bg-primary/90 transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Page
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleGoBack}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-thistle text-primary rounded-lg font-semibold hover:bg-thistle/90 transition-all duration-200"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </motion.button>
              </motion.div>

              {/* Error Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <summary className="cursor-pointer font-semibold text-red-800 hover:text-red-900 transition-colors">
                    🔧 Developer Details (Click to expand)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <h4 className="font-semibold text-red-800 text-sm">Error Message:</h4>
                      <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <h4 className="font-semibold text-red-800 text-sm">Stack Trace:</h4>
                        <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="font-semibold text-red-800 text-sm">Component Stack:</h4>
                        <pre className="text-xs text-red-700 bg-red-100 p-2 rounded mt-1 overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.details>
              )}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 px-8 py-4 border-t border-gray-100"
            >
              <p className="text-center text-sm text-gray-600">
                If this problem persists, please contact our support team.
              </p>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}