'use client';

import React, { useState } from 'react';
import { UserSettings } from '@/types';
import { useToast } from '@/components/ui/toast';
import { apiLogin, apiSignup } from '@/lib/api';
import { Check, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: (settings: Partial<UserSettings>) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { toast } = useToast();

  const [step, setStep] = useState<'auth' | 'profile' | 'work' | 'biz' | 'done'>('auth');
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states - Clean empty defaults
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [terms, setTerms] = useState(true);

  // Profile setup states
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [rate, setRate] = useState<number>(1000);

  // Work type chips
  const [selectedChips, setSelectedChips] = useState<string[]>(['Design']);
  const [clientCount, setClientCount] = useState('2–5');

  // Business setup
  const [biz, setBiz] = useState('');
  const [gst, setGst] = useState('');
  const [prefix, setPrefix] = useState('INV');
  const [bank, setBank] = useState('');

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast('Please enter your email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem('fos_user_onboarded', 'true');
      toast(`Welcome back, ${res.user.name || 'User'}!`);
      onComplete(res.user);
    } catch (err: any) {
      toast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast('Please fill in your name, email, and password', 'error');
      return;
    }
    if (!terms) {
      toast('Please accept the Terms to continue', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiSignup({
        name,
        email,
        password,
        profession: 'Freelancer',
        biz: `${name}'s Studio`
      });
      setStep('profile');
    } catch (err: any) {
      toast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = () => {
    setStep('done');
  };

  const handleEnterApp = async () => {
    setLoading(true);
    try {
      const userObj = {
        name,
        email,
        profession: profession || 'Freelancer',
        location,
        hourlyRate: rate,
        biz: biz || `${name || 'Freelancer'}'s Studio`,
        gst,
        bank,
        prefix
      };

      await apiUpdateUser(userObj);
      localStorage.setItem('fos_user_onboarded', 'true');
      toast('Workspace ready! Welcome to FreelanceOS');
      onComplete(userObj);
    } catch (err: any) {
      localStorage.setItem('fos_user_onboarded', 'true');
      onComplete({ name, email });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-6 sm:p-8">
      {/* Ambient background blur blobs */}
      <div className="fixed w-[420px] h-[420px] bg-[#c4d8cc] rounded-full blur-[60px] opacity-35 -top-35 -left-30 pointer-events-none" />
      <div className="fixed w-[380px] h-[380px] bg-[#e8c07a] rounded-full blur-[60px] opacity-25 -bottom-40 -right-25 pointer-events-none" />

      {/* Main split shell card */}
      <div className="w-full max-w-[960px] bg-white border border-[#e8e1d7] rounded-[24px] shadow-2xl grid grid-cols-1 md:grid-cols-[0.85fr_1fr] overflow-hidden min-h-[600px] animate-fade-up">

        {/* Left Brand Panel */}
        <div className="bg-[#2c2825] text-[#f7f4ef] p-9 sm:p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div>
            <div className="font-serif-playfair text-[20px] font-medium text-[#f7f4ef] tracking-tight">
              Freelance<em className="not-italic text-[#e8c07a]">OS</em>
              <span className="inline-block w-1.5 h-1.5 bg-[#8fac99] rounded-full mb-0.5 ml-0.5" />
            </div>
            <div className="text-[9.5px] text-white/30 tracking-[1.8px] uppercase mt-1 font-light">
              Your work · your rules
            </div>
          </div>

          <div className="my-10">
            <h2 className="font-serif-playfair text-[27px] font-medium leading-[1.28] text-[#f7f4ef] max-w-[320px]">
              Run your freelance business like a <em className="not-italic text-[#e8c07a]">studio</em>, not a scramble.
            </h2>
            <p className="text-[13px] text-white/50 mt-3.5 max-w-[290px] leading-relaxed font-light">
              Projects, clients, invoices and payments — organized in one calm workspace built for independent creatives.
            </p>

            <div className="flex flex-col gap-3.5 mt-9">
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif-playfair text-[19px] text-[#e8c07a]">2,400+</span>
                <span className="text-[11.5px] text-white/40 font-light">freelancers onboard</span>
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif-playfair text-[19px] text-[#e8c07a]">₹4.2Cr+</span>
                <span className="text-[11.5px] text-white/40 font-light">invoiced through FreelanceOS</span>
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif-playfair text-[19px] text-[#e8c07a]">98%</span>
                <span className="text-[11.5px] text-white/40 font-light">get paid on time</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-auto">
            <p className="text-[12px] text-white/60 font-light leading-relaxed">
              &quot;I stopped chasing spreadsheets. Now my invoices, clients and deadlines actually live in one place.&quot;
            </p>
            <div className="text-[10.5px] text-white/35 mt-2 tracking-wide">— Diksha J., UI/UX Designer</div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">

          {/* STEP 1: AUTHENTICATION */}
          {step === 'auth' && (
            <div className="animate-fade-up">
              <div className="flex gap-1 bg-[#f0ebe3] rounded-[11px] p-1 mb-7">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 text-center py-2 rounded-[8px] text-[12.5px] font-medium transition-all ${
                    authTab === 'login' ? 'bg-white text-[#2c2825] shadow-sm' : 'text-[#7a706a]'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 text-center py-2 rounded-[8px] text-[12.5px] font-medium transition-all ${
                    authTab === 'signup' ? 'bg-white text-[#2c2825] shadow-sm' : 'text-[#7a706a]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authTab === 'login' && (
                <div>
                  <h2 className="font-serif-playfair text-[22px] font-medium text-[#2c2825] mb-1">Welcome back</h2>
                  <p className="text-[12.5px] text-[#7a706a] mb-6">Log in to pick up right where you left off.</p>

                  <div className="mb-4">
                    <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#8fac99] focus:ring-2 focus:ring-[#8fac99]/15"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#8fac99] focus:ring-2 focus:ring-[#8fac99]/15 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5a898] hover:text-[#4a4440]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all shadow-md mt-2"
                  >
                    Log In
                  </button>
                </div>
              )}

              {authTab === 'signup' && (
                <div>
                  <h2 className="font-serif-playfair text-[22px] font-medium text-[#2c2825] mb-1">Create your account</h2>
                  <p className="text-[12.5px] text-[#7a706a] mb-6">Takes about a minute. No card required.</p>

                  <div className="mb-3.5">
                    <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#8fac99]"
                    />
                  </div>

                  <div className="mb-3.5">
                    <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#8fac99]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none focus:border-[#8fac99]"
                    />
                  </div>

                  <div className="mb-5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={terms}
                      onChange={e => setTerms(e.target.checked)}
                      className="accent-[#3d5a4c] w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-[12px] text-[#7a706a] cursor-pointer">
                      I agree to the Terms and Privacy Policy
                    </label>
                  </div>

                  <button
                    onClick={handleSignup}
                    className="w-full py-3 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all shadow-md"
                  >
                    Create Account →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 'profile' && (
            <div className="animate-fade-up">
              <div className="text-[10.5px] text-[#b5a898] uppercase tracking-wider font-semibold mb-2">Step 1 of 3</div>
              <div className="flex gap-1.5 mb-6">
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
                <div className="h-1 flex-1 bg-[#e8e1d7] rounded-full" />
                <div className="h-1 flex-1 bg-[#e8e1d7] rounded-full" />
              </div>

              <h2 className="font-serif-playfair text-[22px] font-medium text-[#2c2825] mb-1">Tell us about you</h2>
              <p className="text-[12.5px] text-[#7a706a] mb-6">This shows up on your invoices and client-facing pages.</p>

              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Profession</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={e => setProfession(e.target.value)}
                    placeholder="UI/UX Designer"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                  />
                </div>
              </div>

              <div className="mb-3.5">
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                />
              </div>

              <div className="mb-6">
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  placeholder="1500"
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep('auth')}
                  className="px-4 py-2.5 border border-[#e8e1d7] rounded-[10px] text-[13px] text-[#4a4440] hover:bg-[#f0ebe3] transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep('work')}
                  className="flex-1 py-2.5 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all flex items-center justify-center gap-1.5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WORK TYPE */}
          {step === 'work' && (
            <div className="animate-fade-up">
              <div className="text-[10.5px] text-[#b5a898] uppercase tracking-wider font-semibold mb-2">Step 2 of 3</div>
              <div className="flex gap-1.5 mb-6">
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
                <div className="h-1 flex-1 bg-[#e8e1d7] rounded-full" />
              </div>

              <h2 className="font-serif-playfair text-[22px] font-medium text-[#2c2825] mb-1">What kind of work do you do?</h2>
              <p className="text-[12.5px] text-[#7a706a] mb-6">Pick what applies — we&apos;ll tailor your dashboard around it.</p>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {['Design', 'Development', 'Writing', 'Marketing', 'Consulting', 'Other'].map(chip => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`p-3 border rounded-[10px] text-[12.5px] flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-[#3d5a4c] bg-[#8fac99]/12 text-[#2c2825] font-medium'
                          : 'border-[#e8e1d7] text-[#4a4440] hover:border-[#b5a898] hover:bg-[#f0ebe3]'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${isSelected ? 'text-[#3d5a4c]' : 'text-[#b5a898]'}`} />
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-6">
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">
                  How many clients do you usually juggle?
                </label>
                <select
                  value={clientCount}
                  onChange={e => setClientCount(e.target.value)}
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#2c2825] outline-none"
                >
                  <option value="Just 1">Just 1</option>
                  <option value="2–5">2–5</option>
                  <option value="6–10">6–10</option>
                  <option value="10+">10+</option>
                </select>
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep('profile')}
                  className="px-4 py-2.5 border border-[#e8e1d7] rounded-[10px] text-[13px] text-[#4a4440] hover:bg-[#f0ebe3] transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep('biz')}
                  className="flex-1 py-2.5 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all flex items-center justify-center gap-1.5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BUSINESS */}
          {step === 'biz' && (
            <div className="animate-fade-up">
              <div className="text-[10.5px] text-[#b5a898] uppercase tracking-wider font-semibold mb-2">Step 3 of 3</div>
              <div className="flex gap-1.5 mb-6">
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
                <div className="h-1 flex-1 bg-[#3d5a4c] rounded-full" />
              </div>

              <h2 className="font-serif-playfair text-[22px] font-medium text-[#2c2825] mb-1">Set up invoicing</h2>
              <p className="text-[12.5px] text-[#7a706a] mb-6">Optional — you can always fill this in later from Settings.</p>

              <div className="mb-3.5">
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Business / Studio Name</label>
                <input
                  type="text"
                  value={biz}
                  onChange={e => setBiz(e.target.value)}
                  placeholder="My Design Studio"
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div>
                  <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">GST Number</label>
                  <input
                    type="text"
                    value={gst}
                    onChange={e => setGst(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={e => setPrefix(e.target.value)}
                    placeholder="INV"
                    className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-[10.5px] font-bold text-[#7a706a] uppercase tracking-wider block mb-1">UPI / Bank Details</label>
                <input
                  type="text"
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  placeholder="UPI ID or bank details"
                  className="w-full bg-[#f7f4ef] border border-[#e8e1d7] rounded-[10px] px-3.5 py-2.5 text-[13px]"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => setStep('work')}
                  className="px-4 py-2.5 border border-[#e8e1d7] rounded-[10px] text-[13px] text-[#4a4440] hover:bg-[#f0ebe3] transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleFinishSetup}
                  className="flex-1 py-2.5 bg-[#3d5a4c] text-white rounded-[10px] text-[13px] font-medium hover:bg-[#4e7360] transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  Finish Setup →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETED */}
          {step === 'done' && (
            <div className="text-center py-6 animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-[#8fac99]/18 border border-[#8fac99] flex items-center justify-center mx-auto mb-5 text-[#3d5a4c]">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="font-serif-playfair text-[24px] font-medium text-[#2c2825] mb-2">
                You&apos;re all set, {name.split(' ')[0]}
              </h2>
              <p className="text-[13px] text-[#7a706a] mb-7">Your workspace is ready. Let&apos;s get to work.</p>

              <button
                onClick={handleEnterApp}
                className="w-full py-3 bg-[#2c2825] text-[#f7f4ef] rounded-[10px] text-[13px] font-medium hover:bg-[#4a4440] transition-all shadow-lg"
              >
                Go to Dashboard →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
