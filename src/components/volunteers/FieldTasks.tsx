import React, { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, User, RefreshCw, Plus, X } from 'lucide-react';
import { apiClient } from '../../api/client';

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESOLVED';
  assigned_at?: string;
  assignedAt?: string;
}

export function FieldTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('Zone 4 - Riverbank');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 6000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTasks() {
    try {
      const res = await apiClient.get('/volunteers/tasks');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data);
      } else {
        throw new Error('Empty');
      }
    } catch {
      setTasks((prev) => prev.length > 0 ? prev : [
        {
          id: 'task-101',
          title: 'Distribute Drinking Water Bowsers',
          description: 'Deliver 500L clean drinking water containers to Sector 4 Community Relief Station.',
          zone: 'Zone 4 - Riverbank',
          priority: 'CRITICAL',
          status: 'IN_PROGRESS',
          assignedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: 'task-102',
          title: 'Elderly Citizen Evacuation Support',
          description: 'Assist family with mobility impairment to reach Central High School Shelter.',
          zone: 'Zone 2 - Central',
          priority: 'HIGH',
          status: 'PENDING',
          assignedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: 'task-103',
          title: 'First Aid Kit Unloading',
          description: 'Unload medical supply shipment at West Municipal Distribution Center.',
          zone: 'Zone 1 - West',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          assignedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(taskId: string, newStatus: VolunteerTask['status']) {
    try {
      await apiClient.patch(`/volunteers/tasks/${taskId}`, { status: newStatus }).catch(() => {});
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: VolunteerTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Volunteer field assignment',
      zone,
      priority,
      status: 'PENDING',
      assignedAt: new Date().toISOString()
    };

    try {
      await apiClient.post('/volunteers/tasks', newTask);
    } catch (e) {}

    setTasks(prev => [newTask, ...prev]);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  }

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>📋 My Assigned Field Response Tasks</span>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'RESOLVED').length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational tasks assigned by Government EOC dispatchers or claimed by your volunteer squad.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Field Task</span>
          </button>

          <button
            onClick={fetchTasks}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isPending = task.status === 'PENDING';
          const isInProgress = task.status === 'IN_PROGRESS' || task.status === 'ACCEPTED';
          const isCompleted = task.status === 'COMPLETED' || task.status === 'RESOLVED';

          return (
            <div
              key={task.id}
              className={`bg-slate-950/80 border rounded-xl p-4 space-y-3 transition shadow-md ${
                isCompleted ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isCompleted ? 'bg-emerald-950 text-emerald-400' : isInProgress ? 'bg-blue-950 text-blue-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Assigned: {task.assignedAt || task.assigned_at ? new Date(task.assignedAt || task.assigned_at!).toLocaleTimeString() : 'Active'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100">{task.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{task.description}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">📍 Sector: <strong className="text-slate-300">{task.zone}</strong></p>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                {isPending && (
                  <button
                    onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                  >
                    Start Mission →
                  </button>
                )}

                {isInProgress && (
                  <button
                    onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {isCompleted && (
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Task Mission Fulfilled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07172C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B2545] border border-[#D4AF37]/50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white flex flex-col">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between bg-[#07172C]">
              <h3 className="text-sm font-bold text-white">Create Response Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evacuate 8 residents from flooded street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#07172C] border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-mono">Task Description</label>
                <textarea
                  rows={2}
                  placeholder="Location details, special medical needs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#07172C] border border-slate-700 focus:border-emerald-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Sector Zone</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#07172C] border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#07172C] border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="CRITICAL">🚨 Critical</option>
                    <option value="HIGH">🔴 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white shadow-lg"
                >
                  Dispatch Task →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}