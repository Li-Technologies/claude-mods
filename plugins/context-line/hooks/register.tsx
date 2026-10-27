import { atom, read, update } from 'claude-code'
import type { Engine, Register } from 'claude-code'

import type { Line } from '../types'

const line = atom({ plugin: 'context-line', key: 'line' } as const, null)

const POLL_MS = 5000
const BAR_CELLS = 20
const BAR_WIDTH = 160
const BAR_HEIGHT = 8

const STATUS_MS = 8000
const FAILURE_MS = 30000

const EMPTY: Line = { tokens: 0, window: 0, percent: 0, folder: '', branch: '', status: '', failed: false }

let inFlight = false
let isCompacting = false
let statusSeq = 0
let countedFor = -1
let counted = 0

const format = (tokens: number): string => (tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : `${tokens}`)

const bar = (percent: number): { filled: string; empty: string } => {
    const cells = Math.min(BAR_CELLS, Math.max(0, Math.round((percent / 100) * BAR_CELLS)))

    return { filled: '█'.repeat(cells), empty: '░'.repeat(BAR_CELLS - cells) }
}

// Desktop draws the SVG as an image, so the track is a translucent grey that reads on a light and a dark theme alike.
const barSvg = (percent: number, tokens: number, window: number): string => {
    const [from, to] = percent >= 90 ? ['#dc2626', '#f87171'] : percent >= 70 ? ['#d97706', '#fbbf24'] : ['#2563eb', '#60a5fa']
    const ratio = window > 0 ? Math.min(1, Math.max(0, tokens / window)) : 0
    const fill = ratio === 0 ? 0 : Math.max(BAR_HEIGHT, Math.round(ratio * BAR_WIDTH))
    const radius = BAR_HEIGHT / 2

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${BAR_WIDTH}" height="${BAR_HEIGHT}" viewBox="0 0 ${BAR_WIDTH} ${BAR_HEIGHT}">` +
        `<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
        `<rect width="${BAR_WIDTH}" height="${BAR_HEIGHT}" rx="${radius}" fill="#808080" fill-opacity="0.25"/>` +
        (fill > 0 ? `<rect width="${fill}" height="${BAR_HEIGHT}" rx="${radius}" fill="url(#g)"/>` : '') +
        '</svg>'
    )
}

const refreshContext = async ($: Engine): Promise<void> => {
    if (inFlight) {
        return
    }

    inFlight = true

    try {
        const { context } = await $.session.usage({ breakdown: 'summary' })
        const api = context.tokens ?? 0
        const est = context.breakdown?.totalTokens ?? 0

        // Until the first response after a compaction there is no API figure and the local estimate overshoots by ~10%.
        // The token-count figure matches the Context card, so count it, and again only when the estimate moves.
        if (api > 0) {
            countedFor = -1
        } else if (est !== countedFor) {
            counted = (await $.session.usage({ breakdown: 'full' })).context.breakdown?.totalTokens ?? 0
            countedFor = est
        }

        const tokens = api > 0 ? api : counted > 0 ? counted : est
        const window = context.breakdown?.rawMaxTokens ?? context.window
        const percent = window > 0 ? Math.round((tokens / window) * 100) : 0
        const shown = await read($, line)

        // Every write redraws the band and Desktop drops the hover on a redraw, so a poll that found nothing new must not write.
        if (shown !== null && shown.tokens === tokens && shown.window === window && shown.percent === percent) {
            return
        }

        await update($, line, previous => ({ ...(previous ?? EMPTY), tokens, window, percent }))
    } finally {
        inFlight = false
    }
}

const refreshPlace = async ($: Engine): Promise<void> => {
    const cwd = await $.session.cwd()
    const folder = cwd.split('/').filter(Boolean).pop() ?? cwd
    const git = await $.process.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], { cwd })
    const branch = git.exitCode === 0 ? git.stdout.trim() : ''

    await update($, line, previous => ({ ...(previous ?? EMPTY), folder, branch }))
}

// The outcome is drawn in the band, not as a toast: a plugin shows one toast at a time, so a second one sent right after the first never appears.
// A newer status wins over the timer of an older one.
const setStatus = async ($: Engine, status: string, failed: boolean, clearAfterMs?: number): Promise<void> => {
    statusSeq += 1

    const seq = statusSeq

    await update($, line, previous => ({ ...(previous ?? EMPTY), status, failed }))

    if (clearAfterMs !== undefined) {
        $.clock.after(clearAfterMs, () => {
            if (seq === statusSeq) {
                void update($, line, previous => ({ ...(previous ?? EMPTY), status: '', failed: false }))
            }
        })
    }
}

const pressCompact = async ($: Engine, isWorking: boolean): Promise<void> => {
    if (isCompacting) {
        return
    }

    if (isWorking) {
        await setStatus($, 'Compact needs the turn to finish first', true, STATUS_MS)

        return
    }

    isCompacting = true

    try {
        // $.session.compact() is refused on Desktop ("not available in a headless session yet"), so run the slash command as typed.
        const result = await $.command.run({ command: 'compact' })

        await setStatus($, result.text?.trim() || 'Compacted', false, STATUS_MS)
    } catch (error) {
        await setStatus($, `Compaction failed: ${error instanceof Error ? error.message : String(error)}`, true, FAILURE_MS)
    } finally {
        isCompacting = false
    }

    await refreshContext($)
}

export const register: Register = on => {
    on('session.start', async ($, e, next) => {
        await refreshPlace($)
        await refreshContext($)

        // A compaction fires neither session.measure nor turn.complete, and under a managed install session.compact and session.append
        // never reach this plugin, so re-read the usage on a timer.
        $.clock.every(POLL_MS, () => {
            void refreshContext($)
        })

        return next(e)
    })

    on('session.measure', async ($, e, next) => {
        await refreshContext($)

        return next(e)
    })

    on('turn.complete', async ($, e, next) => {
        await refreshPlace($)
        await refreshContext($)

        return next(e)
    })

    on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
        const current = await read($, line)

        if (e.props.hasSurvey || current === null || current.window === 0) {
            return next(e)
        }

        const elements = $.ui.resolve(e)
        const { Box, Button, Text } = elements
        // The terminal's table carries an Svg that draws nothing, so it keeps the block bar.
        const Svg = e.surface !== 'terminal' && 'Svg' in elements ? elements.Svg : undefined
        const color = current.percent >= 90 ? 'red' : current.percent >= 70 ? 'yellow' : undefined
        const place = [current.folder, current.branch].filter(Boolean).join('  ·  ')
        // The details and the Compact button appear while the pointer is over the keyed Box. A terminal has no pointer, so it keeps them drawn.
        const reveal = e.surface === 'terminal' ? {} : ({ display: 'none', hover: { display: 'flex' } } as const)
        const { filled, empty } = bar(current.percent)

        return (
            <Box width="100%">
                <Box flexGrow={1} gap={2}>
                    <Text dimColor>{place}</Text>
                    {current.status === '' ? null : (
                        <Text color={current.failed ? 'red' : undefined} dimColor={!current.failed}>
                            {current.status}
                        </Text>
                    )}
                </Box>
                <Box key="context" gap={2} alignItems="center">
                    <Box gap={2} alignItems="center" {...reveal}>
                        <Text color={color} dimColor={color === undefined}>
                            {`Context  ${format(current.tokens)} / ${format(current.window)}`}
                        </Text>
                        <Button
                            key="compact"
                            label="Compact"
                            plain
                            dimColor
                            onPress={() => {
                                void pressCompact($, e.props.isWorking)
                            }}
                        />
                    </Box>
                    <Box gap={1} alignItems="center">
                        {Svg === undefined ? (
                            <Box>
                                <Text color={color}>{filled}</Text>
                                <Text dimColor>{empty}</Text>
                            </Box>
                        ) : (
                            <Svg
                                source={barSvg(current.percent, current.tokens, current.window)}
                                alt={`Context ${current.percent}% used`}
                                width={BAR_WIDTH}
                                height={BAR_HEIGHT}
                            />
                        )}
                        <Text color={color} dimColor={color === undefined}>
                            {current.percent}%
                        </Text>
                    </Box>
                </Box>
            </Box>
        )
    })
}
