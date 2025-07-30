import { supabase } from "../lib/supabase";

export const fetchDashboardStats = async (userId: string) => {
  if (!userId) throw new Error("No user ID");

  // Fetch total events created by user
  const { count: eventsCount, error: eventsError } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (eventsError) throw eventsError;

  // Fetch all event IDs
  const { data: userEvents, error: userEventsError } = await supabase
    .from("events")
    .select("id")
    .eq("user_id", userId);
  if (userEventsError) throw userEventsError;

  const eventIds = userEvents?.map((event) => event.id) || [];

  let dpsCount = 0;
  let participantsCount = 0;

  if (eventIds.length > 0) {
    // Fetch total DPs
    const { count: totalDPs, error: dpsError } = await supabase
      .from("dps")
      .select("*", { count: "exact", head: true })
      .in("event_id", eventIds);
    if (dpsError) throw dpsError;
    dpsCount = totalDPs || 0;

    // Fetch participants
    const { data: participantsData, error: participantsError } = await supabase
      .from("dps")
      .select("user_id")
      .in("event_id", eventIds)
      .not("user_id", "is", null);
    if (participantsError) throw participantsError;

    const uniqueParticipants = new Set(
      participantsData?.map((dp) => dp.user_id).filter(Boolean)
    );
    participantsCount = uniqueParticipants.size;
  }

  return {
    totalEvents: eventsCount || 0,
    totalDPs: dpsCount,
    totalParticipants: participantsCount,
  };
};
