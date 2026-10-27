import { expect, mock, test } from 'claude-code/testing'

const BAND = {
    plugin: 'context-line',
    component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

const USAGE = {
    startedAt: 0,
    context: { tokens: 106500, window: 1000000, percent: 11, breakdown: { totalTokens: 106500, rawMaxTokens: 500000 } },
    rateLimits: [],
}

const COMPACTED = { text: 'Compacted' }

test('one press on the Compact button compacts and the outcome clears itself', async ($, on) => {
    const clock = mock.clock(on)
    const compactions: string[] = []

    on('session.start', (_, e) => ({ cwd: e.cwd }))
    on('session.cwd', () => ({ value: '/work/app' }))
    on('process.run', () => ({ value: { exitCode: 0, stdout: 'feature/login\n', stderr: '' } }))
    on('session.usage', () => ({ value: USAGE }))
    on('command.run', () => {
        compactions.push('compact')

        return COMPACTED
    })

    await $.session.start({ cwd: '/work/app', surface: 'desktop', isInteractive: true })

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    expect((await ui.find({ type: 'Text', text: /^21%$/ }))?.text).toBe('21%')
    expect((await ui.find({ type: 'Text', text: /feature\/login/ }))?.text).toContain('app')
    expect((await ui.find({ key: 'compact' }))?.text).toBe('Compact')
    expect(await ui.find({ type: 'Svg' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /^Context$/ })).toBeUndefined()
    expect(JSON.stringify(await ui.drawn())).toContain('linearGradient')

    // The details and the button sit in a Box that is hidden until the pointer is over the keyed Box around the bar.
    const drawn = JSON.stringify(await ui.drawn())

    expect(drawn).toContain('Context  106.5k / 500.0k')
    expect(drawn).toContain('"display":"none"')
    expect(drawn).toContain('"hover":{"display":"flex"}')

    await ui.press({ key: 'compact' })
    expect(compactions).toHaveLength(1)
    expect((await ui.find({ type: 'Text', text: /^Compacted$/ }))?.text).toBe('Compacted')
    expect((await ui.find({ key: 'compact' }))?.text).toBe('Compact')

    await clock.advance(8000)
    expect(await ui.find({ type: 'Text', text: /^Compacted$/ })).toBeUndefined()

    await ui.unmount()
})

test('a poll with unchanged usage keeps the figure and one with new usage updates it', async ($, on) => {
    const clock = mock.clock(on)
    const polls: number[] = []
    let tokens = 106500

    on('session.start', (_, e) => ({ cwd: e.cwd }))
    on('session.cwd', () => ({ value: '/work/app' }))
    on('process.run', () => ({ value: { exitCode: 0, stdout: 'feature/login\n', stderr: '' } }))
    on('session.usage', () => {
        polls.push(tokens)

        return { value: { ...USAGE, context: { ...USAGE.context, tokens } } }
    })

    await $.session.start({ cwd: '/work/app', surface: 'desktop', isInteractive: true })

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await clock.advance(5000)
    await clock.advance(5000)
    expect(polls.length).toBeGreaterThan(2)
    expect((await ui.find({ type: 'Text', text: /^21%$/ }))?.text).toBe('21%')

    tokens = 120000
    await clock.advance(5000)
    expect((await ui.find({ type: 'Text', text: /^24%$/ }))?.text).toBe('24%')
    expect((await ui.find({ type: 'Text', text: /Context  120\.0k \/ 500\.0k/ }))?.text).toContain('120.0k')

    await ui.unmount()
})

test('the output of the compact command is shown in the band and clears itself', async ($, on) => {
    const clock = mock.clock(on)

    on('session.start', (_, e) => ({ cwd: e.cwd }))
    on('session.cwd', () => ({ value: '/work/app' }))
    on('process.run', () => ({ value: { exitCode: 0, stdout: 'feature/login\n', stderr: '' } }))
    on('session.usage', () => ({ value: USAGE }))
    on('command.run', () => ({ text: 'Nothing to compact' }))

    await $.session.start({ cwd: '/work/app', surface: 'desktop', isInteractive: true })

    const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })

    await ui.press({ key: 'compact' })
    expect((await ui.find({ type: 'Text', text: /Nothing to compact/ }))?.text).toBe('Nothing to compact')

    await clock.advance(8000)
    expect(await ui.find({ type: 'Text', text: /Nothing to compact/ })).toBeUndefined()

    await ui.unmount()
})

test('a press while a turn runs does not compact and says to wait', async ($, on) => {
    const compactions: string[] = []

    mock.clock(on)
    on('session.start', (_, e) => ({ cwd: e.cwd }))
    on('session.cwd', () => ({ value: '/work/app' }))
    on('process.run', () => ({ value: { exitCode: 0, stdout: 'feature/login\n', stderr: '' } }))
    on('session.usage', () => ({ value: USAGE }))
    on('command.run', () => {
        compactions.push('compact')

        return COMPACTED
    })

    await $.session.start({ cwd: '/work/app', surface: 'desktop', isInteractive: true })

    const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, isWorking: true }, surface: 'desktop' })

    await ui.press({ key: 'compact' })
    expect(compactions).toHaveLength(0)
    expect((await ui.find({ type: 'Text', text: /turn to finish/ }))?.text).toBe('Compact needs the turn to finish first')

    await ui.unmount()
})

test('the terminal has no Svg and keeps the block bar', async ($, on) => {
    mock.clock(on)

    on('session.start', (_, e) => ({ cwd: e.cwd }))
    on('session.cwd', () => ({ value: '/work/app' }))
    on('process.run', () => ({ value: { exitCode: 0, stdout: 'feature/login\n', stderr: '' } }))
    on('session.usage', () => ({ value: USAGE }))

    await $.session.start({ cwd: '/work/app', surface: 'terminal', isInteractive: true })

    const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })

    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect((await ui.find({ type: 'Text', text: /█/ }))?.text).toContain('█')

    // No pointer on a terminal, so the details and the button stay drawn.
    expect(JSON.stringify(await ui.drawn())).not.toContain('"display":"none"')
    expect((await ui.find({ type: 'Text', text: /Context  106\.5k \/ 500\.0k/ }))?.text).toContain('106.5k')
    expect((await ui.find({ key: 'compact' }))?.text).toBe('Compact')

    await ui.unmount()
})
