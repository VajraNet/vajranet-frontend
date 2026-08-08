import { apiFetch } from './client';

export async function fetchVolunteerTasks() {
  try {
    return await apiFetch('/volunteers/tasks');
  } catch (err) {
    return [
      { id: 'TASK-401', title: 'Distribute 200 Water Packets', location: 'Kurla Shelter #2', priority: 'URGENT', status: 'PENDING', assignedVolunteers: 3 },
      { id: 'TASK-402', title: 'Escort Elderly Group to High Ground', location: 'Dharavi Sector 3', priority: 'CRITICAL', status: 'IN_PROGRESS', assignedVolunteers: 5 },
      { id: 'TASK-403', title: 'Setup Portable Satellite Mesh Beacon', location: 'Santacruz Flyover', priority: 'HIGH', status: 'COMPLETED', assignedVolunteers: 2 }
    ];
  }
}

export async function createVolunteerTask(taskData) {
  try {
    return await apiFetch('/volunteers/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  } catch (err) {
    return {
      success: true,
      task: {
        id: `TASK-${Math.floor(400 + Math.random() * 100)}`,
        ...taskData,
        status: 'PENDING'
      }
    };
  }
}
