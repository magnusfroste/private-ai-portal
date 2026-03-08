import { supabase } from "@/integrations/supabase/client";

export class UsageRepository {
  // Usage is now tracked at user level via LiteLLM /user/info
  // This repository is kept for potential future per-key usage from DB
}

export const usageRepository = new UsageRepository();
