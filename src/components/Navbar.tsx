import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold gradient-text">Autoversio</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button className="glow">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
