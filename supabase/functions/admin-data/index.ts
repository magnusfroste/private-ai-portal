import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Missing authorization" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return json({ error: "Invalid token" }, 401);
  }

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!isAdmin) {
    return json({ error: "Forbidden" }, 403);
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  // === Credit transactions ===
  if (type === "credits") {
    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("credits error:", error);
      return json({ error: "Failed to fetch transactions" }, 500);
    }

    // Fetch profiles for user_ids
    const userIds = [...new Set((transactions || []).map((t: any) => t.user_id))];
    const profileMap: Record<string, { full_name: string | null; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      for (const p of profiles || []) {
        profileMap[p.id] = { full_name: p.full_name, email: p.email };
      }
    }

    let totalRevenue = 0;
    const enriched = (transactions || []).map((t: any) => {
      totalRevenue += Number(t.amount_usd || 0);
      return { ...t, profiles: profileMap[t.user_id] || null };
    });

    return json({ transactions: enriched, totalRevenue });
  }

  // === API keys overview — grouped by user with token sums ===
  if (type === "keys") {
    const { data: keys, error } = await supabase
      .from("api_keys")
      .select("id, name, is_active, created_at, revoked_at, user_id")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("keys error:", error);
      return json({ error: "Failed to fetch keys" }, 500);
    }

    // Aggregate tokens_used per user from token_usage
    const { data: tokenAgg, error: tokenErr } = await supabase
      .from("token_usage")
      .select("user_id, tokens_used");

    const userTokens: Record<string, number> = {};
    if (!tokenErr && tokenAgg) {
      for (const row of tokenAgg) {
        userTokens[row.user_id] = (userTokens[row.user_id] || 0) + Number(row.tokens_used || 0);
      }
    }

    const userIds = [...new Set((keys || []).map((k: any) => k.user_id))];
    const profileMap: Record<string, { full_name: string | null; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      for (const p of profiles || []) {
        profileMap[p.id] = { full_name: p.full_name, email: p.email };
      }
    }

    const enriched = (keys || []).map((k: any) => ({
      ...k,
      profiles: profileMap[k.user_id] || null,
    }));

    // Build per-user summary
    const userSummary = userIds.map((uid) => {
      const userKeys = (keys || []).filter((k: any) => k.user_id === uid);
      return {
        user_id: uid,
        full_name: profileMap[uid]?.full_name || null,
        email: profileMap[uid]?.email || "unknown",
        total_keys: userKeys.length,
        active_keys: userKeys.filter((k: any) => k.is_active && !k.revoked_at).length,
        total_tokens: userTokens[uid] || 0,
      };
    });

    return json({ keys: enriched, userSummary });
  }

  // === Usage statistics ===
  if (type === "usage") {
    // Top models by cost
    const { data: usage, error } = await supabase
      .from("token_usage")
      .select("model, cost_usd, tokens_used, user_id")
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("usage error:", error);
      return json({ error: "Failed to fetch usage" }, 500);
    }

    const modelStats: Record<string, { cost: number; tokens: number; requests: number }> = {};
    const userStats: Record<string, { cost: number; requests: number }> = {};
    let totalCost = 0;
    let totalTokens = 0;

    for (const row of usage || []) {
      const model = row.model || "unknown";
      const cost = Number(row.cost_usd || 0);
      const tokens = Number(row.tokens_used || 0);

      totalCost += cost;
      totalTokens += tokens;

      if (!modelStats[model]) modelStats[model] = { cost: 0, tokens: 0, requests: 0 };
      modelStats[model].cost += cost;
      modelStats[model].tokens += tokens;
      modelStats[model].requests += 1;

      if (!userStats[row.user_id]) userStats[row.user_id] = { cost: 0, requests: 0 };
      userStats[row.user_id].cost += cost;
      userStats[row.user_id].requests += 1;
    }

    // Get top users by cost
    const topUserIds = Object.entries(userStats)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 10)
      .map(([id]) => id);

    let topUsers: { user_id: string; email: string; full_name: string | null; cost: number; requests: number }[] = [];
    if (topUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", topUserIds);

      topUsers = topUserIds.map((uid) => {
        const p = profiles?.find((pr: any) => pr.id === uid);
        return {
          user_id: uid,
          email: p?.email || "unknown",
          full_name: p?.full_name || null,
          ...userStats[uid],
        };
      });
    }

    const topModels = Object.entries(modelStats)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 15)
      .map(([model, stats]) => ({ model, ...stats }));

    return json({ totalCost, totalTokens, totalRequests: (usage || []).length, topModels, topUsers });
  }

  return json({ error: "Invalid type parameter. Use: credits, keys, usage" }, 400);
});
