const API_BASE_URL = 'http://127.0.0.1:8000';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[WasteWise API] ${endpoint} request failed:`, err.message);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchJson('/api/health'),
  getMe: () => fetchJson('/api/auth/me'),
  switchRole: (role) => fetchJson(`/api/auth/switch-role?role=${role}`, { method: 'POST' }),
  
  classifyWaste: (mock_type, image_url = null) => 
    fetchJson('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ mock_type, image_url }),
    }),

  askAssistant: (message) =>
    fetchJson('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getBins: () => fetchJson('/api/bins'),
  getBinDetail: (id) => fetchJson(`/api/bins/${id}`),
  simulateBin: (id, fill_percentage, weight_kg) =>
    fetchJson(`/api/bins/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ fill_percentage, weight_kg }),
    }),

  getTasks: () => fetchJson('/api/logistics/tasks'),
  completeTask: (taskId, proof_photo, collected_weight_kg) =>
    fetchJson(`/api/logistics/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ proof_photo, collected_weight_kg }),
    }),

  getMarketplaceListings: () => fetchJson('/api/marketplace/listings'),
  getMarketplaceOrders: () => fetchJson('/api/marketplace/orders'),
  createMarketplaceOrder: (listing_id, buyer_name, buyer_company, weight_kg) =>
    fetchJson('/api/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify({ listing_id, buyer_name, buyer_company, weight_kg }),
    }),

  getWasteBankAccount: () => fetchJson('/api/waste-bank/account'),
  depositWaste: (weight_kg, material, price_per_kg, notes = '') =>
    fetchJson('/api/waste-bank/deposit', {
      method: 'POST',
      body: JSON.stringify({ weight_kg, material, price_per_kg, notes }),
    }),
  withdrawWasteBank: (amount, target_account) =>
    fetchJson('/api/waste-bank/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, target_account }),
    }),

  getAnalyticsOverview: () => fetchJson('/api/analytics/overview'),
  getForecast: () => fetchJson('/api/analytics/forecast'),

  getDumpingReports: () => fetchJson('/api/geospatial/dumping-reports'),
  createDumpingReport: (data) =>
    fetchJson('/api/geospatial/dumping-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDumpingStatus: (report_id, status) =>
    fetchJson(`/api/geospatial/dumping-reports/${report_id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  getWasteGuide: () => fetchJson('/api/waste/guide'),
  getGamification: () => fetchJson('/api/gamification'),
  createMarketplaceListing: (data) =>
    fetchJson('/api/marketplace/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  streamIoTTick: () => fetchJson('/api/iot/stream-tick', { method: 'POST' }),
};
