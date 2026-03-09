import { Plus, MessageSquare, Trash2, X, Shield } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Conversation } from "../types";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: ChatSidebarProps) => {
  const navigate = useNavigate();
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleNew = () => {
    onNew();
    onClose();
  };

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border/50 bg-card flex flex-col h-full transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:z-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary shrink-0" />
            <span className="text-lg font-bold gradient-text">Autoversio</span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden shrink-0 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-3 pb-3">
          <Button
            onClick={handleNew}
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
              onClick={() => handleSelect(conv.id)}
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
    </>
  );
};
