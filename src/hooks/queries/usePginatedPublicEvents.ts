import { useQuery } from "@tanstack/react-query";
import { fetchPublicEvents, type EventFilters } from "../../business-logic";
import { GET_PUBLIC_EVENTS_KEY } from "./constants";

export const usePaginatedPublicEvents = (
  page: number,
  limit: number,
  filters: EventFilters = {}
) => {
  return useQuery({
    queryKey: [GET_PUBLIC_EVENTS_KEY, page, limit, filters],
    queryFn: () => fetchPublicEvents({ page, limit, filters }),
    staleTime: 1000 * 60 * 5,
  });
};
