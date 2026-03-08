import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatSettings {
  enabledModels: string[];
  defaultModel: string;
}

export const useChatSettings = () => {
  return useQuery<ChatSettings>({
    queryKey: ["chat-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["chat_enabled_models", "chat_default_model"]);

      if (error) throw error;

      const map: Record<string, unknown> = {};
      (data || []).forEach((row) => {
        map[row.key] = row.value;
      });

      return {
        enabledModels: (map.chat_enabled_models as string[]) || [],
        defaultModel: (map.chat_default_model as string) || "",
      };
    },
    staleTime: 60 * 1000,
  });
};
