'use client';

import React from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import { PageId } from './sidebar';

interface TopbarProps {
  currentPg: PageId;
  onOpenMobile: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  onQuickAdd: () => void;
  apiConnected: boolean;
}

const pageTitles: Record<PageId, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks',
  clients: 'Clients',
  invoices: 'Invoices',
  payments: 'Payments',
  settings: 'Settings'
};

const pageBtnLabels: Record<PageId, string> = {
  dashboard: '+ New Project',
  projects: '+ New Project',
  tasks: '+ Add Task',
  clients: '+ Add Client',
  invoices: '+ New Invoice',
  payments: '',
  settings: ''
};

export function Topbar({ currentPg, onOpenMobile, searchText, onSearchChange, onQuickAdd, apiConnected }: TopbarProps) {
  const btnLabel = pageBtnLabels[currentPg];

  return (
    <header className="bg-[#f7f4ef]/90 backdrop-blur-md border-b border-[#e8e1d7] h-[58px] px-6 flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden bg-transparent border-none text-[#4a4440] text-xl cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-serif-playfair text-[18px] font-medium text-[#2c2825] tracking-tight">
          {pageTitles[currentPg]}
        </h1>
        <div
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${
            apiConnected
              ? 'bg-[#3d5a4c]/10 border-[#3d5a4c]/20 text-[#3d5a4c]'
              : 'bg-[#c4623a]/10 border-[#c4623a]/20 text-[#c4623a]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-[#3d5a4c] animate-pulse' : 'bg-[#c4623a]'}`} />
          <span>{apiConnected ? 'Express API Connected' : 'Express API Unreachable'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 bg-white border border-[#e8e1d7] rounded-[10px] px-3 py-1.5 w-[200px] focus-within:border-[#8fac99] focus-within:ring-2 focus-within:ring-[#8fac99]/20 transition-all">
          <Search className="w-3.5 h-3.5 text-[#b5a898]" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-[12.5px] text-[#4a4440] w-full font-sans-outfit placeholder:text-[#b5a898]"
          />
        </div>

        {btnLabel && (
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[12.5px] font-medium cursor-pointer bg-[#2c2825] text-[#f7f4ef] hover:bg-[#4a4440] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{btnLabel.replace('+ ', '')}</span>
          </button>
        )}
      </div>
    </header>
  );
}
