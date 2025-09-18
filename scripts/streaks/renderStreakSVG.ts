export function renderStreakSVG(
  currentStreak: number,
  longestStreak: number,
  totalActiveDays: number
): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 600 220"
     preserveAspectRatio="xMidYMid meet"
     role="img"
     aria-labelledby="title desc">
  <title id="title">GitHub Streaks</title>
  <desc id="desc">
    Current streak, longest streak, and total active days for SoumyadipYT-OSS.
  </desc>
  <defs>
    <linearGradient id="tricolor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF9933"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#138808"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#tricolor)"/>
  <g transform="translate(300,60)">
    <circle r="50" fill="none" stroke="#000080" stroke-width="4"/>
  </g>
  <g class="streak-group" text-anchor="middle" fill="#000">
    <text x="300" y="150" font="bold 22px sans-serif">
      Current: ${currentStreak} days
    </text>
    <text x="300" y="180" font="bold 22px sans-serif">
      Longest: ${longestStreak} days
    </text>
    <text x="300" y="210" font="bold 22px sans-serif">
      Active Days: ${totalActiveDays}
    </text>
  </g>
</svg>
  `;
}
