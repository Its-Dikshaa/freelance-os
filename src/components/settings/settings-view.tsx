'use client';

import React, { useState, useRef } from 'react';
import { UserSettings, QuickPaymentMethod } from '@/types';
import { useToast } from '@/components/ui/toast';
import {
  RotateCcw, Download, Trash2, Save, LogOut, User, FileText,
  ShieldCheck, Database, Building, CreditCard, Mail, MapPin,
  ChevronRight, IndianRupee, QrCode, Plus, Check, Copy, Upload,
  Star, Edit2, AlertCircle, X, ExternalLink, Image as ImageIcon,
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { ini } from '@/lib/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onShowOnboarding: () => void;
  onExportJSON: () => void;
  onResetAll: () => void;
  onLogout?: () => void;
  apiConnected: boolean;
}

type TabId = 'profile' | 'invoicing' | 'quickpay' | 'account' | 'data';

const PRESET_METHODS = [
  { name: 'Google Pay (UPI)', placeholder: 'e.g. yourname@okhdfcbank or 9876543210' },
  { name: 'PhonePe', placeholder: 'e.g. yourname@ybl or mobile number' },
  { name: 'Paytm (UPI)', placeholder: 'e.g. yourname@paytm' },
  { name: 'Generic UPI ID', placeholder: 'e.g. freelancer@upi' },
  { name: 'Bank Transfer (IMPS/NEFT)', placeholder: 'A/C: 1234567890 • IFSC: HDFC0001234 • Name: Diksha J.' },
  { name: 'PayPal', placeholder: 'e.g. paypal.me/yourusername' }
];

