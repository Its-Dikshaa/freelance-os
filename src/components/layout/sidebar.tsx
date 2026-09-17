'use client';

import React from 'react';
import { LayoutDashboard, Briefcase, Hexagon, UserCheck, FileText, CreditCard, Settings } from 'lucide-react';
import { ini } from '@/lib/storage';

export type PageId = 'dashboard' | 'projects' | 'tasks' | 'clients' | 'invoices' | 'payments' | 'settings';

interface SidebarProps {
  currentPg: PageId;
  onNavigate: (pg: PageId) => void;
  userName: string;
  userRole: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ currentPg, onNavigate, userName, userRole, isOpenMobile, onCloseMobile }: SidebarProps) {
  const navSections = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'Work',
      items: [
        { id: 'projects' as PageId, label: 'Projects', icon: Briefcase },
        { id: 'tasks' as PageId, label: 'Tasks', icon: Hexagon },
        { id: 'clients' as PageId, label: 'Clients', icon: UserCheck }
      ]
    },
    {
      label: 'Finance',
      items: [
        { id: 'invoices' as PageId, label: 'Invoices', icon: FileText },
        { id: 'payments' as PageId, label: 'Payments', icon: CreditCard }
      ]
    },
    {
      label: 'Account',
      items: [
        { id: 'settings' as PageId, label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#2c2825]/40 z-[199] md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-[220px] bg-[#2c2825] h-screen fixed left-0 top-0 flex flex-col z-[200] transition-transform duration-350 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <div className="font-serif-playfair text-[19px] font-medium text-[#f7f4ef] tracking-tight">
            Freelance<em className="not-italic text-[#e8c07a]">OS</em>
            <span className="inline-block w-1.5 h-1.5 bg-[#8fac99] rounded-full mb-0.5 ml-0.5" />
          </div>
          <div className="text-[9.5px] text-white/30 tracking-[1.8px] uppercase mt-1 font-light">
            Your work · your rules
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 flex-1 overflow-y-auto">
          {navSections.map((sec, idx) => (
            <div key={idx} className="mb-6">
              <div className="text-[9px] tracking-[2.5px] uppercase text-white/20 px-2.5 mb-1.5 font-medium">
                {sec.label}
              </div>
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPg === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13px] transition-all text-left font-normal select-none ${
                      isActive
                        ? 'text-[#f7f4ef] bg-white/10 font-medium'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#e8c07a]' : 'text-white/40'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div
          onClick={() => {
            onNavigate('settings');
            onCloseMobile();
          }}
          className="p-3.5 border-t border-white/10 flex items-center gap-2.5 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#4e7360] to-[#8fac99] flex items-center justify-center font-serif-playfair text-[13px] text-white shrink-0">
            {ini(userName)}
          </div>
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium text-[#f7f4ef] truncate">{userName}</div>
            <div className="text-[10px] text-white/30 font-light truncate">{userRole}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
