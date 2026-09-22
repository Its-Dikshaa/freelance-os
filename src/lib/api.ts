import { Project, Task, Client, Invoice, Payment, UserSettings } from '@/types';
import { defaultSettings } from './storage';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fos_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fos_token', token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fos_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiCheckHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

// Replaces the current user's workspace with the default sample data.
export async function apiSeed(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/seed`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset workspace');
  return data;
}

// Authentication API
export async function apiSignup(data: {
  name: string;
  email: string;
  password?: string;
  profession?: string;
  biz?: string;
  location?: string;
  hourlyRate?: number;
  currency?: string;
  gst?: string;
  bank?: string;
  prefix?: string;
}): Promise<{ token: string; user: UserSettings }> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Signup failed');
  }

  setAuthToken(resData.token);
  return resData;
}

export async function apiLogin(email: string, password?: string): Promise<{ token: string; user: UserSettings }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Invalid login credentials');
  }

  setAuthToken(resData.token);
  return resData;
}

export async function apiGetMe(): Promise<UserSettings | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  const token = getAuthToken();
  if (!token) return fallbackData;

  try {
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Client] Endpoint ${url} unreachable. Using fallback.`, err);
    return fallbackData;
  }
}

// User Profile
export async function apiGetUser(): Promise<UserSettings> {
  const me = await apiGetMe();
  if (me) return me;
  return fetchWithFallback<UserSettings>(`${API_BASE_URL}/user`, defaultSettings);
}

export async function apiUpdateUser(user: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/user`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
  } catch {
    return user as UserSettings;
  }
}

// Projects
export async function apiGetProjects(): Promise<Project[]> {
  return fetchWithFallback<Project[]>(`${API_BASE_URL}/projects`, []);
}

export async function apiCreateProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create project');
  return data;
}

export async function apiUpdateProject(id: string, project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update project');
  return data;
}

export async function apiDeleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete project');
  }
}

// Tasks
export async function apiGetTasks(): Promise<Task[]> {
  return fetchWithFallback<Task[]>(`${API_BASE_URL}/tasks`, []);
}

export async function apiCreateTask(task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create task');
  return data;
}

export async function apiUpdateTask(id: string, task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update task');
  return data;
}

export async function apiDeleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete task');
  }
}

// Clients
export async function apiGetClients(): Promise<Client[]> {
  return fetchWithFallback<Client[]>(`${API_BASE_URL}/clients`, []);
}

export async function apiCreateClient(client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create client');
  return data;
}

export async function apiUpdateClient(id: string, client: Partial<Client>): Promise<Client> {
  const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update client');
  return data;
}

export async function apiDeleteClient(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete client');
  }
}

// Invoices
export async function apiGetInvoices(): Promise<Invoice[]> {
  return fetchWithFallback<Invoice[]>(`${API_BASE_URL}/invoices`, []);
}

export async function apiCreateInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  const res = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoice),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create invoice');
  return data;
}

export async function apiUpdateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoice),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update invoice');
  return data;
}

export async function apiDeleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete invoice');
  }
}

// Payments
export async function apiGetPayments(): Promise<Payment[]> {
  return fetchWithFallback<Payment[]>(`${API_BASE_URL}/payments`, []);
}

export async function apiCreatePayment(payment: Partial<Payment>): Promise<Payment> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payment),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to record payment');
  return data;
}
