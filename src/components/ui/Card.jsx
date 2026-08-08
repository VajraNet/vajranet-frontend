import React from 'react';

export default function Card({ title, subtitle, action, children, className = '', variant = 'glass' }) {
  const variantClass = variant === 'rose' ? 'v-glass-rose' : variant === 'cyan' ? 'v-glass-cyan' : 'v-glass';
  return (
    <div className={`${variantClass} ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            {title && <h3 className="font-bold text-base md:text-lg text-white font-heading tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
