import { useRef, useState, useEffect } from 'react';
import type { SportType, PoseAnalysis, AIAnalysisResult, HistoryEntry } from '../types';
import { PoseOverlay } from '../components/PoseOverlay';
import { AnalysisReport } from '../components/AnalysisReport';
import { TrainingPlan } from '../components/TrainingPlan';
import { ScoreGauge } from '../components/ScoreGauge';
import { AngleDashboard } from '../components/AngleDashboard';
import { MotionSequence } from '../components/MotionSequence';
import { calculateScore } from '../utils/angleCalculator';
import { generateReportCard } from '../utils/reportCard';

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
  const [savingCard, setSavingCard] = useState(false);
  const [cardSaved, setCardSaved] = useState(false);

  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';
  const score = calculateScore(analysis.angles);
  const displayScore = { ...score, totalScore: aiResult.overallScore ?? score.totalScore };

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

  const handleSaveCard = async () => {
    setSavingCard(true);
    try {
      const blob = await generateReportCard(
        analysis.imageBase64, analysis.landmarks, displayScore.totalScore,
        sport, aiResult, analysis.angles,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `运动分析报告_${new Date().toLocaleDateString('zh-CN')}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 3000);
    } catch { /* ignore */ }
    setSavingCard(false);
  };

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
          <button onClick={handleSave} disabled={saved}
            className={`ml-auto text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              saved ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-600 active:bg-slate-200'
            }`}>
            {saved ? '✓ 已保存' : '💾 保存记录'}
          </button>
        </div>

        {/* Score */}
        <div className="bg-white border-b"><ScoreGauge score={displayScore} /></div>

        {/* Pose Image */}
        <div className="relative bg-black">
          <img ref={imgRef} src={analysis.imageBase64} alt="分析照片" className="w-full block" />
          <PoseOverlay landmarks={analysis.landmarks} width={imgSize.width} height={imgSize.height} />
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            绿色骨骼 = AI检测姿态
          </div>
        </div>

        {/* Angle Summary */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {analysis.angles.slice(0, 6).map((a) => {
              const icon = a.status === 'normal' ? '✓' : a.status === 'warning' ? '⚠' : '✗';
              const color = a.status === 'normal' ? 'text-green-600' : a.status === 'warning' ? 'text-amber-600' : 'text-red-500';
              return (
                <span key={a.name} className="flex-shrink-0 text-xs bg-slate-50 rounded-lg px-2.5 py-1.5">
                  <span className={color}>{icon} </span>
                  <span className="text-slate-500">{a.name}</span>{' '}
                  <strong className="text-slate-800">{a.value}°</strong>
                </span>
              );
            })}
          </div>
        </div>

        {/* Motion Sequence */}
        {analysis.motionFrames && analysis.motionFrames.length > 0 && (
          <div className="px-4 py-4 bg-white border-b">
            <MotionSequence frames={analysis.motionFrames} />
          </div>
        )}

        {/* Detailed Content */}
        <div className="p-4 space-y-6">
          <AngleDashboard score={score} />
          <AnalysisReport result={aiResult} />
          <TrainingPlan exercises={aiResult.exercises} />

          {/* Save Card Button */}
          <button onClick={handleSaveCard} disabled={savingCard}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${
              cardSaved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
            }`}>
            {savingCard ? '⏳ 正在生成...' : cardSaved ? '✅ 报告卡片已保存到相册！' : '📸 保存分析报告卡片'}
          </button>

          {/* Bottom Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack}
              className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700">
              分析新动作
            </button>
            {!saved && (
              <button onClick={handleSave}
                className="flex-1 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 active:bg-slate-50">
                保存到历史记录
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
