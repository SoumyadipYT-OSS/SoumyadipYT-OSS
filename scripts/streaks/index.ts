import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { calculateStreaks, ContributionDay } from './calculateStreaks';
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
  try {
    const data = await request(endpoint, query, {}, headers);
    const days: ContributionDay[] = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays);

    const { currentStreak, longestStreak, totalActiveDays } = calculateStreaks(days);

    const svg = renderStreakSVG(currentStreak, longestStreak, totalActiveDays);

    const outPath = path.join('assets', 'streaks.svg');
    fs.writeFileSync(outPath, svg);
    console.log(`Streaks SVG generated at ${outPath}`);
  } catch (err) {
    console.error('Error generating streaks:', err);
    process.exit(1);
  }
}

generateStreaks();
