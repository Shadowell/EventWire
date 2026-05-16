const distributionChannels = [
  {
    id: "x",
    name: "X",
    mode: "api-or-webhook",
    status: "credential-required",
    schedule: "Daily 09:00 UTC",
    note: "Use X Developer API or a trusted automation webhook.",
  },
  {
    id: "reddit",
    name: "Reddit",
    mode: "oauth-submit",
    status: "rules-review",
    schedule: "Daily 09:10 UTC",
    note: "Post only where subreddit rules allow recurring market intelligence.",
  },
  {
    id: "discord",
    name: "Discord",
    mode: "webhook",
    status: "ready-first",
    schedule: "Daily 09:20 UTC",
    note: "Lowest-friction public/community distribution channel.",
  },
  {
    id: "telegram",
    name: "Telegram",
    mode: "bot",
    status: "ready-first",
    schedule: "Daily 09:30 UTC",
    note: "Primary paid-channel delivery path.",
  },
  {
    id: "substack",
    name: "Substack",
    mode: "markdown-draft",
    status: "draft-first",
    schedule: "Daily 10:00 UTC",
    note: "Generate a polished Markdown brief first; publish manually or via an approved workflow.",
  },
];

export function getDistributionChannels() {
  return distributionChannels.map((channel) => ({ ...channel }));
}

function formatMove(move) {
  return `${move > 0 ? "+" : ""}${move}%`;
}

function normalizeSignals(signals) {
  return [...signals].sort((a, b) => b.score - a.score).slice(0, 5);
}

function buildSignalLines(signals) {
  return normalizeSignals(signals).map((signal, index) => {
    return `${index + 1}. ${signal.title} (${signal.category}, score ${signal.score}, ${formatMove(signal.priceMove)}, volume ${signal.volume})`;
  });
}

export function buildDailyDistribution({ date, signals, checkoutUrl }) {
  const topSignals = normalizeSignals(signals);
  const topSignal = topSignals[0];
  const signalLines = buildSignalLines(topSignals);
  const checkoutLine = `Founding Pro: ${checkoutUrl}`;

  return {
    date,
    checkoutUrl,
    posts: {
      x: {
        title: "EventWire daily anomaly thread",
        body: [
          `EventWire - ${date}`,
          "",
          "Top prediction-market anomalies today:",
          ...signalLines.slice(0, 3),
          "",
          checkoutLine,
          "",
          "Market intelligence only. No profit promises.",
        ].join("\n"),
      },
      reddit: {
        title: `Daily prediction-market anomalies - ${date}`,
        body: [
          "Sharing a daily market-intelligence recap built from public prediction-market data.",
          "",
          "Top Signals:",
          ...signalLines,
          "",
          "This is not financial advice or a buy/sell recommendation.",
          checkoutLine,
        ].join("\n"),
      },
      discord: {
        title: `Daily anomaly brief - ${date}`,
        body: [
          `**EventWire - ${date}**`,
          `Top signal: **${topSignal.title}** (${topSignal.category}, score ${topSignal.score})`,
          "",
          signalLines.join("\n"),
          "",
          checkoutLine,
        ].join("\n"),
      },
      telegram: {
        title: `EventWire - ${date}`,
        body: [
          `EventWire - ${date}`,
          `Founding Pro members get the full alert stream.`,
          "",
          signalLines.join("\n"),
          "",
          checkoutLine,
        ].join("\n"),
      },
      substack: {
        title: `EventWire: Daily anomalies for ${date}`,
        markdown: [
          `# EventWire: Daily anomalies for ${date}`,
          "",
          "A daily market-intelligence brief generated from public prediction-market signals.",
          "",
          "## Top Signals",
          "",
          ...signalLines.map((line) => `- ${line.replace(/^[0-9]+\\. /, "")}`),
          "",
          "## Founding Pro",
          "",
          `Founding Pro is $9/month and delivered through a private Telegram channel: ${checkoutUrl}`,
          "",
          "_Informational market intelligence only. No profit promises._",
        ].join("\n"),
      },
    },
  };
}
