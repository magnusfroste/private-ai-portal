import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, DollarSign, Key, BarChart } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Multiple LLM Support",
    description: "Access GPT, Claude, Llama, and more through a single unified API endpoint.",
  },
  {
    icon: Key,
    title: "Easy API Key Management",
    description: "Generate and manage your API keys directly from the portal. No complex setup required.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Simple pay-as-you-go pricing at $1 per 1M tokens. No hidden fees or surprises.",
  },
  {
    icon: BarChart,
    title: "Real-Time Usage Tracking",
    description: "Monitor your token usage and costs in real-time with detailed analytics.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need for
            <span className="gradient-text"> Private AI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on top of LiteLLM for maximum compatibility and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
