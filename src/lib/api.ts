import { Project, Task, Client, Invoice, Payment, UserSettings } from '@/types';
import { defaultProjects, defaultTasks, defaultClients, defaultInvoices, defaultPayments, defaultSettings } from './storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Client] Endpoint ${url} unreachable. Using local fallback.`, err);
    return fallbackData;
  }
}

// User Profile
export async function apiGetUser(): Promise<UserSettings> {
  return fetchWithFallback<UserSettings>(`${API_BASE_URL}/user`, defaultSettings);
}

export async function apiUpdateUser(user: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const res = await fetch(`${API_BASE_URL}/user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
  return fetchWithFallback<Project[]>(`${API_BASE_URL}/projects`, defaultProjects);
}

export async function apiCreateProject(project: Partial<Project>): Promise<Project> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    return await res.json();
  } catch {
    return project as Project;
  }
}

export async function apiDeleteProject(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
}

// Tasks
export async function apiGetTasks(): Promise<Task[]> {
  return fetchWithFallback<Task[]>(`${API_BASE_URL}/tasks`, defaultTasks);
}

export async function apiCreateTask(task: Partial<Task>): Promise<Task> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return await res.json();
  } catch {
    return task as Task;
  }
}

export async function apiDeleteTask(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
}

// Clients
export async function apiGetClients(): Promise<Client[]> {
  return fetchWithFallback<Client[]>(`${API_BASE_URL}/clients`, defaultClients);
}

export async function apiCreateClient(client: Partial<Client>): Promise<Client> {
  try {
    const res = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    return await res.json();
  } catch {
    return client as Client;
  }
}

export async function apiDeleteClient(id: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/clients/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
}

// Invoices
export async function apiGetInvoices(): Promise<Invoice[]> {
  return fetchWithFallback<Invoice[]>(`${API_BASE_URL}/invoices`, defaultInvoices);
}

export async function apiCreateInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  try {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    return await res.json();
  } catch {
    return invoice as Invoice;
  }
}

// Payments
export async function apiGetPayments(): Promise<Payment[]> {
  return fetchWithFallback<Payment[]>(`${API_BASE_URL}/payments`, defaultPayments);
}

export async function apiCreatePayment(payment: Partial<Payment>): Promise<Payment> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return await res.json();
  } catch {
    return payment as Payment;
  }
}

// Database Seed Call
export async function apiSeedDatabase(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/seed`, { method: 'POST' });
  return await res.json();
}
