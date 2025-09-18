import { writeFileSync } from "fs";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
  username: string;
  output: string;
  verbose?: boolean;
}

// ① contributions-página স্ক্র্যাপ করে data-date সংগ্রহ
async function fetchContributions(username: string): Promise<string[]> {
  const url = `https://github.com/users/${username}/contributions`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch contributions page: ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  const dates: string[] = [];

  $("rect").each((_, rect) => {
    const count = parseInt($(rect).attr("data-count") || "0", 10);
    const date  = $(rect).attr("data-date");
    if (count > 0 && date) {
      dates.push(date);
    }
  });

  return dates.sort();
}

// ② স্ট্রিক গণনা
function computeStreaks(dates: string[]) {
  const today = new Date();
  let current = 0, longest = 0, lastDate: Date | null = null;

  for (const d of dates) {
    const date = new Date(d);
    if (!lastDate) {
      current = 1;
    } else {
      const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      current = diff === 1 ? current + 1 : 1;
    }
    longest = Math.max(longest, current);
    lastDate = date;
  }

  const delta = lastDate
    ? (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  if (delta > 1) current = 0;

  return { current, longest };
}

// ③ SVG তৈরির টেমপ্লেট
function renderSVG(current: number, longest: number) {
  return `
<svg width="250" height="80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 14px sans-serif; fill: #333; }
    .value { font: bold 24px sans-serif; fill: #0366d6; }
  </style>
  <text x="10" y="25" class="title">Current Streak</text>
  <text x="10" y="55" class="value">${current} days</text>
  <text x="130" y="25" class="title">Longest Streak</text>
  <text x="130" y="55" class="value">${longest} days</text>
</svg>`;
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option("username", { type: "string", demandOption: true })
    .option("output",   { type: "string", demandOption: true })
    .option("verbose",  { type: "boolean", default: false })
    .parseSync() as Args;

  const dates = await fetchContributions(argv.username);
  if (argv.verbose) console.log("🗓️ dates:", dates);

  const { current, longest } = computeStreaks(dates);
  if (argv.verbose) console.log(`🏅 streaks → current=${current}, longest=${longest}`);

  const svg = render
