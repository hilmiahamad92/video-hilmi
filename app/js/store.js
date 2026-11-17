// Local-first persistence. Everything lives in localStorage on the device.
const KEY = "outspoken:v1";

const DEFAULT = {
  onboarded: false,
  name: "",
  goals: [],
  xp: 0,
  streak: { count: 0, best: 0, last: null },
  lessons: {}, // key -> ISO date completed
  missions: {}, // id -> { date, note }
  daily: {}, // YYYY-MM-DD -> { done, note }
  practice: [], // { date, scenario, seconds, words, wpm, fillers, score }
};

let memory = null;

function load() {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    memory = raw ? { ...structuredClone(DEFAULT), ...JSON.parse(raw) } : structuredClone(DEFAULT);
  } catch {
    memory = structuredClone(DEFAULT);
  }
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* storage unavailable (private mode); keep in memory */
  }
}

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

export const store = {
  get state() {
    return load();
  },
  update(fn) {
    load();
    fn(memory);
    save();
  },
  /** Record activity: adds XP and keeps the daily streak. */
  award(xp) {
    this.update((s) => {
      s.xp += xp;
      const t = today();
      if (s.streak.last !== t) {
        s.streak.count = s.streak.last === yesterday() ? s.streak.count + 1 : 1;
        s.streak.last = t;
        s.streak.best = Math.max(s.streak.best, s.streak.count);
      }
    });
  },
  /** Streak shown to the user: 0 if they missed yesterday and haven't acted today. */
  currentStreak() {
    const s = load().streak;
    return s.last === today() || s.last === yesterday() ? s.count : 0;
  },
  reset() {
    memory = structuredClone(DEFAULT);
    save();
  },
  export() {
    return JSON.stringify(load(), null, 2);
  },
};

export function level(xp) {
  // 100 XP for level 2, growing gently after that.
  let lvl = 1;
  let need = 100;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    lvl += 1;
    need = Math.round(need * 1.25);
  }
  return { lvl, into: rest, need };
}
