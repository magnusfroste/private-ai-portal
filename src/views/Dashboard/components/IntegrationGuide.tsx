import { Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IntegrationGuideProps {
  onCopy: (text: string) => void;
}

export const IntegrationGuide = ({ onCopy }: IntegrationGuideProps) => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            Use your API key with the LiteLLM proxy endpoint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                value="https://api.autoversio.ai/"
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onCopy("https://api.autoversio.ai/")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm space-y-2">
            <p className="text-muted-foreground"># Example usage with curl:</p>
            <p>curl https://api.autoversio.ai/v1/chat/completions \</p>
            <p className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
            <p className="ml-4">-H "Content-Type: application/json" \</p>
            <p className="ml-4">
              -d '{"{"}
              "model": "autoversio", "messages": [...]
              {"}"}'
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            For more information, visit the{" "}
            <a
              href="https://docs.litellm.ai/docs/providers/github"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LiteLLM documentation
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
