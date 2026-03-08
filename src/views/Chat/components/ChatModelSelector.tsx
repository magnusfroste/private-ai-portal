import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelInfo } from "@/models/types/model.types";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatModelSelectorProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelect: (model: string) => void;
  disabled?: boolean;
}

const StatusDot = ({ status }: { status: ModelInfo["status"] }) => {
  const colors = {
    healthy: "bg-emerald-500 shadow-[0_0_6px_hsl(var(--chart-2)/0.5)]",
    unhealthy: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.5)]",
    unknown: "bg-muted-foreground/50",
  };

  return (
    <span
      className={cn("inline-block w-2 h-2 rounded-full shrink-0", colors[status])}
      title={status === "healthy" ? "Online" : status === "unhealthy" ? "Offline" : "Okänd status"}
    />
  );
};

export const ChatModelSelector = ({ models, selectedModel, onSelect, disabled }: ChatModelSelectorProps) => {
  const selected = models.find((m) => m.id === selectedModel);

  return (
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-primary" />
      <Select value={selectedModel} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger className="w-[280px] h-8 text-sm border-border/50 bg-background">
          <span className="flex items-center gap-2 truncate">
            {selected && <StatusDot status={selected.status} />}
            <SelectValue placeholder="Välj modell..." />
          </span>
        </SelectTrigger>
        <SelectContent>
          {models.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="flex items-center gap-2">
                <StatusDot status={m.status} />
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
