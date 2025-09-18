// Define the shape of a single contribution day
export interface ContributionDay {
  date: string;
  contributionCount: number;
}

// Define the result structure for streak statistics
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

/**
 * Calculate GitHub streak statistics from a list of contribution days.
 * @param days - Array of ContributionDay objects in chronological order.
 * @returns An object containing currentStreak, longestStreak, and totalActiveDays.
 */
export function calculateStreaks(days: ContributionDay[]): StreakStats {
  // Calculate current streak by iterating backward until a zero-contribution day
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak and total active days
  let longestStreak = 0;
  let tempStreak = 0;
  let totalActiveDays = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      tempStreak++;
      totalActiveDays++;
    } else {
      // Update longestStreak if the temporary streak is greater
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  // Final check in case the longest streak ends on the last day
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
  };
}
