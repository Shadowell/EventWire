#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { buildDailyDistribution, buildDistributionArtifacts, getDistributionChannels } from "../distribution.mjs";

const sampleSignals = [
  { category: "Crypto", score: 94, title: "BTC weekly strike market repriced fast", priceMove: 13, volume: "+420%" },
  { category: "Politics", score: 88, title: "Election headline market broke its baseline", priceMove: 9, volume: "+210%" },
  { category: "Sports", score: 81, title: "Finals market spread is wider than normal", priceMove: -5, volume: "+74%" },
  { category: "Tech", score: 77, title: "New AI product launch market is heating up", priceMove: 7, volume: "+160%" },
];

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}: ${await response.text()}`);
  }
}

async function sendDiscord(post) {
  if (!process.env.DISCORD_WEBHOOK_URL) return "missing DISCORD_WEBHOOK_URL";
  await postJson(process.env.DISCORD_WEBHOOK_URL, { content: post.body });
  return "sent";
}

async function sendTelegram(post) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return "missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID";
  }
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await postJson(url, {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: post.body,
    disable_web_page_preview: true,
  });
  return "sent";
}

async function sendAutomationWebhook(name, url, payload) {
  if (!url) return `missing ${name} automation webhook`;
  await postJson(url, payload);
  return "sent";
}

async function main() {
  const dryRun = !process.argv.includes("--send");
  const shouldWrite = process.argv.includes("--write");
  const date = getArg("date", new Date().toISOString().slice(0, 10));
  const outDir = getArg("out-dir", "dist/daily");
  const checkoutUrl = getArg(
    "checkout-url",
    process.env.LEMON_SQUEEZY_CHECKOUT_URL || "https://your-store.lemonsqueezy.com/buy/eventwire-founding-pro",
  );
  const distribution = buildDailyDistribution({ date, checkoutUrl, signals: sampleSignals });

  if (shouldWrite) {
    const artifacts = buildDistributionArtifacts(distribution);
    for (const artifact of artifacts) {
      const target = join(outDir, artifact.path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, artifact.content, "utf8");
    }
    console.log(JSON.stringify({ wrote: artifacts.map((artifact) => join(outDir, artifact.path)) }, null, 2));
    return;
  }

  if (dryRun) {
    console.log(JSON.stringify({ channels: getDistributionChannels(), distribution }, null, 2));
    return;
  }

  const results = {
    discord: await sendDiscord(distribution.posts.discord),
    telegram: await sendTelegram(distribution.posts.telegram),
    x: await sendAutomationWebhook("X", process.env.X_AUTOMATION_WEBHOOK_URL, distribution.posts.x),
    reddit: await sendAutomationWebhook("Reddit", process.env.REDDIT_AUTOMATION_WEBHOOK_URL, distribution.posts.reddit),
    substack: await sendAutomationWebhook("Substack", process.env.SUBSTACK_DRAFT_WEBHOOK_URL, distribution.posts.substack),
  };
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
