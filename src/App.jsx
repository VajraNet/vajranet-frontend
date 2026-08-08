import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitizenPortal from './components/CitizenPortal';
import GovernmentPortal from './components/GovernmentPortal';
import VolunteerPortal from './components/VolunteerPortal';
import ResourcePortal from './components/ResourcePortal';
import MeshVisualizer from './components/MeshVisualizer';
import AIDamageDetector from './components/AIDamageDetector';
import AIFakeNewsDetector from './components/AIFakeNewsDetector';
import AIChatbotModal from './components/AIChatbotModal';

import { fetchIncidents } from './api/incidents';
import { fetchAnnouncements } from './api/government';
import { fetchShelters, fetchHospitals } from './api/resources';

export default function App() {
  const [activeView, setActiveView] = useState('citizen');
  const [isOnline, setIsOnline] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    fetchIncidents().then(data => data && setIncidents(data));
    fetchAnnouncements().then(data => data && setAnnouncements(data));
    fetchShelters().then(data => data && setShelters(data));
    fetchHospitals().then(data => data && setHospitals(data));
  }, []);

  const handleTriggerSOS = (newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleUpdateIncident = (id, updates) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, ...updates } : inc));
  };

  const handlePublishAnnouncement = (newAnn) => {
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#070e1c',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Top Navbar: ONLY shown when evaluating Command Center / Desktop views, or in compact mode */}
      {activeView !== 'citizen' && (
        <Navbar 
          activeView={activeView}
          setActiveView={setActiveView}
          isOnline={isOnline}
          setIsOnline={setIsOnline}
          criticalCount={incidents.filter(i => i.severity === 'CRITICAL').length}
        />
      )}

      {/* Small Floating Switcher Bar when in Citizen View on Desktop to let judges switch to Gov Command Center */}
      {activeView === 'citizen' && (
        <div style={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          padding: '6px 16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📱 CITIZEN MOBILE MODE</span>
          <button 
            onClick={() => setActiveView('gov')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Switch to Gov Command Center ➔
          </button>
        </div>
      )}

      {/* Main Container */}
      <main style={{ padding: activeView === 'citizen' ? '0' : '16px' }}>
        
        {activeView === 'citizen' && (
          <CitizenPortal 
            isOnline={isOnline}
          />
        )}

        {activeView === 'gov' && (
          <GovernmentPortal 
            incidents={incidents}
            onUpdateIncident={handleUpdateIncident}
            isOnline={isOnline}
            shelters={shelters}
            announcements={announcements}
            onPublishAnnouncement={handlePublishAnnouncement}
          />
        )}

        {activeView === 'mesh' && (
          <MeshVisualizer isOnline={isOnline} />
        )}

        {activeView === 'volunteer' && (
          <VolunteerPortal />
        )}

        {activeView === 'hospital' && (
          <ResourcePortal hospitals={hospitals} shelters={shelters} />
        )}

        {activeView === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <AIDamageDetector />
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
              <AIFakeNewsDetector />
            </div>
          </div>
        )}

      </main>

      {/* Global Offline AI Survival Chatbot Modal */}
      <AIChatbotModal 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

    </div>
  );
}
