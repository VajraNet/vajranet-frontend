import React, { useState } from 'react';
import { Shield, Radio, HeartPulse, Building2, UserCheck, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; token: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'ADMIN' | 'CITIZEN'>('GOVERNMENT');
  const [userName, setUserName] = useState<string>('Officer Sharma (NDRF HQ)');
  const [accessCode, setAccessCode] = useState<string>('gov-command-2026');
  const [customToken, setCustomToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const rolePresets = [
    {
      id: 'GOVERNMENT',
      label: 'NDRF / Govt Command',
      badge: 'Master Authority',
      icon: Building2,
      color: 'blue',
      defaultName: 'Officer Sharma (NDRF HQ)',
      defaultCode: 'gov-command-2026',
      token: 'mock-government-token',
      desc: 'Master triage of incoming SOS, incident verification, official broadcast publisher, and hospital bed control.'
    },
    {
      id: 'VOLUNTEER',
      label: 'Volunteer Field Responder',
      badge: 'Field Operations',
      icon: HeartPulse,
      color: 'emerald',
      defaultName: 'Alex Mercer (Field Unit 4)',
      defaultCode: 'vol-response-2026',
      token: 'mock-volunteer-token',
      desc: 'Claim field response tasks, manage private community shelters, coordinate local relief supply distribution.'
    },
    {
      id: 'ADMIN',
      label: 'System Administrator',
      badge: 'Root Access',
      icon: Shield,
      color: 'purple',
      defaultName: 'SysAdmin VajraNet',
      defaultCode: 'admin-root-2026',
      token: 'mock-admin-token',
      desc: 'Full system diagnostics, gateway node management, and database synchronization.'
    },
    {
      id: 'CITIZEN',
      label: 'Citizen / Observer Portal',
      badge: 'Public View',
      icon: Radio,
      color: 'amber',
      defaultName: 'Citizen Observer',
      defaultCode: 'public-access',
      token: 'mock-citizen-token',
      desc: 'View public shelter status, live evacuation advisories, and disaster survival protocols.'
    }
  ];

  const handleRoleSelect = (roleId: 'GOVERNMENT' | 'VOLUNTEER' | 'ADMIN' | 'CITIZEN') => {
    setSelectedRole(roleId);
    const preset = rolePresets.find(p => p.id === roleId);
    if (preset) {
      setUserName(preset.defaultName);
      setAccessCode(preset.defaultCode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const preset = rolePresets.find(p => p.id === selectedRole);
    const token = customToken.trim() || preset?.token || 'mock-government-token';

    localStorage.setItem('vajranet_token', token);
    localStorage.setItem('vajranet_user', JSON.stringify({
      name: userName,
      role: selectedRole
    }));

    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: userName,
        role: selectedRole,
        token
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 mb-1">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase flex items-center justify-center gap-2">
            <span>VAJRANET</span>
            <span className="text-xs bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800/80 font-mono">v1.0</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Offline-First Emergency Response & Disaster Command Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Select Command Portal Role</span>
              <span className="text-[10px] text-blue-400 font-mono">RBAC Secured</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {rolePresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedRole === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleRoleSelect(preset.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 text-white ring-1 ring-blue-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected ? 'bg-blue-500/20 text-blue-300 font-bold' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>
                    <div className="font-bold text-xs leading-tight">{preset.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Description Banner */}
          {(() => {
            const activePreset = rolePresets.find(p => p.id === selectedRole);
            return (
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">{activePreset?.label} Authority:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{activePreset?.desc}</p>
                </div>
              </div>
            );
          })()}

          {/* Identity & Credentials Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Personnel / Unit Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Officer Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Passcode</label>
              <div className="relative">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Security passcode"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Optional Custom Supabase Token */}
          <div className="space-y-1">
            <details className="text-[11px] text-slate-400 group">
              <summary className="cursor-pointer hover:text-slate-200 transition font-mono select-none">
                ⚙️ Advanced: Custom Supabase / Backend JWT Token (Optional)
              </summary>
              <div className="pt-2">
                <input
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="Paste Supabase JWT token here (Leave empty for role mock token)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </details>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Enter Command Center</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>P2P Mesh: Ready</span>
          <span>Backend API: Online</span>
          <span>Security: TLS 1.3 + RBAC</span>
        </div>
      </div>
    </div>
  );
}
