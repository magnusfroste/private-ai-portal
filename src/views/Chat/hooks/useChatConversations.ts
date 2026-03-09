import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation, ChatMessage } from "../types";

export const useChatConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(() => {
    return sessionStorage.getItem("chat-active-id") || null;
  });
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversations from DB on mount
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("chat_conversations")
        .select("id, title, model, messages, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        const convs = data.map((row) => ({
          id: row.id,
          title: row.title,
          model: row.model || "",
          messages: (row.messages as unknown as ChatMessage[]) || [],
          createdAt: new Date(row.created_at).getTime(),
        }));
        setConversations(convs);
        // Auto-select last active or most recent
        const stored = sessionStorage.getItem("chat-active-id");
        if (stored && convs.some((c) => c.id === stored)) {
          setActiveId(stored);
        } else if (convs.length > 0) {
          setActiveId(convs[0].id);
        }
      }
      setLoaded(true);
    };
    load();
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // Debounced save to DB
  const saveToDb = useCallback((convId: string, title: string, messages: ChatMessage[], model: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await supabase
        .from("chat_conversations")
        .update({
          title,
          messages: JSON.parse(JSON.stringify(messages)),
          model,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);
    }, 500);
  }, []);

  const createConversation = useCallback(async (model: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "";

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: "Ny chatt",
        model,
        messages: [],
      })
      .select("id, created_at")
      .single();

    if (error || !data) return "";

    const conv: Conversation = {
      id: data.id,
      title: "Ny chatt",
      messages: [],
      model,
      createdAt: new Date(data.created_at).getTime(),
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
          const firstUser = newMessages.find((m) => m.role === "user");
          const title = firstUser
            ? firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? "…" : "")
            : c.title;
          // Persist
          saveToDb(c.id, title, newMessages, c.model);
          return { ...c, messages: newMessages, title };
        })
      );
    },
    [activeId, saveToDb]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
      await supabase.from("chat_conversations").delete().eq("id", id);
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
    loaded,
  };
};
