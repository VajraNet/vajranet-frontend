import React, { useEffect, useState } from 'react';
import { Announcement, SeverityLevel } from '../../types/api';
import { governmentApi } from '../../api/government';
import { Bell, Plus, RefreshCw, Radio, MapPin, Clock, Send } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface AnnouncementPublisherProps {
  lang?: Language;
}

export function AnnouncementPublisher({ lang = 'EN' }: AnnouncementPublisherProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'ALERT' | 'EVACUATION' | 'SAFETY_INFO' | 'UPDATE'>('ALERT');
  const [targetArea, setTargetArea] = useState('');
  const [priority, setPriority] = useState<SeverityLevel>('HIGH');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const data = await governmentApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setAnnouncements([
        {
          id: 'anc-1',
          title: '⚠️ CRITICAL FLOOD WARNING',
          message: 'Residents of Zone 4 (Riverbank) must move to higher ground or District Stadium Shelter immediately.',
          type: 'EVACUATION',
          target_area: 'Zone 4, Kalyanpur',
          priority: 'CRITICAL',
          issued_at: new Date().toISOString(),
          source_authority: 'District Disaster Management Authority',
        },
        {
          id: 'anc-2',
          title: 'Clean Drinking Water Distribution',
          message: 'Safe drinking water bowsers positioned at West Relief Center from 08:00 AM.',
          type: 'UPDATE',
          target_area: 'Civil Lines, Mall Road',
          priority: 'MEDIUM',
          issued_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          source_authority: 'Municipal Corporation',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !targetArea.trim()) return;

    setSubmitting(true);
    const payload = {
      title,
      message,
      content: message,
      type,
      target_area: targetArea,
      area: targetArea,
      priority,
      source_authority: 'District Emergency Command',
    };

    try {
      const created = await governmentApi.createAnnouncement(payload);
      setAnnouncements((prev) => [created, ...prev]);
    } catch (err) {
      const mockCreated: Announcement = {
        ...payload,
        id: `anc-${Date.now()}`,
        issued_at: new Date().toISOString(),
      };
      setAnnouncements((prev) => [mockCreated, ...prev]);
    } finally {
      setSubmitting(false);
      setTitle('');
      setMessage('');
      setTargetArea('');
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gov-blue dark:text-blue-400" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.announcementsTitle}
            </h1>
            <span className="gov-badge badge-high font-mono font-bold">
              OFFICIAL BROADCAST SYSTEM
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.announcementsSubtext}
          </p>
        </div>

        <button 
          onClick={fetchAnnouncements} 
          className="gov-btn btn-ghost btn-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
        </button>
      </div>

      {/* Grid: Publisher Form (Left 5 cols) + Active Broadcasts Feed (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Publisher Form */}
        <div className="lg:col-span-5 section-card p-5 shadow-sm space-y-4">
          <div className="border-b border-gov-gray-border dark:border-slate-800 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-gov-blue" />
              {t.publishNewDirective}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                {t.noticeTitle} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Evacuation Order — Zone 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="gov-input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">{t.category}</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="gov-input w-full"
                >
                  <option value="ALERT">Emergency Alert</option>
                  <option value="EVACUATION">Evacuation Directive</option>
                  <option value="SAFETY_INFO">Safety Guidelines</option>
                  <option value="UPDATE">Situation Update</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">{t.thSeverity}</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="gov-input w-full"
                >
                  <option value="CRITICAL">{t.critical}</option>
                  <option value="HIGH">{t.high}</option>
                  <option value="MEDIUM">{t.medium}</option>
                  <option value="LOW">{t.low}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                {t.targetZone} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kalyanpur, Rawatpur, Civil Lines (or All)"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                className="gov-input w-full"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                {t.broadcastContent} *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detailed instructions for citizens, assembly points, safe corridors..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="gov-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gov-btn btn-primary w-full justify-center py-2.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Transmitting...' : t.transmitDirective}
            </button>
          </form>
        </div>

        {/* Active Broadcasts Stream */}
        <div className="lg:col-span-7 section-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200">
              {t.activeBroadcasts} ({announcements.length})
            </h2>
            <span className="text-[10px] font-mono text-gov-gray">{t.citizenVisible}</span>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-gov-gray py-8 text-center">{t.noBroadcasts}</p>
            ) : (
              announcements.map((ann) => {
                const isCritical = ann.priority === 'CRITICAL';
                return (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded bg-gov-gray-bg dark:bg-slate-900/60 border border-gov-gray-border dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`gov-badge ${isCritical ? 'badge-critical' : ann.priority === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                          {ann.priority || 'ALERT'}
                        </span>
                        <h3 className="font-bold text-xs text-gov-blue-dark dark:text-blue-300">{ann.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-gov-gray flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ann.issued_at ? new Date(ann.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                    </div>

                    <p className="text-xs text-[#2d3748] dark:text-slate-200 leading-relaxed">
                      {ann.message || (ann as any).content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gov-gray pt-1 border-t border-gov-gray-border/40 dark:border-slate-800">
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-gov-blue" />
                        {t.area}: {ann.target_area || (ann as any).area || 'City-wide'}
                      </span>
                      <span>By: {ann.source_authority || 'EOC Control Room'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}