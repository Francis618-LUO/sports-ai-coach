// 理想姿态骨架数据 — 归一化坐标 (x: 0-1, y: 0-1)，y=0 为顶部
// 基于标准人体比例和运动生物力学参考值近似定义

export interface SkeletonFrame {
  x: number;
  y: number;
}

export type IdealSkeleton = SkeletonFrame[]; // 33个关键点

// 辅助：创建31个点的骨架（省略面部细节点）
function makeSkeleton(
  headX: number, headY: number,
  leftShoulderX: number, leftShoulderY: number,
  rightShoulderX: number, rightShoulderY: number,
  leftElbowX: number, leftElbowY: number,
  rightElbowX: number, rightElbowY: number,
  leftWristX: number, leftWristY: number,
  rightWristX: number, rightWristY: number,
  leftHipX: number, leftHipY: number,
  rightHipX: number, rightHipY: number,
  leftKneeX: number, leftKneeY: number,
  rightKneeX: number, rightKneeY: number,
  leftAnkleX: number, leftAnkleY: number,
  rightAnkleX: number, rightAnkleY: number,
): IdealSkeleton {
  const s: IdealSkeleton = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5 }));

  // 头部区域
  s[0] = { x: headX, y: headY };           // 鼻尖
  s[1] = { x: headX - 0.01, y: headY - 0.03 }; // 左眼内角
  s[2] = { x: headX - 0.01, y: headY - 0.03 };
  s[3] = { x: headX - 0.02, y: headY - 0.04 };
  s[4] = { x: headX + 0.01, y: headY - 0.03 }; // 右眼内角
  s[5] = { x: headX + 0.01, y: headY - 0.03 };
  s[6] = { x: headX + 0.02, y: headY - 0.04 };
  s[7] = { x: headX - 0.01, y: headY + 0.01 }; // 左耳
  s[8] = { x: headX + 0.01, y: headY + 0.01 }; // 右耳
  s[9] = { x: headX, y: headY + 0.03 };        // 嘴左
  s[10] = { x: headX, y: headY + 0.03 };       // 嘴右

  // 肩膀
  s[11] = { x: leftShoulderX, y: leftShoulderY };
  s[12] = { x: rightShoulderX, y: rightShoulderY };

  // 肘部
  s[13] = { x: leftElbowX, y: leftElbowY };
  s[14] = { x: rightElbowX, y: rightElbowY };

  // 手腕
  s[15] = { x: leftWristX, y: leftWristY };
  s[16] = { x: rightWristX, y: rightWristY };

  // 手指
  s[17] = { x: leftWristX - 0.01, y: leftWristY + 0.01 };
  s[18] = { x: rightWristX + 0.01, y: rightWristY + 0.01 };
  s[19] = { x: leftWristX, y: leftWristY + 0.02 };
  s[20] = { x: rightWristX, y: rightWristY + 0.02 };
  s[21] = { x: leftWristX + 0.01, y: leftWristY + 0.01 };
  s[22] = { x: rightWristX - 0.01, y: rightWristY + 0.01 };

  // 髋部
  s[23] = { x: leftHipX, y: leftHipY };
  s[24] = { x: rightHipX, y: rightHipY };

  // 膝盖
  s[25] = { x: leftKneeX, y: leftKneeY };
  s[26] = { x: rightKneeX, y: rightKneeY };

  // 脚踝
  s[27] = { x: leftAnkleX, y: leftAnkleY };
  s[28] = { x: rightAnkleX, y: rightAnkleY };

  // 脚跟和脚趾
  s[29] = { x: leftAnkleX - 0.01, y: leftAnkleY + 0.02 };
  s[30] = { x: rightAnkleX + 0.01, y: rightAnkleY + 0.02 };
  s[31] = { x: leftAnkleX + 0.01, y: leftAnkleY };
  s[32] = { x: rightAnkleX + 0.01, y: rightAnkleY };

  return s;
}

// ═══════════════════════════════════════════════════════════
// 网球 — 理想骨架
// ═══════════════════════════════════════════════════════════

/** 正手准备姿势：分腿站立，拍头朝前，重心微蹲 */
const TENNIS_FH_READY = makeSkeleton(
  0.5, 0.12,       // 头部
  0.38, 0.22, 0.62, 0.22,  // 肩膀
  0.30, 0.32, 0.70, 0.32,  // 肘部 (右臂前伸握拍)
  0.28, 0.42, 0.80, 0.38,  // 手腕
  0.42, 0.50, 0.58, 0.50,  // 髋部
  0.42, 0.68, 0.58, 0.68,  // 膝盖
  0.42, 0.88, 0.58, 0.88,  // 脚踝
);

