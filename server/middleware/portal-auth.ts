import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin, isSupabaseConfigured } from "../lib/supabase-admin.ts";

export interface PortalRequest extends Request {
  portalUserId: string;
  portalTenantId: string;
  portalRole: string;
}

export async function portalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!isSupabaseConfigured()) {
    res
      .status(503)
      .json({ error: "Portal not configured — SUPABASE_SERVICE_ROLE_KEY missing" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  const { data: member, error: memberErr } = await supabaseAdmin
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", data.user.id)
    .single();

  if (memberErr || !member) {
    res.status(403).json({ error: "No portal access — account not linked to a tenant" });
    return;
  }

  const r = req as PortalRequest;
  r.portalUserId = data.user.id;
  r.portalTenantId = member.tenant_id as string;
  r.portalRole = member.role as string;
  next();
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.PORTAL_ADMIN_SECRET;
  if (!secret) {
    res.status(503).json({ error: "Admin portal not configured" });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (provided !== secret) {
    res.status(401).json({ error: "Invalid admin secret" });
    return;
  }
  next();
}
