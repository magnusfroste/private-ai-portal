import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { AppLayout } from "./views/Layout/AppLayout";
import { DashboardActivity } from "./views/Dashboard/DashboardActivity";
import { LogsPage } from "./views/Logs/LogsPage";
import { CreditsPage } from "./views/Credits/CreditsPage";
import { AccountPage } from "./views/Account/AccountPage";
import { KeysPage } from "./views/Keys/KeysPage";
import { AdminPage } from "./views/Admin/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<DashboardActivity />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="keys" element={<KeysPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          {/* Redirect old routes */}
          <Route path="/account" element={<Navigate to="/dashboard/account" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
