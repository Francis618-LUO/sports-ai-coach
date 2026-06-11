import { useState } from 'react';
import type { SportType, PoseOption, PoseAnalysis, AIAnalysisResult } from '../types';
import { PoseSelector } from '../components/PoseSelector';
import { CameraCapture } from '../components/CameraCapture';

interface Props {
  sport: SportType;
  onComplete: (poseData: PoseAnalysis, ai: AIAnalysisResult) => void;
  onBack: () => void;
}

type Step = 'select' | 'capture' | 'preview';

export function CapturePage({ sport, onBack }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [selectedPose, setSelectedPose] = useState<PoseOption | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <button onClick={step === 'select' ? onBack : handleBackFromCapture} className="text-slate-500 text-lg px-2">
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
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200"
              >
                重新拍摄
              </button>
              <button
                onClick={() => {
                  // TODO: Task 5 will add pose detection here
                  alert('姿态检测功能即将在下一步实现');
                }}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700"
              >
                开始分析 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
