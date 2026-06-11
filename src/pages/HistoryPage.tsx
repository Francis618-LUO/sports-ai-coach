import type { HistoryEntry } from '../types';

interface Props {
  entries: HistoryEntry[];
  onBack: () => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}

export function HistoryPage({ entries, onBack, onClear, onRemove }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-500 text-lg px-2">← 返回</button>
        <h2 className="font-bold text-slate-800">📜 分析历史</h2>
        {entries.length > 0 && (
          <button
            onClick={() => {
              if (confirm('确定要清除全部历史记录吗？')) onClear();
            }}
            className="ml-auto text-xs text-red-500 px-2 py-1"
          >
            清空全部
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
          <span className="text-6xl">📭</span>
          <p className="font-medium">暂无分析记录</p>
          <p className="text-sm">完成动作分析后记得保存哦</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl font-medium active:bg-slate-700"
          >
            开始分析
          </button>
        </div>
      ) : (
        <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex gap-3 p-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                  <img src={entry.imageBase64} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{entry.sport === 'tennis' ? '🎾' : '⛳'}</span>
                    <span className="font-medium text-slate-800 text-sm truncate">{entry.poseName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{entry.date}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-lg font-bold ${
                        entry.score >= 80
                          ? 'text-green-600'
                          : entry.score >= 60
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    >
                      {entry.score}分
                    </span>
                    <span className="text-xs text-slate-400">
                      {entry.angles.length}项关节数据
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="flex-shrink-0 text-slate-300 hover:text-red-400 text-lg px-1 self-start"
                  title="删除"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-slate-400 pt-2">
            共 {entries.length} 条记录 · 最多保留50条
          </p>
        </div>
      )}
    </div>
  );
}
