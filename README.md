# Claude Limit Bar — Browser Extension

**See your Claude usage limit before you hit it — never get cut off mid-task again.** Shows your remaining Claude usage limit (the "5-hour" and "weekly" windows) right in the input bar on claude.ai, next to the model picker.

Reads the exact same usage numbers your own account already sees, renders them locally, and talks to nothing but claude.ai — no account, no server, no tracking, no telemetry. Free, open-source (MIT), and small enough (one file) to read start to finish before you trust it.

Want the same thing without a browser — a floating overlay and tray icon that work even when the browser is closed? See [claude-limit-bar-desktop](https://github.com/dmminga1983/claude-limit-bar-desktop) (Windows).

Without this extension you have to open a menu to check how much limit is left. With it, you see it immediately — a color-coded bar with a percentage, plus the exact time until reset on hover.

## What it shows

Two compact bar-pills, like:

```
[████████░░ 5h 60%]   [██░░░░░░░░ wk 20%]
```

- fill = how much you've used, color shifts **green → yellow (from 70%) → red (from 90%)**;
- the text (window name + percentage) sits on top of the fill and stays readable;
- hovering over the bars shows a tooltip with the exact time until reset;
- refreshes once a minute and whenever you return to the tab;
- in narrow windows the bars just shrink, they never disappear.

## Install

1. Download and unzip the archive (or this repository: **Code → Download ZIP**).
2. Open `chrome://extensions` in Chrome.
3. Turn on **"Developer mode"** (toggle in the top right).
4. Click **"Load unpacked"** and pick this repository's folder (the one with `manifest.json` and `bar.js`).
5. Open or refresh claude.ai — the bars will appear next to the model name.

Works in Chrome and Chromium-based browsers (Edge, Brave, Yandex Browser, etc.). Does not work inside the Claude desktop app — that's not technically possible there.

To update the extension after replacing the files, just click the ⟳ ("Reload") button on the extension's card in `chrome://extensions`.

## How it works

The extension reads limit data from the same internal site endpoint your own claude.ai account already uses (`/api/organizations/.../usage`) and draws the bars. It sends nothing anywhere — all the code lives in one file, `bar.js`, which you can open and read yourself.

## Security

This is an unofficial extension, not made by Anthropic. It does not store or transmit passwords or personal data anywhere except claude.ai itself, on behalf of your own already-signed-in session.

Full privacy policy: [PRIVACY.md](./PRIVACY.md).

## License

Free and open-source for any purpose — [MIT License](./LICENSE).

## Like it?

A ⭐ on the repo tells me people actually want this — it's the only metric that keeps this project alive.
