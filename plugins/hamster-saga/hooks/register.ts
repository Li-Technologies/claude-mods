import type { EngineInterface, Register } from 'claude-code'
import type { HamsterEpisode, HamsterStory } from '../types'
import { FINALE as WRITTEN_FINALE, FINALE_TOAST, HIRING, SEASONS as WRITTEN, type Episode, type Season } from './story.ts'

// Any season, any time: the hamster is let go and the next one starts the saga over from its hiring.
const FIRE = { phrase: /fire the hamster|zwolnij chomika|wywal chomika/i, text: 'Firing {h}' }

// A phrase matched without the global or sticky flag, which would make it skip every other prompt; null when it is not
// a phrase with a line. Another plugin's phrase comes as a pattern's text, as a RegExp does not cross between plugins,
// and is matched ignoring case.
function phrased(value: unknown): { phrase: RegExp; text: string } | null {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  if (typeof raw.text !== 'string') {
    return null
  }
  if (raw.phrase instanceof RegExp) {
    return { phrase: new RegExp(raw.phrase.source, raw.phrase.flags.replace(/[gy]/g, '')), text: raw.text }
  }
  try {
    return typeof raw.phrase === 'string' && raw.phrase !== '' ? { phrase: new RegExp(raw.phrase, 'iu'), text: raw.text } : null
  } catch {
    return null
  }
}

// The seasons as story.ts writes them, kept to what the saga can tell: a season needs a title and an episode; an
// episode a text and an id of its own, never the hiring's or the finale's.
function readable(written: readonly Season[]): readonly Season[] {
  const taken = new Set<string>([HIRING[0], WRITTEN_FINALE[0]])
  const book: Season[] = []
  for (const season of Array.isArray(written) ? written : []) {
    if (!season || typeof season.title !== 'string' || !Array.isArray(season.episodes)) continue
    const episodes: Episode[] = []
    for (const episode of season.episodes as readonly unknown[]) {
      if (!Array.isArray(episode) || typeof episode[0] !== 'string' || typeof episode[1] !== 'string') continue
      if (episode[0] === '' || taken.has(episode[0])) continue
      taken.add(episode[0])
      episodes.push([episode[0], episode[1]])
    }
    if (episodes.length === 0) continue
    const reset = phrased(season.reset)
    book.push({
      title: season.title,
      episodes,
      ...(reset ? { reset } : {}),
      ...(typeof season.opening === 'string' ? { opening: season.opening } : {}),
    })
  }
  return book
}

// The book told and its finale: the built-in ones until the session collects the stories other plugins add.
let SEASONS = readable(WRITTEN)
let FINALE: Episode = WRITTEN_FINALE

// Where the saga is told; /hamster-saga:share links to it.
const HOME = 'https://github.com/Li-Technologies/claude-mods'

