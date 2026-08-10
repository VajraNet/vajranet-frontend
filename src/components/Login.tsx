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
    <div className="min-h-screen bg-gradient-to-b from-[#07172C] via-[#0E294B] to-[#07172C] flex flex-col justify-center items-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0077B6]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-lg space-y-5 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-1 mb-1">
            <img 
              src="/app-icon.jpg" 
              alt="VajraNet Logo" 
              className="w-16 h-16 rounded-2xl border-2 border-cyan-400/40 shadow-2xl object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase flex items-center justify-center gap-2">
            <span>VAJRANET</span>
            <span className="text-[10px] bg-[#07172C] text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">EOC</span>
          </h1>
          <p className="text-xs text-cyan-300 font-semibold font-mono tracking-wide">
            "When Towers Fall, VajraNet Stands."
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Emergency Operations & Disaster Response Command Platform
          </p>
        </div>

        {/* High-Contrast Crisp White Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          
          {/* 2 Role Tabs Switcher */}
          <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleSwitch('GOVERNMENT')}
              className={`py-3.5 px-3 flex items-center justify-center gap-2 transition cursor-pointer ${
                selectedRole === 'GOVERNMENT'
                  ? 'bg-[#0077B6] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏛️ Command Authority</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('VOLUNTEER')}
              className={`py-3.5 px-3 flex items-center justify-center gap-2 transition cursor-pointer ${
                selectedRole === 'VOLUNTEER'
                  ? 'bg-[#059669] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>🤝 Volunteer & Responders</span>
            </button>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-4">
            
            <p className="text-center text-xs text-slate-500 font-medium">
              {selectedRole === 'GOVERNMENT' && 'Restricted Command Center Access (Requires .gov / .nic.in email)'}
              {selectedRole === 'VOLUNTEER' && 'Registered NGOs, Field Medical Personnel & Volunteer Response Teams'}
            </p>

            {/* Validation Error Alert */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    {selectedRole === 'GOVERNMENT' ? 'Official Government Email' : 'Email Address'}
                  </label>
                  {selectedRole === 'GOVERNMENT' && (
                    <span className="text-[10px] text-[#0077B6] font-mono font-bold">.gov / .nic.in required</span>
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
                    className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition ${
                      selectedRole === 'GOVERNMENT' && !isGovEmail(email) && email.length > 3
                        ? 'border-amber-500 focus:border-amber-500 focus:bg-white'
                        : 'border-slate-300 focus:border-[#0077B6] focus:bg-white'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Auth Method Switcher (Password vs OTP) */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">Authentication Method</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAuthMode('PASSWORD')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      authMode === 'PASSWORD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('OTP')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      authMode === 'OTP' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Instant OTP
                  </button>
                </div>
              </div>

              {/* Option A: Password Field */}
              {authMode === 'PASSWORD' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Account Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0077B6] focus:bg-white transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Option B: OTP Field */}
              {authMode === 'OTP' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">6-Digit Verification OTP</label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[11px] text-[#0077B6] hover:underline font-bold cursor-pointer"
                    >
                      {otpSent ? 'Resend OTP' : 'Request OTP Code'}
                    </button>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800 font-mono">
                    <span>Auto-filled OTP: <strong className="font-bold text-sm tracking-widest text-emerald-900">{otp}</strong></span>
                    <span className="text-[10px] bg-[#059669] text-white px-2 py-0.5 rounded font-bold">READY</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="829104"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0077B6] focus:bg-white text-center font-bold"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'GOVERNMENT'
                    ? 'bg-[#0077B6] hover:bg-[#005f92] shadow-blue-600/20'
                    : 'bg-[#059669] hover:bg-[#047857] shadow-emerald-600/20'
                }`}
              >
                {isLoading ? (
                  <span>Authenticating Command Session...</span>
                ) : (
                  <>
                    <span>Enter {selectedRole === 'GOVERNMENT' ? 'Command Authority' : 'Volunteer Portal'} →</span>
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

        {/* Footer Security Badges */}
        <p className="text-center text-[10px] text-slate-400 font-mono">
          VajraNet EOC Protocol v2.4 • 256-Bit TLS Protected Command Relay
        </p>

      </div>

    </div>
  );
}
