import { apiFetch } from './client';
import { INITIAL_INCIDENTS } from '../data/mockData';

export async function fetchIncidents() {
  try {
    return await apiFetch('/incidents');
  } catch (err) {
    return INITIAL_INCIDENTS;
  }
}

export async function dispatchForce(incidentId, teamName) {
  try {
    return await apiFetch(`/incidents/${incidentId}/dispatch`, {
      method: 'PATCH',
      body: JSON.stringify({ teamName }),
    });
  } catch (err) {
    return {
      success: true,
      incidentId,
      assignedTeam: teamName,
      status: 'DISPATCHED'
    };
  }
}
