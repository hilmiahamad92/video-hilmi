// Client for the Outspoken server (AI feedback + natural voices).
// API_BASE is "" when the server also serves the app. If you host the app
// separately, set it to the server's URL, e.g. "https://api.example.com".
export const API_BASE = "";

import { store } from "./store.js";

function deviceId() {
  let id = store.state.deviceId;
  if (!id) {
    id = crypto.randomUUID?.() || String(Math.random()).slice(2);
    store.update((s) => (s.deviceId = id));
  }
  return id;
}

async function call(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: { "content-type": "application/json", "x-device-id": deviceId(), ...(opts.headers || {}) },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      msg = (await res.json()).error || msg;
    } catch { /* not JSON */ }
    throw new Error(msg);
  }
  return res;
}

let healthPromise = null;
/** { ai: boolean, voice: boolean }; both false when no server is reachable (static hosting, offline). */
export function health() {
  healthPromise ||= call("/api/health")
    .then((r) => r.json())
    .catch(() => ({ ai: false, voice: false }));
  return healthPromise;
}

export async function getFeedback(payload) {
  return (await call("/api/feedback", { method: "POST", body: JSON.stringify(payload) })).json();
}

let voicesPromise = null;
export function serverVoices() {
  voicesPromise ||= health().then(async (h) => {
    if (!h.voice) return [];
    try {
      return (await (await call("/api/voices")).json()).voices || [];
    } catch {
      voicesPromise = null; // retry next time
      return [];
    }
  });
  return voicesPromise;
}

/** Returns an object URL for MP3 audio of `text` spoken by `voice`. */
export async function speakAudio(text, voice) {
  const res = await call("/api/speak", { method: "POST", body: JSON.stringify({ text, voice }) });
  return URL.createObjectURL(await res.blob());
}
