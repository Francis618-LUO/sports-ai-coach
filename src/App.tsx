import { useState } from 'react';
import type { SportType, PageName, PoseAnalysis, AIAnalysisResult } from './types';
import { HomePage } from './pages/HomePage';
import { CapturePage } from './pages/CapturePage';
import { ResultPage } from './pages/ResultPage';

export default function App() {
  const [page, setPage] = useState<PageName>('home');
  const [sportType, setSportType] = useState<SportType>('tennis');
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const handleStart = (sport: SportType) => {
    setSportType(sport);
    setPage('capture');
  };

  const handleAnalysisComplete = (poseData: PoseAnalysis, ai: AIAnalysisResult) => {
    setAnalysis(poseData);
    setAiResult(ai);
    setPage('result');
  };

  const handleBack = () => setPage('home');

  switch (page) {
    case 'home':
      return <HomePage onStart={handleStart} />;
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
        />
      ) : null;
  }
}