/** 发球托举：Trophy Position */
const TENNIS_SERVE_TROPHY = makeSkeleton(
  0.5, 0.10,
  0.42, 0.20, 0.58, 0.20,
  0.34, 0.14, 0.66, 0.14,  // 双臂上举
  0.30, 0.05, 0.82, 0.08,  // 手腕高举 + 抛球手
  0.44, 0.48, 0.56, 0.48,
  0.44, 0.66, 0.56, 0.66,
  0.44, 0.86, 0.56, 0.86,
);

/** 东方式握拍 */
const TENNIS_GRIP_EASTERN = makeSkeleton(
  0.5, 0.14,
  0.40, 0.24, 0.60, 0.24,
  0.32, 0.34, 0.68, 0.34,
  0.30, 0.44, 0.76, 0.40,  // 右手在拍柄上
  0.44, 0.52, 0.56, 0.52,
  0.44, 0.70, 0.56, 0.70,
  0.44, 0.88, 0.56, 0.88,
);

/** 双手反手准备 */
const TENNIS_BH_2H_READY = makeSkeleton(
  0.5, 0.12,
  0.36, 0.22, 0.64, 0.22,
  0.30, 0.34, 0.70, 0.30,  // 双手在身体左侧
  0.28, 0.44, 0.74, 0.38,
  0.42, 0.50, 0.58, 0.50,
  0.42, 0.68, 0.58, 0.68,
  0.42, 0.88, 0.58, 0.88,
);

/** 正手截击 */
const TENNIS_FH_VOLLEY = makeSkeleton(
  0.5, 0.12,
  0.38, 0.22, 0.62, 0.22,
  0.32, 0.30, 0.70, 0.28,
  0.34, 0.38, 0.80, 0.28,  // 球拍在身体前方
  0.42, 0.50, 0.58, 0.50,
  0.42, 0.68, 0.58, 0.68,
  0.42, 0.88, 0.58, 0.88,
);

/** 正手引拍 */
const TENNIS_FH_BACKSWING = makeSkeleton(
  0.5, 0.12,
  0.34, 0.22, 0.66, 0.22,  // 肩膀旋转
  0.26, 0.30, 0.74, 0.28,
  0.22, 0.36, 0.80, 0.34,
  0.42, 0.50, 0.58, 0.50,
  0.42, 0.68, 0.58, 0.68,
  0.42, 0.88, 0.58, 0.88,
);

/** 发球击球点 */
const TENNIS_SERVE_CONTACT = makeSkeleton(
  0.5, 0.10,
  0.42, 0.20, 0.58, 0.20,
  0.36, 0.10, 0.64, 0.06,  // 右臂完全伸展向上
  0.34, 0.02, 0.80, 0.08,  // 最高点击球
  0.44, 0.50, 0.56, 0.50,
  0.44, 0.66, 0.56, 0.66,
  0.42, 0.86, 0.58, 0.86,
);

// ═══════════════════════════════════════════════════════════
// 高尔夫 — 理想骨架
// ═══════════════════════════════════════════════════════════

/** 站位准备 (Address) */
const GOLF_SETUP = makeSkeleton(
  0.5, 0.14,
  0.42, 0.30, 0.58, 0.30,  // 肩膀，身体前倾
  0.36, 0.44, 0.64, 0.40,  // 手臂自然下垂握杆
  0.34, 0.56, 0.66, 0.52,
  0.44, 0.52, 0.56, 0.52,  // 髋部后坐
  0.44, 0.70, 0.56, 0.70,  // 膝盖微屈
  0.44, 0.90, 0.56, 0.90,
);

/** 上杆顶点 (Top) */
const GOLF_TOP = makeSkeleton(
  0.5, 0.12,
  0.34, 0.22, 0.66, 0.20,  // 肩膀旋转90度
  0.28, 0.18, 0.68, 0.14,  // 左臂伸直，右臂弯曲
  0.24, 0.08, 0.60, 0.08,  // 球杆在头顶
  0.42, 0.50, 0.58, 0.50,
  0.42, 0.68, 0.58, 0.68,
  0.42, 0.88, 0.58, 0.88,
);

/** 击球瞬间 (Impact) */
const GOLF_IMPACT = makeSkeleton(
  0.5, 0.14,
  0.40, 0.28, 0.60, 0.28,
  0.36, 0.44, 0.64, 0.40,
  0.34, 0.56, 0.66, 0.52,
  0.42, 0.50, 0.58, 0.50,  // 重心转移至前脚
  0.42, 0.68, 0.60, 0.68,
  0.42, 0.88, 0.60, 0.88,
);

