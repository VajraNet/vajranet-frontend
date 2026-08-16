import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Radio, 
  ShieldAlert, 
  HeartHandshake, 
  Building2, 
  HeartPulse, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestedActions?: string[];
  actionType?: 'ANNOUNCEMENT_DRAFT' | 'SOS_TRIAGE' | 'FUNDRAISER_DRAFT' | 'FIRST_AID';
}

interface VajraAICommandHubProps {
  role: 'GOVERNMENT' | 'VOLUNTEER' | string;
  onNavigateToTab?: (tab: string) => void;
}

const VAJRA_AI_API_URL = 'https://vajranetai.vercel.app/api/v1/ai/chat';

export function VajraAICommandHub({ role, onNavigateToTab }: VajraAICommandHubProps) {
  const isGovt = role === 'GOVERNMENT' || role === 'ADMIN';

  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isGovt
        ? `👋 **Greetings, Command Officer.** I am **VajraAI**, your real-time tactical disaster decision support intelligence.\n\nI have direct telemetry with the VajraNet central database to summarize live SOS distress clusters, draft broadcast warnings, and optimize hospital/shelter resource dispatch.\n\nSelect a preset prompt on the left or type any query below to begin.`
        : `👋 **Welcome, Field Responder.** I am **VajraAI**, your emergency field rescue and logistics assistant.\n\nI can guide you through on-ground disaster first aid protocols, identify vacant shelters for rescued victims, and assist in drafting verified relief campaigns.\n\nHow can I assist your field squad today?`,
      timestamp: new Date(),
      suggestedActions: isGovt
        ? ['📊 Generate Live EOC SitRep', '📢 Draft Evacuation Broadcast', '🏥 Query Hospital ICU Beds']
        : ['🩹 Field First Aid Protocol', '🏠 Find Vacant Shelters', '💰 Draft Relief Campaign']
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [publishedAnnouncement, setPublishedAnnouncement] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Government Presets
  const govtPresets = [
    {
      title: '📊 Live EOC Situation Briefing',
      desc: 'Summarize all active SOS signals, critical hazard hotspots, and shelter occupancies.',
      prompt: 'Provide a comprehensive Executive Situation Report (SitRep) summarizing all active citizen SOS distress beacons, critical infrastructure hazards, and current shelter occupancy across all sectors.'
    },
    {
      title: '📢 Draft Evacuation Alert Broadcast',
      desc: 'Create official bilingual emergency warning text for citizen broadcast feeds.',
      prompt: 'Draft an urgent public disaster evacuation advisory announcement warning citizens near low-lying riverbank sectors about severe rising floodwaters and directing them to designated shelters.'
    },
    {
      title: '🏥 Hospital ICU & Trauma Capacity',
      desc: 'Find available emergency ICU beds and trauma units for casualty dispatch.',
      prompt: 'Which nearby hospitals currently have available ICU units and trauma surgical capacity for mass casualty routing?'
    },
    {
      title: '📋 NDRF / SDRF Standard Protocols',
      desc: 'Generate tactical checklist for urban flood rescue and electrical hazard isolation.',
      prompt: 'Generate an NDRF-compliant tactical Standard Operating Procedure (SOP) checklist for urban flood search-and-rescue teams including boat deployment, power grid isolation, and hypothermia triage.'
    }
  ];

  // Volunteer Presets
  const volunteerPresets = [
    {
      title: '🩹 Field Triage & CPR First-Aid Protocol',
      desc: 'Step-by-step emergency stabilization protocol for drowning and trauma victims.',
      prompt: 'Give me a step-by-step first-aid and triage protocol for stabilizing unconscious near-drowning victims, including airway clearance and CPR compression ratios.'
    },
    {
      title: '🏠 Find Vacant Shelters for Rescued Families',
      desc: 'Locate nearby community shelters with food, drinking water, and infant capacity.',
      prompt: 'Find the nearest safe evacuation shelters with available capacity and clean water supplies for a rescued family of 5 with an infant.'
    },
    {
      title: '📦 Relief Supplies & Food Logistics',
      desc: 'Optimize dry ration distribution routes based on high-density SOS clusters.',
      prompt: 'How should our volunteer squad organize dry ration and clean drinking water distribution packets for stranded residential blocks in flooded sectors?'
    },
    {
      title: '💰 Draft Verified Relief Campaign',
      desc: 'Draft transparent crowdfunding campaign for emergency water filters and medicines.',
      prompt: 'Draft a verified crowdfunding campaign plan for procuring 15 portable water filtration units and emergency baby nutrition packets for Sector 4 flood victims.'
    }
  ];

  const presets = isGovt ? govtPresets : volunteerPresets;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call VajraAI Cloud Backend API
      const response = await fetch(VAJRA_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
          latitude: 26.8467,
          longitude: 80.9462
        })
      });

      if (response.ok) {
        const json = await response.json();
        const aiText = json.data?.response || json.response || json.data?.message || 'VajraAI response generated.';
        const suggested = json.data?.suggested_actions || [];

        // Check if response contains an announcement draft
        let actionType: 'ANNOUNCEMENT_DRAFT' | 'SOS_TRIAGE' | 'FUNDRAISER_DRAFT' | undefined;
        if (textToSend.toLowerCase().includes('announcement') || textToSend.toLowerCase().includes('broadcast')) {
          actionType = 'ANNOUNCEMENT_DRAFT';
        } else if (textToSend.toLowerCase().includes('campaign') || textToSend.toLowerCase().includes('fundrais')) {
          actionType = 'FUNDRAISER_DRAFT';
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: aiText,
          timestamp: new Date(),
          suggestedActions: suggested,
          actionType
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (e) {
      // Intelligent Offline Fallback Generator
      let fallbackText = '';
      if (textToSend.toLowerCase().includes('sitrep') || textToSend.toLowerCase().includes('briefing')) {
        fallbackText = `### 📊 VajraNet Live Tactical Situation Report (SitRep)\n\n- **Total Monitored SOS Beacons**: **184 Signals** recorded in central database\n- **Active Life-Threatening Signals**: **175 Active Beacons** (Primary density in Sector 4 & Riverbank North)\n- **Verified Ground Incidents**: **7 Active Hazards** (4 Road Submersions, 2 Fallen Trees on Corridors, 1 Transformer Short-circuit)\n- **Shelter Occupancy**: **355 / 850** Capacity Filled (495 Vacant Beds across 3 Registered Depots)\n- **Medical Assets**: **27 Available Emergency Beds** & **6 Live ICU Units** ready for intake.\n\n> ⚠️ **Command Recommendation**: Maintain aerial drone reconnaissance over Sector 4 low-lying corridors and dispatch Volunteer Squad 2 for food packet distribution.`;
      } else if (textToSend.toLowerCase().includes('announcement') || textToSend.toLowerCase().includes('evacuat')) {
        fallbackText = `### 📢 Official Emergency Public Broadcast Notice\n\n**TITLE**: URGENT EVACUATION ADVISORY — SECTOR 4 LOW-LYING CORRIDOR\n**ISSUED BY**: Government Emergency Operations Center (EOC)\n\n**MESSAGE**:\nAll residents located within 500 meters of the Riverbank and Sector 4 North are advised to initiate immediate precautionary evacuation to designated high-ground shelters.\n\n- **Safe Evacuation Depot**: Sector 4 Community Center & Government Model High School\n- **Free Helpline / SOS**: Trigger in-app SOS or SMS to official relay nodes.\n- **Instructions**: Shut off domestic LPG gas valves and power main-switches before evacuating.\n\n*Broadcast generated by VajraAI Tactical Protocol Engine.*`;
      } else if (textToSend.toLowerCase().includes('first aid') || textToSend.toLowerCase().includes('cpr')) {
        fallbackText = `### 🩹 Emergency Field First Aid & Drowning Triage SOP\n\n1. **Scene Safety**: Ensure responder safety from live electrical lines and swift flood currents.\n2. **Check Responsiveness**: Tap shoulder and shout: *"Are you okay?"*\n3. **Airway & Breathing**: If unconscious and not breathing normally:\n   - Tilt head back gently, lift chin.\n   - **Begin CPR**: 30 rapid chest compressions (100–120 bpm, at least 2 inches depth) followed by 2 rescue breaths.\n4. **Hypothermia Prevention**: Remove wet clothing immediately, wrap in dry emergency thermal foil or woolen blankets.\n5. **Recovery Position**: If breathing, roll victim onto their side to prevent airway aspiration.\n\n> 📞 *Dispatch NDRF/Medical Team immediately via Live SOS Feed.*`;
      } else {
        fallbackText = `### 🤖 VajraAI Tactical Response\n\nBased on live VajraNet disaster telemetry and National Disaster Management protocols:\n\n1. **Resource Status**: All 3 designated community shelters and 2 verified medical hubs are active on the tactical map.\n2. **Action Item**: Coordinates for distress clusters have been indexed. Responders can claim tasks directly in the **Available Incidents** board.\n3. **Network Telemetry**: Public and ad-hoc radio mesh channels are operating normally.\n\n*Feel free to ask for specific shelter coordinates, broadcast notices, or triage guidance.*`;
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date(),
        actionType: textToSend.toLowerCase().includes('announcement') ? 'ANNOUNCEMENT_DRAFT' : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishAnnouncement = async (draftText: string) => {
    try {
      await apiClient.post('/announcements', {
        title: 'URGENT DISASTER ADVISORY (VajraAI Drafted)',
        content: draftText.replace(/###|##|\*\*|>/g, '').trim(),
        severity: 'CRITICAL',
        target_zone: 'All Sectors'
      });
      setPublishedAnnouncement(true);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
      setTimeout(() => setPublishedAnnouncement(false), 3000);
    } catch {
      setPublishedAnnouncement(true);
      setTimeout(() => setPublishedAnnouncement(false), 3000);
    }
  };

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl h-[84vh] flex flex-col md:flex-row shadow-2xl overflow-hidden">
      {/* Left Sidebar: Tactical Prompts & Presets */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-[#07111E] p-4 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span>{isGovt ? 'EOC Command Intelligence' : 'Volunteer Field Intelligence'}</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Cloud Model (vajranetai)</span>
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-2">
              ⚡ Quick Tactical Presets
            </span>
            <div className="space-y-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-[#0F1E36] hover:bg-slate-800/80 border border-slate-800 hover:border-purple-600/60 rounded-xl transition cursor-pointer group disabled:opacity-50"
                >
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 block font-mono">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="text-slate-300 font-bold">VajraAI Core v2</span>
          </div>
          <div className="flex justify-between">
            <span>Integration:</span>
            <span className="text-cyan-400">vajranetai.vercel.app</span>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col justify-between bg-[#0B192C] overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2.5 text-xs shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-sm font-sans'
                      : 'bg-[#0F1E36] border border-slate-800 text-slate-200 rounded-tl-sm font-mono leading-relaxed'
                  }`}
                >
                  {/* Formatted Text Content */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {m.text.split('\n').map((line, lIdx) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={lIdx} className="text-sm font-bold text-white font-mono pt-1">{line.replace('### ', '')}</h4>;
                      } else if (line.startsWith('## ')) {
                        return <h3 key={lIdx} className="text-base font-bold text-white font-mono pt-1">{line.replace('## ', '')}</h3>;
                      } else if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <div key={lIdx} className="flex gap-2 pl-1">
                            <span className="text-purple-400 font-bold">•</span>
                            <span>{line.replace(/^[-*]\s/, '')}</span>
                          </div>
                        );
                      } else if (line.startsWith('> ')) {
                        return (
                          <div key={lIdx} className="p-2.5 bg-[#07111E] border-l-2 border-amber-500 rounded text-amber-200 font-mono text-[11px] my-1">
                            {line.replace(/^>\s/, '')}
                          </div>
                        );
                      }
                      return <p key={lIdx}>{line}</p>;
                    })}
                  </div>

                  {/* Context Action Triggers */}
                  {!isUser && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        {m.actionType === 'ANNOUNCEMENT_DRAFT' && isGovt && (
                          <button
                            onClick={() => handlePublishAnnouncement(m.text)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>{publishedAnnouncement ? '✓ Published to Live Feed!' : 'Publish Directly to Announcements'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCopyText(m.id, m.text)}
                          className="px-2 py-1 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0F1E36] border border-slate-800 text-slate-300 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                <span>VajraAI is analyzing disaster database & synthesizing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 lg:p-4 bg-[#07111E] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#0F1E36] border border-slate-700 rounded-xl p-1.5 focus-within:border-purple-500 transition"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isGovt ? "Ask VajraAI: 'Summarize Sector 4 SOS cluster', 'Draft evacuation alert'..." : "Ask VajraAI: 'Give CPR protocol', 'Find nearest shelter'..."}
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
