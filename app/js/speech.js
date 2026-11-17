// On-device speaking analysis: Web Speech API transcript + MediaRecorder playback.
// No audio leaves the browser unless the platform's speech service does so itself
// (Chrome sends audio to Google for recognition; Safari may do it on-device).

const FILLERS = ["um", "uh", "erm", "er", "like", "you know", "basically", "actually", "literally", "kind of", "sort of", "i mean", "so yeah"];
const HEDGES = ["i think", "maybe", "just", "sorry", "i guess", "probably", "i'm not sure", "kind of", "sort of", "a little bit"];

export const canTranscribe = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
export const canRecord = Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

function countPhrases(text, phrases) {
  const out = {};
  let total = 0;
  for (const p of phrases) {
    const re = new RegExp(`\\b${p.replace(/ /g, "\\s+")}\\b`, "gi");
    const n = (text.match(re) || []).length;
    if (n) {
      out[p] = n;
      total += n;
    }
  }
  return { total, out };
}

export class Session {
  constructor({ onTranscript, onTick }) {
    this.onTranscript = onTranscript;
    this.onTick = onTick;
    this.finalText = "";
    this.interim = "";
    this.chunks = [];
    this.audioUrl = null;
  }

  async start() {
    this.startedAt = performance.now();
    this.timer = setInterval(() => this.onTick?.(this.elapsed()), 250);

    if (canRecord) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new MediaRecorder(this.stream);
        this.recorder.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
        this.recorder.start();
      } catch (err) {
        this.micError = err;
      }
    }

    if (canTranscribe) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = navigator.language || "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) this.finalText += r[0].transcript + " ";
          else interim += r[0].transcript;
        }
        this.interim = interim;
        this.onTranscript?.(this.finalText + interim);
      };
      // Some browsers stop after silence; restart while the session is live.
      rec.onend = () => {
        if (this.running) {
          try { rec.start(); } catch { /* already started */ }
        }
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") this.micError = e;
      };
      this.rec = rec;
      this.running = true;
      try { rec.start(); } catch { /* ignore */ }
    }
    this.running = true;
  }

  elapsed() {
    return (performance.now() - this.startedAt) / 1000;
  }

  async stop() {
    this.running = false;
    clearInterval(this.timer);
    const seconds = this.elapsed();
    try { this.rec?.stop(); } catch { /* ignore */ }

    if (this.recorder && this.recorder.state !== "inactive") {
      await new Promise((resolve) => {
        this.recorder.onstop = resolve;
        this.recorder.stop();
      });
      const blob = new Blob(this.chunks, { type: this.recorder.mimeType || "audio/webm" });
      this.audioUrl = URL.createObjectURL(blob);
    }
    this.stream?.getTracks().forEach((t) => t.stop());

    // Give the recogniser a moment to deliver its last final result.
    await new Promise((r) => setTimeout(r, 400));
    const text = (this.finalText + " " + this.interim).trim();
    return analyse(text, seconds);
  }
}

export function analyse(text, seconds) {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const minutes = Math.max(seconds / 60, 1 / 60);
  const wpm = Math.round(words / minutes);
  const fillers = countPhrases(text, FILLERS);
  const hedges = countPhrases(text, HEDGES);
  const fillerRate = fillers.total / minutes;

  const tips = [];
  let score = 100;

  if (!text) {
    return { text, words, seconds, wpm: 0, fillers, hedges, score: null, tips: [{ kind: "info", msg: "No speech was transcribed. You can still play back your recording and rate yourself." }] };
  }

  if (seconds < 15) {
    score -= 10;
    tips.push({ kind: "warn", msg: "Short answer. Try to speak for at least 30 seconds to build stamina." });
  }
  if (wpm < 105) {
    score -= 10;
    tips.push({ kind: "warn", msg: `Pace ${wpm} wpm is on the slow side. Aim for 130–160 and keep energy up.` });
  } else if (wpm > 175) {
    score -= 15;
    tips.push({ kind: "warn", msg: `Pace ${wpm} wpm is fast. Slow down and let pauses do some work.` });
  } else {
    tips.push({ kind: "good", msg: `Great pace at ${wpm} wpm: easy to follow.` });
  }
  if (fillerRate > 6) {
    score -= 20;
    tips.push({ kind: "warn", msg: `${fillers.total} filler words (${fillerRate.toFixed(1)}/min). Replace them with a short silent pause.` });
  } else if (fillerRate > 2) {
    score -= 8;
    tips.push({ kind: "info", msg: `${fillers.total} filler words. Good, and pausing instead could make it even cleaner.` });
  } else {
    tips.push({ kind: "good", msg: "Very few filler words. Clean delivery!" });
  }
  if (hedges.total >= 3) {
    score -= 10;
    tips.push({ kind: "warn", msg: `You hedged ${hedges.total} times (${Object.keys(hedges.out).slice(0, 3).map((h) => `“${h}”`).join(", ")}). State it plainly.` });
  } else if (hedges.total === 0) {
    tips.push({ kind: "good", msg: "No hedging language: you sounded sure of yourself." });
  }

  return { text, words, seconds, wpm, fillers, hedges, score: Math.max(0, Math.min(100, score)), tips };
}
