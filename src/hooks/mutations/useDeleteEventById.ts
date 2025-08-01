import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { deleteEventById } from "../../business-logic";
import {
  GET_DASHBOARD_STATS_KEY,
  GET_PUBLIC_EVENTS_KEY,
  GET_RECENT_EVENTS_KEY,
  GET_USER_EVENTS_KEY,
} from "../queries/constants";

export const useDeleteEvent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      await deleteEventById({ id, userId: user.id });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: [GET_PUBLIC_EVENTS_KEY] });

      queryClient.invalidateQueries({ queryKey: [GET_RECENT_EVENTS_KEY] });

      queryClient.invalidateQueries({ queryKey: [GET_DASHBOARD_STATS_KEY] });

      queryClient.invalidateQueries({ queryKey: [GET_USER_EVENTS_KEY] });
    },
  });
};
