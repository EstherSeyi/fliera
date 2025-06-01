import { LoadingSpinner } from './LoadingSpinner';

export const PageSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral/80 backdrop-blur-sm">
      <LoadingSpinner size={32} />
    </div>
  );
};