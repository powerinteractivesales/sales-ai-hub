// API utility functions
import type { DashboardPayload, LeadDetail } from '@/types/dashboard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// MOCK MODE - Set to false to use real API
const USE_MOCK_DATA = false;

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export async function login(password: string): Promise<{ token: string }> {
  // Use the anon key directly for auth - bypasses JWT verification requirement
  if (password === 'wizjow-robzy6-havrYz') {
    return { token: SUPABASE_ANON_KEY };
  }

  throw new Error('Invalid password');
}

export async function fetchDashboard(): Promise<DashboardPayload> {
  if (USE_MOCK_DATA) {
    return {
      updated_at: new Date().toISOString(),
      summary: {
        total_leads: 12,
        by_status: {
          "follow up 1": 4,
          "follow up 2": 5,
          "qualified": 3
        },
        by_master_status: {
          "Warm Lead": 7,
          "Hot Lead": 3,
          "Cold Lead": 2
        },
        by_country: {
          "UAE": 10,
          "KSA": 2
        },
        by_lead_source: {
          "Meta": 8,
          "Website": 4
        },
        followups_due_now: 2,
        followups_due_this_week: 5,
        new_leads_last_24h: 3,
        new_leads_last_7_days: 8,
        new_leads_last_30_days: 12,
        total_leads_with_replies: 9,
        response_rate: 75,
        hot_leads_count: 3,
        qualified_leads_count: 3,
        dead_leads_count: 0,
        conversion_rate: 50,
        dead_lead_rate: 0,
        avg_lead_score: 8.3,
        avg_persona_fit: 8.8,
        avg_activation_fit: 8.3,
        avg_intent_score: 7.8,
        total_meta_leads: 8
      },
      leads: [
        {
          id: 1,
          meta_lead_id: "1234567890",
          name: "John Smith",
          email: "john.smith@example.com",
          company: "Tech Corp",
          phone: "+971501234567",
          country: "UAE",
          status: "follow up 1",
          master_status: "Warm Lead",
          average_score: 7.5,
          persona_fit: 8.0,
          activation_fit: 7.5,
          intent_score: 7.0,
          ad_id: 123456,
          ad_name: "Campaign A",
          where: "shopping_malls",
          what_matters: "best_quality",
          experience_with_technology: "Experienced",
          last_contact_timestamp: "2025-12-02T10:30:00Z",
          next_followup_timestamp: "2025-12-04T14:00:00Z"
        },
        {
          id: 2,
          meta_lead_id: "2345678901",
          name: "Sarah Johnson",
          email: "sarah.j@company.com",
          company: "Digital Solutions",
          phone: "+971509876543",
          country: "UAE",
          status: "follow up 2",
          master_status: "Hot Lead",
          average_score: 8.5,
          persona_fit: 9.0,
          activation_fit: 8.5,
          intent_score: 8.0,
          ad_id: 123457,
          ad_name: "Campaign B",
          where: "office_buildings",
          what_matters: "fastest_delivery",
          experience_with_technology: "Very Experienced",
          last_contact_timestamp: "2025-12-01T15:20:00Z",
          next_followup_timestamp: "2025-12-03T10:00:00Z"
        },
        {
          id: 3,
          meta_lead_id: "3456789012",
          name: "Ahmed Al Maktoum",
          email: "ahmed@enterprise.ae",
          company: "Emirates Innovations",
          phone: "+971502345678",
          country: "UAE",
          status: "qualified",
          master_status: "Hot Lead",
          average_score: 9.0,
          persona_fit: 9.5,
          activation_fit: 9.0,
          intent_score: 8.5,
          ad_id: 123458,
          ad_name: "Premium Campaign",
          where: "corporate_events",
          what_matters: "premium_service",
          experience_with_technology: "Expert",
          last_contact_timestamp: "2025-12-03T09:00:00Z",
          next_followup_timestamp: "2025-12-03T16:00:00Z"
        }
      ]
    };
  }
  return apiFetch('/dashboard');
}

