import type { AIAnalysisResult } from '../types';

interface Props {
  result: AIAnalysisResult;
}

const severityConfig = {
  high: {
    bg: 'bg-red-50 border-red-300',
    label: '重点关注',
    labelBg: 'bg-red-100 text-red-700',
    icon: '🔴',
  },
  medium: {
    bg: 'bg-amber-50 border-amber-300',
    label: '需要改进',
    labelBg: 'bg-amber-100 text-amber-700',
    icon: '🟡',
  },
  low: {
    bg: 'bg-blue-50 border-blue-300',
    label: '微调建议',
    labelBg: 'bg-blue-100 text-blue-700',
    icon: '🔵',
  },
} as const;

export function AnalysisReport({ result }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-2 text-sm">📋 整体评估</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <>
          <h3 className="font-bold text-slate-800 text-sm">🔍 问题分析</h3>
          {result.issues.map((issue, i) => {
            const config = severityConfig[issue.severity];
            return (
              <div key={i} className={`p-4 rounded-xl border ${config.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{config.icon}</span>
                  <span className="font-bold text-slate-800 text-sm">{issue.bodyPart}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.labelBg}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{issue.problem}</p>
                <p className="text-sm text-green-700 font-medium">
                  ✅ {issue.correction}
                </p>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
