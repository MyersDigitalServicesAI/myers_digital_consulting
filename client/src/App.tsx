import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PortalAuthProvider } from "./contexts/PortalAuthContext";
import { PortalGuard } from "./components/portal/PortalGuard";
import Home from "./pages/Home";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalJoin from "./pages/portal/PortalJoin";
import AuthCallback from "./pages/portal/AuthCallback";
import Onboarding from "./pages/portal/Onboarding";
import Dashboard from "./pages/portal/Dashboard";
import SopViewer from "./pages/portal/SopViewer";
import Billing from "./pages/portal/Billing";
import Admin from "./pages/portal/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Portal — public */}
      <Route path="/portal/login" component={PortalLogin} />
      <Route path="/portal/join" component={PortalJoin} />
      <Route path="/portal/auth/callback" component={AuthCallback} />

      {/* Admin — authenticated by PORTAL_ADMIN_SECRET, not Supabase */}
      <Route path="/portal/admin" component={Admin} />

      {/* Portal — protected */}
      <Route path="/portal/onboarding">
        <PortalGuard>
          <Onboarding />
        </PortalGuard>
      </Route>
      <Route path="/portal/dashboard">
        <PortalGuard>
          <Dashboard />
        </PortalGuard>
      </Route>
      <Route path="/portal/sops/:id">
        <PortalGuard>
          <SopViewer />
        </PortalGuard>
      </Route>
      <Route path="/portal/billing">
        <PortalGuard>
          <Billing />
        </PortalGuard>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <PortalAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <Analytics />
          </TooltipProvider>
        </PortalAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
