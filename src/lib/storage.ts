import { UserSettings, ActivityItem } from '@/types';

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

