import React, { useState, useEffect } from 'react';
import { Shield, Building2, HeartPulse, Lock, Mail, KeyRound, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Fingerprint } from 'lucide-react';
import { getOrCreateVajraId } from '../utils/vajraId';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; token: string; email: string; vajra_id?: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [persistentVajraId, setPersistentVajraId] = useState<string>('');

  // Only two role options: 'GOVERNMENT' | 'VOLUNTEER'
  const [selectedRole, setSelectedRole] = useState<'GOVERNMENT' | 'VOLUNTEER'>('GOVERNMENT');
  
  // Auth Mode: 'PASSWORD' | 'OTP' | 'VAJRA_ID'
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP' | 'VAJRA_ID'>('PASSWORD');
  
  // Input fields
  const [email, setEmail] = useState<string>('command.ndrf@disaster.gov.in');
  const [password, setPassword] = useState<string>('VajraCommand2026!');
  const [otp, setOtp] = useState<string>('829104');
  const [inputVajraId, setInputVajraId] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const id = getOrCreateVajraId();
    setPersistentVajraId(id);
    setInputVajraId(id);
  }, []);

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

    const finalVajraId = persistentVajraId || getOrCreateVajraId();

    // Vajra ID direct sign in
    if (authMode === 'VAJRA_ID') {
      const cleanVajraId = inputVajraId.trim().toUpperCase();
      if (!cleanVajraId) {
        setErrorMessage('Please enter your Unique Vajra ID.');
        return;
      }
      setIsLoading(true);
      const displayName = selectedRole === 'GOVERNMENT'
        ? `Gov Officer (${cleanVajraId.slice(-9)})`
        : `Field Volunteer (${cleanVajraId.slice(-9)})`;
      
      const token = selectedRole === 'GOVERNMENT' ? 'mock-government-token' : 'mock-volunteer-token';
      const emailGenerated = `${cleanVajraId.toLowerCase()}@vajranet.local`;

      localStorage.setItem('vajranet_token', token);
      localStorage.setItem('vajranet_user', JSON.stringify({
        name: displayName,
        role: selectedRole,
        email: emailGenerated,
        vajra_id: cleanVajraId
      }));

      setTimeout(() => {
        setIsLoading(false);
        onLogin({
          name: displayName,
          role: selectedRole,
          token,
          email: emailGenerated,
          vajra_id: cleanVajraId
        });
      }, 350);
      return;
    }

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
      email: cleanEmail,
      vajra_id: finalVajraId
    }));

    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: displayName,
        role: selectedRole,
        token,
        email: cleanEmail,
        vajra_id: finalVajraId
      });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07172C] via-[#0E294B] to-[#07172C] flex flex-col justify-center items-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0077B6]/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand Logo & Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-1 rounded-2xl bg-[#0B2545]/80 border border-cyan-400/50 shadow-2xl">
            <img 
              src="/app-icon.jpg" 
              alt="VajraNet" 
              className="w-14 h-14 rounded-xl shadow-inner object-cover" 
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-wider uppercase">VAJRANET</h1>
              <span className="bg-[#0077B6] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                EOC v2.5
              </span>
            </div>
            <p className="text-xs text-cyan-300 font-mono font-semibold mt-0.5">
              "When Towers Fall, VajraNet Stands."
            </p>
          </div>
        </div>

        {/* Crisp Card with Role Tabs */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
          
          {/* Permanent Device Unique ID Pill */}
          <div className="bg-[#07172C] text-cyan-200 rounded-2xl p-3 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Permanent Device Vajra ID</span>
                <strong className="text-xs font-mono font-black text-white tracking-wider">
                  {persistentVajraId || 'GENERATING...'}
                </strong>
              </div>
            </div>
            <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded font-mono font-bold">
              1-DEVICE-1-ID
            </span>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider block">
              Select Authenticated Access Portal:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              
              {/* Government Command Button */}
              <button
                type="button"
                onClick={() => handleRoleSwitch('GOVERNMENT')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                  selectedRole === 'GOVERNMENT'
                    ? 'bg-[#0077B6] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏛️ Govt EOC</span>
              </button>

              {/* Volunteer Operations Button */}
              <button
                type="button"
                onClick={() => handleRoleSwitch('VOLUNTEER')}
                className={`py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                  selectedRole === 'VOLUNTEER'
                    ? 'bg-[#059669] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>🤝 Volunteer Force</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Password / OTP / Vajra ID */}
          <div className="flex border-b border-slate-200 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('PASSWORD'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'PASSWORD' ? 'border-[#0077B6] text-[#0077B6]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('OTP'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'OTP' ? 'border-[#0077B6] text-[#0077B6]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              One-Time OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('VAJRA_ID'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'VAJRA_ID' ? 'border-[#0077B6] text-[#0077B6]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Vajra ID
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* METHOD: VAJRA ID DIRECT */}
            {authMode === 'VAJRA_ID' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Unique Vajra ID</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="VAJRA-USR-ABC-12345"
                    value={inputVajraId}
                    onChange={(e) => setInputVajraId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#0077B6] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono tracking-wider focus:outline-none transition"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Auto-filled with this device's permanent Vajra ID for 1-click sign in.</p>
              </div>
            ) : (
              <>
                {/* Email Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      {selectedRole === 'GOVERNMENT' ? 'Official Government Email' : 'Volunteer / NGO Email'}
                    </label>
                    {selectedRole === 'GOVERNMENT' && (
                      <span className="text-[10px] text-[#0077B6] font-mono font-bold">.gov / .gov.in Required</span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder={selectedRole === 'GOVERNMENT' ? 'command.officer@ndrf.gov.in' : 'volunteer@redcross.org'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-[#0077B6] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                {authMode === 'PASSWORD' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Secure Passkey / Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#0077B6] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                {/* OTP Input */}
                {authMode === 'OTP' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">6-Digit Verification OTP</label>
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[11px] text-[#0077B6] hover:underline font-bold"
                        >
                          Request OTP
                        </button>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded font-bold">
                          OTP SENT
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="829104"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-[#0077B6] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                selectedRole === 'GOVERNMENT'
                  ? 'bg-[#0077B6] hover:bg-[#005f92] shadow-blue-900/30'
                  : 'bg-[#059669] hover:bg-[#047857] shadow-emerald-900/30'
              }`}
            >
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : `Sign In to ${selectedRole === 'GOVERNMENT' ? 'Government Command' : 'Volunteer Portal'} →`}
              </span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 font-mono">
          VajraNet RBAC Security Engine • Role-Segregated Command Architecture
        </p>

      </div>

    </div>
  );
}
