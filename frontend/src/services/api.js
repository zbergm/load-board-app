const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// Dashboard
export const dashboard = {
  getStats: () => fetchAPI('/dashboard/stats'),
  getShipmentsByCarrier: () => fetchAPI('/dashboard/shipments-by-carrier'),
  getShipmentsByCustomer: () => fetchAPI('/dashboard/shipments-by-customer'),
  getWeeklyVolume: () => fetchAPI('/dashboard/weekly-volume'),
  getTodayShipments: () => fetchAPI('/dashboard/today'),
  getOverdueShipments: () => fetchAPI('/dashboard/overdue'),
};

// Inbound Shipments
export const inbound = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/inbound/${query ? `?${query}` : ''}`);
  },
  getOne: (id) => fetchAPI(`/inbound/${id}`),
  create: (data) => fetchAPI('/inbound/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/inbound/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/inbound/${id}`, { method: 'DELETE' }),
  markReceived: (id) => fetchAPI(`/inbound/${id}/mark-received`, { method: 'POST' }),
};

// Outbound Shipments
export const outbound = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/outbound/${query ? `?${query}` : ''}`);
  },
  getOne: (id) => fetchAPI(`/outbound/${id}`),
  create: (data) => fetchAPI('/outbound/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/outbound/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/outbound/${id}`, { method: 'DELETE' }),
  markShipped: (id) => fetchAPI(`/outbound/${id}/mark-shipped`, { method: 'POST' }),
};

// Reference Data
export const reference = {
  getCarriers: () => fetchAPI('/reference/carriers'),
  createCarrier: (data) => fetchAPI('/reference/carriers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteCarrier: (id) => fetchAPI(`/reference/carriers/${id}`, { method: 'DELETE' }),

  getCustomers: () => fetchAPI('/reference/customers'),
  createCustomer: (data) => fetchAPI('/reference/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteCustomer: (id) => fetchAPI(`/reference/customers/${id}`, { method: 'DELETE' }),

  getProducts: () => fetchAPI('/reference/products'),
  getProduct: (itemNumber) => fetchAPI(`/reference/products/${itemNumber}`),
  createProduct: (data) => fetchAPI('/reference/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteProduct: (id) => fetchAPI(`/reference/products/${id}`, { method: 'DELETE' }),
};

// Sync
export const sync = {
  getStatus: () => fetchAPI('/sync/status'),
  importFromExcel: () => fetchAPI('/sync/import', { method: 'POST' }),
  exportToExcel: () => fetchAPI('/sync/export', { method: 'POST' }),
  getLog: (limit = 20) => fetchAPI(`/sync/log?limit=${limit}`),
};

export default {
  dashboard,
  inbound,
  outbound,
  reference,
  sync,
};
