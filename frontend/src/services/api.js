const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:3081/api';

export { API_BASE };

const TOKEN_KEY = 'meg_token';
const USER_KEY  = 'meg_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'geologist'].includes(getRole());
}
export function isAdmin() {
  return getRole() === 'admin';
}
// Backward-compat alias for components that imported isCommander
export const isCommander = isAdmin;

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const apiFetch = request;

// Generic CRUD factory
function crud(base) {
  return {
    list:   (options = {}) => request(`/${base}`, options),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 mineral exploration CRUD APIs
export const propertiesApi              = crud('properties');
export const claimsApi                  = crud('claims');
export const drillHolesApi              = crud('drill-holes');
export const assayResultsApi            = crud('assay-results');
export const geophysicsSurveysApi       = crud('geophysics-surveys');
export const geochemSamplesApi          = crud('geochem-samples');
export const geologicalLogsApi          = crud('geological-logs');
export const geologistsApi              = crud('geologists');
export const contractorsApi             = crud('contractors');
export const samplesInventoryApi        = crud('samples-inventory');
export const permitsApi                 = crud('permits');
export const environmentalImpactsApi    = crud('environmental-impacts');
export const indigenousConsultationsApi = crud('indigenous-consultations');
export const drillTargetsApi            = crud('drill-targets');
export const ndpResourceEstimatesApi    = crud('ndp-resource-estimates');
export const expenseReportsApi          = crud('expense-reports');
export const partnersApi                = crud('partners');
export const auditLogApi                = crud('audit-log');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints (16 verbs)
export const aiAnomalyCluster        = (body, options = {}) => request('/ai/anomaly-cluster',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiDrillTargetRank       = (body, options = {}) => request('/ai/drill-target-rank',         { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiNdp43101Summary       = (body, options = {}) => request('/ai/ndp-43-101-summary',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiAssayTrend            = (body, options = {}) => request('/ai/assay-trend',               { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief        = (body, options = {}) => request('/ai/executive-brief',           { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiPermitReadiness       = (body, options = {}) => request('/ai/permit-readiness',          { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiEnvironmentalRisk     = (body, options = {}) => request('/ai/environmental-risk-brief',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiIndigenousPlan        = (body, options = {}) => request('/ai/indigenous-engagement-plan',{ ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiVendorQuoteCompare    = (body, options = {}) => request('/ai/vendor-quote-compare',      { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiPartnerPitchDraft     = (body, options = {}) => request('/ai/partner-pitch-draft',       { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiExplorationBudget     = (body, options = {}) => request('/ai/exploration-budget',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiGeologistShiftPlan    = (body, options = {}) => request('/ai/geologist-shift-plan',      { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiGeochemPathfinder     = (body, options = {}) => request('/ai/geochem-pathfinder-detect', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiGeophysicsInterp      = (body, options = {}) => request('/ai/geophysics-interpretation', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiResourceStatement     = (body, options = {}) => request('/ai/resource-statement-draft',  { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiJurisdictionalRisk    = (body, options = {}) => request('/ai/jurisdictional-risk',       { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// apply pass 7 — backlog AI verbs
export const aiLithologyClassify       = (body, options = {}) => request('/ai/lithology-classify',        { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiProspectivityScore      = (body, options = {}) => request('/ai/prospectivity-score',       { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiResourceBlockConfidence = (body, options = {}) => request('/ai/resource-block-confidence', { ...options, method: 'POST', body: JSON.stringify(body || {}) });
export const aiAssayAnomalyNarrate     = (body, options = {}) => request('/ai/assay-anomaly-narrate',     { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// 3D block-model
export const getBlockModel   = (property_id) => request(`/ai/block-model?property_id=${encodeURIComponent(property_id)}`);
export const buildBlockModel = (body, options = {}) => request('/ai/block-model', { ...options, method: 'POST', body: JSON.stringify(body || {}) });

// Claim ledger (immutable history)
export const claimLedgerApi = {
  list:      (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/claim-ledger${qs ? '?' + qs : ''}`);
  },
  byClaim:   (claim_id) => request(`/claim-ledger/by-claim/${encodeURIComponent(claim_id)}`),
  create:    (d) => request('/claim-ledger', { method: 'POST', body: JSON.stringify(d) }),
};

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};
