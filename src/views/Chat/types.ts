export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
}
