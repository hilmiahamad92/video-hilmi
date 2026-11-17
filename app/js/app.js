import { TRACKS, DAILY_QUESTS, SCENARIOS, GOALS, lessonKey, findTrack } from "./content.js";
import { store, today, level } from "./store.js";
import { Session, canTranscribe, canRecord } from "./speech.js";
import { health, getFeedback } from "./api.js";
import * as voice from "./voice.js";

const $view = document.getElementById("view");
const $nav = document.getElementById("nav");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const XP = { lesson: 10, mission: 40, daily: 25, practice: 15 };

// ---------- helpers ----------
function questForDate(dateStr) {
  let h = 0;
  for (const c of dateStr) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return DAILY_QUESTS[h % DAILY_QUESTS.length];
}

function trackProgress(track) {
  const s = store.state;
  let total = 0;
  let done = 0;
  for (const ch of track.chapters) {
    for (const l of ch.lessons) {
      total++;
      if (s.lessons[lessonKey(track.id, ch.id, l.id)]) done++;
    }
    total++;
    if (s.missions[ch.mission.id]) done++;
  }
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function nextStep() {
  // First incomplete item across tracks, ordered by the user's goals.
  const s = store.state;
  const order = [...TRACKS].sort((a, b) => (s.goals.includes(b.id) ? 1 : 0) - (s.goals.includes(a.id) ? 1 : 0));
  for (const t of order) {
    for (const ch of t.chapters) {
      for (const l of ch.lessons) {
        if (!s.lessons[lessonKey(t.id, ch.id, l.id)]) return { kind: "lesson", track: t, chapter: ch, lesson: l };
      }
      if (!s.missions[ch.mission.id]) return { kind: "mission", track: t, chapter: ch };
    }
  }
  return null;
}

function toast(msg) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 2200);
}

function header(title, back) {
  return `<header class="top">${back ? `<a class="back" href="${back}" aria-label="Back">‹</a>` : ""}<h1>${esc(title)}</h1></header>`;
}

