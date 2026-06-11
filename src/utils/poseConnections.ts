import type { SportType, PoseOption } from '../types';

// MediaPipe Pose 33个关键点之间的骨骼连线定义
export const POSE_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [15, 17], [15, 19], [15, 21], [17, 19],
  [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27],
  [24, 26], [26, 28],
  [27, 29], [27, 31], [29, 31],
  [28, 30], [28, 32], [30, 32],
];

// 分类的动作选项
export interface PoseCategory {
  id: string;
  name: string;
  icon: string;
  poses: PoseOption[];
}

export const TENNIS_CATEGORIES: PoseCategory[] = [
  {
    id: 'grips',
    name: '握拍方式',
    icon: '🤝',
    poses: [
      { id: 'tennis_grip_eastern', name: '东方式握拍', description: '食指根部对准拍面3号棱，适合平击球' },
      { id: 'tennis_grip_semiwestern', name: '半西方式握拍', description: '食指根部对准4号棱，现代正手主流握法' },
      { id: 'tennis_grip_western', name: '西方式握拍', description: '食指根部对准5号棱，适合强烈上旋球' },
      { id: 'tennis_grip_continental', name: '大陆式握拍', description: '食指根部对准2号棱，发球截击通用握法' },
    ],
  },
  {
    id: 'serve',
    name: '发球动作',
    icon: '🏐',
    poses: [
      { id: 'tennis_serve_trophy', name: '发球托举姿势', description: 'Trophy Position，双臂上举，重心后移' },
      { id: 'tennis_serve_contact', name: '发球击球点', description: '球拍接触球瞬间的身体姿态' },
      { id: 'tennis_serve_ready', name: '发球准备站姿', description: '发球前的侧身站姿和抛球手位置' },
    ],
  },
  {
    id: 'forehand',
    name: '正手击球',
    icon: '🎾',
    poses: [
      { id: 'tennis_fh_ready', name: '正手准备姿势', description: '分腿垫步后的准备站位，拍头朝前' },
      { id: 'tennis_fh_backswing', name: '正手引拍', description: '转体引拍，非持拍手辅助平衡' },
      { id: 'tennis_fh_contact', name: '正手击球点', description: '身体侧前方击球瞬间的姿态' },
      { id: 'tennis_fh_follow', name: '正手随挥', description: '击球后的随挥动作，拍头绕至肩后' },
    ],
  },
  {
    id: 'backhand',
    name: '反手击球',
    icon: '💪',
    poses: [
      { id: 'tennis_bh_2h_ready', name: '双手反手准备', description: '双手握拍，转体侧身准备' },
      { id: 'tennis_bh_2h_contact', name: '双手反手击球点', description: '身体前方击球瞬间' },
      { id: 'tennis_bh_1h_ready', name: '单手反手准备', description: '单手握拍，非持拍手辅助引拍' },
      { id: 'tennis_bh_slice', name: '反手切削', description: '由上往下的切削动作，大陆式握拍' },
    ],
  },
  {
    id: 'volley',
    name: '截击与网前',
    icon: '🏸',
    poses: [
      { id: 'tennis_fh_volley', name: '正手截击', description: '网前正手截击准备姿势' },
      { id: 'tennis_bh_volley', name: '反手截击', description: '网前反手截击准备姿势' },
    ],
  },
];

export const GOLF_CATEGORIES: PoseCategory[] = [
  {
    id: 'grip',
    name: '握杆方式',
    icon: '🤝',
    poses: [
      { id: 'golf_grip_overlap', name: '重叠式握杆', description: 'Vardon/Overlap Grip，最常用的握杆方式' },
      { id: 'golf_grip_interlock', name: '互锁式握杆', description: 'Interlocking Grip，适合手较小的球员' },
      { id: 'golf_grip_baseball', name: '棒球式握杆', description: 'Ten-Finger Grip，十指全部握杆' },
    ],
  },
  {
    id: 'full_swing',
    name: '全挥杆',
    icon: '🏌️',
    poses: [
      { id: 'golf_setup', name: '站位准备', description: 'Address姿势，脊柱前倾，膝盖微屈' },
      { id: 'golf_half_back', name: '上杆半程', description: '球杆平行地面，左臂伸直' },
      { id: 'golf_top', name: '上杆顶点', description: 'Top of Backswing，肩膀旋转90度' },
      { id: 'golf_impact', name: '击球瞬间', description: '球杆回到击球位置，重心转移至前脚' },
      { id: 'golf_follow', name: '收杆姿势', description: 'Follow Through，身体面朝目标' },
    ],
  },
  {
    id: 'short_game',
    name: '短杆技术',
    icon: '⛳',
    poses: [
      { id: 'golf_chipping', name: '切杆站位', description: 'Chipping准备，重心前移，手腕稳定' },
      { id: 'golf_pitching', name: '劈起杆站位', description: 'Pitching准备，杆面打开' },
      { id: 'golf_putting', name: '推杆站位', description: '推杆姿势，眼睛在球正上方' },
      { id: 'golf_bunker', name: '沙坑站位', description: '沙坑击球准备，杆面打开，站姿下沉' },
    ],
  },
];

export const POSE_OPTIONS: Record<SportType, PoseOption[]> = {
  tennis: TENNIS_CATEGORIES.flatMap((c) => c.poses),
  golf: GOLF_CATEGORIES.flatMap((c) => c.poses),
};
