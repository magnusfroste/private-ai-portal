import { Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApiKeyOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface ChatKeySelectorProps {
  keys: ApiKeyOption[];
  selectedKeyId: string;
  onSelect: (keyId: string) => void;
  disabled?: boolean;
  isAdmin?: boolean;
}

export const ChatKeySelector = ({ keys, selectedKeyId, onSelect, disabled, isAdmin }: ChatKeySelectorProps) => {
  const activeKeys = keys.filter((k) => k.is_active);

  if (activeKeys.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Key className="w-3.5 h-3.5" />
        <span>Ingen aktiv nyckel</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Key className="w-3.5 h-3.5 text-muted-foreground" />
      <Select value={selectedKeyId} onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger className="w-[180px] h-7 text-xs border-border/50 bg-background">
          <SelectValue placeholder="Välj nyckel..." />
        </SelectTrigger>
        <SelectContent>
          {isAdmin && (
            <SelectItem value="__master__" textValue="Master Key (admin)">
              <span className="text-xs">Master Key (admin)</span>
            </SelectItem>
          )}
          {activeKeys.map((k) => (
            <SelectItem key={k.id} value={k.id} textValue={k.name}>
              <span className="text-xs">{k.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
