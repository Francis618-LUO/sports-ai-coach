import type { SportType, JointAngle, AIAnalysisResult } from '../types';
import { buildPrompt } from '../utils/promptBuilder';

export async function analyzePose(
  sport: SportType,
  poseTypeId: string,
  angles: JointAngle[]
): Promise<AIAnalysisResult> {
  const prompt = buildPrompt(sport, poseTypeId, angles);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'API请求失败' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}
