import React, { useState } from 'react';
import { Shield, Building2, HeartPulse, Lock, Mail, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; token: string; email: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  // Only two role options: 'GOVERNMENT' | 'VOLUNTEER'
  const [selectedRole, setSelectedRole] = useState<'GOVERNMENT' | 'VOLUNTEER'>('GOVERNMENT');
  
  // Auth Mode: 'PASSWORD' | 'OTP'
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  
  // Input fields
  const [email, setEmail] = useState<string>('command.ndrf@disaster.gov.in');
  const [password, setPassword] = useState<string>('VajraCommand2026!');
  const [otp, setOtp] = useState<string>('829104');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Government Domain Validator
  const isGovEmail = (emailStr: string): boolean => {
    const clean = emailStr.toLowerCase().trim();
    return (
      clean.endsWith('.gov') ||
      clean.endsWith('.gov.in') ||
      clean.endsWith('.nic.in') ||
      clean.endsWith('.mil') ||
      clean.includes('.gov.') ||
      clean.includes('@gov.')
    );
  };

  const handleRoleSwitch = (role: 'GOVERNMENT' | 'VOLUNTEER') => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'GOVERNMENT') {
      setEmail('command.ndrf@disaster.gov.in');
    } else {
      setEmail('alex.mercer@redcross.org');
    }
  };

  const handleSendOtp = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address first.');
      return;
    }
    if (selectedRole === 'GOVERNMENT' && !isGovEmail(email)) {
      setErrorMessage('Government portal requires an official .gov, .gov.in, or .nic.in email.');
      return;
    }
    setErrorMessage(null);
    setOtpSent(true);
    setOtp('829104');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();

    // 1. Validate Government Email
    if (selectedRole === 'GOVERNMENT') {
      if (!isGovEmail(cleanEmail)) {
        setErrorMessage('Access Denied: Government Command requires an official government email (e.g. ending in .gov, .gov.in, or .nic.in).');
        return;
      }
    }

    // 2. Validate General Email format
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    // 3. Validate Auth Inputs
    if (authMode === 'PASSWORD' && !password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (authMode === 'OTP' && otp.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit verification OTP.');
      return;
    }

    setIsLoading(true);

    const displayName = selectedRole === 'GOVERNMENT' 
      ? `Officer Sharma (NDRF HQ)` 
      : `Alex Mercer (${cleanEmail.split('@')[0]})`;

    const token = selectedRole === 'GOVERNMENT' ? 'mock-government-token' : 'mock-volunteer-token';

    localStorage.setItem('vajranet_token', token);
    localStorage.setItem('vajranet_user', JSON.stringify({
      name: displayName,
      role: selectedRole,
      email: cleanEmail
    }));

    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: displayName,
        role: selectedRole,
        token,
        email: cleanEmail
      });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Glassmorphic Container */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-blue-600/20 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase flex items-center justify-center gap-2">
            <span>VAJRANET</span>
            <span className="text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full border border-blue-800/80 font-mono">EOC</span>
          </h1>
          <p className="text-xs text-slate-400">
            Emergency Operations & Disaster Response Command Platform
          </p>
        </div>

        {/* 2 Roles Selector (Only Govt & Volunteer) */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleSwitch('GOVERNMENT')}
            className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedRole === 'GOVERNMENT'
                ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className={`w-4 h-4 ${selectedRole === 'GOVERNMENT' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="font-bold text-xs">🏛️ Government</span>
            </div>
            <span className="text-[9px] text-blue-400/90 font-mono">Needs .gov Email</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('VOLUNTEER')}
            className={`py-3 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              selectedRole === 'VOLUNTEER'
                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <HeartPulse className={`w-4 h-4 ${selectedRole === 'VOLUNTEER' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="font-bold text-xs">🤝 Volunteer</span>
            </div>
            <span className="text-[9px] text-emerald-400/90 font-mono">Any Email Works</span>
          </button>
        </div>

        {/* Validation Error Alert */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-600/80 rounded-2xl p-3 text-xs text-rose-200 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                {selectedRole === 'GOVERNMENT' ? 'Official Government Email' : 'Email Address'}
              </label>
              {selectedRole === 'GOVERNMENT' && (
                <span className="text-[10px] text-blue-400 font-mono font-bold">.gov / .nic.in required</span>
              )}
            </div>

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder={selectedRole === 'GOVERNMENT' ? 'officer.name@ndrf.gov.in' : 'volunteer@organization.org'}
                className={`w-full bg-slate-950 border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition ${
                  selectedRole === 'GOVERNMENT' && !isGovEmail(email) && email.length > 3
                    ? 'border-amber-500/80 focus:border-amber-500'
                    : 'border-slate-800 focus:border-blue-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Auth Method Switcher (Password vs OTP) */}
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs font-semibold text-slate-300">Authentication Method</label>
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('PASSWORD')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  authMode === 'PASSWORD' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('OTP')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  authMode === 'OTP' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                6-Digit OTP
              </button>
            </div>
          </div>

          {/* Mode A: Password Input */}
          {authMode === 'PASSWORD' && (
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono transition"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Mode B: 6-Digit OTP Input */}
          {authMode === 'OTP' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                >
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>

              {/* Instant Demo OTP Hint */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                <span>Demo OTP Code: <strong>829104</strong></span>
                <span className="text-[9px] text-slate-500">Auto-filled</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              selectedRole === 'GOVERNMENT'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Enter {selectedRole === 'GOVERNMENT' ? 'Command Center' : 'Volunteer Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill Links */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('GOVERNMENT');
              setEmail('command.ndrf@disaster.gov.in');
              setErrorMessage(null);
            }}
            className="hover:text-blue-400 transition underline cursor-pointer"
          >
            Govt Demo (.gov)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('VOLUNTEER');
              setEmail('alex.mercer@redcross.org');
              setErrorMessage(null);
            }}
            className="hover:text-emerald-400 transition underline cursor-pointer"
          >
            Volunteer Demo
          </button>
        </div>

      </div>
    </div>
  );
}