// ---------- views ----------
const views = {
  onboarding(step = "0") {
    $nav.hidden = true;
    const s = store.state;
    if (step === "0") {
      return `<section class="hero">
        <div class="logo-big">🗣️</div>
        <h1>Become someone who speaks up.</h1>
        <p class="muted">Small daily challenges, bite-size lessons and speaking practice that build real-world social confidence.</p>
        <a class="btn primary block" href="#/onboarding/1">Get started</a>
      </section>`;
    }
    if (step === "1") {
      return `<section class="card-page">
        <p class="step">1 of 2</p>
        <h2>What should we call you?</h2>
        <form id="nameForm">
          <input class="input" name="name" maxlength="30" autocomplete="given-name" placeholder="Your first name" value="${esc(s.name)}" required />
          <button class="btn primary block">Continue</button>
        </form>
      </section>`;
    }
    return `<section class="card-page">
      <p class="step">2 of 2</p>
      <h2>What do you want to work on?</h2>
      <p class="muted">Pick as many as you like.</p>
      <form id="goalForm" class="goals">
        ${GOALS.map((g) => `<label class="goal"><input type="checkbox" name="goal" value="${g.id}" ${s.goals.includes(g.id) ? "checked" : ""}/><span>${g.emoji} ${esc(g.label)}</span></label>`).join("")}
        <button class="btn primary block">Start my journey</button>
      </form>
    </section>`;
  },

  today() {
    const s = store.state;
    const t = today();
    const q = questForDate(t);
    const dq = s.daily[t];
    const { lvl, into, need } = level(s.xp);
    const nx = nextStep();
    const streak = store.currentStreak();
    return `${header(`Hi${s.name ? ", " + s.name : ""} 👋`)}
      <div class="stats">
        <div class="stat"><b>🔥 ${streak}</b><span>day streak</span></div>
        <div class="stat"><b>⭐ ${s.xp}</b><span>XP</span></div>
        <div class="stat"><b>Lv ${lvl}</b><span><i class="bar"><i style="width:${Math.round((into / need) * 100)}%"></i></i></span></div>
      </div>

      <article class="card quest ${dq?.done ? "done" : ""}">
        <p class="eyebrow">Today's quest · ${"●".repeat(q.level)}${"○".repeat(3 - q.level)}</p>
        <h2>${esc(q.title)}</h2>
        <p>${esc(q.task)}</p>
        ${dq?.done
          ? `<p class="done-note">✅ Completed${dq.note ? ` — “${esc(dq.note)}”` : ""}</p>`
          : `<form id="questForm">
              <textarea class="input" name="note" rows="2" placeholder="How did it go? (optional)"></textarea>
              <button class="btn primary block">I did it · +${XP.daily} XP</button>
            </form>`}
      </article>

      ${nx ? `<a class="card next" href="${nx.kind === "lesson" ? `#/lesson/${nx.track.id}/${nx.chapter.id}/${nx.lesson.id}` : `#/mission/${nx.track.id}/${nx.chapter.id}`}">
          <p class="eyebrow">Continue · ${nx.track.emoji} ${esc(nx.track.title)}</p>
          <h3>${nx.kind === "lesson" ? esc(nx.lesson.title) : "🎯 Mission: " + esc(nx.chapter.mission.title)}</h3>
          <p class="muted">${esc(nx.chapter.title)}</p>
        </a>` : `<div class="card"><h3>🏆 You've finished every course!</h3><p class="muted">Keep your streak alive with daily quests and practice.</p></div>`}

      <a class="card practice-cta" href="#/practice">
        <p class="eyebrow">Speaking practice</p>
        <h3>🎙️ Warm up your voice</h3>
        <p class="muted">Get feedback on pace, filler words and confident language.</p>
      </a>`;
  },

  courses() {
    return `${header("Courses")}
      <div class="list">
      ${TRACKS.map((t) => {
        const p = trackProgress(t);
        return `<a class="card track" href="#/track/${t.id}" style="--accent:${t.color}">
          <div class="track-emoji">${t.emoji}</div>
          <div class="grow">
            <h3>${esc(t.title)}</h3>
            <p class="muted">${esc(t.blurb)}</p>
            <i class="bar"><i style="width:${p.pct}%"></i></i>
            <small class="muted">${p.done}/${p.total} complete</small>
          </div>
        </a>`;
      }).join("")}
      </div>`;
  },

  track(id) {
    const t = findTrack(id);
    if (!t) return views.notFound();
    const s = store.state;
    return `${header(t.title, "#/courses")}
      <p class="muted pad">${esc(t.blurb)}</p>
      ${t.chapters.map((ch, i) => `
        <section class="chapter" style="--accent:${t.color}">
          <h2><span class="num">${i + 1}</span>${esc(ch.title)}</h2>
          <ol class="steps">
            ${ch.lessons.map((l) => {
              const done = s.lessons[lessonKey(t.id, ch.id, l.id)];
              return `<li class="${done ? "done" : ""}"><a href="#/lesson/${t.id}/${ch.id}/${l.id}"><span class="dot">${done ? "✓" : "📖"}</span>${esc(l.title)}</a></li>`;
            }).join("")}
            <li class="mission ${s.missions[ch.mission.id] ? "done" : ""}"><a href="#/mission/${t.id}/${ch.id}"><span class="dot">${s.missions[ch.mission.id] ? "✓" : "🎯"}</span>Mission: ${esc(ch.mission.title)}</a></li>
          </ol>
        </section>`).join("")}`;
  },

  lesson(tid, cid, lid) {
    const t = findTrack(tid);
    const ch = t?.chapters.find((c) => c.id === cid);
    const idx = ch?.lessons.findIndex((l) => l.id === lid) ?? -1;
    const l = ch?.lessons[idx];
    if (!l) return views.notFound();
    const done = store.state.lessons[lessonKey(tid, cid, lid)];
    const nextHref = idx + 1 < ch.lessons.length ? `#/lesson/${tid}/${cid}/${ch.lessons[idx + 1].id}` : `#/mission/${tid}/${cid}`;
    return `${header(ch.title, `#/track/${tid}`)}
      <article class="lesson" style="--accent:${t.color}">
        <p class="eyebrow">${t.emoji} ${esc(t.title)} · Lesson ${idx + 1} of ${ch.lessons.length}</p>
        <h2>${esc(l.title)}</h2>
        <p class="idea">${esc(l.idea)}</p>
        <ul class="points">${l.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <div class="try"><b>Try this</b><p>${esc(l.tryThis)}</p></div>
        <button class="btn primary block" data-complete-lesson="${lessonKey(tid, cid, lid)}" data-next="${nextHref}">${done ? "Next →" : `Got it · +${XP.lesson} XP`}</button>
      </article>`;
  },

  mission(tid, cid) {
    const t = findTrack(tid);
    const ch = t?.chapters.find((c) => c.id === cid);
    if (!ch) return views.notFound();
    const m = ch.mission;
    const rec = store.state.missions[m.id];
    return `${header("Mission", `#/track/${tid}`)}
      <article class="lesson mission-page" style="--accent:${t.color}">
        <p class="eyebrow">🎯 ${esc(ch.title)} · Real-world mission</p>
        <h2>${esc(m.title)}</h2>
        <p class="idea">${esc(m.task)}</p>
        ${rec
          ? `<div class="try"><b>✅ Completed ${esc(rec.date)}</b><p>${esc(rec.note || "No reflection saved.")}</p></div>`
          : `<form id="missionForm" data-id="${m.id}" data-track="${tid}">
              <label class="label">${esc(m.reflect)}</label>
              <textarea class="input" name="note" rows="4" placeholder="Write a quick reflection…"></textarea>
              <button class="btn primary block">Mission complete · +${XP.mission} XP</button>
            </form>`}
      </article>`;
  },

  practice() {
    return `${header("Practice")}
      <p class="muted pad">Pick a scenario, speak out loud, and get instant feedback. Analysis runs in your browser.</p>
      ${!canTranscribe ? `<p class="notice">Live transcription isn't supported in this browser, so you'll get a recording to play back and rate yourself. Chrome, Edge and Safari support transcription.</p>` : ""}
      <div class="list">
        ${SCENARIOS.map((sc) => `<a class="card scenario" href="#/practice/${sc.id}">
          <span class="tag">${esc(sc.tag)}</span>
          <h3>${esc(sc.title)}</h3>
          <p class="muted">${esc(sc.prompt)}</p>
        </a>`).join("")}
      </div>`;
  },

  practiceRun(id) {
    const sc = SCENARIOS.find((x) => x.id === id);
    if (!sc) return views.notFound();
    return `${header(sc.title, "#/practice")}
      <article class="lesson">
        <p class="eyebrow">${esc(sc.tag)} · up to ${sc.seconds}s</p>
        <p class="idea">${esc(sc.prompt)}</p>
        <div class="recorder">
          <div class="timer" id="timer">0:00</div>
          <button class="mic" id="mic" aria-label="Start recording">🎙️</button>
          <p class="muted" id="micHint">${canRecord || canTranscribe ? "Tap to start speaking" : "Microphone access isn't available in this browser."}</p>
        </div>
        <div class="transcript" id="transcript" hidden></div>
        <div id="result"></div>
      </article>`;
  },

  progress() {
    const s = store.state;
    const { lvl } = level(s.xp);
    const lessonsDone = Object.keys(s.lessons).length;
    const missionsDone = Object.keys(s.missions).length;
    const questsDone = Object.values(s.daily).filter((d) => d.done).length;
    const journal = [
      ...Object.entries(s.daily).filter(([, d]) => d.note).map(([date, d]) => ({ date, title: questForDate(date).title, note: d.note })),
      ...Object.entries(s.missions).filter(([, m]) => m.note).map(([id, m]) => ({ date: m.date, title: findMission(id)?.title ?? "Mission", note: m.note })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    const recent = s.practice.slice(-5).reverse();

    return `${header("Progress")}
      <div class="stats">
        <div class="stat"><b>Lv ${lvl}</b><span>${s.xp} XP</span></div>
        <div class="stat"><b>🔥 ${store.currentStreak()}</b><span>best ${s.streak.best}</span></div>
        <div class="stat"><b>🎯 ${missionsDone}</b><span>missions</span></div>
      </div>
      <div class="stats">
        <div class="stat"><b>📖 ${lessonsDone}</b><span>lessons</span></div>
        <div class="stat"><b>☀️ ${questsDone}</b><span>daily quests</span></div>
        <div class="stat"><b>🎙️ ${s.practice.length}</b><span>practice</span></div>
      </div>

      ${calendar(s)}

      <h2 class="section">Recent practice</h2>
      ${recent.length ? `<div class="list">${recent.map((p) => `<div class="card row"><div class="grow"><b>${esc(SCENARIOS.find((x) => x.id === p.scenario)?.title ?? p.scenario)}</b><small class="muted"> · ${esc(p.date)}</small><br><small class="muted">${p.wpm} wpm · ${p.fillers} fillers · ${Math.round(p.seconds)}s</small></div>${p.score != null ? `<span class="score">${p.score}</span>` : ""}</div>`).join("")}</div>` : `<p class="muted pad">No sessions yet.</p>`}

      <h2 class="section">Journal</h2>
      ${journal.length ? `<div class="list">${journal.map((j) => `<div class="card"><small class="muted">${esc(j.date)} · ${esc(j.title)}</small><p>${esc(j.note)}</p></div>`).join("")}</div>` : `<p class="muted pad">Reflections from quests and missions will appear here.</p>`}

      <h2 class="section">Coach voice</h2>
      <div class="card voice-card">
        <label class="label" for="voicePick" style="margin-top:0">Voice</label>
        <div class="row">
          <select class="input grow" id="voicePick" style="margin-top:0"><option>Loading voices…</option></select>
          <button class="btn" id="voicePreview" aria-label="Preview voice">▶︎</button>
        </div>
        <label class="check"><input type="checkbox" id="voiceAuto" ${voice.voiceSettings().autoplay ? "checked" : ""}/> Read coach feedback aloud automatically</label>
        <p class="muted small" id="voiceNote"></p>
      </div>

      <h2 class="section">Settings</h2>
      <div class="list">
        <button class="btn block" id="install" hidden>📲 Install app</button>
        <a class="btn block" href="#/onboarding/1">Edit name & goals</a>
        <button class="btn block" id="exportData">Export my data</button>
        <button class="btn block danger" id="resetData">Reset all progress</button>
      </div>`;
  },

  notFound() {
    return `${header("Not found", "#/today")}<p class="pad">That page doesn't exist.</p>`;
  },
};

function findMission(id) {
  for (const t of TRACKS) for (const ch of t.chapters) if (ch.mission.id === id) return ch.mission;
  return null;
}

function calendar(s) {
  // Last 28 days of activity.
  const days = [];
  const active = new Set([
    ...Object.keys(s.daily).filter((d) => s.daily[d].done),
    ...Object.values(s.lessons).map((d) => d.slice(0, 10)),
    ...Object.values(s.missions).map((m) => m.date),
    ...s.practice.map((p) => p.date),
  ]);
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = today(d);
    days.push(`<i class="${active.has(k) ? "on" : ""}" title="${k}"></i>`);
  }
  return `<h2 class="section">Last 4 weeks</h2><div class="cal">${days.join("")}</div>`;
}

