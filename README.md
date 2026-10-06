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

Auto-update is **off** by default for marketplaces outside Anthropic. To turn it on: `/plugin` → **Marketplaces** → **li-technologies** → **Enable auto-update**. Claude Code then checks for new versions in the background after a session starts.

To update by hand:

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
- `/hamster-status` shows where the story stands. The other `/hamster-…` commands are there if you want to peek, but the story is better unspoiled.

## Versioning

Each plugin follows semantic versioning in its `plugin.json`; an update reaches you only when the version changes.

| Bump | spinner-quips | hamster-saga |
| --- | --- | --- |
| patch `x.y.Z` | quip text changes, new quips | small fixes, chapter text tweaks |
| minor `x.Y.0` | new categories, small behaviour changes | new seasons and new content |
| major `X.0.0` | behaviour changes, e.g. drawing something new | behaviour changes, e.g. drawing something new |

## License

[CC BY-NC-ND 4.0](LICENSE): free to use, also at work and on paid projects; no selling, no charging for it, no modified versions.
