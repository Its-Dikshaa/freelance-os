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

// Authentication API
export async function apiSignup(data: {
  name: string;
  email: string;
  password?: string;
  profession?: string;
  studio?: string;
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
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    return await res.json();
  } catch {
    return project as Project;
  }
}

export async function apiUpdateProject(id: string, project: Partial<Project>): Promise<Project> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    return await res.json();
  } catch {
    return project as Project;
  }
}

export async function apiDeleteProject(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error(err);
  }
}

// Tasks
export async function apiGetTasks(): Promise<Task[]> {
  return fetchWithFallback<Task[]>(`${API_BASE_URL}/tasks`, []);
}

export async function apiCreateTask(task: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return await res.json();
  } catch {
    return task as Task;
  }
}

export async function apiUpdateTask(id: string, task: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    return await res.json();
  } catch {
    return task as Task;
  }
}

export async function apiDeleteTask(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error(err);
  }
}

// Clients
export async function apiGetClients(): Promise<Client[]> {
  return fetchWithFallback<Client[]>(`${API_BASE_URL}/clients`, []);
}

export async function apiCreateClient(client: Partial<Client>): Promise<Client> {
  try {
    const res = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(client),
    });
    return await res.json();
  } catch {
    return client as Client;
  }
}

export async function apiDeleteClient(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error(err);
  }
}

// Invoices
export async function apiGetInvoices(): Promise<Invoice[]> {
  return fetchWithFallback<Invoice[]>(`${API_BASE_URL}/invoices`, []);
}

export async function apiCreateInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoice),
    });
    return await res.json();
  } catch {
    return invoice as Invoice;
  }
}

export async function apiUpdateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoice),
    });
    return await res.json();
  } catch {
    return invoice as Invoice;
  }
}

// Payments
export async function apiGetPayments(): Promise<Payment[]> {
  return fetchWithFallback<Payment[]>(`${API_BASE_URL}/payments`, []);
}

export async function apiCreatePayment(payment: Partial<Payment>): Promise<Payment> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payment),
    });
    return await res.json();
  } catch {
    return payment as Payment;
  }
}
