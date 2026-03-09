import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RequestLog {
  request_id: string;
  startTime: string;
  model: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  spend: number;
  status: string;
  key_name: string;
}

export const useRequestLogs = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: keys } = await supabase
        .from("api_keys")
        .select("id, name")
        .eq("user_id", session.user.id);

      if (!keys || keys.length === 0) {
        setLogs([]);
        return;
      }

      const allLogs: RequestLog[] = [];

      await Promise.all(
        keys.map(async (key) => {
          try {
            const { data, error } = await supabase.functions.invoke("get-key-usage", {
              body: { keyId: key.id },
              headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (error || !data?.spend_logs) return;

            const mappedLogs: RequestLog[] = data.spend_logs
              .filter((log: any) => log.api_key !== "litellm-internal-health-check")
              .map((log: any) => ({
                request_id: log.request_id || crypto.randomUUID(),
                startTime: log.startTime || "",
                model: log.model || "unknown",
                total_tokens: log.total_tokens || 0,
                prompt_tokens: log.prompt_tokens || 0,
                completion_tokens: log.completion_tokens || 0,
                spend: log.spend || 0,
                status: log.status || "unknown",
                key_name: key.name,
              }));

            allLogs.push(...mappedLogs);
          } catch (err) {
            console.error(`Error fetching logs for key ${key.name}:`, err);
          }
        })
      );

      allLogs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setLogs(allLogs);
    } catch (err) {
      console.error("Error fetching request logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
};
