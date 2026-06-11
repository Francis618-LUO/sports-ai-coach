import { useRef } from 'react';
import { useCamera } from '../hooks/useCamera';

interface Props {
  onPhotoReady: (imageBase64: string) => void;
}

export function CameraCapture({ onPhotoReady }: Props) {
  const { videoRef, isCameraOn, error, startCamera, stopCamera, capturePhoto } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) onPhotoReady(photo);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera();
        onPhotoReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isCameraOn ? (
        <>
          <video
            ref={videoRef}
            className="w-full max-w-sm rounded-xl shadow-lg"
            playsInline
            muted
          />
          <p className="text-xs text-slate-400">对准全身，保持光线充足</p>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-slate-400 shadow-lg active:scale-90 transition-transform"
              aria-label="拍照"
            />
            <button onClick={stopCamera} className="px-4 py-2 text-sm text-slate-500">
              关闭摄像头
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={startCamera}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-semibold active:bg-slate-700 transition-colors"
          >
            📷 打开摄像头拍照
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold active:bg-slate-200 transition-colors"
          >
            🖼️ 从相册选择照片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
