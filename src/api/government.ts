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

export const governmentApi = {
  getOverview: async (): Promise<GovernmentOverview> => {
    const res = await apiClient.get('/government/overview');
    return res.data;
  },

  getSOSList: async (): Promise<SOSPayload[]> => {
    const res = await apiClient.get('/government/sos');
    return res.data;
  },

  updateSOSStatus: async (id: string, status: EmergencyStatus): Promise<SOSPayload> => {
    const res = await apiClient.patch(`/government/sos/${id}`, { status });
    return res.data;
  },

  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/government/incidents');
    return res.data;
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
    return res.data;
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
    const res = await apiClient.get('/shelters/nearby');
    return res.data;
  },

  getHospitals: async (): Promise<ResourceHospital[]> => {
    const res = await apiClient.get('/hospitals/nearby');
    return res.data;
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
    const res = await apiClient.get('/relief-centers/nearby');
    return res.data;
  },

  createReliefCenter: async (center: Omit<ResourceReliefCenter, 'id'>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.post('/government/relief-centers', center);
    return res.data;
  },

  updateReliefCenter: async (id: string, data: Partial<ResourceReliefCenter>): Promise<ResourceReliefCenter> => {
    const res = await apiClient.patch(`/government/relief-centers/${id}`, data);
    return res.data;
  },
};