// All course content is original to Outspoken.
// Structure: tracks -> chapters -> lessons (+ one real-world mission per chapter).

export const TRACKS = [
  {
    id: "inner",
    title: "Inner Game",
    emoji: "🧭",
    color: "#f59e0b",
    blurb: "Quiet the critic in your head and build the base everything else rests on.",
    chapters: [
      {
        id: "spotlight",
        title: "The Spotlight Myth",
        lessons: [
          {
            id: "noticed",
            title: "Nobody is watching as hard as you think",
            idea: "People notice far less about you than you assume. Psychologists call this the spotlight effect: we overestimate how much others track our mistakes, clothes and awkward pauses by roughly double.",
            points: [
              "Everyone around you is busy starring in their own movie.",
              "A stumble you replay for days is usually forgotten by others in minutes.",
              "Fewer eyes on you means more freedom to experiment.",
            ],
            tryThis: "Next time you feel self-conscious, ask: 'Would I even remember this if someone else did it?'",
          },
          {
            id: "story",
            title: "Catch the story you are telling",
            idea: "Anxiety is often a prediction dressed up as a fact. 'They'll think I'm weird' is a forecast, not an observation.",
            points: [
              "Name the thought: 'I'm having the thought that…'",
              "Ask for the evidence for and against it.",
              "Replace it with something kinder and equally plausible.",
            ],
            tryThis: "Write down one social prediction today, then check later whether it actually happened.",
          },
        ],
        mission: {
          id: "m-spotlight",
          title: "Wear the odd thing",
          task: "Wear something slightly unusual for you (a bright colour, a hat, mismatched socks) for a few hours in public. Notice how many people actually react.",
          reflect: "How many people commented? How did it compare to what you expected?",
        },
      },
      {
        id: "body",
        title: "Body First",
        lessons: [
          {
            id: "posture",
            title: "Take up your fair share of space",
            idea: "Your body signals confidence before you say a word. Open posture also nudges how you feel, not just how you look.",
            points: [
              "Shoulders back and down, chin level.",
              "Uncross your arms; let your hands be visible.",
              "Plant both feet instead of shifting weight.",
            ],
            tryThis: "Set a phone reminder three times today to check and reset your posture.",
          },
          {
            id: "breath",
            title: "Breathe like you are calm",
            idea: "Slow exhales switch on the body's brakes. A long breath out is the fastest tool you carry for nerves.",
            points: [
              "Inhale through the nose for 4.",
              "Exhale slowly through the mouth for 6–8.",
              "Repeat three times before any conversation that scares you.",
            ],
            tryThis: "Do three slow breaths before your next message, call, or meeting.",
          },
        ],
        mission: {
          id: "m-body",
          title: "Hold the gaze",
          task: "When you pay for something today, make relaxed eye contact with the cashier, smile and say 'thanks, have a good one'.",
          reflect: "What did your body feel like before and after?",
        },
      },
      {
        id: "comfort",
        title: "Stretching the Comfort Zone",
        lessons: [
          {
            id: "ladder",
            title: "Build a fear ladder",
            idea: "Confidence is built by stacking small wins, not by one heroic leap. Rank scary situations from 1 to 10 and climb one rung at a time.",
            points: [
              "Start with something that feels like a 2 or 3.",
              "Repeat a rung until it feels boring, then move up.",
              "Discomfort that fades with repetition is growth.",
            ],
            tryThis: "List five social situations and score each from 1 to 10.",
          },
          {
            id: "reject",
            title: "Make rejection small",
            idea: "Rejection hurts less the more ordinary it becomes. A 'no' is information about a moment, not a verdict on you.",
            points: [
              "Separate the request from your worth.",
              "Count attempts, not successes.",
              "Every 'no' is a rep that makes the next ask easier.",
            ],
            tryThis: "Make one small request today you expect might get a 'no'.",
          },
        ],
        mission: {
          id: "m-comfort",
          title: "Ask for a tiny discount",
          task: "Politely ask for a small discount or freebie somewhere (a coffee shop, a market stall). The goal is asking, not getting.",
          reflect: "What happened? Was the 'no' (or 'yes') as dramatic as you feared?",
        },
      },
    ],
  },
  {
    id: "talk",
    title: "Conversation",
    emoji: "💬",
    color: "#10b981",
    blurb: "Start, carry and end conversations without running out of things to say.",
    chapters: [
      {
        id: "openers",
        title: "Starting Out",
        lessons: [
          {
            id: "situational",
            title: "Comment on the shared moment",
            idea: "The easiest opener is something you are both experiencing right now. It needs no cleverness, just observation.",
            points: [
              "'This line is moving fast today.'",
              "'Have you tried anything here? I can't decide.'",
              "Delivery matters more than words: warm tone, light smile.",
            ],
            tryThis: "Think of three situational openers for a place you visit often.",
          },
          {
            id: "questions",
            title: "Ask questions that open doors",
            idea: "Closed questions get a word; open questions get a story. Swap 'Did you like it?' for 'What was the best part?'",
            points: [
              "Start with what, how, or what was it like.",
              "Follow the energy: ask more about what lights them up.",
              "Avoid interview mode by sharing a little of your own.",
            ],
            tryThis: "Turn three yes/no questions you often ask into open ones.",
          },
        ],
        mission: {
          id: "m-openers",
          title: "Three small openers",
          task: "Start three short conversations with strangers today using a situational comment.",
          reflect: "Which opener worked best? How did people respond?",
        },
      },
      {
        id: "flow",
        title: "Keeping It Flowing",
        lessons: [
          {
            id: "threads",
            title: "Pull on conversation threads",
            idea: "Every answer contains threads: places, feelings, people, plans. Pick one and tug instead of jumping to a new topic.",
            points: [
              "Listen for details: 'I just got back from Lisbon.'",
              "Tug the thread: 'What surprised you most there?'",
              "Keep a mental list of unused threads for silent moments.",
            ],
            tryThis: "In your next chat, follow up on something they mentioned in passing.",
          },
          {
            id: "share",
            title: "Share, don't just ask",
            idea: "Conversations need give and take. Statements about yourself invite the other person in and stop it feeling like an interrogation.",
            points: [
              "Pair a question with a small reveal about you.",
              "Opinions are more interesting than facts.",
              "Small stories beat long résumés.",
            ],
            tryThis: "Prepare a 30-second story about something funny that happened to you this week.",
          },
        ],
        mission: {
          id: "m-flow",
          title: "Five-minute chat",
          task: "Keep a conversation going with someone (a colleague, neighbour, barista) for at least five minutes using threads.",
          reflect: "What thread kept it going? Where did it stall?",
        },
      },
      {
        id: "listen",
        title: "Listening Like You Mean It",
        lessons: [
          {
            id: "active",
            title: "Show you are listening",
            idea: "Feeling heard is rare and memorable. Reflecting back what someone said is the shortcut to rapport.",
            points: [
              "Paraphrase: 'So it sounds like you're torn between…'",
              "Name the feeling: 'That must have been frustrating.'",
              "Resist planning your reply while they talk.",
            ],
            tryThis: "Paraphrase someone at least once in your next conversation.",
          },
          {
            id: "exit",
            title: "End on a high note",
            idea: "A graceful exit leaves a better impression than a fading one. Leave while the energy is still good.",
            points: [
              "Signal: 'I'll let you get back to it.'",
              "Appreciate: 'Really enjoyed hearing about your trip.'",
              "Bridge if you want more: 'Let's grab a coffee sometime.'",
            ],
            tryThis: "Practise one exit line out loud until it feels natural.",
          },
        ],
        mission: {
          id: "m-listen",
          title: "Reflect and exit",
          task: "In one conversation today, paraphrase the other person at least twice, then end it gracefully with an exit line.",
          reflect: "How did they react when you reflected back what they said?",
        },
      },
    ],
  },
  {
    id: "dating",
    title: "Dating",
    emoji: "❤️",
    color: "#f43f5e",
    blurb: "Show genuine interest, handle nerves, and be yourself on dates.",
    chapters: [
      {
        id: "interest",
        title: "Showing Interest",
        lessons: [
          {
            id: "honest",
            title: "Be clear, not clever",
            idea: "Honest, simple interest is more attractive than a perfect line. Clarity is a form of confidence.",
            points: [
              "'I noticed you and wanted to say hi.'",
              "Respect any answer; a calm 'no worries' shows maturity.",
              "Your goal is to express interest, not to control the outcome.",
            ],
            tryThis: "Write one honest, low-pressure way you'd tell someone you're interested.",
          },
          {
            id: "compliment",
            title: "Give compliments that land",
            idea: "Specific compliments about choices (style, taste, effort) feel more sincere than generic praise about looks.",
            points: [
              "'That's a great jacket, where did you find it?'",
              "Give it and move on; don't wait for a reaction.",
              "Compliments work everywhere, not just in dating.",
            ],
            tryThis: "Give one specific, choice-based compliment to anyone today.",
          },
        ],
        mission: {
          id: "m-interest",
          title: "One genuine compliment",
          task: "Give a sincere, specific compliment to someone you find interesting, then continue the conversation for at least one more exchange.",
          reflect: "How did it feel to say it? How did they respond?",
        },
      },
      {
        id: "dates",
        title: "On the Date",
        lessons: [
          {
            id: "nerves",
            title: "Treat nerves as excitement",
            idea: "Nervousness and excitement feel the same in the body. Telling yourself 'I'm excited' performs better than 'calm down'.",
            points: [
              "Reframe the racing heart as energy.",
              "Arrive a few minutes early to settle in.",
              "Focus outward: your job is to get curious about them.",
            ],
            tryThis: "Say 'I'm excited' out loud next time you feel nervous.",
          },
          {
            id: "deeper",
            title: "Go a layer deeper",
            idea: "Connection grows when conversation moves from facts to feelings and values.",
            points: [
              "Fact: 'What do you do?' → Feeling: 'What do you enjoy most about it?'",
              "Ask about dreams: 'If money didn't matter, what would you do?'",
              "Match their depth; share at the same level.",
            ],
            tryThis: "Prepare three 'deeper' questions you'd genuinely like answers to.",
          },
        ],
        mission: {
          id: "m-dates",
          title: "A deeper question",
          task: "Ask a friend, date or family member one 'feeling or values' question and really listen to the answer.",
          reflect: "What did you learn that you wouldn't have otherwise?",
        },
      },
      {
        id: "self",
        title: "Being Yourself",
        lessons: [
          {
            id: "boundaries",
            title: "Boundaries are attractive",
            idea: "Saying what you want and don't want shows self-respect. People trust someone who can say no.",
            points: [
              "Use 'I' statements: 'I'd prefer…'",
              "No long justification is needed.",
              "Respect other people's boundaries just as firmly.",
            ],
            tryThis: "Notice one moment today when you said yes but meant no.",
          },
          {
            id: "outcome",
            title: "Let go of the outcome",
            idea: "Needing a date to go well makes you tense; wanting to have a good time makes you fun. Aim to enjoy, not to win.",
            points: [
              "Set a process goal: 'be curious and honest'.",
              "Not every match is meant to work, and that's useful information.",
              "Your worth doesn't change with one person's reaction.",
            ],
            tryThis: "Before your next social plan, set one process goal.",
          },
        ],
        mission: {
          id: "m-self",
          title: "Say what you want",
          task: "Next time plans are being made, state your genuine preference (place, time, activity) clearly instead of 'whatever you want'.",
          reflect: "How did people react to you voicing a preference?",
        },
      },
    ],
  },
  {
    id: "work",
    title: "Work & Presence",
    emoji: "🎯",
    color: "#6366f1",
    blurb: "Speak up in meetings, present clearly, and carry yourself with presence.",
    chapters: [
      {
        id: "speakup",
        title: "Speaking Up",
        lessons: [
          {
            id: "early",
            title: "Speak in the first five minutes",
            idea: "The longer you wait to speak in a meeting, the harder it gets. Contributing early, even briefly, breaks the seal.",
            points: [
              "Ask a clarifying question early on.",
              "Build on someone: 'To add to Sam's point…'",
              "Short and early beats perfect and never.",
            ],
            tryThis: "In your next group setting, say one thing in the first five minutes.",
          },
          {
            id: "hedges",
            title: "Drop the hedges",
            idea: "Words like 'just', 'sorry', 'I might be wrong but' shrink your message. Say it plainly and let the idea stand.",
            points: [
              "'I just wanted to check…' → 'I want to check…'",
              "'Sorry, quick question' → 'Quick question.'",
              "Confidence isn't loudness; it's clarity.",
            ],
            tryThis: "Reread your last five messages and delete every unnecessary hedge.",
          },
        ],
        mission: {
          id: "m-speakup",
          title: "Early contribution",
          task: "Contribute within the first five minutes of a meeting, class or group conversation, with no hedging words.",
          reflect: "How did it change how you felt for the rest of it?",
        },
      },
      {
        id: "present",
        title: "Presenting Clearly",
        lessons: [
          {
            id: "structure",
            title: "Point, reason, example, point",
            idea: "A simple structure makes you sound prepared even when you're not. PREP: Point, Reason, Example, Point.",
            points: [
              "Point: 'We should move the launch.'",
              "Reason: 'Testing isn't done.' Example: 'Two critical bugs remain.'",
              "Point again: 'So let's move it a week.'",
            ],
            tryThis: "Answer one question today using the PREP structure.",
          },
          {
            id: "pause",
            title: "Use the pause",
            idea: "Silence feels long to you and powerful to listeners. Pausing replaces filler words and gives weight to what you say.",
            points: [
              "Pause instead of saying 'um'.",
              "Pause after a key point to let it land.",
              "Slow down: aim for about 130–160 words per minute.",
            ],
            tryThis: "Use the Practice tab to record yourself and count your filler words.",
          },
        ],
        mission: {
          id: "m-present",
          title: "Two-minute talk",
          task: "Explain something you know well to a friend or colleague in two minutes using PREP, pausing instead of using fillers.",
          reflect: "Did the structure help? Where did you rush?",
        },
      },
      {
        id: "presence",
        title: "Presence & Status",
        lessons: [
          {
            id: "voice",
            title: "Land your sentences",
            idea: "Ending sentences with a rising tone makes statements sound like questions. A downward finish sounds certain.",
            points: [
              "Let your pitch drop at the end of statements.",
              "Speak from your chest, not your throat.",
              "Volume slightly above comfortable is usually just right.",
            ],
            tryThis: "Record a sentence twice, rising then falling, and hear the difference.",
          },
          {
            id: "own",
            title: "Own your wins",
            idea: "Downplaying achievements isn't modesty, it's misinformation. State what you did plainly and with credit to others where due.",
            points: [
              "'I led the redesign, and it cut support tickets by 20%.'",
              "Accept compliments with a simple 'thank you'.",
              "Keep a 'wins' note to remind yourself before reviews.",
            ],
            tryThis: "Write three recent wins in one sentence each, with no hedging.",
          },
        ],
        mission: {
          id: "m-presence",
          title: "Accept the compliment",
          task: "The next time someone compliments you, reply only with 'Thank you, I appreciate that' and stop, with no deflecting.",
          reflect: "Was it hard not to deflect? How did it feel afterwards?",
        },
      },
    ],
  },
];

