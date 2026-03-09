import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Zap, Lock, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Hero = () => {
  const { settings } = useSiteSettings();
  const siteName = settings?.site_name || "Autoversio";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle green-tinted gradient background inspired by Berget */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 40%, hsla(160, 40%, 25%, 0.3), transparent 70%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 80% 60%, hsla(263, 70%, 30%, 0.15), transparent 60%)'
      }} />
      
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent">Your data never leaves your control</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            Private AI access{" "}
            <span className="gradient-text">built for developers</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Secure LLM proxy with OpenAI-compatible API. Access multiple models, 
            transparent pricing, and full data privacy. Get started in minutes.
          </p>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="glow text-lg px-8 py-6 group">
                Get started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="https://www.autoversio.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Documentation
              </Button>
            </a>
          </div>

          {/* Feature pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            <div className="glass-card p-6 rounded-xl space-y-3 hover:border-primary/50 transition-all duration-300">
              <Lock className="w-8 h-8 text-accent" />
              <h3 className="text-lg font-semibold">Private & Secure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your data stays yours. Full control over your AI infrastructure.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl space-y-3 hover:border-primary/50 transition-all duration-300">
              <Zap className="w-8 h-8 text-accent" />
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Optimized LiteLLM proxy infrastructure. Low latency, high throughput.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl space-y-3 hover:border-primary/50 transition-all duration-300">
              <Shield className="w-8 h-8 text-accent" />
              <h3 className="text-lg font-semibold">Enterprise Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scale from prototype to production with transparent pricing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
