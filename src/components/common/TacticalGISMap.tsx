import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Crosshair, 
  RefreshCw, 
  MapPin, 
  X
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { SOSPayload, Incident, ResourceShelter, ResourceHospital, ResourceReliefCenter } from '../../types/api';

interface TacticalGISMapProps {
  initialCenter?: [number, number];
  zoom?: number;
  height?: string;
  readOnly?: boolean;
}

export type MapTheme = 'GOOGLE_STREET' | 'GOOGLE_HYBRID' | 'DARK' | 'OSM';

// Robust, high-detail tactical tile servers including Google Maps with full place names
const TILE_SERVERS: Record<MapTheme, { url: string; subdomains: string; maxZoom: number; label: string; description: string }> = {
  GOOGLE_STREET: {
    label: '🗺️ Google Maps',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxZoom: 20,
    description: 'Detailed Google Maps with full place names, landmarks, roads, and institutions'
  },
  GOOGLE_HYBRID: {
    label: '🛰️ Google Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxZoom: 20,
    description: 'High-res Satellite imagery with place names and road labels overlaid'
  },
  DARK: {
    label: '🌙 Dark Grid',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    maxZoom: 19,
    description: 'Tactical high-contrast dark theme for 24/7 EOC operations'
  },
  OSM: {
    label: '📍 OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    maxZoom: 19,
    description: 'Standard OpenStreetMap global road network'
  }
};

