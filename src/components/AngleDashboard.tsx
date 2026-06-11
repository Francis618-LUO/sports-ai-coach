import type { ScoreBreakdown } from '../types';

interface Props {
  score: ScoreBreakdown;
}

function statusColor(score: number): string {
  if (score >= 90) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function statusBg(score: number): string {
  if (score >= 90) return 'bg-green-50';
  if (score >= 60) return 'bg-amber-50';
  return 'bg-red-50';
}

export function AngleDashboard({ score }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-800 text-sm">📊 关节角度分析</h3>
      <div className="space-y-2">
        {score.angleScores.map((a) => {
          const barColor = statusColor(a.score);
          return (
            <div key={a.name} className={`p-3 rounded-xl ${statusBg(a.score)}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">{a.name}</span>
                <span className="text-sm font-bold text-slate-800">
                  {a.value}°
                  <span className="text-xs text-slate-400 ml-1">
                    (理想 {a.idealMin}°-{a.idealMax}°)
                  </span>
                </span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${a.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>{a.idealMin}°</span>
                <span>{a.score}分</span>
                <span>{a.idealMax}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
