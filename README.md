# claude-mods

Small mods for [Claude Code](https://claude.com/claude-code), published as the `li-technologies` plugin marketplace.

| Plugin | What it does |
| --- | --- |
| **spinner-quips** | Replaces the spinner's generic "Working" with a short funny phrase that fits what Claude is doing: reading, implementing, debugging, designing, writing or planning. |
| **hamster-saga** | Now and then a spinner tells the next chapter of a hamster's long and eventful saga. |

Both are function-hook plugins: they run inside Claude Code itself, in the terminal and in the desktop app's Code tab. Built and tested on Claude Code 2.1.289.

## Install

```bash
claude plugin marketplace add li-technologies/claude-mods
claude plugin install spinner-quips@li-technologies
claude plugin install hamster-saga@li-technologies
```

Install either one or both. Inside a session, `/plugin marketplace add li-technologies/claude-mods` and `/plugin install …` do the same. New sessions pick the plugins up; in a running one, run `/reload-plugins`.

## Updates

Each plugin's version only changes when there is something new, and an update reaches you only through a new version.

### Turn on auto-update (recommended)

Auto-update is **off** by default for marketplaces outside Anthropic, and a marketplace cannot switch it on for you. Turn it on once and Claude Code checks for new versions in the background after a session starts.

- **Settings file** (works everywhere, including the desktop app): after installing, run

  ```bash
  jq '.extraKnownMarketplaces["li-technologies"].autoUpdate = true' ~/.claude/settings.json > ~/.claude/settings.json.tmp && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
  ```

  or simply ask Claude: *"turn on auto-update for the li-technologies plugin marketplace"*. Either way the `li-technologies` entry under `extraKnownMarketplaces` in `~/.claude/settings.json` gets `"autoUpdate": true`.
- **Terminal**: `/plugin` → **Marketplaces** → **li-technologies** → **Enable auto-update**.
- **Organisations** can set the same `autoUpdate` key in managed settings for everyone.

The desktop app has no auto-update switch, so use the settings file there.

### Update by hand

- **Desktop app**: **Plugins** → **Manage marketplaces** → **Check for updates** next to li-technologies, then open the plugin and press **Update**.
- **Terminal**:

  ```bash
  claude plugin marketplace update li-technologies
  claude plugin update spinner-quips@li-technologies
  claude plugin update hamster-saga@li-technologies
  ```

Then start a new session or run `/reload-plugins`.

## spinner-quips

- In the terminal every spinner gets a quip; in the desktop app only the generic "Working" is replaced, so Claude's own task-specific words stay.
- The quip matches the task, judged from your prompt (English and Polish), the slash command you ran and the tools Claude uses.
- A few quips only show up when the conversation is about their topic.

## hamster-saga

A hamster joins the team. What happens next is told one spinner at a time, a chapter every so often, so the story unfolds over weeks rather than minutes. No spoilers here.

- Works on its own: an occasional spinner shows the next chapter.
- With **spinner-quips** installed too, the saga takes a slot in the quip rotation instead.
- Progress is kept between sessions.
- `/hamster-saga:status` shows where the story stands. The other `/hamster-saga:…` commands are there if you want to peek, but the story is better unspoiled.

## Versioning

Each plugin follows semantic versioning in its `plugin.json`; an update reaches you only when the version changes.

| Bump | spinner-quips | hamster-saga |
| --- | --- | --- |
| patch `x.y.Z` | quip text changes, new quips | small fixes, chapter text tweaks |
| minor `x.Y.0` | new categories, small behaviour changes | new seasons and new content |
| major `X.0.0` | behaviour changes, e.g. drawing something new | behaviour changes, e.g. drawing something new |

## License

[CC BY-NC-ND 4.0](LICENSE): free to use, also at work and on paid projects; no selling, no charging for it, no modified versions.
