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
      // Fallback: Return data URL
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

      // Broadcast to local P2P web mesh bus
      try {
        const bc = new BroadcastChannel('vajranet_p2p_mesh_bus');
        bc.postMessage({
          type: 'INCIDENT_BROADCAST',
          payload: created,
          timestamp: Date.now()
        });
        setTimeout(() => bc.close(), 100);
      } catch (e) {}

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
    <div className="fixed inset-0 z-50 bg-[#07172C]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#0B2545] border border-[#D4AF37]/50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between bg-[#07172C]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-600/60 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide">Report Disaster Hazard / Incident</h3>
              <p className="text-[10px] text-[#D4AF37] font-mono">Instant Cloudinary & Multi-Feed Broadcast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-700/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 font-mono">Incident Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Flash Flood Waterlogging near Sector 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition"
            />
          </div>

          {/* Hazard Type & Severity Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono">Hazard Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition cursor-pointer"
              >
                <option value="FLOOD">🌊 Flood / Waterlogging</option>
                <option value="FIRE">🔥 Fire Outbreak</option>
                <option value="STRUCTURAL_COLLAPSE">🏚️ Building Collapse</option>
                <option value="LANDSLIDE">⛰️ Landslide / Rockfall</option>
                <option value="MEDICAL_EMERGENCY">🚑 Medical Trauma</option>
                <option value="ROADBLOCK">🚧 Roadblock / Obstruction</option>
                <option value="OTHER">⚠️ Other Hazard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono">Severity Priority</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition cursor-pointer"
              >
                <option value="CRITICAL">🚨 CRITICAL (Immediate Danger)</option>
                <option value="HIGH">🔴 HIGH Urgency</option>
                <option value="MEDIUM">🟡 MEDIUM Caution</option>
                <option value="LOW">🟢 LOW Advisory</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 font-mono">Detailed Situation Description</label>
            <textarea
              required
              rows={3}
              placeholder="Describe ground reality, trapped victims, required equipment, road conditions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none transition resize-none"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Latitude
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Longitude
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-[#07172C] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none transition"
              />
            </div>
          </div>

          {/* Image Upload with Cloudinary Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attach Proof / Ground Photo (Cloudinary Integrated)</span>
            </label>

            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-cyan-400/80 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#07172C] transition">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="text-xs text-slate-300 font-mono">Click to Select / Take Photo</span>
                <span className="text-[10px] text-slate-500 font-mono">JPG, PNG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="relative w-20 h-20 rounded-2xl border border-cyan-400/60 overflow-hidden shrink-0 shadow-lg">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 rounded-xl text-xs font-black text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing & Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Incident →</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
