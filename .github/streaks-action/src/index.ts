import { writeFileSync } from "fs";
import { Octokit } from "@octokit/rest";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
  username: string;
  output: string;
}

async function fetchContributions(octokit: Octokit, user: string) {
  const { data: events } = await octokit.activity.listEventsForUser({
    username: user,
    per_page: 100
  });

  // আজ থেকে 30 দিন আগে পর্যন্ত contribution streak হিসেব
  const dates = events
    .map(e => new Date(e.created_at).toISOString().slice(0, 10));
  const unique = new Set(dates);
  return Array.from(unique).sort(); // YYYY-MM-DD ascending
}

function computeStreaks(dates: string[]) {
  const today = new Date();
  let current = 0, longest = 0, lastDate: Date | null = null;

  for (const d of dates) {
    const date = new Date(d);
    if (!lastDate) {
      current = 1;
    } else {
      const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) current += 1;
      else current = 1;
    }
    longest = Math.max(longest, current);
    lastDate = date;
  }

  // Reset current if no contribution yesterday/today
  const delta = lastDate
    ? (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  if (delta > 1) current = 0;

  return { current, longest };
}

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
    .option("output", { type: "string", demandOption: true })
    .parseSync() as Args;

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const dates = await fetchContributions(octokit, argv.username);
  const { current, longest } = computeStreaks(dates);
  const svg = renderSVG(current, longest);
  writeFileSync(argv.output, svg, "utf-8");

  console.log(`Wrote streaks: ${current} current, ${longest} longest`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
