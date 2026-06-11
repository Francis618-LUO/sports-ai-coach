import { useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { PoseAnalysis } from '../types';
import { extractJointAngles } from '../utils/angleCalculator';

// 单例：避免重复初始化
let poseLandmarker: PoseLandmarker | null = null;

async function initPoseLandmarker(): Promise<PoseLandmarker> {
  if (poseLandmarker) return poseLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numPoses: 1,
  });

  return poseLandmarker;
}

export function usePoseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const detectPose = useCallback(
    async (imageBase64: string): Promise<PoseAnalysis | null> => {
      setIsLoading(true);
      setError('');

      try {
        const landmarker = await initPoseLandmarker();

        // 将base64转为HTMLImageElement
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = imageBase64;
        });

        const result = landmarker.detect(img);

        if (!result.landmarks || result.landmarks.length === 0) {
          setError('未能检测到人体，请确保全身在画面中且光线充足');
          setIsLoading(false);
          return null;
        }

        const landmarks = result.landmarks[0].map((l) => ({
          x: l.x,
          y: l.y,
          z: l.z,
          visibility: l.visibility ?? 0,
        }));

        const angles = extractJointAngles(landmarks);

        setIsLoading(false);
        return { landmarks, angles, imageBase64 };
      } catch (e) {
        const msg = e instanceof Error ? e.message : '姿态检测失败';
        setError(msg);
        setIsLoading(false);
        return null;
      }
    },
    []
  );

  /** 批量检测多帧（视频逐帧分析） */
  const detectPoseBatch = useCallback(
    async (frames: string[]): Promise<Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null>> => {
      setIsLoading(true);
      setError('');

      try {
        const landmarker = await initPoseLandmarker();
        const results: Array<{ landmarks: PoseAnalysis['landmarks']; image: string } | null> = [];

        for (const frame of frames) {
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('帧加载失败'));
              img.src = frame;
            });

            const result = landmarker.detect(img);
            if (result.landmarks && result.landmarks.length > 0) {
              results.push({
                landmarks: result.landmarks[0].map((l) => ({
                  x: l.x, y: l.y, z: l.z, visibility: l.visibility ?? 0,
                })),
                image: frame,
              });
            } else {
              results.push(null);
            }
          } catch {
            results.push(null);
          }
        }

        setIsLoading(false);
        return results;
      } catch (e) {
        setError('批量姿态检测失败');
        setIsLoading(false);
        return [];
      }
    },
    []
  );

  return { detectPose, detectPoseBatch, isLoading, error };
}
