import { useState } from 'react';
import type { SportType, PoseOption, PoseAnalysis, AIAnalysisResult } from '../types';
import { PoseSelector } from '../components/PoseSelector';
import { CameraCapture } from '../components/CameraCapture';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { analyzePose } from '../services/api';

interface Props {
  sport: SportType;
  onComplete: (poseData: PoseAnalysis, ai: AIAnalysisResult) => void;
  onBack: () => void;
}

type Step = 'select' | 'capture' | 'preview' | 'analyzing';

export function CapturePage({ sport, onComplete, onBack }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [selectedPose, setSelectedPose] = useState<PoseOption | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzePhase, setAnalyzePhase] = useState<'pose' | 'ai'>('pose');
  const { detectPose, error: poseError } = usePoseDetection();

  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';

  const handlePoseSelect = (pose: PoseOption) => {
    setSelectedPose(pose);
    setStep('capture');
  };

  const handlePhotoReady = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setStep('preview');
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStep('capture');
  };

  const handleBackFromCapture = () => {
    setSelectedPose(null);
    setCapturedImage(null);
    setStep('select');
  };

  const handleAnalyze = async () => {
    if (!capturedImage || !selectedPose) return;
    setStep('analyzing');
    setAnalyzePhase('pose');

    const result = await detectPose(capturedImage);

    if (!result) {
      setStep('preview'); // 回到预览页让用户看到错误信息并重试
      return;
    }

    setAnalyzePhase('ai');
    try {
      const aiResult = await analyzePose(sport, selectedPose.id, result.angles);
      onComplete(result, aiResult);
    } catch (apiErr) {
      const msg = apiErr instanceof Error ? apiErr.message : 'AI分析失败';
      const fallbackAI: AIAnalysisResult = {
        summary: `姿态检测已完成，但AI分析出错：${msg}。请检查API配置后重试。`,
        issues: [],
        exercises: [],
      };
      onComplete(result, fallbackAI);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <button
          onClick={step === 'select' ? onBack : handleBackFromCapture}
          className="text-slate-500 text-lg px-2"
        >
          ← 返回
        </button>
        <span className="text-xl">{sportEmoji}</span>
        <h2 className="font-bold text-slate-800">{sportName} · 动作分析</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
        {step === 'select' && (
          <PoseSelector sport={sport} selected={null} onSelect={handlePoseSelect} />
        )}

        {step === 'capture' && selectedPose && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                {selectedPose.name}
              </span>
              <p className="text-xs text-slate-500 mt-2">{selectedPose.description}</p>
            </div>
            <CameraCapture onPhotoReady={handlePhotoReady} />
          </div>
        )}

        {step === 'preview' && capturedImage && selectedPose && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                {selectedPose.name}
              </span>
            </div>
            <img src={capturedImage} alt="照片预览" className="w-full rounded-xl shadow-lg" />
            {poseError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {poseError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200"
              >
                重新拍摄
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700"
              >
                开始分析 →
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-14 h-14 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-slate-700 font-semibold text-lg">
                {analyzePhase === 'pose' ? '正在检测人体姿态...' : 'AI教练正在分析你的动作...'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {analyzePhase === 'pose'
                  ? '使用 MediaPipe Pose 进行本地 AI 推理'
                  : '通过 DeepSeek 大模型生成专业训练建议'}
              </p>
            </div>
            {/* 进度指示器 */}
            <div className="flex gap-2 mt-4">
              <div className={`w-20 h-1.5 rounded-full transition-colors ${analyzePhase === 'pose' ? 'bg-slate-800' : 'bg-green-500'}`} />
              <div className={`w-20 h-1.5 rounded-full transition-colors ${analyzePhase === 'ai' ? 'bg-slate-800 animate-pulse' : 'bg-slate-200'}`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
