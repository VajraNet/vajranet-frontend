import React from 'react';
import { getOrCreateRoleVajraId } from '../../utils/vajraId';
import { ShieldCheck, Award, Phone, Mail, MapPin } from 'lucide-react';

export function VolunteerProfile() {
  const volunteerId = getOrCreateRoleVajraId('VOLUNTEER');

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#07111E] border border-emerald-500/50 p-2 flex items-center justify-center shrink-0 shadow-lg">
          <img 
            src="/vajranet-icon.jpg" 
            alt="VajraNet Verified" 
            className="w-full h-full object-contain rounded-lg" 
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Alex Mercer (Field Responder)</h2>
          <p className="text-xs text-cyan-400 font-mono font-bold">OPERATOR ID: {volunteerId}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono inline-block mt-1">
            VERIFIED FIRST RESPONDER SQUAD
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-[#07111E] border border-slate-800 rounded-xl p-4 space-y-2">
          <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Responder Telemetry & Deployment</span>
          </h4>
          <p className="text-slate-400 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Assigned Sector: Sector 4 Riverbank Depot</span>
          </p>
          <p className="text-slate-400 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>Radio Comms / Phone: +91 98765 43210</span>
          </p>
          <p className="text-slate-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Official Email: alex.mercer@redcross.org</span>
          </p>
        </div>

        <div className="bg-[#07111E] border border-slate-800 rounded-xl p-4 space-y-2">
          <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Platform Qualifications & Certs</span>
          </h4>
          <ul className="text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Basic First Aid & CPR (Red Cross Certified)</li>
            <li>Disaster Triage & Evacuation Protocol Level 2</li>
            <li>Emergency Search & Rescue Dispatch Certified</li>
          </ul>
        </div>
      </div>
    </div>
  );
}