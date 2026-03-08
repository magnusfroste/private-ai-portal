import { Bot, User } from "lucide-react";
import type { ChatMessage } from "../types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export const ChatMessageList = ({ messages, isStreaming }: ChatMessageListProps) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {messages.map((msg, i) => (
        <div key={i} className="flex gap-3">
          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
            msg.role === "user"
              ? "bg-primary/10 text-primary"
              : "bg-accent text-accent-foreground"
          }`}>
            {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {msg.role === "user" ? "Du" : "Assistent"}
            </p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground">
              {msg.content}
              {msg.role === "assistant" && i === messages.length - 1 && isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
