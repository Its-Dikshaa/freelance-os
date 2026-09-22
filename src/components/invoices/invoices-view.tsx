'use client';

import React, { useState } from 'react';
import { Invoice, InvoiceStatus, Client, UserSettings } from '@/types';
import { fmF } from '@/lib/storage';
import { formatDisplayDate, isOverdue } from '@/lib/date-utils';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Eye, Edit2, Mail, CheckCircle2, Trash2, Download, X, Copy, AlertTriangle, Send } from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients: Client[];
  settings: UserSettings;
  onMarkPaid: (id: string) => void;
  onOpenModal: (type: 'invoice', id?: string) => void;
  onConfirmDelete: (type: 'invoice', id: string) => void;
  searchText: string;
}

export function InvoicesView({
  invoices,
  clients,
  settings,
  onMarkPaid,
  onOpenModal,
  onConfirmDelete,
  searchText
}: InvoicesViewProps) {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');

  // Preview & Email states
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubj, setEmailSubj] = useState('');
  const [emailBody, setEmailBody] = useState('');

  let list = [...invoices];
  if (filterStatus !== 'all') {
    list = list.filter(i => i.status === filterStatus);
  }
  if (searchText) {
    list = list.filter(i =>
      i.num.toLowerCase().includes(searchText.toLowerCase()) ||
      i.client.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  const statusColors: Record<InvoiceStatus, string> = {
    Paid: '#3d5a4c',
    Unpaid: '#c9963e',
    Overdue: '#c4623a'
  };

  const statusBadges: Record<InvoiceStatus, string> = {
    Paid: 'bg-[#3d5a4c]/10 text-[#3d5a4c]',
    Unpaid: 'bg-[#c9963e]/12 text-[#c9963e]',
    Overdue: 'bg-[#c4623a]/10 text-[#c4623a]'
  };

  const handleOpenEmail = (inv: Invoice) => {
    // Robust client lookup
    const cl = clients.find(c =>
      c.name.toLowerCase().trim() === inv.client.toLowerCase().trim()
    ) || clients.find(c =>
      c.name.toLowerCase().includes(inv.client.toLowerCase()) ||
      inv.client.toLowerCase().includes(c.name.toLowerCase())
    );

    const clientEmail = cl?.email || inv.clientEmail || (cl ? `${cl.name.toLowerCase().replace(/\s+/g, '')}@company.com` : 'client@company.com');

    setEmailInvoice(inv);
    setEmailTo(clientEmail);
    setEmailSubj(`Invoice ${inv.num} — ${settings.biz || 'Diksha Design Studio'}`);

    const dueDateStr = inv.due || '2026-09-30';
    const issueDateStr = inv.date || new Date().toISOString().slice(0, 10);

    const hasGst = Boolean(settings.gst);
    const gstRate = 0.18;
    const baseAmt = inv.amount;
    const gstAmt = hasGst ? Math.round(baseAmt * gstRate) : 0;
    const totalAmt = baseAmt + gstAmt;

    let detailsBlock = `──────────────────────────────\n`;
    detailsBlock += `Invoice No.   :  ${inv.num}\n`;
    detailsBlock += `Description   :  ${inv.desc || 'Services rendered'}\n`;
    if (hasGst) {
      detailsBlock += `Amount        :  ${fmF(baseAmt)}\n`;
      detailsBlock += `GST (18%)     :  ${fmF(gstAmt)}\n`;
      detailsBlock += `Total Due     :  ${fmF(totalAmt)}\n`;
    } else {
      detailsBlock += `Amount        :  ${fmF(baseAmt)}\n`;
    }
    detailsBlock += `Invoice Date  :  ${issueDateStr}\n`;
    detailsBlock += `Due Date      :  ${dueDateStr}\n`;
    detailsBlock += `──────────────────────────────`;

    const body = `Dear ${inv.client},\n\nI hope you're doing well.\n\nPlease find your invoice details below:\n\n${detailsBlock}\n\nPayment Details:\n${settings.bank || 'diksha@upi'}\n\nPlease make the payment by the due date. Feel free to reach out if you have any questions.\n\nThank you for your trust and continued collaboration!\n\nWarm regards,\n${settings.name || 'Diksha Jangra'}\n${settings.profession || 'UI/UX Designer'}\n${settings.email || 'diksha@example.com'}`;

    setEmailBody(body);
  };

  const generatePDFForInvoice = async (inv: Invoice) => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-invoice-sheet');
      if (!element) {
        toast('Invoice sheet preparing, please try again');
        return;
      }

      // Create isolated clone to bypass modal transform & backdrop-blur issues
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.padding = '30px';
      container.appendChild(clone);
      document.body.appendChild(container);

      const filename = `${inv.num}_${inv.client.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(clone).save();
      document.body.removeChild(container);
      toast('Invoice PDF downloaded successfully!');
    } catch (e) {
      console.error('PDF error:', e);
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewInvoice) return;
    await generatePDFForInvoice(previewInvoice);
  };

  const getInvoicePDFBase64 = async (inv: Invoice): Promise<string | null> => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-invoice-sheet');
      if (!element) return null;

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.padding = '30px';
      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin: 10,
        filename: `${inv.num}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, width: 800, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      const pdfDataUri = await html2pdf().set(opt).from(clone).outputPdf('datauri');
      document.body.removeChild(container);
      const base64 = pdfDataUri ? pdfDataUri.split(',')[1] || null : null;
      return base64;
    } catch (e) {
      console.error('Base64 PDF error:', e);
      return null;
    }
  };

  const handleSendEmail = () => {
    const cleanTo = (emailTo || 'client@company.com').trim();
    const subj = encodeURIComponent(emailSubj);
    
    // Safely limit mailto body length to prevent browser URL length limits (2000 chars max)
    const safeBody = emailBody.length > 1200 ? emailBody.slice(0, 1200) + '\n\n...' : emailBody;
    const body = encodeURIComponent(safeBody);

    const mailtoUrl = `mailto:${cleanTo}?subject=${subj}&body=${body}`;
    
    try {
      const w = window.open(mailtoUrl, '_blank');
      if (!w || w.closed || typeof w.closed === 'undefined') {
        window.location.href = mailtoUrl;
      }
    } catch {
      window.location.href = mailtoUrl;
    }

    setEmailInvoice(null);
    toast(`Mail client opened for ${cleanTo}!`);
  };

  const handleDownloadEmailPDF = async () => {
    if (!emailInvoice) return;
    setPreviewInvoice(emailInvoice);
    setTimeout(async () => {
      await generatePDFForInvoice(emailInvoice);
    }, 150);
  };

  const handleDirectSendExpress = async () => {
    if (!emailInvoice) return;
    toast('Generating PDF attachment...');
    setPreviewInvoice(emailInvoice);

    setTimeout(async () => {
      const pdfBase64 = await getInvoicePDFBase64(emailInvoice);
      try {
        const res = await fetch(`${API_BASE_URL}/invoices/send-email`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            to: emailTo,
            subject: emailSubj,
            body: emailBody,
            invoiceNum: emailInvoice.num,
            pdfBase64: pdfBase64
          })
        });
        const data = await res.json();
        if (res.ok) {
          toast(data.message || `Invoice email sent to ${emailTo}!`);
          setEmailInvoice(null);
        } else {
          toast(data.error || 'Opened mail client');
          handleSendEmail();
        }
      } catch {
        handleSendEmail();
      }
    }, 200);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody).then(() => {
      toast('Email content copied to clipboard!');
    });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'Paid', 'Unpaid', 'Overdue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 rounded-full text-[12px] cursor-pointer border transition-all ${
                filterStatus === tab
                  ? 'bg-[#2c2825] border-[#2c2825] text-[#f7f4ef] font-medium'
                  : 'bg-white border-[#e8e1d7] text-[#7a706a] hover:border-[#b5a898]'
              }`}
            >
              {tab === 'all' ? 'All' : tab}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-[#e8e1d7] rounded-[18px] p-12 text-center text-[#b5a898] text-[13px]">
          No invoices match your filter
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {list.map(inv => {
            const actualStatus: InvoiceStatus = (inv.status === 'Unpaid' && isOverdue(inv.due)) ? 'Overdue' : inv.status;
            return (
              <div
                key={inv.id}
                className="bg-white border border-[#e8e1d7] rounded-[18px] p-4.5 shadow-sm relative overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: statusColors[actualStatus] }}
                />

                <div className="pl-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10.5px] font-bold text-[#b5a898] uppercase tracking-wider">{inv.num}</span>
                    <div className="font-serif-playfair text-[20px] font-medium text-[#2c2825]">{fmF(inv.amount)}</div>
                  </div>

                  <div className="text-[13.5px] font-medium text-[#2c2825] mt-1">{inv.client}</div>
                  <div className="text-[11px] text-[#b5a898] mt-0.5">
                    Issued {formatDisplayDate(inv.date, false)} · Due {formatDisplayDate(inv.due, false)}
                  </div>

                  <div className="mt-2.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${statusBadges[actualStatus]}`}>
                      {actualStatus === 'Overdue' && <AlertTriangle className="w-3 h-3" />}
                      {actualStatus}
                    </span>
                  </div>
                </div>

              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#f0ebe3]">
                <button
                  onClick={() => setPreviewInvoice(inv)}
                  className="px-2 py-1 bg-white border border-[#e8e1d7] rounded-[7px] text-[11px] font-medium text-[#4a4440] hover:bg-[#f0ebe3] flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <button
                  onClick={() => onOpenModal('invoice', inv.id)}
                  className="px-2 py-1 bg-white border border-[#e8e1d7] rounded-[7px] text-[11px] font-medium text-[#3d5a4c] hover:bg-[#f0ebe3] flex items-center gap-1"
                  title="Edit Invoice"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => handleOpenEmail(inv)}
                  className="px-2 py-1 bg-[#c9963e]/10 border border-[#c9963e]/22 text-[#c9963e] rounded-[7px] text-[11px] font-medium hover:bg-[#c9963e]/18 flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" /> Email
                </button>
                {inv.status !== 'Paid' && (
                  <button
                    onClick={() => onMarkPaid(inv.id)}
                    className="px-2 py-1 bg-[#3d5a4c] text-white rounded-[7px] text-[11px] font-medium hover:bg-[#4e7360] flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </button>
                )}
                <button
                  onClick={() => onConfirmDelete('invoice', inv.id)}
                  className="p-1 text-[#c4623a] hover:bg-[#c4623a]/10 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* PRINTABLE INVOICE SHEET MODAL */}
      {previewInvoice && (
        <div
          className="fixed inset-0 bg-[#2c2825]/60 z-[700] flex items-center justify-center backdrop-blur-md p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setPreviewInvoice(null);
          }}
        >
          <div className="flex flex-col items-center w-full max-w-[640px] gap-3.5 max-h-[95vh] animate-fade-up">
            <div className="overflow-y-auto rounded-[14px] shadow-2xl w-full max-h-[80vh]">
              <div id="printable-invoice-sheet" className="bg-white text-[#2c2825] p-10 font-sans-outfit">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="font-serif-playfair text-[24px] font-medium text-[#2c2825]">
                      {settings.biz || 'Diksha Design Studio'}
                    </div>
                    <div className="text-[12.5px] text-[#7a706a] mt-1 font-medium">
                      {settings.name || 'Diksha Jangra'} · {settings.profession || 'UI/UX Designer'}
                    </div>
                    <div className="text-[11.5px] text-[#b5a898] mt-0.5">
                      {settings.email || 'diksha@example.com'} · {settings.location || 'Abohar, Punjab, India'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-[2.5px] uppercase font-bold text-[#b5a898] mb-1">INVOICE</div>
                    <div className="font-serif-playfair text-[24px] font-bold text-[#2c2825]">{previewInvoice.num}</div>
                    <div className="text-[12px] text-[#7a706a] mt-1">Issued: {previewInvoice.date}</div>
                    <div className="text-[12px] text-[#7a706a]">Due: {previewInvoice.due}</div>
                    <div className="mt-2 inline-block">
                      <span className={`text-[10.5px] font-semibold px-3 py-1 rounded-full ${statusBadges[previewInvoice.status]}`}>
                        {previewInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#e8e1d7] my-5" />

                {/* FROM & BILL TO Grid */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="text-[9.5px] tracking-[2px] uppercase text-[#b5a898] font-bold mb-1.5">FROM</div>
                    <div className="text-[14px] font-semibold text-[#2c2825]">{settings.name || 'Diksha Jangra'}</div>
                    <div className="text-[12px] text-[#7a706a]">{settings.biz || 'Diksha Design Studio'}</div>
                    {settings.gst && <div className="text-[11.5px] text-[#b5a898] mt-0.5">GSTIN: {settings.gst}</div>}
                  </div>

                  <div>
                    <div className="text-[9.5px] tracking-[2px] uppercase text-[#b5a898] font-bold mb-1.5">BILL TO</div>
                    <div className="text-[14px] font-semibold text-[#2c2825]">{previewInvoice.client}</div>
                    {clients.find(c => c.name === previewInvoice.client)?.industry && (
                      <div className="text-[12px] text-[#7a706a]">
                        {clients.find(c => c.name === previewInvoice.client)?.industry}
                      </div>
                    )}
                    <div className="text-[12px] text-[#7a706a]">
                      {clients.find(c => c.name === previewInvoice.client)?.email || 'ux@healthfirst.in'}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse mb-5">
                  <thead>
                    <tr className="bg-[#f7f4ef] text-[10px] uppercase tracking-wider text-[#7a706a] font-bold text-left border-b border-[#e8e1d7]">
                      <th className="p-3">DESCRIPTION</th>
                      <th className="p-3 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#f0ebe3]">
                      <td className="p-3.5 text-[13.5px] font-medium text-[#2c2825]">
                        {previewInvoice.desc || 'Ease Well - Discovery Phase'}
                      </td>
                      <td className="p-3.5 text-[14px] text-right font-bold text-[#2c2825]">{fmF(previewInvoice.amount)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="flex flex-col items-end gap-1.5 py-2 border-t border-[#e8e1d7] mb-5">
                  <div className="flex justify-between w-52 text-[13px] text-[#7a706a]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#2c2825]">{fmF(previewInvoice.amount)}</span>
                  </div>
                  {settings.gst ? (
                    <div className="flex justify-between w-52 text-[13px] text-[#7a706a]">
                      <span>GST (18%)</span>
                      <span className="font-medium text-[#2c2825]">{fmF(Math.round(previewInvoice.amount * 0.18))}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between w-60 text-[18px] font-semibold text-[#2c2825] font-serif-playfair pt-2 border-t border-[#2c2825] mt-1">
                    <span>Total Due</span>
                    <span>{fmF(settings.gst ? Math.round(previewInvoice.amount * 1.18) : previewInvoice.amount)}</span>
                  </div>
                </div>

                {/* Payment Banner Box */}
                <div className="bg-[#f7f4ef] rounded-[10px] p-3.5 text-[12px] text-[#4a4440] border-l-4 border-[#8fac99] mb-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <span><strong>Payment:</strong> {settings.bank || 'diksha@upi'}</span>
                  </div>
                  {settings.gst && <span className="text-[11px] text-[#7a706a]">GSTIN: {settings.gst}</span>}
                </div>

                {/* Notes & Payment Terms Box */}
                <div className="bg-[#f7f4ef] rounded-[10px] p-3.5 text-[12px] text-[#7a706a] border-l-3 border-[#c9963e] mb-5">
                  <strong>Notes / Payment Terms:</strong> Please remit payment within 14 days of issue date. Include invoice number {previewInvoice.num} in reference.
                </div>

                {/* Footer Note */}
                <div className="text-center text-[11.5px] text-[#7a706a] pt-2 border-t border-[#f0ebe3]">
                  Thank you for your business · {settings.biz || 'Diksha Design Studio'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-3.5 py-2 bg-white border border-[#e8e1d7] rounded-[9px] text-[12.5px] font-medium text-[#4a4440]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const invId = previewInvoice.id;
                  setPreviewInvoice(null);
                  onOpenModal('invoice', invId);
                }}
                className="px-3.5 py-2 bg-white border border-[#e8e1d7] rounded-[9px] text-[12.5px] font-medium text-[#3d5a4c] hover:bg-[#f0ebe3] flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Invoice
              </button>
              <button
                onClick={() => {
                  const inv = previewInvoice;
                  setPreviewInvoice(null);
                  handleOpenEmail(inv);
                }}
                className="px-3.5 py-2 bg-[#c9963e]/10 border border-[#c9963e]/22 text-[#c9963e] rounded-[9px] text-[12.5px] font-medium hover:bg-[#c9963e]/18 flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" /> Send Email
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-[#2c2825] text-[#f7f4ef] rounded-[9px] text-[12.5px] font-medium hover:bg-[#4a4440] flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL COMPOSER MODAL */}
      {emailInvoice && (
        <div
          className="fixed inset-0 bg-[#2c2825]/50 z-[800] flex items-center justify-center backdrop-blur-md p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setEmailInvoice(null);
          }}
        >
          <div className="bg-white border border-[#e8e1d7] rounded-[20px] p-7 w-full max-w-[500px] max-h-[92vh] overflow-y-auto shadow-2xl animate-fade-up">
            <div className="flex justify-between items-center mb-5 font-serif-playfair text-[18px]">
              <span>Send Invoice by Email</span>
              <button onClick={() => setEmailInvoice(null)} className="text-[#b5a898] hover:text-[#2c2825]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#f7f4ef] border border-[#e8e1d7] rounded-[12px] p-3.5 mb-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#3d5a4c] flex items-center justify-center text-white text-lg shrink-0">
                  📄
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#2c2825]">{emailInvoice.num}</div>
                  <div className="text-[11px] text-[#b5a898] truncate">{emailInvoice.desc || emailInvoice.client}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadEmailPDF}
                  className="px-2.5 py-1.5 bg-white border border-[#e8e1d7] rounded-[8px] text-[11.5px] font-medium text-[#3d5a4c] hover:bg-[#f0ebe3] flex items-center gap-1 shadow-sm"
                  title="Download PDF to attach in email"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <div className="font-serif-playfair text-[16px] font-medium text-[#2c2825]">
                  {fmF(emailInvoice.amount)}
                </div>
              </div>
            </div>

            <div className="mb-3.5">
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">To (Client Email)</label>
              <input
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#2c2825] outline-none"
              />
            </div>

            <div className="mb-3.5">
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubj}
                onChange={e => setEmailSubj(e.target.value)}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#2c2825] outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Message Body</label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                rows={10}
                className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] p-3 text-[12px] text-[#4a4440] outline-none leading-relaxed resize-y font-mono"
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={handleCopyEmail}
                className="px-3.5 py-2.5 border border-[#e8e1d7] rounded-[9px] text-[12px] font-medium text-[#4a4440] hover:bg-[#f0ebe3] flex items-center gap-1.5 cursor-pointer"
                title="Copy text body to clipboard"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </button>

              <button
                onClick={handleDownloadEmailPDF}
                className="px-3.5 py-2.5 border border-[#e8e1d7] bg-[#f7f4ef] text-[#3d5a4c] hover:bg-[#e8e1d7] rounded-[9px] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                title="Download PDF file to your computer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>

              <button
                onClick={handleSendEmail}
                className="flex-1 py-2.5 bg-white border border-[#e8e1d7] text-[#4a4440] hover:bg-[#f0ebe3] rounded-[9px] text-[12.5px] font-medium flex items-center justify-center gap-2 cursor-pointer"
                title="Open local Mail app with pre-filled email details"
              >
                <Mail className="w-4 h-4" /> Open in Mail App
              </button>

              <button
                onClick={handleDirectSendExpress}
                className="flex-1 py-2.5 bg-[#3d5a4c] text-white hover:bg-[#4e7360] rounded-[9px] text-[12.5px] font-medium flex items-center justify-center gap-2 shadow-md cursor-pointer"
                title="Send directly from the server via SMTP, with the PDF attached"
              >
                <Send className="w-4 h-4 text-[#e8c07a]" /> Send via Server
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
