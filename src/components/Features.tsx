import { Code2, DollarSign, Key, BarChart, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "OpenAI-compatible API",
    description: "Access GPT, Claude, Llama, and more through a single unified endpoint. Drop-in replacement for your existing code.",
    bullets: ["Single API endpoint", "Multiple providers", "Easy migration"],
  },
  {
    icon: Key,
    title: "Simple Key Management",
    description: "Generate and manage API keys directly from the portal. No complex setup required.",
    bullets: ["Self-service portal", "Instant provisioning", "Full control"],
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Pay-as-you-go at $1 per 1M tokens. No hidden fees, no surprises.",
    bullets: ["$1 / 1M tokens", "No hidden costs", "$25 free credit"],
  },
  {
    icon: BarChart,
    title: "Usage Analytics",
    description: "Monitor token usage and costs in real-time with detailed analytics and spending controls.",
    bullets: ["Real-time tracking", "Cost breakdown", "Budget alerts"],
  },
];

export const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything you need for{" "}
            <span className="gradient-text">Private AI</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sovereign, secure, and developer-friendly AI infrastructure — ready to scale.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-xl p-8 space-y-4 hover:border-primary/50 transition-all duration-300"
            >
              <feature.icon className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-1">
                {feature.bullets.map((b, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-accent" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
