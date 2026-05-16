import { buildDailyDistribution, getDistributionChannels } from "./distribution.mjs";

const defaultSignals = [
  {
    category: "Crypto",
    score: 94,
    title: "BTC weekly strike market repriced fast",
    market: "BTC above $120k by Friday",
    priceMove: 13,
    volume: "+420%",
    liquidity: "$85k",
    window: "2h",
    kind: "Price Move",
  },
  {
    category: "Politics",
    score: 88,
    title: "Election headline market broke its baseline",
    market: "Candidate mention market",
    priceMove: 9,
    volume: "+210%",
    liquidity: "$48k",
    window: "4h",
    kind: "Volume Spike",
  },
  {
    category: "Sports",
    score: 81,
    title: "Finals market spread is wider than normal",
    market: "Championship winner",
    priceMove: -5,
    volume: "+74%",
    liquidity: "$31k",
    window: "1h",
    kind: "Liquidity Gap",
  },
  {
    category: "Tech",
    score: 77,
    title: "New AI product launch market is heating up",
    market: "Major model release this month",
    priceMove: 7,
    volume: "+160%",
    liquidity: "$22k",
    window: "6h",
    kind: "New Market Heat",
  },
  {
    category: "Crypto",
    score: 72,
    title: "Thin depth near resolution creates slippage risk",
    market: "ETH daily close range",
    priceMove: -4,
    volume: "+58%",
    liquidity: "$12k",
    window: "45m",
    kind: "Resolution Risk",
  },
];

export { defaultSignals };

export function filterSignals(signals, filters = {}) {
  const category = filters.category || "All";
  const minScore = Number(filters.minScore || 0);

  return signals.filter((signal) => {
    const categoryMatches = category === "All" || signal.category === category;
    return categoryMatches && signal.score >= minScore;
  });
}

export function summarizeSignals(signals) {
  if (signals.length === 0) {
    return {
      total: 0,
      topScore: 0,
      averageScore: 0,
      categories: {},
    };
  }

  const categories = signals.reduce((counts, signal) => {
    counts[signal.category] = (counts[signal.category] || 0) + 1;
    return counts;
  }, {});
  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);
  const topScore = Math.max(...signals.map((signal) => signal.score));

  return {
    total: signals.length,
    topScore,
    averageScore: Math.round(totalScore / signals.length),
    categories,
  };
}

function formatMove(move) {
  return `${move > 0 ? "+" : ""}${move}%`;
}

function renderSignals(signals) {
  const list = document.querySelector("#signal-list");
  if (!list) return;
  list.innerHTML = "";

  if (signals.length === 0) {
    const empty = document.createElement("p");
    empty.className = "lede";
    empty.textContent = "No signals match the current filter.";
    list.append(empty);
    return;
  }

  for (const signal of signals) {
    const card = document.createElement("article");
    card.className = "signal-card";
    card.innerHTML = `
      <div class="signal-score">${signal.score}</div>
      <div>
        <p class="signal-title">${signal.title}</p>
        <div class="signal-meta">
          <span>${signal.category}</span>
          <span>${signal.kind}</span>
          <span>${signal.volume} volume</span>
          <span>${signal.liquidity} liquidity</span>
          <span>${signal.window}</span>
        </div>
      </div>
      <div class="signal-move">${formatMove(signal.priceMove)}</div>
    `;
    list.append(card);
  }
}

function renderMetrics(signals) {
  const summary = summarizeSignals(signals);
  const total = document.querySelector("#metric-total");
  const score = document.querySelector("#metric-score");
  const top = document.querySelector("#metric-top");
  if (total) total.textContent = summary.total;
  if (score) score.textContent = summary.averageScore;
  if (top) top.textContent = summary.topScore;
}

function renderDistribution() {
  const list = document.querySelector("#channel-list");
  if (!list) return;

  const channels = getDistributionChannels();
  list.innerHTML = "";

  for (const channel of channels) {
    const card = document.createElement("article");
    card.className = "channel-card";
    card.innerHTML = `
      <div>
        <p class="channel-name">${channel.name}</p>
        <p class="channel-note">${channel.note}</p>
      </div>
      <div class="channel-meta">
        <span>${channel.mode}</span>
        <span>${channel.status}</span>
        <span>${channel.schedule}</span>
      </div>
    `;
    list.append(card);
  }

  const preview = document.querySelector("#distribution-preview");
  if (!preview) return;
  const checkoutUrl =
    window.__EVENTWIRE_CONFIG__?.lemonSqueezyCheckoutUrl ||
    "https://your-store.lemonsqueezy.com/buy/eventwire-founding-pro";
  const distribution = buildDailyDistribution({
    date: "2026-05-16",
    signals: defaultSignals,
    checkoutUrl,
  });
  preview.textContent = distribution.posts.telegram.body;
}

function initDashboard() {
  let activeCategory = "All";
  let minScore = 70;
  const scoreInput = document.querySelector("#score-input");
  const scoreLabel = document.querySelector("#score-label");
  const chips = Array.from(document.querySelectorAll("[data-category]"));

  function update() {
    const filtered = filterSignals(defaultSignals, { category: activeCategory, minScore });
    if (scoreLabel) scoreLabel.textContent = `${minScore}+`;
    renderSignals(filtered);
    renderMetrics(filtered);
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category;
      for (const item of chips) {
        item.classList.toggle("active", item === chip);
      }
      update();
    });
  }

  if (scoreInput) {
    scoreInput.addEventListener("input", (event) => {
      minScore = Number(event.target.value);
      update();
    });
  }

  const checkoutButton = document.querySelector("#checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const checkoutUrl =
        window.__EVENTWIRE_CONFIG__?.lemonSqueezyCheckoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        return;
      }
      window.alert("Add your Lemon Squeezy Checkout URL to window.__EVENTWIRE_CONFIG__.lemonSqueezyCheckoutUrl or replace the button link.");
    });
  }

  renderDistribution();
  update();
}

if (typeof document !== "undefined") {
  initDashboard();
}