// One quest is picked per day, deterministically from the date.
export const DAILY_QUESTS = [
  { title: "Say good morning", task: "Greet three people today with eye contact and a smile.", level: 1 },
  { title: "Name check", task: "Learn the name of someone you see regularly but haven't spoken to (a barista, security guard, neighbour).", level: 2 },
  { title: "Ask for a recommendation", task: "Ask a stranger or shop worker for a recommendation (food, book, route).", level: 1 },
  { title: "The specific compliment", task: "Give one specific compliment about someone's choice: their style, taste, or work.", level: 1 },
  { title: "Phone, not text", task: "Call someone you'd normally text.", level: 2 },
  { title: "First to speak", task: "Speak within the first five minutes of a meeting, class or group chat.", level: 2 },
  { title: "No hedging day", task: "Remove 'just', 'sorry' and 'I might be wrong' from everything you write today.", level: 1 },
  { title: "Follow the thread", task: "In one conversation, ask two follow-up questions about something they mentioned.", level: 1 },
  { title: "Small talk, upgraded", task: "Replace 'How are you?' with 'What's been the best part of your day?' at least once.", level: 2 },
  { title: "Opinion out loud", task: "Share an honest opinion in a group, even a small one like a movie take.", level: 2 },
  { title: "Directions", task: "Ask a stranger for directions, even if you know the way.", level: 1 },
  { title: "Reconnect", task: "Message an old friend you haven't spoken to in months and suggest catching up.", level: 1 },
  { title: "Hold the pause", task: "In conversation today, pause for two seconds before answering instead of filling the silence.", level: 1 },
  { title: "Say no kindly", task: "Decline one request you don't want to do, kindly and without over-explaining.", level: 3 },
  { title: "Join in", task: "Join a conversation that's already happening with 'Mind if I join? What are you talking about?'", level: 3 },
  { title: "Thank properly", task: "Thank someone specifically: what they did and how it helped you.", level: 1 },
  { title: "Eat out solo", task: "Have a coffee or meal alone in public without your phone for ten minutes.", level: 2 },
  { title: "Ask a question in public", task: "Ask a question at a talk, class, store or service desk.", level: 2 },
  { title: "Story time", task: "Tell someone a short story about something that happened to you this week.", level: 2 },
  { title: "Make the plan", task: "Be the one to propose a specific plan: day, time and place.", level: 2 },
  { title: "Disagree well", task: "Respectfully disagree with someone once today: 'I see it a bit differently…'", level: 3 },
  { title: "Voice memo", task: "Send a voice message instead of a text to a friend.", level: 1 },
  { title: "Wins out loud", task: "Tell someone one thing you're proud of this week, with no downplaying.", level: 2 },
  { title: "Two-minute stranger chat", task: "Have a two-minute conversation with a stranger.", level: 3 },
  { title: "Speak slowly", task: "Consciously slow your speaking pace in every conversation today.", level: 1 },
  { title: "Accept it", task: "Accept every compliment today with just 'thank you'.", level: 1 },
  { title: "Group invite", task: "Invite two or more people to do something together.", level: 3 },
  { title: "Return it", task: "Return or exchange something, or politely raise an issue with an order.", level: 3 },
  { title: "Curious about work", task: "Ask a colleague or classmate what they enjoy most about what they do.", level: 1 },
  { title: "Record yourself", task: "Do one speaking practice session in the Practice tab and review it.", level: 1 },
];

