// Voice playback: natural server voices (ElevenLabs) when available,
// otherwise the most natural-sounding voice built into the device.
import { serverVoices, speakAudio } from "./api.js";
import { store } from "./store.js";

const NATURAL = /natural|neural|premium|enhanced|siri|google|samantha|daniel|karen|moira|serena|aria|jenny|guy/i;

function browserVoiceList() {
  if (!("speechSynthesis" in window)) return [];
  const all = speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
  return all
    .map((v) => ({ v, rank: (NATURAL.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1) }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 6)
    .map(({ v }) => ({ id: `device:${v.name}`, name: v.name.replace(/\s*\(.*\)$/, ""), description: `On-device · ${v.lang}`, device: true }));
}

function waitForBrowserVoices() {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  if (speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise((r) => {
    speechSynthesis.addEventListener("voiceschanged", r, { once: true });
    setTimeout(r, 1500);
  });
}

/** Voices to offer: server voices first, device voices as fallback. */
export async function availableVoices() {
  const [server] = await Promise.all([serverVoices(), waitForBrowserVoices()]);
  return [...server, ...browserVoiceList()];
}

export function voiceSettings() {
  return { voice: null, autoplay: true, ...(store.state.voiceSettings || {}) };
}

export function saveVoiceSettings(patch) {
  store.update((s) => (s.voiceSettings = { ...voiceSettings(), ...patch }));
}

let current = null;

export function stop() {
  if (current?.audio) {
    current.audio.pause();
    URL.revokeObjectURL(current.audio.src);
  }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  current = null;
}

/**
 * Speak text with the chosen voice. Resolves when playback ends.
 * Falls back to a device voice if the server voice fails.
 */
export async function speak(text, voiceId = voiceSettings().voice) {
  stop();
  const voices = await availableVoices();
  const voice = voices.find((v) => v.id === voiceId) || voices[0];
  if (!voice) throw new Error("No voices available on this device.");
  const token = (current = {});

  if (!voice.device) {
    try {
      const url = await speakAudio(text, voice.id);
      if (current !== token) return URL.revokeObjectURL(url);
      const audio = new Audio(url);
      token.audio = audio;
      await audio.play();
      await new Promise((r) => (audio.onended = audio.onpause = r));
      return;
    } catch (err) {
      if (current !== token) return;
      console.warn("Server voice failed, using device voice:", err.message);
    }
  }

  const device = voice.device ? voice : browserVoiceList()[0];
  if (!device) throw new Error("No voices available on this device.");
  const u = new SpeechSynthesisUtterance(text);
  u.voice = speechSynthesis.getVoices().find((v) => `device:${v.name}` === device.id) || null;
  u.rate = 1;
  u.pitch = 1;
  await new Promise((r) => {
    u.onend = u.onerror = r;
    speechSynthesis.speak(u);
  });
}
