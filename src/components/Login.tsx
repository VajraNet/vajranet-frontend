import React, { useState, useEffect } from 'react';
import { Building2, Users, Lock, Mail, AlertCircle, Sun, Moon } from 'lucide-react';
import { getOrCreateRoleVajraId } from '../utils/vajraId';
import { TRANSLATIONS, Language } from '../utils/translations';

interface LoginProps {
  onLogin: (userData: { name: string; role: string; token: string; email: string; vajra_id?: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [lang, setLang] = useState<Language>('EN');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Role: 'GOVERNMENT' | 'VOLUNTEER'
  const [selectedRole, setSelectedRole] = useState<'GOVERNMENT' | 'VOLUNTEER'>('GOVERNMENT');
  
  // Input fields
  const [email, setEmail] = useState<string>('command.eoc@disaster.gov.in');
  const [password, setPassword] = useState<string>('VajraCommand2026!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('vajranet_frontend_theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('vajranet_frontend_theme', next);
    } catch {}
  };

  const handleRoleSwitch = (role: 'GOVERNMENT' | 'VOLUNTEER') => {
    setSelectedRole(role);
    setErrorMessage(null);

    if (role === 'GOVERNMENT') {
      setEmail('command.eoc@disaster.gov.in');
      setPassword('VajraCommand2026!');
    } else {
      setEmail('alex.mercer@redcross.org');
      setPassword('VolunteerPass2026!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const vajraId = getOrCreateRoleVajraId(selectedRole === 'VOLUNTEER' ? 'VOLUNTEER' : 'GOVERNMENT');
      
      let token = 'mock-citizen-token';
      let name = 'Disaster Management User';

      if (selectedRole === 'GOVERNMENT') {
        token = 'mock-government-token';
        name = 'Rajiv Srivastava (District Collector)';
      } else {
        token = 'mock-volunteer-token';
        name = 'Alex Mercer (Field Squad Lead)';
      }

      onLogin({
        name,
        role: selectedRole,
        token,
        email,
        vajra_id: vajraId
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1522] text-[#1e2533] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors duration-150">
      
      {/* Top Government Header */}
      <header style={{ background: '#1a4480', borderBottom: '1px solid #112e5a' }} className="px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, background: '#e8f0fa', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src="/vajranet-icon.jpg" 
              alt="Emblem" 
              className="w-6 h-6 object-contain rounded-xs"
            />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.2 }}>VAJRANET</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, letterSpacing: '0.04em' }}>
              {t.portalTitleGovt}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5" style={{ borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, marginRight: 4 }}>
            <button 
              onClick={() => setLang('EN')}
              className="gov-btn" 
              style={{ background: lang === 'EN' ? '#fff' : 'rgba(255,255,255,0.1)', color: lang === 'EN' ? '#1a4480' : '#fff', border: 'none', padding: '3px 8px', fontSize: 11, fontWeight: 700 }}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('HI')}
              className="gov-btn" 
              style={{ background: lang === 'HI' ? '#fff' : 'rgba(255,255,255,0.1)', color: lang === 'HI' ? '#1a4480' : '#fff', border: 'none', padding: '3px 8px', fontSize: 11, fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            >
              हिंदी
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '6px 8px', cursor: 'pointer', color: '#fff' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex items-center justify-center hover:bg-white/20 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Workspace */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full section-card shadow-lg p-6 sm:p-8 space-y-5">
          
          {/* Card Title */}
          <div className="text-center space-y-1 pb-3 border-b border-gov-gray-border dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gov-blue-faint dark:bg-slate-800 border border-gov-blue-pale dark:border-slate-700 text-gov-blue dark:text-blue-400 mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-gov-blue-dark dark:text-white uppercase tracking-wide">
              {t.loginPortalTitle}
            </h1>
            <p className="text-xs text-gov-gray dark:text-slate-400">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Clean 2-Role Tabs: Govt EOC vs Volunteer Force */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gov-gray-bg dark:bg-slate-900 rounded border border-gov-gray-border/60 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleRoleSwitch('GOVERNMENT')}
              className={`py-2 px-2 rounded font-bold transition text-center ${
                selectedRole === 'GOVERNMENT'
                  ? 'bg-gov-blue text-white shadow-xs'
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
            >
              🏛️ {lang === 'HI' ? 'सरकारी ईओसी' : 'Govt EOC Authority'}
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('VOLUNTEER')}
              className={`py-2 px-2 rounded font-bold transition text-center ${
                selectedRole === 'VOLUNTEER'
                  ? 'bg-gov-blue text-white shadow-xs'
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
            >
              🤝 {lang === 'HI' ? 'स्वयंसेवक दस्ता' : 'Volunteer Taskforce'}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-severity-critical rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form with Non-Overlapping Input Layout */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                {t.officialEmail}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gov-gray absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                  className="gov-input w-full py-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                {t.password}
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gov-gray absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '34px' }}
                  className="gov-input w-full py-2.5 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gov-btn btn-primary w-full justify-center py-2.5 text-xs font-bold shadow-sm cursor-pointer"
            >
              {loading ? t.signingIn : t.signInBtn}
            </button>
          </form>

          {/* Statutory Notice */}
          <p className="text-[10px] text-gov-gray text-center leading-relaxed pt-3 border-t border-gov-gray-border/50 dark:border-slate-800">
            {t.loginSecurityNotice}
          </p>

        </div>
      </div>

    </div>
  );
}
