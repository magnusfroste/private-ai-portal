import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Server configuration missing" }, 500);
  }

  // Verify auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Missing authorization" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  // Check admin role server-side
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!isAdmin) {
    return jsonResponse({ error: "Forbidden: admin role required" }, 403);
  }

  // === GET: List all users with profiles and key counts ===
  if (req.method === "GET") {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, company, trial_keys_created, max_trial_keys, litellm_user_id, purchased_credits_usd, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return jsonResponse({ error: "Failed to fetch users" }, 500);
    }

    // Get API key counts per user
    const { data: keyCounts, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id");

    if (keyError) {
      console.error("Error fetching key counts:", keyError);
    }

    const keyCountMap: Record<string, number> = {};
    if (keyCounts) {
      for (const row of keyCounts) {
        keyCountMap[row.user_id] = (keyCountMap[row.user_id] || 0) + 1;
      }
    }

    const users = profiles.map((p) => ({
      ...p,
      api_key_count: keyCountMap[p.id] || 0,
    }));

    return jsonResponse({ users });
  }

  // === PATCH: Update user settings ===
  if (req.method === "PATCH") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { user_id, max_trial_keys, reset_trial_keys } = body as {
      user_id?: string;
      max_trial_keys?: number;
      reset_trial_keys?: boolean;
    };

    if (!user_id) {
      return jsonResponse({ error: "user_id is required" }, 400);
    }

    if (!UUID_REGEX.test(user_id)) {
      return jsonResponse({ error: "user_id must be a valid UUID" }, 400);
    }

    const updates: Record<string, unknown> = {};

    if (typeof max_trial_keys === "number" && max_trial_keys >= 0) {
      updates.max_trial_keys = max_trial_keys;
    }

    if (reset_trial_keys === true) {
      updates.trial_keys_created = 0;
    }

    if (Object.keys(updates).length === 0) {
      return jsonResponse({ error: "No valid updates provided" }, 400);
    }

    const { data, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user_id)
      .select("id, full_name, email, company, trial_keys_created, max_trial_keys, created_at")
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return jsonResponse({ error: "Failed to update user" }, 500);
    }

    return jsonResponse({ user: data });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
});
