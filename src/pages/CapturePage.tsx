import type { SportType, PoseAnalysis, AIAnalysisResult } from '../types';

interface Props {
  sport: SportType;
  onComplete: (poseData: PoseAnalysis, ai: AIAnalysisResult) => void;
  onBack: () => void;
}

export function CapturePage({ sport, onBack }: Props) {
  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={onBack} className="text-slate-500 text-lg px-2">← 返回</button>
        <span className="text-xl">{sportEmoji}</span>
        <h2 className="font-bold text-slate-800">{sportName} · 动作分析</h2>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400">拍照功能即将实现...</p>
      </div>
    </div>
  );
}
