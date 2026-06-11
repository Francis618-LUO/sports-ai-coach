import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../utils/poseConnections';

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface Props {
  landmarks: Landmark[];
  width: number;
  height: number;
}

export function PoseOverlay({ landmarks, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || landmarks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 绘制骨骼连线
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    for (const [from, to] of POSE_CONNECTIONS) {
      const a = landmarks[from];
      const b = landmarks[to];
      const aVis = a.visibility ?? 0;
      const bVis = b.visibility ?? 0;

      if (aVis > 0.5 && bVis > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * width, a.y * height);
        ctx.lineTo(b.x * width, b.y * height);
        ctx.stroke();
      }
    }

    // 绘制关键点
    for (const lm of landmarks) {
      const vis = lm.visibility ?? 0;
      if (vis > 0.5) {
        const cx = lm.x * width;
        const cy = lm.y * height;

        // 外圈（半透明）
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fill();

        // 内圈
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#16A34A';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}
