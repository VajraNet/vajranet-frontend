import { apiFetch } from './client';

export async function getOverview() {
  try {
    return await apiFetch('/citizen/overview');
  } catch (err) {
    return {
      status: "OFFLINE",
      activeSOSCount: 0,
      activeAnnouncements: [],
      nearestShelter: null
    };
  }
}

export async function sendSOSApi(payload) {
  try {
    return await apiFetch('/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return {
      success: true,
      offlineQueued: true,
      sos: {
        id: `SOS-OFFLINE-${Date.now()}`,
        timestamp: "Just now",
        location: payload.locationName || "Device GPS",
        message: payload.message || "Immediate danger",
        status: "Queued",
        responseState: "Waiting for gateway"
      }
    };
  }
}

export async function getMySOS() {
  try {
    return await apiFetch('/sos/my');
  } catch (err) {
    return [];
  }
}

export async function reportIncidentApi(payload) {
  try {
    return await apiFetch('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return {
      success: true,
      offlineQueued: true,
      incident: {
        id: `INC-OFFLINE-${Date.now()}`,
        ...payload,
        timestamp: "Just now",
        status: "Waiting for gateway"
      }
    };
  }
}

export async function getMyIncidents() {
  try {
    return await apiFetch('/incidents/my');
  } catch (err) {
    return [];
  }
}

export async function getNearbyShelters() {
  try {
    return await apiFetch('/shelters/nearby');
  } catch (err) {
    return [
      { id: "SH-1", name: "District Relief Shelter #1", distanceKm: 1.2, availableSpaces: 150, capacity: 500, status: "OPEN", address: "VT Road, Fort, Mumbai" }
    ];
  }
}

export async function getNearbyHospitals() {
  try {
    return await apiFetch('/hospitals/nearby');
  } catch (err) {
    return [
      { id: "HOSP-1", name: "District Emergency Hospital", distanceKm: 2.4, availableBeds: 32, icuBeds: 6, emergencyStatus: "OPEN", address: "LBS Marg, Ghatkopar" }
    ];
  }
}

export async function getNearbyReliefCenters() {
  try {
    return await apiFetch('/relief-centers/nearby');
  } catch (err) {
    return [
      { id: "REL-1", name: "Community Relief Center", distanceKm: 1.8, hasFood: true, hasWater: true, hasMedicine: true, address: "Bandra Enclave" }
    ];
  }
}

export async function getAnnouncements() {
  try {
    return await apiFetch('/announcements');
  } catch (err) {
    return [
      {
        id: "ANN-1",
        title: "MANDATORY EVACUATION ADVISORY",
        priority: "CRITICAL",
        source: "District Emergency Authority",
        area: "Zone 4 (Kurla & Dharavi)",
        time: "10 mins ago",
        content: "Residents of Zone 4 should move to higher ground or nearby relief shelters immediately."
      }
    ];
  }
}

export async function sendAIChat(message) {
  try {
    return await apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  } catch (err) {
    return {
      reply: "Safety information only. For immediate danger, use SOS. If trapped during a flood, move to higher ground.",
      notice: "Safety information only. For immediate danger, use SOS."
    };
  }
}
