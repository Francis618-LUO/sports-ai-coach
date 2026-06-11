import type { SportType } from '../types';

interface Props {
  onSelect: (sport: SportType) => void;
}

export function SportSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-700 text-center">选择运动项目</h2>
      <button
        onClick={() => onSelect('tennis')}
        className="flex flex-col items-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 active:scale-[0.98] transition-transform"
      >
        <span className="text-6xl mb-3">🎾</span>
        <span className="text-2xl font-bold text-green-800">网球</span>
        <span className="text-sm text-green-600 mt-1">Tennis</span>
      </button>
      <button
        onClick={() => onSelect('golf')}
        className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-300 active:scale-[0.98] transition-transform"
      >
        <span className="text-6xl mb-3">⛳</span>
        <span className="text-2xl font-bold text-blue-800">高尔夫</span>
        <span className="text-sm text-blue-600 mt-1">Golf</span>
      </button>
    </div>
  );
}
