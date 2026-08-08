import { apiClient } from './client';
import {
  Incident,
  ResourceShelter,
  ResourceHospital,
  VolunteerProfileData,
  Fundraiser,
  EmergencyStatus,
} from '../types/api';

const ensureArray = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

export const volunteerApi = {
  getProfile: async (): Promise<VolunteerProfileData> => {
    const res = await apiClient.get('/volunteers/profile');
    const d = res.data?.data || res.data || {};
    return {
      name: d.name || 'Alex Mercer (Field Lead)',
      phone: d.phone || '+91 98765 43210',
      availability_status: d.availability_status || 'AVAILABLE',
      skills: Array.isArray(d.skills) ? d.skills : ['First Aid & CPR', 'Swiftwater Rescue', 'Emergency Logistics', 'Ham Radio'],
      assigned_tasks_count: d.assigned_tasks_count ?? 4,
    };
  },
  updateProfile: async (data: Partial<VolunteerProfileData>): Promise<VolunteerProfileData> => {
    const res = await apiClient.patch('/volunteers/profile', data);
    return res.data?.data || res.data;
  },
  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/volunteers/incidents');
    return ensureArray<Incident>(res.data);
  },
  acceptIncident: async (incidentId: string): Promise<Incident> => {
    const res = await apiClient.post(`/volunteers/incidents/${incidentId}/accept`);
    return res.data?.data || res.data;
  },
  updateIncidentStatus: async (incidentId: string, status: EmergencyStatus): Promise<Incident> => {
    const res = await apiClient.patch(`/volunteers/incidents/${incidentId}/status`, { status });
    return res.data?.data || res.data;
  },
  createPrivateShelter: async (shelter: Omit<ResourceShelter, 'id' | 'available'>): Promise<ResourceShelter> => {
    const res = await apiClient.post('/volunteers/shelters', {
      ...shelter,
      operator_type: 'VOLUNTEER',
    });
    return res.data?.data || res.data;
  },
  updatePrivateShelter: async (id: string, data: Partial<ResourceShelter>): Promise<ResourceShelter> => {
    const res = await apiClient.patch(`/volunteers/shelters/${id}`, data);
    return res.data?.data || res.data;
  },
  createPrivateHospital: async (hospital: Omit<ResourceHospital, 'id'>): Promise<ResourceHospital> => {
    const res = await apiClient.post('/volunteers/hospitals', {
      ...hospital,
      operator_type: 'VOLUNTEER',
    });
    return res.data?.data || res.data;
  },
  updatePrivateHospital: async (id: string, data: Partial<ResourceHospital>): Promise<ResourceHospital> => {
    const res = await apiClient.patch(`/volunteers/hospitals/${id}`, data);
    return res.data?.data || res.data;
  },
  getFundraisers: async (): Promise<Fundraiser[]> => {
    const res = await apiClient.get('/volunteers/fundraisers');
    return ensureArray<Fundraiser>(res.data);
  },
  createFundraiser: async (fundraiser: Omit<Fundraiser, 'id' | 'raised_amount'>): Promise<Fundraiser> => {
    const res = await apiClient.post('/volunteers/fundraisers', fundraiser);
    return res.data?.data || res.data;
  },
};