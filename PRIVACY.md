# Privacy Policy

**Project:** Claude Limit Bar — browser extension
**Date:** 2026-10-09

This is an unofficial browser extension, not an official Anthropic product and not affiliated with Anthropic.

## What data it processes

The extension only runs on `https://claude.ai/*` pages. It reads your remaining usage-limit data (the "5-hour" and "weekly" windows) from the site's own internal endpoint (`/api/organizations/.../usage`), available through your own already-signed-in claude.ai session, and displays it as color-coded bars next to the model picker.

## What the extension does NOT do

- Collect, store, or transmit passwords, credentials, or personal messages.
- Send any data to the author's servers or any third party — there is no networking code beyond reading data from claude.ai itself.
- Use analytics, trackers, or ad networks.
- Run on, or request access to, any site other than claude.ai.

## Data storage

The extension does not keep anything between sessions (it doesn't request the `storage` or `cookies` permissions) — everything is re-read on every page load.

## Source code

The entire extension is open and fits in one file, `bar.js` — you're welcome to read it yourself: https://github.com/dmminga1983/claude-limit-bar-extension

## Contact

For anything related to this extension, open an issue on the GitHub repository.
