# EventWire

EventWire is a lightweight prediction-market intelligence prototype.

It has two static pages:

- `index.html`: English public landing page for subscribers.
- `ops.html`: Chinese internal operator page for Lemon Squeezy setup and daily distribution automation.

## Preview

```bash
python3 -m http.server 5173
```

Open:

- Public page: `http://127.0.0.1:5173/`
- Ops page: `http://127.0.0.1:5173/ops.html`

## Test

```bash
node --test tests/page-content.test.mjs
```

## Daily Distribution Dry Run

```bash
node scripts/daily-distribution.mjs \
  --date=2026-05-16 \
  --checkout-url=https://example.lemonsqueezy.com/buy/eventwire-founding-pro
```

Configure secrets from `.env.example` before enabling real Discord, Telegram, or external automation webhook sending.

Generate publish-ready drafts locally:

```bash
node scripts/daily-distribution.mjs \
  --write \
  --date=2026-05-16 \
  --checkout-url=https://example.lemonsqueezy.com/buy/eventwire-founding-pro
```

This writes platform drafts under `dist/daily/<date>/`.

## Deploy

The repository includes `.github/workflows/static-pages.yml` for GitHub Pages deployment from the `main` branch. Enable GitHub Pages in the repository settings and select GitHub Actions as the source.
