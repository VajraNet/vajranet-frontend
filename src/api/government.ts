import { apiClient } from './client';
import {
  GovernmentOverview,
  SOSPayload,
  Incident,
  Announcement,
  ResourceShelter,
  ResourceHospital,
  ResourceReliefCenter,
  EmergencyStatus,
} from '../types/api';

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const governmentApi = {
  getOverview: async (): Promise<GovernmentOverview> => {
    const res = await apiClient.get('/government/overview');
    const d = res.data || {};
    return {
      active_sos_count: d.active_sos_count ?? 0,
      active_incidents_count: d.active_incidents_count ?? 0,
      critical_incidents_count: d.critical_incidents_count ?? 0,
      total_shelter_capacity: d.total_shelter_capacity ?? 0,
      total_shelter_occupied: d.total_shelter_occupied ?? 0,
      available_hospital_beds: d.available_hospital_beds ?? 0,
      available_icu_beds: d.available_icu_beds ?? 0,
    };
  },

  getSOSList: async (): Promise<SOSPayload[]> => {
    const res = await apiClient.get('/government/sos');
    return ensureArray<SOSPayload>(res.data);
  },

  updateSOSStatus: async (id: string, status: EmergencyStatus): Promise<SOSPayload> => {
    const res = await apiClient.patch(`/government/sos/${id}`, { status });
    return res.data;
  },

  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/government/incidents');
    return ensureArray<Incident>(res.data);
  },

  updateIncidentStatus: async (id: string, status: EmergencyStatus): Promise<Incident> => {
    const res = await apiClient.patch(`/government/incidents/${id}`, { status });
    return res.data;
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'issued_at'>): Promise<Announcement> => {
    const res = await apiClient.post('/government/announcements', announcement);
    return res.data;
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await apiClient.get('/announcements');
    return ensureArray<Announcement>(res.data);
  },

  createShelter: async (shelter: Omit<ResourceShelter, 'id' | 'available'>): Promise<ResourceShelter> => {
    const res = await apiClient.post('/government/shelters', shelter);
    return res.data;
  },

  updateShelter: async (id: string, data: Partial<ResourceShelter>): Promise<ResourceShelter> => {
    const res = await apiClient.patch(`/government/shelters/${id}`, data);
    return res.data;
  },

  getShelters: async (): Promise<ResourceShelter[]> => {
    const res = await apiClient.get('/resources/shelters');
    return ensureArray<ResourceShelter>(res.data);
  },

  getHospitals: async (): Promise<ResourceHospital[]> => {
    const res = await apiClient.get('/resources/hospitals');
    return ensureArray<ResourceHospital>(res.data);
  },

  createHospital: async (hospital: Omit<ResourceHospital, 'id'>): Promise<ResourceHospital> => {
    const res = await apiClient.post('/government/hospitals', hospital);
    return res.data;
  },

  updateHospital: async (id: string, data: Partial<ResourceHospital>): Promise<ResourceHospital> => {
    const res = await apiClient.patch(`/government/hospitals/${id}`, data);
    return res.data;
  },

  getReliefCenters: async (): Promise<ResourceReliefCenter[]> => {
    const res = await apiClient.get('/resources/relief-centers');
    return ensureArray<ResourceReliefCenter>(res.data);
  },

  createReliefCenter: async (center: Omit<ResourceReliefCenter, 'id'>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.post('/government/relief-centers', center);
    return res.data;
  },

  updateReliefCenter: async (id: string, data: Partial<ResourceReliefCenter>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.patch(`/government/relief-centers/${id}`, data);
    return res.data;
  },

  deleteReliefCenter: async (id: string): Promise<void> => {
    await apiClient.delete(`/relief-centers/${id}`);
  },

  getTrustedDevices: async (): Promise<any[]> => {
    const res = await apiClient.get('/devices/trusted/');
    return ensureArray(res.data);
  },

  registerTrustedDevice: async (data: { name: string; phone: string; role?: string; latitude?: number; longitude?: number }): Promise<any> => {
    const res = await apiClient.post('/devices/trusted/', data);
    return res.data;
  },

  deleteTrustedDevice: async (id: string): Promise<void> => {
    await apiClient.delete(`/devices/trusted/${id}`);
  },

  relaySosPayload: async (payload: any): Promise<any> => {
    const res = await apiClient.post('/devices/trusted/relay-sos', payload);
    return res.data;
  }
};