// ---------- router ----------
const NAV = ["today", "courses", "practice", "progress"];

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const s = store.state;
  if (!s.onboarded && parts[0] !== "onboarding") {
    location.replace("#/onboarding");
    return;
  }
  const [name = "today", ...args] = parts;
  let html;
  if (name === "practice" && args[0]) html = views.practiceRun(args[0]);
  else if (views[name] && name !== "practiceRun" && name !== "notFound") html = views[name](...args);
  else html = views.notFound();

  if (name !== "onboarding") $nav.hidden = false;
  $nav.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.dataset.tab === name));
  if (session) {
    session.stop();
    session = null;
  }
  voice.stop();
  $view.innerHTML = html;
  $view.scrollTop = 0;
  window.scrollTo(0, 0);
  bind(name, args);
}

// ---------- interactions ----------
let session = null;

function bind(name, args) {

  document.getElementById("nameForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = new FormData(e.target).get("name").trim();
    store.update((s) => (s.name = v));
    location.hash = "#/onboarding/2";
  });

  document.getElementById("goalForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const goals = new FormData(e.target).getAll("goal");
    store.update((s) => {
      s.goals = goals;
      s.onboarded = true;
    });
    location.hash = "#/today";
  });

  document.getElementById("questForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = new FormData(e.target).get("note").trim();
    store.update((s) => (s.daily[today()] = { done: true, note }));
    store.award(XP.daily);
    toast(`Quest complete! +${XP.daily} XP`);
    route();
  });

  document.querySelector("[data-complete-lesson]")?.addEventListener("click", (e) => {
    const key = e.currentTarget.dataset.completeLesson;
    if (!store.state.lessons[key]) {
      store.update((s) => (s.lessons[key] = today()));
      store.award(XP.lesson);
      toast(`+${XP.lesson} XP`);
    }
    location.hash = e.currentTarget.dataset.next;
  });

  document.getElementById("missionForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const { id, track } = e.target.dataset;
    const note = new FormData(e.target).get("note").trim();
    store.update((s) => (s.missions[id] = { date: today(), note }));
    store.award(XP.mission);
    toast(`Mission complete! +${XP.mission} XP 🎉`);
    location.hash = `#/track/${track}`;
  });

  const mic = document.getElementById("mic");
  if (mic) bindRecorder(mic, SCENARIOS.find((x) => x.id === args[0]));

  document.getElementById("exportData")?.addEventListener("click", () => {
    const blob = new Blob([store.export()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `outspoken-${today()}.json`;
    a.click();
  });
  document.getElementById("resetData")?.addEventListener("click", () => {
    if (confirm("Delete all progress on this device? This can't be undone.")) {
      store.reset();
      location.hash = "#/onboarding";
    }
  });
  setupInstall();
  if (name === "progress") bindVoiceSettings();
}

async function bindVoiceSettings() {
  const pick = document.getElementById("voicePick");
  if (!pick) return;
  const [voices, h] = await Promise.all([voice.availableVoices(), health()]);
  if (!document.body.contains(pick)) return;
  const chosen = voice.voiceSettings().voice || voices[0]?.id;
  const group = (label, list) => (list.length ? `<optgroup label="${label}">${list.map((v) => `<option value="${esc(v.id)}" ${v.id === chosen ? "selected" : ""}>${esc(v.name)}${v.description ? " — " + esc(v.description) : ""}</option>`).join("")}</optgroup>` : "");
  pick.innerHTML = voices.length
    ? group("Natural voices", voices.filter((v) => !v.device)) + group("This device", voices.filter((v) => v.device))
    : `<option>No voices available</option>`;
  document.getElementById("voiceNote").textContent = h.voice
    ? "Natural voices are generated by the Outspoken server."
    : "Natural voices need the Outspoken server. Using your device's built-in voices for now.";
  pick.onchange = () => voice.saveVoiceSettings({ voice: pick.value });
  document.getElementById("voiceAuto").onchange = (e) => voice.saveVoiceSettings({ autoplay: e.target.checked });
  const btn = document.getElementById("voicePreview");
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      await voice.speak(`Hi${store.state.name ? " " + store.state.name : ""}! I'm your coach. Nice work showing up today.`, pick.value);
    } catch (err) {
      toast(err.message);
    } finally {
      btn.disabled = false;
    }
  };
}