export function SettingsView({
  settings,
  onSaveSettings,
  onShowOnboarding,
  onExportJSON,
  onResetAll,
  onLogout,
  apiConnected
}: SettingsViewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Form States
  const [name, setName] = useState(settings.name || '');
  const [profession, setProfession] = useState(settings.profession || '');
  const [email, setEmail] = useState(settings.email || '');
  const [location, setLocation] = useState(settings.location || '');
  const [rate, setRate] = useState<number>(settings.rate || 1500);
  const [biz, setBiz] = useState(settings.biz || '');
  const [gst, setGst] = useState(settings.gst || '');
  const [bank, setBank] = useState(settings.bank || '');
  const [prefix, setPrefix] = useState(settings.prefix || 'INV');

  // Quick Payment Methods State
  const initialMethods: QuickPaymentMethod[] = (settings.paymentMethods && settings.paymentMethods.length > 0)
    ? settings.paymentMethods
    : [
        {
          id: 'pm-1',
          name: 'Google Pay (UPI)',
          accountDetails: settings.bank || 'diksha@upi',
          qrCode: '',
          isDefault: true,
          notes: 'Scan & Pay directly via any UPI App'
        }
      ];

  const [paymentMethods, setPaymentMethods] = useState<QuickPaymentMethod[]>(initialMethods);

  // Add / Edit Payment Method Form State
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formQr, setFormQr] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomQrMethod, setZoomQrMethod] = useState<QuickPaymentMethod | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onSaveSettings({
      ...settings,
      name,
      profession,
      email,
      location,
      rate
    });
    toast('Profile details updated successfully!');
  };

  const handleSaveInvoicing = () => {
    onSaveSettings({
      ...settings,
      biz,
      gst,
      bank,
      prefix
    });
    toast('Invoicing settings saved!');
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      if (confirm('Are you sure you want to log out of FreelanceOS?')) {
        onShowOnboarding();
        toast('Logged out successfully');
      }
    }
  };

  // Process & compress QR image file to optimal base64
  const handleQrFileSelected = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please upload a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setIsCompressingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            setFormQr(optimizedBase64);
            toast('QR Code image uploaded & optimized!');
          }
        } catch {
          setFormQr(e.target?.result as string);
        } finally {
          setIsCompressingImage(false);
        }
      };
      img.onerror = () => {
        setIsCompressingImage(false);
        toast('Failed to load image file', 'error');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddMethod = () => {
    setEditingMethodId(null);
    setFormName('Google Pay (UPI)');
    setFormDetails('');
    setFormQr('');
    setFormIsDefault(paymentMethods.length === 0);
    setFormNotes('Scan & Pay directly via any UPI App');
    setShowMethodForm(true);
  };

  const handleOpenEditMethod = (method: QuickPaymentMethod) => {
    setEditingMethodId(method.id);
    setFormName(method.name);
    setFormDetails(method.accountDetails);
    setFormQr(method.qrCode || '');
    setFormIsDefault(!!method.isDefault);
    setFormNotes(method.notes || '');
    setShowMethodForm(true);
  };

  const handleSavePaymentMethod = () => {
    if (!formName.trim()) {
      toast('Please enter a payment method name', 'error');
      return;
    }
    if (!formDetails.trim()) {
      toast('Please enter UPI ID or Account Details', 'error');
      return;
    }

    let updatedList: QuickPaymentMethod[];

    if (editingMethodId) {
      updatedList = paymentMethods.map(m => {
        if (m.id === editingMethodId) {
          return {
            ...m,
            name: formName.trim(),
            accountDetails: formDetails.trim(),
            qrCode: formQr,
            isDefault: formIsDefault,
            notes: formNotes.trim()
          };
        }
        return formIsDefault ? { ...m, isDefault: false } : m;
      });
    } else {
      const newMethod: QuickPaymentMethod = {
        id: `pm-${Date.now().toString(36)}`,
        name: formName.trim(),
        accountDetails: formDetails.trim(),
        qrCode: formQr,
        isDefault: formIsDefault || paymentMethods.length === 0,
        notes: formNotes.trim()
      };
      updatedList = formIsDefault
        ? [...paymentMethods.map(m => ({ ...m, isDefault: false })), newMethod]
        : [...paymentMethods, newMethod];
    }

    // Ensure at least one method is default
    if (!updatedList.some(m => m.isDefault) && updatedList.length > 0) {
      updatedList[0].isDefault = true;
    }

    setPaymentMethods(updatedList);
    setShowMethodForm(false);

    // Sync to user settings and backend
    const updatedSettings: UserSettings = {
      ...settings,
      bank: updatedList.find(m => m.isDefault)?.accountDetails || formDetails.trim(),
      paymentMethods: updatedList
    };
    onSaveSettings(updatedSettings);

    toast(editingMethodId ? 'Payment method updated!' : 'New payment method added!');
  };

  const handleSetDefault = (id: string) => {
    const updatedList = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === id
    }));
    setPaymentMethods(updatedList);

    const defaultMethod = updatedList.find(m => m.id === id);
    const updatedSettings: UserSettings = {
      ...settings,
      bank: defaultMethod?.accountDetails || settings.bank,
      paymentMethods: updatedList
    };
    onSaveSettings(updatedSettings);
    toast(`"${defaultMethod?.name}" set as Primary on Invoices!`);
  };

  const handleDeleteMethod = (id: string) => {
    const toDelete = paymentMethods.find(m => m.id === id);
    if (!confirm(`Are you sure you want to remove "${toDelete?.name || 'this method'}"?`)) return;

    let updatedList = paymentMethods.filter(m => m.id !== id);
    if (toDelete?.isDefault && updatedList.length > 0) {
      updatedList[0].isDefault = true;
    }

    setPaymentMethods(updatedList);
    const updatedSettings: UserSettings = {
      ...settings,
      bank: updatedList.find(m => m.isDefault)?.accountDetails || settings.bank,
      paymentMethods: updatedList
    };
    onSaveSettings(updatedSettings);
    toast('Payment method removed');
  };

  const handleCopyDetails = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast('Payment details copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: { id: TabId; label: string; icon: React.ElementType; desc: string; badge?: string }[] = [
    { id: 'profile', label: 'Personal Profile', icon: User, desc: 'Name, email, rate & location' },
    { id: 'invoicing', label: 'Invoicing Setup', icon: FileText, desc: 'Studio name, GST & prefix' },
    {
      id: 'quickpay',
      label: 'Quick Pay & QR Codes',
      icon: QrCode,
      desc: 'Add UPI, Bank & QR scanners for invoices',
      badge: `${paymentMethods.length}`
    },
    { id: 'account', label: 'Account & Session', icon: ShieldCheck, desc: 'Security, session & log out' },
    { id: 'data', label: 'Data & Backup', icon: Database, desc: 'Export JSON & reset system' }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-up pb-10">
      {/* Top UX Header Banner */}
      <div className="bg-white border border-[#e8e1d7] rounded-[20px] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#2c2825] to-[#4a4440] flex items-center justify-center font-serif-playfair text-[17px] text-[#e8c07a] font-medium shadow-sm shrink-0">
            {ini(name || 'Diksha')}
          </div>
          <div>
            <h2 className="font-serif-playfair text-[20px] font-medium text-[#2c2825] tracking-tight">
              {name || 'Diksha Jangra'}
            </h2>
            <div className="flex items-center gap-2 text-[12px] text-[#7a706a] mt-0.5">
              <span>{profession || 'UI/UX Designer'}</span>
              <span>•</span>
              <span className="text-[#3d5a4c] font-medium">{email || 'diksha.77123@gmail.com'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium border ${
              apiConnected
                ? 'bg-[#3d5a4c]/10 text-[#3d5a4c] border-[#3d5a4c]/20'
                : 'bg-[#c4623a]/10 text-[#c4623a] border-[#c4623a]/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-[#3d5a4c] animate-pulse' : 'bg-[#c4623a]'}`} />
            {apiConnected ? 'Express API & MongoDB Live' : 'Express API Unreachable'}
          </span>
        </div>
      </div>

      {/* Main Settings Sub-Navigation & Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Nav Tabs (4 cols) */}
        <div className="md:col-span-4 bg-white border border-[#e8e1d7] rounded-[18px] p-2.5 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-[#7a706a] uppercase tracking-wider">
            Navigation
          </div>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-[12px] text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2c2825] text-[#f7f4ef] shadow-sm'
                    : 'hover:bg-[#f7f4ef] text-[#4a4440]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/15 text-[#e8c07a]'
                        : 'bg-[#f7f4ef] text-[#7a706a]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium truncate">{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-[#e8c07a] text-[#2c2825]' : 'bg-[#e8e1d7] text-[#5a524c]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-[10.5px] truncate ${
                        isActive ? 'text-white/60' : 'text-[#7a706a]'
                      }`}
                    >
                      {tab.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#e8c07a] translate-x-0.5' : 'text-[#b5a898]'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Active Section Content Panel (8 cols) */}
        <div className="md:col-span-8 bg-white border border-[#e8e1d7] rounded-[18px] p-6 shadow-sm space-y-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Personal Profile
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Update your public name, profession, and billing rate.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[10px] bg-[#3d5a4c]/10 text-[#3d5a4c] flex items-center justify-center">
                  <User className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Diksha Jangra"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    Profession / Role
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                    placeholder="UI/UX Designer"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="diksha.77123@gmail.com"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#b5a898] absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Abohar, Punjab, India"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                    />
                    <MapPin className="w-4 h-4 text-[#b5a898] absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    Hourly Rate (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate}
                      onChange={e => setRate(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                    />
                    <IndianRupee className="w-4 h-4 text-[#b5a898] absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0ebe3] flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#e8c07a]" /> Save Profile Details
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INVOICING */}
          {activeTab === 'invoicing' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Invoicing & Business Details
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Configure your studio name, GST number, and invoice prefix.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[10px] bg-[#c9963e]/10 text-[#c9963e] flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                  Business / Studio Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={biz}
                    onChange={e => setBiz(e.target.value)}
                    placeholder="Diksha Design Studio"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                  <Building className="w-4 h-4 text-[#b5a898] absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={gst}
                    onChange={e => setGst(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#5a524c] block mb-1.5">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                    placeholder="INV"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                </div>
              </div>

              {/* Cross-Link Card to Quick Pay */}
              <div className="p-4 rounded-[14px] border border-[#3d5a4c]/20 bg-[#3d5a4c]/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#3d5a4c]/12 text-[#3d5a4c] flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#2c2825]">
                      Instant QR Code & Payment Methods
                    </div>
                    <div className="text-[11.5px] text-[#7a706a]">
                      {paymentMethods.length} payment method{paymentMethods.length !== 1 ? 's' : ''} configured. Upload QR scanners to show directly on client invoices.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('quickpay')}
                  className="px-3.5 py-2 bg-[#2c2825] text-white rounded-[8px] text-[12px] font-medium hover:bg-[#4a4440] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  Manage QR ➔
                </button>
              </div>

              <div className="pt-4 border-t border-[#f0ebe3] flex justify-end">
                <button
                  onClick={handleSaveInvoicing}
                  className="px-5 py-2.5 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#e8c07a]" /> Save Invoicing Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QUICK PAY & QR CODES (NEW FEATURE) */}
          {activeTab === 'quickpay' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Quick Payment Methods & QR Scanner
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Add UPI IDs (GPay, PhonePe, Paytm), bank accounts, and QR codes. Clients will see these on invoices for 1-click payment.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[10px] bg-[#3d5a4c]/10 text-[#3d5a4c] flex items-center justify-center">
                  <QrCode className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Action Banner */}
              <div className="flex items-center justify-between bg-[#f7f4ef] border border-[#e8e1d7] rounded-[12px] p-3.5 px-4">
                <div className="text-[12.5px] text-[#5a524c]">
                  <strong className="text-[#2c2825] font-semibold">{paymentMethods.length}</strong> payment method{paymentMethods.length !== 1 ? 's' : ''} available
                </div>
                {!showMethodForm && (
                  <button
                    onClick={handleOpenAddMethod}
                    className="px-3.5 py-1.5 bg-[#2c2825] text-[#f7f4ef] rounded-[8px] text-[12px] font-medium hover:bg-[#4a4440] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> + New Payment Method
                  </button>
                )}
              </div>

              {/* INLINE ADD / EDIT METHOD FORM */}
              {showMethodForm && (
                <div className="bg-[#f7f4ef] border-2 border-[#3d5a4c]/30 rounded-[16px] p-5 space-y-4 animate-fade-up">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e8e1d7]">
                    <span className="font-serif-playfair text-[15px] font-semibold text-[#2c2825]">
                      {editingMethodId ? 'Edit Payment Method' : 'Add New Payment Method'}
                    </span>
                    <button
                      onClick={() => setShowMethodForm(false)}
                      className="text-[#b5a898] hover:text-[#2c2825] p-1 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Pills */}
                  <div>
                    <label className="text-[10px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1.5">
                      Quick Suggestions
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_METHODS.map(preset => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setFormName(preset.name);
                            if (!formDetails) setFormDetails(preset.placeholder.replace('e.g. ', ''));
                          }}
                          className={`px-2.5 py-1 text-[11px] rounded-full border transition-all cursor-pointer ${
                            formName === preset.name
                              ? 'bg-[#3d5a4c] text-white border-[#3d5a4c] font-medium shadow-xs'
                              : 'bg-white text-[#5a524c] border-[#e8e1d7] hover:border-[#b5a898]'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method Name & Account ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10.5px] font-bold text-[#5a524c] uppercase tracking-wider block mb-1">
                        Payment Method Name *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="e.g. Google Pay / PhonePe / Paytm"
                        className="w-full bg-white border border-[#e8e1d7] rounded-[9px] px-3 py-2 text-[12.5px] text-[#2c2825] outline-none focus:border-[#3d5a4c] font-sans-outfit"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-bold text-[#5a524c] uppercase tracking-wider block mb-1">
                        UPI ID / Account Details *
                      </label>
                      <input
                        type="text"
                        value={formDetails}
                        onChange={e => setFormDetails(e.target.value)}
                        placeholder="e.g. diksha@okaxis or Bank Account Details"
                        className="w-full bg-white border border-[#e8e1d7] rounded-[9px] px-3 py-2 text-[12.5px] text-[#2c2825] outline-none focus:border-[#3d5a4c] font-sans-outfit"
                      />
                    </div>
                  </div>

                  {/* QR Code Upload Section */}
                  <div>
                    <label className="text-[10.5px] font-bold text-[#5a524c] uppercase tracking-wider block mb-1.5">
                      QR Code Scanner Image (Optional)
                    </label>

                    <input
                      id="qr-file-input"
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        handleQrFileSelected(file);
                      }}
                    />

                    {formQr ? (
                      <div className="flex items-center gap-4 bg-white border border-[#e8e1d7] rounded-[12px] p-3">
                        <img
                          src={formQr}
                          alt="QR Preview"
                          className="w-20 h-20 object-contain rounded-[8px] border border-[#e8e1d7] bg-[#f7f4ef] p-1 shadow-xs shrink-0"
                        />
                        <div className="space-y-1.5 min-w-0">
                          <div className="text-[12px] font-semibold text-[#2c2825] flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#3d5a4c]" />
                            <span>QR Code ready for invoices</span>
                          </div>
                          <p className="text-[11px] text-[#7a706a]">
                            Clients can scan this image to pay you directly from any banking / UPI app.
                          </p>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] font-medium text-[#3d5a4c] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3 h-3" /> Replace QR
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormQr('')}
                              className="text-[11px] font-medium text-[#c4623a] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove QR
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d4c9b8] hover:border-[#3d5a4c] bg-white rounded-[12px] p-4 text-center cursor-pointer transition-all hover:bg-[#3d5a4c]/5 space-y-1.5"
                      >
                        <div className="w-9 h-9 mx-auto rounded-full bg-[#f7f4ef] text-[#3d5a4c] flex items-center justify-center">
                          {isCompressingImage ? (
                            <span className="w-4 h-4 border-2 border-[#3d5a4c] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <QrCode className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-[12px] font-medium text-[#2c2825]">
                          Click to upload QR Code Scanner Screenshot
                        </div>
                        <div className="text-[11px] text-[#b5a898]">
                          Upload your GPay / PhonePe / Paytm / Bank QR screenshot (JPG, PNG, WebP)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes / Instructions */}
                  <div>
                    <label className="text-[10.5px] font-bold text-[#5a524c] uppercase tracking-wider block mb-1">
                      Payment Notes / Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      placeholder="e.g. Scan with any UPI app. Instant settlement."
                      className="w-full bg-white border border-[#e8e1d7] rounded-[9px] px-3 py-2 text-[12.5px] text-[#2c2825] outline-none focus:border-[#3d5a4c] font-sans-outfit"
                    />
                  </div>

                  {/* Default Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isDefaultCheckbox"
                      checked={formIsDefault}
                      onChange={e => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 accent-[#3d5a4c] cursor-pointer"
                    />
                    <label htmlFor="isDefaultCheckbox" className="text-[12px] text-[#4a4440] font-medium cursor-pointer">
                      Show as <strong>Primary / Default</strong> payment method on client invoices
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#e8e1d7]">
                    <button
                      type="button"
                      onClick={() => setShowMethodForm(false)}
                      className="px-4 py-2 text-[12px] font-medium text-[#7a706a] hover:text-[#2c2825] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePaymentMethod}
                      className="px-4.5 py-2 text-[12.5px] font-semibold bg-[#2c2825] text-white rounded-[9px] hover:bg-[#4a4440] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5 text-[#e8c07a]" /> Save Payment Method
                    </button>
                  </div>
                </div>
              )}

              {/* LIST OF CONFIGURED METHODS */}
              <div className="space-y-3">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-10 bg-[#f7f4ef]/60 border border-dashed border-[#e8e1d7] rounded-[16px] space-y-2 p-6">
                    <div className="w-11 h-11 mx-auto rounded-full bg-white text-[#b5a898] flex items-center justify-center border border-[#e8e1d7]">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="text-[13px] font-medium text-[#2c2825]">No payment methods added yet</div>
                    <p className="text-[12px] text-[#7a706a] max-w-sm mx-auto">
                      Add your UPI ID or QR code to allow your clients to settle invoices immediately.
                    </p>
                    <button
                      onClick={handleOpenAddMethod}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2c2825] text-white rounded-[8px] text-[12px] font-medium hover:bg-[#4a4440]"
                    >
                      <Plus className="w-4 h-4" /> Add Payment Method
                    </button>
                  </div>
                ) : (
                  paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className={`bg-white border rounded-[16px] p-4.5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        method.isDefault ? 'border-[#3d5a4c] ring-1 ring-[#3d5a4c]/20' : 'border-[#e8e1d7] hover:border-[#b5a898]'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        {method.qrCode ? (
                          <div
                            onClick={() => setZoomQrMethod(method)}
                            className="relative group cursor-pointer shrink-0"
                            title="Click to view QR scanner full size"
                          >
                            <img
                              src={method.qrCode}
                              alt="QR"
                              className="w-14 h-14 object-contain rounded-[10px] border border-[#e8e1d7] bg-[#f7f4ef] p-0.5 shadow-xs transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 rounded-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                              Zoom
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-[10px] bg-[#f7f4ef] border border-[#e8e1d7] flex flex-col items-center justify-center text-[#7a706a] shrink-0">
                            <CreditCard className="w-5 h-5 text-[#3d5a4c]" />
                            <span className="text-[9px] mt-0.5 font-bold uppercase tracking-wider text-[#b5a898]">No QR</span>
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13.5px] font-bold text-[#2c2825]">
                              {method.name}
                            </span>
                            {method.isDefault && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#3d5a4c]/10 text-[#3d5a4c] border border-[#3d5a4c]/25 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-[#3d5a4c]" /> Primary on Invoices
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[12.5px] font-mono text-[#4a4440]">
                            <span className="truncate max-w-[220px] sm:max-w-[280px]">
                              {method.accountDetails}
                            </span>
                            <button
                              onClick={() => handleCopyDetails(method.accountDetails, method.id)}
                              className="text-[#b5a898] hover:text-[#2c2825] p-0.5 rounded transition-colors"
                              title="Copy details"
                            >
                              {copiedId === method.id ? (
                                <Check className="w-3.5 h-3.5 text-[#3d5a4c]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {method.notes && (
                            <div className="text-[11px] text-[#8c827a] italic truncate">
                              {method.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="px-2.5 py-1 text-[11.5px] font-medium text-[#3d5a4c] border border-[#3d5a4c]/30 rounded-[7px] hover:bg-[#3d5a4c]/10 transition-colors cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditMethod(method)}
                          className="p-1.5 text-[#7a706a] hover:text-[#2c2825] hover:bg-[#f0ebe3] rounded-[7px] transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMethod(method.id)}
                          className="p-1.5 text-[#c4623a] hover:bg-[#c4623a]/10 rounded-[7px] transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT & SESSION */}
          {activeTab === 'account' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Account & Session Management
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Control active session, re-run onboarding setup, or sign out.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[10px] bg-[#c4623a]/10 text-[#c4623a] flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="bg-[#f7f4ef] border border-[#e8e1d7] rounded-[14px] p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7a706a] uppercase tracking-wider">
                    Current Active User
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      apiConnected
                        ? 'bg-[#3d5a4c]/10 text-[#3d5a4c] border-[#3d5a4c]/20'
                        : 'bg-[#c4623a]/10 text-[#c4623a] border-[#c4623a]/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-[#3d5a4c] animate-pulse' : 'bg-[#c4623a]'}`} />
                    {apiConnected ? 'Express REST API Connected' : 'Express REST API Unreachable'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 pt-1">
                  <div className="w-11 h-11 rounded-[12px] bg-[#2c2825] text-[#e8c07a] font-serif-playfair flex items-center justify-center text-[16px] font-medium shrink-0 shadow-inner">
                    {ini(name || 'Diksha')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-[#2c2825] truncate">
                      {name || 'Diksha Jangra'}
                    </div>
                    <div className="text-[12px] text-[#7a706a] truncate">
                      {email || 'diksha.77123@gmail.com'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <div className="p-4 rounded-[14px] border border-[#c4623a]/20 bg-[#c4623a]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#c4623a]">Log Out of Session</div>
                    <div className="text-[11.5px] text-[#7a706a]">
                      End your current session and return to the login screen.
                    </div>
                  </div>
                  <button
                    onClick={handleLogoutAction}
                    className="px-4 py-2.5 bg-[#c4623a] text-white hover:bg-[#a84d2a] rounded-[10px] text-[12.5px] font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>

                <div className="p-4 rounded-[14px] border border-[#e8e1d7] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#2c2825]">Re-run Setup Wizard</div>
                    <div className="text-[11.5px] text-[#7a706a]">
                      Re-configure initial profile and target goals.
                    </div>
                  </div>
                  <button
                    onClick={onShowOnboarding}
                    className="px-4 py-2 bg-[#f7f4ef] hover:bg-[#e8e1d7] text-[#4a4440] rounded-[10px] text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Wizard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Data Management & Backups
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Export your full workspace data or perform a clean system data reset.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-[10px] bg-[#4a7fa5]/10 text-[#4a7fa5] flex items-center justify-center">
                  <Database className="w-4.5 h-4.5" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-[14px] border border-[#e8e1d7] bg-[#f7f4ef]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#2c2825]">Export JSON Data Backup</div>
                    <div className="text-[11.5px] text-[#7a706a]">
                      Download a JSON file containing all projects, clients, tasks, and invoices.
                    </div>
                  </div>
                  <button
                    onClick={onExportJSON}
                    className="px-4 py-2.5 bg-[#2c2825] text-[#f7f4ef] hover:bg-[#4a4440] rounded-[10px] text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-[#e8c07a]" /> Export JSON
                  </button>
                </div>

                <div className="p-4 rounded-[14px] border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-red-600">Reset All Workspace Data</div>
                    <div className="text-[11.5px] text-red-500/80">
                      Permanently clear local cache and restore default demo data.
                    </div>
                  </div>
                  <button
                    onClick={onResetAll}
                    className="px-4 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-[10px] text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset System
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL QR ZOOM MODAL */}
      {zoomQrMethod && zoomQrMethod.qrCode && (
        <div
          className="fixed inset-0 bg-[#2c2825]/60 z-[900] flex items-center justify-center backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setZoomQrMethod(null)}
        >
          <div
            className="bg-white border border-[#e8e1d7] rounded-[22px] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#f0ebe3]">
              <span className="font-serif-playfair text-[16px] font-semibold text-[#2c2825]">
                {zoomQrMethod.name} QR Code
              </span>
              <button
                onClick={() => setZoomQrMethod(null)}
                className="text-[#b5a898] hover:text-[#2c2825] p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#f7f4ef] rounded-[16px] border border-[#e8e1d7] inline-block mx-auto">
              <img
                src={zoomQrMethod.qrCode}
                alt="QR Code Scanner"
                className="w-56 h-56 object-contain rounded-[10px] bg-white p-2 shadow-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[13px] font-mono font-semibold text-[#2c2825]">
                {zoomQrMethod.accountDetails}
              </div>
              <p className="text-[11.5px] text-[#7a706a]">
                Scan with Google Pay, PhonePe, Paytm, or any UPI app
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleCopyDetails(zoomQrMethod.accountDetails, 'zoom-copy')}
                className="flex-1 py-2 text-[12px] font-medium border border-[#e8e1d7] rounded-[9px] hover:bg-[#f0ebe3] flex items-center justify-center gap-1.5 text-[#2c2825]"
              >
                <Copy className="w-3.5 h-3.5" /> Copy ID
              </button>
              <button
                onClick={() => setZoomQrMethod(null)}
                className="flex-1 py-2 text-[12px] font-semibold bg-[#2c2825] text-white rounded-[9px] hover:bg-[#4a4440]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
