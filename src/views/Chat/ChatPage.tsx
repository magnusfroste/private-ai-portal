import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { modelService } from "@/models/services/modelService";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatModelSelector } from "./components/ChatModelSelector";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { useChatStream } from "./hooks/useChatStream";
import type { ChatMessage } from "./types";

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: models = [] } = useQuery({
    queryKey: ["available-models"],
    queryFn: () => modelService.getAvailableModels(),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  const { isStreaming, sendMessage } = useChatStream({
    model: selectedModel,
    messages,
    setMessages,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (input: string) => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
  };

  const handleClear = () => {
    if (!isStreaming) setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50">
        <ChatModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          disabled={isStreaming}
        />
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            disabled={isStreaming}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Rensa chatt
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        {messages.length === 0 ? (
          <ChatEmptyState onSelectPrompt={handleSend} />
        ) : (
          <ChatMessageList messages={messages} isStreaming={isStreaming} />
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
};
