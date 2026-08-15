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
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchTasks() {
    try {
      const res = await apiClient.get('/volunteers/tasks');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
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
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
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
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
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
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {task.zone}
                    </span>
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

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold">Create Volunteer Response Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distribute Clean Drinking Water"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Task Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe location, required materials, team size..."
                  rows={3}
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Assigned Sector</label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}