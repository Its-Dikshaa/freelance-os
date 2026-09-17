'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { Plus, Edit2, X } from 'lucide-react';

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

  let list = [...tasks];
  if (searchText) {
    list = list.filter(t =>
      t.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (t.project || '').toLowerCase().includes(searchText.toLowerCase())
    );
  }

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

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-[#b5a898]">Drag & drop tasks across columns to update status</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {columns.map(col => {
          const colTasks = list.filter(t => t.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
              className={`bg-[#f0ebe3] border border-[#e8e1d7] rounded-[18px] p-3.5 min-h-[300px] transition-all ${
                isOver ? 'bg-[#8fac99]/15 border-[#8fac99]' : ''
              }`}
            >
              <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#7a706a] mb-3 flex items-center justify-between">
                <span>{col.label}</span>
                <span className="bg-white text-[#7a706a] rounded-full px-2 py-0.5 text-[9.5px] border border-[#e8e1d7]">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {colTasks.map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={e => handleDragStart(e, t.id)}
                    className="bg-white border border-[#e8e1d7] rounded-[11px] p-3 cursor-grab active:cursor-grabbing hover:border-[#b5a898] hover:shadow-md transition-all shadow-xs"
                  >
                    <div className="text-[12.5px] font-medium text-[#2c2825] mb-2 leading-snug">{t.title}</div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#b5a898] bg-[#f0ebe3] px-2 py-0.5 rounded-full">{t.project || 'General'}</span>
                      <span className="text-[#c9963e] font-medium">{t.due}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-[#f0ebe3]">
                      <button
                        onClick={() => onOpenModal('task', t.id)}
                        className="flex-1 py-1 px-2 border border-[#e8e1d7] text-[#4a4440] text-[11px] rounded-[6px] hover:bg-[#f0ebe3] flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => onConfirmDelete('task', t.id)}
                        className="py-1 px-2 text-[#c4623a] text-[11px] rounded-[6px] hover:bg-[#c4623a]/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onOpenModal('task', undefined, col.id)}
                className="w-full mt-3 py-2 border-1.5 border-dashed border-[#d4c9b8] rounded-[9px] text-[12px] text-[#b5a898] hover:border-[#8fac99] hover:text-[#3d5a4c] hover:bg-[#8fac99]/8 transition-all text-center cursor-pointer"
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
