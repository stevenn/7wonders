# Wonders Companion

An unofficial, offline-capable PWA companion for the board game *7 Wonders*.

- **Score pad**: tap-to-score grid for 3–7 players, with helpers (coins → VP, science sets with wild symbols, guild/commerce counts, wonder stages). Ties are broken by coins. Finished games go into a local history with a win tally.
- **Science**: optimal wild assignment and how many points each next symbol is worth.
- **War**: enter shields at the end of each age to get victory/defeat tokens for every player. These feed into the score pad.
- **Wonders**: A/B stages for all 7 base wonders, with strategy tips.
- **Guide**: rules in 60 seconds, scoring, strategy, free-build chains, common mistakes.

No build step and no dependencies. Data stays in the browser's localStorage.

## Run locally
```bash
python3 -m http.server 8000
```
Open http://localhost:8000.

## Deploy
Live at https://wonders-companion.stevenn-a65.workers.dev (Cloudflare Workers static assets; config in `wrangler.jsonc`, excluded files in `.assetsignore`).
```bash
npx wrangler deploy
```
Needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Install on a phone
Open the live URL on the phone, then:
- iOS Safari: Share → Add to Home Screen
- Android Chrome: menu → Install app

When you change any file, bump `VERSION` in `sw.js` so installed copies update.
