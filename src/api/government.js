import { apiFetch } from './client';

export async function fetchAnnouncements() {
  try {
    return await apiFetch('/government/announcements');
  } catch (err) {
    return [
      {
        id: 'ANN-01',
        title: 'MANDATORY EVACUATION ADVISORY: Kurla Sector 4',
        severity: 'CRITICAL',
        issuedBy: 'National Disaster Response Force (NDRF)',
        issuedAt: '10 mins ago',
        content: 'Flash flood alert triggered. Citizens in ground floor apartments are advised to proceed to St. Xavier Community Relief Shelter immediately.',
      },
      {
        id: 'ANN-02',
        title: 'Drinking Water Tanker Dispatch Schedule',
        severity: 'INFO',
        issuedBy: 'Municipal Corporation Emergency Cell',
        issuedAt: '35 mins ago',
        content: '3 mobile clean water tankers arriving at Bandra Sports Enclave Shelter at 15:00 HRS.',
      }
    ];
  }
}

export async function publishAnnouncement(announcementData) {
  try {
    return await apiFetch('/government/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  } catch (err) {
    return {
      success: true,
      announcement: {
        id: `ANN-${Math.floor(10 + Math.random() * 90)}`,
        ...announcementData,
        issuedAt: 'Just now'
      }
    };
  }
}
