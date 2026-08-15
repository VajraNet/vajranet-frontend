import React, { useState, useEffect } from 'react';
import { Building2, HeartPulse, Lock, Mail, KeyRound, AlertCircle, Fingerprint } from 'lucide-react';
import { getOrCreateRoleVajraId, getOrCreateVajraId } from '../utils/vajraId';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; token: string; email: string; vajra_id?: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [persistentVajraId, setPersistentVajraId] = useState<string>('');

  // Role options: 'GOVERNMENT' | 'VOLUNTEER'
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

  useEffect(() => {
    const id = getOrCreateRoleVajraId(selectedRole);
    setPersistentVajraId(id);
    setInputVajraId(id);
  }, [selectedRole]);

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
    const id = getOrCreateRoleVajraId(role);
    setPersistentVajraId(id);
    setInputVajraId(id);

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
      const displayName = selectedRole === 'GOVERNMENT'
        ? `Gov Officer (${cleanVajraId.slice(-9)})`
        : `Field Volunteer (${cleanVajraId.slice(-9)})`;
      
      const token = selectedRole === 'GOVERNMENT' ? 'mock-government-token' : 'mock-volunteer-token';
      const emailGenerated = `${cleanVajraId.toLowerCase()}@vajranet.local`;

      const userData = {
        name: displayName,
        role: selectedRole,
        token,
        email: emailGenerated,
        vajra_id: cleanVajraId
      };

      onLogin(userData);
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

    const displayName = selectedRole === 'GOVERNMENT' 
      ? `Officer Sharma (NDRF HQ)` 
      : `Alex Mercer (${cleanEmail.split('@')[0]})`;

    const token = selectedRole === 'GOVERNMENT' ? 'mock-government-token' : 'mock-volunteer-token';

    const userData = {
      name: displayName,
      role: selectedRole,
      token,
      email: cleanEmail,
      vajra_id: finalVajraId
    };

    onLogin(userData);
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex flex-col justify-center items-center p-4 font-sans select-none relative">
      
      <div className="max-w-md w-full space-y-5 relative z-10">
        
        {/* Brand Logo & Portal Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-700 shadow-md">
            <img 
              src="/vajranet-logo.jpg" 
              alt="VajraNet Logo" 
              className="h-12 w-auto object-contain rounded" 
            />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-wider uppercase">VAJRANET COMMAND</h1>
            <p className="text-xs text-slate-300 font-mono font-medium mt-0.5">
              National Disaster Emergency Response & Communication Platform
            </p>
          </div>
        </div>

        {/* Crisp Card with Role Tabs */}
        <div className="bg-[#0F1E36] rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl text-slate-100">
          
          {/* Permanent Device Unique ID Pill */}
          <div className="bg-[#07111E] rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Permanent Device Vajra ID</span>
                <strong className="text-xs font-mono font-bold text-white tracking-wider">
                  {persistentVajraId || 'GENERATING...'}
                </strong>
              </div>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold">
              NODE ID
            </span>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
              Select Authenticated Access Portal:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#07111E] rounded-xl border border-slate-800">
              
              {/* Government Command Button */}
              <button
                type="button"
                onClick={() => handleRoleSwitch('GOVERNMENT')}
                className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                  selectedRole === 'GOVERNMENT'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏛️ Govt EOC</span>
              </button>

              {/* Volunteer Operations Button */}
              <button
                type="button"
                onClick={() => handleRoleSwitch('VOLUNTEER')}
                className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                  selectedRole === 'VOLUNTEER'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>🤝 Volunteer Force</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Password / OTP / Vajra ID */}
          <div className="flex border-b border-slate-800 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('PASSWORD'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'PASSWORD' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('OTP'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'OTP' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Official OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('VAJRA_ID'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                authMode === 'VAJRA_ID' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Device ID Sign-In
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mode 1 & 2: Email */}
            {authMode !== 'VAJRA_ID' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>{selectedRole === 'GOVERNMENT' ? 'Official Government Email (.gov.in / .nic.in)' : 'Registered Volunteer Email'}</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={selectedRole === 'GOVERNMENT' ? 'officer@ndrf.gov.in' : 'volunteer@redcross.org'}
                    className="w-full bg-[#07111E] border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mode 1: Password */}
            {authMode === 'PASSWORD' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Secure Access Key / Password</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter security key"
                    className="w-full bg-[#07111E] border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: OTP */}
            {authMode === 'OTP' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-[#07111E] border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono tracking-widest focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-[11px] text-emerald-400 font-mono">
                    ✓ Official OTP sent to {email}. Demo Code: <strong>829104</strong>
                  </p>
                )}
              </div>
            )}

            {/* Mode 3: Vajra ID */}
            {authMode === 'VAJRA_ID' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Unique Mesh Node Vajra ID</span>
                </label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={inputVajraId}
                    onChange={(e) => setInputVajraId(e.target.value)}
                    required
                    placeholder="VAJRA-XXXX-XXXX"
                    className="w-full bg-[#07111E] border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono uppercase tracking-wider focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Connects directly through hardware identity without requiring internet password exchange.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition cursor-pointer ${
                selectedRole === 'GOVERNMENT'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              Authenticate & Enter {selectedRole === 'GOVERNMENT' ? 'Command Center' : 'Volunteer Force'}
            </button>
          </form>

        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-400 font-mono">
          🔒 Encrypted disaster communication channel • Official NDRF / DMA Portal
        </p>

      </div>
    </div>
  );
}
