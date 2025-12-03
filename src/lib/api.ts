// API utility functions
import type { DashboardPayload, LeadDetail } from '@/types/dashboard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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
  return apiFetch('/auth', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function fetchDashboard(): Promise<DashboardPayload> {
  return apiFetch('/dashboard');
}

export async function fetchLead(id: number): Promise<LeadDetail> {
  return apiFetch(`/leads?id=${id}`);
}

export async function refreshDashboard(): Promise<DashboardPayload> {
  return apiFetch('/refresh', { method: 'POST' });
}

export function isAuthenticated(): boolean {
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
