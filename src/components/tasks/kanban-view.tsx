'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { formatDisplayDate, isOverdue } from '@/lib/date-utils';
import { Edit2, X, AlertTriangle, Calendar, Clock, Filter, MoveRight, ArrowRight } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onOpenModal: (type: 'task', id?: string, status?: TaskStatus) => void;
  onConfirmDelete: (type: 'task', id: string) => void;
  searchText: string;
}

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'Todo', label: 'To Do' },
  { id: 'InProgress', label: 'In Progress' },
  { id: 'Review', label: 'In Review' },
  { id: 'Done', label: 'Done' }
];

export function KanbanView({ tasks, onUpdateStatus, onOpenModal, onConfirmDelete, searchText }: KanbanViewProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Unique list of project names for filtering
  const projectOptions = Array.from(new Set(tasks.map(t => t.project).filter(Boolean)));

  let list = [...tasks];
  if (searchText) {
    list = list.filter(t =>
      t.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (t.project || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }

  if (selectedProjectFilter !== 'all') {
    list = list.filter(t => (t.project || 'General').toLowerCase() === selectedProjectFilter.toLowerCase());
  }

  if (showOverdueOnly) {
    list = list.filter(t => isOverdue(t.due) && t.status !== 'Done');
  }

  const totalOverdue = tasks.filter(t => isOverdue(t.due) && t.status !== 'Done').length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedTaskId) {
      onUpdateStatus(draggedTaskId, colId);
      setDraggedTaskId(null);
    }
  };

  const priorityStyles: Record<TaskPriority, string> = {
    High: 'bg-[#c4623a]/12 text-[#c4623a] border-[#c4623a]/30',
    Medium: 'bg-[#c9963e]/12 text-[#c9963e] border-[#c9963e]/30',
    Low: 'bg-[#4a7fa5]/12 text-[#4a7fa5] border-[#4a7fa5]/30'
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e8e1d7] rounded-[14px] p-3 px-4 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[12px] text-[#7a706a]">
            <Filter className="w-3.5 h-3.5 text-[#b5a898]" />
            <span className="font-semibold text-[#2c2825]">Project:</span>
            <select
              value={selectedProjectFilter}
              onChange={e => setSelectedProjectFilter(e.target.value)}
              className="bg-[#f7f4ef] border border-[#e8e1d7] text-[#2c2825] text-[12px] rounded-[7px] px-2.5 py-1 outline-none cursor-pointer font-medium"
            >
              <option value="all">All Projects ({tasks.length})</option>
              {projectOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {totalOverdue > 0 && (
            <span className="bg-[#c4623a]/12 text-[#c4623a] border border-[#c4623a]/25 text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {totalOverdue} Overdue
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showOverdueOnly
                ? 'bg-[#c4623a] text-white shadow-xs'
                : 'bg-[#f7f4ef] text-[#7a706a] hover:bg-[#e8e1d7]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {showOverdueOnly ? 'Showing Overdue Only' : 'Filter Overdue'}
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {columns.map(col => {
          const colTasks = list.filter(t => t.status === col.id);
          const colOverdueCount = colTasks.filter(t => isOverdue(t.due) && col.id !== 'Done').length;
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
              className={`bg-[#f0ebe3] border border-[#e8e1d7] rounded-[18px] p-3.5 min-h-[340px] transition-all flex flex-col justify-between ${
                isOver ? 'bg-[#8fac99]/15 border-[#8fac99]' : ''
              }`}
            >
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#7a706a] mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {colOverdueCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#c4623a]" title={`${colOverdueCount} task(s) overdue`} />
                    )}
                  </span>
                  <span className="bg-white text-[#7a706a] rounded-full px-2 py-0.5 text-[9.5px] border border-[#e8e1d7] font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-[#b5a898] text-[11.5px] border border-dashed border-[#e8e1d7] rounded-[11px]">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map(t => {
                      const overdue = isOverdue(t.due) && t.status !== 'Done';
                      const currentPriority: TaskPriority = t.priority || 'Medium';

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={e => handleDragStart(e, t.id)}
                          className={`bg-white border rounded-[11px] p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all shadow-xs relative space-y-2.5 ${
                            overdue
                              ? 'border-l-4 border-l-[#c4623a] border-t-[#c4623a]/30 border-r-[#c4623a]/30 border-b-[#c4623a]/30 bg-[#fffcfb]'
                              : 'border-[#e8e1d7] hover:border-[#b5a898]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[12.5px] font-semibold text-[#2c2825] leading-snug">{t.title}</div>
                            {t.priority && (
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${priorityStyles[currentPriority]}`}>
                                {currentPriority}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                            <span className="text-[#7a706a] bg-[#f0ebe3] px-2 py-0.5 rounded-full font-medium">
                              {t.project || 'General'}
                            </span>

                            {overdue ? (
                              <span className="bg-[#c4623a]/15 text-[#c4623a] border border-[#c4623a]/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Overdue • {formatDisplayDate(t.due, false)}
                              </span>
                            ) : (
                              <span className="text-[#8c7b70] bg-[#f7f4ef] px-2 py-0.5 rounded-full font-medium border border-[#e8e1d7] flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#b5a898]" /> {formatDisplayDate(t.due, false)}
                              </span>
                            )}
                          </div>

                          {/* 1-Tap Mobile Move Select + Action Buttons */}
                          <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#f0ebe3]">
                            {/* Move Pill Dropdown */}
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-[#b5a898]">Move to:</span>
                              <select
                                value={t.status}
                                onChange={e => onUpdateStatus(t.id, e.target.value as TaskStatus)}
                                className="bg-[#f7f4ef] border border-[#e8e1d7] text-[#3d5a4c] font-semibold text-[10.5px] rounded-[5px] px-1.5 py-0.5 outline-none cursor-pointer"
                              >
                                {columns.map(c => (
                                  <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => onOpenModal('task', t.id)}
                                className="p-1 text-[#7a706a] hover:text-[#2c2825] hover:bg-[#f0ebe3] rounded transition-colors"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onConfirmDelete('task', t.id)}
                                className="p-1 text-[#c4623a] hover:bg-[#c4623a]/10 rounded transition-colors"
                                title="Delete Task"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => onOpenModal('task', undefined, col.id)}
                className="w-full mt-3 py-2 border border-dashed border-[#d4c9b8] rounded-[9px] text-[12px] text-[#b5a898] hover:border-[#3d5a4c] hover:text-[#3d5a4c] hover:bg-[#3d5a4c]/8 transition-all text-center cursor-pointer font-semibold flex items-center justify-center gap-1"
              >
                + Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
