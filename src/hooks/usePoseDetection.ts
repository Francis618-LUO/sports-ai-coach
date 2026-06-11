import { useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { PoseAnalysis } from '../types';
import { extractJointAngles } from '../utils/angleCalculator';

// 单例：照片用 IMAGE 模式
let photoLandmarker: PoseLandmarker | null = null;
// 视频用 VIDEO 模式（帧间追踪更稳定）
let videoLandmarker: PoseLandmarker | null = null;

async function initPhotoLandmarker(): Promise<PoseLandmarker> {
  if (photoLandmarker) return photoLandmarker;
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  photoLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numPoses: 1,
  });
  return photoLandmarker;
}

async function initVideoLandmarker(): Promise<PoseLandmarker> {
  if (videoLandmarker) return videoLandmarker;
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );
  videoLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      // 全精度模型 — 比 lite 准很多
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',  // 帧间追踪，利用时序信息平滑结果
    numPoses: 1,
    minPoseDetectionConfidence: 0.4,
    minPosePresenceConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });
  return videoLandmarker;
}

export function usePoseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const detectPose = useCallback(
    async (imageBase64: string): Promise<PoseAnalysis | null> => {
      setIsLoading(true);
      setError('');
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
          setIsLoading(false);
          return null;
        }
        const landmarks = result.landmarks[0].map((l) => ({
          x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0,
        }));
        setIsLoading(false);
        return { landmarks, angles: extractJointAngles(landmarks), imageBase64 };
      } catch (e) {
        setError('姿态检测失败');
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  /** 批量检测多帧 — 使用 VIDEO 模式 + full 模型，帧间追踪 */
  const detectPoseBatch = useCallback(
    async (frames: string[]): Promise<Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null>> => {
      setIsLoading(true);
      setError('');

      try {
        // 每次新视频先重置追踪器，避免上一段视频的追踪状态干扰
        resetVideoLandmarker();
        const lm = await initVideoLandmarker();
        const results: Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null> = [];

        for (let i = 0; i < frames.length; i++) {
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('帧加载失败'));
              img.src = frames[i];
            });

            // VIDEO 模式：传入递增的毫秒时间戳，利用帧间追踪
            const timestamp = i * 200; // 模拟200ms间隔（5fps）
            const result = lm.detectForVideo(img, timestamp);

            if (result.landmarks && result.landmarks.length > 0) {
              results.push({
                landmarks: result.landmarks[0].map((l) => ({
                  x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0,
                })),
                image: frames[i],
              });
            } else {
              // 追踪丢失 — 尝试用前一帧结果补位
              if (i > 0 && results[results.length - 1]) {
                results.push(results[results.length - 1]);
              } else {
                results.push(null);
              }
            }
          } catch {
            if (i > 0 && results[results.length - 1]) {
              results.push(results[results.length - 1]);
            } else {
              results.push(null);
            }
          }
        }

        // 用前/后帧填补中间的 null
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) {
            // 找最近的非null帧
            let nearest: typeof results[number] = null;
            for (let d = 1; d < results.length; d++) {
              if (i - d >= 0 && results[i - d]) { nearest = results[i - d]; break; }
              if (i + d < results.length && results[i + d]) { nearest = results[i + d]; break; }
            }
            if (nearest) results[i] = nearest;
          }
        }

        setIsLoading(false);
        return results;
      } catch {
        setError('视频姿态检测失败');
        setIsLoading(false);
        return [];
      }
    },
    []
  );

  /** 重置视频追踪器（每次分析新视频前调用，清除上一段的追踪状态） */
  const resetVideoLandmarker = useCallback(() => {
    if (videoLandmarker) {
      videoLandmarker.close();
      videoLandmarker = null;
    }
  }, []);

  return { detectPose, detectPoseBatch, resetVideoLandmarker, isLoading, error };
}
