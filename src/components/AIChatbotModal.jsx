import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Radio, 
  ShieldAlert,
  Flame,
  LifeBuoy
} from 'lucide-react';

export default function AIChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I am VajraAI, your offline disaster response assistant. I operate 100% locally on your phone without internet. How can I assist you right now?",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentQuery = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let botReply = "I have recorded your status. If you are in critical danger, please press the red SOS button on your VajraNet home screen.";

      if (currentQuery.includes('flood') || currentQuery.includes('water')) {
        botReply = "🌊 FLOOD SAFETY RULES:\n1. Move to upper floors immediately.\n2. Do NOT touch electrical switches or submerged wiring.\n3. Turn off main gas valve.\n4. Nearest shelter: St. Xavier Relief Center (0.8km away).";
      } else if (currentQuery.includes('first aid') || currentQuery.includes('bleed') || currentQuery.includes('injury')) {
        botReply = "🩹 FIRST AID FOR BLEEDING:\n1. Apply firm direct pressure with clean cloth.\n2. Elevate the injured limb above heart level.\n3. Keep person warm and still until NDRF team arrives.";
      } else if (currentQuery.includes('shelter') || currentQuery.includes('food')) {
        botReply = "🏕️ RELIEF SHELTERS NEARBY:\n• St. Xavier Community Shelter (0.8 km - Open)\n• NDRF High School Shelter (1.4 km - Open)";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 max-w-lg w-full rounded-2xl shadow-2xl flex flex-col h-[600px] relative overflow-hidden">
        
        {/* Chatbot Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base font-heading">VajraAI Survival Assistant</h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                  Offline Model
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Runs on-device via Quantized LLM</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
          {messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 ${
                m.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}>
                <div className="whitespace-pre-line">{m.text}</div>
                <div className="text-[9px] text-slate-300 text-right font-mono mt-1 opacity-70">
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto text-[11px]">
          <button 
            onClick={() => setInput('What to do during flash flood?')}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-full text-slate-300 whitespace-nowrap"
          >
            🌊 Flood Rules
          </button>
          <button 
            onClick={() => setInput('First aid for bleeding injury')}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-full text-slate-300 whitespace-nowrap"
          >
            🩹 First Aid Tips
          </button>
          <button 
            onClick={() => setInput('Where is nearest shelter?')}
            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-full text-slate-300 whitespace-nowrap"
          >
            🏕️ Find Shelter
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask offline survival question..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
