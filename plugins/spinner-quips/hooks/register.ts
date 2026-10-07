import type { EngineInterface, Register } from 'claude-code'
import type { QuipsCategory, QuipsPack } from '../types'
import { QUIPS as WRITTEN, TOPIC_QUIPS as WRITTEN_TOPIC_QUIPS, TOPICS as WRITTEN_TOPICS, type Topic } from './quips.ts'

type Category = QuipsCategory
const CATEGORIES: readonly Category[] = ['read', 'implement', 'debug', 'design', 'comms', 'planning', 'other']

// The quips as quips.ts writes them, kept to what the spinner can show: each category a list of texts, an empty one
// when it is missing.
function listed(written: unknown): Record<Category, readonly string[]> {
  const raw = (written && typeof written === 'object' ? written : {}) as Record<string, unknown>
  const texts = (value: unknown) => (Array.isArray(value) ? value : []).filter((quip): quip is string => typeof quip === 'string' && quip.trim() !== '')
  return Object.fromEntries(CATEGORIES.map(group => [group, texts(raw[group])])) as Record<Category, readonly string[]>
}

// A topic's pattern matched without the global or sticky flag, which would make it miss every other text.
function patterned(written: unknown): readonly [Topic, RegExp][] {
  return (Array.isArray(written) ? written : [])
    .filter((entry): entry is [Topic, RegExp] => Array.isArray(entry) && typeof entry[0] === 'string' && entry[1] instanceof RegExp)
    .map(([topic, pattern]) => [topic, new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))])
}

const BUILT_IN = listed(WRITTEN)

// The built-in quips with the packs other plugins add: a pack's quips join them, its `drop` leaves some of them out and
// its `replace` all of them; a malformed pack adds nothing.
function combined(packs: unknown): Record<Category, readonly string[]> {
  const valid = (Array.isArray(packs) ? packs : []).filter((pack): pack is QuipsPack => Boolean(pack) && typeof pack === 'object')
  const dropped = new Set(valid.flatMap(pack => (Array.isArray(pack.drop) ? pack.drop : [])))
  const replaced = valid.some(pack => pack.replace === true)
  const added = valid.map(pack => listed(pack.quips))
  const group = (category: Category) => {
    const own = replaced ? [] : BUILT_IN[category].filter(quip => !dropped.has(quip))
    return [...new Set([...own, ...added.flatMap(pack => pack[category])])]
  }
  return Object.fromEntries(CATEGORIES.map(category => [category, group(category)])) as Record<Category, readonly string[]>
}

