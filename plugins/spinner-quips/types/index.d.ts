// The kinds of work a quip is drawn for.
export type QuipsCategory = 'read' | 'implement' | 'debug' | 'design' | 'comms' | 'planning' | 'other'

// What another plugin adds to the spinner's quips, answering `quips.collect`.
export type QuipsPack = {
  // Who adds the pack.
  name: string
  // Quips by category, shown along with the built-in ones.
  quips?: Partial<Record<QuipsCategory, readonly string[]>>
  // Built-in quips left out, by their text.
  drop?: readonly string[]
  // True leaves out every built-in quip, so only the packs' own show.
  replace?: boolean
}

export type Quips = {
  // Every pack the installed plugins add; a plugin answers with what `next` gave it plus its own pack.
  collect: () => Promise<readonly QuipsPack[]>
}

declare module 'claude-code' {
  interface EngineInterface {
    quips: Quips
  }
}
