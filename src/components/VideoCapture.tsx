import { useEffect } from 'react';
import { useVideoRecorder } from '../hooks/useVideoRecorder';

interface Props {
  onVideoReady: (videoBlob: Blob) => void;
}

export function VideoCapture({ onVideoReady }: Props) {
  const { isRecording, videoBlob, videoUrl, elapsed, error, startRecording, stopRecording, reset } =
    useVideoRecorder();

  // 录制完成后把 blob 传出去
  useEffect(() => {
    if (videoBlob) onVideoReady(videoBlob);
  }, [videoBlob, onVideoReady]);

  return (
    <div className="flex flex-col items-center gap-4">
      {isRecording ? (
        <>
          <div className="relative">
            <div className="w-44 h-44 rounded-full border-4 border-red-400 flex items-center justify-center bg-red-50 animate-pulse">
              <div className="w-28 h-28 rounded-full bg-red-500 flex flex-col items-center justify-center">
                <span className="text-white font-bold text-2xl">{elapsed.toFixed(1)}</span>
                <span className="text-red-200 text-xs">秒</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 animate-pulse">● 录制中</p>
          <button
            onClick={stopRecording}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-lg active:bg-red-600 transition-colors"
          >
            点击停止录制 ⏹
          </button>
        </>
      ) : videoUrl ? (
        <>
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full max-w-sm rounded-xl shadow-lg"
            autoPlay
            loop
            muted
          />
          <div className="flex gap-3 w-full">
            <button
              onClick={reset}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium active:bg-slate-200"
            >
              🔄 重录
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center space-y-3 mb-2">
            <div className="text-5xl">🎬</div>
            <p className="text-sm text-slate-600 font-medium">录制动作短视频</p>
            <p className="text-xs text-slate-400">建议 3-5 秒 · 全身入镜 · 光线充足</p>
          </div>
          <button
            onClick={startRecording}
            className="w-36 h-36 rounded-full bg-red-500 text-white font-bold text-lg shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center border-8 border-red-200 gap-1"
          >
            <span className="text-2xl">●</span>
            <span className="text-sm">点击录制</span>
          </button>
          <p className="text-xs text-slate-400">再次点击停止</p>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg w-full text-center">{error}</p>
          )}
        </>
      )}
    </div>
  );
}
