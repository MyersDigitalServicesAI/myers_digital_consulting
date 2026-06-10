import { supabase } from "./supabase";
import type {
  PortalMeResponse,
  SOP,
  WorkspaceStatus,
  OnboardingFormData,
  AdminProvisionRequest,
  AdminProvisionResponse,
  AdminOverviewResponse,
} from "@shared/portal.types";
import type {
  BillingInterval,
  BillingStatusResponse,
  CheckoutSessionResponse,
  PlanKey,
  PortalSessionResponse,
} from "@shared/billing";

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`/api/portal${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const portalApi = {
  me(): Promise<PortalMeResponse> {
    return apiFetch("/me");
  },

  validateToken(token: string): Promise<{
    valid: boolean;
    tenantId: string;
    companyName: string;
    contactEmail: string;
  }> {
    return apiFetch(`/validate-token?token=${encodeURIComponent(token)}`);
  },

  linkAccount(
    joinToken: string
  ): Promise<{ linked: boolean; tenantId?: string }> {
    return apiFetch("/link-account", {
      method: "POST",
      body: JSON.stringify({ joinToken }),
    });
  },

  submitOnboarding(data: OnboardingFormData): Promise<{ success: boolean }> {
    return apiFetch("/onboarding/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listSops(): Promise<{ sops: Omit<SOP, "body">[] }> {
    return apiFetch("/sops");
  },

  getSop(id: string): Promise<{ sop: SOP }> {
    return apiFetch(`/sops/${id}`);
  },

  workspaceStatus(): Promise<{ workspaceStatus: WorkspaceStatus | null }> {
    return apiFetch("/workspace-status");
  },

  billingStatus(): Promise<BillingStatusResponse> {
    return apiFetch("/billing/status");
  },

  createCheckout(
    plan: PlanKey,
    interval: BillingInterval
  ): Promise<CheckoutSessionResponse> {
    return apiFetch("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan, interval }),
    });
  },

  createBillingPortalSession(): Promise<PortalSessionResponse> {
    return apiFetch("/billing/portal-session", { method: "POST" });
  },

  adminOverview(adminSecret: string): Promise<AdminOverviewResponse> {
    return apiFetch("/admin/overview", {
      headers: { "x-admin-secret": adminSecret },
    });
  },

  adminProvision(
    data: AdminProvisionRequest,
    adminSecret: string
  ): Promise<AdminProvisionResponse> {
    return apiFetch("/admin/provision", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "x-admin-secret": adminSecret },
    });
  },

  adminUpdateWorkspace(
    tenantId: string,
    updates: Partial<WorkspaceStatus>,
    adminSecret: string
  ): Promise<{ success: boolean }> {
    return apiFetch(`/admin/workspace/${tenantId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
      headers: { "x-admin-secret": adminSecret },
    });
  },
};
