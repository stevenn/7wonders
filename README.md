# Wonders Companion

An unofficial, offline-capable PWA companion for the board game *7 Wonders*.

Dutch-only, for the 2020 (2nd) edition. All data was checked against a physical Dutch 2020 copy (wonder boards, card overview, guilds).

- **Score**: tap-to-score pad for 3–7 players with helpers (coins, science with wilds, guilds, Age III yellow cards, wonder stages). Ties go to most coins. Local history with win tally.
- **Wetenschap**: best use of wild symbols and how much each next symbol is worth.
- **Oorlog**: enter shields per age to get every player's military tokens; feeds the score pad.
- **Wonders**: Day/Night stages for all 7 wonders, with tips.
- **Gids**: step-by-step rules for a first game, colour overview, beginner tips, free-build chains.

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
