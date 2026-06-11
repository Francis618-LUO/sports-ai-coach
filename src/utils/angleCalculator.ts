import type { JointAngle } from '../types';

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

/** 计算躯干与垂直线的夹角 */
function calculateTrunkLean(
  landmarks: Array<{ x: number; y: number }>
): number {
  const shoulderMid = {
    x: (landmarks[11].x + landmarks[12].x) / 2,
    y: (landmarks[11].y + landmarks[12].y) / 2,
  };
  const hipMid = {
    x: (landmarks[23].x + landmarks[24].x) / 2,
    y: (landmarks[23].y + landmarks[24].y) / 2,
  };
  // 躯干向量：肩膀 → 髋部
  const trunkVec = { x: hipMid.x - shoulderMid.x, y: hipMid.y - shoulderMid.y };
  const mag = Math.sqrt(trunkVec.x * trunkVec.x + trunkVec.y * trunkVec.y);
  if (mag === 0) return 0;
  // 垂直线（向下）与躯干的夹角
  const dot = trunkVec.y; // vertical = (0, 1)
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return Math.round(Math.acos(cos) * (180 / Math.PI));
}

/**
 * 从MediaPipe landmarks中提取网球/高尔夫分析所需的关节角度
 * MediaPipe Pose landmark索引:
 * 11: 左肩, 12: 右肩, 13: 左肘, 14: 右肘
 * 15: 左腕, 16: 右腕
 * 23: 左髋, 24: 右髋, 25: 左膝, 26: 右膝
 * 27: 左踝, 28: 右踝
 */
export function extractJointAngles(
  landmarks: Array<{ x: number; y: number; z: number }>
): JointAngle[] {
  const get = (i: number) => landmarks[i];
  if (!get(11) || !get(12) || !get(23) || !get(24)) {
    return [];
  }

  return [
    {
      name: '右肩关节',
      value: calculateAngle(get(24), get(12), get(14)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '左肩关节',
      value: calculateAngle(get(23), get(11), get(13)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '右肘关节',
      value: calculateAngle(get(12), get(14), get(16)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '左肘关节',
      value: calculateAngle(get(11), get(13), get(15)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '右膝关节',
      value: calculateAngle(get(24), get(26), get(28)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '左膝关节',
      value: calculateAngle(get(23), get(25), get(27)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '右髋关节',
      value: calculateAngle(get(12), get(24), get(26)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '左髋关节',
      value: calculateAngle(get(11), get(23), get(25)),
      status: 'normal',
      deviation: 0,
    },
    {
      name: '躯干前倾',
      value: calculateTrunkLean(landmarks),
      status: 'normal',
      deviation: 0,
    },
  ];
}
