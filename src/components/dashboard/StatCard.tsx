import { Calendar, Image as ImageIcon, Users } from "lucide-react";
import { useDashboardStats } from "../../hooks/queries/useGetDashboardStats";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-secondary">{label}</p>
        {loading ? (
          <div className="h-8 mt-2 w-16 bg-gray-200 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-primary mt-2">
            {value.toLocaleString()}
          </p>
        )}
      </div>
      <Icon className="w-8 h-8 text-accent" />
    </div>
  </div>
);

export const StatCards = () => {
  const { user } = useAuth();
  const { data: stats, isPending, error } = useDashboardStats(user?.id);

  if (error)
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-md">
        {error.message || "Failed to load statistics"}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Total Events"
        value={stats?.totalEvents ?? 0}
        icon={Calendar}
        loading={isPending}
      />
      <StatCard
        label="Total Participants"
        value={stats?.totalParticipants ?? 0}
        icon={Users}
        loading={isPending}
      />
      <StatCard
        label="DPs Generated"
        value={stats?.totalDPs ?? 0}
        icon={ImageIcon}
        loading={isPending}
      />
    </div>
  );
};
