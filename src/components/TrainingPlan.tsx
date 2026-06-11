import type { AIAnalysisResult } from '../types';

interface Props {
  exercises: AIAnalysisResult['exercises'];
}

export function TrainingPlan({ exercises }: Props) {
  if (exercises.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-800 text-sm">🏋️ 训练计划</h3>
      {exercises.map((ex) => (
        <div
          key={ex.step}
          className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex-shrink-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {ex.step}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm">{ex.name}</h4>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{ex.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                🔁 {ex.reps}
              </span>
              <span className="text-xs px-2 py-1 bg-amber-50 rounded-full text-amber-700">
                💡 {ex.tip}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
