import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useLitellmUser } from "@/hooks/useLitellmUser";
import { useQuery } from "@tanstack/react-query";
import { adminRepository } from "@/data/repositories/adminRepository";
import { AppSidebar } from "./AppSidebar";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AppLayout = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  useLitellmUser();

  useEffect(() => {
    checkAuth();
  }, []);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => adminRepository.checkIsAdmin(),
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b border-border/50 px-4 sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
            <SidebarTrigger />
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/chat")}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            )}
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
