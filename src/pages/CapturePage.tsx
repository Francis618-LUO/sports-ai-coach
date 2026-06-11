import { useState } from 'react';
import type { SportType, PoseOption, PoseAnalysis, AIAnalysisResult } from '../types';
import { PoseSelector } from '../components/PoseSelector';
import { CameraCapture } from '../components/CameraCapture';
import { VideoCapture } from '../components/VideoCapture';
import { MotionSequence } from '../components/MotionSequence';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { analyzePose } from '../services/api';
import { calculateScore, extractJointAngles } from '../utils/angleCalculator';
import { extractFrames, smartFrameCount } from '../utils/frameExtractor';

interface Props {
  sport: SportType;
  onComplete: (poseData: PoseAnalysis, ai: AIAnalysisResult) => void;
  onBack: () => void;
}

type Step = 'select' | 'capture' | 'preview' | 'analyzing' | 'motion_preview';
type CaptureMode = 'photo' | 'video';

export function CapturePage({ sport, onComplete, onBack }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [selectedPose, setSelectedPose] = useState<PoseOption | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzePhase, setAnalyzePhase] = useState<'pose' | 'ai'>('pose');
  const [motionFrames, setMotionFrames] = useState<Array<{ image: string; landmarks: Array<{ x: number; y: number; visibility: number }> }>>([]);
  const { detectPose, detectPoseBatch, error: poseError } = usePoseDetection();

  const sportEmoji = sport === 'tennis' ? '🎾' : '⛳';
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';

  const handlePoseSelect = (pose: PoseOption) => {
    setSelectedPose(pose);
    // 视频类动作自动切换到视频模式
    if (pose.mode === 'video') {
      setCaptureMode('video');
    }
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
    if (step === 'select') {
      onBack();
    } else if (step === 'capture') {
      setSelectedPose(null);
      setStep('select');
    } else if (step === 'motion_preview') {
      setMotionFrames([]);
      setStep('capture');
    } else {
      setCapturedImage(null);
      setStep('capture');
    }
  };

  // ─── 视频模式：接收视频 → 抽帧 → 批量检测 ───
  const handleVideoReady = async (videoBlob: Blob) => {
    setStep('analyzing');
    setAnalyzePhase('pose');

    try {
      const durationEstimate = 3; // 保守估计
      const frameCount = smartFrameCount(durationEstimate);
      const frames = await extractFrames(videoBlob, frameCount);

      if (frames.length < 2) {
        setStep('capture');
        return;
      }

      const results = await detectPoseBatch(frames);
      const validFrames = results
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map((r) => ({ image: r.image, landmarks: r.landmarks }));

      if (validFrames.length < 2) {
        setStep('capture');
        return;
      }

      setMotionFrames(validFrames);
      setStep('motion_preview');

      // 用第一帧的角度做AI分析
      const firstFrame = validFrames[0];
      const angles = extractJointAngles(firstFrame.landmarks);
      const score = calculateScore(angles);

      setAnalyzePhase('ai');
      try {
        const aiResult = await analyzePose(sport, selectedPose!.id, angles);
        if (!aiResult.overallScore) aiResult.overallScore = score.totalScore;
        const poseData: PoseAnalysis = {
          landmarks: firstFrame.landmarks,
          angles: angles.map((a, idx) => {
            const scored = score.angleScores[idx];
            if (scored) {
              a.status = scored.score >= 90 ? 'normal' : scored.score >= 60 ? 'warning' : 'issue';
              a.deviation = Math.round(Math.abs(a.value - (scored.idealMin + scored.idealMax) / 2));
            }
            return a;
          }),
          imageBase64: firstFrame.image,
          poseTypeId: selectedPose!.id,
          motionFrames: validFrames,
        };
        onComplete(poseData, aiResult);
      } catch {
        const fallbackAI: AIAnalysisResult = {
          overallScore: score.totalScore,
          summary: `动作视频分析完成！捕捉到 ${validFrames.length} 帧有效姿态。综合评分：${score.totalScore}分。`,
          issues: [],
          exercises: [],
        };
        const poseData: PoseAnalysis = {
          landmarks: firstFrame.landmarks,
          angles,
          imageBase64: firstFrame.image,
          poseTypeId: selectedPose!.id,
          motionFrames: validFrames,
        };
        onComplete(poseData, fallbackAI);
      }
    } catch {
      setStep('capture');
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage || !selectedPose) return;
    setStep('analyzing');
    setAnalyzePhase('pose');

    const poseResult = await detectPose(capturedImage);
    if (!poseResult) {
      setStep('preview');
      return;
    }
    poseResult.poseTypeId = selectedPose.id;

    // 计算基础评分
    const score = calculateScore(poseResult.angles);
    poseResult.angles = poseResult.angles.map((a) => {
      const scored = score.angleScores.find((s) => s.name === a.name);
      if (scored) {
        a.status = scored.score >= 90 ? 'normal' : scored.score >= 60 ? 'warning' : 'issue';
        a.deviation = Math.round(Math.abs(a.value - (scored.idealMin + scored.idealMax) / 2));
      }
      return a;
    });

    setAnalyzePhase('ai');
    try {
      const aiResult = await analyzePose(sport, selectedPose.id, poseResult.angles);
      // 如果AI没有返回分数，使用本地计算的分数
      if (!aiResult.overallScore) {
        aiResult.overallScore = score.totalScore;
      }
      onComplete(poseResult, aiResult);
    } catch (apiErr) {
      const msg = apiErr instanceof Error ? apiErr.message : 'AI分析失败';
      const fallbackAI: AIAnalysisResult = {
        overallScore: score.totalScore,
        summary: `动作扫描已完成！综合评分：${score.totalScore}分（${score.level}）。AI云端分析暂时不可用：${msg}`,
        issues: score.angleScores
          .filter((s) => s.score < 80)
          .map((s) => ({
            bodyPart: s.name,
            problem: `角度 ${s.value}°，偏离理想范围 ${s.idealMin}°-${s.idealMax}°`,
            correction: `建议对照镜子或录像，将${s.name}调整至理想范围内`,
            severity: s.score < 60 ? ('high' as const) : ('medium' as const),
          })),
        exercises: [
          { step: 1, name: '镜子练习', description: '面对镜子摆出标准姿势，对比并调整', reps: '3组 × 10次', tip: '注意各关节角度' },
          { step: 2, name: '录像回放', description: '用手机录制动作，自行对比分析', reps: '每次训练录制3-5次', tip: '关注本次检测到的问题部位' },
        ],
      };
      onComplete(poseResult, fallbackAI);
    }
  };

  const stepLabel = step === 'select'
    ? '选择动作'
    : step === 'capture'
    ? '拍照'
    : step === 'preview'
    ? '预览'
    : '分析中';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <button onClick={handleBackFromCapture} className="text-slate-500 text-lg px-2">
          ← {step === 'select' ? '首页' : '上一步'}
        </button>
        <span className="text-xl">{sportEmoji}</span>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">{sportName} · 动作分析</h2>
          <p className="text-xs text-slate-400">{stepLabel} · {selectedPose?.name || '未选择'}</p>
        </div>
        {/* Progress dots */}
        <div className="ml-auto flex gap-1.5">
          {(['select', 'capture', 'preview', 'analyzing'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-slate-800' : step === 'analyzing' && i <= 3 ? 'bg-green-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
        {step === 'select' && (
          <PoseSelector sport={sport} selected={selectedPose?.id || null} onSelect={handlePoseSelect} />
        )}

        {step === 'capture' && selectedPose && (
          <div className="space-y-6">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                ✓ {selectedPose.name}
              </span>
              <p className="text-xs text-slate-500 mt-2">{selectedPose.description}</p>
            </div>

            {/* 照片/视频模式切换 */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setCaptureMode('photo')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  captureMode === 'photo' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                📷 照片
              </button>
              <button
                onClick={() => setCaptureMode('video')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  captureMode === 'video' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                🎬 视频
              </button>
            </div>

            {captureMode === 'photo' ? (
              <CameraCapture onPhotoReady={handlePhotoReady} />
            ) : (
              <VideoCapture onVideoReady={handleVideoReady} />
            )}

            <button onClick={handleBackFromCapture} className="text-sm text-slate-400 text-center w-full">
              重新选择动作
            </button>
          </div>
        )}

        {step === 'motion_preview' && motionFrames.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                🎬 {selectedPose?.name}
              </span>
              <p className="text-xs text-slate-400 mt-1">动作轨迹分析</p>
            </div>
            <MotionSequence frames={motionFrames} />
            <button
              onClick={() => {
                setMotionFrames([]);
                setStep('capture');
              }}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200"
            >
              🔄 重新录制
            </button>
          </div>
        )}

        {step === 'preview' && capturedImage && selectedPose && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                {selectedPose.name}
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img src={capturedImage} alt="照片预览" className="w-full block" />
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                预览
              </div>
            </div>
            {poseError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">⚠️ {poseError}</p>
                <p className="text-red-500 text-xs mt-1">请调整光线或角度后重新拍摄</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200 transition-colors"
              >
                📷 重新拍摄
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700 transition-colors"
              >
                🔍 开始AI分析 →
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-slate-700 font-semibold text-lg">
                {analyzePhase === 'pose' ? '🔍 正在检测人体姿态...' : '🧠 AI教练正在分析你的动作...'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {analyzePhase === 'pose'
                  ? 'MediaPipe Pose · 提取33个骨骼关键点'
                  : 'DeepSeek大模型 · 生成专业训练建议'}
              </p>
            </div>
            <div className="flex gap-1.5 mt-4">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  analyzePhase === 'pose' ? 'w-12 bg-slate-800 animate-pulse' : 'w-12 bg-green-500'
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  analyzePhase === 'ai' ? 'w-12 bg-slate-800 animate-pulse' : 'w-12 bg-slate-200'
                }`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-6">首次加载模型可能需要10-15秒</p>
          </div>
        )}
      </div>
    </div>
  );
}
