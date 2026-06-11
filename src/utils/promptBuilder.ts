import type { SportType, JointAngle } from '../types';

const POSE_NAME_MAP: Record<string, string> = {
  // Tennis - Video
  tennis_fh_full: '正手全挥拍（完整连续动作）',
  tennis_bh_full: '反手全挥拍（完整连续动作）',
  tennis_serve_full: '发球全流程（完整连续动作）',
  // Tennis - Grips
  tennis_grip_eastern: '东方式握拍',
  tennis_grip_semiwestern: '半西方式握拍',
  tennis_grip_western: '西方式握拍',
  tennis_grip_continental: '大陆式握拍',
  // Tennis - Serve
  tennis_serve_trophy: '发球托举姿势（Trophy Position）',
  tennis_serve_contact: '发球击球点',
  tennis_serve_ready: '发球准备站姿',
  // Tennis - Forehand
  tennis_fh_ready: '正手准备姿势',
  tennis_fh_backswing: '正手引拍',
  tennis_fh_contact: '正手击球点',
  tennis_fh_follow: '正手随挥',
  // Tennis - Backhand
  tennis_bh_2h_ready: '双手反手准备',
  tennis_bh_2h_contact: '双手反手击球点',
  tennis_bh_1h_ready: '单手反手准备',
  tennis_bh_slice: '反手切削',
  // Tennis - Volley
  tennis_fh_volley: '正手截击',
  tennis_bh_volley: '反手截击',
  // Golf - Video
  golf_full_swing: '全挥杆（完整连续动作：站位→上杆→下杆→收杆）',
  golf_putting_stroke: '推杆（完整连续动作）',
  golf_chipping_stroke: '切杆（完整连续动作）',
  // Golf - Grip
  golf_grip_overlap: '重叠式握杆（Vardon Grip）',
  golf_grip_interlock: '互锁式握杆（Interlocking Grip）',
  golf_grip_baseball: '棒球式握杆（Ten-Finger Grip）',
  // Golf - Full Swing
  golf_setup: '站位准备（Address）',
  golf_half_back: '上杆半程',
  golf_top: '上杆顶点（Top of Backswing）',
  golf_impact: '击球瞬间（Impact）',
  golf_follow: '收杆姿势（Follow Through）',
  // Golf - Short Game
  golf_chipping: '切杆站位（Chipping）',
  golf_pitching: '劈起杆站位（Pitching）',
  golf_putting: '推杆站位',
  golf_bunker: '沙坑站位',
};

export function buildPrompt(
  sport: SportType,
  poseTypeId: string,
  angles: JointAngle[]
): string {
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';
  const poseName = POSE_NAME_MAP[poseTypeId] || poseTypeId;
  const angleSummary = angles.map((a) => `- ${a.name}: ${a.value}°`).join('\n');

  return `你是一位专业的${sportName}教练，拥有15年以上教学经验和运动生物力学背景。

## 运动项目
${sportName}

## 分析的动作
${poseName}

## 检测到的关节角度数据
${angleSummary}

## 任务
请根据以上关节角度数据，对用户的${poseName}动作进行专业分析。你需要在心里估算每个关节的得分（满分100），然后给出综合评价。

按以下JSON格式返回（只返回JSON，不要包含任何markdown标记）：

{
  "summary": "整体动作评估（3-4句话，指出动作质量、关键问题、最明显的优点，语气像真人教练，先肯定再指出改进方向）",
  "overallScore": 85,
  "issues": [
    {
      "bodyPart": "具体身体部位名称",
      "problem": "基于角度数据的具体问题描述",
      "correction": "分步纠正方法，越具体越好",
      "severity": "low/medium/high"
    }
  ],
  "exercises": [
    {
      "step": 1,
      "name": "训练名称",
      "description": "详细训练步骤，让用户可以独立练习",
      "reps": "建议组数和次数",
      "tip": "执行时最关键的注意事项"
    }
  ]
}

要求：
1. overallScore 是0-100的整数，基于关节角度偏离理想范围的程度
2. issues至少列出3个问题，exercises至少列出3个训练建议
3. 语言专业但易懂，像真人教练在跟你说话
4. 所有纠正方法必须具体、可操作
5. 如果某个关节角度很好，在summary里明确表扬
6. 只返回JSON，不要包含其他文字`;
}
