export type SportType = 'tennis' | 'golf';

export interface PoseOption {
  id: string;
  name: string;
  description: string;
}

export interface JointAngle {
  name: string;
  value: number;
  status: 'normal' | 'warning' | 'issue';
  deviation: number;
}

export interface PoseAnalysis {
  landmarks: Array<{ x: number; y: number; z: number; visibility: number }>;
  angles: JointAngle[];
  imageBase64: string;
  poseTypeId?: string;
  motionFrames?: Array<{
    image: string;
    landmarks: Array<{ x: number; y: number; visibility: number }>;
  }>;
}

export interface AIAnalysisResult {
  summary: string;
  overallScore?: number;
  issues: Array<{
    bodyPart: string;
    problem: string;
    correction: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  exercises: Array<{
    step: number;
    name: string;
    description: string;
    reps: string;
    tip: string;
  }>;
}

export type PageName = 'home' | 'capture' | 'result' | 'history';

export interface HistoryEntry {
  id: string;
  date: string;
  sport: SportType;
  poseName: string;
  score: number;
  imageBase64: string;
  aiResult: AIAnalysisResult;
  angles: JointAngle[];
}

export interface ScoreBreakdown {
  totalScore: number;
  level: string;
  levelEmoji: string;
  levelColor: string;
  angleScores: Array<{
    name: string;
    score: number;
    value: number;
    idealMin: number;
    idealMax: number;
  }>;
}
