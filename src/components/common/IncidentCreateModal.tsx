import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  MapPin, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Camera
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface IncidentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIncident: any) => void;
  reporterRole?: string;
}

export function IncidentCreateModal({ isOpen, onClose, onSuccess, reporterRole = 'OPERATOR' }: IncidentCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('FLOOD');
  const [severity, setSeverity] = useState('HIGH');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = 'dsgq3vxk6';
    const uploadPreset = 'vajranet_preset';
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Cloudinary upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      return data.secure_url || data.url;
    } catch (err) {
      console.warn('Cloudinary upload fallback to data URL:', err);
      return imagePreview || '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide both title and description.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let uploadedUrl: string | null = null;
      if (imageFile) {
        uploadedUrl = await uploadToCloudinary(imageFile);
      }

      const messageId = `INC-${Date.now()}`;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type: type,
        severity: severity,
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.2090,
        media_urls: uploadedUrl ? [uploadedUrl] : [],
        message_id: messageId,
        reported_by: `PORTAL-${reporterRole}`
      };

      const res = await apiClient.post('/incidents', payload);
      const created = res.data?.data || res.data || { ...payload, id: `inc-${Date.now()}` };

      // Broadcast to local P2P web mesh bus & trigger app-wide count re-sync
      try {
        const bc = new BroadcastChannel('vajranet_p2p_mesh_bus');
        bc.postMessage({
          type: 'INCIDENT_BROADCAST',
          payload: created,
          timestamp: Date.now()
        });
        setTimeout(() => bc.close(), 100);
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));

      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create incident:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to report incident. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#07111E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Report Disaster Hazard / Incident</h3>
              <p className="text-[10px] text-slate-400 font-mono">Real-Time Database Broadcast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Incident Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Near Railway Bridge"
              required
              className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Type & Severity in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Hazard Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="FLOOD">🌊 Flood / Waterlogging</option>
                <option value="FIRE">🔥 Fire / Explosion</option>
                <option value="LANDSLIDE">⛰️ Landslide</option>
                <option value="BUILDING_COLLAPSE">🏚️ Structural Collapse</option>
                <option value="MEDICAL">🏥 Medical Emergency</option>
                <option value="OTHER">⚠️ Other Hazard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="CRITICAL">🔴 Critical (Immediate Threat)</option>
                <option value="HIGH">🟠 High (Urgent Response)</option>
                <option value="MEDIUM">🟡 Medium (Caution)</option>
                <option value="LOW">🟢 Low (Monitoring)</option>
              </select>
            </div>
          </div>

          {/* Coordinates in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Latitude</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Longitude</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Detailed Situation Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe casualties, water depth, blocked routes, trapped citizens..."
              required
              className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Image Evidence Upload */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Photo Evidence (Optional)</label>
            <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-3 text-center bg-[#07111E] transition">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-24 object-cover rounded-lg border border-slate-600" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1 text-slate-400 hover:text-white">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-[11px]">Upload scene photo (Cloudinary sync)</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Broadcast Incident</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
