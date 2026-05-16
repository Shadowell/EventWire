import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../", import.meta.url);

async function readProjectFile(path) {
  const url = new URL(path, root);
  assert.ok(existsSync(url), `${path} should exist`);
  return readFile(url, "utf8");
}

async function importAppModule() {
  const url = new URL("app.mjs", root);
  assert.ok(existsSync(url), "app.mjs should exist");
  return import(url);
}

test("product document describes the subscription delivery loop", async () => {
  const doc = await readProjectFile("docs/eventwire.md");

  assert.match(doc, /EventWire/);
  assert.match(doc, /Founding Pro/);
  assert.match(doc, /\$9\/month/);
  assert.match(doc, /Telegram private channel/);
  assert.match(doc, /No profit promises/);
});

test("public page is English and focused on subscriber conversion", async () => {
  const html = await readProjectFile("index.html");

  assert.match(html, /EventWire/);
  assert.match(html, /Founding Pro/);
  assert.match(html, /\$9/);
  assert.match(html, /Private Telegram Channel/);
  assert.match(html, /Live Signal Feed/);
  assert.match(html, /Join Founding Pro/);
  assert.doesNotMatch(html, /Daily Distribution Engine/);
  assert.doesNotMatch(html, /Webhook/);
  assert.doesNotMatch(html, /给你看的运营页/);
});

test("ops page is Chinese and exposes internal automation controls", async () => {
  const html = await readProjectFile("ops.html");

  assert.match(html, /给你看的运营页/);
  assert.match(html, /Lemon Squeezy 收款配置/);
  assert.match(html, /每日自动分发/);
  assert.match(html, /X \/ Reddit \/ Discord \/ Telegram \/ Substack/);
  assert.match(html, /生成文案预览/);
  assert.match(html, /上线检查清单/);
  assert.match(html, /GitHub Pages/);
  assert.match(html, /返回英文用户页/);
});

test("signal filtering supports category and score thresholds", async () => {
  const { filterSignals } = await importAppModule();
  const signals = [
    { category: "Crypto", score: 91, title: "BTC volume spike" },
    { category: "Politics", score: 88, title: "Election odds shift" },
    { category: "Crypto", score: 62, title: "Thin liquidity" },
  ];

  const result = filterSignals(signals, { category: "Crypto", minScore: 80 });

  assert.deepEqual(result.map((signal) => signal.title), ["BTC volume spike"]);
});

test("signal summary reports top signal and average score", async () => {
  const { summarizeSignals } = await importAppModule();
  const summary = summarizeSignals([
    { category: "Crypto", score: 91, priceMove: 13 },
    { category: "Politics", score: 84, priceMove: -6 },
    { category: "Crypto", score: 73, priceMove: 4 },
  ]);

  assert.equal(summary.total, 3);
  assert.equal(summary.topScore, 91);
  assert.equal(summary.averageScore, 83);
  assert.equal(summary.categories.Crypto, 2);
});

test("distribution plan includes every requested publishing channel", async () => {
  const { getDistributionChannels } = await import(new URL("distribution.mjs", root));
  const channels = getDistributionChannels();

  assert.deepEqual(
    channels.map((channel) => channel.id),
    ["x", "reddit", "discord", "telegram", "substack"],
  );
  assert.equal(channels.find((channel) => channel.id === "discord").mode, "webhook");
  assert.equal(channels.find((channel) => channel.id === "telegram").mode, "bot");
  assert.equal(channels.find((channel) => channel.id === "substack").status, "draft-first");
});

test("daily post generator creates platform-specific copy", async () => {
  const { buildDailyDistribution } = await import(new URL("distribution.mjs", root));
  const plan = buildDailyDistribution({
    date: "2026-05-16",
    checkoutUrl: "https://example.lemonsqueezy.com/buy/founding-pro",
    signals: [
      { category: "Crypto", score: 94, title: "BTC weekly strike market repriced fast", priceMove: 13, volume: "+420%" },
      { category: "Politics", score: 88, title: "Election headline market broke its baseline", priceMove: 9, volume: "+210%" },
    ],
  });

  assert.equal(plan.date, "2026-05-16");
  assert.match(plan.posts.x.body, /EventWire/);
  assert.match(plan.posts.x.body, /https:\/\/example\.lemonsqueezy\.com/);
  assert.match(plan.posts.reddit.title, /Daily prediction-market anomalies/);
  assert.match(plan.posts.discord.body, /Top signal/);
  assert.match(plan.posts.telegram.body, /Founding Pro/);
  assert.match(plan.posts.substack.markdown, /## Top Signals/);
});

test("daily distribution can be exported as publish-ready artifacts", async () => {
  const { buildDailyDistribution, buildDistributionArtifacts } = await import(new URL("distribution.mjs", root));
  const plan = buildDailyDistribution({
    date: "2026-05-16",
    checkoutUrl: "https://example.lemonsqueezy.com/buy/eventwire-founding-pro",
    signals: [
      { category: "Crypto", score: 94, title: "BTC weekly strike market repriced fast", priceMove: 13, volume: "+420%" },
    ],
  });
  const artifacts = buildDistributionArtifacts(plan);

  assert.deepEqual(
    artifacts.map((artifact) => artifact.path),
    [
      "2026-05-16/x.txt",
      "2026-05-16/reddit.md",
      "2026-05-16/discord.txt",
      "2026-05-16/telegram.txt",
      "2026-05-16/substack.md",
      "2026-05-16/distribution.json",
    ],
  );
  assert.match(artifacts.find((artifact) => artifact.path.endsWith("x.txt")).content, /EventWire/);
  assert.match(artifacts.find((artifact) => artifact.path.endsWith("substack.md")).content, /# EventWire/);
  assert.equal(JSON.parse(artifacts.find((artifact) => artifact.path.endsWith("distribution.json")).content).date, "2026-05-16");
});

test("github pages workflow publishes the static site", async () => {
  const workflow = await readProjectFile(".github/workflows/static-pages.yml");

  assert.match(workflow, /Deploy Static Site/);
  assert.match(workflow, /actions\/upload-pages-artifact/);
  assert.match(workflow, /actions\/deploy-pages/);
});
