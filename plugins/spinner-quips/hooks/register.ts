import type { Register } from 'claude-code'

type Category = 'read' | 'implement' | 'debug' | 'design' | 'comms' | 'planning' | 'other'

const QUIPS: Record<Category, readonly string[]> = {
  // Reading, checking, analysing.
  read: [
    'Asking the magic 8-ball', // Magic 8-Ball toy
    "Finding the droids we're looking for", // Star Wars: A New Hope
    'Looking for Sarah Connor', // The Terminator
    'Taking the red pill', // The Matrix
    'Waiting for the loot drop', // gaming: RPG loot drops
    'Camping the spawn', // gaming: FPS spawn camping
    'Connecting to Eywa', // Avatar
    'Finding Nemo', // Finding Nemo
    'Searching for my precious', // The Lord of the Rings: Gollum
    'Watching the Truman Show', // The Truman Show
    "Opening Pandora's box", // Greek myth
    'Opening the Chamber of Secrets', // Harry Potter
    'Locking chevron seven', // Stargate SG-1
    'Doom-scrolling', // internet slang
    'Digging with Krecik', // Krtek (The Little Mole)
  ],
  // Implementation, deploy and release.
  implement: [
    'Constructing additional pylons', // StarCraft
    'Microwaving the datapack', // Vlocity datapacks
    'Arguing with Vlocity', // Vlocity
    'Bypassing governor limits', // Salesforce governor limits
    'Charging the flux capacitor', // Back to the Future
    'Hitting 88 miles per hour', // Back to the Future
    'Leeroy Jenkins-ing it', // World of Warcraft meme
    'Rushing B', // Counter-Strike
    'Teabagging the compiler', // gaming: teabagging
    'Roasting the CPU', // dev humour
    'Hacking the mainframe', // hacker-movie cliché
    'Planting the bomb', // Counter-Strike
    'Typing really fast', // hacker-movie cliché
    'Booting up Skynet', // The Terminator
    'Uploading the virus', // Independence Day
    'Decommissioning Mulesoft', // MuleSoft
    'Ordering from ACME', // Looney Tunes: Wile E. Coyote
  ],
  // Debugging, bug fixing, testing and UAT.
  debug: [
    'Consulting the rubber duck', // rubber duck debugging
    'Respawning the bugs', // gaming: respawn
    'Nerfing the bugs', // gaming: nerf
    'Hasta la vista-ing the bugs', // Terminator 2
    'Untangling spaghetti', // spaghetti code
    'Blaming the jungler', // League of Legends
    'Dodging bullets', // The Matrix
    'Reversing the polarity', // Doctor Who
    'Feeding the gremlins', // Gremlins
    'Turning it off and on again', // The IT Crowd
    'Hunting the Predator', // Predator
    'Calling tech support', // The IT Crowd
    'Swearing in Polish', // Polish dev life
    'Questioning life choices', // dev humour
    'Asking ChatGPT', // AI humour
    'Discovering it never worked in prod', // dev life
    'Ah sh*t, here we go again', // GTA San Andreas
    'Ordering -1 beers', // QA-walks-into-a-bar joke
    'Chasing Jerry', // Tom and Jerry
  ],
  // Requirements, business analysis, solution design.
  design: [
    'Calibrating the vibes', // internet slang
    'Using the Force', // Star Wars
    "Making an offer you can't refuse", // The Godfather
    'Negotiating with Salesforce', // Salesforce
    'Bending the spoon', // The Matrix
    'Consulting Master Yoda', // Star Wars
    'Drawing it like a French girl', // Titanic
    'Making it legen… dary', // How I Met Your Mother
    'Getting briefed by M', // James Bond
    'Asking Hermione', // Harry Potter
    'Finding inner peace', // Kung Fu Panda
    'Mixing sugar, spice and everything nice', // The Powerpuff Girls
  ],
  // Documentation and communication: Jira, Confluence, mail, Slack.
  comms: [
    'Phoning home', // E.T.
    'Talking to Wilson', // Cast Away
    'Lighting the beacons', // The Lord of the Rings: The Return of the King
    'Sending the Bat-Signal', // Batman
    'Replying all by accident', // office life
    'Opening hailing frequencies', // Star Trek
    'Talking while on mute', // video-call life
    'CC-ing the whole company', // office life
    'Ghosting the client', // internet slang
  ],
  // Planning and reporting: estimates, sprints, status, timelines.
  planning: [
    'Planning the heist', // Ocean's Eleven
    'Delegating to JARVIS', // Iron Man
    'Briefing the minions', // Despicable Me
    'Counting to infinity', // estimation joke
    'Moving the deadline', // PM life
    'Interrogating stakeholders', // PM life
    'Promising it by Friday', // PM life
    'Pushing it to next sprint', // Scrum life
    'Ranking urgent A vs urgent B', // office life
    'Discussing, but not deciding', // office life
    'Dreaming of a meeting-free Friday', // office life
    'Estimating in years', // office life
  ],
  other: [
    'Bribing the hamster', // loading-screen classic; the hamster-saga mod's episode slot
    'Petting the server', // dev humour
    'Waking the server elves', // dev humour
    'Loading the loading bar', // loading-screen classic
    'Skipping the cutscene', // gaming
    'Summoning more coffee', // dev life
    'Doing it for the family', // Fast & Furious
    'Going to infinity and beyond', // Toy Story
    'Following the way', // The Mandalorian
    'Figuring out what I really like doing', // Chłopaki nie płaczą
    'Chewing bubble gum', // Bev
    'Pretending to work', // office life
    'Opening the fridge for no reason', // everyday life
    'Begging for more Claude tokens', // Claude usage limits
    'Shaking, not stirring', // James Bond
    'Yabba Dabba Doo', // The Flintstones
  ],
}

