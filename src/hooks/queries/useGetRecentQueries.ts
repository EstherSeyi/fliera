import { useQuery } from "@tanstack/react-query";
import { getRecentEvents } from "../../business-logic";
import { GET_RECENT_EVENTS_KEY } from "./constants";

export const useRecentEvents = (userId: string | undefined) => {
  return useQuery({
    queryKey: [GET_RECENT_EVENTS_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getRecentEvents(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};
