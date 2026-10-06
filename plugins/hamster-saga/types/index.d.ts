export type Hamster = {
  // The chapter to show next; `urgent` when it answers a reset phrase and should show at once.
  peek: () => Promise<HamsterChapter>
  // Moves past `text` once it has been on screen; a no-op when the saga already stands elsewhere.
  advance: (shown: HamsterShown) => Promise<number>
  // Tells the saga another mod shows its chapters, so it stops drawing on its own.
  attach: () => Promise<boolean>
}

export type HamsterChapter = {
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