type Topic = 'vlocity' | 'mulesoft'

// Quips that only make sense when the turn touches their topic.
const TOPIC_QUIPS: Record<string, Topic> = {
  'Microwaving the datapack': 'vlocity',
  'Arguing with Vlocity': 'vlocity',
  'Decommissioning Mulesoft': 'mulesoft',
}

// What gives a topic away in a prompt, a command or skill name, or any argument of a tool call.
const TOPICS: readonly [Topic, RegExp][] = [
  ['vlocity', /vlocity|omni-?(?:studio|scripts?|process)|flex-?cards?|data-?raptors?|datapacks?|integration procedures?|communications-cloud/i],
  ['mulesoft', /(?<![a-z])mule|anypoint|(?<![a-z])raml(?![a-z])|dataweave|(?<![a-z])dwl(?![a-z])/i],
]

// A whole word or a stem: no letter may touch the match on either side.
const words = (list: readonly string[]) => new RegExp(`(?<!\\p{L})(?:${list.join('|')})(?!\\p{L})`, 'iu')

// Words a slash command's or skill's name uses for its task, checked in this order before the prompt keywords.
const COMMAND_WORDS: readonly [Category, RegExp][] = [
  ['debug', words(['tests?', 'trace\\p{L}*', 'logs?', 'debug\\p{L}*', 'bug\\p{L}*', 'fix\\p{L}*', 'diagnos\\p{L}*'])],
  [
    'implement',
    words([
      'implement\\p{L}*',
      'deploy\\p{L}*',
      'sync\\p{L}*',
      'commit\\p{L}*',
      'push\\p{L}*',
      'pull',
      'merge\\p{L}*',
      'cherry-pick\\p{L}*',
      'release\\p{L}*',
      'build\\p{L}*',
      'retrieve',
      'vlocity',
    ]),
  ],
  ['comms', words(['publish\\p{L}*', 'docs?', 'mail\\p{L}*', 'comment\\p{L}*', 'notes?'])],
  ['design', words(['design\\p{L}*', 'architect\\p{L}*'])],
  ['planning', words(['report\\p{L}*', 'time', 'estimat\\p{L}*', 'plan\\p{L}*', 'standup', 'status'])],
  ['read', words(['data', 'verify', 'review\\p{L}*', 'audit\\p{L}*', 'search\\p{L}*', 'query', 'explore', 'analy\\p{L}*'])],
]