// The quips drawn from: the built-in ones until the session collects the packs.
let QUIPS = BUILT_IN
const TOPICS = patterned(WRITTEN_TOPICS)
// Quips that only make sense when the turn touches their topic.
const TOPIC_QUIPS: Readonly<Record<string, Topic>> = WRITTEN_TOPIC_QUIPS && typeof WRITTEN_TOPIC_QUIPS === 'object' ? WRITTEN_TOPIC_QUIPS : {}

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
      'nie widzi\\p{L}*',
      'nie pokazuj\\p{L}*',
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
      'slow',
      'slower',
      'slowly',
      'performance',
      'memory leaks?',
      'leak\\p{L}*',
      'hangs?',
      'hanging',
      'freez\\p{L}*',
      'lint\\p{L}*',
      'typos?',
      'wolno',
      'wolne',
      'wolniej',
      'muli',
      'zamula\\p{L}*',
      'wydajnoś\\p{L}*',
      'wydajnosc\\p{L}*',
      'wyciek\\p{L}*',
      'zawiesza\\p{L}*',
      'wywala\\p{L}*',
      'wysypuje\\p{L}*',
      'sypie\\p{L}*',
      'nie przechodz\\p{L}*',
      'nie odpala\\p{L}*',
      'nie startuje\\p{L}*',
      'nie łącz\\p{L}*',
      'nie lacz\\p{L}*',
      'nie zapisuje\\p{L}*',
      'popraw\\p{L}*',
      'literówk\\p{L}*',
      'literowk\\p{L}*',
      'problem\\p{L}*',
      'coś jest nie tak',
      'cos jest nie tak',
      'coś nie tak',
      'cos nie tak',
      'dziwn\\p{L}*',
      'zbada\\p{L}* czemu',
      'przetestujmy',
      'testuj\\p{L}*',
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
      'publikuj\\p{L}*',
      'opublikuj\\p{L}*',
      'odpisz\\p{L}*',
      'powiadom\\p{L}*',
      'poinformuj\\p{L}*',
      'ogłoś',
      'oglos',
      'prezentacj\\p{L}*',
      'draft (?:an? )?(?:e-?mail|message|reply)',
      'announce\\p{L}*',
      'notify',
      'let (?:them|him|her|the team) know',
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
      'pomys\\p{L}*',
      'zaproponuj\\p{L}*',
      'proponuj\\p{L}*',
      'propozycj\\p{L}*',
      'idea\\p{L}*',
      'brainstorm\\p{L}*',
      'propos\\p{L}*',
      'suggest\\p{L}*',
      'how should we',
      'what would be the best',
      'pros and cons',
      'schema\\p{L}*',
      'data model',
      'koncepcj\\p{L}*',
      'jak najlepiej',
      'jak to (?:zrobić|zrobic|rozwiązać|rozwiazac|ugryźć|ugryzc)',
      'zastanów\\p{L}*',
      'zastanow\\p{L}*',
      'przemyśl\\p{L}*',
      'przemysl\\p{L}*',
      'rozważ\\p{L}*',
      'rozwaz\\p{L}*',
      'alternatyw\\p{L}*',
      'model danych',
      'schemat\\p{L}*',
      'struktur\\p{L}*',
      'za i przeciw',
      'wady i zalet\\p{L}*',
      'co sądzisz',
      'co sadzisz',
      'co myślisz',
      'co myslisz',
      'jak myślisz',
      'jak myslisz',
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
      'plan',
      'plans',
      'planning',
      'planu',
      'planie',
      'planem',
      'plany',
      'todo\\p{L}*',
      'to-?do lists?',
      'milestones?',
      'next steps',
      'tickets?',
      'zadani\\p{L}*',
      'kolejne kroki',
      'następne kroki',
      'nastepne kroki',
      'co dalej',
      'co teraz',
      'lista zadań',
      'lista zadan',
      'termin\\p{L}*',
      'estymat\\p{L}*',
      'estymuj\\p{L}*',
      'ile (?:to )?zajmie',
      'unassigned',
      'nieprzypisan\\p{L}*',
      'kamieni\\p{L}* milow\\p{L}*',
    ]),
  ],
  // Reviewing a change reads it, whatever the change was.
  ['read', words(['review\\p{L}*', 'code review', 'przejrzyj\\p{L}*', 'przejrzeć', 'przejrzec', 'zrecenzuj\\p{L}*'])],
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
      'zróbmy',
      'zrobmy',
      'zrobić',
      'zrobic',
      'lecimy',
      'bierzmy',
      'weźmy',
      'wezmy',
      'dodajmy',
      'przenieś',
      'przenies',
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
      'rename\\p{L}*',
      'optimi[sz]\\p{L}*',
      'clean ?up',
      'cleanup',
      'convert\\p{L}*',
      'rewrite',
      'rewriting',
      'remove',
      'removing',
      'delete',
      'set ?up',
      'setup',
      'configure',
      'install\\p{L}*',
      'bump',
      'upgrade\\p{L}*',
      'migrat\\p{L}*',
      'move',
      'generate',
      'scaffold\\p{L}*',
      'extract',
      'replace',
      'wire up',
      'hook up',
      'integrat\\p{L}*',
      'go ahead',
      'do it',
      'przepisz\\p{L}*',
      'usuń',
      'usun\\p{L}*',
      'wywal\\p{L}*',
      'posprzątaj\\p{L}*',
      'posprzataj\\p{L}*',
      'uporządkuj\\p{L}*',
      'uporzadkuj\\p{L}*',
      'zoptymalizuj\\p{L}*',
      'optymaliz\\p{L}*',
      'przebuduj\\p{L}*',
      'przerób\\p{L}*',
      'przerob\\p{L}*',
      'zrefaktoruj\\p{L}*',
      'refaktor\\p{L}*',
      'wygeneruj\\p{L}*',
      'generuj\\p{L}*',
      'skonfiguruj\\p{L}*',
      'konfiguruj\\p{L}*',
      'zainstaluj\\p{L}*',
      'podbij\\p{L}*',
      'zaktualizuj\\p{L}*',
      'aktualizuj\\p{L}*',
      'migracj\\p{L}*',
      'zmigruj\\p{L}*',
      'wstaw\\p{L}*',
      'podepnij\\p{L}*',
      'połącz\\p{L}*',
      'polacz\\p{L}*',
      'zintegruj\\p{L}*',
      'dopisz\\p{L}*',
      'uzupełnij\\p{L}*',
      'uzupelnij\\p{L}*',
      'rozbij\\p{L}*',
      'wydziel\\p{L}*',
      'zamień\\p{L}*',
      'zamien\\p{L}*',
      'podmień\\p{L}*',
      'podmien\\p{L}*',
      'wrzuć\\p{L}*',
      'wrzuc\\p{L}*',
      'zacommituj\\p{L}*',
      'zapisz\\p{L}*',
      'napiszmy',
      'stwórzmy',
      'stworzmy',
      'zbudujmy',
      'zmieńmy',
      'dawaj',
      'działaj',
      'dzialaj',
      'jedziemy',
      'rób',
      'rob',
      'róbmy',
      'robmy',
      'zaimplementujmy',
      'wdrażaj\\p{L}*',
      'wdrazaj\\p{L}*',
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
      'wyświetl\\p{L}*',
      'wyswietl\\p{L}*',
      'przypomnij\\p{L}*',
      'jak działaj\\p{L}*',
      'jak dzialaj\\p{L}*',
      'czego dotyczy',
      'o czym',
      'understand\\p{L}*',
      'summari[sz]\\p{L}*',
      'summary',
      'walk me through',
      'tell me',
      'describe',
      'investigat\\p{L}*',
      'look into',
      'where is',
      'where are',
      'zrozum\\p{L}*',
      'podsumuj\\p{L}*',
      'podsumowani\\p{L}*',
      'opisz\\p{L}*',
      'wytłumacz\\p{L}*',
      'wytlumacz\\p{L}*',
      'objaśnij',
      'objasnij',
      'co robi',
      'co robią',
      'co robia',
      'jak to działa',
      'jak to dziala',
      'gdzie jest',
      'gdzie są',
      'gdzie sa',
      'gdzie to',
      'skąd',
      'skad',
      'pokaż\\p{L}*',
      'pokaz\\p{L}*',
      'zbadaj\\p{L}*',
      'przyjrzyj\\p{L}*',
      'sprawdź\\p{L}*',
      'zobacz\\p{L}*',
      'wylistuj\\p{L}*',
      'jakie są',
      'jakie sa',
      'ile jest',
      'czy jest',
      'czy są',
      'czy sa',
      'przeczytajmy',
      'poszukaj\\p{L}*',
      'wyszukaj\\p{L}*',
      'przeszukaj\\p{L}*',
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
  TodoWrite: 'planning',
  TaskCreate: 'planning',
  TaskUpdate: 'planning',
  EnterPlanMode: 'planning',
  ExitPlanMode: 'planning',
  AskUserQuestion: 'design',
  create_issue: 'planning',
  update_issue: 'planning',
  get_issue: 'read',
  search_code: 'read',
  get_file_contents: 'read',
  create_pull_request: 'implement',
  merge_pull_request: 'implement',
}

