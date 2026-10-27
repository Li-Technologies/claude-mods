# claude-mods

Small mods for [Claude Code](https://claude.com/claude-code), published as the `li-technologies` plugin marketplace.

| Plugin | What it does |
| --- | --- |
| **spinner-quips** | Replaces the spinner's generic "Working" with a short funny phrase that fits what Claude is doing: reading, implementing, debugging, designing, writing or planning. |
| **hamster-saga** | Now and then a spinner tells the next episode of a hamster's long and eventful saga. |
| **context-line** | A band above the prompt with the folder, the branch and a bar showing how much of the context window is used; hover it for exact figures and a Compact button. |

They are function-hook plugins: they run inside Claude Code itself, in the terminal and in the desktop app's Code tab. Built and tested on Claude Code 2.1.286 to 2.1.292 (context-line on 2.1.299).

## Install

```bash
claude plugin marketplace add li-technologies/claude-mods
claude plugin install spinner-quips@li-technologies
claude plugin install hamster-saga@li-technologies
claude plugin install context-line@li-technologies
```

Install any of them. Inside a session, `/plugin marketplace add li-technologies/claude-mods` and `/plugin install …` do the same. New sessions pick the plugins up; in a running one, run `/reload-plugins`.

## Updates

spinner-quips and hamster-saga keep themselves up to date; context-line does not, so update it by hand (below). Once a week, about a minute into a session, each one quietly asks Claude Code to refresh this marketplace and install its own newer version, if there is one:

```bash
claude plugin marketplace update li-technologies
claude plugin update <plugin>@li-technologies
```

They run with the same Claude Code binary as the session, so this works in the terminal and in the desktop app. There is no message; the new version loads with the next session or `/reload-plugins`. An install from before self-updating existed needs one update by hand. To turn it off, switch the plugin's **Update automatically** option off (see [Options](#options)).

### Update by hand

- **In a session**: `/spinner-quips:update` or `/hamster-saga:update` updates that plugin right away and says which version it installed (from spinner-quips 1.0.5 and hamster-saga 1.0.9 on). context-line has no such command; use one of the two routes below.
- **Desktop app**: **Plugins** → **Manage marketplaces** → **Check for updates** next to li-technologies, then open the plugin and press **Update**.
- **Terminal**:

  ```bash
  claude plugin marketplace update li-technologies
  claude plugin update spinner-quips@li-technologies
  claude plugin update hamster-saga@li-technologies
  claude plugin update context-line@li-technologies
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
- `/hamster-saga:status` shows where the story stands and the hamster's employee record, `/hamster-saga:recap` the episodes of this season so far, and `/hamster-saga:share` a line to share it, spoiler-free. The other `/hamster-saga:…` commands are there if you want to peek, but the story is better unspoiled.

## context-line

- A band above the prompt: the folder and the branch on the left, a bar and the percent of the context window used on the right. The bar is blue, amber from 70% and red from 90%.
- Hover the bar or the percent to see the exact figures (for example `Context  106.5k / 500.0k`) and a **Compact** button. One press runs `/compact` and the band shows the outcome; while a turn is running it asks you to wait.
- The figure is the one the desktop app's Context card shows, and it keeps up after a `/compact` too.
- A terminal has no pointer, so there the figures and the button stay visible and the bar is drawn in block characters.
- Tested on Claude Code 2.1.299 and in the desktop app's Code tab.

## Versioning

Each plugin follows semantic versioning in its `plugin.json`; an update reaches you only when the version changes.

| Bump | spinner-quips | hamster-saga | context-line |
| --- | --- | --- | --- |
| patch `x.y.Z` | quip text changes, new quips | small fixes, episode text tweaks | small fixes |
| minor `x.Y.0` | new categories, small behaviour changes | new seasons and new content | new things in the band |
| major `X.0.0` | behaviour changes, e.g. drawing something new | behaviour changes, e.g. drawing something new | behaviour changes |

## License

[PolyForm Internal Use 1.0.0](LICENSE), with personal use allowed as well: use the plugins for free at work, for clients and on your own projects, and change them in your own setup. Don't share copies or sell them, changed or not; to recommend them, share a link to this repository.
