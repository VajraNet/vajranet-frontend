import React from 'react';

export function VolunteerProfile() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-2xl">
          👨‍🚒
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Volunteer Operator</h2>
          <p className="text-xs text-slate-400">ID: VOL-KN-2026-88</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            VERIFIED FIRST RESPONDER
          </span>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase">Certifications</h3>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Basic First Aid & CPR (Red Cross Certified)</li>
          <li>Disaster Triage & Evacuation Protocol Level 1</li>
          <li>VajraNet Mesh Radio Operator</li>
        </ul>
      </div>
    </div>
  );
}