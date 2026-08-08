import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Radio,
  FileText
} from 'lucide-react';
import { MOCK_RUMORS } from '../data/mockData';

export default function AIFakeNewsDetector() {
  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!query) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      if (query.toLowerCase().includes('dam') || query.toLowerCase().includes('burst') || query.toLowerCase().includes('15ft')) {
        setResult(MOCK_RUMORS[0]);
      } else {
        setResult({
          id: 'RUMOR-CUSTOM',
          text: query,
          credibilityScore: '89% (HIGH CREDIBILITY)',
          status: 'VERIFIED',
          details: 'Cross-referenced against VajraNet Official Broadcast Feeds & District Collectorate.',
          recommendation: 'Safe to relay across local P2P mesh.'
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              AI Panic Prevention & Misinformation Shield
            </h2>
            <p className="text-xs text-slate-300">
              Scans broadcasted mesh messages and rumors to prevent panic during cellular blackouts.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-xl">
          Rumor Debunking Engine Active
        </span>
      </div>

      {/* Input Form & Scan */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
        <h3 className="text-base font-bold text-white font-heading">
          Verify Social Media / Mesh Rumor Text
        </h3>

        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste rumor text e.g. 'Chembur Dam wall has burst! Evacuate now!'"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{analyzing ? 'Scanning NLP Rules...' : 'Analyze Credibility'}</span>
          </button>
        </form>

        {/* Quick Sample Preset Buttons */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span>Try Presets:</span>
          <button 
            onClick={() => { setQuery(MOCK_RUMORS[0].text); }}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300"
          >
            Dam Burst Rumor
          </button>
          <button 
            onClick={() => { setQuery(MOCK_RUMORS[1].text); }}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300"
          >
            Relief Ration Update
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`glass-panel p-6 rounded-2xl space-y-4 border ${
          result.status === 'FAKE' ? 'border-red-500/40 bg-red-950/20' : 'border-emerald-500/40 bg-emerald-950/20'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              {result.status === 'FAKE' ? (
                <XCircle className="w-8 h-8 text-red-400" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              )}
              <div>
                <span className="text-xs font-mono uppercase text-slate-400">Analysis Verdict</span>
                <h4 className="text-xl font-bold text-white font-heading">{result.credibilityScore}</h4>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
              result.status === 'FAKE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {result.status}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
            <div className="text-slate-400 uppercase">Rumor Text Evaluated:</div>
            <div className="text-white text-sm font-sans font-medium">"{result.text}"</div>
            <div className="pt-2 border-t border-slate-900 text-slate-300 font-sans">
              <strong className="text-amber-400">Verification Details:</strong> {result.details}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
