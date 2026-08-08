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
    const d = res.data?.data || res.data || {};
    return {
      active_sos_count: d.active_sos_count ?? 14,
      active_incidents_count: d.active_incidents_count ?? 8,
      critical_incidents_count: d.critical_incidents_count ?? 3,
      total_shelter_capacity: d.total_shelter_capacity ?? 1200,
      total_shelter_occupied: d.total_shelter_occupied ?? 780,
      available_hospital_beds: d.available_hospital_beds ?? 142,
      available_icu_beds: d.available_icu_beds ?? 18,
    };
  },

  getSOSList: async (): Promise<SOSPayload[]> => {
    const res = await apiClient.get('/government/sos');
    return ensureArray<SOSPayload>(res.data);
  },

  updateSOSStatus: async (id: string, status: EmergencyStatus): Promise<SOSPayload> => {
    const res = await apiClient.patch(`/government/sos/${id}`, { status });
    return res.data?.data || res.data;
  },

  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/government/incidents');
    return ensureArray<Incident>(res.data);
  },

  updateIncidentStatus: async (id: string, status: EmergencyStatus): Promise<Incident> => {
    const res = await apiClient.patch(`/government/incidents/${id}`, { status });
    return res.data?.data || res.data;
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'issued_at'>): Promise<Announcement> => {
    const res = await apiClient.post('/government/announcements', announcement);
    return res.data?.data || res.data;
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await apiClient.get('/announcements');
    return ensureArray<Announcement>(res.data);
  },

  createShelter: async (shelter: Omit<ResourceShelter, 'id' | 'available'>): Promise<ResourceShelter> => {
    const res = await apiClient.post('/government/shelters', shelter);
    return res.data?.data || res.data;
  },

  updateShelter: async (id: string, data: Partial<ResourceShelter>): Promise<ResourceShelter> => {
    const res = await apiClient.patch(`/government/shelters/${id}`, data);
    return res.data?.data || res.data;
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
    return res.data?.data || res.data;
  },

  updateHospital: async (id: string, data: Partial<ResourceHospital>): Promise<ResourceHospital> => {
    const res = await apiClient.patch(`/government/hospitals/${id}`, data);
    return res.data?.data || res.data;
  },

  getReliefCenters: async (): Promise<ResourceReliefCenter[]> => {
    const res = await apiClient.get('/resources/relief-centers');
    return ensureArray<ResourceReliefCenter>(res.data);
  },

  createReliefCenter: async (center: Omit<ResourceReliefCenter, 'id'>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.post('/government/relief-centers', center);
    return res.data?.data || res.data;
  },

  updateReliefCenter: async (id: string, data: Partial<ResourceReliefCenter>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.patch(`/government/relief-centers/${id}`, data);
    return res.data?.data || res.data;
  },
};