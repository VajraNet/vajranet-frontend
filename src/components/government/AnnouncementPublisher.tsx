import React, { useEffect, useState } from 'react';
import { Announcement, SeverityLevel } from '../../types/api';
import { governmentApi } from '../../api/government';

export function AnnouncementPublisher() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'ALERT' | 'EVACUATION' | 'SAFETY_INFO' | 'UPDATE'>('ALERT');
  const [targetArea, setTargetArea] = useState('');
  const [priority, setPriority] = useState<SeverityLevel>('HIGH');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const data = await governmentApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      // Demo state fallback
      setAnnouncements([
        {
          id: 'anc-1',
          title: '⚠️ CRITICAL FLOOD WARNING',
          message: 'Residents of Zone 4 (Riverbank) must move to higher ground or District Stadium Shelter immediately.',
          type: 'EVACUATION',
          target_area: 'Zone 4',
          priority: 'CRITICAL',
          issued_at: new Date().toISOString(),
          source_authority: 'District Disaster Management Authority',
        },
        {
          id: 'anc-2',
          title: 'Clean Drinking Water Distribution',
          message: 'Safe drinking water bowsers positioned at West Relief Center from 08:00 AM.',
          type: 'UPDATE',
          target_area: 'Zone 1 & Zone 2',
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
      type,
      target_area: targetArea,
      priority,
      source_authority: 'District Emergency Command',
    };

    try {
      const created = await governmentApi.createAnnouncement(payload);
      setAnnouncements((prev) => [created, ...prev]);
    } catch (err) {
      // Fallback local addition for UI testing
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Publisher Form */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
          📢 Publish Official Alert
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Broadcast official safety advisories and evacuation directives outward to citizens.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Title</label>
            <input
              type="text"
              required
              placeholder="e.g. EVACUATION ORDER - ZONE 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="ALERT">Alert</option>
                <option value="EVACUATION">Evacuation</option>
                <option value="SAFETY_INFO">Safety Info</option>
                <option value="UPDATE">Update</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Area / Sector</label>
            <input
              type="text"
              required
              placeholder="e.g. Sector 4, Riverbank, All Zones"
              value={targetArea}
              onChange={(e) => setTargetArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Message Details</label>
            <textarea
              rows={4}
              required
              placeholder="Clear, direct safety instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded transition disabled:opacity-50"
          >
            {submitting ? 'Broadcasting...' : 'Publish Official Advisory'}
          </button>
        </form>
      </div>

      {/* Announcements Stream */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-1">Active Broadcasts</h2>
        <p className="text-xs text-slate-400 mb-4">Currently active advisories distributed across the network.</p>

        {loading ? (
          <p className="text-xs text-slate-400">Loading broadcasts...</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((anc) => (
              <div key={anc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        anc.priority === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {anc.type} • {anc.priority}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Target: {anc.target_area}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(anc.issued_at || anc.created_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{anc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{anc.message}</p>
                <p className="text-xs text-slate-500 italic">Issuer: {anc.source_authority || 'Government Emergency Authority'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}