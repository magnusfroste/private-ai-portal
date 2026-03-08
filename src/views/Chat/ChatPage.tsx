import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { modelService } from "@/models/services/modelService";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { adminRepository } from "@/data/repositories/adminRepository";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageList } from "./components/ChatMessageList";
import { ChatEmptyState } from "./components/ChatEmptyState";
import { ChatHeader } from "./components/ChatHeader";
import { ChatSidebar } from "./components/ChatSidebar";
import { useChatStream } from "./hooks/useChatStream";
import { useChatConversations } from "./hooks/useChatConversations";
import { useRef, useState } from "react";

export const ChatPage = () => {
  const { checkAuth } = useAuth();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedKeyId, setSelectedKeyId] = useState("");
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

  // Fetch user's API keys
  const { data: apiKeys = [] } = useQuery({
    queryKey: ["user-api-keys"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, is_active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
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
    apiKeyId: selectedKeyId === "__master__" ? undefined : selectedKeyId,
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
    requestAnimationFrame(() => sendMessage(input));
  };

  const handleNewChat = () => {
    if (!isStreaming) {
      createConversation(selectedModel);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          keys={apiKeys}
          selectedKeyId={selectedKeyId}
          onSelectKey={setSelectedKeyId}
          disabled={isStreaming}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <div ref={scrollRef} className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <ChatEmptyState onSelectPrompt={handleSend} />
          ) : (
            <ChatMessageList messages={messages} isStreaming={isStreaming} />
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
};
