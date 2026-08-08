export const INITIAL_INCIDENTS = [
  {
    id: "SOS-8091",
    type: "Medical / Severe Traumatic Injury",
    severity: "CRITICAL",
    lat: 19.0760,
    lng: 72.8777,
    locationName: "Dharavi Sector 3, Mumbai",
    victimCount: 4,
    reportedAt: "2 mins ago",
    meshHops: 3,
    relayedBy: "Node-Beta-7 (Mobile Mesh)",
    status: "DISPATCHED",
    assignedTeam: "NDRF Squad 4",
    notes: "Building balcony wall collapsed due to flash flood. 2 elderly trapped with head injury.",
    needs: ["Medical Evac", "Stretcher", "First Aid"]
  },
  {
    id: "SOS-8092",
    type: "Flash Flood / Roof Stranded",
    severity: "HIGH",
    lat: 19.0880,
    lng: 72.8890,
    locationName: "Kurla West Metro Bridge",
    victimCount: 12,
    reportedAt: "7 mins ago",
    meshHops: 2,
    relayedBy: "Gateway Node-Alpha-1",
    status: "PENDING",
    assignedTeam: "Unassigned",
    notes: "Water level rose 5ft in 20 mins. 12 citizens stranded on high concrete platform.",
    needs: ["Inflatable Boat", "Life Jackets", "Drinking Water"]
  },
  {
    id: "SOS-8093",
    type: "Power Line Fire & Structural Damage",
    severity: "MEDIUM",
    lat: 19.0620,
    lng: 72.8650,
    locationName: "Bandra East Housing Society",
    victimCount: 2,
    reportedAt: "14 mins ago",
    meshHops: 4,
    relayedBy: "Node-Gamma-12",
    status: "IN_PROGRESS",
    assignedTeam: "Local Volunteer Group 2",
    notes: "High voltage transformer spark near flooded alley. Alley blocked.",
    needs: ["Fire Suppressant", "Power Grid Cut"]
  },
  {
    id: "SOS-8094",
    type: "Elderly Oxygen Supply Exhaustion",
    severity: "CRITICAL",
    lat: 19.0950,
    lng: 72.8520,
    locationName: "Santacruz East Lane 4",
    victimCount: 1,
    reportedAt: "19 mins ago",
    meshHops: 1,
    relayedBy: "Direct Mesh Gateway",
    status: "DISPATCHED",
    assignedTeam: "Apex Hospital Ambulance 2",
    notes: "Power outage caused home concentrator failure. Patient has 15 mins battery remaining.",
    needs: ["Portable O2 Cylinder", "Ambulance"]
  }
];

export const MOCK_SHELTERS = [
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

export const MOCK_HOSPITALS = [
  {
    id: "HOSP-01",
    name: "City General Trauma & Emergency",
    address: "LBS Marg, Ghatkopar",
    icuBedsTotal: 50,
    icuBedsAvailable: 6,
    generalBedsTotal: 300,
    generalBedsAvailable: 28,
    oxygenLevel: "88% (Adequate)",
    bloodUnitsAvailable: { O_NEG: 12, A_POS: 45, B_POS: 30 },
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
    bloodUnitsAvailable: { O_NEG: 2, A_POS: 10, B_POS: 8 },
    distance: "2.5 km",
    status: "HIGH_ALERT",
    lat: 19.0650,
    lng: 72.8550,
    emergencyHelpline: "+91 22 2640 4455"
  }
];

export const MOCK_MESH_NODES = [
  { id: "GATEWAY-ALPHA", name: "Gov Command Tower (Satellite Gateway)", type: "GATEWAY", battery: 100, signal: "Strong", lat: 19.0760, lng: 72.8777, hops: 0, status: "ONLINE" },
  { id: "NODE-101", name: "Citizen Device (Samsung S23)", type: "PEER", battery: 78, signal: "Good", lat: 19.0780, lng: 72.8790, hops: 1, status: "MESH_ACTIVE" },
  { id: "NODE-102", name: "Volunteer Walkie Node B", type: "RELAY", battery: 92, signal: "Strong", lat: 19.0740, lng: 72.8750, hops: 1, status: "MESH_ACTIVE" },
  { id: "NODE-103", name: "Shelter Router Beacon", type: "BEACON", battery: 100, signal: "Strong", lat: 19.0720, lng: 72.8710, hops: 2, status: "MESH_ACTIVE" },
  { id: "NODE-104", name: "Citizen Device (iPhone 14)", type: "PEER", battery: 34, signal: "Weak", lat: 19.0820, lng: 72.8840, hops: 3, status: "OFFLINE_QUEUED" }
];

export const MOCK_VOLUNTEER_TASKS = [
  { id: "TASK-401", title: "Distribute 200 Water Packets", location: "Kurla Shelter #2", priority: "URGENT", status: "PENDING", assignedVolunteers: 3 },
  { id: "TASK-402", title: "Escort Elderly Group to High Ground", location: "Dharavi Sector 3", priority: "CRITICAL", status: "IN_PROGRESS", assignedVolunteers: 5 },
  { id: "TASK-403", title: "Setup Portable Satellite Mesh Beacon", location: "Santacruz Flyover", priority: "HIGH", status: "COMPLETED", assignedVolunteers: 2 }
];

export const SAMPLE_DAMAGE_IMAGES = [
  {
    id: "IMG-01",
    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    title: "Urban Flood & Submerged Roads",
    type: "INUNDATION / FLOOD",
    severity: "HIGH (87%)",
    damageDesc: "Heavy waterlogging depth 3.5ft. Road access blocked for regular vehicles. Rescue boats required.",
    affectedInfra: ["Roadway network", "Underground cabling", "Basement parking"],
    suggestedAction: "Deploy amphibian vehicles, issue flash flood evacuation alert for low-lying ground floors."
  },
  {
    id: "IMG-02",
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
    title: "Building Structural Wall Fracture",
    type: "STRUCTURAL COLLAPSE",
    severity: "CRITICAL (94%)",
    damageDesc: "Load-bearing column shear crack detected. High probability of partial collapse.",
    affectedInfra: ["Residential building", "Power transformer near base"],
    suggestedAction: "Immediate 100m cordon, evacuate residents, call structural engineering team."
  },
  {
    id: "IMG-03",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    title: "Downed High Voltage Power Grid",
    type: "ELECTRICAL HAZARD",
    severity: "CRITICAL (91%)",
    damageDesc: "11kV overhead wire snapped across live floodwater alley.",
    affectedInfra: ["Power Grid distribution", "Pedestrian walkway"],
    suggestedAction: "Remote substation trip command via VajraNet telemetry. Do not enter water."
  }
];

export const MOCK_RUMORS = [
  {
    id: "RUMOR-101",
    text: "ALERT: Chembur Dam wall has burst! Water level expected 15ft in next 10 mins!",
    credibilityScore: "12% (VERIFIED FAKE)",
    status: "FAKE",
    details: "NDRF & Irrigation Dept confirm dam structure is 100% intact with water level below hazard mark.",
    flagCount: 42,
    recommendation: "Issue automated debunks via VajraNet P2P mesh broadcast."
  },
  {
    id: "RUMOR-102",
    text: "St. Xavier Shelter distributing free dry ration and clean water until 6 PM.",
    credibilityScore: "98% (VERIFIED TRUE)",
    status: "VERIFIED",
    details: "Confirmed by Shelter Manager SH-01 via VajraNet sync dashboard.",
    flagCount: 1,
    recommendation: "Promote to official Citizen bulletin feed."
  }
];
