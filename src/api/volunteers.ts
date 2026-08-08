import { apiClient } from './client';
import {
  Incident,
  ResourceShelter,
  ResourceHospital,
  VolunteerProfileData,
  Fundraiser,
  EmergencyStatus,
} from '../types/api';

export const volunteerApi = {
  getProfile: async (): Promise<VolunteerProfileData> => {
    const res = await apiClient.get('/volunteers/profile');
    return res.data;
  },
  updateProfile: async (data: Partial<VolunteerProfileData>): Promise<VolunteerProfileData> => {
    const res = await apiClient.patch('/volunteers/profile', data);
    return res.data;
  },
  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/volunteers/incidents');
    return res.data;
  },
  acceptIncident: async (incidentId: string): Promise<Incident> => {
    const res = await apiClient.post(`/volunteers/incidents/${incidentId}/accept`);
    return res.data;
  },
  updateIncidentStatus: async (incidentId: string, status: EmergencyStatus): Promise<Incident> => {
    const res = await apiClient.patch(`/volunteers/incidents/${incidentId}/status`, { status });
    return res.data;
  },
  createPrivateShelter: async (shelter: Omit<ResourceShelter, 'id' | 'available'>): Promise<ResourceShelter> => {
    const res = await apiClient.post('/volunteers/shelters', {
      ...shelter,
      operator_type: 'VOLUNTEER',
    });
    return res.data;
  },
  updatePrivateShelter: async (id: string, data: Partial<ResourceShelter>): Promise<ResourceShelter> => {
    const res = await apiClient.patch(`/volunteers/shelters/${id}`, data);
    return res.data;
  },
  createPrivateHospital: async (hospital: Omit<ResourceHospital, 'id'>): Promise<ResourceHospital> => {
    const res = await apiClient.post('/volunteers/hospitals', {
      ...hospital,
      operator_type: 'VOLUNTEER',
    });
    return res.data;
  },
  updatePrivateHospital: async (id: string, data: Partial<ResourceHospital>): Promise<ResourceHospital> => {
    const res = await apiClient.patch(`/volunteers/hospitals/${id}`, data);
    return res.data;
  },
  getFundraisers: async (): Promise<Fundraiser[]> => {
    const res = await apiClient.get('/volunteers/fundraisers');
    return res.data;
  },
  createFundraiser: async (fundraiser: Omit<Fundraiser, 'id' | 'raised_amount'>): Promise<Fundraiser> => {
    const res = await apiClient.post('/volunteers/fundraisers', fundraiser);
    return res.data;
  },
};