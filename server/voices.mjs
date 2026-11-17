// Natural-sounding text-to-speech via the ElevenLabs SDK.
import { elevenlabs, ElevenLabsError } from "./elevenlabs.mjs";

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

/** Curated voices that exist on the account (checked once, then cached). */
export async function listVoices() {
  const client = elevenlabs();
  if (!client) return [];
  if (cache) return cache;
  const wanted = curated();
  try {
    const { voices = [] } = await client.voices.getAll();
    const available = new Set(voices.map((v) => v.voiceId));
    const found = wanted.filter((v) => available.has(v.id));
    // If none of the curated IDs exist, fall back to the account's first few voices.
    cache = found.length
      ? found
      : voices.slice(0, 6).map((v) => ({ id: v.voiceId, name: v.name, description: v.labels ? Object.values(v.labels).join(" · ") : "" }));
  } catch (err) {
    // e.g. the key lacks the voices_read permission: use the curated list as-is.
    console.warn("Could not verify ElevenLabs voices:", err instanceof ElevenLabsError ? `${err.statusCode} ${err.message}` : err.message);
    return wanted;
  }
  return cache;
}

export function voiceEnabled() {
  return Boolean(elevenlabs());
}

/** Returns a web ReadableStream of MP3 audio. */
export async function synthesize(text, voiceId) {
  const client = elevenlabs();
  const voices = await listVoices();
  const voice = voices.find((v) => v.id === voiceId) || voices[0];
  if (!client || !voice) {
    throw Object.assign(new Error("No voices are available."), { status: 503 });
  }
  try {
    return await client.textToSpeech.convert(voice.id, {
      text,
      modelId: MODEL,
      outputFormat: "mp3_44100_128",
      voiceSettings: { stability: 0.45, similarityBoost: 0.8, style: 0.25, useSpeakerBoost: true },
    });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      throw Object.assign(new Error(`Voice service error (${err.statusCode ?? "unknown"})`), {
        status: err.statusCode === 401 ? 503 : 502,
        detail: String(err.message).slice(0, 300),
      });
    }
    throw err;
  }
}
