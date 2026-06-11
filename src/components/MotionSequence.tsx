import { useEffect, useRef, useState, useCallback } from 'react';
import { POSE_CONNECTIONS } from '../utils/poseConnections';

interface Props {
  frames: Array<{
    image: string;
    landmarks: Array<{ x: number; y: number; visibility: number }>;
  }>;
}

const CANVAS_W = 340;
const CANVAS_H = 460;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpLandmark(
  a: { x: number; y: number; visibility: number },
  b: { x: number; y: number; visibility: number },
  t: number,
) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    visibility: lerp(a.visibility, b.visibility, t),
  };
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number; visibility: number }>,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // 连线
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (const [from, to] of POSE_CONNECTIONS) {
    const a = landmarks[from];
    const b = landmarks[to];
    if (a.visibility > 0.3 && b.visibility > 0.3) {
      ctx.beginPath();
      ctx.moveTo(a.x * CANVAS_W, a.y * CANVAS_H);
      ctx.lineTo(b.x * CANVAS_W, b.y * CANVAS_H);
      ctx.stroke();
    }
  }

  // 关键点
  for (const lm of landmarks) {
    if (lm.visibility > 0.3) {
      ctx.beginPath();
      ctx.arc(lm.x * CANVAS_W, lm.y * CANVAS_H, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#16A34A';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function MotionSequence({ frames }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false); // 默认不自动播放
  const [speed, setSpeed] = useState(0.5);         // 默认慢放 0.5x
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playedOnce, setPlayedOnce] = useState(false);
  const tRef = useRef(0);

  const validFrames = frames.filter((f) => f.landmarks.length > 0);
  const totalFrames = validFrames.length;

  // 预加载背景图
  useEffect(() => {
    if (validFrames.length === 0) return;
    const img = new Image();
    img.src = validFrames[0].image;
    img.onload = () => {
      bgImgRef.current = img;
    };
  }, [frames]);

  // 主动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // 清画布
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 背景（半透明第一帧）
    if (bgImgRef.current) {
      ctx.globalAlpha = 0.18;
      ctx.drawImage(bgImgRef.current, 0, 0, CANVAS_W, CANVAS_H);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    if (totalFrames < 2) {
      // 单帧直接画
      if (totalFrames === 1) {
        drawSkeleton(ctx, validFrames[0].landmarks, 1);
      }
      return;
    }

    // 帧间插值：在帧 i 和帧 i+1 之间平滑过渡
    const rawT = tRef.current;
    const segmentIndex = Math.floor(rawT);
    const frac = rawT - segmentIndex;

    const i = segmentIndex % totalFrames;
    const j = (i + 1) % totalFrames;

    const current = validFrames[i].landmarks;
    const next = validFrames[j].landmarks;

    // 运动轨迹残影：画前几帧的淡色影子
    const trailCount = 3;
    for (let k = 1; k <= trailCount; k++) {
      const prevIdx = (i - k + totalFrames) % totalFrames;
      const alpha = 0.15 / (k + 1);
      drawSkeleton(ctx, validFrames[prevIdx].landmarks, alpha);
    }

    // 当前插值帧
    const interpolated = current.map((lm, idx) =>
      lerpLandmark(lm, next[idx], frac),
    );
    drawSkeleton(ctx, interpolated, 1);

    // 更新帧号显示
    setCurrentFrame(Math.floor(rawT) % totalFrames);
  }, [validFrames, totalFrames]);

  // 帧加载完成后自动播放一次
  useEffect(() => {
    if (totalFrames >= 2 && !playedOnce) {
      const timer = setTimeout(() => {
        tRef.current = 0;
        setCurrentFrame(0);
        setPlaying(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [totalFrames]); // eslint-disable-line

  // 动画循环
  useEffect(() => {
    if (!playing || totalFrames < 2) return;

    let last = performance.now();
    const fps = 8 * speed; // 每秒8帧基准

    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;

      tRef.current += dt * fps;

      // 放完一遍自动停止
      if (tRef.current >= totalFrames) {
        tRef.current = totalFrames - 0.01;
        setPlaying(false);
        setPlayedOnce(true);
        animate();
        return;
      }

      animate();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, speed, totalFrames, animate]);

  // 单帧显示
  useEffect(() => {
    if (totalFrames < 2) animate();
  }, [totalFrames, animate]);

  if (totalFrames === 0) {
    return (
      <p className="text-center text-slate-400 text-sm py-8">
        未检测到有效姿态帧
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          🎬 AI动作捕捉动画
          <span className="text-xs text-slate-400 font-normal">
            {totalFrames}帧 · 帧间插值
          </span>
        </h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          帧 {currentFrame + 1}/{totalFrames}
        </span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full h-auto block"
        />
        {/* 四角标注 */}
        <div className="absolute top-2 left-2 text-[10px] text-white/40 font-mono">
          AI Pose Tracking
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] text-white/40 font-mono">
          MediaPipe + DeepSeek
        </div>
      </div>

      {/* 帧缩略图对照条 */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {validFrames.map((f, i) => (
          <div
            key={i}
            className={`flex-shrink-0 relative rounded-md overflow-hidden border-2 transition-colors ${
              i === currentFrame ? 'border-green-400 shadow-sm' : 'border-slate-200 opacity-60'
            }`}
            style={{ width: 42, height: 56 }}
          >
            <img src={f.image} alt={`帧${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl">
              {i + 1}
            </span>
          </div>
        ))}
        <div className="flex-shrink-0 flex items-center text-xs text-slate-400 pl-1">
          {totalFrames}帧
        </div>
      </div>

      {/* 控制条 */}
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2 px-3">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 text-sm active:bg-slate-100"
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* 进度条 */}
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-100"
            style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
          />
        </div>

        {/* 速度 */}
        <div className="flex gap-1">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                speed === s
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* 重播 */}
        <button
          onClick={() => {
            tRef.current = 0;
            setCurrentFrame(0);
            setPlayedOnce(false);
            setPlaying(true);
          }}
          className="text-xs px-2 py-1 bg-white rounded-md border border-slate-200 text-slate-500 active:bg-slate-100"
        >
          {playedOnce ? '🔄 重播' : '▶ 播放'}
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        绿色骨骼 = 当前帧 &nbsp;|&nbsp; 淡色残影 = 前几帧轨迹 &nbsp;|&nbsp; 帧间插值 = 平滑动画
      </p>
    </div>
  );
}
