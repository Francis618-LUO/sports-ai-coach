import type { SportType, PoseOption } from '../types';
import { POSE_OPTIONS } from '../utils/poseConnections';

interface Props {
  sport: SportType;
  selected: string | null;
  onSelect: (pose: PoseOption) => void;
}

export function PoseSelector({ sport, selected, onSelect }: Props) {
  const options = POSE_OPTIONS[sport];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-600 text-center">选择要分析的动作</h3>
      <div className="grid grid-cols-1 gap-2">
        {options.map((pose) => {
          const isSelected = selected === pose.id;
          return (
            <button
              key={pose.id}
              onClick={() => onSelect(pose)}
              className={`text-left p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-slate-800 bg-slate-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-slate-800' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-3 h-3 rounded-full bg-slate-800" />}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{pose.name}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{pose.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
