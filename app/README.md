# Outspoken (PWA)

A web app for building social confidence: a daily real-world quest, four course
tracks with real-world missions, and speaking practice with an AI coach that
talks back in a natural voice. It installs to the home screen on iPhone, Android
and desktop, and the core app works offline.

The app is plain HTML, CSS and JavaScript modules with no build step. The
optional server in `../server` adds AI feedback and natural voices.

## Run locally

With the AI coach and voices:

```bash
cp .env.example .env.local      # at the repo root; add your keys
cd server && npm install && npm start
# open http://localhost:8787
```

Without the server (no AI coach; device voices only):

```bash
cd app && python3 -m http.server 8080
```

Service workers and the microphone need `localhost` or HTTPS.

## Deploy

- **With the server:** run `server/` on any Node 22.21+ host (Render, Railway,
  Fly.io, a VPS). It serves the app and the API from one origin. Set
  `ANTHROPIC_API_KEY` and `ELEVENLABS_API_KEY` in the host's secret settings.
- **App only:** upload `app/` to any static host. To point it at a server on
  another domain, set `API_BASE` in `js/api.js` and add the app's origin to the
  server's `ALLOWED_ORIGINS`.

HTTPS is required for installing the app and for the microphone.

## Install on a device

- **iPhone/iPad (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu → Install app, or the install prompt.
- **Desktop (Chrome/Edge):** the install icon in the address bar, or Progress → Install app.

## Features

| Area | What it does |
|---|---|
| Today | One deterministic quest per day, streak, XP and level, "continue" card |
| Courses | Inner Game, Conversation, Dating, Work & Presence; 3 chapters each, 2 lessons + 1 mission per chapter |
| Practice | 8 speaking scenarios; live transcript, pace, filler words, hedging, score and recording playback, all on the device |
| AI coach | Claude reviews the transcript: score, what worked, what to try, a stronger rewrite, and a short spoken message |
| Coach voice | Natural ElevenLabs voices (Sarah, Jessica, Lily, George, Brian, Chris), picked under Progress → Coach voice; falls back to the device's best built-in voice |
| Progress | Stats, 4-week activity grid, practice history, reflection journal, data export/reset |

## API (server)

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | `{ ai, voice }`: which features are configured |
| `POST /api/feedback` | Transcript and stats in, structured coaching feedback out (Claude, `claude-opus-5-5`) |
| `GET /api/voices` | The curated voice list |
| `POST /api/speak` | `{ text, voice }` in, MP3 out (ElevenLabs) |

Per-device daily limits (`DAILY_FEEDBACK_LIMIT`, `DAILY_VOICE_LIMIT`) keep API
costs predictable. To change the voices, set `ELEVENLABS_VOICES` to a JSON list
of `{ id, name, description }`.

## Files

- `js/content.js` holds all lessons, missions, quests and scenarios.
- `js/store.js` handles local storage, XP, streaks and levels.
- `js/speech.js` handles recording, transcription and on-device speech analysis.
- `js/api.js` is the server client; `js/voice.js` handles voice selection and playback.
- `js/app.js` contains the router, views and interactions.
- `sw.js` is the offline cache. **Bump `VERSION` whenever you change files.**
- `../server/` contains `index.mjs` (HTTP server and static files), `feedback.mjs` (Claude) and `voices.mjs` (ElevenLabs).

## Privacy

Progress is stored only in the browser (`localStorage`). Recordings never leave
the device. Live transcription uses the browser's speech service; Chrome sends
audio to Google for recognition. For AI feedback, only the transcript text and
delivery stats are sent to the server and then to Anthropic. For voice, only the
coach's reply text is sent to ElevenLabs.

## Next steps (not built yet)

- Accounts and cloud sync (e.g. Supabase) so progress follows the user.
- Confidence self-ratings with a trend chart.
- Push notifications for daily quest reminders.
