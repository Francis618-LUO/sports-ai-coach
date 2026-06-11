import { useState } from 'react';
import type { SportType, PoseOption, PoseAnalysis, AIAnalysisResult } from '../types';
import { PoseSelector } from '../components/PoseSelector';
import { CameraCapture } from '../components/CameraCapture';
import { usePoseDetection } from '../hooks/usePoseDetection';

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
  const { detectPose, isLoading, error: poseError } = usePoseDetection();

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
    const result = await detectPose(capturedImage);

    if (!result) {
      setStep('preview'); // 回到预览页显示错误
      return;
    }

    // Task 7 will add the API call here, for now pass through with mock AI data
    const placeholderAI: AIAnalysisResult = {
      summary: '姿态检测完成！AI分析功能将在集成DeepSeek API后启用。当前已成功提取关节角度数据。',
      issues: [],
      exercises: [],
    };
    onComplete(result, placeholderAI);
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
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">
              {isLoading ? '正在检测人体姿态...' : '处理中...'}
            </p>
            <p className="text-xs text-slate-400">使用MediaPipe Pose进行本地AI推理</p>
          </div>
        )}
      </div>
    </div>
  );
}
