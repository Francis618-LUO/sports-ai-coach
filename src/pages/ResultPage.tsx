import { useRef, useState, useEffect } from 'react';
import type { SportType, PoseAnalysis, AIAnalysisResult, HistoryEntry } from '../types';
import { PoseOverlay } from '../components/PoseOverlay';
import { AnalysisReport } from '../components/AnalysisReport';
import { TrainingPlan } from '../components/TrainingPlan';
import { ScoreGauge } from '../components/ScoreGauge';
import { AngleDashboard } from '../components/AngleDashboard';
import { calculateScore } from '../utils/angleCalculator';

interface Props {
  sport: SportType;
  analysis: PoseAnalysis;
  aiResult: AIAnalysisResult;
  onBack: () => void;
  onSave: (entry: HistoryEntry) => void;
}

export function ResultPage({ sport, analysis, aiResult, onBack, onSave }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ width: 400, height: 300 });
  const [saved, setSaved] = useState(false);

  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';
  const score = calculateScore(analysis.angles);

  // 用AI返回的分数（如果有）
  const displayScore = {
    ...score,
    totalScore: aiResult.overallScore ?? score.totalScore,
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const updateSize = () => setImgSize({ width: img.clientWidth, height: img.clientHeight });
    img.addEventListener('load', updateSize);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      img.removeEventListener('load', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleSave = () => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('zh-CN'),
      sport,
      poseName: `${sportName}分析`,
      score: displayScore.totalScore,
      imageBase64: analysis.imageBase64,
      aiResult,
      angles: analysis.angles,
    };
    onSave(entry);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-10">
          <button onClick={onBack} className="text-slate-500 text-lg px-2">← 返回</button>
          <span className="text-xl">{sportEmoji}</span>
          <h2 className="font-bold text-slate-800">分析结果</h2>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`ml-auto text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              saved
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-slate-100 text-slate-600 active:bg-slate-200'
            }`}
          >
            {saved ? '✓ 已保存' : '💾 保存记录'}
          </button>
        </div>

        {/* Score Gauge */}
        <div className="bg-white border-b">
          <ScoreGauge score={displayScore} />
        </div>

        {/* Pose Image with Skeleton Overlay */}
        <div className="relative bg-black">
          <img ref={imgRef} src={analysis.imageBase64} alt="分析照片" className="w-full block" />
          <PoseOverlay landmarks={analysis.landmarks} width={imgSize.width} height={imgSize.height} />
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            绿色骨骼 = AI检测的人体姿态
          </div>
        </div>

        {/* Quick Angle Summary */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {analysis.angles.slice(0, 6).map((a) => {
              const statusIcon = a.status === 'normal' ? '✓' : a.status === 'warning' ? '⚠' : '✗';
              const statusColor =
                a.status === 'normal' ? 'text-green-600' : a.status === 'warning' ? 'text-amber-600' : 'text-red-500';
              return (
                <span key={a.name} className="flex-shrink-0 text-xs bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <span className={statusColor}>{statusIcon} </span>
                  <span className="text-slate-500">{a.name}</span>{' '}
                  <strong className="text-slate-800">{a.value}°</strong>
                </span>
              );
            })}
          </div>
        </div>

        {/* Detailed Content */}
        <div className="p-4 space-y-6">
          {/* Angle Dashboard */}
          <AngleDashboard score={score} />

          {/* AI Analysis */}
          <AnalysisReport result={aiResult} />

          {/* Training Plan */}
          <TrainingPlan exercises={aiResult.exercises} />

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700 transition-colors"
            >
              分析新动作
            </button>
            {!saved && (
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 active:bg-slate-50 transition-colors"
              >
                保存到历史记录
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