// Prompts for the speaking practice studio.
export const SCENARIOS = [
  { id: "intro", title: "Introduce yourself", prompt: "You've just joined a new team. Introduce yourself in 30–60 seconds: who you are, what you do, and one fun fact.", seconds: 60, tag: "Everyday" },
  { id: "weekend", title: "Tell a weekend story", prompt: "A friend asks 'How was your weekend?' Give a lively answer with one specific moment.", seconds: 60, tag: "Conversation" },
  { id: "opinion", title: "Defend an opinion", prompt: "Pick something you love (a film, food, city) and convince me it's the best in under a minute.", seconds: 60, tag: "Presence" },
  { id: "meeting", title: "Speak up in a meeting", prompt: "Your team is choosing between two options. State which you prefer and why using Point, Reason, Example, Point.", seconds: 75, tag: "Work" },
  { id: "ask", title: "Ask someone out", prompt: "Practise casually suggesting a coffee to someone you've been chatting with. Keep it light and clear.", seconds: 30, tag: "Dating" },
  { id: "no", title: "Say no gracefully", prompt: "A colleague asks you to take on extra work you don't have time for. Decline kindly and clearly.", seconds: 45, tag: "Boundaries" },
  { id: "pitch", title: "30-second pitch", prompt: "Explain a project or idea you care about as if to someone in an elevator.", seconds: 30, tag: "Work" },
  { id: "free", title: "Free talk", prompt: "Talk about anything on your mind for up to two minutes. Focus on pace and pauses.", seconds: 120, tag: "Open" },
];

export const GOALS = [
  { id: "talk", label: "Talk to new people", emoji: "💬" },
  { id: "dating", label: "Dating & relationships", emoji: "❤️" },
  { id: "work", label: "Speak up at work or school", emoji: "🎯" },
  { id: "inner", label: "Feel less anxious", emoji: "🧭" },
];

export function lessonKey(trackId, chapterId, lessonId) {
  return `${trackId}/${chapterId}/${lessonId}`;
}

export function findTrack(id) {
  return TRACKS.find((t) => t.id === id);
}
