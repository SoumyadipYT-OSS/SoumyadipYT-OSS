export function renderStreakSVG(
  currentStreak: number,
  longestStreak: number,
  totalActiveDays: number
): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="220">
  <style>
    .title { font: bold 24px sans-serif; fill: #000080; }
    .label { font: 18px sans-serif; fill: #333; }
    .value { font: bold 22px sans-serif; fill: #FF9933; }
    .bg { fill: url(#tricolor); }
  </style>
  <defs>
    <linearGradient id="tricolor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF9933" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#138808" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" class="bg"/>
  <text x="50%" y="40" text-anchor="middle" class="title">GitHub Streaks</text>
  <text x="50%" y="80" text-anchor="middle" class="label">Current Streak</text>
  <text x="50%" y="110" text-anchor="middle" class="value">${currentStreak} days</text>
  <text x="50%" y="140" text-anchor="middle" class="label">Longest Streak</text>
  <text x="50%" y="170" text-anchor="middle" class="value">${longestStreak} days</text>
  <text x="50%" y="200" text-anchor="middle" class="label">Total Active Days: ${totalActiveDays}</text>
</svg>
  `;
}
