import { writeFileSync } from "fs";
import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

interface Args {
  username: string;
  output: string;
  verbose?: boolean;
}

async function fetchCalendarDates(username: string): Promise<string[]> {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
  const res: any = await graphql(query, {
    login: username,
    headers: { authorization: `token ${process.env.GITHUB_TOKEN}` }
  });

  const days = res.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays)
    .filter((d: any) => d.contributionCount > 0)
    .map((d: any) => d.date)
    .sort();

  return days;
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
    .option("output",   { type: "string", demandOption: true })
    .option("verbose",  { type: "boolean", default: false })
    .parseSync() as Args;

  const dates = await fetchCalendarDates(argv.username);
  if (argv.verbose) console.log("fetched dates:", dates);

  const { current, longest } = computeStreaks(dates);
  if (argv.verbose) console.log(`streaks → current=${current}, longest=${longest}`);

  const svg = renderSVG(current, longest);
  writeFileSync(argv.output, svg, "utf-8");
  console.log(`Wrote streaks.svg: current=${current}, longest=${longest}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
