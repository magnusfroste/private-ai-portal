import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("Not authenticated");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    // Retrieve checkout session from Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Verify payment belongs to this user
    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: "unpaid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10);
    if (creditsToAdd <= 0) throw new Error("Invalid credits in session metadata");

    // Use service role to update profile (bypasses RLS)
    // First get current credits
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("purchased_credits_usd")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    const newCredits = (profile.purchased_credits_usd ?? 0) + creditsToAdd;

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ purchased_credits_usd: newCredits })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Log transaction (idempotent via unique stripe_session_id)
    await supabaseAdmin
      .from("credit_transactions")
      .upsert(
        {
          user_id: user.id,
          amount_usd: creditsToAdd,
          credits_added: creditsToAdd,
          stripe_session_id: session_id,
        },
        { onConflict: "stripe_session_id" }
      );

    return new Response(
      JSON.stringify({ status: "paid", credits_added: creditsToAdd, total_credits: newCredits }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[VERIFY-PAYMENT]", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
