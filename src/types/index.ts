export type ProjectStatus = 'Active' | 'Review' | 'Pending' | 'Done';
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue';
export type TaskStatus = 'Todo' | 'InProgress' | 'Review' | 'Done';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  deadline: string;
  color: string;
  desc?: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  projects: number;
  value: number;
  color: string;
  initials?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  num: string;
  client: string;
  amount: number;
  date: string;
  due: string;
  status: InvoiceStatus;
  desc: string;
  gst?: boolean;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  due: string;
  status: TaskStatus;
}

export interface UserSettings {
  name: string;
  profession: string;
  email: string;
  location: string;
  rate: number;
  biz: string;
  gst: string;
  bank: string;
  prefix: string;
}

export interface ActivityItem {
  id?: string;
  text: string;
  time: string;
  color: string;
}

export interface Payment {
  id: string;
  txId: string;
  invoiceNum: string;
  client: string;
  amount: number;
  date: string;
  method: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

