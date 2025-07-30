// queries/fetchUserCredits.ts
import { supabase } from "../lib/supabase";
import type { UserCreditInfo } from "../types";

export const getUserCredits = async (
  userId: string
): Promise<UserCreditInfo> => {
  if (!userId) throw new Error("No user ID");

  // Fetch user base credit info
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("credits, is_premium_user, free_events_used")
    .eq("id", userId)
    .single();
  if (userError) throw userError;

  // Fetch event count
  const { count: eventsCount, error: eventsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (eventsError) throw eventsError;

  // Fetch DP count
  const { count: dpsCount, error: dpsError } = await supabase
    .from("dps")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (dpsError) throw dpsError;

  // Free logic
  const freeEventsUsed = userData?.free_events_used || 0;
  const freeEventsRemaining = Math.max(0, 3 - freeEventsUsed);
  const totalFreeEventsCreated = Math.min(freeEventsUsed, 3);
  const totalFreeDPsAllowed = totalFreeEventsCreated * 100;
  const freeDPsRemainingForCurrentEvents = Math.max(
    0,
    totalFreeDPsAllowed - (dpsCount || 0)
  );

  return {
    credits: userData?.credits || 0,
    is_premium_user: userData?.is_premium_user || false,
    eventsCreated: eventsCount || 0,
    totalDPsGenerated: dpsCount || 0,
    freeEventsRemaining,
    freeDPsRemainingForCurrentEvents,
  };
};