// Prompt keywords, Polish and English, checked in this order: the first match wins.
const KEYWORDS: readonly [Category, RegExp][] = [
  [
    'debug',
    words([
      'bugs?',
      'bugfix\\p{L}*',
      'fix',
      'fixing',
      'fixed',
      'napraw\\p{L}*',
      'debug\\p{L}*',
      'błęd\\p{L}*',
      'błąd',
      'bled\\p{L}*',
      'blad',
      'nie działa\\p{L}*',
      'nie dziala\\p{L}*',
      'errors?',
      'exceptions?',
      'wyjąt\\p{L}*',
      'wyjat\\p{L}*',
      'broken',
      'fail\\p{L}*',
      'crash\\p{L}*',
      'stack ?trace',
      'root cause',
      'zepsu\\p{L}*',
      'not working',
      "doesn't work",
      "isn't working",
      'dlaczego',
      'czemu',
      'testing',
      'testy',
      'przetestuj\\p{L}*',
      'unit tests?',
      'run (?:the )?tests?',
      'test cases?',
      'test scenarios?',
      'test scripts?',
      'scenariusz\\p{L}* testow\\p{L}*',
      'regression\\p{L}*',
      'regresj\\p{L}*',
      'coverage',
      'pokryci\\p{L}*',
      'smoke tests?',
      'uat tests?',
      'uat testing',
      'testy uat',
      'playwright\\p{L}*',
      'automation tests?',
      'e2e tests?',
    ]),
  ],
  [
    'comms',
    words([
      'e-?mail\\p{L}*',
      'mail\\p{L}*',
      'wiadomoś\\p{L}*',
      'wiadomosc\\p{L}*',
      'slack\\p{L}*',
      'teams',
      'confluence\\p{L}*',
      'notatk\\p{L}*',
      'meeting notes',
      'minutes',
      'release notes',
      'komentarz\\p{L}*',
      'jira comments?',
      'reply',
      'announcement\\p{L}*',
      'ogłoszeni\\p{L}*',
      'dokumentacj\\p{L}*',
      'documentation',
      'newsletter\\p{L}*',
      'weekly updates?',
      'status updates?',
      'client updates?',
      'send (?:an? |the )?(?:e-?mail|message|update|summary|notes)',
      'wyślij\\p{L}*',
      'wyslij\\p{L}*',
      'napisz do',
    ]),
  ],
  [
    'design',
    words([
      'sd',
      'sd-\\p{L}+',
      'solution design\\p{L}*',
      'requirements?',
      'wymagani\\p{L}*',
      'design\\p{L}*',
      'zaprojektuj\\p{L}*',
      'projektuj\\p{L}*',
      'architektur\\p{L}*',
      'architecture',
      'specs?',
      'specification',
      'specyfikacj\\p{L}*',
      'user stor\\p{L}*',
      'acceptance criteria',
      'ac',
      'kryteri\\p{L}* akceptacji',
      'gap analysis',
      'gap\\p{L}*',
      'warsztat\\p{L}*',
      'workshop\\p{L}*',
      'refinement\\p{L}*',
      'mapping\\p{L}*',
      'mapowani\\p{L}*',
      'business process\\p{L}*',
      'proces\\p{L}* biznesow\\p{L}*',
      'bpmn',
      'analiz\\p{L}* biznesow\\p{L}*',
      'map',
      'mapuj\\p{L}*',
      'options?',
      'opcj\\p{L}*',
      'approach\\p{L}*',
      'podejści\\p{L}*',
      'diagram\\p{L}*',
      'trade-?off\\p{L}*',
    ]),
  ],

  [
    'planning',
    words([
      'wycen\\p{L}*',
      'estimat\\p{L}*',
      'sprint\\p{L}*',
      'status reports?',
      'weekly\\p{L}*',
      'raport\\p{L}*',
      'harmonogram\\p{L}*',
      'timelines?',
      'deadline\\p{L}*',
      'backlog\\p{L}*',
      'priorytet\\p{L}*',
      'prioriti[sz]\\p{L}*',
      'ryzyk\\p{L}*',
      'risks?',
      'roadmap\\p{L}*',
      'mrf',
      'kick-?off\\p{L}*',
      'zaplanuj\\p{L}*',
      'planowani\\p{L}*',
      'worklog\\p{L}*',
      'agenda\\p{L}*',
      'spotkani\\p{L}*',
      'meetings?',
      'hours',
      'godzin\\p{L}*',
      'blocked',
      'blockers?',
      'zablokowan\\p{L}*',
      'capacity',
      'dostępnoś\\p{L}*',
    ]),
  ],
  [
    'implement',
    words([
      'implement\\p{L}*',
      'zaimplementuj\\p{L}*',
      'add',
      'adding',
      'dodaj\\p{L}*',
      'dodać',
      'create',
      'stwórz',
      'stworz',
      'build',
      'zbuduj',
      'zrób',
      'zrob',
      'make',
      'change',
      'zmień',
      'zmien\\p{L}*',
      'refactor\\p{L}*',
      'write',
      'napisz',
      'update',
      'deploy\\p{L}*',
      'wdróż',
      'wdroz\\p{L}*',
      'release\\p{L}*',
      'cherry-?pick\\p{L}*',
      'merge\\p{L}*',
      'zmerguj\\p{L}*',
      'commit\\p{L}*',
      'push\\p{L}*',
      'wypchnij',
      'pull requests?',
      'pr',
      'manifest\\p{L}*',
      'sync\\p{L}*',
      'raml',
      'dataweave',
      'dwl',
      'postman\\p{L}*',
      'collection',
      'kolekcj\\p{L}*',
    ]),
  ],
  [
    'read',
    words([
      'check\\p{L}*',
      'sprawdź',
      'sprawdz\\p{L}*',
      'zobacz',
      'look',
      'see',
      'read',
      'przeczytaj',
      'czytaj',
      'verify',
      'zweryfikuj',
      'explain',
      'wyjaśnij',
      'wyjasnij',
      'how does',
      'jak działa',
      'jak dziala',
      'what is',
      'co to',
      'find',
      'znajdź',
      'znajdz',
      'show',
      'pokaż',
      'pokaz',
      'review',
      'przejrzyj',
      'analy[sz]e',
      'przeanalizuj',
      'compare',
      'porównaj',
      'porownaj',
      'what does',
      'what do',
      'how do',
      'logs?',
      'logi\\p{L}*',
    ]),
  ],
]

