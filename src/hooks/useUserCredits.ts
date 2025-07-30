import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getUserCredits } from "../business-logic";

export const useUserCredits = () => {
  const { user } = useAuth();

  const {
    data: creditInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userCredits", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User ID is required");
      return getUserCredits(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  return {
    creditInfo,
    loading: isLoading,
    error: isError ? error?.message ?? "Unknown error" : null,
    refetch,
  };
};
