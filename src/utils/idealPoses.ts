// ─── 理想姿态骨架 — 基于关节角度 + 人体比例反算 ─────────
// 思路：定义每种动作的关键关节角度（基于运动生物力学文献），
//       再用三角函数推算出33个关键点在画布上的坐标。
//       这样骨架虽不完美，但角度关系是正确的。

export interface SkeletonFrame {
  x: number;
  y: number;
}

export type IdealSkeleton = SkeletonFrame[];

// ─── 人体比例常数（相对于身高 = 1.0） ─────────────────────
const NOSE_Y = 0.08;
const SHOULDER_Y = 0.18;
const HIP_Y = 0.52;

const SHOULDER_SPREAD = 0.10;
const HIP_SPREAD = 0.09;
const UPPER_ARM_LEN = 0.13;
const FOREARM_LEN = 0.12;
const THIGH_LEN = 0.21;
const SHIN_LEN = 0.20;

// ─── 辅助 ────────────────────────────────────────────────
function degToRad(deg: number) { return deg * Math.PI / 180; }

// ─── 骨架生成器 ──────────────────────────────────────────
// 参数全部是角度（度）：
// trunkLean:    躯干前倾角（0=直立，正值=前倾）
// leftShoulderAngle/rightShoulderAngle:  上臂相对于躯干的张开角（0=贴身体，90=水平）
// leftElbowAngle/rightElbowAngle:       肘关节屈曲角（180=伸直，90=弯曲）
// leftKneeAngle/rightKneeAngle:         膝关节角（180=直立，越小越蹲）
// shoulderRotation: 肩膀水平旋转（0=正对，正值=右肩在前）

interface PoseAngles {
  trunkLean: number;
  shoulderRotation: number;
  leftShoulderAbduction: number;
  rightShoulderAbduction: number;
  leftShoulderForward: number;
  rightShoulderForward: number;
  leftElbowFlex: number;
  rightElbowFlex: number;
  kneeFlex: number;
  leftHipForward: number;
  rightHipForward: number;
}

