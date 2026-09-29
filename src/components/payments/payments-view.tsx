'use client';

import React from 'react';
import { Invoice, Payment } from '@/types';
import { fmF } from '@/lib/storage';
import { Plus, Trash2, Receipt } from 'lucide-react';

interface PaymentsViewProps {
  payments: Payment[];
  invoices: Invoice[];
  currency?: string;
  searchText: string;
  onViewInvoice: (invoiceNum: string) => void;
  onRecordPayment?: () => void;
  onConfirmDelete?: (id: string) => void;
}

const statusBadges: Record<Payment['status'], string> = {
  Completed: 'bg-[#3d5a4c]/10 text-[#3d5a4c]',
  Processing: 'bg-[#c9963e]/12 text-[#c9963e]',
  Failed: 'bg-[#c4623a]/10 text-[#c4623a]'
};

export function PaymentsView({
  payments,
  invoices,
  currency = '₹',
  searchText,
  onViewInvoice,
  onRecordPayment,
  onConfirmDelete
}: PaymentsViewProps) {
  const completedPayments = payments.filter(p => p.status === 'Completed');
  const totalReceived = completedPayments.reduce((a, p) => a + Number(p.amount), 0);
  const pendingCollection = invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + Number(i.amount), 0);

  let list = [...payments];
  if (searchText) {
    list = list.filter(p =>
      p.invoiceNum.toLowerCase().includes(searchText.toLowerCase()) ||
      p.client.toLowerCase().includes(searchText.toLowerCase()) ||
      p.txId.toLowerCase().includes(searchText.toLowerCase()) ||
      p.method.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Total Received</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#3d5a4c] leading-none">{fmF(totalReceived, currency)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Pending Collection</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#c9963e] leading-none">{fmF(pendingCollection, currency)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Payments Recorded</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{payments.length}</div>
        </div>
      </div>

      <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="font-serif-playfair text-[16px] font-medium text-[#2c2825]">Payment History</div>
          {onRecordPayment && (
            <button
              onClick={onRecordPayment}
              className="text-[12px] font-medium text-[#3d5a4c] bg-[#3d5a4c]/10 hover:bg-[#3d5a4c]/18 px-3 py-1.5 rounded-[8px] border border-[#3d5a4c]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Record Payment
            </button>
          )}
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#b5a898] border-b border-[#e8e1d7]">
              <th className="pb-3 px-3 font-semibold">Tx ID</th>
              <th className="pb-3 px-3 font-semibold">Invoice</th>
              <th className="pb-3 px-3 font-semibold">Client</th>
              <th className="pb-3 px-3 font-semibold">Amount</th>
              <th className="pb-3 px-3 font-semibold">Date</th>
              <th className="pb-3 px-3 font-semibold">Method</th>
              <th className="pb-3 px-3 font-semibold">Status</th>
              <th className="pb-3 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ebe3]">
            {list.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#b5a898] text-[13px]">
                  No payment records found
                </td>
              </tr>
            ) : (
              list.map(p => (
                <tr key={p.id} className="hover:bg-[#f0ebe3]/50 transition-colors text-[13px]">
                  <td className="py-3 px-3 text-[#7a706a] font-mono text-[12px]">{p.txId}</td>
                  <td className="py-3 px-3 font-semibold text-[#2c2825]">{p.invoiceNum || '—'}</td>
                  <td className="py-3 px-3 text-[#4a4440] font-medium">{p.client}</td>
                  <td className="py-3 px-3 font-semibold text-[#3d5a4c]">{fmF(p.amount, currency)}</td>
                  <td className="py-3 px-3 text-[#7a706a]">{p.date}</td>
                  <td className="py-3 px-3 text-[#7a706a]">{p.method}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusBadges[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.invoiceNum && (
                        <button
                          onClick={() => onViewInvoice(p.invoiceNum)}
                          className="px-2.5 py-1 bg-white border border-[#e8e1d7] rounded-[7px] text-[11.5px] text-[#4a4440] hover:bg-[#f0ebe3] flex items-center gap-1 cursor-pointer"
                          title="View Invoice Sheet"
                        >
                          <Receipt className="w-3 h-3 text-[#7a706a]" /> Invoice
                        </button>
                      )}
                      {onConfirmDelete && (
                        <button
                          onClick={() => onConfirmDelete(p.id)}
                          className="p-1.5 text-[#c4623a] hover:bg-[#c4623a]/12 rounded-[7px] border border-[#c4623a]/20 transition-colors cursor-pointer"
                          title="Delete payment record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
