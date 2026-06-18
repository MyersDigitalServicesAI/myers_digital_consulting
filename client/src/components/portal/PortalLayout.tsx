import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  CreditCard,
  LogOut,
  Zap,
  ChevronRight,
} from "lucide-react";

// SOPs live as a tab inside the dashboard, so there's no standalone /portal/sops
// route to link to here (only /portal/sops/:id for a single SOP).
const NAV_ITEMS = [
  { path: "/portal/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/portal/billing", icon: CreditCard, label: "Billing" },
];

interface Props {
  children: ReactNode;
}

export function PortalLayout({ children }: Props) {
  const { me, signOut } = usePortalAuth();
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/50 flex flex-col py-5 px-3 hidden md:flex flex-shrink-0">
        <div className="flex items-center gap-2 px-2 mb-6">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-sm">AIOS Portal</span>
        </div>

        {me && (
          <div className="px-2 mb-4">
            <p className="text-xs font-medium truncate">{me.tenant.company_name}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {me.tenant.plan ?? "Client"}
            </p>
          </div>
        )}

        <Separator className="mb-3" />

        <nav className="space-y-0.5 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={[
                  "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors text-left",
                  isActive
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                ].join(" ")}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
            onClick={signOut}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden border-b border-border/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-sm">
              {me?.tenant.company_name ?? "AIOS Portal"}
            </span>
          </div>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden border-b border-border/50 px-4 py-2 flex gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={[
                  "flex items-center gap-1.5 text-sm pb-1 border-b-2 transition-colors",
                  isActive
                    ? "border-cyan-400 text-foreground"
                    : "border-transparent text-muted-foreground",
                ].join(" ")}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 p-5 md:p-7 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
