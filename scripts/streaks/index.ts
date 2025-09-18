import dotenv from 'dotenv';
dotenv.config();

import { request, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { calculateStreaks, ContributionDay } from './calculateStreaks';
import { renderStreakSVG } from './renderStreakSVG';

// GraphQL response type
interface GithubContributionsResponse {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: {
          contributionDays: ContributionDay[];
        }[];
      };
    };
  };
}

// Load GitHub token from env (workflow injects STREAKS_TOKEN)
const token = process.env.STREAKS_TOKEN;
if (!token) {
  throw new Error('STREAKS_TOKEN not found in environment');
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
    // Fetch and type the response
    const data = await request<GithubContributionsResponse>(
      endpoint,
      query,
      {},
      headers
    );

    const weeks = data.user.contributionsCollection.contributionCalendar.weeks;
    if (weeks.length === 0) {
      throw new Error('No contribution data returned');
    }

    const days: ContributionDay[] = weeks.flatMap(week => week.contributionDays);

    // Optional debug logs
    console.log('First day:', days[0]);
    console.log('Last day:', days[days.length - 1]);

    const { currentStreak, longestStreak, totalActiveDays } = calculateStreaks(days);
    console.log({ currentStreak, longestStreak, totalActiveDays });

    const svg = renderStreakSVG(currentStreak, longestStreak, totalActiveDays);

    // Ensure assets directory exists
    const assetsDir = path.resolve(process.cwd(), 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
      console.log(`Created directory: ${assetsDir}`);
    }

    const outPath = path.join(assetsDir, 'streaks.svg');
    fs.writeFileSync(outPath, svg, 'utf-8');
    console.log(`Streaks SVG generated at ${outPath}`);
  } catch (err) {
    console.error('Error generating streaks:', err);
    process.exit(1);
  }
}

generateStreaks();
