import React from 'react';

export function VolunteerProfile() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#07172C] border border-emerald-500/50 p-2 flex items-center justify-center shrink-0 shadow-lg">
          <img 
            src="/app-icon-transparent.png" 
            alt="VajraNet Verified" 
            className="w-full h-full object-contain" 
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Volunteer Operator</h2>
          <p className="text-xs text-slate-400 font-mono">ID: VOL-KN-2026-88</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono inline-block mt-1">
            VERIFIED FIRST RESPONDER
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase font-mono">Platform Qualifications & Certifications</h3>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li>Basic First Aid & CPR (Red Cross Certified)</li>
          <li>Disaster Triage & Evacuation Protocol Level 1</li>
          <li>VajraNet Hardware P2P Mesh Radio Operator</li>
        </ul>
      </div>
    </div>
  );
}