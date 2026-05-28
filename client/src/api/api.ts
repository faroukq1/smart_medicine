import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './config';

const ACCESS_KEY = 'medpatch_access_token';
const REFRESH_KEY = 'medpatch_refresh_token';

let accessToken: string | null = null;

export async function loadTokens(): Promise<string | null> {
  if (accessToken) return accessToken;
  const [at, rt] = await Promise.all([
    AsyncStorage.getItem(ACCESS_KEY),
    AsyncStorage.getItem(REFRESH_KEY),
  ]);
  accessToken = at;
  return at;
}

async function setTokens(at: string, rt: string) {
  accessToken = at;
  await AsyncStorage.multiSet([
    [ACCESS_KEY, at],
    [REFRESH_KEY, rt],
  ]);
}

export async function clearTokens() {
  accessToken = null;
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}

async function refreshAccessToken(): Promise<string | null> {
  const rt = await AsyncStorage.getItem(REFRESH_KEY);
  if (!rt) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) {
      await clearTokens();
      return null;
    }
    const data = await res.json();
    accessToken = data.accessToken;
    await AsyncStorage.setItem(ACCESS_KEY, data.accessToken);
    return data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let token = await loadTokens();

  const doFetch = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers || {}),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) res = await doFetch(token);
  }

  return res;
}

// --- Auth ---

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: Record<string, any>) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout() {
  const rt = await AsyncStorage.getItem(REFRESH_KEY);
  if (rt) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    }).catch(() => {});
  }
  await clearTokens();
}

// --- User ---

export async function getMe() {
  const res = await authFetch('/users/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to get user');
  return res.json();
}

// --- Patients (doctor) ---

export async function getPatients(cursor?: string, limit = 30) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  const res = await authFetch(`/patients?${params}`);
  if (!res.ok) throw new Error('Failed to get patients');
  return res.json();
}

export async function getPatientById(id: string) {
  const res = await authFetch(`/patients/${id}`);
  if (!res.ok) throw new Error('Failed to get patient');
  return res.json();
}

// --- Vitals ---

export async function getVitals(patientId: string, cursor?: string, limit = 20) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  const res = await authFetch(`/vitals/${patientId}?${params}`);
  if (!res.ok) throw new Error('Failed to get vitals');
  return res.json();
}

export async function getLatestVitals(patientId: string) {
  const res = await authFetch(`/vitals/${patientId}/latest`);
  if (!res.ok) return null;
  return res.json();
}

// --- Alerts ---

export async function getPatientAlerts(patientId: string, cursor?: string, limit = 20, metric?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', String(limit));
  if (metric) params.set('metric', metric);
  const res = await authFetch(`/alerts/patient/${patientId}?${params}`);
  if (!res.ok) throw new Error('Failed to get alerts');
  return res.json();
}

export async function resolveAlert(alertId: string) {
  const res = await authFetch(`/alerts/${alertId}/resolve`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
}

// --- Devices ---

export async function getPatientDevice(patientId: string) {
  const res = await authFetch(`/devices/patient/${patientId}`);
  if (!res.ok) return null;
  return res.json();
}
