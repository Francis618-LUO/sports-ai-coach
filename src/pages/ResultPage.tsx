import { useRef, useState, useEffect } from 'react';
import type { SportType, PoseAnalysis, AIAnalysisResult } from '../types';
import { PoseOverlay } from '../components/PoseOverlay';
import { AnalysisReport } from '../components/AnalysisReport';
import { TrainingPlan } from '../components/TrainingPlan';

interface Props {
  sport: SportType;
  analysis: PoseAnalysis;
  aiResult: AIAnalysisResult;
  onBack: () => void;
}

export function ResultPage({ sport, analysis, aiResult, onBack }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ width: 400, height: 300 });

  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const updateSize = () => {
      setImgSize({ width: img.clientWidth, height: img.clientHeight });
    };
    img.addEventListener('load', updateSize);
    updateSize();
    return () => img.removeEventListener('load', updateSize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-10">
          <button onClick={onBack} className="text-slate-500 text-lg px-2">
            ← 返回
          </button>
          <span className="text-xl">{sportEmoji}</span>
          <h2 className="font-bold text-slate-800">分析结果</h2>
        </div>

        {/* Pose Image with Skeleton Overlay */}
        <div className="relative bg-black">
          <img
            ref={imgRef}
            src={analysis.imageBase64}
            alt="分析照片"
            className="w-full block"
          />
          <PoseOverlay
            landmarks={analysis.landmarks}
            width={imgSize.width}
            height={imgSize.height}
          />
        </div>

        {/* Angle Data Quick View */}
        <div className="px-4 py-3 bg-white border-b overflow-x-auto">
          <div className="flex gap-3 text-xs text-slate-500">
            {analysis.angles.slice(0, 5).map((a) => (
              <span key={a.name} className="flex-shrink-0">
                {a.name}: <strong className="text-slate-800">{a.value}°</strong>
              </span>
            ))}
          </div>
        </div>

        {/* AI Analysis & Training Plan */}
        <div className="p-4 space-y-6">
          <AnalysisReport result={aiResult} />
          <TrainingPlan exercises={aiResult.exercises} />
        </div>
      </div>
    </div>
  );
}
