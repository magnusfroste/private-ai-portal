import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Admin panel error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Shield className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Något gick fel</h1>
          <p className="text-muted-foreground">Admin-panelen kunde inte laddas.</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Försök igen
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
