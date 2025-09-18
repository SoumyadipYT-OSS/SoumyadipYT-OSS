import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { renderStreakSVG } from './renderStreakSVG';

// Token from environment (GitHub Actions or local .env)
const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error('GITHUB_TOKEN not found in environment');
}

// GitHub GraphQL endpoint
const endpoint = 'https://api.github.com/graphql';

// Request headers
const headers = {
  Authorization: `Bearer ${token}`,
};

// GitHub username
const username = 'SoumyadipYT-OSS';

// GraphQL query to fetch contribution calendar
const query = gql`
  query {
    user(login: "${username}") {
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

// Main function to generate streaks
async function generateStreaks() {
  const data = await request(endpoint, query, {}, headers);
  const days = data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays);

  let currentStreak = 0;
  let longestStreak = 0;
  let totalActiveDays = 0;
  let tempStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    const count = days[i].contributionCount;
    if (count > 0) {
      totalActiveDays++;
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const svg = renderStreakSVG(currentStreak, longestStreak, totalActiveDays);

  const outPath = path.join('assets', 'streaks.svg');
  fs.writeFileSync(outPath, svg);
  console.log(`Streaks SVG generated at ${outPath}`);
}

generateStreaks().catch((err) => {
  console.error('Error generating streaks:', err);
});
