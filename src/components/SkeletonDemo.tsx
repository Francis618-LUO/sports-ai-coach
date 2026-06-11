import { useEffect, useRef } from 'react';
import { POSE_CONNECTIONS } from '../utils/poseConnections';
import type { IdealSkeleton } from '../utils/idealPoses';
import { DEFAULT_SKELETON } from '../utils/idealPoses';

interface Props {
  skeleton?: IdealSkeleton;
  width?: number;
  height?: number;
  animate?: boolean;
  label?: string;
}

// 将理想的归一化坐标映射到SVG viewBox 0-200空间
function toSvg(pt: { x: number; y: number }, w: number, h: number) {
  return {
    x: pt.x * w,
    y: pt.y * h,
  };
}

export function SkeletonDemo({
  skeleton,
  width = 200,
  height = 280,
  animate = true,
  label,
}: Props) {
  const groupRef = useRef<SVGGElement>(null);
  const skel = skeleton || DEFAULT_SKELETON;

  useEffect(() => {
    if (!animate || !groupRef.current) return;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const sway = Math.sin(frame * 0.05) * 1.5; // 轻微摆动
      if (groupRef.current) {
        groupRef.current.style.transform = `rotate(${sway}deg)`;
        groupRef.current.style.transformOrigin = '50% 85%';
        groupRef.current.style.transition = 'transform 0.1s linear';
      }
    }, 50);

    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* 背景网格（微妙） */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.3" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" rx="8" />

        <g ref={groupRef}>
          {/* 骨骼连线 */}
          {POSE_CONNECTIONS.map(([from, to], i) => {
            const a = toSvg(skel[from], width, height);
            const b = toSvg(skel[to], width, height);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#818CF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}

          {/* 关键点 */}
          {skel.map((pt, i) => {
            const p = toSvg(pt, width, height);
            // 头部区域用大点
            const isHead = i <= 10;
            const r = isHead ? 3.5 : 4;
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={r + 2} fill="rgba(129, 140, 248, 0.3)" />
                <circle cx={p.x} cy={p.y} r={r} fill="#6366F1" stroke="#FFFFFF" strokeWidth="1" />
              </g>
            );
          })}
        </g>
      </svg>

      {label && (
        <span className="text-xs text-indigo-500 font-medium mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          {label}
        </span>
      )}
    </div>
  );
}
