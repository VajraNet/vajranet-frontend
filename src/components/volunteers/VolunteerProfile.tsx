import React from 'react';
import { getOrCreateRoleVajraId } from '../../utils/vajraId';
import { ShieldCheck, Award, Phone, Mail, MapPin, User, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface VolunteerProfileProps {
  lang?: Language;
}

export function VolunteerProfile({ lang = 'EN' }: VolunteerProfileProps) {
  const volunteerId = getOrCreateRoleVajraId('VOLUNTEER');
  const t = TRANSLATIONS[lang];

  return (
    <div className="section-card p-6 space-y-6 shadow-sm">
      
      {/* Profile Header */}
      <div className="flex items-center gap-4 border-b border-gov-gray-border dark:border-slate-800 pb-5">
        <div className="w-14 h-14 rounded-lg bg-gov-blue-faint dark:bg-slate-800 border border-gov-blue-pale dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
          <img 
            src="/vajranet-icon.jpg" 
            alt="VajraNet Verified" 
            className="w-full h-full object-contain rounded" 
          />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
            Alex Mercer (Field Squad Lead)
          </h2>
          <p className="text-xs text-gov-blue dark:text-blue-400 font-mono font-bold">
            OPERATOR VAJRA ID: {volunteerId}
          </p>
          <span className="gov-badge badge-online mt-1 font-mono text-[10px]">
            VERIFIED FIRST RESPONDER SQUAD
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 bg-gov-gray-bg dark:bg-slate-900/60 rounded border border-gov-gray-border/60 dark:border-slate-800 space-y-2.5">
          <h4 className="font-bold text-[#1e2533] dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-status-online" />
            <span>Responder Telemetry & Deployment</span>
          </h4>
          <p className="text-gov-gray-dark dark:text-slate-300 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gov-blue" />
            <span>Assigned Zone: Sector 4 Central Relief Hub</span>
          </p>
          <p className="text-gov-gray-dark dark:text-slate-300 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gov-blue" />
            <span>Emergency Comms: +91 98765 43210</span>
          </p>
          <p className="text-gov-gray-dark dark:text-slate-300 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-gov-blue" />
            <span>Official ID: alex.mercer@redcross.org</span>
          </p>
        </div>

        <div className="p-4 bg-gov-gray-bg dark:bg-slate-900/60 rounded border border-gov-gray-border/60 dark:border-slate-800 space-y-2.5">
          <h4 className="font-bold text-[#1e2533] dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
            <Award className="w-4 h-4 text-severity-high" />
            <span>Platform Certifications & Authority</span>
          </h4>
          <ul className="text-gov-gray-dark dark:text-slate-300 space-y-1.5 list-disc list-inside text-[11px]">
            <li>Basic First Aid & CPR (Red Cross Certified)</li>
            <li>Disaster Triage & Evacuation Protocol Level 2</li>
            <li>Emergency Search & Rescue Dispatch Certified</li>
          </ul>
        </div>
      </div>

    </div>
  );
}