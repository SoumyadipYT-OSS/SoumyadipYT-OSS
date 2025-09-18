import { writeFileSync } from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
  username: string;
  output: string;
  verbose: boolean;
}

async function fetchContributions(username: string): Promise<string[]> {
  const url = `https://github.com/users/${username}/contributions`;
  const res = await axios.get<string>(url);
  if (res.status !== 200) {
    throw new Error(`Failed to fetch contributions page: ${res.status}`);
  }

  const $ = cheerio.load(res.data);
  const dates: string[] = [];

  $("rect").each((_, rect) => {
    const countAttr = $(rect).attr("data-count");
    const dateAttr  = $(rect).attr("data-date");
    const count = countAttr ? parseInt(countAttr, 10) : 0;
    if (count > 0 && dateAttr) {
      dates.push(dateAttr);
    }
  });

  // Remove duplicates and sort
  return Array.from(new Set(dates)).sort();
}

function computeStreaks(dates: string[]): { current: number; longest: number } {
  const today = new Date();
  let current = 0;
  let longest = 0;
  let lastDate: Date | null = null;

  for (const d of dates) {
    const date = new Date(d);
    if (!lastDate) {
      current = 1;
    } else {
      const diff =
        (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      current = diff === 1 ? current + 1 : 1;
    }
    longest = Math.max(longest, current);
    lastDate = date;
  }

  if (lastDate) {
    const delta =
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (delta > 1) {
      current = 0;
    }
  }

  return { current, longest };
}

function renderSVG(current: number, longest: number): string {
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
</svg>`.trim();
}

async function main(): Promise<void> {
  const argv = yargs(hideBin(process.argv))
    .option("username", { type: "string", demandOption: true })
    .option("output",   { type: "string", demandOption: true })
    .option("verbose",  { type: "boolean", default: false })
    .parseSync() as Args;

  const dates = await fetchContributions(argv.username);
  if (argv.verbose) {
    console.log("🗓️ Fetched dates:", dates);
  }

  const { current, longest } = computeStreaks(dates);
  if (argv.verbose) {
    console.log(`Computed streaks → current=${current}, longest=${longest}`);
  }

  const svg = renderSVG(current, longest);
  writeFileSync(argv.output, svg, "utf-8");
  console.log(`Wrote ${argv.output}: current=${current}, longest=${longest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
