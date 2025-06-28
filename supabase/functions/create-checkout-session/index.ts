import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import Stripe from "npm:stripe@12.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
};

// Credit pack configurations
const CREDIT_PACKS = {
  "pack-1": { credits: 1, price: 500 }, // $5.00
  "pack-2": { credits: 2, price: 800 }, // $8.00
  "pack-5": { credits: 5, price: 1600 }, // $16.00
  "pack-10": { credits: 10, price: 3500 }, // $35.00
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
    const { packId, userId, originUrl } = await req.json();

    if (!packId || !userId) {
      return new Response(
        JSON.stringify({ error: "Pack ID and User ID are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate origin URL
    let baseUrl = originUrl;
    if (!baseUrl) {
      // Fallback to a default URL if originUrl is not provided
      baseUrl = "https://eventdp.com";
      console.warn("No origin URL provided, using fallback URL:", baseUrl);
    }

    // Validate pack ID
    const pack = CREDIT_PACKS[packId as keyof typeof CREDIT_PACKS];
    if (!pack) {
      return new Response(
        JSON.stringify({ error: "Invalid pack ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get user email for Stripe customer
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: userData, error: userError } = await supabaseClient.auth
      .admin.getUserById(userId);

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.credits} Credit${pack.credits > 1 ? "s" : ""}`,
              description: `Credit pack for EventDP`,
            },
            unit_amount: pack.price, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment-success?plan=${packId}&type=credits`,
      cancel_url: `${baseUrl}/payment-failure?plan=${packId}&type=credits`,
      customer_email: userData.user.email,
      metadata: {
        userId,
        packId,
        credits: pack.credits.toString(),
      },
    });

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
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