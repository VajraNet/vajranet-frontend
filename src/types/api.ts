export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EmergencyStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'PENDING' | 'CANCELLED' | 'REPORTED' | 'VERIFIED' | 'INVESTIGATING' | 'RESPONSE_EN_ROUTE' | 'CONFIRMED';
export type DisasterType = 'FLOOD' | 'FIRE' | 'EARTHQUAKE' | 'LANDSLIDE' | 'ACCIDENT' | 'BUILDING_COLLAPSE' | 'MEDICAL' | 'OTHER' | 'ROAD_BLOCK' | 'MEDICAL_EMERGENCY';

export interface Location {
  latitude?: number;
  longitude?: number;
  address?: string;
  zone?: string;
}

export interface SOSPayload {
  id: string;
  message_id?: string;
  citizen_id?: string;
  location?: Location;
  latitude?: number;
  longitude?: number;
  user_name?: string;
  user_phone?: string;
  severity: SeverityLevel | string;
  message?: string;
  status: EmergencyStatus | string;
  created_at: string;
}

export interface Incident {
  id: string;
  message_id?: string;
  title?: string;
  type?: string;
  disaster_type?: DisasterType | string;
  severity: SeverityLevel | string;
  description: string;
  location?: Location;
  latitude?: number;
  longitude?: number;
  address?: string;
  zone?: string;
  image_url?: string;
  media_urls?: string[];
  status: EmergencyStatus | string;
  reported_at?: string;
  created_at?: string;
  assigned_volunteer_id?: string;
}

export interface ResourceShelter {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'VOLUNTEER';
  location?: Location;
  address?: string;
  latitude?: number;
  longitude?: number;
  total_capacity?: number;
  capacity?: number;
  occupied?: number;
  available?: number;
  available_capacity?: number;
  is_open?: boolean;
  status?: string;
  contact_phone?: string;
  contact_person?: string;
}

export interface ResourceHospital {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'PRIVATE';
  type?: string;
  location?: {
    zone?: string;
    address?: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  total_beds?: number;
  available_beds?: number;
  total_icu_beds?: number;
  available_icu_beds?: number;
  icu_total?: number;
  icu_available?: number;
  is_emergency_open?: boolean;
  emergency_available?: boolean;
  oxygen_available?: boolean;
  blood_available?: boolean;
  status?: string;
  contact_phone?: string;
  phone?: string;
}

export interface ResourceReliefCenter {
  id: string;
  name: string;
  operator_type?: 'GOVERNMENT' | 'PRIVATE';
  location?: {
    zone?: string;
    address?: string;
  };
  address?: string;
  latitude?: number;
  longitude?: number;
  supplies?: {
    food?: boolean;
    water?: boolean;
    medicine?: boolean;
    blankets?: boolean;
  };
  items_available?: string;
  food_packets_available?: number;
  water_liters_available?: number;
  medical_kits_available?: number;
  blankets_available?: number;
  is_open?: boolean;
  status?: string;
  contact_phone?: string;
  contact_person?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  message?: string;
  type?: 'ALERT' | 'EVACUATION' | 'SAFETY_INFO' | 'UPDATE' | string;
  target_area?: string;
  area?: string;
  priority?: SeverityLevel | string;
  issued_at?: string;
  created_at?: string;
  expires_at?: string;
  source_authority?: string;
}

export interface GovernmentOverview {
  active_sos_count: number;
  active_incidents_count: number;
  critical_incidents_count: number;
  volunteers_responding_count?: number;
  total_shelter_capacity: number;
  total_shelter_occupied: number;
  available_hospital_beds: number;
  available_icu_beds: number;
}

export interface VolunteerProfileData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  zone?: string;
  is_on_duty?: boolean;
  availability_status?: string;
  skills?: string[];
  certifications?: string[];
  tasks_completed?: number;
  hours_active?: number;
  [key: string]: any;
}

export interface Fundraiser {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  organizer?: string;
  upi_id?: string;
  qr_code_url?: string;
  status?: string;
  created_at?: string;
}