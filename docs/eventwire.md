# EventWire

## 1. Product Positioning

EventWire is a market-intelligence subscription for prediction-market participants. It does not promise profit, provide personalized financial advice, or place trades for users. It helps subscribers discover public-market anomalies faster.

Core promise:

> Track Polymarket price moves, volume spikes, liquidity gaps, new markets, and settlement-risk windows without refreshing Polymarket all day.

Primary customer:

- Prediction-market traders who already follow Polymarket.
- Crypto/news traders who want early signals from event markets.
- Content writers who publish daily prediction-market recaps.
- Data builders who want a curated alert stream before buying raw data.

## 1.1 Page Split

There are two pages:

- `index.html`: English public landing page for potential subscribers.
- `ops.html`: Chinese internal operator page for the founder, covering Lemon Squeezy setup, Telegram delivery, and daily distribution automation.

Keep implementation details such as webhook status, dry-run mode, and scheduler notes on `ops.html`, not on the public landing page.

## 2. Founding Pro Subscription

The first sellable offer should be simple:

```text
Founding Pro
$9/month
First 50 members only
Delivered through a Telegram private channel
```

The founding price is intentionally low because the product starts as a lightweight automated feed, not a full SaaS dashboard. The goal is to validate whether people will pay for timely market intelligence before building accounts, billing portals, and custom dashboards.

## 3. What Paid Members Receive

Free content:

- One daily public recap.
- Top 5 market anomalies.
- Delayed highlights.

Founding Pro:

- Telegram private channel access.
- Near-real-time alerts for price moves, volume spikes, and new hot markets.
- Daily market brief with all detected anomalies.
- Category filters in the dashboard prototype: Crypto, Politics, Sports, Tech, Macro.
- Early access to custom watchlists.

Future Power tier:

- Custom alert rules.
- CSV export.
- Webhook delivery.
- Historical anomaly archive.
- Backtesting data slices.

## 4. Telegram Private Channel Delivery

The first version should avoid a heavy membership system.

Manual MVP flow with Lemon Squeezy:

```text
Landing page
-> Lemon Squeezy Checkout link
-> User pays $9/month
-> Founder sends Telegram invite link
-> User receives alert feed in the private channel
-> If subscription is cancelled, user is removed manually
```

Automation upgrade:

```text
Payment success webhook
-> Create limited-use Telegram invite link
-> Send onboarding email
-> Store subscriber status
-> Subscription cancellation webhook
-> Revoke access or flag for removal
```

## 5. Lemon Squeezy Setup

Use Lemon Squeezy first because it is lighter than building a full Stripe integration.

Steps:

1. Create a Lemon Squeezy store.
2. Create a subscription product named `EventWire - Founding Pro`.
3. Set the price to `$9/month`.
4. Copy the hosted checkout URL.
5. Put the URL into `LEMON_SQUEEZY_CHECKOUT_URL`.
6. Replace the page placeholder with that checkout URL.
7. Add a Lemon Squeezy webhook later for subscription-created and subscription-cancelled events.

The static page expects:

```js
window.__EVENTWIRE_CONFIG__ = {
  lemonSqueezyCheckoutUrl: "https://your-store.lemonsqueezy.com/buy/eventwire-founding-pro"
};
```

## 6. Alert Types

The feed should focus on observable public-market signals:

- Price Move: A market price changes sharply over a defined window.
- Volume Spike: Trading volume rises far above recent baseline.
- Liquidity Gap: Spread is wide or available depth is thin.
- New Market Heat: A new market quickly attracts attention.
- Resolution Risk: A market is close to settlement and rules matter.
- Cross-Market Divergence: Polymarket differs from another public probability source.

Example alert:

```text
[Volume Alert]
Market: Will BTC hit $120k by Friday?
Price: 18% -> 31% in 2h
Volume: +420%
Liquidity: $85k
Possible catalyst: BTC spot move plus crypto news spike
```

## 7. Daily Distribution Automation

The product should publish a daily public teaser while paid users receive the private alert stream.

Channels:

- X: daily short thread with top 3 anomalies.
- Reddit: daily text post, only in communities that allow recurring market-intelligence posts.
- Discord: webhook post to a public/community channel.
- Telegram: bot post to the paid private channel.
- Substack: generated Markdown newsletter draft.

Implementation path:

```text
node scripts/daily-distribution.mjs
-> build platform-specific copy
-> dry-run by default
-> --send posts to Discord and Telegram when keys exist
-> --send posts X, Reddit, and Substack payloads to external automation webhooks when URLs exist
```

Use GitHub Actions, cron, or any server scheduler to run it once per day.

Environment variables:

```text
LEMON_SQUEEZY_CHECKOUT_URL
DISCORD_WEBHOOK_URL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
X_AUTOMATION_WEBHOOK_URL
REDDIT_AUTOMATION_WEBHOOK_URL
SUBSTACK_DRAFT_WEBHOOK_URL
```

## 8. Compliance Boundary

The product should stay on the safer side of the line:

- No profit promises.
- No "guaranteed arbitrage" claims.
- No personalized buy/sell instructions.
- No automated trading on behalf of users.
- No guidance to bypass geographic restrictions.
- Use public market data and clearly label analysis as informational.

Good wording:

```text
Market intelligence
Anomaly alerts
Liquidity and volume monitor
Resolution-risk tracker
```

Avoid wording:

```text
稳赚套利
必买信号
Guaranteed profit
80% win rate
```

## 9. First 14-Day Launch Plan

Day 1-2:

- Build landing page and sample alert feed.
- Publish one public sample brief.
- Create Lemon Squeezy Checkout link for Founding Pro.

Day 3-5:

- Post daily anomaly screenshots on X, Reddit, and relevant Discord groups.
- Collect emails and Telegram interest.
- Run `node scripts/daily-distribution.mjs` daily in dry-run mode.

Day 6-7:

- Open Founding Pro for $9/month.
- Manually invite the first paying users to the Telegram private channel.

Day 8-14:

- Add category filters.
- Add more alert types.
- Ask subscribers which alerts they actually read.
- Keep only the alert types that create replies, shares, or renewals.
- Turn on Discord and Telegram automatic posting after reviewing the generated copy for a few days.

## 10. Validation Metrics

Continue only if the first outreach cycle reaches:

- 100 free subscribers or followers.
- 10 meaningful replies.
- 3-5 paid Founding Pro subscribers.

If the product misses those numbers, change the niche, not the whole technology stack.
