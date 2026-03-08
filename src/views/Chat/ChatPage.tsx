import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { modelService } from "@/models/services/modelService";
import { useAuth } from "@/hooks/useAuth";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatHeader } from "./components/ChatHeader";
import { ChatSidebar } from "./components/ChatSidebar";
import { useChatStream } from "./hooks/useChatStream";
import { useChatConversations } from "./hooks/useChatConversations";
import { useRef, useState, useCallback } from "react";

export const ChatPage = () => {
  const { checkAuth } = useAuth();
  const [selectedModel, setSelectedModel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const { data: models = [] } = useQuery({
    queryKey: ["available-models"],
    queryFn: () => modelService.getAvailableModels(),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      const healthy = models.find((m) => m.status === "healthy");
      setSelectedModel(healthy?.id || models[0].id);
    }
  }, [models, selectedModel]);

  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    createConversation,
    setMessages,
    deleteConversation,
  } = useChatConversations();

  const messages = activeConversation?.messages ?? [];

  const { isStreaming, sendMessage } = useChatStream({
    model: selectedModel,
    messages,
    setMessages,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (input: string) => {
    if (!input.trim() || isStreaming) return;
    if (!activeId) {
      createConversation(selectedModel);
    }
    // Use requestAnimationFrame to ensure state updates before sending
    requestAnimationFrame(() => sendMessage(input));
  };

  const handleNewChat = () => {
    if (!isStreaming) {
      createConversation(selectedModel);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - full height */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Right side: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          disabled={isStreaming}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

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
    </div>
  );
};
