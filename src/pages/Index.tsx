import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { TrialCTA } from "@/components/TrialCTA";
import { DynamicHead } from "@/components/DynamicHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index = () => {
  const { settings } = useSiteSettings();
  const siteName = settings?.site_name || "Autoversio";
  const tagline = settings?.tagline || "Secure private LLM access for developers.";

  return (
    <div className="min-h-screen">
      <DynamicHead />
      <Navbar />
      <Hero />
      <Features />
      <TrialCTA />
      
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. {tagline}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