export function TacticalGISMap({ 
  initialCenter = [28.6139, 77.2090], 
  zoom = 13,
  height
}: TacticalGISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter state
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'SOS' | 'INCIDENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<MapTheme>('GOOGLE_STREET');

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

      if (sosRes.status === 'fulfilled') {
        const d = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(d)) {
          setSosList(d.filter((item: any) => item.status !== 'RESOLVED' && item.status !== 'CANCELLED'));
        }
      }

      if (incRes.status === 'fulfilled') {
        const d = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(d)) {
          setIncidents(d.filter((item: any) => item.status !== 'RESOLVED'));
        }
      }

      if (shRes.status === 'fulfilled') {
        const d = shRes.value.data?.data || shRes.value.data;
        if (Array.isArray(d)) {
          setShelters(d);
        }
      }

      if (hospRes.status === 'fulfilled') {
        const d = hospRes.value.data?.data || hospRes.value.data;
        if (Array.isArray(d)) {
          setHospitals(d);
        }
      }

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
    const handleUpdate = () => loadGISData();
    window.addEventListener('vajranet_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleUpdate);
    };
  }, [loadGISData]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const config = TILE_SERVERS[mapTheme];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tileLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom,
        subdomains: config.subdomains,
      }).addTo(map);

      (map as any)._currentTileLayer = tileLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Dynamic Window Focus Location Event (from SOS Priority Feed clicks)
  useEffect(() => {
    const handleFocusLocation = (e: any) => {
      const { latitude, longitude, id, type, title, message, address } = e.detail || {};
      if (latitude && longitude && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([latitude, longitude], 15, {
          duration: 1.2
        });

        setSelectedEntity({
          type: type || 'SOS',
          data: {
            id: id || 'SOS-ALERT',
            name: title || id || 'Distress Alert',
            message: message || 'Citizen in distress! Immediate assistance required.',
            address: address || `Coordinates: (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
            latitude,
            longitude
          }
        });
      }
    };

    window.addEventListener('vajranet_focus_map_location', handleFocusLocation);
    return () => {
      window.removeEventListener('vajranet_focus_map_location', handleFocusLocation);
    };
  }, []);

  // Update Basemap Tiles on theme switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    if ((map as any)._currentTileLayer) {
      map.removeLayer((map as any)._currentTileLayer);
    }

    const config = TILE_SERVERS[mapTheme];
    const newTileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains,
    }).addTo(map);

    (map as any)._currentTileLayer = newTileLayer;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [mapTheme]);

  // 3. Render Custom Leaflet Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    const createCustomIcon = (type: string, item: any) => {
      let html = '';
      if (type === 'SOS') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <span class="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping"></span>
            <div class="w-7 h-7 rounded-full bg-[#c0392b] text-white flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              🚨
            </div>
            <span class="absolute -bottom-4 bg-[#112e5a] text-red-200 text-[9px] font-mono px-1 rounded border border-red-500 whitespace-nowrap font-bold">
              ${item.message_id ? item.message_id.slice(-6) : 'SOS'}
            </span>
          </div>
        `;
      } else if (type === 'INCIDENT') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-[#d68910] text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              ⚠️
            </div>
            <span class="absolute -bottom-4 bg-[#112e5a] text-amber-200 text-[9px] font-mono px-1 rounded border border-amber-500 whitespace-nowrap font-bold">
              ${item.type || 'HAZARD'}
            </span>
          </div>
        `;
      } else if (type === 'SHELTER') {
        const cap = item.capacity || item.total_capacity || 100;
        const occ = item.occupied || 0;
        const free = Math.max(0, cap - occ);
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-[#1e7e34] text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              🏠
            </div>
            <span class="absolute -bottom-4 bg-[#112e5a] text-emerald-200 text-[9px] font-mono px-1 rounded border border-emerald-500 whitespace-nowrap font-bold">
              ${free} Free
            </span>
          </div>
        `;
      } else if (type === 'HOSPITAL') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-[#1a4480] text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              🏥
            </div>
            <span class="absolute -bottom-4 bg-[#112e5a] text-cyan-200 text-[9px] font-mono px-1 rounded border border-cyan-500 whitespace-nowrap font-bold">
              ICU: ${item.icu_available ?? item.icuAvailable ?? 0}
            </span>
          </div>
        `;
      } else if (type === 'RELIEF') {
        html = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-7 h-7 rounded-lg bg-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">
              📦
            </div>
            <span class="absolute -bottom-4 bg-[#112e5a] text-indigo-200 text-[9px] font-mono px-1 rounded border border-indigo-500 whitespace-nowrap font-bold">
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

    // Plot Layers
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

  const totalCount = sosList.length + incidents.length + shelters.length + hospitals.length + reliefCenters.length;

  return (
    <div 
      className="section-card overflow-hidden shadow-sm flex flex-col w-full h-full"
      style={height ? { height } : undefined}
    >
      
      {/* Top Map Action & Filter Bar */}
      <div className="bg-gov-gray-bg dark:bg-slate-900/90 border-b border-gov-gray-border dark:border-slate-800 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0 select-none z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gov-blue-faint dark:bg-slate-800 border border-gov-blue-pale dark:border-slate-700 flex items-center justify-center text-gov-blue dark:text-blue-400 shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[11px] font-bold text-gov-blue-dark dark:text-white uppercase tracking-wider">
                Tactical GIS Situation Map
              </h2>
              <span className="gov-badge badge-online text-[9px] font-mono px-1.5 py-0">
                LIVE GIS ({totalCount})
              </span>
            </div>
          </div>
        </div>

        {/* Layer Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1 text-[11px]">
          <button
            onClick={() => setActiveLayer('ALL')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveLayer('SOS')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'SOS' ? 'btn-secondary text-severity-critical' : 'btn-ghost text-severity-critical'}`}
          >
            🚨 SOS ({sosList.length})
          </button>
          <button
            onClick={() => setActiveLayer('INCIDENTS')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'INCIDENTS' ? 'btn-secondary text-severity-high' : 'btn-ghost text-severity-high'}`}
          >
            ⚠️ Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setActiveLayer('SHELTERS')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'SHELTERS' ? 'btn-secondary text-status-online' : 'btn-ghost text-status-online'}`}
          >
            🏠 Shelters ({shelters.length})
          </button>
          <button
            onClick={() => setActiveLayer('HOSPITALS')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'HOSPITALS' ? 'btn-secondary text-gov-blue' : 'btn-ghost text-gov-blue'}`}
          >
            🏥 Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveLayer('RELIEF')}
            className={`gov-btn btn-sm py-0.5 px-2 ${activeLayer === 'RELIEF' ? 'btn-secondary text-indigo-600' : 'btn-ghost text-indigo-600'}`}
          >
            📦 Relief ({reliefCenters.length})
          </button>
        </div>

        {/* Basemap Switcher (Google Maps / Google Satellite / Dark Grid / OpenStreetMap) */}
        <div className="flex items-center gap-1">
          <div className="inline-flex rounded border border-gov-gray-border dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-[10px]">
            <button
              onClick={() => setMapTheme('GOOGLE_STREET')}
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                mapTheme === 'GOOGLE_STREET' 
                  ? 'bg-gov-blue text-white shadow-xs' 
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
              title="Google Maps with all place names, landmarks, colleges, and roads"
            >
              🗺️ Google Maps
            </button>
            <button
              onClick={() => setMapTheme('GOOGLE_HYBRID')}
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                mapTheme === 'GOOGLE_HYBRID' 
                  ? 'bg-gov-blue text-white shadow-xs' 
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
              title="Google Satellite with location names and road labels"
            >
              🛰️ Satellite + Names
            </button>
            <button
              onClick={() => setMapTheme('DARK')}
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                mapTheme === 'DARK' 
                  ? 'bg-gov-blue text-white shadow-xs' 
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
              title="Tactical Dark Matter Grid"
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setMapTheme('OSM')}
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                mapTheme === 'OSM' 
                  ? 'bg-gov-blue text-white shadow-xs' 
                  : 'text-gov-gray hover:text-gov-blue-dark dark:hover:text-white'
              }`}
              title="OpenStreetMap Standard"
            >
              📍 OSM
            </button>
          </div>

          <button
            onClick={centerOnAll}
            className="gov-btn btn-ghost btn-sm p-1 cursor-pointer"
            title="Recenter Map Coordinates"
          >
            <Crosshair className="w-3 h-3 text-gov-blue" />
          </button>
          <button
            onClick={loadGISData}
            className="gov-btn btn-ghost btn-sm p-1 cursor-pointer"
            title="Refresh Map Feeds"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="flex-1 w-full min-h-0 relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Entity Inspector Overlay */}
        {selectedEntity && (
          <div className="absolute top-3 right-3 z-20 w-80 bg-white/95 dark:bg-[#151e2e]/95 backdrop-blur-sm border border-gov-gray-border dark:border-slate-800 rounded-lg p-3.5 shadow-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="gov-badge badge-resolved font-mono font-bold text-[10px]">
                  {selectedEntity.type}
                </span>
                <h4 className="font-bold text-[#1e2533] dark:text-white truncate max-w-[180px]">
                  {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.message_id || selectedEntity.data.id}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gov-gray-dark dark:text-slate-200">
              {selectedEntity.data.description || selectedEntity.data.message || selectedEntity.data.address}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-gov-gray-bg dark:bg-slate-900 rounded">
                <span className="text-gov-gray block text-[9px] uppercase">Latitude</span>
                <span className="font-bold text-gov-blue">{selectedEntity.data.latitude?.toFixed(5)}</span>
              </div>
              <div className="p-2 bg-gov-gray-bg dark:bg-slate-900 rounded">
                <span className="text-gov-gray block text-[9px] uppercase">Longitude</span>
                <span className="font-bold text-gov-blue">{selectedEntity.data.longitude?.toFixed(5)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
