// Outspoken server: serves the PWA from ../app and the AI + voice API.
// Zero framework: Node's http module only.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { getFeedback, Anthropic } from "./feedback.mjs";
import { listVoices, synthesize, voiceEnabled } from "./voices.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(here, "../app");
const PORT = Number(process.env.PORT) || 8787;
const DAILY_FEEDBACK_LIMIT = Number(process.env.DAILY_FEEDBACK_LIMIT) || 20;
const DAILY_VOICE_LIMIT = Number(process.env.DAILY_VOICE_LIMIT) || 40;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);

const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

// ---- per-device daily limits (in memory; resets on restart and at midnight UTC) ----
const usage = new Map();
function allow(kind, id, limit) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${day}:${kind}:${id}`;
  const n = usage.get(key) || 0;
  if (n >= limit) return false;
  usage.set(key, n + 1);
  if (usage.size > 50_000) for (const k of usage.keys()) if (!k.startsWith(day)) usage.delete(k);
  return true;
}
function clientId(req) {
  const dev = String(req.headers["x-device-id"] || "").slice(0, 64);
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  return dev ? `${dev}|${ip}` : ip;
}

// ---- helpers ----
function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
    res.setHeader("access-control-allow-headers", "content-type, x-device-id");
    res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  }
}
function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
async function readJson(req, maxBytes = 32_000) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > maxBytes) throw Object.assign(new Error("Request too large"), { status: 413 });
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}
const str = (v, max) => String(v ?? "").slice(0, max);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// ---- API routes ----
async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ai: aiEnabled(), voice: voiceEnabled() });
  }

  if (req.method === "GET" && url.pathname === "/api/voices") {
    return json(res, 200, { voices: await listVoices() });
  }

  if (req.method === "POST" && url.pathname === "/api/feedback") {
    if (!aiEnabled()) return json(res, 503, { error: "AI feedback isn't configured on this server." });
    if (!allow("feedback", clientId(req), DAILY_FEEDBACK_LIMIT)) {
      return json(res, 429, { error: `You've used today's ${DAILY_FEEDBACK_LIMIT} AI coaching sessions. They reset tomorrow.` });
    }
    const b = await readJson(req);
    const input = {
      scenario: str(b.scenario, 120),
      prompt: str(b.prompt, 600),
      transcript: str(b.transcript, 6000),
      name: str(b.name, 30),
      seconds: num(b.seconds),
      wpm: num(b.wpm),
      fillers: num(b.fillers),
      hedges: num(b.hedges),
    };
    try {
      return json(res, 200, await getFeedback(input));
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return json(res, 429, { error: "The coach is busy right now. Try again in a minute." });
      if (err instanceof Anthropic.AuthenticationError) return json(res, 503, { error: "AI feedback isn't configured correctly on this server." });
      if (err instanceof Anthropic.APIError) return json(res, 502, { error: "The coach couldn't be reached. Please try again." });
      throw err;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/speak") {
    if (!voiceEnabled()) return json(res, 503, { error: "Voice isn't configured on this server." });
    if (!allow("voice", clientId(req), DAILY_VOICE_LIMIT)) return json(res, 429, { error: "Daily voice limit reached." });
    const b = await readJson(req);
    const text = str(b.text, 800).trim();
    if (!text) return json(res, 400, { error: "Nothing to say." });
    const upstream = await synthesize(text, str(b.voice, 64));
    res.writeHead(200, { "content-type": "audio/mpeg", "cache-control": "no-store" });
    return Readable.fromWeb(upstream.body).pipe(res);
  }

  return json(res, 404, { error: "Not found" });
}

// ---- static files ----
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/plain; charset=utf-8",
};
async function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.resolve(APP_DIR, "." + rel);
  if (!file.startsWith(APP_DIR + path.sep)) return json(res, 403, { error: "Forbidden" });
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("not a file");
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[path.extname(file)] || "application/octet-stream",
      "cache-control": path.basename(file) === "sw.js" ? "no-cache" : "public, max-age=300",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    cors(req, res);
    if (req.method === "OPTIONS") return res.writeHead(204).end();
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (req.method === "GET" || req.method === "HEAD") return await serveStatic(req, res, url);
    json(res, 405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err.detail ? `${err.message}: ${err.detail}` : err);
    if (!res.headersSent) json(res, err.status || 500, { error: err.status ? err.message : "Something went wrong." });
    else res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Outspoken running at http://localhost:${PORT}`);
  console.log(`AI feedback: ${aiEnabled() ? "on" : "off (set ANTHROPIC_API_KEY)"} · Voice: ${voiceEnabled() ? "on" : "off (set ELEVENLABS_API_KEY)"}`);
});
