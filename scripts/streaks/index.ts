import dotenv from 'dotenv';                // load .env in local dev
dotenv.config();

import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { calculateStreaks, ContributionDay } from './calculateStreaks';
import { renderStreakSVG } from './renderStreakSVG';

// Token from environment
const token = process.env.GITHUB_TOKEN;
if (!token) {
  throw new Error('GITHUB_TOKEN not found in environment');
}

const endpoint = 'https://api.github.com/graphql';
const headers = { Authorization: `Bearer ${token}` };
const username = 'SoumyadipYT-OSS';

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

async function generateStreaks() {
  try {
    const data: any = await request(endpoint, query, {}, headers);

    if (!data?.user?.contributionsCollection) {
      throw new Error('No contribution data returned');
    }

    const days: ContributionDay[] = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap((w: any) => w.contributionDays);

    const { currentStreak, longestStreak, totalActiveDays } = calculateStreaks(days);
    const svg = renderStreakSVG(currentStreak, longestStreak, totalActiveDays);

    const outPath = path.resolve(__dirname, '../../assets/streaks.svg');
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outPath, svg, { encoding: 'utf-8' });
    console.log(`Streaks SVG generated at ${outPath}`);
  } catch (err) {
    console.error('Error generating streaks:', err);
    process.exit(1);
  }
}

generateStreaks();
