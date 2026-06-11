import type { SportType, PoseAnalysis, AIAnalysisResult } from '../types';

interface Props {
  sport: SportType;
  analysis: PoseAnalysis;
  aiResult: AIAnalysisResult;
  onBack: () => void;
}

export function ResultPage({ sport, onBack }: Props) {
  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 p-4 bg-white border-b">
        <button onClick={onBack} className="text-slate-500 text-lg px-2">← 返回</button>
        <span className="text-xl">{sportEmoji}</span>
        <h2 className="font-bold text-slate-800">分析结果</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-10">
        <p className="text-slate-400">结果页即将实现...</p>
      </div>
    </div>
  );
}