/** 收杆 (Follow Through) */
const GOLF_FOLLOW = makeSkeleton(
  0.5, 0.10,
  0.44, 0.22, 0.56, 0.20,
  0.48, 0.14, 0.52, 0.16,  // 手臂绕至身体前方
  0.50, 0.06, 0.50, 0.10,
  0.44, 0.50, 0.56, 0.50,
  0.44, 0.68, 0.56, 0.68,
  0.44, 0.88, 0.56, 0.88,
);

/** 推杆站姿 */
const GOLF_PUTTING = makeSkeleton(
  0.5, 0.18,
  0.44, 0.34, 0.56, 0.34,  // 肩膀水平
  0.40, 0.46, 0.60, 0.46,  // 手臂自然下垂
  0.38, 0.58, 0.62, 0.58,  // 双手握杆
  0.46, 0.54, 0.54, 0.54,  // 髋部微后坐
  0.46, 0.72, 0.54, 0.72,
  0.46, 0.92, 0.54, 0.92,
);

/** 上杆半程 */
const GOLF_HALF_BACK = makeSkeleton(
  0.5, 0.14,
  0.38, 0.26, 0.62, 0.26,
  0.32, 0.28, 0.66, 0.22,
  0.30, 0.24, 0.64, 0.18,
  0.44, 0.50, 0.56, 0.50,
  0.44, 0.68, 0.56, 0.68,
  0.44, 0.88, 0.56, 0.88,
);

/** 切杆站位 */
const GOLF_CHIPPING = makeSkeleton(
  0.5, 0.16,
  0.44, 0.32, 0.56, 0.32,
  0.40, 0.46, 0.60, 0.44,
  0.38, 0.58, 0.62, 0.56,
  0.44, 0.52, 0.56, 0.52,
  0.44, 0.70, 0.56, 0.70,
  0.44, 0.90, 0.56, 0.90,
);

// ─── 映射表 ─────────────────────────────────────────────

export const IDEAL_SKELETONS: Record<string, IdealSkeleton> = {
  // 网球
  tennis_fh_ready: TENNIS_FH_READY,
  tennis_fh_backswing: TENNIS_FH_BACKSWING,
  tennis_fh_contact: TENNIS_FH_READY,       // 近似
  tennis_fh_follow: TENNIS_FH_READY,         // 近似
  tennis_serve_trophy: TENNIS_SERVE_TROPHY,
  tennis_serve_contact: TENNIS_SERVE_CONTACT,
  tennis_serve_ready: TENNIS_SERVE_TROPHY,   // 近似
  tennis_bh_2h_ready: TENNIS_BH_2H_READY,
  tennis_bh_2h_contact: TENNIS_BH_2H_READY,  // 近似
  tennis_bh_1h_ready: TENNIS_BH_2H_READY,    // 近似
  tennis_bh_slice: TENNIS_BH_2H_READY,       // 近似
  tennis_fh_volley: TENNIS_FH_VOLLEY,
  tennis_bh_volley: TENNIS_FH_VOLLEY,         // 近似（镜像）
  tennis_grip_eastern: TENNIS_GRIP_EASTERN,
  tennis_grip_semiwestern: TENNIS_GRIP_EASTERN,
  tennis_grip_western: TENNIS_GRIP_EASTERN,
  tennis_grip_continental: TENNIS_GRIP_EASTERN,
  // 高尔夫
  golf_setup: GOLF_SETUP,
  golf_half_back: GOLF_HALF_BACK,
  golf_top: GOLF_TOP,
  golf_impact: GOLF_IMPACT,
  golf_follow: GOLF_FOLLOW,
  golf_putting: GOLF_PUTTING,
  golf_chipping: GOLF_CHIPPING,
  golf_pitching: GOLF_CHIPPING,   // 近似
  golf_bunker: GOLF_CHIPPING,     // 近似
  golf_grip_overlap: GOLF_SETUP,
  golf_grip_interlock: GOLF_SETUP,
  golf_grip_baseball: GOLF_SETUP,
};

// 默认站姿（未知姿势的回退）
export const DEFAULT_SKELETON: IdealSkeleton = makeSkeleton(
  0.5, 0.14,
  0.42, 0.26, 0.58, 0.26,
  0.36, 0.40, 0.64, 0.40,
  0.34, 0.54, 0.66, 0.54,
  0.44, 0.52, 0.56, 0.52,
  0.44, 0.70, 0.56, 0.70,
  0.44, 0.90, 0.56, 0.90,
);
