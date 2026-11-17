# Unmute: public-site analysis (REA)

Analysed on 2026-11-17 with REA (`inspect_web_page`, `capture_web_screenshot`,
`analyze_web_bundle`) against https://useunmute.com, plus the site's public
`/privacy` and `/terms` pages. Only public web pages were examined; the iOS app
was not touched.

## The website

- A single marketing page built with Next.js (Turbopack), probably hosted on Vercel.
- Headline: "Meet the version of you people haven't met yet." It has an App Store
  button, "Out now on iPhone", and Terms/Privacy links.
- Visual identity: the Plus Jakarta Sans font, a pixel font (Silkscreen), and a
  pixel-art cat mascot (`cat.png`).
- No analytics or trackers were loaded. Bundle analysis found no API endpoints
  in the page's scripts.

## The company and product, from their legal pages

- **Company:** Bedroomlabs SRL, a Romanian company with an effective date of
  4 Nov 2026. It also runs a site at unmute.bedroomlabs.co.
- **Features:** daily real-world quests, lessons and courses, chapter missions,
  speaking practice with AI feedback, streaks, XP and **confidence scores**.
- **Onboarding** collects:
  - the user's goal and how they heard about the app;
  - gender and age range;
  - how often social situations happen to them;
  - their anxious thoughts and physical feelings, picked from a list;
  - a short plan the user writes themselves;
  - **starting confidence scores**.
- **Business model:** a hard paywall with no free tier, weekly and annual plans,
  and possible free trials. Users must be 16 or older.

## Their technology stack

| Need | Service |
|---|---|
| Sign-in | Sign in with Apple, Google Sign-In |
| Backend (database, auth, file storage) | Supabase |
| AI feedback | Google Gemini API, called from their own server with the text transcript only |
| Speech-to-text | Apple speech recognition, on the device; no audio is uploaded |
| Subscriptions | RevenueCat over App Store payments |
| Reminders | Scheduled locally on the phone; no server push |
| Website hosting | Vercel |

They also enforce **daily limits on AI feedback**, presumably to control cost.

## Lessons for Outspoken

1. Our architecture already matches theirs: speech is turned into text on the
   device and only the text would go to an AI. The missing pieces are a backend
   (Supabase fits), an AI feedback endpoint with a daily limit, and sign-in.
2. Add **confidence self-ratings** at onboarding and then periodically, so
   progress shows up as a chart.
3. A mascot and a distinctive art style are a big part of their brand. Outspoken
   needs its own identity, not theirs.

## Note on their terms

Unmute's Terms forbid reverse engineering the app and using it to build a
competing product. This analysis used only their public website and public
legal documents. Outspoken's content, name and design are original. Do not copy
their lessons, text, art or mascot.
