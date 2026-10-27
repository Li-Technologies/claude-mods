export type Line = {
    tokens: number
    window: number
    percent: number
    folder: string
    branch: string
    status: string
    failed: boolean
}

declare module 'claude-code' {
    interface PluginState {
        'context-line': { line: Line | null }
    }
}
