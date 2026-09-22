'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  Project, Client, Invoice, Task, Payment, UserSettings, ActivityItem, ProjectStatus, InvoiceStatus, TaskStatus
} from '@/types';
import {
  K, ld, sv, uid, rc, ini,
  defaultSettings, defaultActivity
} from '@/lib/storage';
import {
  apiGetProjects, apiGetClients, apiGetInvoices, apiGetTasks,
  apiCreateProject, apiUpdateProject, apiDeleteProject,
  apiCreateTask, apiUpdateTask, apiDeleteTask,
  apiCreateClient, apiUpdateClient, apiDeleteClient,
  apiCreateInvoice, apiUpdateInvoice, apiDeleteInvoice, apiUpdateUser,
  apiGetPayments, apiCreatePayment,
  apiCheckHealth, apiSeed,
  apiGetMe, getAuthToken, clearAuthToken
} from '@/lib/api';
import { toIsoDate, formatDisplayDate, isOverdue, getDaysDiff } from '@/lib/date-utils';
import { AlertTriangle, Clock } from 'lucide-react';

import { ToastProvider, useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Sidebar, PageId } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

import { DashboardView } from '@/components/dashboard/dashboard-view';
import { ProjectsView } from '@/components/projects/projects-view';
import { KanbanView } from '@/components/tasks/kanban-view';
import { ClientsView } from '@/components/clients/clients-view';
import { InvoicesView } from '@/components/invoices/invoices-view';
import { PaymentsView } from '@/components/payments/payments-view';
import { SettingsView } from '@/components/settings/settings-view';

