import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelInfo } from "@/models/types/model.types";
import { Bot } from "lucide-react";

interface ChatModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelect: (model: string) => void;
  disabled?: boolean;
}

export const ChatModelSelector = ({ models, selectedModel, onSelect, disabled }: ChatModelSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-primary" />
      <Select value={selectedModel} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger className="w-[260px] h-8 text-sm border-border/50 bg-background">
          <SelectValue placeholder="Välj modell..." />
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{m.provider}</span>
                <span>{m.id}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
