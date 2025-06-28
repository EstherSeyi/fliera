import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch user's current credit info and free events used
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("credits, is_premium_user, free_events_used")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      throw new Error("User not found or could not fetch data.");
    }

    let { credits, is_premium_user, free_events_used } = userData;
    free_events_used = free_events_used || 0; // Handle null case

    // Check if user is within free event limit (3 free events)
    if (free_events_used < 3) {
      // Increment free_events_used
      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ free_events_used: free_events_used + 1 })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating free_events_used:", updateError);
        throw new Error("Failed to update free event count.");
      }

      return new Response(
        JSON.stringify({
          message: "Free event used successfully.",
          remaining_free_events: 3 - (free_events_used + 1),
          credits_deducted: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Free events exhausted, deduct credits
      const eventCost = 0.5; // 0.5 credits per event after free limit

      if (credits < eventCost) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient credits",
            required_credits: eventCost,
            available_credits: credits
          }),
          {
            status: 402, // Payment Required
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const newCredits = credits - eventCost;

      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        throw new Error("Failed to deduct credits for event.");
      }

      return new Response(
        JSON.stringify({
          message: "Credits deducted for event successfully.",
          remaining_credits: newCredits,
          credits_deducted: eventCost,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error) {
    console.error("Edge Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});