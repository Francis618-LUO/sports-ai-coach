import { useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { PoseAnalysis } from '../types';
import { extractJointAngles } from '../utils/angleCalculator';

// 所有资源从本地加载（同源，不依赖任何外网 CDN）
const WASM_PATH = '/wasm';
const MODEL_PATH = '/pose_landmarker_lite.task';

let photoLandmarker: PoseLandmarker | null = null;
let videoLandmarker: PoseLandmarker | null = null;

async function initPhotoLandmarker(): Promise<PoseLandmarker> {
  if (photoLandmarker) return photoLandmarker;
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  photoLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
    runningMode: 'IMAGE', numPoses: 1,
  });
  return photoLandmarker;
}

async function initVideoLandmarker(): Promise<PoseLandmarker> {
  if (videoLandmarker) return videoLandmarker;
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  videoLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
    runningMode: 'VIDEO', numPoses: 1,
    minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4,
  });
  return videoLandmarker;
}

export function usePoseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const detectPose = useCallback(
    async (imageBase64: string): Promise<PoseAnalysis | null> => {
      setIsLoading(true); setError('');
      try {
        const lm = await initPhotoLandmarker();
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = imageBase64;
        });
        const result = lm.detect(img);
        if (!result.landmarks || result.landmarks.length === 0) {
          setError('未能检测到人体，请确保全身在画面中且光线充足');
          setIsLoading(false); return null;
        }
        setIsLoading(false);
        return {
          landmarks: result.landmarks[0].map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0 })),
          angles: extractJointAngles(result.landmarks[0].map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0 }))),
          imageBase64,
        };
      } catch { setError('姿态检测失败'); setIsLoading(false); return null; }
    }, []
  );

  const detectPoseBatch = useCallback(
    async (frames: string[]): Promise<Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null>> => {
      setIsLoading(true); setError('');
      try {
        resetVideoLandmarker();
        const lm = await initVideoLandmarker();
        const results: Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null> = [];
        for (let i = 0; i < frames.length; i++) {
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('')); img.src = frames[i]; });
            const r = lm.detectForVideo(img, i * 200);
            if (r.landmarks?.length) {
              results.push({ landmarks: r.landmarks[0].map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0 })), image: frames[i] });
            } else {
              results.push(results[results.length - 1] || null);
            }
          } catch { results.push(results[results.length - 1] || null); }
        }
        setIsLoading(false);
        return results;
      } catch { setError('视频检测失败'); setIsLoading(false); return []; }
    }, []
  );

  const resetVideoLandmarker = useCallback(() => {
    if (videoLandmarker) { videoLandmarker.close(); videoLandmarker = null; }
  }, []);

  return { detectPose, detectPoseBatch, resetVideoLandmarker, isLoading, error };
}
