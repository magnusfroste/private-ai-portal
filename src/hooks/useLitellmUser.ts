import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures the current authenticated user has a LiteLLM internal user.
 * Called once on dashboard mount — idempotent (no-op if user already exists).
 */
export const useLitellmUser = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const ensureUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const { error } = await supabase.functions.invoke('create-litellm-user', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (error) {
          console.error('Failed to ensure LiteLLM user:', error);
        }
      } catch (err) {
        console.error('Error ensuring LiteLLM user:', err);
      }
    };

    ensureUser();
  }, []);
};
