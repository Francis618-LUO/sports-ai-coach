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
}

export interface AIAnalysisResult {
  summary: string;
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

export type PageName = 'home' | 'capture' | 'result';
