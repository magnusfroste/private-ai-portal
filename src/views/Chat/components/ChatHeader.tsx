import { LayoutDashboard, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatModelSelector } from "./ChatModelSelector";
import type { ModelInfo } from "@/models/types/model.types";

interface ChatHeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  disabled?: boolean;
}

export const ChatHeader = ({
  models,
  selectedModel,
  onSelectModel,
  disabled,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold gradient-text">Autoversio</span>
        </button>
        <span className="text-border">|</span>
        <ChatModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelectModel}
          disabled={disabled}
        />
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
