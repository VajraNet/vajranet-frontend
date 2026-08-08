import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, MapPin, Plus } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { fetchVolunteerTasks, createVolunteerTask } from '../api/volunteers';

export default function VolunteerPortal() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    fetchVolunteerTasks().then(data => setTasks(data));
  }, []);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const res = await createVolunteerTask({
      title: newTitle,
      location: newLocation || 'Ground Zero',
      priority: 'HIGH',
      assignedVolunteers: 1
    });
    setTasks([res.task, ...tasks]);
    setNewTitle('');
    setNewLocation('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="op-card p-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white font-mono uppercase">Volunteer Operations Hub</h2>
          <p className="text-xs text-slate-400">Offline rescue task dispatch, field coordination, and resource delivery</p>
        </div>
        <Badge variant="info">18 Active Responders</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Task Form */}
        <Card title="Broadcast Field Task">
          <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1 uppercase">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Distribute 50 blankets to Shelter #1"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono mb-1 uppercase">Field Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                placeholder="e.g. Kurla West Flyover"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Dispatch Task
            </Button>
          </form>
        </Card>

        {/* Task List */}
        <div className="md:col-span-2 space-y-3">
          {tasks.map(t => (
            <Card key={t.id}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-cyan-400">{t.id}</span>
                    <Badge variant={t.priority === 'CRITICAL' ? 'critical' : 'warning'}>{t.priority}</Badge>
                  </div>
                  <h4 className="font-bold text-white text-sm">{t.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                    {t.location} • {t.assignedVolunteers} volunteers assigned
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {t.status !== 'COMPLETED' ? (
                    <>
                      <Button 
                        size="sm" 
                        variant={t.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                        onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}
                      >
                        In Progress
                      </Button>
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={() => handleStatusChange(t.id, 'COMPLETED')}
                      >
                        Complete
                      </Button>
                    </>
                  ) : (
                    <Badge variant="success">RESOLVED</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
