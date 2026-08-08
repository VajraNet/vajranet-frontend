const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      throw new Error('401 Unauthorized: Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('403 Forbidden: You do not have permission for this operational task.');
    }
    if (response.status === 404) {
      throw new Error('404 Not Found: Requested resource does not exist.');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[VajraNet API Client] Request to ${url} failed or offline:`, error.message);
    throw error;
  }
}
