import { LayoutDashboard, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatModelSelector } from "./ChatModelSelector";
import { ChatKeySelector } from "./ChatKeySelector";
import type { ModelInfo } from "@/models/types/model.types";

interface ApiKeyOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface ChatHeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  keys: ApiKeyOption[];
  selectedKeyId: string;
  onSelectKey: (keyId: string) => void;
  disabled?: boolean;
  onToggleSidebar: () => void;
}

export const ChatHeader = ({
  models,
  selectedModel,
  onSelectModel,
  keys,
  selectedKeyId,
  onSelectKey,
  disabled,
  onToggleSidebar,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-8 w-8 md:hidden"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
        <ChatModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelectModel}
          disabled={disabled}
        />
        <span className="text-border hidden sm:inline">|</span>
        <div className="hidden sm:block">
          <ChatKeySelector
            keys={keys}
            selectedKeyId={selectedKeyId}
            onSelect={onSelectKey}
            disabled={disabled}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <LayoutDashboard className="w-4 h-4" />
        <span className="hidden sm:inline">Dashboard</span>
      </Button>
    </header>
  );
};
