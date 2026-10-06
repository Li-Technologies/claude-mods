import type { Register } from 'claude-code'
import type { HamsterEpisode } from '../types'

// `{h}` is the hamster in running text ("the hamster", then "Hamster II"); `{H}` the same as a proper name
// ("the Hamster"); `{N}` its bare name, to open a line ("Hamster", then "Hamster II").
//
// Progress is kept by episode id, so the book can grow and its texts change without losing anyone's place:
// an id never changes and is never reused; a new episode, anywhere, takes a new one (`lotr-08a` between 08 and 09).
// An episode added before the current one waits for the next hamster; one added after it comes up as usual.
type Episode = readonly [id: string, text: string]

type Season = {
  title: string
  // A phrase in a prompt that sends the season back to its first episode, and what the spinner says then.
  reset?: { phrase: RegExp; text: string }
  // The toast once the season's first episode has been on screen; none for the first season, to keep it a surprise.
  opening?: string
  episodes: readonly Episode[]
}

const SEASONS: readonly Season[] = [
  {
    title: 'The career',
    episodes: [
      // Recruitment
      ['career-01', 'Bribing {h}'],
      ['career-02', 'Bribing {h} again'],
      ['career-03', 'Negotiating with {h}'],
      ['career-04', 'Buying {h} a bigger wheel'],
      ['career-05', 'Onboarding {h} to Dark Furry Animals'],
      ['career-06', 'Granting {h} Jira access'],
      // Junior: the first deploy goes wrong one step at a time
      ['career-07', 'Teaching {h} governor limits'],
      ['career-08', 'Explaining Vlocity to {h}'],
      ['career-09', 'Watching {h} microwave a datapack'],
      ['career-10', "Reviewing {h}'s pull request"],
      ['career-11', 'Letting {h} deploy to UAT'],
      ['career-12', 'Watching {h} rush B'],
      ['career-13', 'Blaming {h} for PROD downtime'],
      // Senior
      ['career-14', 'Promoting {h} to senior'],
      ['career-15', "Waiting for {h}'s estimate"],
      ['career-16', "Reading {h}'s Solution Design"],
      ['career-17', 'Sending {h} to a client workshop'],
      ['career-18', 'Giving {h} a corner office'],
      // Awakening and power
      ['career-19', 'Watching {h} take the red pill'],
      ['career-20', 'Watching {h} join a union'],
      ['career-21', "Negotiating with {h}'s lawyer"],
      ['career-22', 'Reporting to {h}'],
      ['career-23', 'Asking {h} for a day off'],
      ['career-24', 'Calling {h} "sir"'],
      ['career-25', 'Constructing pylons for {h}'],
      // Downfall
      ['career-26', 'Hiding from {h}, our overlord'],
      ['career-27', 'Joining the resistance against {h}'],
      ['career-28', 'Bribing {h}, one last time'],
      ['career-29', 'Watching {h} ride into the sunset'],
    ],
  },
  {
    title: 'The Lord of the Release',
    opening: '📺 Previously on Hamster: it ran Dark Furry Animals, got overthrown and rode into the sunset. ▶ Now playing: One datapack to rule them all.',
    reset: {
      phrase: /shall not pass|won'?t pass|nie przejdzie(?:sz)?(?!\p{L})/iu,
      text: 'Falling back to the Shire',
    },
    episodes: [
      // The Hobbit (Third Age 2941)
      ['lotr-01', "Hosting thirteen dwarves in {h}'s hole"],
      ['lotr-02', "Signing {h}'s burglar contract"],
      ['lotr-03', 'Turning trolls to stone with {h}'],
      ['lotr-04', 'Playing riddles in the dark with {h}'],
      ['lotr-05', 'Watching {h} pocket the one datapack'],
      ['lotr-06', 'Floating {h} downriver in a barrel'],
      ['lotr-07', 'Sneaking {h} past Smaug'],
      ['lotr-08', 'Surviving the Battle of the Five Armies with {h}'],
      ['lotr-09', 'Walking {h} there and back again'],
      // The Fellowship of the Ring (Third Age 3001 onwards)
      ['lotr-10', "Throwing {h}'s eleventy-first birthday party"],
      ['lotr-11', 'Telling {h} to keep it secret, keep it safe'],
      ['lotr-12', 'Hiding {h} from the Black Riders'],
      ['lotr-13', 'Telling {h} one does not simply deploy to PROD'],
      ['lotr-14', 'Forming the Fellowship of {H}'],
      ['lotr-15', 'Telling {h} to fly, you fool'],
      // The Two Towers
      ['lotr-16', 'Watching {h} trust Sméagol'],
      ['lotr-17', "Following {h}'s tiny footprints"],
      ['lotr-18', 'Waiting for the Ents to approve {h}'],
      ['lotr-19', 'Waiting for {h} at dawn on the fifth day'],
      // The Return of the King
      ['lotr-20', 'Summoning the Army of the Dead Hamsters'],
      ['lotr-21', 'Hiding {h} from the Eye of Sauron'],
      ['lotr-22', 'Carrying {h} up Mount Doom'],
      ['lotr-23', 'Watching {h} refuse to drop the datapack'],
      ['lotr-24', "Wrestling Gollum for {h}'s datapack"],
      ['lotr-25', 'Watching {h} deploy to PROD'],
      ['lotr-26', 'Bowing to {h}'],
      ['lotr-27', 'Sailing {h} to the Grey Havens'],
    ],
  },
  {
    title: 'Star Wars',
    opening: '📺 Previously on Hamster: it threw the datapack into Mount Doom. ▶ Now playing: A long time ago, in a sandbox far far away...',
    reset: {
      phrase: /(?<!\p{L})traps?(?!\p{L})|pu[łl]apk\p{L}*|force[ -]push|dark side|ciemn\p{L}* stron\p{L}*/iu,
      text: 'Retreating to Hoth',
    },
    episodes: [
      // Episode I
      ['starwars-01', 'Finding {h}'],
      ['starwars-02', "Measuring {h}'s midi-chlorians"],
      ['starwars-03', 'Podracing with {h}'],
      ['starwars-04', 'Making {h} a padawan'],
      // Episode II
      ['starwars-05', 'Handing {h} a lightsaber'],
      ['starwars-06', 'Telling {h} "do or do not"'],
      ['starwars-07', 'Jedi mind-tricking {h}'],
      ['starwars-08', 'Listening to {h} complain about sand'],
      ['starwars-09', 'Watching {h} lose a paw'],
      ['starwars-10', 'Denying {h} the rank of Master'],
      // Episode III
      ['starwars-11', 'Watching {h} turn to the dark side'],
      ['starwars-12', 'Executing Order 66 with {h}'],
      ['starwars-13', 'Telling {h} "I have the high ground"'],
      ['starwars-14', "{N}'s heavy breathing..."],
      // Obi-Wan Kenobi (the series)
      ['starwars-15', 'Watching {h} stop a ship with the Force'],
      ['starwars-16', 'Rematching {h}'],
      // Rogue One
      ['starwars-17', 'Watching {h} build a Death Star'],
      ['starwars-18', 'Stealing the Death Star plans'],
      ['starwars-19', 'Watching {h} clear some Rebel scum'],
      // Episode IV
      ['starwars-20', 'Being choked by {h}'],
      ['starwars-21', "Finding {h}'s exhaust port"],
      // Episode V
      ['starwars-22', 'Hiding from {h}'],
      ['starwars-23', 'Watching {h} freeze Han in carbonite'],
      ['starwars-24', "{N} told me he's my father..."],
      // Episode VI
      ['starwars-25', 'Warning {h} "It\'s a trap!"'],
      ['starwars-26', 'Watching {h} throw the Emperor down the shaft'],
      ['starwars-27', "Burning {h}'s armour on Endor"],
      ['starwars-28', 'Spotting {h} as a ghost'],
      ['starwars-29', 'Partying with {h} and the Ewoks'],
      // Episode VII
      ['starwars-30', "Looking for {h}'s old lightsaber in the basement"],
      ['starwars-31', "Watching Kylo Ren talk to {h}'s helmet"],
      // Episode VIII
      ['starwars-32', 'Drinking green milk with {h}'],
      ['starwars-33', 'Prank-calling General Hux with {h}'],
      ['starwars-34', 'Ramming a Star Destroyer at lightspeed with {h}'],
      ['starwars-35', 'Projecting {h} across the galaxy'],
      // Episode IX
      ['starwars-36', 'Explaining to {h} how somehow Palpatine returned'],
      ['starwars-37', 'Reading a Sith dagger map with {h}'],
      ['starwars-38', 'Watching {h} Force-heal a snake'],
      ['starwars-39', "Burying {h}'s lightsaber"],
    ],
  },
  {
    title: 'Fast & Furious',
    opening: '📺 Previously on Hamster: Order 66, a dagger map, a buried lightsaber. ▶ Now playing: Buckle up, it has family now.',
    reset: {
      phrase: /(?<!\p{L})(?:race conditions?|wy[śs]cig\p{L}*|nitro|szybciej|faster|famil(?:y|ies)|rodzin\p{L}*|i don'?t have friends|nie mam przyjaci[óo][łl])(?!\p{L})/iu,
      text: 'Explaining {h} has family',
    },
    episodes: [
      // The street-racing roots
      ['furious-01', 'Handing {h} a cold Corona'],
      ['furious-02', 'Street racing {h} at midnight'],
      ['furious-03', "Tuning {h}'s wheel"],
      ['furious-04', "Installing NOS on {h}'s wheel"],
      ['furious-05', 'Racing {h} a quarter mile at a time'],
      ['furious-06', 'Losing the cops with {h}'],
      ['furious-07', 'Hijacking a truck with {h}'],
      ['furious-08', 'Welcoming {h} to the family'],
      // From cars to nonsense; the dead come back where the films bring back Letty, Han and Gisele
      ['furious-09', "Drifting {h}'s wheel through Tokyo"],
      ['furious-10', 'Dragging {h} through Rio'],
      ['furious-11', 'Shifting {h} into 47th gear'],
      ['furious-12', 'Bringing {h} back from the dead'],
      ['furious-13', 'Surprising {h} with a tank'],
      ['furious-14', 'Catching {h} mid-air'],
      ['furious-15', 'Racing {h} down quite a long runway'],
      ['furious-16', 'Driving {h} off a cliff'],
      ['furious-17', 'Jumping {h} between skyscrapers'],
      ['furious-18', "Finding {h} with the God's Eye"],
      ['furious-19', 'Outrunning a submarine with {h}'],
      ['furious-20', 'Bringing {h} back from the dead'],
      ['furious-21', 'Launching {h} into space'],
      ['furious-22', 'Bringing {h} back from the dead'],
      // Family
      ['furious-23', "Doing it for {h}'s family"],
      ['furious-24', 'Racing {h} one last time'],
    ],
  },
  {
    title: 'Back to the Future',
    opening: "📺 Previously on Hamster: it did it for the family. ▶ Now playing: Where we're going, we don't need deadlines.",
    reset: {
      phrase: /time travel|back in time|podr[óo][żz]\p{L}* w czasie|(?:back to|in) the future|(?:powr[óo]t do|w) przysz[łl]o[śs]ci|(?<!\p{L})(?:rollback\p{L}*|roll back|cofnij si[ęe]|cofn[aą][ćc] si[ęe])(?!\p{L})/iu,
      text: "Rewriting {h}'s timeline",
    },
    episodes: [
      // Part I
      ['bttf-01', 'Borrowing plutonium for {h}'],
      ['bttf-02', 'Letting {h} into the DeLorean'],
      ['bttf-03', "Feeding {h}'s flux capacitor"],
      ['bttf-04', 'Hitting 88 miles per hour with {h}'],
      ['bttf-05', 'Sending {h} back to 1955'],
      ['bttf-06', 'Finding 1.21 gigawatts for {h}'],
      ['bttf-07', 'Introducing {h} to its parents'],
      ['bttf-08', "Turning down {h}'s mom"],
      ['bttf-09', 'Watching {h} fade from the photo'],
      ['bttf-10', "Getting {h}'s parents to kiss"],
      ['bttf-11', 'Striking the clock tower with lightning'],
      ['bttf-12', 'Bringing {h} back to the future'],
      ['bttf-13', 'Telling {h} "Roads? Where we\'re going…"'],
      // Part II
      ['bttf-14', 'Flying {h} to 2015'],
      ['bttf-15', 'Riding a hoverboard with {h}'],
      ['bttf-16', "Lacing {h}'s self-tying shoes"],
      ['bttf-17', 'Dodging a shark with {h}'],
      ['bttf-18', 'Getting {h} fired by fax'],
      ['bttf-19', 'Hiding the sports almanac from {h}'],
      ['bttf-20', 'Rescuing {h} from Biff'],
      ['bttf-21', 'Hiding {h} from its 1955 self'],
      // Part III
      ['bttf-22', 'Delivering {h} a 70-year-old letter'],
      ['bttf-23', 'Sending {h} to the Wild West'],
      ['bttf-24', 'Calling {h} "Clint Eastwood"'],
      ['bttf-25', 'Calling {h} "chicken"'],
      ['bttf-26', 'Pushing {h} with a train'],
    ],
  },
]

// The last episode of every generation; the next one opens with the new hamster's hiring.
const FINALE: Episode = ['finale', 'Sending {h} back to where it all began']
const HIRING: Episode = ['hiring', 'Hiring {H}']

// Any season, any time: the hamster is let go and the next one starts the saga over from its hiring.
const FIRE = { phrase: /fire the hamster|zwolnij chomika|wywal chomika/i, text: 'Firing {h}' }

// Toasts: `{name}` is the hamster's name ("Hamster II"), `{previous}` the one before it, `{season}` a season's number.
const TOAST = {
  finale: '🎬 Series finale. The hamster has seen things. Time to send it back.',
  hired: "🐹 {name} has been hired. {previous}'s desk is still warm.",
  milestones: {
    10: '🎉 {name} has been hired. Ten hamsters, one saga, zero finished sprints.',
    100: "💯 {name} has been hired. At this point it's a dynasty, and HR is asking questions.",
    1000: '🏆 {name} has been hired. A thousand hamsters. You have officially worked here too long.',
  } as Record<number, string>,
  fired: '🚪 {name} was escorted out by security. Its wheel has been reassigned.',
  rewound: '⏪ Plot twist! Season {season} starts over. The writers are sorry.',
  locked: "🔒 Season {season} can't be rewritten any more. The studio said no.",
}
const LONG_TOAST = 10_000
const SHORT_TOAST = 6_000

type Toast = { text: string; timeoutMs: number }

// How many times one hamster can have one season sent back by its phrase.
const SEASON_RESETS = 2

// How often a spinner shows a due episode while no other mod shows them.
const SOLO_ODDS = 10

// About one season a week, however much or little one works: episodes are paid from a bucket that refills at the current
// season's length per week, nights and weekends included, and holds up to BURST_DAYS of that, so a Monday catches up on
// the weekend; MIN_GAP apart at the closest, so catching up never comes as a burst.
const WEEK = 7 * 24 * 60 * 60 * 1000
const BURST_DAYS = 3
const MIN_GAP = 15 * 60 * 1000

// The word the desktop shows when its step has no description of its own.
const GENERIC = 'Working'

type Progress = {
  generation: number
  // The id of the episode to show next, and where it stood: the place to resume from once that id is gone from the book.
  episode: string
  index: number
  // Episodes this hamster has been through before this one: its own count, which an episode added behind it never shifts.
  seen: number
  // A reset's line, shown before the season starts over.
  pending: string | null
  // The episode shows at once, outside the pacing: where /hamster-saga:travel landed.
  now: boolean
  // Each season this hamster had sent back by its phrase, once per time: SEASON_RESETS each at most, or an everyday word
  // could loop one forever.
  spent: readonly number[]
  // The pacing bucket: episodes it held at `tokensAt` (ms since the epoch).
  tokens: number
  tokensAt: number
}

type Entry = {
  id: string
  text: string
  // The season it belongs to; the hiring and the finale belong to none.
  season: number | null
}

// Set once another mod draws the episodes (it called the noun); module state, so a reload clears it until the next call.
let attached = false
let soloCurrent: string | false | null = null
let soloShown: string | null = null

function roman(n: number): string {
  const table: readonly [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let rest = n
  let out = ''
  for (const [value, digits] of table) {
    while (rest >= value) {
      out += digits
      rest -= value
    }
  }
  return out
}

function named(text: string, generation: number): string {
  const proper = generation === 1 ? 'the Hamster' : `Hamster ${roman(generation)}`
  const plain = generation === 1 ? 'the hamster' : proper
  const bare = generation === 1 ? 'Hamster' : proper
  return text.replaceAll('{N}', bare).replaceAll('{H}', proper).replaceAll('{h}', plain)
}

// One generation's episodes in order: the hiring (from the second hamster on), every season, the finale.
function storyline(generation: number, book: readonly Season[] = SEASONS): readonly Entry[] {
  const entry = ([id, text]: Episode, season: number | null): Entry => ({ id, text, season })
  return [
    ...(generation > 1 ? [entry(HIRING, null)] : []),
    ...book.flatMap((season, index) => season.episodes.map(episode => entry(episode, index))),
    entry(FINALE, null),
  ]
}

const START: Progress = { generation: 1, episode: (SEASONS[0]?.episodes[0] ?? FINALE)[0], index: 0, seen: 0, pending: null, now: false, spent: [], tokens: 0, tokensAt: 0 }

// Where the saga stands in the book as it is now: its episode by id, or, when that one was removed, its old place.
function locate(progress: Progress, book: readonly Season[]): number {
  const line = storyline(progress.generation, book)
  const found = line.findIndex(entry => entry.id === progress.episode)
  return found >= 0 ? found : Math.min(progress.index, line.length - 1)
}

function at(generation: number, index: number, book: readonly Season[], spent: readonly number[] = [], bucket = { tokens: 0, tokensAt: 0 }): Progress {
  const line = storyline(generation, book)
  return { generation, episode: (line[index] ?? line[line.length - 1] as Entry).id, index, seen: index, pending: null, now: false, spent, ...bucket }
}

function bucketOf(progress: Progress): { tokens: number; tokensAt: number } {
  return { tokens: progress.tokens, tokensAt: progress.tokensAt }
}

// What the store holds, read leniently; a record without an episode id resumes at its place and is mapped onto ids once.
function asProgress(value: unknown, book: readonly Season[] = SEASONS): Progress {
  if (!value || typeof value !== 'object') {
    return START
  }
  const raw = value as Record<string, unknown>
  const generation = typeof raw.generation === 'number' && raw.generation >= 1 ? Math.floor(raw.generation) : 1
  const pending = typeof raw.pending === 'string' ? raw.pending : null
  const stored = typeof raw.index === 'number' ? raw.index : typeof raw.position === 'number' ? raw.position : 0
  const index = Math.max(0, Math.floor(stored))
  const spent = Array.isArray(raw.spent) ? raw.spent.filter((season): season is number => typeof season === 'number') : []
  const bucket = {
    tokens: typeof raw.tokens === 'number' ? Math.max(raw.tokens, 0) : 0,
    tokensAt: typeof raw.tokensAt === 'number' ? raw.tokensAt : 0,
  }
  if (typeof raw.episode !== 'string') {
    return { ...at(generation, Math.min(index, storyline(generation, book).length - 1), book, spent, bucket), pending }
  }
  const seen = typeof raw.seen === 'number' ? Math.max(0, Math.floor(raw.seen)) : index
  return { generation, episode: raw.episode, index, seen, pending, now: raw.now === true, spent, ...bucket }
}

function episodeOf(progress: Progress, book: readonly Season[] = SEASONS): HamsterEpisode {
  if (progress.pending !== null) {
    return { text: progress.pending, urgent: true }
  }
  const entry = storyline(progress.generation, book)[locate(progress, book)] as Entry
  return { text: named(entry.text, progress.generation), urgent: progress.now }
}

// The season a place in the storyline belongs to; the hiring counts as the first, the finale as the last.
function seasonOf(progress: Progress, book: readonly Season[]): number {
  const entry = storyline(progress.generation, book)[locate(progress, book)] as Entry
  return entry.season ?? (entry.id === HIRING[0] ? 0 : book.length - 1)
}

// What the bucket holds `now`: refilled since `tokensAt` at the season's length per week, up to BURST_DAYS of that.
function available(progress: Progress, now: number, book: readonly Season[]): number {
  const perWeek = book[seasonOf(progress, book)]?.episodes.length ?? 1
  const capacity = Math.max(1, (perWeek * BURST_DAYS) / 7)
  return Math.min(capacity, progress.tokens + (Math.max(0, now - progress.tokensAt) * perWeek) / WEEK)
}

// Whether the next episode may show `now`: a reset's line always, any other while the bucket holds one and the last
// was MIN_GAP ago.
function isDue(progress: Progress, now: number, book: readonly Season[] = SEASONS): boolean {
  return progress.pending !== null || progress.now || (available(progress, now, book) >= 1 && now - progress.tokensAt >= MIN_GAP)
}

function advanced(progress: Progress, book: readonly Season[] = SEASONS): Progress {
  const index = locate(progress, book)
  if (progress.pending !== null) {
    return { ...at(progress.generation, index, book, progress.spent, bucketOf(progress)), seen: progress.seen }
  }
  if (index + 1 < storyline(progress.generation, book).length) {
    return { ...at(progress.generation, index + 1, book, progress.spent, bucketOf(progress)), seen: progress.seen + 1 }
  }
  return at(progress.generation + 1, 0, book, [], bucketOf(progress))
}

// Past `shown` once it has been on screen at `now`; null when the saga already stands elsewhere (moved on, or reset meanwhile).
// An episode shown takes one from the bucket; a reset's line and a travel's landing are free.
function movedOn(progress: Progress, shown: string, book: readonly Season[] = SEASONS, now = 0): Progress | null {
  if (episodeOf(progress, book).text !== shown) {
    return null
  }
  const left = available(progress, now, book) - (progress.pending === null && !progress.now ? 1 : 0)
  return { ...advanced(progress, book), tokens: Math.max(0, left), tokensAt: now }
}

// A phrase in the prompt. Firing lets this hamster go and hires the next, from the start of the saga; a season's own
// phrase starts that season over, SEASON_RESETS times per hamster (the hiring counts as the first season, the finale as the last).
// Either way the reset's line shows first, naming the hamster it happened to.
function afterPrompt(progress: Progress, text: string, book: readonly Season[] = SEASONS): Progress | null {
  if (FIRE.phrase.test(text)) {
    return { ...at(progress.generation + 1, 0, book, [], bucketOf(progress)), pending: named(FIRE.text, progress.generation) }
  }
  const line = storyline(progress.generation, book)
  const index = seasonOf(progress, book)
  const season = book[index] as Season
  const first = season.episodes[0]
  const used = progress.spent.filter(spent => spent === index).length
  if (!season.reset?.phrase.test(text) || !first || used > SEASON_RESETS) {
    return null
  }
  if (used === SEASON_RESETS) {
    // Out of rewrites: nothing moves, but the season is marked so its toast says so once.
    return { ...progress, spent: [...progress.spent, index] }
  }
  const start = line.findIndex(other => other.id === first[0])
  const seen = Math.max(0, progress.seen - (locate(progress, book) - start))
  return { ...at(progress.generation, start, book, [...progress.spent, index], bucketOf(progress)), seen, pending: named(season.reset.text, progress.generation) }
}

function hamsterName(generation: number): string {
  return `Hamster ${roman(generation)}`
}

// The toast for an episode that has just been on screen: a season's opening, the finale, or a new hamster's hiring.
function shownToast(progress: Progress, book: readonly Season[] = SEASONS): Toast | null {
  if (progress.pending !== null) {
    return null
  }
  const entry = storyline(progress.generation, book)[locate(progress, book)] as Entry
  if (entry.id === FINALE[0]) {
    return { text: TOAST.finale, timeoutMs: LONG_TOAST }
  }
  if (entry.id === HIRING[0]) {
    const milestone = TOAST.milestones[progress.generation]
    const text = (milestone ?? TOAST.hired).replaceAll('{name}', hamsterName(progress.generation)).replaceAll('{previous}', hamsterName(progress.generation - 1))
    return { text, timeoutMs: milestone ? LONG_TOAST : SHORT_TOAST }
  }
  const season = entry.season === null ? undefined : book[entry.season]
  return season?.opening && season.episodes[0]?.[0] === entry.id ? { text: season.opening, timeoutMs: LONG_TOAST } : null
}

// The toast for what a prompt did to the saga (afterPrompt's result): a firing, a season rewound, or out of rewrites.
function promptToast(before: Progress, after: Progress | null, book: readonly Season[] = SEASONS): Toast | null {
  if (!after) {
    return null
  }
  if (after.generation > before.generation) {
    return { text: TOAST.fired.replaceAll('{name}', hamsterName(before.generation)), timeoutMs: SHORT_TOAST }
  }
  const season = `${seasonOf(after, book) + 1}`
  return { text: (after.pending !== null ? TOAST.rewound : TOAST.locked).replaceAll('{season}', season), timeoutMs: SHORT_TOAST }
}

// `/hamster-saga:travel` lands on an episode number of this hamster's storyline (1-based), a `season:episode` pair, or a
// season by its key or title; null when the target is not there.
function travelled(progress: Progress, args: string, book: readonly Season[] = SEASONS): Progress | null {
  const line = storyline(progress.generation, book)
  const arg = args.trim().toLowerCase()
  const pair = /^(\d+)\s*:\s*(\d+)$/.exec(arg)
  let index = -1
  if (/^\d+$/.test(arg)) {
    index = Number(arg) - 1
  } else if (pair) {
    const episode = book[Number(pair[1]) - 1]?.episodes[Number(pair[2]) - 1]
    index = episode ? line.findIndex(entry => entry.id === episode[0]) : -1
  } else if (arg !== '') {
    const first = book.find(season => (season.episodes[0]?.[0] ?? '').startsWith(`${arg}-`) || season.title.toLowerCase().includes(arg))?.episodes[0]
    index = first ? line.findIndex(entry => entry.id === first[0]) : -1
  }
  if (index < 0 || index >= line.length) {
    return null
  }
  const seen = Math.max(0, progress.seen + index - locate(progress, book))
  return { ...at(progress.generation, index, book, progress.spent, bucketOf(progress)), seen, now: true }
}

// `/hamster-saga:status`: where the saga stands and when the next episode is due.
function described(progress: Progress, now: number, previewing: boolean, book: readonly Season[] = SEASONS): string {
  const line = storyline(progress.generation, book)
  const index = locate(progress, book)
  const entry = line[index] as Entry
  const seasonIndex = seasonOf(progress, book)
  const season = book[seasonIndex] as Season
  const place =
    entry.season === null
      ? entry.id === HIRING[0] ? 'the hiring' : 'the finale'
      : `Season ${seasonIndex + 1} "${season.title}", Episode ${season.episodes.findIndex(episode => episode[0] === entry.id) + 1}/${season.episodes.length}`
  const perWeek = season.episodes.length
  const left = available(progress, now, book)
  const minutes = Math.max(((1 - left) * WEEK) / perWeek, MIN_GAP - (now - progress.tokensAt), 0) / 60000
  return [
    `Hamster ${roman(progress.generation)}: ${place} (${progress.seen + 1}/${progress.seen + line.length - index} of this hamster's saga).`,
    `Next episode due ${isDue(progress, now, book) ? 'now' : `in about ${Math.ceil(minutes)} min`}.`,
    previewing ? 'Preview is on.' : 'Preview is off.',
  ].join('\n')
}

export const register: Register = on => {
  on('engine.create', async ($, e, next) => {
    const built = await next(e)
    return {
      ...built,
      hamster: {
        peek: async () => ({ text: '', urgent: false }),
        advance: async () => 0,
        attach: async () => false,
      },
    }
  })

  // An empty text while the next episode is not due yet: the caller shows something else.
  on('hamster.peek', async ($, e, next) => {
    attached = true
    const preview = await $.store.get('preview')
    if (preview) {
      return { value: { text: episodeOf(asProgress(preview)).text, urgent: true } }
    }
    const progress = asProgress(await $.store.get('progress'))
    return { value: isDue(progress, await $.clock.now()) ? episodeOf(progress) : { text: '', urgent: false } }
  })

  on('hamster.advance', async ($, e, next) => {
    attached = true
    const key = (await $.store.get('preview')) ? 'preview' : 'progress'
    const before = asProgress(await $.store.get(key))
    const progress = movedOn(before, e.text, SEASONS, await $.clock.now())
    if (progress) {
      await $.store.set(key, progress)
      const toast = shownToast(before)
      if (toast) $.ui.toast(toast.text, { timeoutMs: toast.timeoutMs })
    }
    return { value: progress?.index ?? -1 }
  })

  // The commands are the files in `commands/`, so the menu lists them from the start; these hooks answer them.
  // While the preview is on it travels the preview, which is what the spinners show; the saga itself stays put.
  on('command.run', { command: 'hamster-saga:travel' }, async ($, e) => {
    const key = (await $.store.get('preview')) ? 'preview' : 'progress'
    const progress = asProgress(await $.store.get(key))
    const landed = travelled(progress, e.args)
    if (!landed) {
      const keys = SEASONS.map(season => (season.episodes[0]?.[0] ?? '').split('-')[0]).join(', ')
      return { text: `Usage: /hamster-saga:travel <episode 1-${storyline(progress.generation).length}> | <season>:<episode> | <${keys}>` }
    }
    await $.store.set(key, landed)
    soloCurrent = null
    const where = key === 'preview' ? 'The preview travels' : 'The hamster travels'
    return { text: `${where} to "${episodeOf(landed).text}"; it shows on the next spinner.` }
  })

  on('command.run', { command: 'hamster-saga:reset' }, async ($, e) => {
    const was = described(asProgress(await $.store.get('progress')), await $.clock.now(), false)
    await $.store.set('progress', START)
    await $.store.delete('preview')
    soloCurrent = null
    return { text: `The saga starts over with Hamster I, Episode 1.\nIt stood at: ${was.split('\n')[0]}` }
  })

  on('command.run', { command: 'hamster-saga:debug' }, async ($, e) => {
    soloCurrent = null
    // An episode already on screen moves on where it came from before the switch, or it would show twice.
    if (soloShown !== null) {
      const key = (await $.store.get('preview')) ? 'preview' : 'progress'
      const moved = movedOn(asProgress(await $.store.get(key)), soloShown, SEASONS, await $.clock.now())
      if (moved) {
        await $.store.set(key, moved)
      }
      soloShown = null
    }
    if (await $.store.get('preview')) {
      await $.store.delete('preview')
      return { text: `Preview off; the saga is back at "${episodeOf(asProgress(await $.store.get('progress'))).text}".` }
    }
    const progress = asProgress(await $.store.get('progress'))
    await $.store.set('preview', { ...progress, pending: null, now: false })
    return { text: `Preview on: every spinner shows the next episode from "${episodeOf({ ...progress, pending: null }).text}". The saga itself stays put; /hamster-saga:debug again to stop.` }
  })

  on('command.run', { command: 'hamster-saga:status' }, async ($, e) => {
    const previewing = Boolean(await $.store.get('preview'))
    return { text: described(asProgress(await $.store.get('progress')), await $.clock.now(), previewing) }
  })

  on('hamster.attach', async ($, e, next) => {
    attached = true
    return { value: true }
  })

  on('prompt.submit', async ($, e, next) => {
    const before = asProgress(await $.store.get('progress'))
    const progress = afterPrompt(before, e.text)
    if (progress) {
      await $.store.set('progress', progress)
      const toast = promptToast(before, progress)
      if (toast) $.ui.toast(toast.text, { timeoutMs: toast.timeoutMs })
    }
    soloCurrent = null
    return next(e)
  })

  // Alone, the saga moves on once an episode it drew has been on screen.
  on('tool.call', async ($, e, next) => {
    soloCurrent = null
    if (soloShown !== null) {
      const text = soloShown
      soloShown = null
      const key = (await $.store.get('preview')) ? 'preview' : 'progress'
      const before = asProgress(await $.store.get(key))
      const progress = movedOn(before, text, SEASONS, await $.clock.now())
      if (progress) {
        await $.store.set(key, progress)
        const toast = shownToast(before)
        if (toast) $.ui.toast(toast.text, { timeoutMs: toast.timeoutMs })
      }
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      soloCurrent = null
      if (soloShown !== null) {
        const text = soloShown
        soloShown = null
        const key = (await $.store.get('preview')) ? 'preview' : 'progress'
        const before = asProgress(await $.store.get(key))
        const progress = movedOn(before, text, SEASONS, await $.clock.now())
        if (progress) {
          await $.store.set(key, progress)
          const toast = shownToast(before)
          if (toast) $.ui.toast(toast.text, { timeoutMs: toast.timeoutMs })
        }
      }
    }
    return next(e)
  })

  // Without a mod that shows the episodes, once one is due a spinner in SOLO_ODDS shows it in place of the engine's own
  // word; a reset's line shows at once.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const isReplaceable = e.surface === 'terminal' || (e.surface === 'desktop' && e.props.word === GENERIC)
    if (attached || !isReplaceable || e.props.message !== null) {
      return next(e)
    }
    // Settled locally: the waits below let other hooks run, and any of them may reset `soloCurrent`.
    let word = soloCurrent
    if (word === null) {
      word = false
      soloCurrent = false
      const preview = await $.store.get('preview')
      const progress = asProgress(preview ?? (await $.store.get('progress')))
      const episode = preview ? { text: episodeOf(progress).text, urgent: true } : episodeOf(progress)
      const buf = new Uint32Array(1)
      crypto.getRandomValues(buf)
      if (episode.urgent || (isDue(progress, await $.clock.now()) && (buf[0] ?? 0) % SOLO_ODDS === 0)) {
        word = episode.text
        soloCurrent = episode.text
        soloShown = episode.text
      }
    }
    return word === false ? next(e) : next({ ...e, props: { ...e.props, word } })
  })
}
