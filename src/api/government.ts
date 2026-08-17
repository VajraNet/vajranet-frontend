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
    try {
      const [sosRes, incRes, shelterRes, hospRes] = await Promise.allSettled([
        apiClient.get('/sos'),
        apiClient.get('/incidents'),
        apiClient.get('/shelters'),
        apiClient.get('/hospitals'),
      ]);

      let activeSos = 0;
      let activeInc = 0;
      let criticalInc = 0;
      let totalCapacity = 0;
      let totalOccupied = 0;
      let availBeds = 0;
      let availIcu = 0;

      if (sosRes.status === 'fulfilled') {
        const d = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(d)) {
          activeSos = d.filter((item: any) => item.status !== 'RESOLVED' && item.status !== 'CANCELLED').length;
        }
      }

      if (incRes.status === 'fulfilled') {
        const d = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(d)) {
          const activeList = d.filter((item: any) => item.status !== 'RESOLVED');
          activeInc = activeList.length;
          criticalInc = activeList.filter((item: any) => item.severity === 'CRITICAL').length;
        }
      }

      if (shelterRes.status === 'fulfilled') {
        const d = shelterRes.value.data?.data || shelterRes.value.data;
        if (Array.isArray(d)) {
          d.forEach((s: any) => {
            totalCapacity += Number(s.capacity || s.total_capacity || 0);
            totalOccupied += Number(s.occupied || 0);
          });
        }
      }

      if (hospRes.status === 'fulfilled') {
        const d = hospRes.value.data?.data || hospRes.value.data;
        if (Array.isArray(d)) {
          d.forEach((h: any) => {
            availBeds += Number(h.available_beds ?? h.availableBeds ?? 0);
            availIcu += Number(h.icu_available ?? h.icuAvailable ?? h.available_icu_beds ?? 0);
          });
        }
      }

      return {
        active_sos_count: activeSos,
        active_incidents_count: activeInc,
        critical_incidents_count: criticalInc,
        total_shelter_capacity: totalCapacity,
        total_shelter_occupied: totalOccupied,
        available_hospital_beds: availBeds,
        available_icu_beds: availIcu,
      };
    } catch {
      return {
        active_sos_count: 0,
        active_incidents_count: 0,
        critical_incidents_count: 0,
        total_shelter_capacity: 0,
        total_shelter_occupied: 0,
        available_hospital_beds: 0,
        available_icu_beds: 0,
      };
    }
  },

  getSOSList: async (): Promise<SOSPayload[]> => {
    const res = await apiClient.get('/sos');
    return ensureArray<SOSPayload>(res.data);
  },

  updateSOSStatus: async (id: string, status: EmergencyStatus): Promise<SOSPayload> => {
    try {
      const res = await apiClient.patch(`/sos/${id}`, { status });
      return res.data;
    } catch {
      const res = await apiClient.patch(`/government/sos/${id}`, { status });
      return res.data;
    }
  },

  getIncidents: async (): Promise<Incident[]> => {
    const res = await apiClient.get('/incidents');
    return ensureArray<Incident>(res.data);
  },

  updateIncidentStatus: async (id: string, status: EmergencyStatus): Promise<Incident> => {
    try {
      const res = await apiClient.patch(`/incidents/${id}`, { status });
      return res.data;
    } catch {
      const res = await apiClient.patch(`/government/incidents/${id}`, { status });
      return res.data;
    }
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'issued_at'>): Promise<Announcement> => {
    try {
      const res = await apiClient.post('/announcements', announcement);
      return res.data;
    } catch {
      const res = await apiClient.post('/government/announcements', announcement);
      return res.data;
    }
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await apiClient.get('/announcements');
    return ensureArray<Announcement>(res.data);
  },

  createShelter: async (shelter: Omit<ResourceShelter, 'id' | 'available'>): Promise<ResourceShelter> => {
    try {
      const res = await apiClient.post('/shelters', shelter);
      return res.data;
    } catch {
      const res = await apiClient.post('/government/shelters', shelter);
      return res.data;
    }
  },

  updateShelter: async (id: string, data: Partial<ResourceShelter>): Promise<ResourceShelter> => {
    try {
      const res = await apiClient.patch(`/shelters/${id}`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/government/shelters/${id}`, data);
      return res.data;
    }
  },

  getShelters: async (): Promise<ResourceShelter[]> => {
    const res = await apiClient.get('/shelters');
    return ensureArray<ResourceShelter>(res.data);
  },

  getHospitals: async (): Promise<ResourceHospital[]> => {
    const res = await apiClient.get('/hospitals');
    return ensureArray<ResourceHospital>(res.data);
  },

  createHospital: async (hospital: Omit<ResourceHospital, 'id'>): Promise<ResourceHospital> => {
    try {
      const res = await apiClient.post('/hospitals', hospital);
      return res.data;
    } catch {
      const res = await apiClient.post('/government/hospitals', hospital);
      return res.data;
    }
  },

  updateHospital: async (id: string, data: Partial<ResourceHospital>): Promise<ResourceHospital> => {
    try {
      const res = await apiClient.patch(`/hospitals/${id}`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/government/hospitals/${id}`, data);
      return res.data;
    }
  },

  getReliefCenters: async (): Promise<ResourceReliefCenter[]> => {
    const res = await apiClient.get('/relief-centers');
    return ensureArray<ResourceReliefCenter>(res.data);
  },

  createReliefCenter: async (center: Omit<ResourceReliefCenter, 'id'>): Promise<ResourceReliefCenter> => {
    try {
      const res = await apiClient.post('/relief-centers', center);
      return res.data;
    } catch {
      const res = await apiClient.post('/government/relief-centers', center);
      return res.data;
    }
  },

  updateReliefCenter: async (id: string, data: Partial<ResourceReliefCenter>): Promise<ResourceReliefCenter> => {
    try {
      const res = await apiClient.patch(`/relief-centers/${id}`, data);
      return res.data;
    } catch {
      const res = await apiClient.patch(`/government/relief-centers/${id}`, data);
      return res.data;
    }
  },

  deleteReliefCenter: async (id: string): Promise<void> => {
    await apiClient.delete(`/relief-centers/${id}`);
  },

  deleteShelter: async (id: string): Promise<void> => {
    await apiClient.delete(`/shelters/${id}`);
  },

  deleteHospital: async (id: string): Promise<void> => {
    await apiClient.delete(`/hospitals/${id}`);
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