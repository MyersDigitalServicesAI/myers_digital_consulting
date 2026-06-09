export interface Tenant {
  id: string;
  company_name: string;
  slug: string;
  status: "onboarding" | "active" | "paused";
  plan: string | null;
  paid: boolean;
  approved_by_admin: boolean;
  contact_email: string | null;
  contact_name: string | null;
  created_at: string;
}

export interface TenantMember {
  tenant_id: string;
  user_id: string;
  role: string;
}

export interface IntakeResponse {
  id: string;
  tenant_id: string;
  answers: OnboardingFormData;
  departments: string[];
  submitted_at: string;
}

export interface SOP {
  id: string;
  tenant_id: string;
  department: string;
  title: string | null;
  body: { content: string; [key: string]: unknown };
  status: "draft" | "approved" | "failed";
  generated_at: string;
}

export interface CompanyProfile {
  tenant_id: string;
  summary: string | null;
  positioning: string | null;
  biggest_leverage: string | null;
  generated_at: string;
}

export interface WorkspaceStatus {
  tenant_id: string;
  notion_workspace: boolean;
  databases_built: boolean;
  ghl_configured: boolean;
  zapier_core_active: boolean;
  agents_configured: boolean;
  voice_training_complete: boolean;
  system_test_passed: boolean;
  go_live_confirmed: boolean;
  intake_submitted_at: string | null;
  sops_generated_at: string | null;
  updated_at: string;
}

export interface OnboardingFormData {
  // Business
  businessName: string;
  ownerName: string;
  website: string;
  industry: string;
  monthlyRevenue: string;
  teamSize: string;
  // Tools
  hasGhl: boolean;
  currentCrmTools: string;
  hasNotion: boolean;
  zapierMakeStatus: string;
  // Operations
  biggestTimeWasters: string;
  contentCadence: string;
  usesCallRecording: boolean;
  runsPaidAds: boolean;
  // Voice
  communicationStyle: string[];
  contentExamples: string;
  avoidPhrases: string;
  // Clients
  servicesOffered: string;
  packagesAndPricing: string;
  deliveryTimeline: string;
  topComplaints: string;
  // Access
  notionInviteConfirmed: boolean;
  zapierInviteConfirmed: boolean;
  extraNotes: string;
  // Departments selected
  departments: string[];
}

export interface PortalMeResponse {
  tenant: Tenant;
  member: TenantMember;
  workspaceStatus: WorkspaceStatus | null;
  companyProfile: CompanyProfile | null;
  intakeSubmitted: boolean;
}

export interface AdminProvisionRequest {
  companyName: string;
  contactEmail: string;
  contactName: string;
  plan: "starter" | "growth" | "full_stack";
}

export interface AdminProvisionResponse {
  tenantId: string;
  slug: string;
  joinUrl: string;
  token: string;
}
