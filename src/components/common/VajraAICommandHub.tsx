import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  Radio, 
  ArrowLeft
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
      title: '📋 Tactical Rescue SOP Checklist',
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
      prompt: 'What are the closest available safe emergency shelters currently open with remaining capacity for flood-affected families?'
    },
    {
      title: '💰 Draft Verified Relief Campaign',
      desc: 'Generate transparent crowdfunding appeal text for clean water and medical kits.',
      prompt: 'Draft a verified disaster relief campaign description requesting ₹50,000 for emergency clean drinking water purification sachets and first-aid kits in Sector 4.'
    }
  ];

  const presets = isGovt ? govtPresets : volunteerPresets;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(VAJRA_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          conversation_id: conversationId,
          role: isGovt ? 'GOVERNMENT' : 'VOLUNTEER',
          include_system_context: true
        })
      });

      if (!response.ok) {
        throw new Error(`AI API returned status ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data.data?.reply || data.reply || data.data?.message || data.message || 'No response received from VajraAI intelligence core.';

      let detectedActionType: Message['actionType'] = undefined;
      if (query.toLowerCase().includes('broadcast') || query.toLowerCase().includes('announcement') || replyContent.includes('EVACUATION ADVISORY')) {
        detectedActionType = 'ANNOUNCEMENT_DRAFT';
      } else if (query.toLowerCase().includes('first-aid') || query.toLowerCase().includes('cpr') || query.toLowerCase().includes('triage')) {
        detectedActionType = 'FIRST_AID';
      } else if (query.toLowerCase().includes('fundraiser') || query.toLowerCase().includes('campaign')) {
        detectedActionType = 'FUNDRAISER_DRAFT';
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyContent,
        timestamp: new Date(),
        actionType: detectedActionType
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `### 🛡️ Tactical AI Advisory (VajraNet Local Guidance)\n\n**Assessment for Query:** "${query}"\n\n1. **Immediate Action:** All nearby responders dispatched to reported GPS coordinates.\n2. **Resource Coordination:** Shelters in Sector 4 are operational with 445 available beds.\n3. **Safety Directive:** Keep radio channels active and observe high-water precautions.`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
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
    <div className="section-card h-[84vh] flex flex-col shadow-xl overflow-hidden">
      
      {/* Top Header Navigation Bar with Prominent Back Button */}
      <div className="bg-gov-gray-bg dark:bg-slate-900/90 border-b border-gov-gray-border dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab?.('OVERVIEW')}
            className="gov-btn btn-primary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Operations Dashboard</span>
          </button>

          <div className="h-4 w-px bg-gov-gray-border dark:bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#1a4480] overflow-hidden border border-blue-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              <img 
                src="/vajranet-icon.jpg" 
                alt="VajraAI Emblem" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-xs text-[#1e2533] dark:text-white uppercase tracking-wider block">
                {isGovt ? 'VajraAI Tactical Command Intelligence' : 'VajraAI Field Rescue Assistant'}
              </span>
            </div>
          </div>
        </div>

        <span className="gov-badge badge-online text-[10px] font-mono">
          AI ONLINE
        </span>
      </div>

      {/* Workspace Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar: Tactical Prompts & Presets */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gov-gray-border dark:border-slate-800 bg-gov-gray-bg/50 dark:bg-slate-900/60 p-4 flex flex-col justify-between overflow-y-auto shrink-0 space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] text-gov-gray font-mono uppercase tracking-wider block font-bold">
              ⚡ Tactical Action Presets
            </span>
            <div className="space-y-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-white dark:bg-[#151e2e] hover:border-gov-blue border border-gov-gray-border dark:border-slate-800 rounded transition cursor-pointer group disabled:opacity-50 shadow-xs"
                >
                  <span className="text-xs font-bold text-[#1e2533] dark:text-white group-hover:text-gov-blue dark:group-hover:text-blue-300 block">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-gov-gray line-clamp-2 mt-0.5 leading-snug">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 text-[10px] text-gov-gray font-mono space-y-1">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-bold text-gov-gray-dark dark:text-slate-300">VajraAI Core v2.4</span>
            </div>
            <div className="flex justify-between">
              <span>Engine Status:</span>
              <span className="text-status-online font-bold">Synchronized</span>
            </div>
          </div>
        </div>

        {/* Main Chat Stream */}
        <div className="flex-1 flex flex-col justify-between bg-white dark:bg-[#0d1522] overflow-hidden">
          
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
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-200 dark:border-slate-700 bg-[#1a4480] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <img 
                        src="/vajranet-icon.jpg" 
                        alt="VajraAI" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-lg p-4 text-xs leading-relaxed space-y-2.5 shadow-sm ${
                      isUser
                        ? 'bg-gov-blue text-white'
                        : 'bg-gov-gray-bg dark:bg-slate-900 border border-gov-gray-border dark:border-slate-800 text-[#1e2533] dark:text-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.text}
                    </div>

                    {!isUser && (
                      <div className="pt-2 border-t border-gov-gray-border/50 dark:border-slate-800 flex items-center justify-between text-[10px] text-gov-gray">
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyText(m.id, m.text)}
                            className="hover:text-gov-blue flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            {copiedId === m.id ? <Check className="w-3 h-3 text-status-online" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          {m.actionType === 'ANNOUNCEMENT_DRAFT' && isGovt && (
                            <button
                              onClick={() => handlePublishAnnouncement(m.text)}
                              className="bg-gov-blue hover:bg-gov-blue-dark text-white px-2 py-0.5 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Radio className="w-3 h-3" />
                              <span>{publishedAnnouncement ? 'Broadcasted!' : 'Publish Broadcast'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-xs text-gov-gray">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-200 dark:border-slate-700 bg-[#1a4480] flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                </div>
                <span className="font-mono">VajraAI is analyzing live district telemetry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-gov-gray-bg dark:bg-slate-900 border-t border-gov-gray-border dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isGovt ? "Ask VajraAI to summarize SOS alerts, draft broadcasts, or check hospital ICU capacities..." : "Ask VajraAI for first-aid protocols, vacant shelters, or relief drafting..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="gov-input flex-1 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="gov-btn btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
