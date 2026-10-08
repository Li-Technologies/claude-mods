// Every text the spinner can show, by the kind of work Claude is doing: register.ts works out the kind and draws from
// here. A quip names an action ("Doing X"), as it stands in for "Working".
import type { QuipsCategory as Category } from '../types'

export const QUIPS: Record<Category, readonly string[]> = {
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
    'Looking for the golden ticket', // Charlie and the Chocolate Factory
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
    'Tipping the server $10,000', // MrBeast: tipping waiters
    'Recreating Squid Game in staging', // MrBeast: Squid Game in real life
    "Building the world's largest if-statement", // MrBeast: World's Largest …
    'Hiding $1,000,000 in the codebase', // MrBeast: hide and seek for $1,000,000
    'Buying everything on the AppExchange', // MrBeast: I Bought Everything in a Store
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
    'Keeping my friends close and the bugs closer', // The Godfather Part II
    'Calling Houston', // Apollo 13
    'Posting the apology video', // YouTube apology videos
    'Giving $10,000 to whoever finds the bug', // MrBeast
    'Unleashing the spider dog', // Wardęga: Mutant Giant Spider Dog
    'Paying a stranger $100,000 to read the logs', // MrBeast: paying strangers for odd tasks
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
    'Comparing the $1 fix with the $1,000,000 one', // MrBeast: $1 vs $1,000,000
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
    'Smiling and waving', // Madagascar
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
    'Getting a bigger boat', // Jaws
    'Awarding ten points to Gryffindor', // Harry Potter; story points
    'Making room on the door for Jack', // Titanic
    'Leaving Kevin home alone', // Home Alone
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
    'Finding out why the rum is gone', // Pirates of the Caribbean
    'Using code CLAUDE for 10% off', // influencer promo codes
  ],
}

export type Topic = 'vlocity' | 'mulesoft'

// Quips that only make sense when the turn touches their topic.
export const TOPIC_QUIPS: Record<string, Topic> = {
  'Microwaving the datapack': 'vlocity',
  'Arguing with Vlocity': 'vlocity',
  'Decommissioning Mulesoft': 'mulesoft',
}

// What gives a topic away in a prompt, a command or skill name, or any argument of a tool call.
export const TOPICS: readonly [Topic, RegExp][] = [
  ['vlocity', /vlocity|omni-?(?:studio|scripts?|process)|flex-?cards?|data-?raptors?|datapacks?|integration procedures?|communications-cloud/i],
  ['mulesoft', /(?<![a-z])mule|anypoint|(?<![a-z])raml(?![a-z])|dataweave|(?<![a-z])dwl(?![a-z])/i],
]
