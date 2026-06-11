import { useState } from 'react';
import type { SportType, PoseOption } from '../types';
import { TENNIS_CATEGORIES, GOLF_CATEGORIES } from '../utils/poseConnections';
import { SkeletonDemo } from './SkeletonDemo';
import { IDEAL_SKELETONS } from '../utils/idealPoses';

interface Props {
  sport: SportType;
  selected: string | null;
  onSelect: (pose: PoseOption) => void;
}

export function PoseSelector({ sport, selected, onSelect }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = sport === 'tennis' ? TENNIS_CATEGORIES : GOLF_CATEGORIES;

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-600 text-center">选择要分析的动作</h3>
      <p className="text-xs text-slate-400 text-center -mt-2">点击分类展开具体动作</p>

      <div className="space-y-2">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.id;
          const selectedInCat = cat.poses.find((p) => p.id === selected);
          const hasSelection = !!selectedInCat;

          return (
            <div key={cat.id} className="rounded-xl border border-slate-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  isExpanded || hasSelection ? 'bg-slate-50' : 'bg-white'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                  <span className="text-xs text-slate-400 ml-2">
                    {cat.poses.length}个动作
                  </span>
                  {hasSelection && (
                    <p className="text-xs text-green-600 mt-0.5 truncate">
                      已选：{selectedInCat.name}
                    </p>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sub-options */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-white divide-y divide-slate-50">
                  {cat.poses.map((pose) => {
                    const isSel = selected === pose.id;
                    return (
                      <button
                        key={pose.id}
                        onClick={() => onSelect(pose)}
                        className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                          isSel ? 'bg-green-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isSel ? 'border-green-500 bg-green-500' : 'border-slate-300'
                          }`}
                        >
                          {isSel && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className={`text-sm font-medium ${isSel ? 'text-green-800' : 'text-slate-700'}`}>
                            {pose.name}
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">{pose.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 骨架模型预览 */}
      {selected && IDEAL_SKELETONS[selected] && (
        <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-500 font-medium mb-2 text-center">
            💡 标准动作参考（动态演示）
          </p>
          <div className="flex justify-center">
            <SkeletonDemo
              skeleton={IDEAL_SKELETONS[selected]}
              width={140}
              height={200}
              animate
              label="理想姿态"
            />
          </div>
        </div>
      )}
    </div>
  );
}
