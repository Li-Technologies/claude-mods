// The whole story the saga tells: the seasons with their episodes, phrases and openings, and the finale and the hiring
// every hamster gets. register.ts tells it.
//
// `{h}` is the hamster in running text ("the hamster", then "Hamster II"); `{H}` the same as a proper name
// ("the Hamster"); `{N}` its bare name, to open a line ("Hamster", then "Hamster II").
//
// Progress is kept by episode id, so the book can grow and its texts change without losing anyone's place:
// an id never changes and is never reused; a new episode, anywhere, takes a new one (`lotr-08a` between 08 and 09).
// An episode added before the current one waits for the next hamster; one added after it comes up as usual.
import type { HamsterEntry, HamsterSeason } from '../types'

export type Episode = HamsterEntry
export type Season = HamsterSeason

export const SEASONS: readonly Season[] = [
  {
    title: 'The career',
    reset: {
      phrase: /(?<!\p{L})(?:reorg\p{L}*|restructur\p{L}*|restrukturyzacj\p{L}*|from scratch|od zera)(?!\p{L})/iu,
      text: 'Demoting {h} back to intern',
    },
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
export const FINALE: Episode = ['finale', 'Sending {h} back to where it all began']
export const HIRING: Episode = ['hiring', 'Hiring {H}']

// The toast once the finale has been on screen.
export const FINALE_TOAST = '🎬 Series finale. The hamster has seen things. Time to send it back.'
