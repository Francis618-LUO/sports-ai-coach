import type { SportType, PoseOption } from '../types';

// MediaPipe Pose 33个关键点之间的骨骼连线定义
// 参考: https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
export const POSE_CONNECTIONS: [number, number][] = [
  // 面部轮廓
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  // 嘴唇
  [9, 10],
  // 躯干与手臂
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  // 前臂
  [15, 17], [15, 19], [15, 21], [17, 19],
  [16, 18], [16, 20], [16, 22], [18, 20],
  // 躯干与下半身
  [11, 23], [12, 24], [23, 24],
  // 腿部
  [23, 25], [25, 27],
  [24, 26], [26, 28],
  // 脚部
  [27, 29], [27, 31], [29, 31],
  [28, 30], [28, 32], [30, 32],
];

// 运动对应的动作选项
export const POSE_OPTIONS: Record<SportType, PoseOption[]> = {
  tennis: [
    { id: 'tennis_ready', name: '正手准备姿势', description: '击球前的准备站位，重心稍低' },
    { id: 'tennis_trophy', name: '发球托举', description: '发球时的Trophy Position，双臂上举' },
    { id: 'tennis_grip', name: '半西方式握拍', description: '半西方式正手握拍手型' },
  ],
  golf: [
    { id: 'golf_setup', name: '站位准备', description: '击球前的Address站位，脊柱前倾' },
    { id: 'golf_top', name: '上杆顶点', description: 'Top of Backswing，肩膀旋转到位' },
    { id: 'golf_putting', name: '推杆姿势', description: '果岭推杆站位，身体稳定' },
  ],
};
