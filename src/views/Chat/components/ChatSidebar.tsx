import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Conversation } from "../types";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 border-r border-border/50 bg-card/50 flex flex-col h-full">
      <div className="p-3">
        <Button
          onClick={onNew}
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Ny chatt
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2 space-y-0.5">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 group transition-colors",
              activeId === conv.id
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate flex-1">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </button>
        ))}

        {conversations.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Inga chattar ännu
          </p>
        )}
      </div>
    </div>
  );
};
