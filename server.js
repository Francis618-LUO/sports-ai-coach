// 本地开发 API 代理服务器
// 使用方式: node server.js (在另一个终端运行)
// Vite 会将 /api/* 请求代理到此服务器

import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

app.post('/api/analyze', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '缺少prompt参数' });
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: '未配置DEEPSEEK_API_KEY环境变量' });
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是一位专业运动教练，专精网球和高尔夫动作生物力学分析。你必须严格按照JSON格式返回结果，不要包含任何markdown标记。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepSeek API error:', response.status, errText);
      return res.status(response.status).json({
        error: `DeepSeek API 返回错误 (${response.status})，请稍后重试`,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 提取JSON（DeepSeek可能返回带markdown包裹的JSON）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from:', content);
      return res.status(500).json({ error: 'AI返回格式异常，请重试' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.json(result);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: '服务器内部错误，请重试' });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  if (!DEEPSEEK_API_KEY) {
    console.warn('⚠️  未设置 DEEPSEEK_API_KEY 环境变量，API将不可用');
    console.warn('   请运行: export DEEPSEEK_API_KEY=sk-your-key');
  }
});
