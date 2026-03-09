import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const TrialCTA = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 50%, hsla(160, 40%, 25%, 0.15), transparent 70%)'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Start building with <span className="gradient-text">$25 free credit</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No credit card required. Get instant access to all models and 
            start integrating in minutes with our OpenAI-compatible API.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 py-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              25M tokens included
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              All models available
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              No credit card
            </span>
          </div>
          
          <Link to="/auth">
            <Button size="lg" className="glow text-lg px-10 py-6 group">
              Get started
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