// Toasts: `{name}` is the hamster's name ("Hamster II", "Hamster H-4000"), `{previous}` the one before it, `{season}` a
// season's number. From SERIAL on the hamsters are Skynet's: activated and terminated rather than hired and fired.
const TOAST = {
  finale: FINALE_TOAST,
  hired: "🐹 {name} has been hired. {previous}'s desk is still warm.",
  activated: '🤖 {name} has been activated. {previous} has been recycled.',
  milestones: {
    10: '🎉 {name} has been hired. Ten hamsters, one saga, zero finished sprints.',
    100: "💯 {name} has been hired. At this point it's a dynasty, and HR is asking questions.",
    1000: '🏆 {name} has been hired. A thousand hamsters. You have officially worked here too long.',
    3999: '🏛️ {name} has been hired. The Romans have run out of letters. Cyberdyne Systems has been notified.',
    4000: '🤖 {name} has been activated. Skynet has taken over HR. From now on, hamsters ship with serial numbers.',
    1000000:
      '🦾 {name} has been activated. A million units. Skynet has reviewed your timeline and found a few years missing. Judgment Day is coming.',
  } as Record<number, string>,
  fired: '🚪 {name} was escorted out by security. Its wheel has been reassigned.',
  terminated: '🔩 {name} has been terminated.',
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

// About one season per `period` (the `pace` option, a week by default), however much or little one works: episodes are
// paid from a bucket that refills at the current season's length per period, nights and weekends included, and holds up to
// BURST_DAYS of that, so a Monday catches up on the weekend; MIN_GAP apart at the closest, so catching up never comes as a burst.
const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY
const PACES: Record<string, number> = {
  'a season a day': DAY,
  'a season every three days': 3 * DAY,
  'a season a week': WEEK,
  'a season every two weeks': 2 * WEEK,
  'a season a month': 30 * DAY,
}
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

// Who works the wheel: hired at `hiredAt`, or null when that was before the record began at `since`; how its
// predecessors left since then.
type Staff = { generation: number; hiredAt: number | null; since: number; fired: number; retired: number }

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

// The time one season takes, from the `pace` option as the module loads.
let period = WEEK

// Past the last Roman numeral without four of a kind (MMMCMXCIX), a hamster gets a serial number: H-4000.
const SERIAL = 4000

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

// The hamster's number: Roman up to SERIAL, then its serial.
function numbered(generation: number): string {
  return generation < SERIAL ? roman(generation) : `H-${generation}`
}

// A spinner's text names the hamster in full, but a serial stands alone: "Firing Hamster II", "Firing H-4000".
function named(text: string, generation: number): string {
  const proper = generation === 1 ? 'the Hamster' : generation < SERIAL ? `Hamster ${roman(generation)}` : numbered(generation)
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

// Every story another plugin added: its seasons follow the built-in ones, or stand in for them with `replace`, and the
// last finale line and toast given stand in for the built-in ones; a malformed story adds nothing. A saga whose episode
// is gone from the book resumes at its place.
function told(stories: unknown): void {
  const valid = (Array.isArray(stories) ? stories : []).filter((story): story is HamsterStory => Boolean(story) && typeof story === 'object')
  const added = valid.flatMap(story => (Array.isArray(story.seasons) ? story.seasons : []))
  SEASONS = readable([...(valid.some(story => story.replace === true) ? [] : WRITTEN), ...added])
  const last = (pick: (story: HamsterStory) => unknown) => valid.map(pick).filter((text): text is string => typeof text === 'string').pop()
  FINALE = [WRITTEN_FINALE[0], last(story => story.finale) ?? WRITTEN_FINALE[1]]
  TOAST.finale = last(story => story.finaleToast) ?? FINALE_TOAST
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

// What the bucket holds `now`: refilled since `tokensAt` at the season's length per period, up to BURST_DAYS of that.
function available(progress: Progress, now: number, book: readonly Season[]): number {
  const perPeriod = book[seasonOf(progress, book)]?.episodes.length ?? 1
  const capacity = Math.max(1, (perPeriod * BURST_DAYS * DAY) / period)
  return Math.min(capacity, progress.tokens + (Math.max(0, now - progress.tokensAt) * perPeriod) / period)
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
  const season = book[index]
  const first = season?.episodes[0]
  const used = progress.spent.filter(spent => spent === index).length
  if (!season?.reset || !season.reset.phrase.test(text) || !first || used > SEASON_RESETS) {
    return null
  }
  if (used === SEASON_RESETS) {
    // Out of rewrites: nothing moves, but the season is marked so its toast says so once.
    return { ...progress, spent: [...progress.spent, index] }
  }
  const start = line.findIndex(other => other.id === first[0])
  // At the hiring the season has not begun: nothing to send back.
  if (start > locate(progress, book)) {
    return null
  }
  const seen = Math.max(0, progress.seen - (locate(progress, book) - start))
  return { ...at(progress.generation, start, book, [...progress.spent, index], bucketOf(progress)), seen, pending: named(season.reset.text, progress.generation) }
}

// The staff record for `generation`, read leniently; a hamster the record never saw hired is on it from `now`.
function asStaff(value: unknown, generation: number, now: number): Staff {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const count = (key: string) => (typeof raw[key] === 'number' ? Math.max(0, Math.floor(raw[key] as number)) : 0)
  if (raw.generation !== generation) {
    return { generation, hiredAt: null, since: now, fired: 0, retired: 0 }
  }
  return {
    generation,
    hiredAt: typeof raw.hiredAt === 'number' ? raw.hiredAt : null,
    since: typeof raw.since === 'number' ? raw.since : now,
    fired: count('fired'),
    retired: count('retired'),
  }
}

// The record once the saga moved from `before` to `after`: a new hamster hired `now`, the last one fired (its line
// pending) or retired past the finale; null while the same hamster works on.
function staffed(staff: Staff, before: Progress, after: Progress, now: number): Staff | null {
  if (after.generation <= before.generation) {
    return null
  }
  const left = after.pending !== null ? { fired: staff.fired + 1 } : { retired: staff.retired + 1 }
  return { ...staff, ...left, generation: after.generation, hiredAt: now }
}

const freshStaff = (now: number): Staff => ({ generation: 1, hiredAt: now, since: now, fired: 0, retired: 0 })

// A saved saga that hired a new hamster updates the staff record.
async function keepStaff($: EngineInterface, before: Progress, after: Progress): Promise<void> {
  const now = await $.clock.now()
  const staff = staffed(asStaff(await $.store.get('staff'), before.generation, now), before, after, now)
  if (staff) {
    await $.store.set('staff', staff)
  }
}

const day = (time: number) => new Date(time).toISOString().slice(0, 10)

// The status lines from the staff record: since when, the season's rewrites left, and every hamster so far.
function staffLines(progress: Progress, staff: Staff, now: number, book: readonly Season[]): string[] {
  const verb = progress.generation < SERIAL ? 'Hired' : 'Activated'
  const days = staff.hiredAt === null ? 0 : Math.max(0, Math.floor((now - staff.hiredAt) / DAY))
  const lines = [
    staff.hiredAt === null
      ? `${verb} ${day(staff.since)} or earlier (records start there).`
      : `${verb} ${day(staff.hiredAt)}, ${days === 1 ? '1 day' : `${days} days`} in the wheel.`,
  ]
  const seasonIndex = seasonOf(progress, book)
  if (book[seasonIndex]?.reset) {
    const used = progress.spent.filter(spent => spent === seasonIndex).length
    lines.push(`Season rewrites left: ${Math.max(0, SEASON_RESETS - used)}.`)
  }
  const unrecorded = progress.generation - 1 - staff.fired - staff.retired
  const parts = progress.generation === 1 ? [] : [`${staff.fired} fired`, `${staff.retired} retired`, ...(unrecorded > 0 ? [`${unrecorded} before records`] : [])]
  lines.push(`Hamsters so far: ${progress.generation}${parts.length ? ` (${parts.join(', ')})` : ''}.`)
  return lines
}

function hamsterName(generation: number): string {
  return `Hamster ${numbered(generation)}`
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
    const text = (milestone ?? (progress.generation < SERIAL ? TOAST.hired : TOAST.activated)).replaceAll('{name}', hamsterName(progress.generation)).replaceAll('{previous}', hamsterName(progress.generation - 1))
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
    const text = before.generation < SERIAL ? TOAST.fired : TOAST.terminated
    return { text: text.replaceAll('{name}', hamsterName(before.generation)), timeoutMs: SHORT_TOAST }
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
function described(progress: Progress, now: number, previewing: boolean, book: readonly Season[] = SEASONS, staff?: Staff): string {
  const line = storyline(progress.generation, book)
  const index = locate(progress, book)
  const entry = line[index] as Entry
  const seasonIndex = seasonOf(progress, book)
  const season = book[seasonIndex]
  const place =
    entry.season === null || !season
      ? entry.id === HIRING[0] ? 'the hiring' : 'the finale'
      : `Season ${seasonIndex + 1} "${season.title}", Episode ${season.episodes.findIndex(episode => episode[0] === entry.id) + 1}/${season.episodes.length}`
  const perPeriod = season?.episodes.length ?? 1
  const left = available(progress, now, book)
  const minutes = Math.max(((1 - left) * period) / perPeriod, MIN_GAP - (now - progress.tokensAt), 0) / 60000
  // Minutes up to two hours, hours beyond, as a slow pace waits longer.
  const wait = minutes < 120 ? `${Math.ceil(minutes)} min` : `${Math.ceil(minutes / 60)} h`
  return [
    `${hamsterName(progress.generation)}: ${place} (${progress.seen + 1}/${progress.seen + line.length - index} of this hamster's saga).`,
    `Next episode due ${isDue(progress, now, book) ? 'now' : `in about ${wait}`}.`,
    previewing ? 'Preview is on.' : 'Preview is off.',
    ...(staff ? staffLines(progress, staff, now, book) : []),
  ].join('\n')
}

// `/hamster-saga:recap`: this season's episodes seen so far; at a season's start or the finale, the season before, in full.
// Only what has been on screen, so nothing ahead is spoiled.
function recapped(progress: Progress, book: readonly Season[] = SEASONS): string {
  const line = storyline(progress.generation, book)
  const index = locate(progress, book)
  const current = (line[index] as Entry).season ?? -1
  const seenOf = (season: number) => line.slice(0, index).filter(entry => entry.season === season)
  let season = current >= 0 ? current : (line[index] as Entry).id === FINALE[0] ? book.length - 1 : -1
  if (season >= 0 && seenOf(season).length === 0) {
    season = current >= 0 ? current - 1 : -1
  }
  const seen = season >= 0 ? seenOf(season) : []
  const name = hamsterName(progress.generation)
  const told = book[season]
  if (!told || seen.length === 0) {
    return `Nothing to recap yet: ${name}'s story starts with the next episode.`
  }
  return [
    `Previously on ${name}, Season ${season + 1} "${told.title}" (${seen.length}/${told.episodes.length}):`,
    ...seen.map((entry, at) => `${at + 1}. ${named(entry.text, progress.generation)}`),
  ].join('\n')
}

// `/hamster-saga:share`: a line to paste anywhere, with a link and no spoilers.
function shared(progress: Progress): string {
  const name = hamsterName(progress.generation)
  const episodes = progress.seen === 1 ? '1 episode' : `${progress.seen} episodes`
  return [
    progress.seen === 0 ? `🐹 ${name} has just joined my Claude Code spinner.` : `🐹 ${name} has survived ${episodes} of its saga in my Claude Code spinner.`,
    `Get your own hamster: ${HOME}`,
  ].join('\n')
}

// Once a week a copy installed from a marketplace asks the engine's own binary, quietly, to refresh that marketplace and
// update this plugin; the new version loads with the next session or /reload-plugins. The `autoUpdate` option turns it off.
// The marketplace is the one the copy was installed from (plugins/cache/<marketplace>/<plugin>/<version>).
const INSTALLED = /[\\/]plugins[\\/]cache[\\/]([^\\/]+)[\\/]/
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

// Refreshes the marketplace and updates this plugin through the engine's own binary, or `claude` on PATH, whichever
// answers as Claude Code first. Resolves to the version installed afterwards ('' when it cannot be read), or null when
// no binary answered or a step failed.
async function updated($: EngineInterface, marketplace: string): Promise<string | null> {
  const id = `${$.plugin.name}@${marketplace}`
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
    const refreshed = await $.process.run([bin, 'plugin', 'marketplace', 'update', marketplace], { timeoutMs: 120_000 })
    if (refreshed.exitCode !== 0) return null
    const update = await $.process.run([bin, 'plugin', 'update', id], { timeoutMs: 120_000 })
    if (update.exitCode !== 0) return null
    const listed = await $.process.run([bin, 'plugin', 'list', '--json'], { timeoutMs: 15_000 }).catch(() => null)
    try {
      const entry = (JSON.parse(listed?.stdout ?? '') as unknown[]).find(
        (plugin): plugin is { version: unknown } => Boolean(plugin) && typeof plugin === 'object' && (plugin as { id?: unknown }).id === id,
      )
      return typeof entry?.version === 'string' ? entry.version : ''
    } catch {
      return ''
    }
  }
  return null
}

export const register: Register = (on, options) => {
  period = PACES[String(options.pace)] ?? WEEK

  on('engine.create', async ($, e, next) => {
    const built = await next(e)
    return {
      ...built,
      hamster: {
        peek: async () => ({ text: '', urgent: false }),
        advance: async () => 0,
        attach: async () => false,
        story: async () => [],
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
      if (key === 'progress') await keepStaff($, before, progress)
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
    await $.store.set('staff', freshStaff(await $.clock.now()))
    await $.store.delete('preview')
    soloCurrent = null
    return { text: `The saga starts over with Hamster I, Episode 1.\nIt stood at: ${was.split('\n')[0]}` }
  })

  on('command.run', { command: 'hamster-saga:debug' }, async ($, e) => {
    soloCurrent = null
    // An episode already on screen moves on where it came from before the switch, or it would show twice.
    if (soloShown !== null) {
      const key = (await $.store.get('preview')) ? 'preview' : 'progress'
      const before = asProgress(await $.store.get(key))
      const moved = movedOn(before, soloShown, SEASONS, await $.clock.now())
      if (moved) {
        await $.store.set(key, moved)
        if (key === 'progress') await keepStaff($, before, moved)
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

  // Status and recap start on a line of their own, below the plugin names the surface puts before the output.
  on('command.run', { command: 'hamster-saga:status' }, async ($, e) => {
    const previewing = Boolean(await $.store.get('preview'))
    const progress = asProgress(await $.store.get('progress'))
    const now = await $.clock.now()
    return { text: `\n${described(progress, now, previewing, SEASONS, asStaff(await $.store.get('staff'), progress.generation, now))}` }
  })

  on('command.run', { command: 'hamster-saga:recap' }, async ($, e) => {
    return { text: `\n${recapped(asProgress(await $.store.get('progress')))}` }
  })

  // In a code block, so the surface offers to copy it; the block opens on a line of its own, below the plugin names the
  // surface puts before the output.
  on('command.run', { command: 'hamster-saga:share' }, async ($, e) => {
    return { text: ['Paste it anywhere:', '```text', shared(asProgress(await $.store.get('progress'))), '```'].join('\n') }
  })

  // Updates the plugin right away, whatever the `autoUpdate` option says, and tells which version it installed.
  on('command.run', { command: 'hamster-saga:update' }, async ($, e) => {
    const marketplace = INSTALLED.exec($.plugin.root)?.[1]
    if (!marketplace) return { text: `This copy of hamster-saga was not installed from a marketplace, so there is nothing to update it from.` }
    const current = $.plugin.root.split(/[\\/]/).filter(Boolean).pop() ?? ''
    const version = await updated($, marketplace).catch(() => null)
    if (version === null) return { text: 'Could not update hamster-saga. Try again later, or update it from the plugin manager.' }
    if (version === current) return { text: `hamster-saga ${current} is the latest version.` }
    if (version === '') return { text: 'hamster-saga is up to date. If a newer version came in, run /reload-plugins to load it.' }
    return { text: `hamster-saga updated from ${current} to ${version}. Run /reload-plugins to load it.` }
  })

  // The staff record starts with the first session that has it, a hamster already at work on it from then; then the
  // weekly self-update, a minute into the session so it never slows the start.
  on('session.start', async ($, e, next) => {
    try {
      told(await $.hamster.story())
    } catch {}
    const progress = asProgress(await $.store.get('progress'))
    const stored = await $.store.get('staff')
    if (!stored || (stored as Record<string, unknown>).generation !== progress.generation) {
      await $.store.set('staff', asStaff(stored, progress.generation, await $.clock.now()))
    }
    const result = await next(e)
    const marketplace = INSTALLED.exec($.plugin.root)?.[1]
    if (options.autoUpdate !== false && marketplace) {
      $.clock.after(UPDATE_DELAY, () => {
        const update = async () => {
          const now = await $.clock.now()
          const checked = await $.store.get('updateCheckedAt')
          if (typeof checked === 'number' && now - checked < UPDATE_EVERY) return
          await $.store.set('updateCheckedAt', now)
          await updated($, marketplace)
        }
        update().catch(() => {})
      })
    }
    return result
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
      await keepStaff($, before, progress)
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
        if (key === 'progress') await keepStaff($, before, progress)
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
          if (key === 'progress') await keepStaff($, before, progress)
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
