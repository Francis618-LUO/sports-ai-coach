import type { SportType, JointAngle, AIAnalysisResult } from '../types';
import { buildPrompt } from '../utils/promptBuilder';

export async function analyzePose(
  sport: SportType,
  poseTypeId: string,
  angles: JointAngle[]
): Promise<AIAnalysisResult> {
  const prompt = buildPrompt(sport, poseTypeId, angles);

  // 浏览器端直连 DeepSeek（从 localStorage 读取 Key）
  const DEEPSEEK_KEY = localStorage.getItem('ds_api_key') || '';
  if (!DEEPSEEK_KEY) {
    throw new Error('未配置 API Key，请在首页设置');
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一位专业运动教练，专精网球和高尔夫动作分析。你必须严格按照JSON格式返回结果，不要包含任何markdown标记。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API 错误 (${response.status}): ${errText.slice(0, 100)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI返回格式异常，请重试');
  }

  return JSON.parse(jsonMatch[0]);
}
