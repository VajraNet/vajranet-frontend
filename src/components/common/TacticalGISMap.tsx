import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Crosshair, 
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../api/client';
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

  // Filter state: default STREET grid
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'SOS' | 'INCIDENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'STREET' | 'DARK'>('STREET');

  // Live Data state
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<ResourceShelter[]>([]);
  const [hospitals, setHospitals] = useState<ResourceHospital[]>([]);
  const [reliefCenters, setReliefCenters] = useState<ResourceReliefCenter[]>([]);

  // 1. Fetch Real Data Directly from Backend Database
  const loadGISData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sosRes, incRes, shRes, hospRes, rcRes] = await Promise.allSettled([
        apiClient.get('/sos'),
        apiClient.get('/incidents'),
        apiClient.get('/shelters'),
        apiClient.get('/hospitals'),
        apiClient.get('/relief-centers'),
      ]);

      // SOS
      if (sosRes.status === 'fulfilled') {
        const d = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(d)) {
          setSosList(d.filter((item: any) => item.status !== 'RESOLVED' && item.status !== 'CANCELLED'));
        }
      }

      // Incidents
      if (incRes.status === 'fulfilled') {
        const d = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(d)) {
          setIncidents(d.filter((item: any) => item.status !== 'RESOLVED'));
        }
      }

      // Shelters
      if (shRes.status === 'fulfilled') {
        const d = shRes.value.data?.data || shRes.value.data;
        if (Array.isArray(d)) {
          setShelters(d);
        }
      }

      // Hospitals
      if (hospRes.status === 'fulfilled') {
        const d = hospRes.value.data?.data || hospRes.value.data;
        if (Array.isArray(d)) {
          setHospitals(d);
        }
      }

      // Relief Centers
      if (rcRes.status === 'fulfilled') {
        const d = rcRes.value.data?.data || rcRes.value.data;
        if (Array.isArray(d)) {
          setReliefCenters(d);
        }
      }
    } catch (e) {
      console.warn('GIS Data load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGISData();
    const interval = setInterval(loadGISData, 5000);

    const handleUpdate = () => {
      loadGISData();
    };

    window.addEventListener('vajranet_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleUpdate);
    };
  }, [loadGISData]);

  // 2. Initialize Leaflet Map safely with Street Grid default
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: false,
      });
    } catch (e) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: false,
      });
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Street grid default (Carto Voyager) vs Dark Grid (Carto Dark)
    const tileUrl = mapTheme === 'DARK'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (e) {}
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
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
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
  }, [mapTheme]);

  // 3. Render Clean Custom Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Clean Marker Generator without glowing rings
    const createCustomIcon = (type: 'SOS' | 'INCIDENT' | 'SHELTER' | 'HOSPITAL' | 'RELIEF', item: any) => {
      let html = '';
      if (type === 'SOS') {
        const isCritical = item.severity === 'CRITICAL';
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-full ${isCritical ? 'bg-red-600' : 'bg-amber-600'} text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              🚨
            </div>
            <span class="absolute -bottom-4 bg-slate-900 text-red-300 text-[9px] font-mono px-1 rounded border border-slate-700 whitespace-nowrap font-bold">
              ${(item.id || item.message_id || 'SOS').slice(0, 7)}
            </span>
          </div>
        `;
      } else if (type === 'INCIDENT') {
        const iconSymbol = item.type === 'FLOOD' ? '🌊' : item.type === 'FIRE' ? '🔥' : '⚠️';
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              ${iconSymbol}
            </div>
            <span class="absolute -bottom-4 bg-slate-900 text-amber-300 text-[9px] font-mono px-1 rounded border border-slate-700 whitespace-nowrap font-bold">
              ${item.type || 'Hazard'}
            </span>
          </div>
        `;
      } else if (type === 'SHELTER') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              🏠
            </div>
            <span class="absolute -bottom-4 bg-slate-900 text-emerald-300 text-[9px] font-mono px-1 rounded border border-slate-700 whitespace-nowrap font-bold">
              ${item.available_capacity || (item.capacity - (item.occupied || 0)) || 'Shelter'} Free
            </span>
          </div>
        `;
      } else if (type === 'HOSPITAL') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              🏥
            </div>
            <span class="absolute -bottom-4 bg-slate-900 text-cyan-300 text-[9px] font-mono px-1 rounded border border-slate-700 whitespace-nowrap font-bold">
              ICU: ${item.icu_available ?? item.icuAvailable ?? 0}
            </span>
          </div>
        `;
      } else if (type === 'RELIEF') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              📦
            </div>
            <span class="absolute -bottom-4 bg-slate-900 text-purple-300 text-[9px] font-mono px-1 rounded border border-slate-700 whitespace-nowrap font-bold">
              Depot
            </span>
          </div>
        `;
      }

      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: html,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
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

  const centerOnAll = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(initialCenter, zoom, { duration: 1 });
  };

  const totalCount = sosList.length + incidents.length + shelters.length + hospitals.length;

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col space-y-0">
      
      {/* Top Map Action & Filter Bar */}
      <div className="bg-[#07111E] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Tactical GIS Geointel Map</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono font-bold">
                LIVE GIS
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Live spatial coordinates of distress signals, relief hubs, and hospital capacities.
            </p>
          </div>
        </div>

        {/* Quick Layer Filter Buttons with Real Live Numbers */}
        <div className="flex items-center flex-wrap gap-1.5 bg-[#0F1E36] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveLayer('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              activeLayer === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveLayer('SOS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              activeLayer === 'SOS' ? 'bg-red-600 text-white' : 'text-red-400 hover:bg-red-950/40'
            }`}
          >
            <span>🚨 SOS</span>
            <span className="font-mono text-[10px]">({sosList.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('INCIDENTS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              activeLayer === 'INCIDENTS' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <span>⚠️ Incidents</span>
            <span className="font-mono text-[10px]">({incidents.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('SHELTERS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              activeLayer === 'SHELTERS' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <span>🏠 Shelters</span>
            <span className="font-mono text-[10px]">({shelters.length})</span>
          </button>
          <button
            onClick={() => setActiveLayer('HOSPITALS')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
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
            onClick={() => setMapTheme(mapTheme === 'STREET' ? 'DARK' : 'STREET')}
            title="Toggle Map Basemap"
            className="px-2.5 py-1 bg-[#0F1E36] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono transition cursor-pointer"
          >
            {mapTheme === 'STREET' ? '🌙 Dark Grid' : '☀️ Street Grid'}
          </button>
          <button
            onClick={centerOnAll}
            title="Recenter Map"
            className="p-1.5 bg-[#0F1E36] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={loadGISData}
            title="Refresh GIS Feeds"
            className="p-1.5 bg-[#0F1E36] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Map Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 relative" style={{ minHeight: height }}>
        
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-3 relative h-full min-h-[480px]">
          <div ref={mapContainerRef} className="w-full h-full" style={{ height: '100%', minHeight: '480px' }} />

          {/* Coordinate HUD overlay */}
          <div className="absolute top-3 left-3 bg-[#07111E]/95 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 font-mono space-y-0.5 shadow-lg pointer-events-none z-[1000]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-white">GRID: SECTOR 4 NORTH</span>
            </div>
            <div className="text-slate-400">
              LAT: {initialCenter[0].toFixed(4)}° N • LON: {initialCenter[1].toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Entity Telemetry Inspector */}
        <div className="bg-[#07111E] border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto max-h-[620px]">
          {selectedEntity ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Inspecting {selectedEntity.type}
                </span>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.message || 'Entity Details'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {selectedEntity.data.address || selectedEntity.data.description || 'Disaster Resource Node'}
                </p>
              </div>

              <div className="bg-[#0F1E36] p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latitude:</span>
                  <span className="text-white">{selectedEntity.data.latitude?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Longitude:</span>
                  <span className="text-white">{selectedEntity.data.longitude?.toFixed(4)}</span>
                </div>
                {selectedEntity.data.severity && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity:</span>
                    <span className="text-red-400 font-bold">{selectedEntity.data.severity}</span>
                  </div>
                )}
                {selectedEntity.data.status && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">{selectedEntity.data.status}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
              <p>Select any marker on the map to inspect live telemetry & responder actions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