function setupInstall() {
  const install = document.getElementById("install");
  if (!install || !deferredInstall) return;
  install.hidden = false;
  install.onclick = async () => {
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    install.hidden = true;
  };
}

function fmt(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function bindRecorder(mic, sc) {
  const $timer = document.getElementById("timer");
  const $hint = document.getElementById("micHint");
  const $tr = document.getElementById("transcript");
  const $res = document.getElementById("result");
  if (!canRecord && !canTranscribe) {
    mic.disabled = true;
    return;
  }

  mic.addEventListener("click", async () => {
    if (!session) {
      $res.innerHTML = "";
      $tr.hidden = !canTranscribe;
      $tr.textContent = "Listening…";
      session = new Session({
        onTranscript: (t) => ($tr.textContent = t),
        onTick: (s) => {
          $timer.textContent = fmt(s);
          if (s >= sc.seconds) stop();
        },
      });
      mic.classList.add("live");
      mic.setAttribute("aria-label", "Stop recording");
      $hint.textContent = "Tap to finish";
      await session.start();
      if (session?.micError) {
        $hint.textContent = "Microphone permission was blocked. Allow it in your browser settings and try again.";
      }
    } else {
      stop();
    }
  });

  let stopping = false;
  async function stop() {
    if (!session || stopping) return;
    stopping = true;
    const s = session;
    mic.classList.remove("live");
    mic.setAttribute("aria-label", "Start recording");
    $hint.textContent = "Analysing…";
    const r = await s.stop();
    session = null;
    stopping = false;
    $hint.textContent = "Tap to try again";

    store.update((st) => st.practice.push({ date: today(), scenario: sc.id, seconds: r.seconds, words: r.words, wpm: r.wpm, fillers: r.fillers.total, score: r.score }));
    store.award(XP.practice);
    toast(`+${XP.practice} XP`);

    $res.innerHTML = `
      ${r.score != null ? `<div class="scorecard"><div class="ring" style="--p:${r.score}"><span>${r.score}</span></div>
        <div class="mini"><div><b>${r.wpm}</b><small>wpm</small></div><div><b>${r.fillers.total}</b><small>fillers</small></div><div><b>${r.hedges.total}</b><small>hedges</small></div><div><b>${fmt(r.seconds)}</b><small>time</small></div></div></div>` : ""}
      <ul class="tips">${r.tips.map((t) => `<li class="${t.kind}">${esc(t.msg)}</li>`).join("")}</ul>
      ${r.fillers.total ? `<p class="muted small">Fillers: ${Object.entries(r.fillers.out).map(([k, v]) => `“${esc(k)}” ×${v}`).join(", ")}</p>` : ""}
      ${s.audioUrl ? `<p class="label">Listen back</p><audio controls src="${s.audioUrl}"></audio>` : ""}
      <div id="coach"></div>`;

    coach(sc, r);
  }
}

async function coach(sc, r) {
  const $coach = document.getElementById("coach");
  if (!$coach || !(await health()).ai || !r.text) return;
  $coach.innerHTML = `<div class="card coach loading"><p class="eyebrow">AI coach</p><p class="muted">Your coach is listening back… <span class="dots"></span></p></div>`;
  let fb;
  try {
    fb = await getFeedback({
      scenario: sc.title, prompt: sc.prompt, transcript: r.text, name: store.state.name,
      seconds: r.seconds, wpm: r.wpm, fillers: r.fillers.total, hedges: r.hedges.total,
    });
  } catch (err) {
    if (document.body.contains($coach)) $coach.innerHTML = `<div class="card coach"><p class="eyebrow">AI coach</p><p class="muted">${esc(err.message)}</p></div>`;
    return;
  }
  if (!document.body.contains($coach)) return;
  store.update((st) => {
    const last = st.practice[st.practice.length - 1];
    if (last) last.coachScore = fb.score;
  });
  $coach.innerHTML = `<article class="card coach">
      <div class="row"><p class="eyebrow grow" style="margin:0">AI coach</p><span class="score">${fb.score}</span></div>
      <p class="coach-summary">${esc(fb.summary)}</p>
      <button class="btn block" id="coachPlay">🔊 Hear your coach</button>
      ${fb.strengths.length ? `<p class="label">What worked</p><ul class="tips">${fb.strengths.map((t) => `<li class="good">${esc(t)}</li>`).join("")}</ul>` : ""}
      ${fb.improvements.length ? `<p class="label">Try next time</p><ul class="tips">${fb.improvements.map((t) => `<li class="info">${esc(t)}</li>`).join("")}</ul>` : ""}
      ${fb.rewrite ? `<div class="try"><b>Say it stronger</b><p>“${esc(fb.rewrite)}”</p></div>` : ""}
    </article>`;
  const btn = document.getElementById("coachPlay");
  let playing = false;
  const play = async () => {
    if (playing) {
      voice.stop();
      return;
    }
    playing = true;
    btn.textContent = "⏹ Stop";
    try {
      await voice.speak(fb.spoken);
    } catch (err) {
      toast(err.message);
    } finally {
      playing = false;
      if (document.body.contains(btn)) btn.textContent = "🔊 Hear your coach";
    }
  };
  btn.onclick = play;
  if (voice.voiceSettings().autoplay) play();
}

// ---------- PWA ----------
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  setupInstall();
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

window.addEventListener("hashchange", route);
route();
