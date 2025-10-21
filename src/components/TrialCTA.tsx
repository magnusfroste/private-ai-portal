import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const benefits = [
  "25M tokens ($25 credit)",
  "5 days full access",
  "All LLM models included",
  "No credit card required",
];

export const TrialCTA = () => {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at 50% 50%, hsla(263, 70%, 50%, 0.1), transparent 70%)'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto glass-card rounded-2xl p-12 text-center space-y-8 glow">
          <h2 className="text-4xl md:text-5xl font-bold">
            Start Your Free Trial Today
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience enterprise-grade private LLM access with no commitment. 
            Get started in minutes.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-accent" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Link to="/auth">
            <Button size="lg" className="glow text-lg px-12 py-6">
              Claim Your Free Trial
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </section>
  );
};
