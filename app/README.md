# Outspoken (PWA)

A web app for building social confidence: a daily real-world quest, four course
tracks with real-world missions, and speaking practice with on-device feedback.
It installs to the home screen on iPhone, Android and desktop, and works offline.

No build step and no backend. It's plain HTML, CSS and JavaScript modules.

## Run locally

```bash
cd app
python3 -m http.server 8080
# open http://localhost:8080
```

Service workers and the microphone need `localhost` or HTTPS.

## Deploy

Upload the `app/` folder to any static host: Netlify, Vercel, Cloudflare Pages,
GitHub Pages, or your own server. HTTPS is required for installing and for the
microphone.

## Install on a device

- **iPhone/iPad (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu → Install app, or the install prompt.
- **Desktop (Chrome/Edge):** the install icon in the address bar, or Progress → Install app.

## Features

| Area | What it does |
|---|---|
| Today | One deterministic quest per day, streak, XP and level, "continue" card |
| Courses | Inner Game, Conversation, Dating, Work & Presence; 3 chapters each, 2 lessons + 1 mission per chapter |
| Practice | 8 speaking scenarios; live transcript (Web Speech API), pace (wpm), filler words, hedging language, score, recording playback |
| Progress | Stats, 4-week activity grid, practice history, reflection journal, data export/reset |

## Files

- `js/content.js` holds all lessons, missions, quests and scenarios. Edit here to change content.
- `js/store.js` handles local storage, XP, streaks and levels.
- `js/speech.js` handles recording, transcription and speech analysis.
- `js/app.js` contains the router, views and interactions.
- `sw.js` is the offline cache. **Bump `VERSION` whenever you change files.**

## Privacy

Progress is stored only in the browser (`localStorage`). Recordings never leave
the device. Live transcription uses the browser's speech service; Chrome sends
audio to Google for recognition.

## Next steps (not built yet)

- Accounts and cloud sync (e.g. Supabase or Firebase) so progress follows the user.
- AI feedback on transcripts via a small server endpoint calling an LLM.
- Subscriptions (e.g. Stripe) if you want a paywall.
- Push notifications for daily quest reminders.
