import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../../business-logic";
import { GET_DASHBOARD_STATS_KEY } from "./constants";

export const useDashboardStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: [GET_DASHBOARD_STATS_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return fetchDashboardStats(userId);
    },
    enabled: !!userId, // Prevents firing when userId is undefined
    staleTime: 1000 * 60 * 5, // optional: cache freshness
    retry: 1,
  });
};
