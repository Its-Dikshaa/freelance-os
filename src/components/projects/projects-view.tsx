'use client';

import React, { useState } from 'react';
import { Project, ProjectStatus } from '@/types';
import { fmF } from '@/lib/storage';
import { formatDisplayDate, isOverdue } from '@/lib/date-utils';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onOpenModal: (type: 'project', id?: string) => void;
  onConfirmDelete: (type: 'project', id: string) => void;
  searchText: string;
}

export function ProjectsView({ projects, onOpenModal, onConfirmDelete, searchText }: ProjectsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all');

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

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'Active', 'Review', 'Pending', 'Done'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 rounded-full text-[12px] cursor-pointer border transition-all ${
                filterStatus === tab
                  ? 'bg-[#2c2825] border-[#2c2825] text-[#f7f4ef] font-medium'
                  : 'bg-white border-[#e8e1d7] text-[#7a706a] hover:border-[#b5a898]'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'Review' ? 'In Review' : tab}
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
                <td colSpan={7} className="py-10 text-center text-[#b5a898] text-[13px]">
                  No projects match your filter
                </td>
              </tr>
            ) : (
              list.map(p => (
                <tr key={p.id} className="hover:bg-[#f0ebe3]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <div>
                        <strong className="text-[13px] text-[#2c2825] font-semibold">{p.name}</strong>
                        {p.desc && <div className="text-[11px] text-[#b5a898]">{p.desc}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[13px] text-[#4a4440]">{p.client}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${badgeStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#e8e1d7] rounded-full h-1 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-[11px] text-[#b5a898]">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[13px] font-semibold text-[#2c2825]">{fmF(p.budget)}</td>
                  <td className="py-3 px-3 text-[12px]">
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
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => onOpenModal('project', p.id)}
                        className="p-1.5 text-[#4a4440] hover:text-[#2c2825] hover:bg-[#f0ebe3] rounded transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete('project', p.id)}
                        className="p-1.5 text-[#c4623a] hover:bg-[#c4623a]/10 rounded transition-colors"
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
    </div>
  );
}
