export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export function calculateStreaks(days: ContributionDay[]): StreakStats {
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

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
  };
}
