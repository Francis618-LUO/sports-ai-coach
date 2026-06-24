import { useState, useEffect } from 'react';
import type { SportType } from '../types';
import { SportSelector } from '../components/SportSelector';

interface Props {
  onStart: (sport: SportType) => void;
  onHistory: () => void;
}

export function HomePage({ onStart, onHistory }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(localStorage.getItem('ds_api_key') || '');
  }, []);

  const saveKey = () => {
    localStorage.setItem('ds_api_key', apiKey.trim());
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏌️‍♂️🎾</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI运动姿态教练</h1>
          <p className="text-slate-500 text-sm">拍照 → AI姿态检测 → 专业训练建议</p>
        </div>
        <SportSelector onSelect={onStart} />

        <button
          onClick={onHistory}
          className="mt-6 w-full py-3 bg-white text-slate-600 rounded-xl font-medium border border-slate-200 active:bg-slate-50 transition-colors text-sm"
        >
          📜 查看分析历史
        </button>
      </div>

      {/* Settings */}
      <div className="px-6 pb-8 max-w-md mx-auto w-full">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-slate-400 flex items-center gap-1 mx-auto"
        >
          ⚙️ {apiKey ? 'DeepSeek Key 已配置 ✓' : '设置 API Key'}
        </button>
        {showSettings && (
          <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
            <p className="text-xs text-slate-500">
              DeepSeek API Key（注册: platform.deepseek.com）
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={saveKey}
                className="flex-1 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium"
              >
                保存
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('ds_api_key');
                  setApiKey('');
                  setShowSettings(false);
                }}
                className="px-4 py-2 text-red-400 text-sm"
              >
                清除
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 pb-8">
        AI驱动 · 浏览器端姿态检测 · 隐私安全 · 支持23种动作
      </p>
    </div>
  );
}
