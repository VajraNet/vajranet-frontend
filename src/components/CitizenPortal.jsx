import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Home, 
  HeartPulse, 
  PackageCheck, 
  Megaphone, 
  History, 
  Bot, 
  Radio, 
  CheckCircle2, 
  X, 
  Send,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Zap,
  MessageSquare
} from 'lucide-react';
import { 
  sendSOSApi, 
  reportIncidentApi, 
  getNearbyShelters, 
  getNearbyHospitals, 
  getNearbyReliefCenters, 
  getAnnouncements, 
  sendAIChat 
} from '../api/citizen';

export default function CitizenPortal({ isOnline }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'incident', 'resources', 'updates', 'my_emergencies', 'assistant'
  const [resourceTab, setResourceTab] = useState('shelters'); // 'shelters', 'hospitals', 'relief'

  const [announcements, setAnnouncements] = useState([
    {
      id: "ANN-1",
      title: "MANDATORY EVACUATION ADVISORY",
      priority: "CRITICAL",
      source: "District Emergency Authority",
      area: "Zone 4 (Kurla & Dharavi)",
      time: "10 mins ago",
      content: "Residents of Zone 4 should move to higher ground or nearby relief shelters immediately."
    }
  ]);
  const [shelters, setShelters] = useState([
    { id: "SH-1", name: "District Relief Shelter #1", distanceKm: 1.2, availableSpaces: 150, capacity: 500, status: "OPEN", address: "VT Road, Fort, Mumbai" }
  ]);
  const [hospitals, setHospitals] = useState([
    { id: "HOSP-1", name: "District Emergency Hospital", distanceKm: 2.4, availableBeds: 32, icuBeds: 6, emergencyStatus: "OPEN", address: "LBS Marg, Ghatkopar" }
  ]);
  const [reliefCenters, setReliefCenters] = useState([
    { id: "REL-1", name: "Community Relief Center", distanceKm: 1.8, hasFood: true, hasWater: true, hasMedicine: true, address: "Bandra Enclave" }
  ]);

  const [mySOSList, setMySOSList] = useState([]);
  const [myIncidentsList, setMyIncidentsList] = useState([]);

  // SOS Modal State
  const [sosStep, setSosStep] = useState(0);
  const [sosPayload, setSosPayload] = useState({
    locationName: 'GPS: 19.0760° N, 72.8777° E (Current Location)',
    severity: 'CRITICAL',
    message: ''
  });

  // Offline P2P Mesh Chatroom Modal State
  const [showMeshChat, setShowMeshChat] = useState(false);
  const [meshMessages, setMeshMessages] = useState([
    {
      id: 1,
      sender: 'Citizen Device (Samsung S23)',
      nodeId: 'NODE-101',
      distance: '45m away',
      hops: '1 Hop (BLE)',
      time: '14:20',
      text: 'Water level rising near Kurla bus depot. Moving to 2nd floor terrace.',
    },
    {
      id: 2,
      sender: 'Volunteer Relay Node',
      nodeId: 'NODE-102',
      distance: '120m away',
      hops: '2 Hops',
      time: '14:22',
      text: 'NDRF squad dispatched to Dharavi Sector 3 with inflatable rescue boat.',
    }
  ]);
  const [meshChatInput, setMeshChatInput] = useState('');

  // Incident Form State
  const [incidentForm, setIncidentForm] = useState({
    type: 'Flood',
    severity: 'HIGH',
    description: '',
    location: 'GPS: 19.0760° N, 72.8777° E'
  });
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  // Safety Assistant Chat
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Namaste! I am your Safety Assistant. How can I help you?' }
  ]);
  const [chatQuery, setChatQuery] = useState('');

  useEffect(() => {
    getAnnouncements().then(data => data && setAnnouncements(data));
    getNearbyShelters().then(data => data && setShelters(data));
    getNearbyHospitals().then(data => data && setHospitals(data));
    getNearbyReliefCenters().then(data => data && setReliefCenters(data));
  }, []);

  const handleSOSConfirm = async () => {
    const createdSOS = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: sosPayload.locationName,
      message: sosPayload.message || 'Immediate danger',
      status: 'Active',
      responseState: isOnline ? 'NDRF Squad Alpha Dispatched' : 'Waiting for gateway'
    };

    await sendSOSApi(sosPayload);
    setMySOSList(prev => [createdSOS, ...prev]);
    setSosStep(2);
  };

  const handleSendMeshChat = (e) => {
    e.preventDefault();
    if (!meshChatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'Your Device (You)',
      nodeId: 'LOCAL-NODE',
      distance: '0m (Local)',
      hops: 'Broadcast',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: meshChatInput
    };

    setMeshMessages(prev => [newMsg, ...prev]);
    setMeshChatInput('');
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    const createdInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      ...incidentForm,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isOnline ? 'Received' : 'Waiting for gateway'
    };

    await reportIncidentApi(incidentForm);
    setMyIncidentsList(prev => [createdInc, ...prev]);
    setIncidentSubmitted(true);
    setTimeout(() => {
      setIncidentSubmitted(false);
      setActiveTab('my_emergencies');
    }, 1500);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const userText = chatQuery;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatQuery('');

    const res = await sendAIChat(userText);
    setChatMessages(prev => [...prev, { sender: 'bot', text: res.reply || 'Safety information only. For immediate danger, use SOS.' }]);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      margin: '0 auto',
      backgroundColor: '#070e1c',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      padding: '24px 16px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* ================================================== */}
      {/* APP HEADER WITH COLORFUL BRAND LOGO                */}
      {/* ================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        paddingBottom: '20px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 6px 16px rgba(245, 158, 11, 0.45)'
          }}>
            <Zap style={{ width: '26px', height: '26px', color: '#ffffff', fill: '#ffffff' }} />
          </div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '1px', color: '#ffffff' }}>VAJRANET</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>Disaster Emergency App</div>
          </div>
        </div>

        {/* Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '24px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
          fontSize: '11px',
          fontWeight: '700',
          color: isOnline ? '#34d399' : '#fbbf24'
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#34d399' : '#fbbf24'
          }}></span>
          <span>{isOnline ? 'ONLINE' : 'MESH ACTIVE'}</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* VIEW 1: HOME TAB                                   */}
      {/* ================================================== */}
      {activeTab === 'home' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '16px 0' }}>
          
          {/* Giant Prominent Red SOS Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 45px' }}>
            <button
              onClick={() => setSosStep(1)}
              style={{
                width: '195px',
                height: '195px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff2a5f 0%, #dc2626 50%, #991b1b 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '28px',
                letterSpacing: '1.5px',
                border: '6px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 0 55px rgba(255, 42, 95, 0.85), 0 16px 40px rgba(0,0,0,0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <AlertOctagon style={{ width: '48px', height: '48px', marginBottom: '8px' }} />
              <span>SEND SOS</span>
            </button>
            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '16px', textAlign: 'center', fontWeight: '500' }}>
              Tap for immediate emergency threat or evacuation.
            </div>
          </div>

          {/* Quick Action Buttons STACKED CLEANLY WITH 32px GAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', marginBottom: '40px' }}>
            
            {/* 1. Report Incident */}
            <button
              onClick={() => setActiveTab('incident')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '17px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.45)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <AlertTriangle style={{ width: '26px', height: '26px', color: '#ffb703' }} />
                <span>Report Incident</span>
              </div>
              <ChevronRight style={{ width: '24px', height: '24px', color: '#93c5fd' }} />
            </button>

            {/* 2. Offline Mesh Chat */}
            <button
              onClick={() => setShowMeshChat(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '17px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(124, 58, 237, 0.45)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <MessageSquare style={{ width: '26px', height: '26px', color: '#e9d5ff' }} />
                <span>Offline Mesh Chat</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.22)', padding: '5px 14px', borderRadius: '16px', fontWeight: 'bold' }}>3 Peers</span>
                <ChevronRight style={{ width: '24px', height: '24px', color: '#e9d5ff' }} />
              </div>
            </button>

            {/* 3. Find Shelter */}
            <button
              onClick={() => { setActiveTab('resources'); setResourceTab('shelters'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '17px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(2, 132, 199, 0.45)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Home style={{ width: '26px', height: '26px', color: '#38bdf8' }} />
                <span>Find Shelter</span>
              </div>
              <ChevronRight style={{ width: '24px', height: '24px', color: '#bae6fd' }} />
            </button>

            {/* 4. Find Hospital */}
            <button
              onClick={() => { setActiveTab('resources'); setResourceTab('hospitals'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '17px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(225, 29, 72, 0.45)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <HeartPulse style={{ width: '26px', height: '26px', color: '#fecdd3' }} />
                <span>Find Hospital</span>
              </div>
              <ChevronRight style={{ width: '24px', height: '24px', color: '#fecdd3' }} />
            </button>

            {/* 5. Find Relief */}
            <button
              onClick={() => { setActiveTab('resources'); setResourceTab('relief'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                padding: '22px 24px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '17px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 25px rgba(5, 150, 105, 0.45)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <PackageCheck style={{ width: '26px', height: '26px', color: '#a7f3d0' }} />
                <span>Find Relief</span>
              </div>
              <ChevronRight style={{ width: '24px', height: '24px', color: '#a7f3d0' }} />
            </button>

          </div>

          {/* Official Updates Preview */}
          {announcements.length > 0 && (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #f59e0b',
              borderRadius: '20px',
              padding: '18px',
              marginTop: '20px'
            }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#fbbf24', letterSpacing: '0.5px' }}>
                  ⚠️ OFFICIAL GOVERNMENT UPDATE
                </span>
                <button 
                  onClick={() => setActiveTab('updates')}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}
                >
                  View All ➔
                </button>
              </div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff', marginBottom: '6px' }}>
                {announcements[0].title}
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                "{announcements[0].content}"
              </p>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontFamily: 'monospace' }}>
                Source: {announcements[0].source}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================================================== */}
      {/* OFFLINE MESH CHAT MODAL SCREEN                     */}
      {/* ================================================== */}
      {showMeshChat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 17, 0.95)', zIndex: 99, display: 'flex', alignItems: 'center', justify: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #7c3aed', borderRadius: '24px', padding: '22px', maxWidth: '380px', width: '100%', height: '82vh', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageSquare style={{ width: '26px', height: '26px', color: '#c084fc' }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '17px', color: '#ffffff' }}>Offline Mesh Chatroom</div>
                  <div style={{ fontSize: '10px', color: '#c084fc', fontFamily: 'monospace' }}>BLE Peer Broadcast (No Internet)</div>
                </div>
              </div>
              <button onClick={() => setShowMeshChat(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
              {meshMessages.map(m => (
                <div key={m.id} style={{ backgroundColor: '#070e1c', border: '1px solid #1e293b', padding: '14px', borderRadius: '16px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', fontWeight: '800', marginBottom: '6px' }}>
                    <span style={{ color: '#38bdf8' }}>{m.sender}</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{m.time}</span>
                  </div>
                  <p style={{ margin: 0, color: '#ffffff', fontSize: '14px', lineHeight: '1.4' }}>{m.text}</p>
                  <div style={{ display: 'flex', justify: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #0f172a' }}>
                    <span>Distance: <strong style={{ color: '#34d399' }}>{m.distance}</strong></span>
                    <span>Hops: <strong style={{ color: '#c084fc' }}>{m.hops}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Emergency Broadcast Chips */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px' }}>
              <button onClick={() => setMeshChatInput('Need clean drinking water.')} style={{ backgroundColor: '#070e1c', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 14px', borderRadius: '16px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                💧 Water Needed
              </button>
              <button onClick={() => setMeshChatInput('Safe on 2nd floor balcony.')} style={{ backgroundColor: '#070e1c', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 14px', borderRadius: '16px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                ✅ Safe Location
              </button>
              <button onClick={() => setMeshChatInput('Medical stretcher needed.')} style={{ backgroundColor: '#070e1c', border: '1px solid #334155', color: '#cbd5e1', padding: '8px 14px', borderRadius: '16px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                🩹 Medical Aid
              </button>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendMeshChat} style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #1e293b' }}>
              <input
                type="text"
                value={meshChatInput}
                onChange={e => setMeshChatInput(e.target.value)}
                placeholder="Broadcast offline mesh message..."
                style={{ flex: 1, backgroundColor: '#070e1c', border: '1px solid #334155', borderRadius: '16px', padding: '14px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '14px 20px', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: '700', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>
                Send
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 2: REPORT INCIDENT FORM                       */}
      {/* ================================================== */}
      {activeTab === 'incident' && (
        <div style={{ flex: 1, padding: '18px 0' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '22px' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              <span>Report Incident</span>
            </div>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          {incidentSubmitted ? (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
              <CheckCircle2 style={{ width: '56px', height: '56px', color: '#34d399', margin: '0 auto 16px' }} />
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Incident Reported</h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>Logged and dispatched for emergency triage.</p>
            </div>
          ) : (
            <form onSubmit={handleIncidentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                  Disaster Type
                </label>
                <select
                  value={incidentForm.type}
                  onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#ffffff', fontSize: '15px', outline: 'none' }}
                >
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Accident">Accident</option>
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                  Severity
                </label>
                <select
                  value={incidentForm.severity}
                  onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#ffffff', fontSize: '15px', outline: 'none' }}
                >
                  <option value="CRITICAL">CRITICAL (Immediate Danger)</option>
                  <option value="HIGH">HIGH (Severe Threat)</option>
                  <option value="MEDIUM">MEDIUM (Moderate Impact)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  value={incidentForm.description}
                  onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  placeholder="Describe trapped victims, water depth, or hazards..."
                  style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '16px', color: '#ffffff', fontSize: '15px', outline: 'none' }}
                ></textarea>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '18px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
                  cursor: 'pointer'
                }}
              >
                Submit Incident Report
              </button>
            </form>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 3: EMERGENCY RESOURCES TABS                   */}
      {/* ================================================== */}
      {activeTab === 'resources' && (
        <div style={{ flex: 1, padding: '18px 0' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#ffffff' }}>Emergency Resources</div>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '16px', padding: '6px', border: '1px solid #1e293b', marginBottom: '18px' }}>
            <button
              onClick={() => setResourceTab('shelters')}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: resourceTab === 'shelters' ? '#2563eb' : 'transparent', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Shelters
            </button>
            <button
              onClick={() => setResourceTab('hospitals')}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: resourceTab === 'hospitals' ? '#2563eb' : 'transparent', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Hospitals
            </button>
            <button
              onClick={() => setResourceTab('relief')}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: resourceTab === 'relief' ? '#2563eb' : 'transparent', color: '#ffffff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              Relief Centers
            </button>
          </div>

          {resourceTab === 'shelters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {shelters.map(s => (
                <div key={s.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#ffffff' }}>{s.name}</div>
                    <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '14px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: '700' }}>
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', marginTop: '6px' }}>{s.distanceKm} km away</div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>{s.availableSpaces} spaces available</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>{s.address}</div>
                </div>
              ))}
            </div>
          )}

          {resourceTab === 'hospitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {hospitals.map(h => (
                <div key={h.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '800', fontSize: '16px', color: '#ffffff' }}>{h.name}</div>
                    <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '14px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: '700' }}>
                      Emergency: {h.emergencyStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', marginTop: '6px' }}>{h.distanceKm} km away</div>
                  <div style={{ display: 'flex', gap: '18px', fontSize: '13px', color: '#cbd5e1', marginTop: '10px', backgroundColor: '#070e1c', padding: '12px', borderRadius: '12px' }}>
                    <div>Beds: <strong style={{ color: '#ffffff' }}>{h.availableBeds}</strong></div>
                    <div>ICU Beds: <strong style={{ color: '#38bdf8' }}>{h.icuBeds}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resourceTab === 'relief' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reliefCenters.map(r => (
                <div key={r.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px' }}>
                  <div style={{ fontWeight: '800', fontSize: '16px', color: '#ffffff' }}>{r.name}</div>
                  <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '700', marginTop: '4px' }}>{r.distanceKm} km away</div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#34d399', fontWeight: '700', marginTop: '10px' }}>
                    {r.hasFood && <span>✓ Food</span>}
                    {r.hasWater && <span>✓ Water</span>}
                    {r.hasMedicine && <span>✓ Medicine</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 4: OFFICIAL UPDATES                           */}
      {/* ================================================== */}
      {activeTab === 'updates' && (
        <div style={{ flex: 1, padding: '18px 0' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#ffffff' }}>Official Advisories</div>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map(a => (
              <div key={a.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px' }}>
                <div style={{ display: 'flex', justify: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '800', fontSize: '16px', color: '#fbbf24' }}>⚠️ {a.title}</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: '700' }}>
                    {a.priority}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: '1.5', margin: '0 0 12px' }}>{a.content}</p>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                  Source: {a.source} • {a.area}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 5: MY EMERGENCIES TRACKER                     */}
      {/* ================================================== */}
      {activeTab === 'my_emergencies' && (
        <div style={{ flex: 1, padding: '18px 0' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px', marginBottom: '18px' }}>
            <div style={{ fontWeight: '800', fontSize: '18px', color: '#ffffff' }}>My SOS & Incidents</div>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>My SOS Records</div>
            {mySOSList.length > 0 ? mySOSList.map(sos => (
              <div key={sos.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '16px', borderRadius: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justify: 'space-between', fontWeight: '800' }}>
                  <span style={{ color: '#f87171' }}>{sos.id}</span>
                  <span style={{ color: '#34d399' }}>● {sos.status}</span>
                </div>
                <div style={{ color: '#cbd5e1', marginTop: '8px' }}>"{sos.message}"</div>
                <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '10px', fontWeight: '700' }}>{sos.responseState}</div>
              </div>
            )) : (
              <div style={{ fontSize: '13px', color: '#64748b' }}>No SOS alerts recorded.</div>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* VIEW 6: SAFETY ASSISTANT (AI)                       */}
      {/* ================================================== */}
      {activeTab === 'assistant' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '18px 0' }}>
          <div>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '14px' }}>
              <div style={{ fontWeight: '800', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot style={{ width: '24px', height: '24px', color: '#a855f7' }} />
                <span>Safety Assistant</span>
              </div>
              <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {/* MANDATORY DISCLAIMER PER SPEC */}
            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '14px', borderRadius: '14px', fontSize: '12px', textAlign: 'center', margin: '16px 0', fontWeight: '700' }}>
              ⚠️ Safety information only. For immediate danger, use SOS.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '48vh', overflowY: 'auto' }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justify: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ padding: '14px 18px', borderRadius: '18px', fontSize: '13px', maxWidth: '85%', lineHeight: '1.4', backgroundColor: m.sender === 'user' ? '#2563eb' : '#0f172a', color: '#ffffff', border: m.sender === 'user' ? 'none' : '1px solid #1e293b', whiteSpace: 'pre-line' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '12px', paddingTop: '14px', borderTop: '1px solid #1e293b' }}>
            <input
              type="text"
              value={chatQuery}
              onChange={e => setChatQuery(e.target.value)}
              placeholder="Ask safety question..."
              style={{ flex: 1, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '14px 16px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '14px 22px', backgroundColor: '#a855f7', color: '#ffffff', fontWeight: '700', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>
              Ask
            </button>
          </form>
        </div>
      )}

      {/* ================================================== */}
      {/* SOS MODAL STEPS                                    */}
      {/* ================================================== */}
      {sosStep === 1 && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 17, 0.92)', zIndex: 99, display: 'flex', alignItems: 'center', justify: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '2px solid #ef4444', borderRadius: '24px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <ShieldAlert style={{ width: '56px', height: '56px', color: '#ef4444', margin: '0 auto 16px' }} />
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>Are you in immediate danger?</h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '12px 0 28px' }}>
              This will broadcast an urgent distress alert with your GPS location to emergency responders.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                onClick={handleSOSConfirm}
                style={{ width: '100%', padding: '18px', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: '900', fontSize: '17px', borderRadius: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)' }}
              >
                [ SEND SOS ]
              </button>
              <button
                onClick={() => setSosStep(0)}
                style={{ width: '100%', padding: '14px', backgroundColor: '#1e293b', color: '#cbd5e1', fontWeight: '700', fontSize: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}
              >
                [ CANCEL ]
              </button>
            </div>
          </div>
        </div>
      )}

      {sosStep === 2 && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 17, 0.92)', zIndex: 99, display: 'flex', alignItems: 'center', justify: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #10b981', borderRadius: '24px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <CheckCircle2 style={{ width: '56px', height: '56px', color: '#34d399', margin: '0 auto 16px' }} />
            <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>SOS SENT</h3>

            {/* Tracking Status per Spec */}
            <div style={{ backgroundColor: '#070e1c', padding: '16px', borderRadius: '16px', margin: '18px 0', fontSize: '13px', fontFamily: 'monospace', textAlign: 'left' }}>
              <div style={{ color: '#34d399', fontWeight: '700' }}>● Active</div>
              <div style={{ color: '#64748b' }}>○ Acknowledged</div>
              <div style={{ color: '#64748b' }}>○ Response in progress</div>
              <div style={{ color: '#64748b' }}>○ Resolved</div>
            </div>

            {/* Offline Notice per Spec */}
            {!isOnline && (
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '14px', borderRadius: '14px', fontSize: '12px', textAlign: 'left', marginBottom: '20px', lineHeight: '1.4' }}>
                "You're offline. Your SOS will be carried through the VajraNet network when a connection becomes available."
              </div>
            )}

            <button
              onClick={() => { setSosStep(0); setActiveTab('my_emergencies'); }}
              style={{ width: '100%', padding: '16px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '15px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}
            >
              Track in My Emergencies
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* BOTTOM NAVIGATION BAR WITH ULTRA SPACIOUS DISTANCE */}
      {/* ================================================== */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        paddingBottom: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        marginTop: '36px',
        backgroundColor: '#0f172a',
        borderRadius: '20px',
        paddingLeft: '12px',
        paddingRight: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}>
        {/* 1. Home */}
        <button 
          onClick={() => setActiveTab('home')}
          style={{ 
            flex: 1,
            background: activeTab === 'home' ? 'rgba(56, 189, 248, 0.16)' : 'none', 
            border: 'none', 
            borderRadius: '14px',
            padding: '10px 4px',
            color: activeTab === 'home' ? '#38bdf8' : '#94a3b8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <AlertOctagon style={{ width: '22px', height: '22px' }} />
          <span>Home</span>
        </button>

        {/* 2. Resources */}
        <button 
          onClick={() => setActiveTab('resources')}
          style={{ 
            flex: 1,
            background: activeTab === 'resources' ? 'rgba(56, 189, 248, 0.16)' : 'none', 
            border: 'none', 
            borderRadius: '14px',
            padding: '10px 4px',
            color: activeTab === 'resources' ? '#38bdf8' : '#94a3b8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Home style={{ width: '22px', height: '22px' }} />
          <span>Resources</span>
        </button>

        {/* 3. Updates */}
        <button 
          onClick={() => setActiveTab('updates')}
          style={{ 
            flex: 1,
            background: activeTab === 'updates' ? 'rgba(56, 189, 248, 0.16)' : 'none', 
            border: 'none', 
            borderRadius: '14px',
            padding: '10px 4px',
            color: activeTab === 'updates' ? '#38bdf8' : '#94a3b8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Megaphone style={{ width: '22px', height: '22px' }} />
          <span>Updates</span>
        </button>

        {/* 4. My SOS */}
        <button 
          onClick={() => setActiveTab('my_emergencies')}
          style={{ 
            flex: 1,
            background: activeTab === 'my_emergencies' ? 'rgba(56, 189, 248, 0.16)' : 'none', 
            border: 'none', 
            borderRadius: '14px',
            padding: '10px 4px',
            color: activeTab === 'my_emergencies' ? '#38bdf8' : '#94a3b8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <History style={{ width: '22px', height: '22px' }} />
          <span>My SOS</span>
        </button>

        {/* 5. Assistant */}
        <button 
          onClick={() => setActiveTab('assistant')}
          style={{ 
            flex: 1,
            background: activeTab === 'assistant' ? 'rgba(168, 85, 247, 0.16)' : 'none', 
            border: 'none', 
            borderRadius: '14px',
            padding: '10px 4px',
            color: activeTab === 'assistant' ? '#c084fc' : '#94a3b8', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            fontWeight: '800', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Bot style={{ width: '22px', height: '22px' }} />
          <span>Assistant</span>
        </button>
      </div>

    </div>
  );
}
