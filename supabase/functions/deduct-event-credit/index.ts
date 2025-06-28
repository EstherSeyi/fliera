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
    const { userId, requestId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: "Request ID is required for idempotency" }),
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

    // Check if this request has already been processed
    const { data: existingRequest, error: checkError } = await supabaseClient
      .from("credit_deduction_requests")
      .select("status, amount")
      .eq("request_id", requestId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing request:", checkError);
      throw new Error("Failed to check for duplicate request.");
    }

    // If request already exists, return the previous result
    if (existingRequest) {
      console.log("Duplicate request detected:", requestId);
      
      if (existingRequest.status === "completed") {
        return new Response(
          JSON.stringify({
            message: "Request already processed successfully.",
            credits_deducted: existingRequest.amount,
            idempotent: true,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            error: "Previous request failed",
            idempotent: true
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Fetch user's current credit info and free events used
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("credits, is_premium_user, free_events_used")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      
      // Record the failed request
      await supabaseClient
        .from("credit_deduction_requests")
        .insert({
          request_id: requestId,
          user_id: userId,
          type: "event",
          amount: 0,
          status: "failed"
        });
        
      throw new Error("User not found or could not fetch data.");
    }

    let { credits, is_premium_user, free_events_used } = userData;
    free_events_used = free_events_used || 0; // Handle null case

    // Check if user is within free event limit (3 free events)
    if (free_events_used < 3) {
      // Increment free_events_used within a transaction
      const { data, error: transactionError } = await supabaseClient.rpc(
        "increment_free_events_used",
        { user_id_param: userId }
      );

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        
        // Record the failed request
        await supabaseClient
          .from("credit_deduction_requests")
          .insert({
            request_id: requestId,
            user_id: userId,
            type: "event",
            amount: 0,
            status: "failed"
          });
          
        throw new Error("Failed to update free event count.");
      }

      // Record the successful request
      await supabaseClient
        .from("credit_deduction_requests")
        .insert({
          request_id: requestId,
          user_id: userId,
          type: "event",
          amount: 0,
          status: "completed"
        });

      // Record the transaction
      await supabaseClient
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: 0,
          transaction_type: "free_event_used",
          status: "completed",
          notes: `Free event used (${free_events_used + 1}/3)`
        });

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
        // Record the failed request due to insufficient credits
        await supabaseClient
          .from("credit_deduction_requests")
          .insert({
            request_id: requestId,
            user_id: userId,
            type: "event",
            amount: eventCost,
            status: "failed"
          });
          
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

      // Deduct credits within a transaction
      const { data, error: transactionError } = await supabaseClient.rpc(
        "deduct_user_credits",
        { 
          user_id_param: userId,
          amount_param: eventCost
        }
      );

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        
        // Record the failed request
        await supabaseClient
          .from("credit_deduction_requests")
          .insert({
            request_id: requestId,
            user_id: userId,
            type: "event",
            amount: eventCost,
            status: "failed"
          });
          
        throw new Error("Failed to deduct credits for event.");
      }

      // Record the successful request
      await supabaseClient
        .from("credit_deduction_requests")
        .insert({
          request_id: requestId,
          user_id: userId,
          type: "event",
          amount: eventCost,
          status: "completed"
        });

      // Record the transaction
      await supabaseClient
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: -eventCost,
          transaction_type: "event_creation",
          status: "completed",
          notes: "Paid event creation"
        });

      return new Response(
        JSON.stringify({
          message: "Credits deducted for event successfully.",
          remaining_credits: credits - eventCost,
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