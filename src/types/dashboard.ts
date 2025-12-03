// Dashboard and Lead types

export interface DashboardSummary {
  total_leads: number;
  by_status: Record<string, number>;
  by_master_status: Record<string, number>;
  followups_due_now: number;
  followups_due_today: number;
  new_leads_last_24h: number;
}

export interface LeadRow {
  id: number;
  meta_lead_id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  status: string;
  master_status: string;
  average_score: number;
  persona_fit: number;
  activation_fit: number;
  intent_score: number;
  ad_id: number;
  ad_name: string;
  where: string;
  what_matters: string;
  experience_with_technology: string;
  last_contact_timestamp: string;
  next_followup_timestamp: string;
}

export interface DashboardPayload {
  updated_at: string;
  summary: DashboardSummary;
  leads: LeadRow[];
}

export interface LeadDetail extends LeadRow {
  conversation_history: string;
}

export interface AuthSession {
  authenticated: boolean;
  expiresAt?: number;
}
