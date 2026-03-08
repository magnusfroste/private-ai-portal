import { MessageSquare } from "lucide-react";

const PROMPTS = [
  { label: "Testa en enkel fråga", text: "Berätta kort om dig själv och vilka du kan hjälpa." },
  { label: "Kodgenerering", text: "Skriv en Python-funktion som sorterar en lista med objekt efter datum." },
  { label: "Analysera text", text: "Sammanfatta fördelarna med microservice-arkitektur i 3 punkter." },
  { label: "Kreativt skrivande", text: "Skriv en kort produktbeskrivning för en AI-driven API-gateway." },
];

interface ChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const ChatEmptyState = ({ onSelectPrompt }: ChatEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-1">Chat Playground</h2>
      <p className="text-sm text-muted-foreground mb-8">Testa modellerna direkt — välj en modell ovan och börja chatta.</p>

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
