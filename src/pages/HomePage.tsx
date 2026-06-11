import type { SportType } from '../types';
import { SportSelector } from '../components/SportSelector';

interface Props {
  onStart: (sport: SportType) => void;
}

export function HomePage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🏌️‍♂️🎾</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI运动姿态教练</h1>
          <p className="text-slate-500 text-sm">拍照分析你的运动动作，AI教练给你专业训练建议</p>
        </div>
        <SportSelector onSelect={onStart} />
      </div>
      <p className="text-center text-xs text-slate-400 pb-8">
        AI驱动 · 浏览器端姿态检测 · 隐私安全
      </p>
    </div>
  );
}
