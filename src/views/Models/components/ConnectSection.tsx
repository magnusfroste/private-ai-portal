import { Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "./CopyButton";

export const ConnectSection = ({ defaultModel, baseUrl }: { defaultModel: string; baseUrl: string }) => (
  <Card className="border-border/50 bg-card/60">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Terminal className="w-5 h-5 text-primary" />
        Connect to the API
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="openai">OpenAI SDK / curl</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
        </TabsList>

        <TabsContent value="openai" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Point any OpenAI-compatible client at the base URL below and use your API key.
            Pass the model ID from the list above as the <code className="text-primary font-mono text-xs">model</code> parameter.
          </p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-1 overflow-x-auto">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground"># Base URL</p>
                  <p>{baseUrl}/</p>
                </div>
                <CopyButton text={`${baseUrl}/`} />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-1 overflow-x-auto">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground"># Example curl request</p>
                  <p>curl {baseUrl}/v1/chat/completions \</p>
                  <p className="ml-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
                  <p className="ml-4">-H "Content-Type: application/json" \</p>
                  <p className="ml-4">-d '{"{"}"model": "{defaultModel}", "messages": [{"{"}"role": "user", "content": "Hello"{"}"}]{"}"}'</p>
                </div>
                <CopyButton text={`curl ${baseUrl}/v1/chat/completions \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${defaultModel}", "messages": [{"role": "user", "content": "Hello"}]}'`} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="claude-code" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Claude Code works natively with the proxy. Set these environment variables and start coding.
          </p>

          <div className="space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>export ANTHROPIC_BASE_URL={baseUrl}</span>
                <CopyButton text={`export ANTHROPIC_BASE_URL=${baseUrl}`} />
              </div>
              <div className="flex items-center justify-between">
                <span>export ANTHROPIC_API_KEY=&lt;your-api-key&gt;</span>
                <CopyButton text="export ANTHROPIC_API_KEY=" />
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span>claude</span>
                <CopyButton text="claude" />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Replace <code className="text-primary">&lt;your-api-key&gt;</code> with an API key from your dashboard.
          </p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);
