import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { TrialCTA } from "@/components/TrialCTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <TrialCTA />
      
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Autoversio. Secure private LLM access for developers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
