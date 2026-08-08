import React from 'react';

export default function Badge({ children, variant = 'info', className = '' }) {
  const variantStyles = {
    critical: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/20',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20',
    info: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20',
    neutral: 'bg-slate-800/80 text-slate-300 border border-slate-700/80',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide ${variantStyles[variant] || variantStyles.info} ${className}`}>
      {children}
    </span>
  );
}
