import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Radio, 
  MapPin,
  Send
} from 'lucide-react';
import { MOCK_VOLUNTEER_TASKS } from '../data/mockData';

export default function VolunteerHub() {
  const [tasks, setTasks] = useState(MOCK_VOLUNTEER_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState('');

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const newTask = {
      id: `TASK-${Math.floor(400 + Math.random() * 500)}`,
      title: newTaskTitle,
      location: newTaskLocation || 'Ground Zero Sector 2',
      priority: 'HIGH',
      status: 'PENDING',
      assignedVolunteers: 1
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskLocation('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Volunteer Field Operations & Coordination Hub
            </h2>
            <p className="text-xs text-slate-300">
              Offline task assignment, team sync log, and victim rescue dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-cyan-400">
            18 Active Volunteers On Field
          </span>
        </div>
      </div>

      {/* Task Creation & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Task Form */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
          <h3 className="text-base font-bold text-white font-heading flex items-center space-x-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>Create Rescue / Supply Task</span>
          </h3>

          <form onSubmit={handleAddTask} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1 uppercase">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Deliver 50 blankets to Shelter #1"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1 uppercase">Field Location</label>
              <input
                type="text"
                value={newTaskLocation}
                onChange={e => setNewTaskLocation(e.target.value)}
                placeholder="e.g. Santacruz Flyover Pillbox"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              Broadcast Task to Field Teams
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Task Board */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-base font-bold text-white font-heading">
            Live Volunteer Field Tasks ({tasks.length})
          </h3>

          <div className="space-y-3">
            {tasks.map(t => (
              <div key={t.id} className="glass-card p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {t.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      t.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{t.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                    {t.location} • <span className="text-slate-300 ml-1">{t.assignedVolunteers} volunteers assigned</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {t.status !== 'COMPLETED' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          t.status === 'IN_PROGRESS' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        In Progress
                      </button>

                      <button
                        onClick={() => handleStatusChange(t.id, 'COMPLETED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Mark Complete
                      </button>
                    </>
                  ) : (
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Task Resolved</span>
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
