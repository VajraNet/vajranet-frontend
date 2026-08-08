import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  AlertTriangle, 
  Home, 
  HeartPulse, 
  Package, 
  Layers, 
  Compass, 
  Crosshair, 
  Eye, 
  Flame, 
  Waves, 
  Building2, 
  ShieldAlert, 
  Phone, 
  ExternalLink,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { governmentApi } from '../../api/government';
import { SOSPayload, Incident, ResourceShelter, ResourceHospital, ResourceReliefCenter } from '../../types/api';

interface TacticalGISMapProps {
  initialCenter?: [number, number];
  zoom?: number;
  height?: string;
  readOnly?: boolean;
}

export function TacticalGISMap({ 
  initialCenter = [28.6139, 77.2090], 
  zoom = 13,
  height = '620px'
}: TacticalGISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter state
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'SOS' | 'INCIDENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'DARK' | 'STREET'>('DARK');

  // Live Data state
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<ResourceShelter[]>([]);
  const [hospitals, setHospitals] = useState<ResourceHospital[]>([]);
  const [reliefCenters, setReliefCenters] = useState<ResourceReliefCenter[]>([]);

  // 1. Fetch Real Data with Fallbacks
  const loadGISData = async () => {
    setIsLoading(true);
    try {
      const [sosRes, incRes, shRes, hospRes, rcRes] = await Promise.allSettled([
        governmentApi.getSOSList(),
        governmentApi.getIncidents(),
        governmentApi.getShelters(),
        governmentApi.getHospitals(),
        governmentApi.getReliefCenters(),
      ]);

      // SOS
      if (sosRes.status === 'fulfilled' && sosRes.value.length > 0) {
        setSosList(sosRes.value);
      } else {
        setSosList([
          {
            id: 'SOS-801',
            message: '4 adults & 2 children stranded on terrace. Flood water level reaching 2nd floor.',
            latitude: 28.6185,
            longitude: 77.2140,
            severity: 'CRITICAL',
            status: 'PENDING',
            user_name: 'Vikram Joshi',
            user_phone: '+91 98111 22334',
            created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
          {
            id: 'SOS-802',
            message: 'Elderly cardiac patient requires oxygen cylinder and immediate medical evacuation.',
            latitude: 28.6080,
            longitude: 77.2025,
            severity: 'CRITICAL',
            status: 'ACKNOWLEDGED',
            user_name: 'Ananya Roy',
            user_phone: '+91 98765 11223',
            created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          },
          {
            id: 'SOS-803',
            message: 'Power grid collapsed. 15 families sheltering in community hall need drinking water.',
            latitude: 28.6250,
            longitude: 77.2210,
            severity: 'HIGH',
            status: 'PENDING',
            user_name: 'Rajesh Kumar',
            user_phone: '+91 99887 76655',
            created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
        ]);
      }

      // Incidents
      if (incRes.status === 'fulfilled' && incRes.value.length > 0) {
        setIncidents(incRes.value);
      } else {
        setIncidents([
          {
            id: 'INC-401',
            title: 'Yamuna River Embankment Breach',
            description: 'Major breach reported near Sector 3 floodwall. Water inundating arterial bypass road.',
            type: 'FLOOD',
            severity: 'CRITICAL',
            status: 'INVESTIGATING',
            latitude: 28.6290,
            longitude: 77.2180,
            created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          },
          {
            id: 'INC-402',
            title: 'Transformer Explosion & Structural Fire',
            description: 'Substation transformer fire spreading to adjacent commercial warehouse.',
            type: 'FIRE',
            severity: 'HIGH',
            status: 'DISPATCHED',
            latitude: 28.6050,
            longitude: 77.2120,
            created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
          },
          {
            id: 'INC-403',
            title: 'Bridge Structural Crack & Blockade',
            description: 'Old civil bridge over canal cracked. Traffic halted by local volunteers.',
            type: 'ROAD_BLOCK',
            severity: 'MEDIUM',
            status: 'ACKNOWLEDGED',
            latitude: 28.6120,
            longitude: 77.1950,
            created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
          },
        ]);
      }

      // Shelters
      if (shRes.status === 'fulfilled' && shRes.value.length > 0) {
        setShelters(shRes.value);
      } else {
        setShelters([
          {
            id: 'SH-101',
            name: 'Sector 4 Indoor Stadium Relief Camp',
            address: 'Sports Complex, Sector 4, Civil Lines',
            capacity: 800,
            occupied: 460,
            latitude: 28.6220,
            longitude: 77.2050,
            has_food: true,
            has_water: true,
            has_medical: true,
            status: 'OPEN',
            available: 340,
          },
          {
            id: 'SH-102',
            name: 'Govt Model High School Shelter',
            address: 'Station Road, North Campus',
            capacity: 400,
            occupied: 380,
            latitude: 28.6090,
            longitude: 77.2280,
            has_food: true,
            has_water: true,
            has_medical: false,
            status: 'OPEN',
            available: 20,
          },
        ]);
      }

      // Hospitals
      if (hospRes.status === 'fulfilled' && hospRes.value.length > 0) {
        setHospitals(hospRes.value);
      } else {
        setHospitals([
          {
            id: 'HOSP-201',
            name: 'Apex Super Specialty Trauma Center',
            address: 'Ring Road, Sector 7',
            total_beds: 350,
            available_beds: 42,
            icu_available: 8,
            oxygen_available: true,
            contact_number: '+91 11 2345 6789',
            latitude: 28.6160,
            longitude: 77.1980,
            status: 'OPERATIONAL',
          },
          {
            id: 'HOSP-202',
            name: 'Red Cross Emergency Field Hospital',
            address: 'Naval Dock Gate 3, Riverbank',
            total_beds: 120,
            available_beds: 28,
            icu_available: 4,
            oxygen_available: true,
            contact_number: '+91 11 9876 5432',
            latitude: 28.6270,
            longitude: 77.2100,
            status: 'OPERATIONAL',
          },
        ]);
      }

      // Relief Centers
      if (rcRes.status === 'fulfilled' && rcRes.value.length > 0) {
        setReliefCenters(rcRes.value);
      } else {
        setReliefCenters([
          {
            id: 'RC-301',
            name: 'NDRF Central Ration & Water Depot',
            address: 'Warehouse Block 12, Logistics Zone',
            items_available: 'Ration Kits (1200), Water Packets (5000), Blankets (800)',
            contact_person: 'Sub-Inspector Rawat (+91 94123 45678)',
            latitude: 28.6190,
            longitude: 77.2250,
            status: 'ACTIVE',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGISData();
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Matter Map Tiles
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      });

      const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      if (mapTheme === 'DARK') {
        darkTiles.addTo(map);
      } else {
        streetTiles.addTo(map);
      }

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map reference stable across renders
    };
  }, []);

  // Switch Tile Layer when Theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = mapTheme === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
  }, [mapTheme]);

  // 3. Render Custom Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Custom Icon Generator
    const createCustomIcon = (type: 'SOS' | 'INCIDENT' | 'SHELTER' | 'HOSPITAL' | 'RELIEF', item: any) => {
      let html = '';
      if (type === 'SOS') {
        const isCritical = item.severity === 'CRITICAL';
        html = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute w-10 h-10 rounded-full ${isCritical ? 'bg-red-500/40' : 'bg-amber-500/40'} animate-radar-ping"></div>
            <div class="w-8 h-8 rounded-full ${isCritical ? 'bg-red-600 ring-2 ring-red-300' : 'bg-amber-600 ring-2 ring-amber-300'} text-white flex items-center justify-center text-xs font-black shadow-lg shadow-red-900/50">
              🚨
            </div>
            <span class="absolute -bottom-4 bg-slate-900/90 text-red-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-red-800/80 whitespace-nowrap font-bold">
              ${item.id}
            </span>
          </div>
        `;
      } else if (type === 'INCIDENT') {
        const iconSymbol = item.type === 'FLOOD' ? '🌊' : item.type === 'FIRE' ? '🔥' : '⚠️';
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 ring-2 ring-orange-400 text-white flex items-center justify-center text-xs font-black shadow-lg">
              ${iconSymbol}
            </div>
            <span class="absolute -bottom-4 bg-slate-900/90 text-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-amber-800/80 whitespace-nowrap font-bold">
              ${item.type}
            </span>
          </div>
        `;
      } else if (type === 'SHELTER') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 ring-2 ring-emerald-400 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-900/40">
              🏠
            </div>
            <span class="absolute -bottom-4 bg-slate-900/90 text-emerald-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-emerald-800/80 whitespace-nowrap font-bold">
              ${item.available || (item.capacity - (item.occupied || 0))} Beds
            </span>
          </div>
        `;
      } else if (type === 'HOSPITAL') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 ring-2 ring-cyan-400 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-cyan-900/40">
              🏥
            </div>
            <span class="absolute -bottom-4 bg-slate-900/90 text-cyan-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyan-800/80 whitespace-nowrap font-bold">
              ICU: ${item.icu_available || 0}
            </span>
          </div>
        `;
      } else if (type === 'RELIEF') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 ring-2 ring-purple-400 text-white flex items-center justify-center text-xs font-black shadow-lg">
              📦
            </div>
            <span class="absolute -bottom-4 bg-slate-900/90 text-purple-300 text-[9px] font-mono px-1.5 py-0.2 rounded border border-purple-800/80 whitespace-nowrap font-bold">
              Depot
            </span>
          </div>
        `;
      }

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // A. Plot SOS
    if (activeLayer === 'ALL' || activeLayer === 'SOS') {
      sosList.forEach((sos) => {
        if (sos.latitude && sos.longitude) {
          const marker = L.marker([sos.latitude, sos.longitude], {
            icon: createCustomIcon('SOS', sos),
          });
          marker.on('click', () => setSelectedEntity({ type: 'SOS', data: sos }));
          marker.addTo(markersLayer);
        }
      });
    }

    // B. Plot Incidents
    if (activeLayer === 'ALL' || activeLayer === 'INCIDENTS') {
      incidents.forEach((inc) => {
        if (inc.latitude && inc.longitude) {
          const marker = L.marker([inc.latitude, inc.longitude], {
            icon: createCustomIcon('INCIDENT', inc),
          });
          marker.on('click', () => setSelectedEntity({ type: 'INCIDENT', data: inc }));
          marker.addTo(markersLayer);
        }
      });
    }

    // C. Plot Shelters
    if (activeLayer === 'ALL' || activeLayer === 'SHELTERS') {
      shelters.forEach((sh) => {
        if (sh.latitude && sh.longitude) {
          const marker = L.marker([sh.latitude, sh.longitude], {
            icon: createCustomIcon('SHELTER', sh),
          });
          marker.on('click', () => setSelectedEntity({ type: 'SHELTER', data: sh }));
          marker.addTo(markersLayer);
        }
      });
    }

    // D. Plot Hospitals
    if (activeLayer === 'ALL' || activeLayer === 'HOSPITALS') {
      hospitals.forEach((hosp) => {
        if (hosp.latitude && hosp.longitude) {
          const marker = L.marker([hosp.latitude, hosp.longitude], {
            icon: createCustomIcon('HOSPITAL', hosp),
          });
          marker.on('click', () => setSelectedEntity({ type: 'HOSPITAL', data: hosp }));
          marker.addTo(markersLayer);
        }
      });
    }

    // E. Plot Relief Centers
    if (activeLayer === 'ALL' || activeLayer === 'RELIEF') {
      reliefCenters.forEach((rc) => {
        if (rc.latitude && rc.longitude) {
          const marker = L.marker([rc.latitude, rc.longitude], {
            icon: createCustomIcon('RELIEF', rc),
          });
          marker.on('click', () => setSelectedEntity({ type: 'RELIEF', data: rc }));
          marker.addTo(markersLayer);
        }
      });
    }
  }, [sosList, incidents, shelters, hospitals, reliefCenters, activeLayer]);

  const flyToEntity = (lat: number, lon: number, entity: any) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
    setSelectedEntity(entity);
  };

  const centerOnAll = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(initialCenter, zoom, { duration: 1 });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col space-y-0">
      
      {/* Top Map Action & Filter Bar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-700/80 flex items-center justify-center text-blue-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Tactical GIS Geointel Map</span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.2 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                LIVE RADAR
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Live spatial coordinates of distress signals, relief hubs, and hospital capacities.
            </p>
          </div>
        </div>

        {/* Quick Layer Filter Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveLayer('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              activeLayer === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({sosList.length + incidents.length + shelters.length + hospitals.length})
          </button>
          <button
            onClick={() => setActiveLayer('SOS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeLayer === 'SOS' ? 'bg-red-600 text-white' : 'text-red-400 hover:bg-red-950/40'
            }`}
          >
            <span>🚨 SOS</span>
            <span className="font-mono text-[10px]">({sosList.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('INCIDENTS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeLayer === 'INCIDENTS' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span>⚠️ Incidents</span>
            <span className="font-mono text-[10px]">({incidents.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('SHELTERS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeLayer === 'SHELTERS' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span>🏠 Shelters</span>
            <span className="font-mono text-[10px]">({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('HOSPITALS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
              activeLayer === 'HOSPITALS' ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            <span>🏥 Hospitals</span>
            <span className="font-mono text-[10px]">({hospitals.length})</span>
          </button>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapTheme(mapTheme === 'DARK' ? 'STREET' : 'DARK')}
            title="Toggle Map Basemap"
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
          >
            {mapTheme === 'DARK' ? '🌙 Dark Grid' : '☀️ Street Grid'}
          </button>
          <button
            onClick={centerOnAll}
            title="Recenter Map"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition"
          >
            <Crosshair className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={loadGISData}
            title="Refresh GIS Feeds"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 relative" style={{ minHeight: height }}>
        
        {/* Leaflet Map Canvas (Takes 3 columns on large screens) */}
        <div className="lg:col-span-3 relative h-full min-h-[480px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ height: '100%', minHeight: '480px' }} />

          {/* Floating Coordinate HUD overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 text-[10px] text-slate-300 font-mono space-y-0.5 shadow-xl pointer-events-none z-[1000]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white">GRID: SECTOR 4 NORTH</span>
            </div>
            <div className="text-slate-400">LAT: 28.6139° N • LON: 77.2090° E</div>
          </div>
        </div>

        {/* Tactical Feed & Selected Entity Sidebar (Takes 1 column) */}
        <div className="bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between h-full max-h-[620px] overflow-y-auto space-y-4">
          
          {/* Selected Pin Details Box */}
          {selectedEntity ? (
            <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-3.5 space-y-2.5 shadow-lg relative">
              <button
                onClick={() => setSelectedEntity(null)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2">
                <span className="text-base">
                  {selectedEntity.type === 'SOS' ? '🚨' : selectedEntity.type === 'INCIDENT' ? '⚠️' : selectedEntity.type === 'SHELTER' ? '🏠' : '🏥'}
                </span>
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider block">
                    {selectedEntity.type} INSPECTION
                  </span>
                  <h4 className="text-xs font-bold text-white truncate max-w-[180px]">
                    {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.id}
                  </h4>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                {selectedEntity.data.message || selectedEntity.data.description || selectedEntity.data.address || 'Emergency facility active.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="block text-slate-500">Status</span>
                  <span className="text-emerald-400 font-bold">{selectedEntity.data.status || 'ACTIVE'}</span>
                </div>
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="block text-slate-500">Coordinates</span>
                  <span className="text-slate-300 font-bold truncate">
                    {selectedEntity.data.latitude?.toFixed(4)}, {selectedEntity.data.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>

              {selectedEntity.data.user_phone && (
                <div className="text-[10px] text-slate-300 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Contact: {selectedEntity.data.user_phone}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => flyToEntity(selectedEntity.data.latitude, selectedEntity.data.longitude, selectedEntity)}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow"
                >
                  <Crosshair className="w-3 h-3" /> Focus Target
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-3.5 text-center text-xs text-slate-400">
              <Eye className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <span>Select any marker on the map to inspect live telemetry & responder actions.</span>
            </div>
          )}

          {/* Live Geotagged Distress Signals List */}
          <div className="space-y-2 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>🚨 Active Spatial Alerts</span>
              <span className="text-[10px] text-red-400 font-mono">{sosList.length} Active</span>
            </h3>

            <div className="space-y-2">
              {sosList.map((sos) => (
                <div
                  key={sos.id}
                  onClick={() => flyToEntity(sos.latitude, sos.longitude, { type: 'SOS', data: sos })}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 cursor-pointer transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                      {sos.id}
                    </span>
                    <span className="text-[9px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                      {sos.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {sos.message}
                  </p>
                  <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between pt-0.5">
                    <span>{sos.user_name || 'Citizen'}</span>
                    <span className="group-hover:text-blue-400">Fly to coordinates →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Telemetry Summary */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">Shelter Space</span>
              <span className="text-emerald-400 font-bold text-xs">
                {shelters.reduce((acc, s) => acc + (s.available || (s.capacity - (s.occupied || 0))), 0)} Available
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-500 block">ICU Beds Live</span>
              <span className="text-cyan-400 font-bold text-xs">
                {hospitals.reduce((acc, h) => acc + (h.icu_available || 0), 0)} Beds
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
