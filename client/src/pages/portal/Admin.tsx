import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  DollarSign,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { portalApi } from "@/lib/portal-api";
import { PLANS, PLAN_KEYS, type PlanKey } from "@shared/billing";
import type {
  AdminOverviewResponse,
  AdminProvisionResponse,
  AdminTenantOverview,
  WorkspaceStatus,
} from "@shared/portal.types";

const SECRET_KEY = "aios_admin_secret";

const STATUS_BADGES: Record<string, string> = {
  onboarding: "bg-cyan-400/15 text-cyan-400",
  active: "bg-emerald-400/15 text-emerald-400",
  paused: "bg-red-400/15 text-red-400",
};

const WORKSPACE_CHECKS: Array<{ key: keyof WorkspaceStatus; label: string }> = [
  { key: "notion_workspace", label: "Notion workspace" },
  { key: "databases_built", label: "Databases built" },
  { key: "ghl_configured", label: "GHL configured" },
  { key: "zapier_core_active", label: "Zapier core active" },
  { key: "agents_configured", label: "Agents configured" },
  { key: "voice_training_complete", label: "Voice training" },
  { key: "system_test_passed", label: "System test passed" },
  { key: "go_live_confirmed", label: "Go-live confirmed" },
];

export default function Admin() {
  const [secret, setSecret] = useState(
    () => sessionStorage.getItem(SECRET_KEY) ?? ""
  );
  const [unlocked, setUnlocked] = useState(false);
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    try {
      const data = await portalApi.adminOverview(s);
      setOverview(data);
      setUnlocked(true);
      sessionStorage.setItem(SECRET_KEY, s);
    } catch (err) {
      setUnlocked(false);
      sessionStorage.removeItem(SECRET_KEY);
      toast.error(
        err instanceof Error ? err.message : "Failed to load admin overview"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (secret) load(secret);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="w-4 h-4 text-cyan-400" /> AIOS Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === "Enter" && secret && load(secret)}
            />
            <Button
              className="w-full"
              disabled={!secret || loading}
              onClick={() => load(secret)}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Unlock"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AIOS Admin</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Clients, onboarding progress, and agent spend
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(secret)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>

        {overview && <SpendCards spend={overview.agentSpend} />}

        <ProvisionCard secret={secret} onProvisioned={() => load(secret)} />

        <div className="space-y-4">
          {overview?.tenants.map(t => (
            <TenantCard
              key={t.id}
              tenant={t}
              secret={secret}
              onChanged={() => load(secret)}
            />
          ))}
          {overview && overview.tenants.length === 0 && (
            <p className="text-muted-foreground text-sm">No clients yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SpendCards({ spend }: { spend: AdminOverviewResponse["agentSpend"] }) {
  const items = [
    { label: "Agent spend today", value: `$${spend.todayUsd.toFixed(2)}` },
    { label: "Spend (7 days)", value: `$${spend.weekUsd.toFixed(2)}` },
    { label: "Runs (7 days)", value: String(spend.runsThisWeek) },
    { label: "Failures (7 days)", value: String(spend.failuresThisWeek) },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(i => (
        <Card key={i.label}>
          <CardContent className="pt-4">
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {i.label}
            </p>
            <p className="text-lg font-bold mt-1">{i.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProvisionCard({
  secret,
  onProvisioned,
}: {
  secret: string;
  onProvisioned: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [plan, setPlan] = useState<PlanKey>("starter");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AdminProvisionResponse | null>(null);

  async function provision() {
    setBusy(true);
    setResult(null);
    try {
      const r = await portalApi.adminProvision(
        { companyName, contactName, contactEmail, plan },
        secret
      );
      setResult(r);
      toast.success(
        r.emailSent
          ? `Invite emailed to ${contactEmail}`
          : "Client created — email not configured, copy the invite link below"
      );
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      onProvisioned();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Provisioning failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="w-4 h-4 text-cyan-400" /> New client
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Company name</Label>
            <Input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Acme Consulting"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contact name</Label>
            <Input
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contact email</Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
              placeholder="jane@acme.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Select value={plan} onValueChange={v => setPlan(v as PlanKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_KEYS.map(k => (
                  <SelectItem key={k} value={k}>
                    {PLANS[k].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={provision}
          disabled={busy || !companyName || !contactEmail}
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          Create & invite
        </Button>

        {result && (
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm space-y-1">
            <p className="flex items-center gap-2">
              {result.emailSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Invite emailed
                </>
              ) : (
                <span className="text-amber-400">
                  Email not sent — share this link manually:
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs break-all text-cyan-400">
                {result.joinUrl}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(result.joinUrl);
                  toast.success("Copied");
                }}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TenantCard({
  tenant,
  secret,
  onChanged,
}: {
  tenant: AdminTenantOverview;
  secret: string;
  onChanged: () => void;
}) {
  const ws = tenant.workspaceStatus;
  const done = ws ? WORKSPACE_CHECKS.filter(c => ws[c.key]).length : 0;
  const [expanded, setExpanded] = useState(false);

  async function toggle(key: keyof WorkspaceStatus, value: boolean) {
    try {
      await portalApi.adminUpdateWorkspace(
        tenant.id,
        { [key]: value } as Partial<WorkspaceStatus>,
        secret
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <p className="font-semibold">{tenant.company_name}</p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {tenant.contact_email ?? "no contact"} ·{" "}
              {tenant.plan ?? "no plan"} · joined{" "}
              {new Date(tenant.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={
                STATUS_BADGES[tenant.status] ?? "bg-muted text-muted-foreground"
              }
            >
              {tenant.status}
            </Badge>
            {tenant.paid && (
              <Badge className="bg-emerald-400/15 text-emerald-400">paid</Badge>
            )}
            <span className="text-muted-foreground text-xs">
              {done}/{WORKSPACE_CHECKS.length} setup
            </span>
          </div>
        </div>

        {expanded && ws && (
          <div className="grid md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
            {WORKSPACE_CHECKS.map(c => (
              <label
                key={c.key}
                className="flex items-center justify-between text-sm py-1"
              >
                <span>{c.label}</span>
                <Switch
                  checked={Boolean(ws[c.key])}
                  onCheckedChange={v => toggle(c.key, v)}
                />
              </label>
            ))}
          </div>
        )}
        {expanded && !ws && (
          <p className="text-muted-foreground text-sm mt-4 pt-4 border-t border-border">
            No workspace status row for this tenant.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