function anglesToSkeleton(a: PoseAngles): IdealSkeleton {
  const s: IdealSkeleton = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5 }));

  // ── 躯干中心线 ──
  const shoulderCenter = { x: 0.5, y: SHOULDER_Y };
  const trunkRad = degToRad(a.trunkLean);
  const trunkLen = HIP_Y - SHOULDER_Y;
  const hipCenter = {
    x: 0.5 + Math.sin(trunkRad) * trunkLen * 0.3,
    y: SHOULDER_Y + Math.cos(trunkRad) * trunkLen,
  };

  // 肩膀旋转
  const srRad = degToRad(a.shoulderRotation);
  const leftShoulder = {
    x: shoulderCenter.x - Math.cos(srRad) * SHOULDER_SPREAD,
    y: shoulderCenter.y,
  };
  const rightShoulder = {
    x: shoulderCenter.x + Math.cos(srRad) * SHOULDER_SPREAD,
    y: shoulderCenter.y,
  };

  // 髋部
  const leftHip = {
    x: hipCenter.x - HIP_SPREAD,
    y: hipCenter.y,
  };
  const rightHip = {
    x: hipCenter.x + HIP_SPREAD,
    y: hipCenter.y,
  };

  // ── 头部 ──
  s[0] = { x: 0.5, y: NOSE_Y };                         // 鼻尖
  s[1] = { x: 0.49, y: NOSE_Y - 0.02 };                 // 左眼内角
  s[2] = { x: 0.49, y: NOSE_Y - 0.02 };
  s[3] = { x: 0.48, y: NOSE_Y - 0.03 };
  s[4] = { x: 0.51, y: NOSE_Y - 0.02 };                 // 右眼内角
  s[5] = { x: 0.51, y: NOSE_Y - 0.02 };
  s[6] = { x: 0.52, y: NOSE_Y - 0.03 };
  s[7] = { x: 0.48, y: NOSE_Y + 0.01 };
  s[8] = { x: 0.52, y: NOSE_Y + 0.01 };
  s[9] = { x: 0.495, y: NOSE_Y + 0.03 };
  s[10] = { x: 0.505, y: NOSE_Y + 0.03 };

  // ── 肩膀 ──
  s[11] = leftShoulder;
  s[12] = rightShoulder;

  // ── 左臂 ──
  // 上臂方向：向侧下方 (shoulderAbduction) + 向前 (shoulderForward)
  const lUpperAngle = 90 + a.leftShoulderAbduction;  // 0°=右, 90°=下
  const lUpperDir = {
    x: Math.cos(degToRad(lUpperAngle)),
    y: Math.sin(degToRad(lUpperAngle)),
  };
  // 向前分量调整y
  const lElbow = {
    x: leftShoulder.x + lUpperDir.x * UPPER_ARM_LEN,
    y: leftShoulder.y + lUpperDir.y * UPPER_ARM_LEN + Math.sin(degToRad(a.leftShoulderForward)) * UPPER_ARM_LEN * 0.3,
  };
  s[13] = lElbow;

  // 左前臂继续向下+肘屈曲影响
  const lForearmAngle = 100 + a.leftElbowFlex * 0.5;
  const lWrist = {
    x: lElbow.x + Math.cos(degToRad(lForearmAngle)) * FOREARM_LEN,
    y: lElbow.y + Math.sin(degToRad(lForearmAngle)) * FOREARM_LEN,
  };
  s[15] = lWrist;
  s[17] = { x: lWrist.x - 0.01, y: lWrist.y + 0.01 };
  s[19] = { x: lWrist.x, y: lWrist.y + 0.02 };
  s[21] = { x: lWrist.x + 0.01, y: lWrist.y + 0.01 };

  // ── 右臂 ──
  const rUpperAngle = 90 - a.rightShoulderAbduction;
  const rElbow = {
    x: rightShoulder.x + Math.cos(degToRad(rUpperAngle)) * UPPER_ARM_LEN,
    y: rightShoulder.y + Math.sin(degToRad(rUpperAngle)) * UPPER_ARM_LEN + Math.sin(degToRad(a.rightShoulderForward)) * UPPER_ARM_LEN * 0.3,
  };
  s[14] = rElbow;

  const rForearmAngle = 80 - a.rightElbowFlex * 0.5;
  const rWrist = {
    x: rElbow.x + Math.cos(degToRad(rForearmAngle)) * FOREARM_LEN,
    y: rElbow.y + Math.sin(degToRad(rForearmAngle)) * FOREARM_LEN,
  };
  s[16] = rWrist;
  s[18] = { x: rWrist.x + 0.01, y: rWrist.y + 0.01 };
  s[20] = { x: rWrist.x, y: rWrist.y + 0.02 };
  s[22] = { x: rWrist.x - 0.01, y: rWrist.y + 0.01 };

  // ── 髋部 ──
  s[23] = leftHip;
  s[24] = rightHip;

  // ── 腿部 ──
  const leftKnee = {
    x: leftHip.x + Math.cos(degToRad(100 + a.leftHipForward * 0.3)) * THIGH_LEN * 0.3,
    y: leftHip.y + Math.sin(degToRad(90)) * THIGH_LEN,
  };
  const rightKnee = {
    x: rightHip.x + Math.cos(degToRad(80 - a.rightHipForward * 0.3)) * THIGH_LEN * 0.3,
    y: rightHip.y + Math.sin(degToRad(90)) * THIGH_LEN,
  };
  s[25] = leftKnee;
  s[26] = rightKnee;

  // 小腿
  const leftAnkle = {
    x: leftKnee.x,
    y: leftKnee.y + SHIN_LEN,
  };
  const rightAnkle = {
    x: rightKnee.x,
    y: rightKnee.y + SHIN_LEN,
  };
  s[27] = leftAnkle;
  s[28] = rightAnkle;
  s[29] = { x: leftAnkle.x - 0.01, y: leftAnkle.y + 0.02 };
  s[30] = { x: rightAnkle.x + 0.01, y: rightAnkle.y + 0.02 };
  s[31] = { x: leftAnkle.x + 0.02, y: leftAnkle.y };
  s[32] = { x: rightAnkle.x - 0.02, y: rightAnkle.y };

  return s;
}

// ═════════════════════════════════════════════════════════
// 各动作的标准关节角度（基于运动生物力学文献参考值）
// ═════════════════════════════════════════════════════════

// 网球 — 中性站姿（握拍类基准）
const TENNIS_NEUTRAL: PoseAngles = {
  trunkLean: 5,
  shoulderRotation: 0,
  leftShoulderAbduction: 15,
  rightShoulderAbduction: 15,
  leftShoulderForward: 0,
  rightShoulderForward: 0,
  leftElbowFlex: 160,
  rightElbowFlex: 160,
  kneeFlex: 170,
  leftHipForward: 0,
  rightHipForward: 0,
};

// 网球 — 发球托举（Trophy Position）
const TENNIS_SERVE_TROPHY: PoseAngles = {
  trunkLean: -10,        // 稍后仰
  shoulderRotation: 30,  // 肩膀旋转，左侧在前
  leftShoulderAbduction: 150,   // 左臂高抬
  rightShoulderAbduction: 150,  // 右臂也高抬
  leftShoulderForward: 20,
  rightShoulderForward: -15,
  leftElbowFlex: 130,    // 左肘弯曲（抛球手）
  rightElbowFlex: 80,    // 右肘弯曲90°（持拍手）
  kneeFlex: 150,         // 膝盖微屈蓄力
  leftHipForward: 0,
  rightHipForward: 0,
};

