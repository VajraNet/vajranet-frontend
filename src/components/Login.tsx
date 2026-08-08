import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: { name: string; role: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate verification check
    if (email && password) {
      onLogin({ name: 'Verified Official', role: 'Government' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 rounded-lg">⚡</div>
          <h1 className="text-2xl font-bold">VajraNet Portal</h1>
        </div>
        
        <p className="text-slate-400 text-sm mb-6">
          Access restricted to verified emergency response personnel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">OFFICIAL EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@disaster.gov.in"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-lg shadow-blue-500/20 mt-2"
          >
            Authenticate & Access
          </button>
        </form>
      </div>
    </div>
  );
};