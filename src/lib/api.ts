const API_BASE = "http://localhost:5000/api";

let token: string | null = localStorage.getItem("datakavatch_token");

export const setToken = (t: string | null) => {
  token = t;
  if (t) {
    localStorage.setItem("datakavatch_token", t);
  } else {
    localStorage.removeItem("datakavatch_token");
  }
};

export const getToken = () => token;

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  // ─── Auth ───
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  register: (body: { name: string; email: string; password: string; consents?: Record<string, boolean> }) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  getProfile: () => request("/auth/profile"),

  updateProfile: (body: { name?: string; phone?: string }) =>
    request("/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  deleteAccount: () => request("/auth/account", { method: "DELETE" }),

  // ─── Consents ───
  setupConsents: (consents: Record<string, boolean>) =>
    request("/consent/setup", { method: "POST", body: JSON.stringify({ consents }) }),

  updateConsent: (id: string, granted: boolean) =>
    request(`/consent/${id}`, { method: "PUT", body: JSON.stringify({ granted }) }),

  getConsentHistory: () => request("/consent/history"),

  // ─── Activities ───
  getActivities: (limit = 50, type?: string) =>
    request(`/activities?limit=${limit}${type ? `&type=${type}` : ""}`),

  // ─── Dashboard ───
  getStats: () => request("/dashboard/stats"),

  // ─── Data Requests ───
  getDataRequests: () => request("/data"),
  requestAccess: (description?: string) =>
    request("/data/request-access", { method: "POST", body: JSON.stringify({ description }) }),
  requestDeletion: (description?: string) =>
    request("/data/request-delete", { method: "POST", body: JSON.stringify({ description }) }),
  requestCorrection: (description?: string) =>
    request("/data/request-correction", { method: "POST", body: JSON.stringify({ description }) }),

  // ─── Shared Resources ───
  getResources: () => request("/resources"),
  shareResource: (body: { websiteName: string; websiteUrl: string; dataType: string; dataLabel: string; expiryDays?: number }) =>
    request("/resources/share", { method: "POST", body: JSON.stringify(body) }),
  revokeResource: (id: string) =>
    request(`/resources/${id}/revoke`, { method: "PUT" }),
  deleteResource: (id: string) =>
    request(`/resources/${id}`, { method: "DELETE" }),
};
