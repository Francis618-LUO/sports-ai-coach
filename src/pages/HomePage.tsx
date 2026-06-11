import type { SportType } from '../types';
import { SportSelector } from '../components/SportSelector';

interface Props {
  onStart: (sport: SportType) => void;
  onHistory: () => void;
}

export function HomePage({ onStart, onHistory }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏌️‍♂️🎾</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI运动姿态教练</h1>
          <p className="text-slate-500 text-sm">拍照 → AI姿态检测 → 专业训练建议</p>
        </div>
        <SportSelector onSelect={onStart} />

        {/* History button */}
        <button
          onClick={onHistory}
          className="mt-6 w-full py-3 bg-white text-slate-600 rounded-xl font-medium border border-slate-200 active:bg-slate-50 transition-colors text-sm"
        >
          📜 查看分析历史
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 pb-8">
        AI驱动 · 浏览器端姿态检测 · 隐私安全 · 支持23种动作
      </p>
    </div>
  );
}
