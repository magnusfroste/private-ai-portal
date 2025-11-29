import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Zap, Lock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 50%, hsla(263, 70%, 50%, 0.15), transparent 70%)'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Enterprise-Grade Private LLM</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Secure AI Development
            <br />
            <span className="gradient-text">Without Compromise</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access powerful LLMs through our private proxy. Your code stays secure, your data stays yours. 
            Perfect for developers who value privacy.
          </p>
          
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
  <Link to="/auth">
    <Button size="lg" className="glow text-lg px-8 py-6">
      Start Free Trial
      <span className="ml-2 text-sm opacity-80">$25 Credit • 5 Days</span>
    </Button>
  </Link>
  <a href="https://www.autoversio.com" target="_blank" rel="noopener noreferrer">
    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
      View Documentation
    </Button>
  </a>
</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <Lock className="w-8 h-8 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Private & Secure</h3>
              <p className="text-sm text-muted-foreground">Your data never leaves your control</p>
            </div>
            
            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <Zap className="w-8 h-8 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Optimized LiteLLM proxy infrastructure</p>
            </div>
            
            <div className="glass-card p-6 rounded-xl space-y-2 hover:scale-105 transition-transform">
              <Shield className="w-8 h-8 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Enterprise Ready</h3>
              <p className="text-sm text-muted-foreground">Scale from prototype to production</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
