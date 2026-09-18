import { Project, Client, Invoice, Task, UserSettings, ActivityItem, Payment } from '@/types';

export const K = {
  p: 'fos_p',
  c: 'fos_c',
  i: 'fos_i',
  t: 'fos_t',
  s: 'fos_s',
  a: 'fos_a',
  g: 'fos_g',
  ob: 'fos_user_onboarded'
};

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function ld<T>(k: string, def: T): T {
  if (typeof window === 'undefined') return def;
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function sv<T>(k: string, v: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const COLS = ['#3d5a4c', '#c4623a', '#4a7fa5', '#c9963e', '#7a5c8a', '#4e7360', '#a05050', '#5a7a4e'];

export function rc(): string {
  return COLS[Math.floor(Math.random() * COLS.length)];
}

export function ini(n: string): string {
  return (n || '')
    .split(' ')
    .map(w => w[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

export function fm(n: number): string {
  n = Number(n || 0);
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
  return '₹' + n;
}

export function fmF(n: number): string {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export const defaultProjects: Project[] = [
  { id: 'p1', name: 'FreightAxis CRM', client: 'LogiTech Ltd', status: 'Active', progress: 68, budget: 85000, deadline: '2024-03-30', color: '#3d5a4c', desc: 'Full CRM for freight forwarding' },
  { id: 'p2', name: 'BrokerPad Redesign', client: 'BrokerPad Inc', status: 'Review', progress: 90, budget: 55000, deadline: '2024-02-28', color: '#c4623a', desc: 'Complete UI redesign' },
  { id: 'p3', name: 'PawPulse App', client: 'PetWorld Pvt', status: 'Active', progress: 45, budget: 40000, deadline: '2024-04-15', color: '#4a7fa5', desc: 'Pet health tracking app' },
  { id: 'p4', name: 'LuxPay Dashboard', client: 'LuxFinance', status: 'Active', progress: 30, budget: 70000, deadline: '2024-05-01', color: '#c9963e', desc: 'Finance platform dashboard' },
  { id: 'p5', name: 'Ease Well Portal', client: 'HealthFirst', status: 'Pending', progress: 10, budget: 30000, deadline: '2024-04-30', color: '#7a5c8a', desc: 'Healthcare UX design' },
  { id: 'p6', name: 'AgriRent Platform', client: 'AgriCo', status: 'Done', progress: 100, budget: 45000, deadline: '2024-01-31', color: '#4e7360', desc: 'Equipment rental marketplace' },
];

export const defaultClients: Client[] = [
  { id: 'c1', name: 'LogiTech Ltd', industry: 'Logistics', email: 'contact@logitech.com', phone: '9876543210', projects: 2, value: 145000, color: '#3d5a4c', initials: 'LT', notes: 'Long term client' },
  { id: 'c2', name: 'BrokerPad Inc', industry: 'Real Estate', email: 'hello@brokerpad.io', phone: '9812345678', projects: 1, value: 55000, color: '#c4623a', initials: 'BP', notes: '' },
  { id: 'c3', name: 'PetWorld Pvt', industry: 'Pet Care', email: 'info@petworld.in', phone: '9898989898', projects: 1, value: 40000, color: '#4a7fa5', initials: 'PW', notes: '' },
  { id: 'c4', name: 'LuxFinance', industry: 'FinTech', email: 'design@luxfinance.com', phone: '9000000001', projects: 2, value: 110000, color: '#c9963e', initials: 'LF', notes: '' },
  { id: 'c5', name: 'HealthFirst', industry: 'Healthcare', email: 'ux@healthfirst.in', phone: '9111111111', projects: 1, value: 30000, color: '#7a5c8a', initials: 'HF', notes: '' },
  { id: 'c6', name: 'AgriCo', industry: 'Agriculture', email: 'ops@agrico.in', phone: '9222222222', projects: 1, value: 45000, color: '#4e7360', initials: 'AC', notes: '' },
];

export const defaultInvoices: Invoice[] = [
  { id: 'i1', num: 'INV-001', client: 'LogiTech Ltd', amount: 42500, date: '2024-01-15', due: '2024-02-15', status: 'Paid', desc: 'FreightAxis CRM - Phase 1', gst: true },
  { id: 'i2', num: 'INV-002', client: 'BrokerPad Inc', amount: 27500, date: '2024-01-22', due: '2024-02-22', status: 'Paid', desc: 'BrokerPad Redesign - UI', gst: true },
  { id: 'i3', num: 'INV-003', client: 'LuxFinance', amount: 35000, date: '2024-02-01', due: '2024-03-01', status: 'Unpaid', desc: 'LuxPay Dashboard - Prototype', gst: false },
  { id: 'i4', num: 'INV-004', client: 'PetWorld Pvt', amount: 20000, date: '2024-02-10', due: '2024-03-10', status: 'Unpaid', desc: 'PawPulse - UX Research', gst: false },
  { id: 'i5', num: 'INV-005', client: 'HealthFirst', amount: 15000, date: '2024-01-05', due: '2024-02-05', status: 'Overdue', desc: 'Ease Well - Discovery Phase', gst: false },
  { id: 'i6', num: 'INV-006', client: 'AgriCo', amount: 45000, date: '2023-12-20', due: '2024-01-20', status: 'Paid', desc: 'AgriRent - Complete Design', gst: true },
];

export const defaultTasks: Task[] = [
  { id: 't1', title: 'Wireframes for CRM Leads', project: 'FreightAxis CRM', due: '2026-09-25', status: 'Todo' },
  { id: 't2', title: 'Color system finalization', project: 'LuxPay Dashboard', due: '2026-09-28', status: 'Todo' },
  { id: 't3', title: 'Prototype interactions', project: 'BrokerPad Redesign', due: '2026-09-14', status: 'InProgress' },
  { id: 't4', title: 'User flow diagram', project: 'PawPulse App', due: '2026-09-30', status: 'InProgress' },
  { id: 't5', title: 'Client feedback review', project: 'FreightAxis CRM', due: '2026-09-12', status: 'Review' },
  { id: 't6', title: 'Final handoff docs', project: 'AgriRent Platform', due: '2026-09-20', status: 'Done' },
  { id: 't7', title: 'Competitive analysis', project: 'Ease Well Portal', due: '2026-10-02', status: 'Todo' },
  { id: 't8', title: 'Component library', project: 'BrokerPad Redesign', due: '2026-09-26', status: 'InProgress' },
];

export const defaultPayments: Payment[] = [
  { id: 'pay1', txId: 'TXN-882910', invoiceNum: 'INV-001', client: 'LogiTech Ltd', amount: 42500, date: '2024-01-15', method: 'Direct Transfer', status: 'Completed' },
  { id: 'pay2', txId: 'TXN-773821', invoiceNum: 'INV-002', client: 'BrokerPad Inc', amount: 27500, date: '2024-01-22', method: 'UPI', status: 'Completed' },
  { id: 'pay3', txId: 'TXN-661922', invoiceNum: 'INV-006', client: 'AgriCo', amount: 45000, date: '2023-12-20', method: 'Direct Transfer', status: 'Completed' },
];

export const defaultSettings: UserSettings = {
  name: 'Diksha Jangra',
  profession: 'UI/UX Designer',
  email: 'diksha@example.com',
  location: 'Abohar, Punjab, India',
  rate: 1500,
  biz: 'Diksha Design Studio',
  gst: '',
  bank: 'diksha@upi',
  prefix: 'INV'
};

export const defaultActivity: ActivityItem[] = [];

