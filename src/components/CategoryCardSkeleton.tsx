import { Link } from "react-router-dom";

interface CategoryCardSkeletonProps {
  href: string;
}

export const CategoryCardSkeleton: React.FC<CategoryCardSkeletonProps> = ({ href }) => {
  return (
    <Link to={href} className="group relative overflow-hidden rounded-xl bg-white shadow-lg block">
      <div className="aspect-video overflow-hidden bg-gray-200 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </Link>
  );
};