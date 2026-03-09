import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal } from "lucide-react";
import { useCuratedModels } from "@/hooks/useCuratedModels";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { ConnectSection } from "./components/ConnectSection";
import { AgenticToolsSection } from "./components/AgenticToolsSection";

export const ApiPage = () => {
  const { models } = useCuratedModels(true);
  const { settings, isLoading: settingsLoading } = useSiteSettings();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const isPublic = settings?.models_public ?? false;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (authChecked && !settingsLoading && !isPublic && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authChecked, settingsLoading, isPublic, isAuthenticated, navigate]);

  const defaultModel = models.find((m) => m.is_default)?.id || models[0]?.id || "gpt-4o";
  const baseUrl = settings?.api_base_url || "https://api.autoversio.ai";

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">API</h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Everything you need to connect to the API and start building with agentic coding tools.
        </p>
      </div>

      <ConnectSection defaultModel={defaultModel} baseUrl={baseUrl} />
      <AgenticToolsSection baseUrl={baseUrl} />
    </div>
  );
};
