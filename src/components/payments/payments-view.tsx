'use client';

import React, { useState } from 'react';
import { Invoice, Payment } from '@/types';
import { fmF } from '@/lib/storage';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface PaymentsViewProps {
  payments: Payment[];
  invoices: Invoice[];
  searchText: string;
  onViewInvoice: (invoiceNum: string) => void;
}

const statusBadges: Record<Payment['status'], string> = {
  Completed: 'bg-[#3d5a4c]/10 text-[#3d5a4c]',
  Processing: 'bg-[#c9963e]/12 text-[#c9963e]',
  Failed: 'bg-[#c4623a]/10 text-[#c4623a]'
};

export function PaymentsView({ payments, invoices, searchText, onViewInvoice }: PaymentsViewProps) {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'quarter'>('all');

  const completedPayments = payments.filter(p => p.status === 'Completed');
  const totalReceived = completedPayments.reduce((a, p) => a + Number(p.amount), 0);
  const pendingCollection = invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + Number(i.amount), 0);

  let list = [...payments];

  // Date filtering logic
  const now = new Date();
  if (dateFilter === 'month') {
    list = list.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  } else if (dateFilter === 'quarter') {
    list = list.filter(p => {
      const d = new Date(p.date);
      const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return diffMonths <= 3;
    });
  }

  if (searchText) {
    list = list.filter(p =>
      p.invoiceNum.toLowerCase().includes(searchText.toLowerCase()) ||
      p.client.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const handleExportCSV = () => {
    if (list.length === 0) {
      toast('No payments available to export', 'error');
      return;
    }

    const headers = ['Tx ID', 'Invoice #', 'Client', 'Amount (INR)', 'Date', 'Method', 'Status'];
    const rows = list.map(p => [
      p.txId,
      p.invoiceNum,
      `"${p.client.replace(/"/g, '""')}"`,
      p.amount,
      p.date,
      p.method,
      p.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FreelanceOS_Payments_Export_${now.toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Payments exported to CSV file successfully!');
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Total Received</div>
          <div className="font-serif-playfair text-[25px] font-bold text-[#3d5a4c] leading-none">{fmF(totalReceived)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Pending Collection</div>
          <div className="font-serif-playfair text-[25px] font-bold text-[#c9963e] leading-none">{fmF(pendingCollection)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Payments Recorded</div>
          <div className="font-serif-playfair text-[25px] font-bold text-[#2c2825] leading-none">{payments.length}</div>
        </div>
      </div>

      {/* Control Bar & Filter */}
      <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-playfair text-[16px] font-medium text-[#2c2825]">Payment History</span>
            <span className="text-[11.5px] text-[#b5a898]">({list.length} records)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-[#f7f4ef] border border-[#e8e1d7] p-1 rounded-full text-[11.5px]">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                  dateFilter === 'all' ? 'bg-[#2c2825] text-white' : 'text-[#7a706a] hover:text-[#2c2825]'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                  dateFilter === 'month' ? 'bg-[#2c2825] text-white' : 'text-[#7a706a] hover:text-[#2c2825]'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setDateFilter('quarter')}
                className={`px-3 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${
                  dateFilter === 'quarter' ? 'bg-[#2c2825] text-white' : 'text-[#7a706a] hover:text-[#2c2825]'
                }`}
              >
                Last 3 Months
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5a4c] bg-[#3d5a4c]/10 border border-[#3d5a4c]/20 px-3.5 py-1.5 rounded-[9px] hover:bg-[#3d5a4c]/20 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                <th className="pb-3 px-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ebe3]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#b5a898] text-[13px]">
                    No payment records found matching your filter
                  </td>
                </tr>
              ) : (
                list.map(p => (
                  <tr key={p.id} className="hover:bg-[#f0ebe3]/50 transition-colors text-[13px]">
                    <td className="py-3.5 px-3 text-[#7a706a] font-mono text-[11.5px]">{p.txId}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#2c2825]">{p.invoiceNum}</td>
                    <td className="py-3.5 px-3 text-[#4a4440] font-medium">{p.client}</td>
                    <td className="py-3.5 px-3 font-bold text-[#3d5a4c]">{fmF(p.amount)}</td>
                    <td className="py-3.5 px-3 text-[#7a706a]">{p.date}</td>
                    <td className="py-3.5 px-3 text-[#7a706a]">{p.method}</td>
                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusBadges[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => onViewInvoice(p.invoiceNum)}
                        className="px-2.5 py-1 bg-white border border-[#e8e1d7] rounded-[7px] text-[11.5px] font-medium text-[#4a4440] hover:bg-[#f0ebe3] transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
