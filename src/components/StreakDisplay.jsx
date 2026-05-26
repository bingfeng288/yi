import { calcStreak, calcBestStreak, getTodayCount, getLast7Days } from '../data/streak';

export default function StreakDisplay({ dailyVisits, dailyGoal, onSetDailyGoal }) {
  const streak = calcStreak(dailyVisits);
  const bestStreak = calcBestStreak(dailyVisits);
  const todayCount = getTodayCount(dailyVisits);
  const last7 = getLast7Days(dailyVisits);
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todayCount / dailyGoal) * 100)) : 0;
  const goalMet = todayCount >= dailyGoal;

  return (
    <div className="yi-card p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{streak > 0 ? '🔥' : '🕐'}</span>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink-950 dark:text-ink-50">{streak}</span>
              <span className="text-sm text-ink-400 dark:text-ink-300">天连续学习</span>
            </div>
            {bestStreak > 0 && (
              <p className="text-[11px] text-ink-300 dark:text-ink-400">最佳纪录 {bestStreak} 天</p>
            )}
          </div>
        </div>

        {/* 7-day heatmap */}
        <div className="flex gap-1.5">
          {last7.map((day) => {
            const intensity = day.count === 0 ? 0 : day.count >= dailyGoal ? 2 : 1;
            const colors = ['bg-ink-100 dark:bg-ink-800', 'bg-ink-400', 'bg-ink-950 dark:bg-ink-100'];
            return (
              <div key={day.date} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors
                    ${colors[intensity]}
                    ${day.isToday ? 'ring-2 ring-ink-950 dark:ring-ink-100 ring-offset-1 dark:ring-offset-ink-950' : ''}
                    ${intensity === 0 ? 'text-ink-300' : 'text-white'}`}
                >
                  {day.dayNum}
                </div>
                <span className="text-[9px] text-ink-300 dark:text-ink-400">{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily goal progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-500 dark:text-ink-200">
              今日目标 {goalMet ? '✓' : ''}
            </span>
            <span className={goalMet ? 'text-green-600 font-medium' : 'text-ink-400 dark:text-ink-300'}>
              {todayCount}/{dailyGoal}
            </span>
          </div>
          <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goalMet ? 'bg-green-500' : 'bg-ink-950 dark:bg-ink-100'}`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
        <select
          value={dailyGoal}
          onChange={(e) => onSetDailyGoal(Number(e.target.value))}
          className="text-xs border border-ink-200 dark:border-ink-700 rounded-lg px-2 py-1 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 focus:outline-none focus:ring-1 focus:ring-ink-400"
        >
          {[1, 2, 3, 5, 8, 10].map(n => (
            <option key={n} value={n}>{n}篇/天</option>
          ))}
        </select>
      </div>
    </div>
  );
}