// 网球 — 正手准备
const TENNIS_FH_READY: PoseAngles = {
  trunkLean: 15,
  shoulderRotation: 20,  // 侧身
  leftShoulderAbduction: 30,
  rightShoulderAbduction: 40,
  leftShoulderForward: 10,
  rightShoulderForward: 25,
  leftElbowFlex: 140,
  rightElbowFlex: 120,
  kneeFlex: 140,
  leftHipForward: 0,
  rightHipForward: 0,
};

// 网球 — 正手引拍
const TENNIS_FH_BACKSWING: PoseAngles = {
  trunkLean: 15,
  shoulderRotation: 50,  // 大幅度转肩
  leftShoulderAbduction: 50,
  rightShoulderAbduction: 70,
  leftShoulderForward: 30,
  rightShoulderForward: 40,
  leftElbowFlex: 100,
  rightElbowFlex: 90,
  kneeFlex: 140,
  leftHipForward: 5,
  rightHipForward: 0,
};

// 网球 — 发球击球点
const TENNIS_SERVE_CONTACT: PoseAngles = {
  trunkLean: -5,
  shoulderRotation: 15,
  leftShoulderAbduction: 160,
  rightShoulderAbduction: 170,  // 右臂几乎竖直
  leftShoulderForward: -10,
  rightShoulderForward: -20,
  leftElbowFlex: 160,
  rightElbowFlex: 175,  // 手臂近乎完全伸展
  kneeFlex: 160,
  leftHipForward: 5,
  rightHipForward: 0,
};

// 网球 — 双手反手准备
const TENNIS_BH_2H_READY: PoseAngles = {
  trunkLean: 15,
  shoulderRotation: -30,  // 反向旋转
  leftShoulderAbduction: 40,
  rightShoulderAbduction: 30,
  leftShoulderForward: 30,
  rightShoulderForward: 5,
  leftElbowFlex: 130,
  rightElbowFlex: 140,
  kneeFlex: 145,
  leftHipForward: 0,
  rightHipForward: 0,
};

// 网球 — 截击准备
const TENNIS_VOLLEY: PoseAngles = {
  trunkLean: 20,
  shoulderRotation: 5,
  leftShoulderAbduction: 25,
  rightShoulderAbduction: 45,
  leftShoulderForward: 15,
  rightShoulderForward: 30,
  leftElbowFlex: 135,
  rightElbowFlex: 110,
  kneeFlex: 135,
  leftHipForward: 0,
  rightHipForward: 0,
};

// ─── 高尔夫 ──────────────────────────────────────────────

// 高尔夫 — 站位准备（Address）
const GOLF_SETUP: PoseAngles = {
  trunkLean: 35,         // 显著前倾
  shoulderRotation: 5,
  leftShoulderAbduction: 20,
  rightShoulderAbduction: 15,
  leftShoulderForward: -5,
  rightShoulderForward: -5,
  leftElbowFlex: 160,
  rightElbowFlex: 155,
  kneeFlex: 145,         // 膝盖微屈
  leftHipForward: 0,
  rightHipForward: 0,
};

// 高尔夫 — 上杆半程
const GOLF_HALF_BACK: PoseAngles = {
  trunkLean: 30,
  shoulderRotation: 40,  // 肩膀开始旋转
  leftShoulderAbduction: 40,
  rightShoulderAbduction: 30,
  leftShoulderForward: 15,
  rightShoulderForward: -20,
  leftElbowFlex: 155,
  rightElbowFlex: 110,   // 右肘开始弯曲
  kneeFlex: 150,
  leftHipForward: 0,
  rightHipForward: 0,
};

// 高尔夫 — 上杆顶点（Top）
const GOLF_TOP: PoseAngles = {
  trunkLean: 25,
  shoulderRotation: 70,  // 肩膀旋转接近90°
  leftShoulderAbduction: 60,
  rightShoulderAbduction: 55,
  leftShoulderForward: 30,
  rightShoulderForward: -40,
  leftElbowFlex: 160,    // 左臂伸直
  rightElbowFlex: 70,    // 右臂弯曲
  kneeFlex: 155,
  leftHipForward: 0,
  rightHipForward: 5,
};

// 高尔夫 — 击球瞬间（Impact）
const GOLF_IMPACT: PoseAngles = {
  trunkLean: 30,
  shoulderRotation: 10,
  leftShoulderAbduction: 25,
  rightShoulderAbduction: 15,
  leftShoulderForward: -5,
  rightShoulderForward: -5,
  leftElbowFlex: 165,
  rightElbowFlex: 160,
  kneeFlex: 145,
  leftHipForward: 10,
  rightHipForward: 0,    // 重心在左侧
};

