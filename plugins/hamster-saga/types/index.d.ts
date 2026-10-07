export type Hamster = {
  // The episode to show next; `urgent` when it answers a reset phrase and should show at once.
  peek: () => Promise<HamsterEpisode>
  // Moves past `text` once it has been on screen; a no-op when the saga already stands elsewhere.
  advance: (shown: HamsterShown) => Promise<number>
  // Tells the saga another mod shows its episodes, so it stops drawing on its own.
  attach: () => Promise<boolean>
  // Every story the installed plugins add; a plugin answers with what `next` gave it plus its own.
  story: () => Promise<readonly HamsterStory[]>
}

// An episode: its id, never changed or reused, and its text (`{h}`, `{H}`, `{N}` name the hamster).
export type HamsterEntry = readonly [id: string, text: string]

export type HamsterSeason = {
  title: string
  // A phrase in a prompt that sends the season back to its first episode, and what the spinner says then. Another
  // plugin gives the phrase as a pattern's text, matched ignoring case: a RegExp does not cross between plugins.
  reset?: { phrase: RegExp | string; text: string }
  // The toast once the season's first episode has been on screen; none for the first season, to keep it a surprise.
  opening?: string
  episodes: readonly HamsterEntry[]
}

// What another plugin adds to the saga, answering `hamster.story`.
export type HamsterStory = {
  // Who adds the story.
  name: string
  // Seasons told after the built-in ones, or instead of them with `replace`; their episode ids must be their own.
  seasons?: readonly HamsterSeason[]
  // True leaves out every built-in season, so only the stories' own are told.
  replace?: boolean
  // The finale's line and its toast, in place of the built-in ones.
  finale?: string
  finaleToast?: string
}

export type HamsterEpisode = {
  text: string
  urgent: boolean
}

export type HamsterShown = {
  text: string
}

declare module 'claude-code' {
  interface EngineInterface {
    hamster: Hamster
  }
}
