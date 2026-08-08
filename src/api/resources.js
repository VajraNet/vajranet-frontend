import { apiFetch } from './client';

export async function fetchShelters() {
  try {
    return await apiFetch('/resources/shelters');
  } catch (err) {
    return [
      {
        id: "SH-01",
        name: "St. Xavier Community Relief Center",
        address: "VT Road, Fort, Mumbai",
        capacity: 450,
        occupancy: 280,
        distance: "0.8 km",
        status: "OPEN",
        supplies: { water: "Good", food: "Medium", medical: "High" },
        lat: 19.0720,
        lng: 72.8710,
        phone: "+91 98200 12345",
        features: ["Generator Backup", "Child Care", "Doctor on site"]
      },
      {
        id: "SH-02",
        name: "NDRF District Disaster High School",
        address: "Kurla Suburban Complex",
        capacity: 800,
        occupancy: 740,
        distance: "1.4 km",
        status: "NEAR_FULL",
        supplies: { water: "Medium", food: "Low", medical: "Medium" },
        lat: 19.0850,
        lng: 72.8820,
        phone: "+91 98200 67890",
        features: ["Helipad Access", "Clean Water Tank", "Ambulance Bay"]
      },
      {
        id: "SH-03",
        name: "Municipal Indoor Stadium Shelter",
        address: "Bandra Sports Enclave",
        capacity: 1200,
        occupancy: 310,
        distance: "2.1 km",
        status: "OPEN",
        supplies: { water: "High", food: "High", medical: "High" },
        lat: 19.0590,
        lng: 72.8600,
        phone: "+91 98200 99887",
        features: ["Solar Power", "Sanitation Kits", "Pet Friendly"]
      }
    ];
  }
}

export async function fetchHospitals() {
  try {
    return await apiFetch('/resources/hospitals');
  } catch (err) {
    return [
      {
        id: "HOSP-01",
        name: "City General Trauma & Emergency",
        address: "LBS Marg, Ghatkopar",
        icuBedsTotal: 50,
        icuBedsAvailable: 6,
        generalBedsTotal: 300,
        generalBedsAvailable: 28,
        oxygenLevel: "88% (Adequate)",
        distance: "1.2 km",
        status: "OPERATIONAL",
        lat: 19.0810,
        lng: 72.8750,
        emergencyHelpline: "108 / +91 22 2500 1122"
      },
      {
        id: "HOSP-02",
        name: "Apex Super Specialty Hospital",
        address: "SVT Road, Bandra",
        icuBedsTotal: 30,
        icuBedsAvailable: 1,
        generalBedsTotal: 180,
        generalBedsAvailable: 4,
        oxygenLevel: "42% (CRITICAL LOW)",
        distance: "2.5 km",
        status: "HIGH_ALERT",
        lat: 19.0650,
        lng: 72.8550,
        emergencyHelpline: "+91 22 2640 4455"
      }
    ];
  }
}
