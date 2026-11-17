// Natural-sounding text-to-speech via ElevenLabs.
const API = "https://api.elevenlabs.io/v1";
const KEY = () => process.env.ELEVENLABS_API_KEY;
const MODEL = process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";

// Curated premade voices. Override with ELEVENLABS_VOICES='[{"id":"...","name":"...","description":"..."}]'.
const DEFAULT_VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Calm, reassuring · American" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", description: "Bright, upbeat · American" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", description: "Warm, gentle · British" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Warm storyteller · British" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "Deep, steady · American" },
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris", description: "Casual, friendly · American" },
];

function curated() {
  try {
    if (process.env.ELEVENLABS_VOICES) return JSON.parse(process.env.ELEVENLABS_VOICES);
  } catch {
    console.warn("ELEVENLABS_VOICES is not valid JSON; using defaults");
  }
  return DEFAULT_VOICES;
}

let cache = null;

/** Curated voices that actually exist on the account (checked once, then cached). */
export async function listVoices() {
  if (!KEY()) return [];
  if (cache) return cache;
  const wanted = curated();
  try {
    const res = await fetch(`${API}/voices`, { headers: { "xi-api-key": KEY() } });
    if (!res.ok) throw new Error(`voices ${res.status}`);
    const { voices = [] } = await res.json();
    const available = new Map(voices.map((v) => [v.voice_id, v]));
    const found = wanted.filter((v) => available.has(v.id));
    // If none of the curated IDs exist, fall back to the account's first few voices.
    cache = found.length
      ? found
      : voices.slice(0, 6).map((v) => ({ id: v.voice_id, name: v.name, description: v.labels ? Object.values(v.labels).join(" · ") : "" }));
  } catch (err) {
    console.warn("Could not verify ElevenLabs voices:", err.message);
    return wanted;
  }
  return cache;
}

export function voiceEnabled() {
  return Boolean(KEY());
}

/** Returns a fetch Response whose body is MP3 audio. */
export async function synthesize(text, voiceId) {
  const voices = await listVoices();
  const voice = voices.find((v) => v.id === voiceId) || voices[0];
  if (!voice) {
    const err = new Error("No voices are available.");
    err.status = 503;
    throw err;
  }
  const res = await fetch(`${API}/text-to-speech/${encodeURIComponent(voice.id)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY(), "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Voice service error (${res.status})`);
    err.status = res.status === 401 ? 503 : 502;
    err.detail = detail.slice(0, 300);
    throw err;
  }
  return res;
}
