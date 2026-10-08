'use client';

import React, { useState } from 'react';
import { Project, ProjectStatus, Task, Invoice } from '@/types';
import { fmF } from '@/lib/storage';
import { formatDisplayDate, isOverdue } from '@/lib/date-utils';
import { Edit2, Trash2, AlertTriangle, X, CheckCircle2, Clock, DollarSign, Calendar, User, Eye } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  tasks?: Task[];
  invoices?: Invoice[];
  onOpenModal: (type: 'project' | 'task' | 'invoice', id?: string) => void;
  onConfirmDelete: (type: 'project', id: string) => void;
  searchText: string;
}

export function ProjectsView({ projects, tasks = [], invoices = [], onOpenModal, onConfirmDelete, searchText }: ProjectsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  let list = [...projects];
  if (filterStatus !== 'all') {
    list = list.filter(p => p.status === filterStatus);
  }
  if (searchText) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.client.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const badgeStyles: Record<ProjectStatus, string> = {
    Active: 'bg-[#3d5a4c]/10 text-[#3d5a4c]',
    Review: 'bg-[#4a7fa5]/12 text-[#4a7fa5]',
    Pending: 'bg-[#c9963e]/12 text-[#c9963e]',
    Done: 'bg-[#b5a898]/18 text-[#b5a898]'
  };

  // Linked items for selected project drawer
  const linkedTasks = selectedProject ? tasks.filter(t => t.project?.toLowerCase() === selectedProject.name.toLowerCase()) : [];
  const linkedInvoices = selectedProject ? invoices.filter(i => i.client?.toLowerCase() === selectedProject.client.toLowerCase()) : [];

  return (
    <div className="space-y-4 animate-fade-up relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'Active', 'Review', 'Pending', 'Done'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 rounded-full text-[12px] cursor-pointer border transition-all ${
                filterStatus === tab
                  ? 'bg-[#2c2825] border-[#2c2825] text-[#f7f4ef] font-medium shadow-xs'
                  : 'bg-white border-[#e8e1d7] text-[#7a706a] hover:border-[#b5a898]'
              }`}
            >
              {tab === 'all' ? 'All Projects' : tab === 'Review' ? 'In Review' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#b5a898] border-b border-[#e8e1d7]">
              <th className="pb-3 px-3 font-semibold">Project</th>
              <th className="pb-3 px-3 font-semibold">Client</th>
              <th className="pb-3 px-3 font-semibold">Status</th>
              <th className="pb-3 px-3 font-semibold">Progress</th>
              <th className="pb-3 px-3 font-semibold">Budget</th>
              <th className="pb-3 px-3 font-semibold">Deadline</th>
              <th className="pb-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe3]">
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#b5a898] text-[13px]">
                  No projects match your current filter
                </td>
              </tr>
            ) : (
              list.map(p => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="hover:bg-[#f7f4ef]/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <strong className="text-[13px] text-[#2c2825] font-semibold group-hover:text-[#3d5a4c] transition-colors">
                          {p.name}
                        </strong>
                        {p.desc && <div className="text-[11px] text-[#b5a898] line-clamp-1">{p.desc}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[13px] text-[#4a4440] font-medium">{p.client}</td>
                  <td className="py-3.5 px-3">
                    <span className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${badgeStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#e8e1d7] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#7a706a]">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-[13px] font-semibold text-[#2c2825]">{fmF(p.budget)}</td>
                  <td className="py-3.5 px-3 text-[12px]">
                    {p.deadline ? (
                      isOverdue(p.deadline) && p.status !== 'Done' ? (
                        <span className="bg-[#c4623a]/12 text-[#c4623a] border border-[#c4623a]/30 text-[10.5px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Overdue • {formatDisplayDate(p.deadline, false)}
                        </span>
                      ) : (
                        <span className="text-[#4a4440]">{formatDisplayDate(p.deadline, false)}</span>
                      )
                    ) : (
                      <span className="text-[#b5a898]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="p-1.5 text-[#7a706a] hover:text-[#2c2825] hover:bg-[#f0ebe3] rounded-[7px] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenModal('project', p.id)}
                        className="p-1.5 text-[#7a706a] hover:text-[#2c2825] hover:bg-[#f0ebe3] rounded-[7px] transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete('project', p.id)}
                        className="p-1.5 text-[#c4623a] hover:bg-[#c4623a]/10 rounded-[7px] transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PROJECT DETAIL SLIDE-OVER DRAWER */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-[#2c2825]/40 z-[600] flex justify-end backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-[460px] bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between border-l border-[#e8e1d7] animate-slide-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#e8e1d7]">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                  <div>
                    <h2 className="font-serif-playfair text-[20px] font-semibold text-[#2c2825]">
                      {selectedProject.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[12px] text-[#7a706a] mt-0.5">
                      <User className="w-3.5 h-3.5 text-[#b5a898]" /> {selectedProject.client}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-[#b5a898] hover:text-[#2c2825] rounded-full hover:bg-[#f0ebe3] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Progress Card */}
              <div className="bg-[#f7f4ef] border border-[#e8e1d7] rounded-[14px] p-4 space-y-3">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#7a706a] font-medium">Status</span>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${badgeStyles[selectedProject.status]}`}>
                    {selectedProject.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11.5px] font-medium">
                    <span className="text-[#7a706a]">Project Progress</span>
                    <span className="text-[#2c2825] font-bold">{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-[#e8e1d7] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedProject.progress}%`, backgroundColor: selectedProject.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                <div className="bg-white border border-[#e8e1d7] p-3.5 rounded-[12px] space-y-1">
                  <div className="text-[10.5px] text-[#b5a898] uppercase font-bold tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#3d5a4c]" /> Budget
                  </div>
                  <div className="font-serif-playfair text-[17px] font-bold text-[#2c2825]">
                    {fmF(selectedProject.budget)}
                  </div>
                </div>
                <div className="bg-white border border-[#e8e1d7] p-3.5 rounded-[12px] space-y-1">
                  <div className="text-[10.5px] text-[#b5a898] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#c9963e]" /> Deadline
                  </div>
                  <div className="text-[13px] font-semibold text-[#2c2825] mt-1">
                    {selectedProject.deadline ? formatDisplayDate(selectedProject.deadline, false) : 'No deadline'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProject.desc && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] uppercase font-bold text-[#7a706a] tracking-wider">Description</h4>
                  <p className="text-[13px] text-[#4a4440] leading-relaxed bg-[#f7f4ef]/60 border border-[#e8e1d7] p-3.5 rounded-[12px]">
                    {selectedProject.desc}
                  </p>
                </div>
              )}

              {/* Linked Tasks */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] uppercase font-bold text-[#7a706a] tracking-wider">
                    Associated Tasks ({linkedTasks.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      onOpenModal('task');
                    }}
                    className="text-[11px] text-[#3d5a4c] font-semibold hover:underline"
                  >
                    + Add Task
                  </button>
                </div>
                {linkedTasks.length === 0 ? (
                  <div className="text-[12px] text-[#b5a898] italic py-2">No tasks linked to this project</div>
                ) : (
                  <div className="space-y-1.5">
                    {linkedTasks.map(t => (
                      <div key={t.id} className="flex items-center justify-between bg-[#f7f4ef]/50 p-2.5 rounded-[9px] text-[12px]">
                        <span className="font-medium text-[#2c2825] truncate">{t.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#e8e1d7]">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e8e1d7] flex gap-2">
              <button
                onClick={() => {
                  const projId = selectedProject.id;
                  setSelectedProject(null);
                  onOpenModal('project', projId);
                }}
                className="flex-1 py-2.5 text-[12.5px] font-medium bg-[#2c2825] text-white rounded-[9px] hover:bg-[#4a4440] transition-all flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Project
              </button>
              <button
                onClick={() => {
                  const projId = selectedProject.id;
                  setSelectedProject(null);
                  onConfirmDelete('project', projId);
                }}
                className="px-3.5 py-2.5 text-[12.5px] font-medium text-[#c4623a] border border-[#c4623a]/30 rounded-[9px] hover:bg-[#c4623a]/10 transition-all"
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
