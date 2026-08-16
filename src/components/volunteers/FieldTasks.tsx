import React, { useEffect, useState } from 'react';
import { CheckSquare, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESOLVED';
  assigned_at?: string;
  assignedAt?: string;
}

export function FieldTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusOverrides = (): Record<string, string> => {
    try {
      const saved = localStorage.getItem('vajranet_task_status_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveStatusOverride = (taskId: string, status: string) => {
    try {
      const current = getStatusOverrides();
      current[taskId] = status;
      localStorage.setItem('vajranet_task_status_cache', JSON.stringify(current));
    } catch {}
  };

  async function fetchTasks() {
    try {
      const overrides = getStatusOverrides();
      const res = await apiClient.get('/volunteers/tasks');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        const merged = data.map((t: any) => ({
          ...t,
          status: overrides[t.id] || t.status || 'PENDING',
        }));
        setTasks(merged);
      } else {
        setTasks([]);
      }
    } catch {
      // Keep existing tasks or load fallback with overrides applied
      const overrides = getStatusOverrides();
      setTasks((prev) => {
        if (prev.length > 0) {
          return prev.map(t => ({ ...t, status: (overrides[t.id] || t.status) as any }));
        }
        return [
          { id: "TASK-401", title: "Distribute Clean Water Packets", description: "Sector 4 Relief Shelter distribution", zone: "Sector 4", priority: "HIGH", status: (overrides["TASK-401"] || "PENDING") as any },
          { id: "TASK-402", title: "Evacuate Stranded Residents", description: "Riverbank evacuation squad", zone: "Zone 4", priority: "CRITICAL", status: (overrides["TASK-402"] || "IN_PROGRESS") as any }
        ];
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(taskId: string, newStatus: VolunteerTask['status']) {
    saveStatusOverride(taskId, newStatus);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));

    try {
      await apiClient.patch(`/volunteers/tasks/${taskId}`, { status: newStatus });
    } catch (e) {
      console.warn('Task status update synced locally:', e);
    }
  }

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'HIGH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const activeTasks = tasks.filter(t => (t.status as string) !== 'COMPLETED' && (t.status as string) !== 'RESOLVED' && (t.status as string) !== 'CANCELLED');

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Assigned Field Response Tasks</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono font-bold">
              {activeTasks.length} ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Operational tasks assigned by Government EOC dispatchers or claimed by your volunteer squad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          ✓ No assigned volunteer tasks in database.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED' || task.status === 'RESOLVED';
            const hasValidZone = task.zone && task.zone.trim() !== '' && task.zone !== '—' && task.zone !== '-' && task.zone !== 'null';

            return (
              <div
                key={task.id}
                className="bg-[#07111E] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    {hasValidZone && (
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {task.zone}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      isCompleted ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-blue-950 text-blue-400 border-blue-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{task.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">{task.description}</p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  {!isCompleted ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg font-bold cursor-pointer"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-bold cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Task Completed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}