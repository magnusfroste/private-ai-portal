import { useState, useCallback } from "react";
import type { Conversation, ChatMessage } from "../types";

const generateId = () => crypto.randomUUID();

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback((model: string) => {
    const conv: Conversation = {
      id: generateId(),
      title: "Ny chatt",
      messages: [],
      model,
      createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    return conv.id;
  }, []);

  const setMessages = useCallback(
    (updater: React.SetStateAction<ChatMessage[]>) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const newMessages =
            typeof updater === "function" ? updater(c.messages) : updater;
          // Auto-title from first user message
          const firstUser = newMessages.find((m) => m.role === "user");
          const title = firstUser
            ? firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? "…" : "")
            : c.title;
          return { ...c, messages: newMessages, title };
        })
      );
    },
    [activeId]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    createConversation,
    setMessages,
    deleteConversation,
  };
};