// Shell commands that give the task away.
const SHELL: readonly [Category, RegExp][] = [
  ['debug', /\bsf\s+apex\s+(?:run\s+test|get\s+log|tail\s+log)/],
  ['debug', /\bnewman\b|\bplaywright\b|\b(?:npm|npx|yarn)\s+(?:run\s+)?test\b|\bmvn\b.*\btest\b/],
  ['implement', /\bsf\s+project\s+(?:deploy|retrieve)|\bvlocity\b|\bgit\s+(?:push|commit|cherry-pick|merge)\b/],
  ['implement', /\bmvn\b|\banypoint-cli\b|\bmule\b/],
  ['read', /\bsf\s+data\s+query|\bgit\s+(?:log|diff|show|status)\b/],
  ['debug', /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:test|lint|typecheck)\b|\b(?:jest|vitest|mocha|pytest|rspec|phpunit|cypress|eslint)\b|\b(?:go|cargo|dotnet|swift)\s+test\b|\bgradlew?\b.*\b(?:test|check)\b|\btsc\b.*--noEmit/],
  ['implement', /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:build|install|add|i)\b|\b(?:cargo|go|swift)\s+build\b|\bdocker\b|\bterraform\s+apply\b|\bkubectl\s+apply\b|\bgh\s+pr\s+(?:create|merge)\b|\bpip3?\s+install\b|\bsed\s+-i\b|\bmkdir\b/],
  ['read', /^\s*(?:cd\s+\S+\s*&&\s*)?(?:ls|cat|head|tail|less|tree|rg|grep|find|wc|jq|git\s+blame)\b|\bgh\s+(?:pr|issue)\s+(?:view|list|diff)\b/],
]

