import type { SportType, JointAngle } from '../types';

const POSE_NAME_MAP: Record<string, string> = {
  tennis_ready: '正手准备姿势',
  tennis_trophy: '发球托举（Trophy Position）',
  tennis_grip: '半西方式握拍手型',
  golf_setup: '站位准备（Address/Setup）',
  golf_top: '上杆顶点（Top of Backswing）',
  golf_putting: '推杆姿势',
};

export function buildPrompt(
  sport: SportType,
  poseTypeId: string,
  angles: JointAngle[]
): string {
  const sportName = sport === 'tennis' ? '网球' : '高尔夫';
  const poseName = POSE_NAME_MAP[poseTypeId] || poseTypeId;
  const angleSummary = angles.map((a) => `- ${a.name}: ${a.value}°`).join('\n');

  return `你是一位专业的${sportName}教练，拥有丰富的运动生物力学知识。

## 运动项目
${sportName}

## 分析的动作
${poseName}

## 检测到的关节角度
${angleSummary}

## 任务
请根据以上关节角度数据，对用户的${sportName}动作进行专业分析。按以下JSON格式返回（只返回JSON，不要包含markdown代码块标记）：

{
  "summary": "整体动作评估（2-3句话，指出整体质量、最大的问题和最明显的优点）",
  "issues": [
    {
      "bodyPart": "具体身体部位",
      "problem": "问题描述（基于角度数据说明偏差）",
      "correction": "具体可操作的纠正方法",
      "severity": "low/medium/high"
    }
  ],
  "exercises": [
    {
      "step": 1,
      "name": "训练名称",
      "description": "详细训练步骤和方法",
      "reps": "建议组数和次数",
      "tip": "训练时的注意事项"
    }
  ]
}

要求：
1. issues至少列出2个问题，exercises至少列出2个训练建议
2. 使用专业但易懂的语言，像真人教练一样
3. 所有纠正建议必须具体、可独立执行
4. 如果角度数据接近标准，要给予肯定和鼓励
5. 只返回JSON，不要包含其他任何文字`;
}
