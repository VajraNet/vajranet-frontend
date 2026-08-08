export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmergencyStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
export type DisasterType = 'FLOOD' | 'FIRE' | 'EARTHQUAKE' | 'LANDSLIDE' | 'ACCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL' | 'OTHER';

export interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  zone?: string;
}

export interface SOSPayload {
  id: string;
  citizen_id: string;
  location: Location;
  severity: SeverityLevel;
  message?: string;
  status: EmergencyStatus;
  created_at: string;
}

export interface Incident {
  id: string;
  disaster_type: DisasterType;
  severity: SeverityLevel;
  description: string;
  location: Location;
  image_url?: string;
  status: EmergencyStatus;
  reported_at: string;
  assigned_volunteer_id?: string;
}

export interface ResourceShelter {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'VOLUNTEER';
  location: Location;
  total_capacity: number;
  occupied: number;
  available: number;
  is_open: boolean;
  contact_phone?: string;
}

export interface ResourceHospital {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'PRIVATE';
  location:{
    zone: string;
    address?: string;
  };
  total_beds: number;
  available_beds: number;
  total_icu_beds: number;
  available_icu_beds: number;
  is_emergency_open: boolean;
  contact_phone?: string;
}

export interface ResourceReliefCenter {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'PRIVATE';
  location:{
    zone: string;
    address?: string;
  }
  supplies: {
    food: boolean;
    water: boolean;
    medicine: boolean;
    blankets?: boolean;
  };
  is_open: boolean;
  contact_phone?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'EVACUATION' | 'SAFETY_INFO' | 'UPDATE';
  target_area: string;
  priority: SeverityLevel;
  issued_at: string;
  expires_at?: string;
  source_authority?: string;
}

export interface GovernmentOverview {
  active_sos_count: number;
  active_incidents_count: number;
  critical_incidents_count: number;
  total_shelter_capacity: number;
  total_shelter_occupied: number;
  available_hospital_beds: number;
  available_icu_beds: number;
}

export interface VolunteerProfileData {
  id: string;
  name: string;
  organization?: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  skills: string[];
  operating_area: string;
}

export interface Fundraiser {
  id: string;
  title: string;
  target_amount: number;
  raised_amount: number;
  target_area: string;
  organization: string;
}