// How sure each signal is: within a turn a weaker one never overrides a stronger one.
const RANK = { tool: 0, keyword: 1, command: 2 } as const
type Source = keyof typeof RANK

// One draw in this many comes from the general quips whatever the work, so they keep turning up.
const OTHER_SHARE = 5

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
  const bag = [...QUIPS[group], ...(group === 'other' || QUIPS[group].length === 0 ? [] : [SLOT])]
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

// A quip for the work at hand, now and then a general one instead; the work's own when the general ones have none to give.
function choose(): string {
  const group: Category = category !== 'other' && randomIndex(OTHER_SHARE) === 0 ? 'other' : category
  const quip = pick(group)
  return quip === GENERIC && group !== category ? pick(category) : quip
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

// The saga is another mod's: each call goes through its `$.hamster` noun and is skipped while that mod is not installed.
export const register: Register = (on, options) => {
  // The `$.quips` noun: a plugin adds its pack by answering `quips.collect` with what `next` gives it plus its own.
  on('engine.create', async ($, e, next) => {
    const built = await next(e)
    return { ...built, quips: { collect: async () => [] } }
  })

  // Collects the packs and attaches to the saga, then the weekly self-update, a minute into the session so it never
  // slows the start.
  on('session.start', async ($, e, next) => {
    try {
      QUIPS = combined(await $.quips.collect())
      for (const group of CATEGORIES) delete bags[group]
    } catch {}
    try {
      await $.hamster.attach()
    } catch {}
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

  // Updates the plugin right away, whatever the `autoUpdate` option says, and tells which version it installed.
  on('command.run', { command: 'spinner-quips:update' }, async ($, e) => {
    const marketplace = INSTALLED.exec($.plugin.root)?.[1]
    if (!marketplace) return { text: `This copy of spinner-quips was not installed from a marketplace, so there is nothing to update it from.` }
    const current = $.plugin.root.split(/[\\/]/).filter(Boolean).pop() ?? ''
    const version = await updated($, marketplace).catch(() => null)
    if (version === null) return { text: 'Could not update spinner-quips. Try again later, or update it from the plugin manager.' }
    if (version === current) return { text: `spinner-quips ${current} is the latest version.` }
    if (version === '') return { text: 'spinner-quips is up to date. If a newer version came in, run /reload-plugins to load it.' }
    return { text: `spinner-quips updated from ${current} to ${version}. Run /reload-plugins to load it.` }
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

  // The next prompt classifies afresh, any signal winning; one that gives nothing away carries on with this turn's kind
  // of work, as a follow-up usually does.
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
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
      word = choose()
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
            word = choose()
          }
        } catch {
          if (drawn === SLOT) word = choose()
        }
      }
      if (draw === draws) current = word
    }
    return next({ ...e, props: { ...e.props, word } })
  })
}
