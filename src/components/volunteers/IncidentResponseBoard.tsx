import React, { useEffect, useState } from 'react';
import { IncidentCreateModal } from '../common/IncidentCreateModal';
import { apiClient } from '../../api/client';
import { Plus, Flame, RefreshCw, CheckCircle2, UserCheck, MapPin } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface IncidentResponseBoardProps {
  lang?: Language;
}

export function IncidentResponseBoard({ lang = 'EN' }: IncidentResponseBoardProps) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

  const getPersistentClaimed = (): Set<string> => {
    try {
      const saved = localStorage.getItem('vajranet_claimed_tasks');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set();
  };

  const [claimedIncidentIds, setClaimedIncidentIds] = useState<Set<string>>(getPersistentClaimed());

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchIncidents() {
    try {
      const [incRes, tasksRes] = await Promise.allSettled([
        apiClient.get('/incidents'),
        apiClient.get('/volunteers/tasks')
      ]);

      const persistentSet = getPersistentClaimed();

      if (tasksRes.status === 'fulfilled') {
        const tasksData = tasksRes.value.data?.data || tasksRes.value.data;
        if (Array.isArray(tasksData)) {
          tasksData.forEach((t: any) => {
            if (t.id) persistentSet.add(t.id);
            if (t.incident_id) persistentSet.add(t.incident_id);
          });
        }
      }

      if (incRes.status === 'fulfilled') {
        const data = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(data)) {
          let resolvedSet = new Set<string>();
          try {
            resolvedSet = new Set(JSON.parse(localStorage.getItem('vajranet_resolved_incident_ids') || '[]'));
          } catch {}

          const activeOnly = data.filter((inc: any) => 
            inc.status !== 'RESOLVED' && 
            inc.status !== 'COMPLETED' && 
            !resolvedSet.has(inc.id)
          );

          activeOnly.forEach((inc: any) => {
            if (inc.status === 'ACCEPTED' || inc.status === 'IN_PROGRESS') {
              persistentSet.add(inc.id);
            }
          });
          setIncidents(activeOnly);
        }
      }

      setClaimedIncidentIds(new Set(persistentSet));
      localStorage.setItem('vajranet_claimed_tasks', JSON.stringify(Array.from(persistentSet)));
    } catch (e) {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimIncident(incident: any) {
    const nextSet = new Set(claimedIncidentIds);
    nextSet.add(incident.id);
    setClaimedIncidentIds(nextSet);
    localStorage.setItem('vajranet_claimed_tasks', JSON.stringify(Array.from(nextSet)));

    try {
      const taskCache = JSON.parse(localStorage.getItem('vajranet_task_status_cache') || '{}');
      taskCache[incident.id] = 'IN_PROGRESS';
      localStorage.setItem('vajranet_task_status_cache', JSON.stringify(taskCache));
    } catch {}

    try {
      await Promise.any([
        apiClient.post(`/volunteers/incidents/${incident.id}/accept`),
        apiClient.post('/volunteers/tasks', {
          title: `Volunteer Response: ${incident.title || incident.description?.slice(0, 35)}`,
          description: incident.description || 'Claimed by Volunteer Response Force',
          zone: incident.location?.zone || incident.zone || 'Sector 4',
          incident_id: incident.id,
          priority: incident.severity || 'HIGH',
          status: 'IN_PROGRESS'
        })
      ]);
    } catch {
      // Handled in persistent set
    }
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-severity-high" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {lang === 'HI' ? 'फील्ड आपदा घटनाएं व राहत कार्य' : 'Active Disaster Incident Board'}
            </h1>
            <span className="gov-badge badge-high font-mono font-bold">
              {incidents.length} {lang === 'HI' ? 'घटनाएं' : 'INCIDENTS'}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {lang === 'HI' ? 'सत्यापित आपदा घटनाएं जिनका राहत कार्य स्वयंसेवक दस्ते स्वीकार कर सकते हैं' : 'Verified community hazards and disaster incidents available for volunteer field response'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchIncidents} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.reportIncident}
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thIncidentId}</th>
                <th>{t.thTypeTitle}</th>
                <th>{t.thDescription}</th>
                <th>{t.thIncidentLocation}</th>
                <th>{t.thSeverity}</th>
                <th className="text-right">{t.thResponseActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    {t.loadingIncidents}
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gov-gray">
                    {t.noMatchingIncidents}
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => {
                  const isClaimed = claimedIncidentIds.has(incident.id);
                  return (
                    <tr key={incident.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      
                      {/* ID */}
                      <td className="font-mono font-bold text-xs text-gov-blue-dark dark:text-blue-300">
                        {incident.id}
                      </td>

                      {/* Title & Type */}
                      <td>
                        <div className="font-bold text-xs text-[#1e2533] dark:text-white">
                          {incident.title || 'Community Disaster Event'}
                        </div>
                        <span className="gov-badge badge-medium text-[10px] mt-0.5 inline-block">
                          {incident.type || 'HAZARD'}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="max-w-xs text-xs text-gov-gray-dark dark:text-slate-300">
                        <p className="line-clamp-2">{incident.description || 'Verified field event'}</p>
                      </td>

                      {/* Location */}
                      <td className="text-xs font-mono">
                        <div className="flex items-center gap-1 text-[#2d3748] dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-gov-blue shrink-0" />
                          <span>{incident.location?.zone || incident.zone || incident.area || 'Zone 4'}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td>
                        <span className={`gov-badge ${incident.severity === 'CRITICAL' ? 'badge-critical' : incident.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                          {incident.severity || 'HIGH'}
                        </span>
                      </td>

                      {/* Response Action */}
                      <td className="text-right whitespace-nowrap">
                        {isClaimed ? (
                          <span className="gov-badge badge-online inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            {lang === 'HI' ? 'कार्यभार स्वीकृत' : 'Claimed by You'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimIncident(incident)}
                            className="gov-btn btn-secondary btn-sm"
                          >
                            {lang === 'HI' ? 'कार्य स्वीकारें' : 'Claim Response Task'}
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <IncidentCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onIncidentCreated={() => {
            fetchIncidents();
            window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
          }}
        />
      )}

    </div>
  );
}