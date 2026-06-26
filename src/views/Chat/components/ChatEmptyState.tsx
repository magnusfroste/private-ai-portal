import { Sparkles } from "lucide-react";

export const ChatEmptyState = () => {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-muted-foreground">
        Pick a model above and ask anything.
      </p>
    </div>
  );
};
