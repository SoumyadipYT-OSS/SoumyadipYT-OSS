import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';

// Token from GitHub Actions env
const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error('GITHUB_TOKEN not found in environment');
}

// GraphQL endpoint
const endpoint = 'https://api.github.com/graphql';

// Headers
const headers = {
  Authorization: `Bearer ${token}`,
};

// Username
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

// Main function
async function generateStreaks() {
  const data = await request(endpoint, query, {}, headers);
  const days = data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((week: any) => week.contributionDays);

  // Calculate streaks
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

  // SVG content
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">
  <style>
    .title { font: bold 24px sans-serif; fill: #000080; }
    .label { font: 18px sans-serif; fill: #333; }
    .value { font: bold 22px sans-serif; fill: #FF9933; }
  </style>
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <text x="50%" y="40" text-anchor="middle" class="title">GitHub Streaks</text>
  <text x="50%" y="80" text-anchor="middle" class="label">Current Streak</text>
  <text x="50%" y="110" text-anchor="middle" class="value">${currentStreak} days</text>
  <text x="50%" y="140" text-anchor="middle" class="label">Longest Streak</text>
  <text x="50%" y="170" text-anchor="middle" class="value">${longestStreak} days</text>
</svg>
`;

  // Save SVG
  const outPath = path.join('assets', 'streaks.svg');
  fs.writeFileSync(outPath, svg);
  console.log(`Streaks SVG generated at ${outPath}`);
}

generateStreaks().catch((err) => {
  console.error('Error generating streaks:', err);
});
