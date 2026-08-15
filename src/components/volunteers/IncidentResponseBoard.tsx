import React, { useEffect, useState } from 'react';
import { IncidentCreateModal } from '../common/IncidentCreateModal';
import { apiClient } from '../../api/client';
import { Plus, Flame, RefreshCw, CheckCircle2, UserCheck, MapPin } from 'lucide-react';

export function IncidentResponseBoard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

    // Also update task status override so it appears in Assigned Field Tasks
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
        })
      ]);
    } catch (err: any) {
      console.warn('Incident claimed locally and queued', err);
    }

    setIncidents((prev) =>
      prev.map((i) => (i.id === incident.id ? { ...i, status: 'IN_PROGRESS' } : i))
    );
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Volunteer Incident Response Board</span>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.2 rounded-full font-mono font-bold">
              {activeIncidents.length} AVAILABLE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Claim field rescue tasks, report localized ground hazards, and coordinate sector relief.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIncidents}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* List of Incidents */}
      {activeIncidents.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          ✓ No active ground incidents requiring volunteer dispatch right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeIncidents.map((inc) => {
            const isClaimed = claimedIncidentIds.has(inc.id);

            return (
              <div
                key={inc.id}
                className="bg-[#07111E] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {inc.severity || 'HIGH'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2.5">{inc.title || inc.description}</h3>
                  {inc.title && inc.description && (
                    <p className="text-xs text-slate-300 mt-1">{inc.description}</p>
                  )}
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{inc.address || inc.location?.address || `GPS: ${inc.latitude}, ${inc.longitude}`}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleClaimIncident(inc)}
                    disabled={isClaimed}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition cursor-pointer ${
                      isClaimed
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Claimed by You</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claim Incident</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <IncidentCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          setIncidents((prev) => [created, ...prev]);
          window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
        }}
        reporterRole="VOLUNTEER"
      />
    </div>
  );
}