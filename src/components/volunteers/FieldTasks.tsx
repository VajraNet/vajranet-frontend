import React, { useState } from 'react';

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: string;
}

export function FieldTasks() {
  const [tasks, setTasks] = useState<VolunteerTask[]>([
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

  function handleStatusUpdate(taskId: string, newStatus: VolunteerTask['status']) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  }

  const getPriorityBadge = (priority: VolunteerTask['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'MEDIUM':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: VolunteerTask['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-slate-950 text-slate-400 border-slate-800';
      case 'IN_PROGRESS':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'COMPLETED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📋 Assigned Field Tasks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time relief duty dispatch feed assigned to your volunteer deployment team.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getPriorityBadge(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${getStatusBadge(
                    task.status
                  )}`}
                >
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">
                  Assigned: {new Date(task.assignedAt).toLocaleTimeString()}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{task.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
              <p className="text-xs text-slate-400">📍 Location: {task.zone}</p>
            </div>

            {/* Status Update Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {task.status === 'PENDING' && (
                <button
                  onClick={() => handleStatusUpdate(task.id, 'IN_PROGRESS')}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-semibold transition"
                >
                  Start Task
                </button>
              )}
              {task.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-semibold transition"
                >
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}