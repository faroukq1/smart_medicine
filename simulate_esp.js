#!/usr/bin/env node

const BASE_URL = "http://localhost:3000";
const API_KEY = "esp32_shared_secret_key_here";
const FIRMWARE_VER = "v1.0.0";
const PATIENT_EMAIL = "ouledmeriemfarouk1@gmail.com";
const PATIENT_PASS = "artoriastm";

// Base vitals — these drift randomly each cycle
let state = {
  glucose: 126,
  heartRate: 72,
  temperature: 36.6,
  oxygen: 98,
  systolic: 120,
  diastolic: 80,
  batteryPct: 85,
};

let patientToken = null;
let patientId = null;
let deviceId = null;
const readingNum = { n: 1 };

function rand(amplitude) {
  return (Math.random() - 0.5) * 2 * amplitude;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function drift() {
  state.glucose = clamp(Math.round(state.glucose + rand(8)), 60, 250);
  state.heartRate = clamp(Math.round(state.heartRate + rand(5)), 45, 150);
  state.temperature = clamp(
    +(state.temperature + rand(0.2)).toFixed(1),
    35.0,
    42.0,
  );
  state.oxygen = clamp(Math.round(state.oxygen + rand(1)), 88, 100);
  state.systolic = clamp(Math.round(state.systolic + rand(5)), 90, 200);
  state.diastolic = clamp(Math.round(state.diastolic + rand(3)), 50, 130);
  state.batteryPct = clamp(state.batteryPct - Math.random() * 0.02, 0, 100);
}

function buildPayload() {
  const now = new Date().toISOString();
  const fallDetected = readingNum.n % 5 === 0;
  return JSON.stringify({
    patientId,
    glucose: state.glucose,
    heartRate: state.heartRate,
    temperature: state.temperature,
    oxygen: state.oxygen,
    systolic: state.systolic,
    diastolic: state.diastolic,
    batteryPct: Math.round(state.batteryPct),
    firmwareVer: FIRMWARE_VER,
    recordedAt: now,
    fallDetected,
  });
}

async function login() {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: PATIENT_EMAIL, password: PATIENT_PASS }),
    });
    const data = await res.json();
    patientToken = data.accessToken;
    patientId = data.user?.patient?.id;
    console.log(
      `[Auth] Logged in as ${data.user?.firstName} ${data.user?.lastName} (${data.user?.role})`,
    );
    console.log(`[Auth] Patient ID: ${patientId}`);
    return true;
  } catch (err) {
    console.error(`[Auth] Login failed: ${err.message}`);
    return false;
  }
}

async function registerDevice() {
  try {
    const res = await fetch(`${BASE_URL}/api/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${patientToken}`,
      },
      body: JSON.stringify({
        patientId,
        patchId: `ESP32-SIM-${patientId}`,
        macAddress: "AA:BB:CC:DD:EE:FF",
      }),
    });
    const device = await res.json();
    deviceId = device.id;
    console.log(`[Patch] Device registered (id: ${deviceId})`);
    return true;
  } catch (err) {
    console.error(`[Patch] registerDevice error: ${err.message}`);
    return false;
  }
}

async function connectPatch() {
  if (!deviceId) {
    console.warn("[Patch] No deviceId — cannot connect");
    return;
  }
  try {
    const connRes = await fetch(`${BASE_URL}/api/devices/${deviceId}/connect`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (connRes.ok) {
      console.log(`[Patch] Marked connected (device: ${deviceId})`);
    } else {
      console.warn(`[Patch] Connect failed: HTTP ${connRes.status}`);
    }
  } catch (err) {
    console.error(`[Patch] connectPatch error: ${err.message}`);
  }
}

async function disconnectPatch() {
  if (!deviceId) return;
  try {
    const res = await fetch(`${BASE_URL}/api/devices/${deviceId}/disconnect`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (res.ok) {
      console.log("[Patch] Marked disconnected");
    }
  } catch {}
}

async function fetchAlerts() {
  if (!patientToken || !patientId) return "N/A";
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    const alerts = await res.json();
    const unresolved = (Array.isArray(alerts) ? alerts : []).filter(
      (a) => !a.resolvedAt,
    );
    if (unresolved.length === 0) return "None";
    return unresolved.map((a) => `⚠️  ${a.message}`).join(" | ");
  } catch {
    return "N/A";
  }
}

async function send() {
  drift();

  const payload = buildPayload();

  try {
    console.log("Ingesting...");
    const res = await fetch(`${BASE_URL}/api/vitals/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: payload,
    });

    const data = await res.json();
    const immediateAlerts = data.alerts || [];
    const patientAlerts = await fetchAlerts();

    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    const alertLine =
      immediateAlerts.length > 0
        ? immediateAlerts.map((a) => `⚠️  ${a.message}`).join(" | ")
        : patientAlerts;

    console.log(
      `[${t}] #${String(readingNum.n++).padStart(3, "0")} ` +
        `Glu:${state.glucose} HR:${state.heartRate} SpO₂:${state.oxygen}% ` +
        `Temp:${state.temperature}°C BP:${state.systolic}/${state.diastolic} ` +
        `Bat:${Math.round(state.batteryPct)}% ` +
        `→ HTTP ${res.status} | Alerts: ${alertLine}`,
    );
  } catch (err) {
    console.error(`[ERR] ${err.message}`);
  }
}

console.log("═══════════════════════════════════════════");
console.log("  ESP32 Simulator — Send vitals every 1s");
console.log(`  Server:   ${BASE_URL}`);
console.log(`  Patient:  ${PATIENT_EMAIL}`);
console.log("═══════════════════════════════════════════\n");

(async () => {
  const ok = await login();
  if (!ok) {
    console.error("[FATAL] Cannot continue without patient login");
    process.exit(1);
  }

  const devRes = await fetch(`${BASE_URL}/api/devices/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const existing = await devRes.json();
  if (existing?.id) {
    deviceId = existing.id;
    console.log(`[Patch] Found existing device (id: ${deviceId})`);
  }

  if (!deviceId) {
    const registered = await registerDevice();
    if (!registered) {
      console.error("[FATAL] Cannot continue without device registration");
      process.exit(1);
    }
  }

  await connectPatch();

  process.on("SIGINT", async () => {
    console.log("\n[Patch] Shutting down...");
    await disconnectPatch();
    process.exit(0);
  });

  console.log("───────────────────────────────────────────\n");
  send();
  setInterval(send, 1000);
})();
