/**
 * 从视频Blob中提取等间隔帧
 * @param videoBlob 录制的视频
 * @param frameCount 需要提取的帧数
 * @returns base64图片数组
 */
export async function extractFrames(videoBlob: Blob, frameCount: number): Promise<string[]> {
  const video = document.createElement('video');
  const url = URL.createObjectURL(videoBlob);

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('视频加载失败'));
    video.src = url;
    video.load();
  });

  const duration = video.duration;
  if (duration <= 0 || !isFinite(duration)) {
    URL.revokeObjectURL(url);
    return [];
  }

  // 取整个视频，均匀分布
  const interval = duration / (frameCount - 1);

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d')!;

  const frames: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const time = interval * i;
    video.currentTime = time;

    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.8));
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
    });
  }

  URL.revokeObjectURL(url);
  return frames;
}

/** 智能帧数：根据视频时长决定抽几帧 */
export function smartFrameCount(durationSeconds: number): number {
  // 目标帧率约 5fps，至少15帧，最多30帧
  const target = Math.round(durationSeconds * 5);
  return Math.max(15, Math.min(30, target));
}