// 高尔夫 — 收杆（Follow Through）
const GOLF_FOLLOW: PoseAngles = {
  trunkLean: -10,        // 身体直立甚至微后仰
  shoulderRotation: -40, // 肩膀转到目标方向
  leftShoulderAbduction: 55,
  rightShoulderAbduction: 60,
  leftShoulderForward: -30,
  rightShoulderForward: -20,
  leftElbowFlex: 100,
  rightElbowFlex: 80,    // 双臂折叠
  kneeFlex: 160,
  leftHipForward: 10,
  rightHipForward: 15,
};

// 高尔夫 — 推杆
const GOLF_PUTTING: PoseAngles = {
  trunkLean: 25,
  shoulderRotation: 0,
  leftShoulderAbduction: 15,
  rightShoulderAbduction: 12,
  leftShoulderForward: 0,
  rightShoulderForward: 0,
  leftElbowFlex: 165,
  rightElbowFlex: 165,
  kneeFlex: 160,
  leftHipForward: 0,
  rightHipForward: 0,
};

// 高尔夫 — 切杆
const GOLF_CHIPPING: PoseAngles = {
  trunkLean: 30,
  shoulderRotation: 0,
  leftShoulderAbduction: 18,
  rightShoulderAbduction: 14,
  leftShoulderForward: 0,
  rightShoulderForward: 0,
  leftElbowFlex: 160,
  rightElbowFlex: 160,
  kneeFlex: 155,
  leftHipForward: 8,
  rightHipForward: 0,
};

// ═════════════════════════════════════════════════════════
// 映射表
// ═════════════════════════════════════════════════════════

export const IDEAL_SKELETONS: Record<string, IdealSkeleton> = {
  // 网球
  tennis_grip_eastern:     anglesToSkeleton(TENNIS_NEUTRAL),
  tennis_grip_semiwestern: anglesToSkeleton(TENNIS_NEUTRAL),
  tennis_grip_western:     anglesToSkeleton(TENNIS_NEUTRAL),
  tennis_grip_continental: anglesToSkeleton(TENNIS_NEUTRAL),
  tennis_serve_trophy:     anglesToSkeleton(TENNIS_SERVE_TROPHY),
  tennis_serve_contact:    anglesToSkeleton(TENNIS_SERVE_CONTACT),
  tennis_serve_ready:      anglesToSkeleton(TENNIS_SERVE_TROPHY),
  tennis_fh_ready:         anglesToSkeleton(TENNIS_FH_READY),
  tennis_fh_backswing:     anglesToSkeleton(TENNIS_FH_BACKSWING),
  tennis_fh_contact:       anglesToSkeleton(TENNIS_FH_READY),
  tennis_fh_follow:        anglesToSkeleton(TENNIS_FH_READY),
  tennis_bh_2h_ready:      anglesToSkeleton(TENNIS_BH_2H_READY),
  tennis_bh_2h_contact:    anglesToSkeleton(TENNIS_BH_2H_READY),
  tennis_bh_1h_ready:      anglesToSkeleton(TENNIS_BH_2H_READY),
  tennis_bh_slice:         anglesToSkeleton(TENNIS_BH_2H_READY),
  tennis_fh_volley:        anglesToSkeleton(TENNIS_VOLLEY),
  tennis_bh_volley:        anglesToSkeleton(TENNIS_VOLLEY),
  // 高尔夫
  golf_grip_overlap:   anglesToSkeleton(GOLF_SETUP),
  golf_grip_interlock: anglesToSkeleton(GOLF_SETUP),
  golf_grip_baseball:  anglesToSkeleton(GOLF_SETUP),
  golf_setup:           anglesToSkeleton(GOLF_SETUP),
  golf_half_back:       anglesToSkeleton(GOLF_HALF_BACK),
  golf_top:             anglesToSkeleton(GOLF_TOP),
  golf_impact:          anglesToSkeleton(GOLF_IMPACT),
  golf_follow:          anglesToSkeleton(GOLF_FOLLOW),
  golf_putting:         anglesToSkeleton(GOLF_PUTTING),
  golf_chipping:        anglesToSkeleton(GOLF_CHIPPING),
  golf_pitching:        anglesToSkeleton(GOLF_CHIPPING),
  golf_bunker:          anglesToSkeleton(GOLF_CHIPPING),
};

// 默认直立站姿
export const DEFAULT_SKELETON: IdealSkeleton = anglesToSkeleton({
  trunkLean: 0,
  shoulderRotation: 0,
  leftShoulderAbduction: 12,
  rightShoulderAbduction: 12,
  leftShoulderForward: 0,
  rightShoulderForward: 0,
  leftElbowFlex: 170,
  rightElbowFlex: 170,
  kneeFlex: 175,
  leftHipForward: 0,
  rightHipForward: 0,
});