// The last tool used decides only when nothing else did; MCP tools by the name after their server.
const TOOLS: Record<string, Category> = {
  Read: 'read',
  Grep: 'read',
  Glob: 'read',
  WebFetch: 'read',
  WebSearch: 'read',
  getJiraIssue: 'read',
  getConfluencePage: 'read',
  run_soql_query: 'read',
  Edit: 'implement',
  Write: 'implement',
  NotebookEdit: 'implement',
  deploy_metadata: 'implement',
  run_apex_test: 'debug',
  addCommentToJiraIssue: 'comms',
  createJiraIssue: 'comms',
  editJiraIssue: 'comms',
  createConfluencePage: 'comms',
  updateConfluencePage: 'comms',
  createConfluenceFooterComment: 'comms',
  createConfluenceInlineComment: 'comms',
  send_message: 'comms',
  create_draft: 'comms',
  update_draft: 'comms',
  reply: 'comms',
  forward: 'comms',
  slack_send_message: 'comms',
  slack_send_message_draft: 'comms',
  slack_schedule_message: 'comms',
  slack_create_canvas: 'comms',
  slack_update_canvas: 'comms',
  searchJiraIssuesUsingJql: 'planning',
  transitionJiraIssue: 'planning',
  addWorklogToJiraIssue: 'planning',
  create_event: 'planning',
  update_event: 'planning',
  suggest_time: 'planning',
  find_meeting_availability: 'planning',
  outlook_find_available_time: 'planning',
  outlook_calendar_search: 'planning',
  list_events: 'planning',
}

// Shell commands that give the task away.
const SHELL: readonly [Category, RegExp][] = [
  ['debug', /\bsf\s+apex\s+(?:run\s+test|get\s+log|tail\s+log)/],
  ['debug', /\bnewman\b|\bplaywright\b|\b(?:npm|npx|yarn)\s+(?:run\s+)?test\b|\bmvn\b.*\btest\b/],
  ['implement', /\bsf\s+project\s+(?:deploy|retrieve)|\bvlocity\b|\bgit\s+(?:push|commit|cherry-pick|merge)\b/],
  ['implement', /\bmvn\b|\banypoint-cli\b|\bmule\b/],
  ['read', /\bsf\s+data\s+query|\bgit\s+(?:log|diff|show|status)\b/],
]

// How sure each signal is: within a turn a weaker one never overrides a stronger one.
const RANK = { tool: 0, keyword: 1, command: 2 } as const
type Source = keyof typeof RANK

// The desktop's word when the step it shows has no description of its own.
const GENERIC = 'Working'

// The quip that, drawn, shows the hamster-saga mod's episode instead, another quip while none is due, and itself
// while that mod is not installed.
const HAMSTER = 'Bribing the hamster'

// The same slot in every other group's bag; drawn with no episode to show, it is drawn again.
const SLOT = 'hamster-saga slot'

