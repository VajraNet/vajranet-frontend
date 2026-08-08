import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Camera, 
  AlertOctagon, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Send 
} from 'lucide-react';
import { SAMPLE_DAMAGE_IMAGES } from '../data/mockData';

export default function AIDamageDetector() {
  const [selectedImg, setSelectedImg] = useState(SAMPLE_DAMAGE_IMAGES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [customImageURL, setCustomImageURL] = useState('');

  const handleRunAnalysis = (imgObj) => {
    setSelectedImg(imgObj);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading flex items-center space-x-2">
              <span>On-Device AI Disaster Damage Assessment</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </h2>
            <p className="text-xs text-slate-300">
              Lightweight Edge-ML model (YOLO / MobileNet) running offline on citizen & drone photos to classify structural damage & hazards.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 bg-purple-950/80 border border-purple-800 text-purple-300 rounded-xl">
          Model: VajraVision-Lite v2.4 (Edge Quantized)
        </span>
      </div>

      {/* Main Grid: Sample Image Picker + AI Vision Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Preset Sample Images */}
        <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-800">
          <h3 className="text-base font-bold text-white font-heading flex items-center space-x-2">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Select Disaster Photo to Scan</span>
          </h3>

          <div className="space-y-3">
            {SAMPLE_DAMAGE_IMAGES.map((img) => (
              <div 
                key={img.id}
                onClick={() => handleRunAnalysis(img)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center space-x-3 ${
                  selectedImg.id === img.id 
                    ? 'bg-purple-950/50 border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <img src={img.url} alt={img.title} className="w-16 h-14 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-white">{img.title}</h4>
                  <span className="text-[10px] text-purple-300 font-mono">{img.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Vision Output & Analysis Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5 border border-purple-500/30 relative">
          
          {analyzing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl space-y-3">
              <BrainCircuit className="w-12 h-12 text-purple-400 animate-spin" />
              <span className="text-sm font-mono text-white font-bold">Running On-Device Neural Network Inference...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Image display with bounding box simulation overlay */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img src={selectedImg.url} alt={selectedImg.title} className="w-full h-64 object-cover" />
              
              {/* Simulated AI Bounding Box overlay */}
              <div className="absolute top-8 left-8 right-12 bottom-12 border-2 border-red-500 bg-red-500/10 rounded pointer-events-none flex items-start p-1">
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                  {selectedImg.type} [{selectedImg.severity}]
                </span>
              </div>
            </div>

            {/* AI Breakdown details */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    AI CLASSIFICATION REPORT
                  </span>
                  <h3 className="text-xl font-bold text-white font-heading mt-1">{selectedImg.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  {selectedImg.severity}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300 leading-relaxed font-sans">{selectedImg.damageDesc}</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Impacted Infrastructure</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedImg.affectedInfra.map((infra, i) => (
                    <span key={i} className="bg-slate-800 text-slate-200 text-[11px] px-2.5 py-1 rounded-lg font-mono">
                      • {infra}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Action Recommendation */}
          <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2">
            <h4 className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Recommended Tactical Action</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedImg.suggestedAction}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
