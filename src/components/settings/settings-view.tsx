'use client';

import React, { useState, useRef } from 'react';
import { UserSettings } from '@/types';
import { useToast } from '@/components/ui/toast';
import {
  RotateCcw, Download, Trash2, Save, LogOut, User, FileText,
  ShieldCheck, Database, Building, CreditCard, Mail, MapPin,
  ChevronRight, Upload, KeyRound, Eye, EyeOff
} from 'lucide-react';
import { ini } from '@/lib/storage';
import { apiChangePassword } from '@/lib/api';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onShowOnboarding: () => void;
  onExportJSON: () => void;
  onImportJSON?: (file: File) => void;
  onResetAll: () => void;
  onLogout?: () => void;
  apiConnected: boolean;
}

type TabId = 'profile' | 'invoicing' | 'account' | 'data';

export function SettingsView({
  settings,
  onSaveSettings,
  onShowOnboarding,
  onExportJSON,
  onImportJSON,
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
  const [currency, setCurrency] = useState(settings.currency || '₹');

  // Change Password States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form inputs synchronized whenever `settings` prop updates (e.g. from apiGetMe or parent update)
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setName(settings.name || '');
    setProfession(settings.profession || '');
    setEmail(settings.email || '');
    setLocation(settings.location || '');
    setRate(settings.rate ?? 1500);
    setBiz(settings.biz || '');
    setGst(settings.gst || '');
    setBank(settings.bank || '');
    setPrefix(settings.prefix || 'INV');
    setCurrency(settings.currency || '₹');
  }

  const getCurrentSettingsPayload = (): UserSettings => ({
    ...settings,
    name: name.trim(),
    profession: profession.trim(),
    email: email.trim(),
    location: location.trim(),
    rate: Number(rate) || 0,
    biz: biz.trim(),
    gst: gst.trim(),
    bank: bank.trim(),
    prefix: prefix.trim() || 'INV',
    currency: currency.trim() || '₹'
  });

  const handleSaveProfile = () => {
    onSaveSettings(getCurrentSettingsPayload());
    toast('Profile details updated successfully!');
  };

  const handleSaveInvoicing = () => {
    onSaveSettings(getCurrentSettingsPayload());
    toast('Invoicing settings saved!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword) {
      toast('Please enter your current password', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New password and confirmation do not match', 'error');
      return;
    }
    try {
      setChangingPass(true);
      await apiChangePassword(currPassword, newPassword);
      toast('Password changed successfully!');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update password', 'error');
    } finally {
      setChangingPass(false);
    }
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

  const tabs: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'profile', label: 'Personal Profile', icon: User, desc: 'Name, email, rate & location' },
    { id: 'invoicing', label: 'Invoicing Setup', icon: FileText, desc: 'Studio name, GST & bank' },
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
                    <div className="text-[13px] font-medium truncate">{tab.label}</div>
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
                    Hourly Rate ({currency})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate}
                      onChange={e => setRate(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                    />
                    <span className="text-[13px] font-semibold text-[#b5a898] absolute left-3.5 top-2.5">{currency}</span>
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
                    Invoicing & Payment Setup
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Configure your business name, default currency, invoice numbering, and payment details.
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
                    Default Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all cursor-pointer font-medium"
                  >
                    <option value="₹">₹ — Indian Rupee (INR)</option>
                    <option value="$">$ — US Dollar (USD)</option>
                    <option value="€">€ — Euro (EUR)</option>
                    <option value="£">£ — British Pound (GBP)</option>
                    <option value="A$">A$ — Australian Dollar (AUD)</option>
                    <option value="C$">C$ — Canadian Dollar (CAD)</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="¥">¥ — Japanese Yen (JPY)</option>
                    <option value="S$">S$ — Singapore Dollar (SGD)</option>
                  </select>
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
                  UPI / Bank Details for Invoices
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bank}
                    onChange={e => setBank(e.target.value)}
                    placeholder="diksha@upi or HDFC Bank Account Details"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] pl-9 pr-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                  />
                  <CreditCard className="w-4 h-4 text-[#b5a898] absolute left-3 top-3" />
                </div>
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

          {/* TAB 3: ACCOUNT & SESSION */}
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
                {/* Change Password Form Card */}
                <div className="bg-[#f7f4ef]/60 border border-[#e8e1d7] rounded-[14px] p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e1d7]">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#3d5a4c]" />
                      <span className="text-[13px] font-medium text-[#2c2825]">Change Password</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11.5px] text-[#7a706a] hover:text-[#2c2825] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPassword ? 'Hide' : 'Show'} Passwords
                    </button>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#5a524c] block mb-1">
                        Current Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currPassword}
                        onChange={e => setCurrPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                        className="w-full bg-white border border-[#e8e1d7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#5a524c] block mb-1">
                          New Password (min 6 characters)
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="New secure password"
                          required
                          minLength={6}
                          className="w-full bg-white border border-[#e8e1d7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#5a524c] block mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          minLength={6}
                          className="w-full bg-white border border-[#e8e1d7] rounded-[10px] px-3.5 py-2 text-[13px] text-[#2c2825] outline-none focus:border-[#3d5a4c] focus:ring-2 focus:ring-[#3d5a4c]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        type="submit"
                        disabled={changingPass}
                        className="px-4 py-2 bg-[#2c2825] hover:bg-[#4a4440] text-[#f7f4ef] rounded-[10px] text-[12.5px] font-medium transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#e8c07a]" />
                        {changingPass ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

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

          {/* TAB 4: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="space-y-5 animate-fade-in">
              <div className="pb-4 border-b border-[#f0ebe3] flex items-center justify-between">
                <div>
                  <h3 className="font-serif-playfair text-[17px] font-medium text-[#2c2825]">
                    Data Management & Backups
                  </h3>
                  <p className="text-[12px] text-[#7a706a] mt-0.5">
                    Export your full workspace data or restore from a backup file.
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
                      Download a JSON file containing all projects, clients, tasks, payments, and invoices.
                    </div>
                  </div>
                  <button
                    onClick={onExportJSON}
                    className="px-4 py-2.5 bg-[#2c2825] text-[#f7f4ef] hover:bg-[#4a4440] rounded-[10px] text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-[#e8c07a]" /> Export JSON
                  </button>
                </div>

                <div className="p-4 rounded-[14px] border border-[#e8e1d7] bg-[#f7f4ef]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-[#2c2825]">Import JSON Data Backup</div>
                    <div className="text-[11.5px] text-[#7a706a]">
                      Restore workspace projects, clients, tasks, and invoices from an exported JSON file.
                    </div>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file && onImportJSON) {
                          onImportJSON(file);
                          e.target.value = '';
                        }
                      }}
                      accept=".json,application/json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white border border-[#e8e1d7] hover:border-[#3d5a4c] text-[#2c2825] rounded-[10px] text-[12.5px] font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer shrink-0"
                    >
                      <Upload className="w-4 h-4 text-[#3d5a4c]" /> Import JSON
                    </button>
                  </div>
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
    </div>
  );
}