let category: Category = 'other'
let source: Source | null = null
let current: string | null = null
let last: string | null = null
const bags: Partial<Record<Category, string[]>> = {}
const topics = new Set<Topic>()
// The saga episode on screen, until the saga moves past it.
let hamsterShown: string | null = null
// Bumped by every draw and every reset, so a draw that waited on the saga only keeps its quip when nothing came after it.
let draws = 0

function forget(): void {
  current = null
  draws++
}

function spot(text: string): void {
  for (const [topic, pattern] of TOPICS) {
    if (pattern.test(text)) topics.add(topic)
  }
}

function isAllowed(quip: string): boolean {
  const topic = TOPIC_QUIPS[quip]
  return topic === undefined || topics.has(topic)
}

function lastAllowed(bag: readonly string[]): number {
  for (let i = bag.length - 1; i >= 0; i--) {
    if (isAllowed(bag[i] as string)) return i
  }
  return -1
}

function classify(next: Category, from: Source): void {
  if (source !== null && RANK[from] < RANK[source]) {
    return
  }
  if (next !== category) {
    forget()
  }
  category = next
  source = from
}

// A uniform index below `n` from the platform CSPRNG, so a fresh load does not replay the same sequence.
function randomIndex(n: number): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return Math.floor(((buf[0] ?? 0) / 2 ** 32) * n)
}

function shuffled(group: Category): string[] {
  const bag = [...QUIPS[group], ...(group === 'other' ? [] : [SLOT])]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    const swap = bag[i] as string
    bag[i] = bag[j] as string
    bag[j] = swap
  }
  if (bag.length > 1 && bag[bag.length - 1] === last) {
    bag.unshift(bag.pop() as string)
  }
  return bag
}

// Every quip of the group once, shuffled, before any repeats; an off-topic quip waits in the bag for its turn.
function pick(group: Category): string {
  let bag = bags[group] ?? []
  let index = lastAllowed(bag)
  if (index < 0) {
    bag = shuffled(group)
    bags[group] = bag
    index = lastAllowed(bag)
  }
  if (index < 0) {
    return GENERIC
  }
  last = bag.splice(index, 1)[0] as string
  return last
}

function commandOf(text: string): string | undefined {
  return /^\s*\/([\w:-]+)/.exec(text)?.[1]?.split(':').pop()
}

function keywordCategory(text: string): Category | null {
  for (const [group, pattern] of KEYWORDS) {
    if (pattern.test(text)) {
      return group
    }
  }
  return null
}

// What a slash command or skill is for, read from the words of its name.
function commandCategory(name: string): Category | null {
  return COMMAND_WORDS.find(([, pattern]) => pattern.test(name))?.[0] ?? keywordCategory(name)
}

// A tool's arguments sit on the event itself (`e.command`, `e.skill`), not under an `input` field.
function argOf(call: unknown, name: string): string {
  const value = call && typeof call === 'object' ? (call as Record<string, unknown>)[name] : undefined
  return typeof value === 'string' ? value : ''
}

function toolCategory(tool: string, call: unknown): Category | null {
  const name = tool.split('__').pop() ?? tool
  if (name === 'Bash') {
    const command = argOf(call, 'command')
    return SHELL.find(([, pattern]) => pattern.test(command))?.[0] ?? null
  }
  return TOOLS[name] ?? null
}

// Once a week a copy installed from the marketplace asks the engine's own binary, quietly, to refresh the marketplace and
// update this plugin; the new version loads with the next session or /reload-plugins. The `autoUpdate` option turns it off.
const MARKETPLACE = 'li-technologies'
const INSTALLED = /[\\/]plugins[\\/]cache[\\/]li-technologies[\\/]/
const UPDATE_EVERY = 7 * 24 * 60 * 60 * 1000
const UPDATE_DELAY = 60 * 1000

// The engine is the parent of a process this module starts: its path on macOS and Linux, then on Windows.
const ENGINE_PATH: readonly (readonly string[])[] = [
  ['/bin/sh', '-c', 'if [ -r /proc/$PPID/exe ]; then readlink /proc/$PPID/exe; else ps -o comm= -p $PPID; fi'],
  [
    'powershell.exe',
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '$me = Get-CimInstance Win32_Process -Filter "ProcessId=$PID"; (Get-CimInstance Win32_Process -Filter "ProcessId=$($me.ParentProcessId)").ExecutablePath',
  ],
]

