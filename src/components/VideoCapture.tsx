import { useRef, useState } from 'react';

interface Props {
  onVideoReady: (videoBlob: Blob) => void;
}

export function VideoCapture({ onVideoReady }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('请选择视频文件');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('视频文件不能超过50MB');
      return;
    }

    setError('');
    setFileName(file.name);
    onVideoReady(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center space-y-3">
        <div className="text-5xl">🎬</div>
        <p className="text-sm text-slate-600 font-medium">上传动作视频</p>
        <p className="text-xs text-slate-400">
          MP4 / WebM / MOV · 建议3-10秒 · 全身入镜 · 小于50MB
        </p>
      </div>

      {fileName ? (
        <div className="flex flex-col items-center gap-3">
          <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✓ {fileName}
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-sm text-slate-500 underline"
          >
            重新选择
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-4 bg-slate-800 text-white rounded-xl font-semibold text-lg active:bg-slate-700 transition-colors"
        >
          📁 选择视频文件
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg w-full text-center">
          {error}
        </p>
      )}
    </div>
  );
}
