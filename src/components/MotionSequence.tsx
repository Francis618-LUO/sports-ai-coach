import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../utils/poseConnections';

interface Props {
  frames: Array<{
    image: string;
    landmarks: Array<{ x: number; y: number; visibility: number }>;
  }>;
}

const W = 100;
const H = 140;

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; visibility: number }>,
  color: string,
) {
  // 连线
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.85;

  for (const [from, to] of POSE_CONNECTIONS) {
    const a = landmarks[from];
    const b = landmarks[to];
    if ((a.visibility ?? 0) > 0.4 && (b.visibility ?? 0) > 0.4) {
      ctx.beginPath();
      ctx.moveTo(a.x * W, a.y * H);
      ctx.lineTo(b.x * W, b.y * H);
      ctx.stroke();
    }
  }

  // 关键点
  ctx.globalAlpha = 1;
  for (const lm of landmarks) {
    if ((lm.visibility ?? 0) > 0.4) {
      ctx.beginPath();
      ctx.arc(lm.x * W, lm.y * H, 2, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

export function MotionSequence({ frames }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 清空
    containerRef.current.innerHTML = '';

    const validFrames = frames.filter((f) => f.landmarks.length > 0);
    if (validFrames.length === 0) return;

    validFrames.forEach((frame, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex-shrink-0 text-center';

      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      canvas.className = 'rounded-lg bg-slate-900';

      const ctx = canvas.getContext('2d')!;

      // 画半透明原图
      const img = new Image();
      img.src = frame.image;
      img.onload = () => {
        ctx.globalAlpha = 0.25;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.globalAlpha = 1;
        // 渐变色（首帧绿→末帧橙）
        const t = validFrames.length > 1 ? i / (validFrames.length - 1) : 0;
        const r = Math.round(34 + t * 215);
        const g = Math.round(197 - t * 97);
        const b = Math.round(94 - t * 60);
        drawSkeleton(ctx, frame.landmarks, `rgb(${r},${g},${b})`);
      };

      const label = document.createElement('span');
      label.className = 'text-[10px] text-slate-400 mt-0.5 block';
      label.textContent = `帧${i + 1}`;

      wrapper.appendChild(canvas);
      wrapper.appendChild(label);
      containerRef.current!.appendChild(wrapper);
    });
  }, [frames]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="font-bold text-slate-800 text-sm">🎬 动作逐帧分析</h3>
        <span className="text-xs text-slate-400">{frames.length} 帧</span>
      </div>
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x"
      />
      <p className="text-xs text-slate-400 text-center">
        颜色从绿色渐变到橙色 = 动作从起始到结束
      </p>
    </div>
  );
}
