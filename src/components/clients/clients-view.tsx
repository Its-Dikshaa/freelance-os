'use client';

import React from 'react';
import { Client } from '@/types';
import { fmF } from '@/lib/storage';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  onOpenModal: (type: 'client', id?: string) => void;
  onConfirmDelete: (type: 'client', id: string) => void;
  searchText: string;
}

export function ClientsView({ clients, onOpenModal, onConfirmDelete, searchText }: ClientsViewProps) {
  let list = [...clients];
  if (searchText) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-[#b5a898]">{list.length} clients total</span>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-12 text-center text-[#b5a898] text-[13px]">
          No clients match your filter
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {list.map(c => (
            <div key={c.id} className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center font-serif-playfair text-[14px] font-medium shrink-0"
                  style={{ backgroundColor: `${c.color}15`, color: c.color }}
                >
                  {c.initials || c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[14px] font-medium text-[#2c2825]">{c.name}</div>
                  <div className="text-[11px] text-[#b5a898]">{c.industry}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-[12px] border-t border-[#f0ebe3] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#b5a898]">Email</span>
                  <strong className="text-[#2c2825] font-medium truncate max-w-[170px]">{c.email || '—'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b5a898]">Phone</span>
                  <span className="text-[#4a4440]">{c.phone || '—'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#b5a898]">Total Revenue</span>
                  <strong className="text-[#3d5a4c] font-semibold">{fmF(c.value)}</strong>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#f0ebe3]">
                <button
                  onClick={() => onOpenModal('client', c.id)}
                  className="flex-1 py-1.5 px-3 border border-[#e8e1d7] rounded-[8px] text-[11.5px] font-medium text-[#4a4440] hover:bg-[#f0ebe3] transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => onConfirmDelete('client', c.id)}
                  className="py-1.5 px-3 text-[#c4623a] border border-[#c4623a]/20 bg-[#c4623a]/10 rounded-[8px] text-[11.5px] hover:bg-[#c4623a]/18 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
