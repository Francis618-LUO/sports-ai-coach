import { useState, useCallback } from 'react';
import type { SportType, PageName, PoseAnalysis, AIAnalysisResult, HistoryEntry } from './types';
import { HomePage } from './pages/HomePage';
import { CapturePage } from './pages/CapturePage';
import { ResultPage } from './pages/ResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { useHistory } from './hooks/useHistory';

export default function App() {
  const [page, setPage] = useState<PageName>('home');
  const [sportType, setSportType] = useState<SportType>('tennis');
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const { entries, addEntry, clearHistory, removeEntry } = useHistory();

  const handleStart = (sport: SportType) => {
    setSportType(sport);
    setPage('capture');
  };

  const handleAnalysisComplete = useCallback(
    (poseData: PoseAnalysis, ai: AIAnalysisResult) => {
      setAnalysis(poseData);
      setAiResult(ai);
      setPage('result');
    },
    []
  );

  const handleSaveToHistory = useCallback(
    (entry: HistoryEntry) => {
      addEntry(entry);
    },
    [addEntry]
  );

  const handleBack = () => setPage('home');
  const handleHistory = () => setPage('history');

  switch (page) {
    case 'home':
      return <HomePage onStart={handleStart} onHistory={handleHistory} />;
    case 'capture':
      return (
        <CapturePage
          sport={sportType}
          onComplete={handleAnalysisComplete}
          onBack={handleBack}
        />
      );
    case 'result':
      return aiResult && analysis ? (
        <ResultPage
          sport={sportType}
          analysis={analysis}
          aiResult={aiResult}
          onBack={handleBack}
          onSave={handleSaveToHistory}
        />
      ) : null;
    case 'history':
      return (
        <HistoryPage
          entries={entries}
          onBack={handleBack}
          onClear={clearHistory}
          onRemove={removeEntry}
        />
      );
  }
}
