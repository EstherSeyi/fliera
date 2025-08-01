import { useQuery } from "@tanstack/react-query";
import { EventFilters, PaginatedEventsResult } from "../../business-logic";
import { getUserEvents } from "../../business-logic/get-user-events";
import { GET_USER_EVENTS_KEY } from "./constants";

export const useUserEvents = (
  userId: string | undefined,
  page: number = 1,
  limit: number = 10,
  filters: EventFilters = {}
) => {
  return useQuery<PaginatedEventsResult, Error>({
    queryKey: [GET_USER_EVENTS_KEY, userId, page, limit, filters],
    queryFn: () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      return getUserEvents(userId, page, limit, filters);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
};
