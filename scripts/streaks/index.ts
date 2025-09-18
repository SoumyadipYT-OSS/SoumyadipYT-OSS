import dotenv from 'dotenv';
dotenv.config();

import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { calculateStreaks, ContributionDay } from './calculateStreaks';
import { renderStreakSVG } from './renderStreakSVG';

// Load GitHub token from environment
const token = process.env.STREAKS_TOKEN;
if (!token) {
  throw new Error('GITHUB_TOKEN not found in environment');
}

// GitHub GraphQL API endpoint and headers
const endpoint = 'https://api.github.com/graphql';
const headers = {
  Authorization: `Bearer ${token}`,
};

// GitHub username to query
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

// Main function to generate streaks and write SVG
async function generateStreaks() {
  try {
    const data = await request(endpoint, query, {}, headers);

    if (!data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
      throw new Error('No contribution data returned');
    }

    const days: ContributionDay[] = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays);

    if (days.length === 0) {
      throw new Error('Contribution calendar is empty');
    }

    const { currentStreak, longestStreak, totalActiveDays } = calculateStreaks(days);
    const svg = renderStreakSVG(currentStreak, longestStreak, totalActiveDays);

    const outPath = path.resolve(__dirname, '../../assets/streaks.svg');
    const dir = path.dirname(outPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }

    fs.writeFileSync(outPath, svg, { encoding: 'utf-8' });
    console.log(`Streaks SVG generated at ${outPath}`);
    console.log('Preview:\n', svg.slice(0, 200), '...');
  } catch (err) {
    console.error('Error generating streaks:', err);
    process.exit(1);
  }
}

generateStreaks();
