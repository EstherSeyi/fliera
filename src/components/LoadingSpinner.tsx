import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24,
  className = "text-primary"
}) => {
  return (
    <Loader2 
      className={`animate-spin ${className}`}
      size={size}
    />
  );
};