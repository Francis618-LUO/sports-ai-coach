import type { ScoreBreakdown } from '../types';

interface Props {
  score: ScoreBreakdown;
}

export function ScoreGauge({ score }: Props) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score.totalScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-4">
      {/* 环形进度条 */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={score.totalScore >= 80 ? '#16A34A' : score.totalScore >= 60 ? '#D97706' : '#DC2626'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${score.levelColor}`}>
            {score.totalScore}
          </span>
          <span className="text-xs text-slate-400">分</span>
        </div>
      </div>

      {/* 评级 */}
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xl">{score.levelEmoji}</span>
        <span className={`text-lg font-bold ${score.levelColor}`}>{score.level}</span>
      </div>
    </div>
  );
}
