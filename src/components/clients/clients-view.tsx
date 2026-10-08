'use client';

import React, { useState } from 'react';
import { Client, Project, Invoice } from '@/types';
import { fmF } from '@/lib/storage';
import { Edit2, Trash2, Mail, Phone, ExternalLink, Copy, Check, X, FolderPlus, FileText, Building2, User } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ClientsViewProps {
  clients: Client[];
  projects?: Project[];
  invoices?: Invoice[];
  onOpenModal: (type: 'client' | 'project' | 'invoice', id?: string) => void;
  onConfirmDelete: (type: 'client', id: string) => void;
  searchText: string;
}

export function ClientsView({ clients, projects = [], invoices = [], onOpenModal, onConfirmDelete, searchText }: ClientsViewProps) {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  let list = [...clients];
  if (searchText) {
    list = list.filter(c =>
      c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const handleCopyEmail = (email: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast('Client email copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Linked items for drawer
  const linkedProjects = selectedClient ? projects.filter(p => p.client.toLowerCase() === selectedClient.name.toLowerCase()) : [];
  const linkedInvoices = selectedClient ? invoices.filter(i => i.client.toLowerCase() === selectedClient.name.toLowerCase()) : [];

  return (
    <div className="space-y-4 animate-fade-up relative">
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-[#b5a898]">{list.length} client{list.length !== 1 ? 's' : ''} total</span>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-12 text-center text-[#b5a898] text-[13px]">
          No clients match your filter
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {list.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedClient(c)}
              className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[12px] flex items-center justify-center font-serif-playfair text-[15px] font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: `${c.color}15`, color: c.color }}
                    >
                      {c.initials || c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#2c2825] group-hover:text-[#3d5a4c] transition-colors">{c.name}</div>
                      <div className="text-[11px] text-[#b5a898]">{c.industry || 'General Industry'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-[12px] border-t border-[#f0ebe3] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5a898] flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    {c.email ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`mailto:${c.email}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[#3d5a4c] font-medium hover:underline truncate max-w-[150px]"
                        >
                          {c.email}
                        </a>
                        <button
                          onClick={e => handleCopyEmail(c.email, c.id, e)}
                          className="p-1 text-[#b5a898] hover:text-[#2c2825] rounded transition-colors"
                          title="Copy Email"
                        >
                          {copiedId === c.id ? <Check className="w-3 h-3 text-[#3d5a4c]" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#b5a898]">—</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#b5a898] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </span>
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="text-[#4a4440] hover:text-[#2c2825] font-medium hover:underline"
                      >
                        {c.phone}
                      </a>
                    ) : (
                      <span className="text-[#b5a898]">—</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-[#f0ebe3]/60">
                    <span className="text-[#b5a898]">Total Lifetime Value</span>
                    <strong className="text-[#3d5a4c] font-semibold text-[13px]">{fmF(c.value)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#f0ebe3]" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onOpenModal('client', c.id)}
                  className="flex-1 py-1.5 px-3 border border-[#e8e1d7] rounded-[8px] text-[11.5px] font-medium text-[#4a4440] hover:bg-[#f0ebe3] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  onClick={() => onConfirmDelete('client', c.id)}
                  className="py-1.5 px-3 text-[#c4623a] border border-[#c4623a]/20 bg-[#c4623a]/10 rounded-[8px] text-[11.5px] hover:bg-[#c4623a]/18 transition-colors cursor-pointer"
                  title="Delete Client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLIENT DETAIL SLIDE-OVER DRAWER */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-[#2c2825]/40 z-[600] flex justify-end backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="w-full max-w-[460px] bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between border-l border-[#e8e1d7] animate-slide-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#e8e1d7]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center font-serif-playfair text-[18px] font-bold shrink-0"
                    style={{ backgroundColor: `${selectedClient.color}15`, color: selectedClient.color }}
                  >
                    {selectedClient.initials || selectedClient.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-serif-playfair text-[20px] font-semibold text-[#2c2825]">
                      {selectedClient.name}
                    </h2>
                    <div className="text-[12px] text-[#7a706a]">{selectedClient.industry || 'Client Profile'}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 text-[#b5a898] hover:text-[#2c2825] rounded-full hover:bg-[#f0ebe3] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Card */}
              <div className="bg-[#f7f4ef] border border-[#e8e1d7] rounded-[14px] p-4 space-y-2.5 text-[12.5px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#7a706a]">Email</span>
                  {selectedClient.email ? (
                    <a href={`mailto:${selectedClient.email}`} className="text-[#3d5a4c] font-semibold hover:underline">
                      {selectedClient.email}
                    </a>
                  ) : (
                    <span className="text-[#b5a898]">—</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7a706a]">Phone</span>
                  {selectedClient.phone ? (
                    <a href={`tel:${selectedClient.phone}`} className="text-[#2c2825] font-semibold hover:underline">
                      {selectedClient.phone}
                    </a>
                  ) : (
                    <span className="text-[#b5a898]">—</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e8e1d7]">
                  <span className="text-[#7a706a]">Total Revenue</span>
                  <span className="font-serif-playfair text-[17px] font-bold text-[#3d5a4c]">
                    {fmF(selectedClient.value)}
                  </span>
                </div>
              </div>

              {/* Client Notes */}
              {selectedClient.notes && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] uppercase font-bold text-[#7a706a] tracking-wider">Client Notes</h4>
                  <p className="text-[13px] text-[#4a4440] leading-relaxed bg-[#f7f4ef]/60 border border-[#e8e1d7] p-3.5 rounded-[12px]">
                    {selectedClient.notes}
                  </p>
                </div>
              )}

              {/* Associated Projects */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] uppercase font-bold text-[#7a706a] tracking-wider flex items-center gap-1">
                    <FolderPlus className="w-3.5 h-3.5 text-[#3d5a4c]" /> Projects ({linkedProjects.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      onOpenModal('project');
                    }}
                    className="text-[11px] text-[#3d5a4c] font-semibold hover:underline"
                  >
                    + New Project
                  </button>
                </div>
                {linkedProjects.length === 0 ? (
                  <div className="text-[12px] text-[#b5a898] italic py-2">No projects created for this client yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {linkedProjects.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-[#f7f4ef]/60 p-2.5 rounded-[9px] text-[12px]">
                        <span className="font-medium text-[#2c2825]">{p.name}</span>
                        <span className="text-[11px] font-semibold text-[#3d5a4c]">{fmF(p.budget)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Associated Invoices */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] uppercase font-bold text-[#7a706a] tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#c9963e]" /> Invoices ({linkedInvoices.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      onOpenModal('invoice');
                    }}
                    className="text-[11px] text-[#c9963e] font-semibold hover:underline"
                  >
                    + New Invoice
                  </button>
                </div>
                {linkedInvoices.length === 0 ? (
                  <div className="text-[12px] text-[#b5a898] italic py-2">No invoices generated for this client yet</div>
                ) : (
                  <div className="space-y-1.5">
                    {linkedInvoices.map(i => (
                      <div key={i.id} className="flex items-center justify-between bg-[#f7f4ef]/60 p-2.5 rounded-[9px] text-[12px]">
                        <span className="font-medium text-[#2c2825]">{i.num}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#2c2825]">{fmF(i.amount)}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${i.status === 'Paid' ? 'bg-[#3d5a4c]/10 text-[#3d5a4c]' : 'bg-[#c4623a]/10 text-[#c4623a]'}`}>
                            {i.status}
                          </span>
                        </div>
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
                  const clientId = selectedClient.id;
                  setSelectedClient(null);
                  onOpenModal('client', clientId);
                }}
                className="flex-1 py-2.5 text-[12.5px] font-medium bg-[#2c2825] text-white rounded-[9px] hover:bg-[#4a4440] transition-all flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                onClick={() => {
                  const clientId = selectedClient.id;
                  setSelectedClient(null);
                  onConfirmDelete('client', clientId);
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
