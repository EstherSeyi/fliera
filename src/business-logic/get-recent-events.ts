import { supabase } from "../lib/supabase";

export const getRecentEvents = async (userId: string) => {
  if (!userId) throw new Error("No user ID");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  return data || [];
};