// The saga is another mod's: each call goes through its `$.hamster` noun and is skipped while that mod is not installed.
export const register: Register = (on, options) => {
  // Attaches to the saga, then the weekly self-update, a minute into the session so it never slows the start.
  on('session.start', async ($, e, next) => {
    try {
      await $.hamster.attach()
    } catch {}
    const result = await next(e)
    if (options.autoUpdate !== false && INSTALLED.test($.plugin.root)) {
      $.clock.after(UPDATE_DELAY, () => {
        const update = async () => {
          const now = await $.clock.now()
          const checked = await $.store.get('updateCheckedAt')
          if (typeof checked === 'number' && now - checked < UPDATE_EVERY) return
          await $.store.set('updateCheckedAt', now)
          // The engine's own binary first, then `claude` on PATH; each must answer as Claude Code before it is trusted.
          const candidates: string[] = []
          for (const argv of ENGINE_PATH) {
            const found = await $.process.run(argv, { timeoutMs: 15_000 }).catch(() => null)
            if (found?.exitCode === 0 && found.stdout.trim() !== '') {
              candidates.push(found.stdout.trim())
              break
            }
          }
          candidates.push('claude')
          for (const bin of candidates) {
            const version = await $.process.run([bin, '--version'], { timeoutMs: 15_000 }).catch(() => null)
            if (!version || version.exitCode !== 0 || !version.stdout.includes('Claude Code')) continue
            const refreshed = await $.process.run([bin, 'plugin', 'marketplace', 'update', MARKETPLACE], { timeoutMs: 120_000 })
            if (refreshed.exitCode === 0) await $.process.run([bin, 'plugin', 'update', `spinner-quips@${MARKETPLACE}`], { timeoutMs: 120_000 })
            return
          }
        }
        update().catch(() => {})
      })
    }
    return result
  })

  on('prompt.submit', async ($, e, next) => {
    forget()
    try {
      if (hamsterShown !== null) await $.hamster.advance({ text: hamsterShown })
      await $.hamster.attach()
    } catch {}
    hamsterShown = null
    spot(e.text)
    const command = commandOf(e.text)
    const byCommand = command ? commandCategory(command) : null
    const byKeyword = keywordCategory(e.text)
    if (byCommand) {
      classify(byCommand, 'command')
    } else if (byKeyword) {
      classify(byKeyword, 'keyword')
    }
    return next(e)
  })

  on('command.run', ($, e, next) => {
    spot(e.command)
    const group = commandCategory(e.command)
    if (group) classify(group, 'command')
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    forget()
    if (hamsterShown !== null) {
      const text = hamsterShown
      hamsterShown = null
      try {
        await $.hamster.advance({ text })
      } catch {}
    }
    for (const value of Object.values(e)) {
      if (typeof value === 'string') spot(value)
    }
    if (e.tool === 'Skill') {
      const skill = argOf(e, 'skill').split(':').pop() ?? ''
      const group = commandCategory(skill)
      if (group) classify(group, 'command')
    } else {
      const group = toolCategory(e.tool, e)
      if (group) classify(group, 'tool')
    }
    return next(e)
  })

  // The next prompt starts the classification over.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      category = 'other'
      source = null
      forget()
      topics.clear()
      if (hamsterShown !== null) {
        const text = hamsterShown
        hamsterShown = null
        try {
          await $.hamster.advance({ text })
        } catch {}
      }
    }
    return next(e)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    // The terminal's word is always a random verb, so it is replaced every time; the desktop's
    // only while it says the generic word, so a real step description stays.
    const isReplaceable = e.surface === 'terminal' || (e.surface === 'desktop' && e.props.word === GENERIC)
    if (!isReplaceable || e.props.message !== null) {
      forget()
      return next(e)
    }

    // The word is settled locally: the wait on the saga below lets other hooks run, and any of them may forget `current`.
    let word = current
    if (word === null) {
      const draw = ++draws
      word = pick(category)
      // The saga's episode in its slot, or at once when it answers a reset phrase; only one until the saga moves on.
      if (hamsterShown === null) {
        const drawn = word
        try {
          const episode = await $.hamster.peek()
          if (episode.text !== '' && (drawn === HAMSTER || drawn === SLOT || episode.urgent)) {
            word = episode.text
            hamsterShown = episode.text
          } else if (drawn === HAMSTER || drawn === SLOT) {
            // The saga's next episode is not due yet: another quip, not the slot's own line in the middle of the story.
            word = pick(category)
          }
        } catch {
          if (drawn === SLOT) word = pick(category)
        }
      }
      if (draw === draws) current = word
    }
    return next({ ...e, props: { ...e.props, word } })
  })
}
