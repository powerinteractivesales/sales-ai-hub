// Dashboard and Lead types

export interface DashboardSummary {
  total_leads: number;
  by_status: Record<string, number>;
  by_master_status: Record<string, number>;
  by_country: Record<string, number>;
  by_lead_source: Record<string, number>;

  // Follow-up metrics
  followups_due_now: number;
  followups_due_this_week: number;

  // New leads tracking
  new_leads_last_24h: number;
  new_leads_last_7_days: number;
  new_leads_last_30_days: number;

  // Engagement metrics
  total_leads_with_replies: number;
  response_rate: number;

  // Lead quality metrics
  hot_leads_count: number;
  qualified_leads_count: number;
  dead_leads_count: number;
  conversion_rate: number;
  dead_lead_rate: number;

  // Score metrics (Meta leads only)
  avg_lead_score: number;
  avg_persona_fit: number;
  avg_activation_fit: number;
  avg_intent_score: number;
  total_meta_leads: number;
}

export interface ConversationMessage {
  role: 'ai' | 'customer' | 'human_initial' | 'followup';
  content: string;
  timestamp: string;
  messageType?: 'initial_outreach' | 'reply' | 'customer_reply' | 'form_response' | 'followup_1' | 'followup_2' | 'followup_3' | 'followup_4';
  source?: 'meta' | 'website';
}

export interface LeadRow {
  id: number | string; // number for Meta leads, UUID string for Website leads
  meta_lead_id: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  country: string | null;
  status: string;
  master_status: string;
  average_score: number | null;
  persona_fit: number | null;
  activation_fit: number | null;
  intent_score: number | null;
  ad_id: number | null;
  ad_name: string | null;
  where: string | null;
  what_matters: string | null;
  experience_with_technology: string | null;
  business_type: string | null;
  goal_with_technology: string | null;
  timeline: string | null;
  last_contact_timestamp: string | null;
  next_followup_timestamp: string | null;
  created_at?: string | null; // Creation timestamp
  lead_source?: string; // 'Meta' or 'Website'
  initial_message?: string | null; // For website leads
  assigned_to?: string | null;
  assign_webhook_url?: string; // Webhook URL for lead assignment
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
