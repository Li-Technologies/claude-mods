# claude-mods

Small mods for [Claude Code](https://claude.com/claude-code), published as the `li-technologies` plugin marketplace.

| Plugin | What it does |
| --- | --- |
| **spinner-quips** | Replaces the spinner's generic "Working" with a short funny phrase that fits what Claude is doing: reading, implementing, debugging, designing, writing or planning. |
| **hamster-saga** | Now and then a spinner tells the next episode of a hamster's long and eventful saga. |

Both are function-hook plugins: they run inside Claude Code itself, in the terminal and in the desktop app's Code tab. Built and tested on Claude Code 2.1.286 to 2.1.292.

## Install

```bash
claude plugin marketplace add li-technologies/claude-mods
claude plugin install spinner-quips@li-technologies
claude plugin install hamster-saga@li-technologies
```

Install either one or both. Inside a session, `/plugin marketplace add li-technologies/claude-mods` and `/plugin install …` do the same. New sessions pick the plugins up; in a running one, run `/reload-plugins`.

## Updates

Both plugins keep themselves up to date. Once a week, about a minute into a session, each one quietly asks Claude Code to refresh this marketplace and install its own newer version, if there is one:

```bash
claude plugin marketplace update li-technologies
claude plugin update <plugin>@li-technologies
```

They run with the same Claude Code binary as the session, so this works in the terminal and in the desktop app. There is no message; the new version loads with the next session or `/reload-plugins`. An install from before self-updating existed needs one update by hand. To turn it off, switch the plugin's **Update automatically** option off (see [Options](#options)).

### Update by hand

- **Desktop app**: **Plugins** → **Manage marketplaces** → **Check for updates** next to li-technologies, then open the plugin and press **Update**.
- **Terminal**:

  ```bash
  claude plugin marketplace update li-technologies
  claude plugin update spinner-quips@li-technologies
  claude plugin update hamster-saga@li-technologies
  ```

Then start a new session or run `/reload-plugins`.

## Options

| Plugin | Option | Default | Values |
| --- | --- | --- | --- |
| spinner-quips | **Update automatically** (`autoUpdate`) | on | on, off |
| hamster-saga | **Pace** (`pace`) | a season a week | a season a day, a season every three days, a season a week, a season every two weeks, a season a month |
| hamster-saga | **Update automatically** (`autoUpdate`) | on | on, off |

In the terminal, `/config` lists them. Anywhere, including the desktop app, they live under `pluginConfigs` in `~/.claude/settings.json`, keyed by `<plugin>@li-technologies`:

```json
{
  "pluginConfigs": {
    "hamster-saga@li-technologies": { "options": { "pace": "a season every two weeks" } },
    "spinner-quips@li-technologies": { "options": { "autoUpdate": false } }
  }
}
```

Or ask Claude: *"set the hamster-saga pace to a season every two weeks"*. A change applies from the next session or `/reload-plugins`.

## spinner-quips

- In the terminal every spinner gets a quip; in the desktop app only the generic "Working" is replaced, so Claude's own task-specific words stay.
- The quip matches the task, judged from your prompt (English and Polish), the slash command you ran and the tools Claude uses.
- A few quips only show up when the conversation is about their topic.

## hamster-saga

A hamster joins the team. What happens next is told one spinner at a time, an episode every so often, so the story unfolds over weeks rather than minutes (the **Pace** option sets how many). No spoilers here.

- Works on its own: an occasional spinner shows the next episode.
- With **spinner-quips** installed too, the saga takes a slot in the quip rotation instead.
- Progress is kept between sessions.
- `/hamster-saga:status` shows where the story stands. The other `/hamster-saga:…` commands are there if you want to peek, but the story is better unspoiled.

## Versioning

Each plugin follows semantic versioning in its `plugin.json`; an update reaches you only when the version changes.

| Bump | spinner-quips | hamster-saga |
| --- | --- | --- |
| patch `x.y.Z` | quip text changes, new quips | small fixes, episode text tweaks |
| minor `x.Y.0` | new categories, small behaviour changes | new seasons and new content |
| major `X.0.0` | behaviour changes, e.g. drawing something new | behaviour changes, e.g. drawing something new |

## License

[CC BY-NC-ND 4.0](LICENSE): free to use, also at work and on paid projects; no selling, no charging for it, no modified versions.