// Avoids a hydration mismatch without setting state from an effect: renders
// `false` on the server and on the client's first (matching) pass, then `true`
// once mounted.
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function MainAppContent() {
  const { toast } = useToast();

  const isClient = useIsClient();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentPg, setCurrentPg] = useState<PageId>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Main data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [actLog, setActLog] = useState<ActivityItem[]>(() => ld(K.a, defaultActivity));
  const [goalTarget, setGoalTarget] = useState<number>(() => ld(K.g, 500000));

  // Modal states
  const [activeModal, setActiveModal] = useState<'project' | 'client' | 'invoice' | 'task' | null>(null);
  const [editId, setEditId] = useState<string | undefined>(undefined);

  // Modal Form Inputs
  const [formPName, setFormPName] = useState('');
  const [formPClient, setFormPClient] = useState('');
  const [formPStatus, setFormPStatus] = useState<ProjectStatus>('Active');
  const [formPProg, setFormPProg] = useState(0);
  const [formPBudget, setFormPBudget] = useState(50000);
  const [formPDeadline, setFormPDeadline] = useState('');
  const [formPDesc, setFormPDesc] = useState('');

  const [formCName, setFormCName] = useState('');
  const [formCInd, setFormCInd] = useState('');
  const [formCEmail, setFormCEmail] = useState('');
  const [formCPhone, setFormCPhone] = useState('');
  const [formCNotes, setFormCNotes] = useState('');

  const [formINum, setFormINum] = useState('');
  const [formIClient, setFormIClient] = useState('');
  const [formIAmt, setFormIAmt] = useState(25000);
  const [formIDate, setFormIDate] = useState('');
  const [formIDue, setFormIDue] = useState('');
  const [formIStatus, setFormIStatus] = useState<InvoiceStatus>('Unpaid');
  const [formIDesc, setFormIDesc] = useState('');

  const [formTTitle, setFormTTitle] = useState('');
  const [formTProject, setFormTProject] = useState('');
  const [formTStatus, setFormTStatus] = useState<TaskStatus>('Todo');
  const [formTDue, setFormTDue] = useState('');

  // Delete Confirm states
  const [confirmDeleteObj, setConfirmDeleteObj] = useState<{ type: 'project' | 'client' | 'invoice' | 'task'; id: string } | null>(null);

  const loadUserData = async () => {
    apiCheckHealth().then(setApiConnected);

    const token = getAuthToken();
    if (!token) {
      setIsOnboarded(false);
      setProjects([]);
      setClients([]);
      setInvoices([]);
      setTasks([]);
      setPayments([]);
      return;
    }

    try {
      const userMe = await apiGetMe();
      if (!userMe) {
        clearAuthToken();
        setIsOnboarded(false);
        setProjects([]);
        setClients([]);
        setInvoices([]);
        setTasks([]);
        setPayments([]);
        return;
      }

      setSettings(userMe);
      setIsOnboarded(true);

      const [apiP, apiC, apiI, apiT, apiPay] = await Promise.all([
        apiGetProjects(),
        apiGetClients(),
        apiGetInvoices(),
        apiGetTasks(),
        apiGetPayments()
      ]);

      setProjects(apiP || []);
      setClients(apiC || []);
      setInvoices(apiI || []);
      setTasks(apiT || []);
      setPayments(apiPay || []);
    } catch (err) {
      console.warn('[FreelanceOS] Auth check failed:', err);
      setIsOnboarded(false);
    }
  };

  useEffect(() => {
    // Textbook fetch-on-mount; this rule appears to misfire on async functions
    // defined outside the effect in this canary eslint-plugin-react-hooks build.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUserData();
  }, []);

  const addActivity = (text: string, color = '#3d5a4c') => {
    const updated = [{ text, time: 'Just now', color }, ...actLog];
    if (updated.length > 20) updated.pop();
    setActLog(updated);
    sv(K.a, updated);
  };

  const getNextInvoiceNum = () => {
    const maxNum = invoices
      .map(i => parseInt(i.num.replace(/\D/g, '')) || 0)
      .reduce((a, b) => Math.max(a, b), 0);
    return `${settings.prefix || 'INV'}-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Open Creation / Editing Modals
  const handleOpenModal = (type: 'project' | 'client' | 'invoice' | 'task', id?: string, extraStatus?: TaskStatus) => {
    setActiveModal(type);
    setEditId(id);

    if (type === 'project') {
      const item = projects.find(p => p.id === id) || {
        name: '', client: clients[0]?.name || '', status: 'Active' as ProjectStatus, progress: 0, budget: 50000, deadline: '', desc: ''
      };
      setFormPName(item.name);
      setFormPClient(item.client || (clients[0]?.name || ''));
      setFormPStatus(item.status);
      setFormPProg(item.progress);
      setFormPBudget(item.budget);
      setFormPDeadline(item.deadline);
      setFormPDesc(item.desc || '');
    } else if (type === 'client') {
      const item = clients.find(c => c.id === id) || { name: '', industry: '', email: '', phone: '', notes: '' };
      setFormCName(item.name);
      setFormCInd(item.industry);
      setFormCEmail(item.email);
      setFormCPhone(item.phone);
      setFormCNotes(item.notes || '');
    } else if (type === 'invoice') {
      const item = invoices.find(i => i.id === id) || {
        num: getNextInvoiceNum(),
        client: clients[0]?.name || '',
        amount: 25000,
        date: new Date().toISOString().slice(0, 10),
        due: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        status: 'Unpaid' as InvoiceStatus,
        desc: ''
      };
      setFormINum(item.num);
      setFormIClient(item.client || (clients[0]?.name || ''));
      setFormIAmt(item.amount);
      setFormIDate(item.date);
      setFormIDue(item.due);
      setFormIStatus(item.status);
      setFormIDesc(item.desc);
    } else if (type === 'task') {
      const item = tasks.find(t => t.id === id) || {
        title: '', project: projects[0]?.name || '', due: new Date().toISOString().slice(0, 10), status: extraStatus || 'Todo'
      };
      setFormTTitle(item.title);
      setFormTProject(item.project || (projects[0]?.name || ''));
      setFormTStatus(item.status);
      setFormTDue(toIsoDate(item.due || new Date().toISOString().slice(0, 10)));
    }
  };

  const handleSaveModal = () => {
    if (activeModal === 'project') {
      if (!formPName.trim()) {
        toast('Project name is required', 'error');
        return;
      }
      if (editId) {
        const itemToUpdate = { name: formPName, client: formPClient, status: formPStatus, progress: formPProg, budget: formPBudget, deadline: formPDeadline, desc: formPDesc };
        const updated = projects.map(p => p.id === editId ? { ...p, ...itemToUpdate } : p);
        setProjects(updated);
        sv(K.p, updated);
        apiUpdateProject(editId, itemToUpdate).catch(err => toast(err.message || 'Failed to sync project update', 'error'));
      } else {
        const newProj: Project = {
          id: uid(), name: formPName, client: formPClient, status: formPStatus, progress: formPProg, budget: formPBudget, deadline: formPDeadline, desc: formPDesc, color: rc()
        };
        const updated = [newProj, ...projects];
        setProjects(updated);
        sv(K.p, updated);
        apiCreateProject(newProj).catch(err => toast(err.message || 'Failed to sync new project', 'error'));
        addActivity(`New project created: ${formPName}`);
      }
    } else if (activeModal === 'client') {
      if (!formCName.trim()) {
        toast('Client name is required', 'error');
        return;
      }
      if (editId) {
        const itemToUpdate = { name: formCName, industry: formCInd, email: formCEmail, phone: formCPhone, notes: formCNotes };
        const updated = clients.map(c => c.id === editId ? { ...c, ...itemToUpdate } : c);
        setClients(updated);
        sv(K.c, updated);
        apiUpdateClient(editId, itemToUpdate).catch(err => toast(err.message || 'Failed to sync client update', 'error'));
      } else {
        const newClient: Client = {
          id: uid(), name: formCName, industry: formCInd, email: formCEmail, phone: formCPhone, notes: formCNotes, projects: 0, value: 0, color: rc(), initials: ini(formCName)
        };
        const updated = [newClient, ...clients];
        setClients(updated);
        sv(K.c, updated);
        apiCreateClient(newClient).catch(err => toast(err.message || 'Failed to sync new client', 'error'));
        addActivity(`New client added: ${formCName}`, '#c4623a');
      }
    } else if (activeModal === 'invoice') {
      if (!formINum.trim()) {
        toast('Invoice number is required', 'error');
        return;
      }
      if (editId) {
        const itemToUpdate = { num: formINum, client: formIClient, amount: formIAmt, date: formIDate, due: formIDue, status: formIStatus, desc: formIDesc };
        const updated = invoices.map(i => i.id === editId ? { ...i, ...itemToUpdate } : i);
        setInvoices(updated);
        sv(K.i, updated);
        apiUpdateInvoice(editId, itemToUpdate).catch(err => toast(err.message || 'Failed to sync invoice update', 'error'));
      } else {
        const newInv: Invoice = {
          id: uid(), num: formINum, client: formIClient, amount: formIAmt, date: formIDate, due: formIDue, status: formIStatus, desc: formIDesc
        };
        const updated = [newInv, ...invoices];
        setInvoices(updated);
        sv(K.i, updated);
        apiCreateInvoice(newInv).catch(err => toast(err.message || 'Failed to sync new invoice', 'error'));
        addActivity(`Invoice ${formINum} generated for ${formIClient}`, '#c9963e');
      }
    } else if (activeModal === 'task') {
      if (!formTTitle.trim()) {
        toast('Task title is required', 'error');
        return;
      }
      if (editId) {
        const itemToUpdate = { title: formTTitle, project: formTProject, status: formTStatus, due: formTDue };
        const updated = tasks.map(t => t.id === editId ? { ...t, ...itemToUpdate } : t);
        setTasks(updated);
        sv(K.t, updated);
        apiUpdateTask(editId, itemToUpdate).catch(err => toast(err.message || 'Failed to sync task update', 'error'));
      } else {
        const newTask: Task = {
          id: uid(), title: formTTitle, project: formTProject, status: formTStatus, due: formTDue
        };
        const updated = [newTask, ...tasks];
        setTasks(updated);
        sv(K.t, updated);
        apiCreateTask(newTask).catch(err => toast(err.message || 'Failed to sync new task', 'error'));
      }
    }

    setActiveModal(null);
    toast(`${activeModal ? activeModal.charAt(0).toUpperCase() + activeModal.slice(1) : 'Item'} saved & synced with Express API!`);
  };

  // Delete Action
  const handleExecDelete = () => {
    if (!confirmDeleteObj) return;
    const { type, id } = confirmDeleteObj;

    if (type === 'project') {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      sv(K.p, updated);
      apiDeleteProject(id).catch(err => toast(err.message || 'Failed to sync project deletion', 'error'));
    } else if (type === 'client') {
      const updated = clients.filter(c => c.id !== id);
      setClients(updated);
      sv(K.c, updated);
      apiDeleteClient(id).catch(err => toast(err.message || 'Failed to sync client deletion', 'error'));
    } else if (type === 'invoice') {
      const updated = invoices.filter(i => i.id !== id);
      setInvoices(updated);
      sv(K.i, updated);
      apiDeleteInvoice(id).catch(err => toast(err.message || 'Failed to sync invoice deletion', 'error'));
    } else if (type === 'task') {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      sv(K.t, updated);
      apiDeleteTask(id).catch(err => toast(err.message || 'Failed to sync task deletion', 'error'));
    }

    setConfirmDeleteObj(null);
    toast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
  };

  const handleMarkPaid = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const updated = invoices.map(i => i.id === id ? { ...i, status: 'Paid' as InvoiceStatus } : i);
    setInvoices(updated);
    sv(K.i, updated);
    apiUpdateInvoice(id, { status: 'Paid' })
      .then(() => apiCreatePayment({
        invoiceNum: inv.num,
        client: inv.client,
        amount: inv.amount,
        date: new Date().toISOString().slice(0, 10),
        method: 'Direct Transfer',
        status: 'Completed'
      }))
      .then(newPayment => setPayments(prev => [newPayment, ...prev]))
      .catch(err => toast(err.message || 'Failed to sync invoice payment status', 'error'));
    addActivity(`Invoice ${inv.num} marked as Paid — ₹${inv.amount.toLocaleString('en-IN')}`, '#3d5a4c');
    toast(`Invoice ${inv.num} marked as Paid!`);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const updated = tasks.map(x => x.id === taskId ? { ...x, status: newStatus } : x);
    setTasks(updated);
    sv(K.t, updated);
    apiUpdateTask(taskId, { status: newStatus }).catch(err => toast(err.message || 'Failed to sync task status', 'error'));
    addActivity(`Task "${t.title}" moved to ${newStatus}`, '#4a7fa5');
    toast(`Task moved to ${newStatus}`);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    sv(K.s, newSettings);
    apiUpdateUser(newSettings);
  };

  const handleExportJSON = () => {
    const data = { projects, clients, invoices, tasks, settings, actLog, goalTarget };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FreelanceOS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('Data exported to JSON!');
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset all data to defaults? This replaces all your projects, tasks, clients and invoices with sample data.')) return;
    try {
      await apiSeed();
      localStorage.removeItem(K.p);
      localStorage.removeItem(K.c);
      localStorage.removeItem(K.i);
      localStorage.removeItem(K.t);
      await loadUserData();
      toast('Workspace reset to default sample data!');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to reset workspace', 'error');
    }
  };

  const handleOnboardingComplete = async () => {
    setIsOnboarded(true);
    await loadUserData();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of FreelanceOS?')) {
      clearAuthToken();
      localStorage.removeItem(K.ob);
      localStorage.removeItem(K.p);
      localStorage.removeItem(K.c);
      localStorage.removeItem(K.i);
      localStorage.removeItem(K.t);
      localStorage.removeItem(K.s);
      sessionStorage.clear();
      setProjects([]);
      setClients([]);
      setInvoices([]);
      setTasks([]);
      setSettings(defaultSettings);
      setIsOnboarded(false);
      toast('Logged out successfully!');
    }
  };

  if (!isClient) return null;

  if (!isOnboarded) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex min-h-screen relative">
      <Sidebar
        currentPg={currentPg}
        onNavigate={setCurrentPg}
        userName={settings.name || 'Diksha J.'}
        userRole={settings.profession || 'UI/UX Designer'}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      <div className="md:ml-[220px] flex-1 flex flex-col min-h-screen relative">
        <Topbar
          currentPg={currentPg}
          onOpenMobile={() => setIsOpenMobile(true)}
          searchText={searchText}
          onSearchChange={setSearchText}
          onQuickAdd={() => {
            if (currentPg === 'dashboard' || currentPg === 'projects') handleOpenModal('project');
            else if (currentPg === 'tasks') handleOpenModal('task');
            else if (currentPg === 'clients') handleOpenModal('client');
            else if (currentPg === 'invoices') handleOpenModal('invoice');
          }}
          apiConnected={apiConnected}
        />

        <main className="p-6 sm:p-7 flex-1">
          {currentPg === 'dashboard' && (
            <DashboardView
              projects={projects}
              clients={clients}
              invoices={invoices}
              tasks={tasks}
              settings={settings}
              actLog={actLog}
              goalTarget={goalTarget}
              onUpdateGoal={val => {
                setGoalTarget(val);
                sv(K.g, val);
              }}
              onNavigate={setCurrentPg}
              onOpenModal={handleOpenModal}
              searchText={searchText}
            />
          )}

          {currentPg === 'projects' && (
            <ProjectsView
              projects={projects}
              onOpenModal={handleOpenModal}
              onConfirmDelete={(type, id) => setConfirmDeleteObj({ type, id })}
              searchText={searchText}
            />
          )}

          {currentPg === 'tasks' && (
            <KanbanView
              tasks={tasks}
              onUpdateStatus={handleUpdateTaskStatus}
              onOpenModal={handleOpenModal}
              onConfirmDelete={(type, id) => setConfirmDeleteObj({ type, id })}
              searchText={searchText}
            />
          )}

          {currentPg === 'clients' && (
            <ClientsView
              clients={clients}
              onOpenModal={handleOpenModal}
              onConfirmDelete={(type, id) => setConfirmDeleteObj({ type, id })}
              searchText={searchText}
            />
          )}

          {currentPg === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              clients={clients}
              settings={settings}
              onMarkPaid={handleMarkPaid}
              onOpenModal={handleOpenModal}
              onConfirmDelete={(type, id) => setConfirmDeleteObj({ type, id })}
              searchText={searchText}
            />
          )}

          {currentPg === 'payments' && (
            <PaymentsView
              payments={payments}
              invoices={invoices}
              searchText={searchText}
              onViewInvoice={() => {
                setCurrentPg('invoices');
              }}
            />
          )}

          {currentPg === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onShowOnboarding={() => {
                localStorage.removeItem(K.ob);
                setIsOnboarded(false);
              }}
              onExportJSON={handleExportJSON}
              onResetAll={handleResetAll}
              onLogout={handleLogout}
              apiConnected={apiConnected}
            />
          )}
        </main>
      </div>

      {/* DYNAMIC FORMS MODAL */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'project' ? (editId ? 'Edit Project' : 'New Project') :
          activeModal === 'client' ? (editId ? 'Edit Client' : 'New Client') :
          activeModal === 'invoice' ? (editId ? 'Edit Invoice' : 'New Invoice') :
          activeModal === 'task' ? (editId ? 'Edit Task' : 'New Task') : ''
        }
        onSave={handleSaveModal}
      >
        {activeModal === 'project' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Project Name *</label>
              <input
                type="text"
                value={formPName}
                onChange={e => setFormPName(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Client *</label>
              <select
                value={formPClient}
                onChange={e => setFormPClient(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none cursor-pointer"
              >
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={formPStatus}
                  onChange={e => setFormPStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Review">In Review</option>
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formPProg}
                  onChange={e => setFormPProg(Number(e.target.value))}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={formPBudget}
                  onChange={e => setFormPBudget(Number(e.target.value))}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Deadline</label>
                <input
                  type="date"
                  value={formPDeadline}
                  onChange={e => setFormPDeadline(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Description</label>
              <textarea
                value={formPDesc}
                onChange={e => setFormPDesc(e.target.value)}
                rows={3}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] p-3 text-[13px] outline-none resize-y font-sans-outfit"
              />
            </div>
          </div>
        )}

        {activeModal === 'client' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Client Name *</label>
              <input
                type="text"
                value={formCName}
                onChange={e => setFormCName(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Industry</label>
              <input
                type="text"
                value={formCInd}
                onChange={e => setFormCInd(e.target.value)}
                placeholder="Logistics / FinTech / Real Estate"
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  value={formCEmail}
                  onChange={e => setFormCEmail(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Phone</label>
                <input
                  type="text"
                  value={formCPhone}
                  onChange={e => setFormCPhone(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Notes</label>
              <textarea
                value={formCNotes}
                onChange={e => setFormCNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] p-3 text-[13px] outline-none resize-y font-sans-outfit"
              />
            </div>
          </div>
        )}

        {activeModal === 'invoice' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Invoice #</label>
                <input
                  type="text"
                  value={formINum}
                  onChange={e => setFormINum(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={formIStatus}
                  onChange={e => setFormIStatus(e.target.value as InvoiceStatus)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Client *</label>
              <select
                value={formIClient}
                onChange={e => setFormIClient(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none cursor-pointer"
              >
                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={formIAmt}
                onChange={e => setFormIAmt(Number(e.target.value))}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formIDate}
                  onChange={e => setFormIDate(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Due Date</label>
                <input
                  type="date"
                  value={formIDue}
                  onChange={e => setFormIDue(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Description / Deliverable</label>
              <input
                type="text"
                value={formIDesc}
                onChange={e => setFormIDesc(e.target.value)}
                placeholder="Design Services / Phase 1"
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
          </div>
        )}

        {activeModal === 'task' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Task Title *</label>
              <input
                type="text"
                value={formTTitle}
                onChange={e => setFormTTitle(e.target.value)}
                placeholder="e.g. Wireframe redesign"
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#2c2825]"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Project</label>
              <select
                value={formTProject}
                onChange={e => setFormTProject(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none cursor-pointer focus:border-[#2c2825]"
              >
                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={formTStatus}
                  onChange={e => setFormTStatus(e.target.value as TaskStatus)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none cursor-pointer focus:border-[#2c2825]"
                >
                  <option value="Todo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Due Date</label>
                <input
                  type="date"
                  value={toIsoDate(formTDue)}
                  onChange={e => setFormTDue(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none cursor-pointer font-sans-outfit text-[#2c2825] focus:border-[#2c2825]"
                />
              </div>
            </div>

            {isOverdue(formTDue) && formTStatus !== 'Done' && (
              <div className="bg-[#c4623a]/10 border border-[#c4623a]/30 text-[#c4623a] rounded-[10px] p-3 text-[12px] font-medium flex items-center gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#c4623a]" />
                <div>
                  <strong>Overdue Task:</strong> Due date was {formatDisplayDate(formTDue)} ({getDaysDiff(formTDue).days} days ago).
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      {confirmDeleteObj && (
        <div
          className="fixed inset-0 bg-[#2c2825]/45 z-[600] flex items-center justify-center backdrop-blur-md p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setConfirmDeleteObj(null);
          }}
        >
          <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-7 w-full max-w-[340px] text-center shadow-2xl animate-fade-up">
            <div className="text-3xl mb-3">🗑</div>
            <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825] mb-1">
              Delete {confirmDeleteObj.type}?
            </h3>
            <p className="text-[12.5px] text-[#b5a898] mb-5">This action cannot be undone.</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDeleteObj(null)}
                className="flex-1 py-2.5 border border-[#e8e1d7] rounded-[9px] text-[12.5px] font-medium text-[#4a4440] hover:bg-[#f0ebe3]"
              >
                Cancel
              </button>
              <button
                onClick={handleExecDelete}
                className="flex-1 py-2.5 bg-[#c4623a] text-white rounded-[9px] text-[12.5px] font-medium hover:bg-[#c4623a]/90 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
