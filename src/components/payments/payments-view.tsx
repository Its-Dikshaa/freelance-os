'use client';

import React from 'react';
import { Invoice } from '@/types';
import { fmF } from '@/lib/storage';

interface PaymentsViewProps {
  invoices: Invoice[];
  searchText: string;
  onViewInvoice: (id: string) => void;
}

export function PaymentsView({ invoices, searchText, onViewInvoice }: PaymentsViewProps) {
  const paidInvoices = invoices.filter(i => i.status === 'Paid');
  const totalReceived = paidInvoices.reduce((a, i) => a + Number(i.amount), 0);
  const pendingCollection = invoices.filter(i => i.status !== 'Paid').reduce((a, i) => a + Number(i.amount), 0);

  let list = [...paidInvoices];
  if (searchText) {
    list = list.filter(i =>
      i.num.toLowerCase().includes(searchText.toLowerCase()) ||
      i.client.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Total Received</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#3d5a4c] leading-none">{fmF(totalReceived)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Pending Collection</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#c9963e] leading-none">{fmF(pendingCollection)}</div>
        </div>

        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm">
          <div className="text-[10.5px] font-semibold text-[#b5a898] uppercase tracking-wider mb-2">Paid Invoices</div>
          <div className="font-serif-playfair text-[25px] font-medium text-[#2c2825] leading-none">{paidInvoices.length}</div>
        </div>
      </div>

      <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-5 shadow-sm overflow-x-auto">
        <div className="font-serif-playfair text-[15px] font-medium text-[#2c2825] mb-4">Payment History</div>
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#b5a898] border-b border-[#e8e1d7]">
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
                <td colSpan={7} className="py-10 text-center text-[#b5a898] text-[13px]">
                  No payment records found
                </td>
              </tr>
            ) : (
              list.map(i => (
                <tr key={i.id} className="hover:bg-[#f0ebe3]/50 transition-colors text-[13px]">
                  <td className="py-3 px-3 font-semibold text-[#2c2825]">{i.num}</td>
                  <td className="py-3 px-3 text-[#4a4440]">{i.client}</td>
                  <td className="py-3 px-3 font-semibold text-[#3d5a4c]">{fmF(i.amount)}</td>
                  <td className="py-3 px-3 text-[#7a706a]">{i.date}</td>
                  <td className="py-3 px-3 text-[#7a706a]">UPI / Direct Transfer</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#3d5a4c]/10 text-[#3d5a4c]">
                      Paid
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onViewInvoice(i.id)}
                      className="px-2.5 py-1 bg-white border border-[#e8e1d7] rounded-[7px] text-[11.5px] text-[#4a4440] hover:bg-[#f0ebe3]"
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
  );
}