export async function fetchLead(id: number): Promise<LeadDetail> {
  if (USE_MOCK_DATA) {
    const mockLeads: Record<number, LeadDetail> = {
      1: {
        id: 1,
        meta_lead_id: "1234567890",
        name: "John Smith",
        email: "john.smith@example.com",
        company: "Tech Corp",
        phone: "+971501234567",
        country: "UAE",
        status: "follow up 1",
        master_status: "Warm Lead",
        average_score: 7.5,
        persona_fit: 8.0,
        activation_fit: 7.5,
        intent_score: 7.0,
        ad_id: 123456,
        ad_name: "Campaign A",
        where: "shopping_malls",
        what_matters: "best_quality",
        experience_with_technology: "Experienced",
        last_contact_timestamp: "2025-12-02T10:30:00Z",
        next_followup_timestamp: "2025-12-04T14:00:00Z",
        conversation_history: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Email Thread</h3>
            <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-left: 3px solid #007bff;">
              <strong>From:</strong> Sales Team &lt;sales@company.com&gt;<br>
              <strong>To:</strong> John Smith &lt;john.smith@example.com&gt;<br>
              <strong>Date:</strong> Dec 2, 2025 10:30 AM<br>
              <strong>Subject:</strong> Following up on your interest<br><br>
              <p>Hi John,</p>
              <p>Thank you for your interest in our solutions. I wanted to follow up and see if you had any questions about our proposal.</p>
              <p>Best regards,<br>Sales Team</p>
            </div>
            <div style="margin: 10px 0; padding: 10px; background: #e8f4f8; border-left: 3px solid #28a745;">
              <strong>From:</strong> John Smith &lt;john.smith@example.com&gt;<br>
              <strong>To:</strong> Sales Team &lt;sales@company.com&gt;<br>
              <strong>Date:</strong> Dec 1, 2025 3:15 PM<br>
              <strong>Subject:</strong> Re: Your inquiry<br><br>
              <p>Hi,</p>
              <p>Thanks for reaching out. I'm interested in learning more about your premium packages. Could you send me more details?</p>
              <p>Thanks,<br>John</p>
            </div>
          </div>
        `
      },
      2: {
        id: 2,
        meta_lead_id: "2345678901",
        name: "Sarah Johnson",
        email: "sarah.j@company.com",
        company: "Digital Solutions",
        phone: "+971509876543",
        country: "UAE",
        status: "follow up 2",
        master_status: "Hot Lead",
        average_score: 8.5,
        persona_fit: 9.0,
        activation_fit: 8.5,
        intent_score: 8.0,
        ad_id: 123457,
        ad_name: "Campaign B",
        where: "office_buildings",
        what_matters: "fastest_delivery",
        experience_with_technology: "Very Experienced",
        last_contact_timestamp: "2025-12-01T15:20:00Z",
        next_followup_timestamp: "2025-12-03T10:00:00Z",
        conversation_history: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Email Thread</h3>
            <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-left: 3px solid #007bff;">
              <strong>From:</strong> Sales Team<br>
              <strong>Date:</strong> Dec 1, 2025 3:20 PM<br>
              <strong>Subject:</strong> Proposal for Digital Solutions<br><br>
              <p>Hi Sarah,</p>
              <p>Attached is our proposal tailored to your needs. Looking forward to discussing this further!</p>
            </div>
          </div>
        `
      },
      3: {
        id: 3,
        meta_lead_id: "3456789012",
        name: "Ahmed Al Maktoum",
        email: "ahmed@enterprise.ae",
        company: "Emirates Innovations",
        phone: "+971502345678",
        country: "UAE",
        status: "qualified",
        master_status: "Hot Lead",
        average_score: 9.0,
        persona_fit: 9.5,
        activation_fit: 9.0,
        intent_score: 8.5,
        ad_id: 123458,
        ad_name: "Premium Campaign",
        where: "corporate_events",
        what_matters: "premium_service",
        experience_with_technology: "Expert",
        last_contact_timestamp: "2025-12-03T09:00:00Z",
        next_followup_timestamp: "2025-12-03T16:00:00Z",
        conversation_history: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Email Thread</h3>
            <div style="margin: 10px 0; padding: 10px; background: #e8f4f8; border-left: 3px solid #28a745;">
              <strong>From:</strong> Ahmed Al Maktoum<br>
              <strong>Date:</strong> Dec 3, 2025 9:00 AM<br>
              <strong>Subject:</strong> Ready to proceed<br><br>
              <p>Team,</p>
              <p>We've reviewed your proposal and are ready to move forward. Please send the contract.</p>
              <p>Best,<br>Ahmed</p>
            </div>
          </div>
        `
      }
    };

    return mockLeads[id] || mockLeads[1];
  }
  return apiFetch(`/leads?id=${id}`);
}

export async function refreshDashboard(): Promise<DashboardPayload> {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fetchDashboard();
  }
  return apiFetch('/refresh', { method: 'POST' });
}

export function isAuthenticated(): boolean {
  if (USE_MOCK_DATA) return true; // Bypass auth in mock mode

  const token = localStorage.getItem('auth_token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
}
