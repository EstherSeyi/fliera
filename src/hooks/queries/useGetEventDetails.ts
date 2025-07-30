import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { useEvents } from "../../context/EventContext";
import type { Event } from "../../types";
import { GET_EVENT_DETAILS_KEY } from "./constants";

interface UseGetEventDetailsReturn {
  event: Event | undefined;
  isLoading: boolean;
  error: { message: string } | null;
  userTextInputs: string[];
  setUserTextInputs: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useGetEventDetails = (
  id: string | undefined
): UseGetEventDetailsReturn => {
  const { getEvent } = useEvents();
  const [userTextInputs, setUserTextInputs] = useState<string[]>([]);

  const {
    data: event,
    isLoading,
    error,
  } = useQuery<Event, Error>({
    queryKey: [GET_EVENT_DETAILS_KEY, id],
    queryFn: async () => {
      const eventData = await getEvent(id || "");
      if (!eventData) {
        throw new Error("Event not found");
      }
      return eventData;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: false,
    onSuccess: (data: Event) => {
      const initialTextInputs = data.text_placeholders.map(() => "");
      setUserTextInputs(initialTextInputs);
    },
  } as UseQueryOptions<Event, Error>);

  return {
    event,
    isLoading,
    error,
    userTextInputs,
    setUserTextInputs,
  };
};
