import { MessageSquare } from "lucide-react";

const PROMPTS = [
  { label: "Try a simple question", text: "Tell me briefly about yourself and who you can help." },
  { label: "Code generation", text: "Write a Python function that sorts a list of objects by date." },
  { label: "Analyze text", text: "Summarize the benefits of microservice architecture in 3 bullet points." },
  { label: "Creative writing", text: "Write a short product description for an AI-powered API gateway." },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatEmptyState = ({ onSelectPrompt }: ChatEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-1">Chat Playground</h2>
      <p className="text-sm text-muted-foreground mb-8">Test the models directly — pick a model above and start chatting.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelectPrompt(p.text)}
            className="text-left p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors group"
          >
            <p className="text-sm font-medium text-foreground mb-1">{p.label}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{p.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
