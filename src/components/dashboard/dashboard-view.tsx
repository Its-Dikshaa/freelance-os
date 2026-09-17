'use client';

import React, { useState } from 'react';
import { Project, Client, Invoice, Task, UserSettings, ActivityItem } from '@/types';
import { fm, fmF } from '@/lib/storage';
import { ArrowUpRight, TrendingUp, TrendingDown, Clock, Plus, CheckCircle, FileText, UserPlus, FolderPlus } from 'lucide-react';
import { PageId } from '../layout/sidebar';

interface DashboardViewProps {
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  tasks: Task[];
  settings: UserSettings;
  actLog: ActivityItem[];
  goalTarget: number;
  onUpdateGoal: (newGoal: number) => void;
  onNavigate: (pg: PageId) => void;
  onOpenModal: (type: 'project' | 'client' | 'invoice' | 'task') => void;
  searchText: string;
}

export function DashboardView({
  projects,
  clients,
  invoices,
  tasks,
  settings,
  actLog,
  goalTarget,
  onUpdateGoal,
  onNavigate,
  onOpenModal,
  searchText
}: DashboardViewProps) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalTarget.toString());

  // Greeting logic
  const hour = new Date().getHours();
  const greetingWord = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (settings.name || 'Diksha').trim().split(' ')[0];

  const activeProjectsCount = projects.filter(p => p.status !== 'Done').length;
  const openTasksCount = tasks.filter(t => t.status !== 'Done').length;
  const awaitingInvoicesCount = invoices.filter(i => i.status !== 'Paid').length;

  const totalEarned = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);
  const outstanding = invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);

  // Filter Active Projects
  let activeProjects = projects.filter(p => p.status !== 'Done');
  if (searchText) {
    activeProjects = activeProjects.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.client.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  activeProjects = activeProjects.slice(0, 4);

  // Revenue chart mock values
  const baseAvg = (invoices.reduce((a, i) => a + Number(i.amount), 0) / 6) || 40000;
  const monthlyRevenue = [0.5, 0.68, 0.6, 0.8, 0.72, 0.95].map(multiplier => Math.round(multiplier * baseAvg));
  const maxRevenue = Math.max(...monthlyRevenue, 1);
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString('en-IN', { month: 'short' });
  });

  // Upcoming Deadlines (merged projects + tasks)
  const projectDeadlines = projects
    .filter(p => p.status !== 'Done' && p.deadline)
    .map(p => ({ title: p.name, sub: p.client, date: p.deadline, color: p.color, sortKey: p.deadline, type: 'projects' as PageId }));

  const taskDeadlines = tasks
    .filter(t => t.status !== 'Done')
    .map(t => ({ title: t.title, sub: t.project || 'General', date: t.due || 'Soon', color: '#4a7fa5', sortKey: t.due || 'zzz', type: 'tasks' as PageId }));

  let mergedDeadlines = [...projectDeadlines, ...taskDeadlines].sort((a, b) =>
    String(a.sortKey).localeCompare(String(b.sortKey))
  );
  if (searchText) {
    mergedDeadlines = mergedDeadlines.filter(m =>
      m.title.toLowerCase().includes(searchText.toLowerCase()) ||
      m.sub.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  mergedDeadlines = mergedDeadlines.slice(0, 5);

  // Invoice Health Donut data
  const paidVal = invoices.filter(i => i.status === 'Paid').reduce((a, i) => a + Number(i.amount), 0);
  const unpVal = invoices.filter(i => i.status === 'Unpaid').reduce((a, i) => a + Number(i.amount), 0);
  const ovdVal = invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + Number(i.amount), 0);
  const totalInvoiceVal = paidVal + unpVal + ovdVal || 1;
  const pPaid = (paidVal / totalInvoiceVal) * 100;
  const pUnp = (unpVal / totalInvoiceVal) * 100;

  // Top Clients
  let topClients = [...clients].sort((a, b) => (b.value || 0) - (a.value || 0));
  if (searchText) {
    topClients = topClients.filter(c =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchText.toLowerCase())
    );
  }
  topClients = topClients.slice(0, 4);

  // Goal calculation
  const goalPercentage = Math.min(100, Math.round((totalEarned / (goalTarget || 1)) * 100));

  const handleSaveGoal = () => {
    const val = Number(goalInput);
    if (!isNaN(val) && val > 0) {
      onUpdateGoal(val);
      setEditingGoal(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-playfair text-[22px] font-medium text-[#2c2825]">
            {greetingWord}, <span className="text-[#3d5a4c]">{firstName}</span> 👋
          </h1>
          <p className="text-[12.5px] text-[#7a706a] mt-1">
            {activeProjectsCount} active project{activeProjectsCount !== 1 ? 's' : ''} · {openTasksCount} open task{openTasksCount !== 1 ? 's' : ''} · {awaitingInvoicesCount} invoice{awaitingInvoicesCount !== 1 ? 's' : ''} awaiting payment
          </p>
        </div>
        <div className="text-[11.5px] text-[#b5a898] bg-white border border-[#e8e1d7] px-3.5 py-1.5 rounded-full self-start sm:self-auto shadow-xs">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 w-[70px] h-[70px] rounded-bl-[70px] bg-[#3d5a4c]/7 opacity-45 pointer-events-none" />
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Active Projects</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{activeProjectsCount}</div>
          <div className="text-[11px] text-[#4e7360] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ↑ {projects.length} total
          </div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 w-[70px] h-[70px] rounded-bl-[70px] bg-[#c9963e]/7 opacity-45 pointer-events-none" />
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Total Earned</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{fm(totalEarned)}</div>
          <div className="text-[11px] text-[#4e7360] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ↑ From invoices
          </div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 w-[70px] h-[70px] rounded-bl-[70px] bg-[#c4623a]/7 opacity-45 pointer-events-none" />
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Outstanding</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{fm(outstanding)}</div>
          <div className="text-[11px] text-[#c4623a] mt-2 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> ↓ {awaitingInvoicesCount} pending
          </div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 w-[70px] h-[70px] rounded-bl-[70px] bg-[#4a7fa5]/7 opacity-45 pointer-events-none" />
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Total Clients</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{clients.length}</div>
          <div className="text-[11px] text-[#4e7360] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> ↑ All time
          </div>
        </div>
      </div>

      {/* Row 2: Active Projects & Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Projects List */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Active Projects</h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-[11.5px] px-2.5 py-1 border border-[#e8e1d7] rounded-[9px] hover:bg-[#f0ebe3] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.length === 0 ? (
              <div className="text-center py-8 text-[#b5a898] text-[13px]">No active projects found</div>
            ) : (
              activeProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects')}
                  className="flex items-center gap-2.5 p-2.5 hover:bg-[#f7f4ef] rounded-[10px] cursor-pointer transition-colors border-b border-[#f0ebe3] last:border-none"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#2c2825] truncate">{p.name}</div>
                    <div className="text-[11px] text-[#b5a898] mb-1 truncate">{p.client}</div>
                    <div className="w-full bg-[#e8e1d7] rounded-full h-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-semibold text-[#3d5a4c]">{fm(p.budget)}</div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3d5a4c]/10 text-[#3d5a4c]">
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Overview Chart */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Revenue Overview</h3>
            <span className="text-[11.5px] text-[#b5a898]">Last 6 months</span>
          </div>

          <div className="flex items-end gap-2 h-[100px] mt-4 pt-2">
            {monthlyRevenue.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  className="w-full rounded-t-[5px] bg-[#c4d8cc] group-hover:bg-[#4e7360] transition-all relative cursor-pointer min-h-[4px]"
                  style={{ height: `${(val / maxRevenue) * 80}%` }}
                >
                  <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2c2825] text-[#f7f4ef] text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10 shadow-md">
                    {monthLabels[idx]}: {fm(val)}
                  </div>
                </div>
                <span className="text-[9.5px] text-[#b5a898]">{monthLabels[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Upcoming Deadlines & Invoice Health Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        {/* Upcoming Deadlines */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Upcoming Deadlines</h3>
            <span className="text-[11.5px] text-[#b5a898]">{mergedDeadlines.length} upcoming</span>
          </div>

          <div className="space-y-2">
            {mergedDeadlines.length === 0 ? (
              <div className="text-center py-6 text-[#b5a898] text-[13px]">No deadlines coming up</div>
            ) : (
              mergedDeadlines.map((d, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate(d.type)}
                  className="flex items-center gap-3 p-2.5 rounded-[9px] hover:bg-[#f7f4ef] cursor-pointer transition-colors border-b border-[#f0ebe3] last:border-none"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-medium text-[#2c2825] truncate">{d.title}</div>
                    <div className="text-[11px] text-[#b5a898] truncate">{d.sub}</div>
                  </div>
                  <div className="text-[11px] font-semibold text-[#4a4440] bg-[#f0ebe3] px-2.5 py-1 rounded-full whitespace-nowrap">
                    {d.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Invoice Health Donut Chart */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Invoice Health</h3>
            <button
              onClick={() => onNavigate('payments')}
              className="text-[11.5px] px-2.5 py-1 border border-[#e8e1d7] rounded-[9px] hover:bg-[#f0ebe3] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center relative shrink-0 shadow-inner"
              style={{
                background: `conic-gradient(#3d5a4c 0% ${pPaid}%, #c9963e ${pPaid}% ${pPaid + pUnp}%, #c4623a ${pPaid + pUnp}% 100%)`
              }}
            >
              <div className="absolute inset-3.5 bg-white rounded-full flex flex-col items-center justify-center text-center shadow-xs">
                <span className="font-serif-playfair text-[17px] font-semibold text-[#2c2825]">{Math.round(pPaid)}%</span>
                <span className="text-[9px] text-[#b5a898] uppercase tracking-wider">Collected</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3d5a4c]" />
                <span className="flex-1 text-[#4a4440]">Paid</span>
                <span className="font-semibold text-[#2c2825]">{fm(paidVal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c9963e]" />
                <span className="flex-1 text-[#4a4440]">Unpaid</span>
                <span className="font-semibold text-[#2c2825]">{fm(unpVal)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#c4623a]" />
                <span className="flex-1 text-[#4a4440]">Overdue</span>
                <span className="font-semibold text-[#2c2825]">{fm(ovdVal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {actLog.slice(0, 5).map((a, idx) => (
              <div key={idx} className="flex gap-3 items-start pb-2.5 border-b border-[#f0ebe3] last:border-none">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: a.color }} />
                <div className="flex-1 text-[12.5px] text-[#4a4440]">{a.text}</div>
                <div className="text-[10.5px] text-[#b5a898] shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Top Clients</h3>
            <button
              onClick={() => onNavigate('clients')}
              className="text-[11.5px] px-2.5 py-1 border border-[#e8e1d7] rounded-[9px] hover:bg-[#f0ebe3] transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topClients.map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-[#f0ebe3] last:border-none">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center font-serif-playfair text-[14px] font-medium shrink-0"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  {c.initials || c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#2c2825] truncate">{c.name}</div>
                  <div className="text-[11px] text-[#b5a898] truncate">{c.industry}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-[#2c2825]">{fmF(c.value)}</div>
                  <div className="text-[10px] text-[#b5a898]">{c.projects || 1} proj</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Earnings Goal Card */}
      <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif-playfair text-[15px] font-medium text-[#2c2825]">Earnings Goal</h3>
          <button
            onClick={() => setEditingGoal(!editingGoal)}
            className="text-[11.5px] px-3 py-1 border border-[#e8e1d7] rounded-[9px] hover:bg-[#f0ebe3] transition-colors"
          >
            {editingGoal ? 'Cancel' : 'Edit goal'}
          </button>
        </div>

        {editingGoal ? (
          <div className="flex gap-2 max-w-sm">
            <input
              type="number"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              className="bg-[#f7f4ef] border border-[#e8e1d7] rounded-[9px] px-3 py-1.5 text-[13px] outline-none flex-1"
            />
            <button
              onClick={handleSaveGoal}
              className="bg-[#2c2825] text-white px-4 py-1.5 rounded-[9px] text-[12.5px] font-medium hover:bg-[#4a4440]"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="font-serif-playfair text-[19px] text-[#2c2825]">
            <b className="text-[#3d5a4c]">{fmF(totalEarned)}</b> of {fmF(goalTarget)}
          </div>
        )}

        <div className="w-full bg-[#f0ebe3] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c4d8cc] to-[#3d5a4c] transition-all duration-700"
            style={{ width: `${goalPercentage}%` }}
          />
        </div>
        <div className="text-[11px] text-[#b5a898]">
          {goalPercentage}% of {fmF(goalTarget)} goal reached
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 flex-wrap pt-2">
          <button
            onClick={() => onOpenModal('project')}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4440] bg-[#f7f4ef] border border-[#e8e1d7] px-3 py-2 rounded-[9px] hover:bg-[#f0ebe3] transition-all"
          >
            <FolderPlus className="w-4 h-4 text-[#3d5a4c]" /> New Project
          </button>
          <button
            onClick={() => onOpenModal('invoice')}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4440] bg-[#f7f4ef] border border-[#e8e1d7] px-3 py-2 rounded-[9px] hover:bg-[#f0ebe3] transition-all"
          >
            <FileText className="w-4 h-4 text-[#c9963e]" /> New Invoice
          </button>
          <button
            onClick={() => onOpenModal('client')}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4440] bg-[#f7f4ef] border border-[#e8e1d7] px-3 py-2 rounded-[9px] hover:bg-[#f0ebe3] transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#c4623a]" /> New Client
          </button>
          <button
            onClick={() => onOpenModal('task')}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#4a4440] bg-[#f7f4ef] border border-[#e8e1d7] px-3 py-2 rounded-[9px] hover:bg-[#f0ebe3] transition-all"
          >
            <CheckCircle className="w-4 h-4 text-[#4a7fa5]" /> New Task
          </button>
        </div>
      </div>
    </div>
  );
}
