import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@12.18.0";

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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeSecretKey || !stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration missing" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the signature from the headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the raw body
    const body = await req.text();

    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract metadata
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || "0", 10);
      
      if (!userId || !credits) {
        console.error("Missing metadata in session", session.metadata);
        return new Response(
          JSON.stringify({ error: "Missing metadata in session" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Update user's credits in the database
      const { data: userData, error: fetchError } = await supabaseClient
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Error fetching user data:", fetchError);
        return new Response(
          JSON.stringify({ error: "Error fetching user data" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + credits;

      const { error: updateError } = await supabaseClient
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating user credits:", updateError);
        return new Response(
          JSON.stringify({ error: "Error updating user credits" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Log the transaction
      const { error: logError } = await supabaseClient
        .from("credit_transactions")
        .insert({
          user_id: userId,
          amount: credits,
          transaction_type: "purchase",
          payment_id: session.id,
          status: "completed",
        });

      if (logError) {
        console.error("Error logging transaction:", logError);
        // Continue even if logging fails
      }

      return new Response(
        JSON.stringify({ success: true, credits_added: credits }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Return a response for other event types
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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