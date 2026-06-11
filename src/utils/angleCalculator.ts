import type { JointAngle, ScoreBreakdown } from '../types';

/** 计算三点之间的角度（点B为顶点，返回0-360度） */
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.round(Math.acos(cosAngle) * (180 / Math.PI));
}

function calculateTrunkLean(landmarks: Array<{ x: number; y: number }>): number {
  const shoulderMid = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
  };
  const hipMid = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
  };
  const trunkVec = { x: hipMid.x - shoulderMid.x, y: hipMid.y - shoulderMid.y };
  const mag = Math.sqrt(trunkVec.x * trunkVec.x + trunkVec.y * trunkVec.y);
  if (mag === 0) return 0;
  const dot = trunkVec.y;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return Math.round(Math.acos(cos) * (180 / Math.PI));
}

export function extractJointAngles(
  landmarks: Array<{ x: number; y: number; z: number }>
): JointAngle[] {
  const get = (i: number) => landmarks[i];
  if (!get(11) || !get(12) || !get(23) || !get(24)) return [];

  return [
    { name: '右肩关节', value: calculateAngle(get(24), get(12), get(14)), status: 'normal', deviation: 0 },
    { name: '左肩关节', value: calculateAngle(get(23), get(11), get(13)), status: 'normal', deviation: 0 },
    { name: '右肘关节', value: calculateAngle(get(12), get(14), get(16)), status: 'normal', deviation: 0 },
    { name: '左肘关节', value: calculateAngle(get(11), get(13), get(15)), status: 'normal', deviation: 0 },
    { name: '右膝关节', value: calculateAngle(get(24), get(26), get(28)), status: 'normal', deviation: 0 },
    { name: '左膝关节', value: calculateAngle(get(23), get(25), get(27)), status: 'normal', deviation: 0 },
    { name: '右髋关节', value: calculateAngle(get(12), get(24), get(26)), status: 'normal', deviation: 0 },
    { name: '左髋关节', value: calculateAngle(get(11), get(23), get(25)), status: 'normal', deviation: 0 },
    { name: '躯干前倾', value: calculateTrunkLean(landmarks), status: 'normal', deviation: 0 },
  ];
}

// ─── 评分系统 ──────────────────────────────────────────

/** 各关节的"理想角度范围"（通用运动标准，实际因人而异） */
const IDEAL_RANGES: Record<string, { min: number; max: number }> = {
  '右肩关节': { min: 30, max: 90 },
  '左肩关节': { min: 30, max: 90 },
  '右肘关节': { min: 140, max: 180 },
  '左肘关节': { min: 140, max: 180 },
  '右膝关节': { min: 140, max: 175 },
  '左膝关节': { min: 140, max: 175 },
  '右髋关节': { min: 140, max: 180 },
  '左髋关节': { min: 140, max: 180 },
  '躯干前倾': { min: 20, max: 50 },
};

function scoreAngle(value: number, idealMin: number, idealMax: number): number {
  if (value >= idealMin && value <= idealMax) return 100;
  const deviation = Math.min(
    Math.abs(value - idealMin),
    Math.abs(value - idealMax)
  );
  // 每偏离1度扣2分，最低0分
  return Math.max(0, 100 - deviation * 2);
}

export function calculateScore(angles: JointAngle[]): ScoreBreakdown {
  const angleScores = angles.map((a) => {
    const range = IDEAL_RANGES[a.name] || { min: 80, max: 170 };
    const score = scoreAngle(a.value, range.min, range.max);
    // 更新角度状态
    if (score >= 90) a.status = 'normal';
    else if (score >= 60) a.status = 'warning';
    else a.status = 'issue';
    a.deviation = score < 100 ? Math.round(100 - score) : 0;
    return { name: a.name, score: Math.round(score), value: a.value, idealMin: range.min, idealMax: range.max };
  });

  const totalScore = Math.round(angleScores.reduce((sum, s) => sum + s.score, 0) / angleScores.length);

  let level: string, levelEmoji: string, levelColor: string;
  if (totalScore >= 90) { level = '优秀'; levelEmoji = '🌟'; levelColor = 'text-green-600'; }
  else if (totalScore >= 75) { level = '良好'; levelEmoji = '👍'; levelColor = 'text-blue-600'; }
  else if (totalScore >= 60) { level = '一般'; levelEmoji = '📝'; levelColor = 'text-amber-600'; }
  else { level = '需要改进'; levelEmoji = '🎯'; levelColor = 'text-red-500'; }

  return { totalScore, level, levelEmoji, levelColor, angleScores };
}
