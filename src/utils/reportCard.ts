import type { SportType, AIAnalysisResult, JointAngle } from '../types';
import { POSE_CONNECTIONS } from './poseConnections';

const W = 750;
const H = 1334;

export async function generateReportCard(
  poseImage: string,
  landmarks: Array<{ x: number; y: number; visibility: number }>,
  score: number,
  sport: SportType,
  aiResult: AIAnalysisResult,
  angles: JointAngle[],
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── 背景 ──
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.5, '#1e293b');
  bg.addColorStop(1, '#0f172a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── 装饰圆 ──
  ctx.fillStyle = 'rgba(34,197,94,0.05)';
  ctx.beginPath(); ctx.arc(600, 180, 200, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(150, 800, 160, 0, Math.PI * 2); ctx.fill();

  // ── 标题 ──
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px "Microsoft YaHei", Arial, sans-serif';
  ctx.textAlign = 'center';
  const sportName = sport === 'tennis' ? '🎾 网球' : '⛳ 高尔夫';
  ctx.fillText(`${sportName} 动作分析报告`, W / 2, 70);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Microsoft YaHei", Arial, sans-serif';
  ctx.fillText('AI Motion Analysis Report', W / 2, 100);

  // ── 评分圆环 ──
  const scoreX = W / 2;
  const scoreY = 210;
  const r = 70;

  // 背景环
  ctx.beginPath(); ctx.arc(scoreX, scoreY, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 10; ctx.stroke();

  // 分数弧
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
  const endAngle = -Math.PI / 2 + (score / 100) * Math.PI * 2;
  ctx.beginPath(); ctx.arc(scoreX, scoreY, r, -Math.PI / 2, endAngle);
  ctx.strokeStyle = scoreColor; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();

  // 分数文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 56px Arial, sans-serif';
  ctx.fillText(String(score), scoreX, scoreY + 5);
  ctx.font = '16px "Microsoft YaHei", Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('综合评分', scoreX, scoreY + 50);

  // ── 姿势图 + 骨架 ──
  const imgW = 320;
  const imgH = 420;
  const imgX = (W - imgW) / 2;
  const imgY = 290;

  // 圆角遮罩的裁剪区域
  ctx.save();
  ctx.beginPath();
  const rr = 20;
  ctx.moveTo(imgX + rr, imgY);
  ctx.lineTo(imgX + imgW - rr, imgY);
  ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + rr);
  ctx.lineTo(imgX + imgW, imgY + imgH - rr);
  ctx.quadraticCurveTo(imgX + imgW, imgY + imgH, imgX + imgW - rr, imgY + imgH);
  ctx.lineTo(imgX + rr, imgY + imgH);
  ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH - rr);
  ctx.lineTo(imgX, imgY + rr);
  ctx.quadraticCurveTo(imgX, imgY, imgX + rr, imgY);
  ctx.clip();

  // 画原图
  const photoImg = new Image();
  await new Promise<void>((resolve) => {
    photoImg.onload = () => {
      const scale = Math.max(imgW / photoImg.width, imgH / photoImg.height);
      const sw = imgW / scale;
      const sh = imgH / scale;
      const sx = (photoImg.width - sw) / 2;
      const sy = (photoImg.height - sh) / 2;
      ctx.drawImage(photoImg, sx, sy, sw, sh, imgX, imgY, imgW, imgH);
      resolve();
    };
    photoImg.src = poseImage;
  });

  // 骨架叠加
  if (landmarks.length > 0) {
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const [from, to] of POSE_CONNECTIONS) {
      const a = landmarks[from];
      const b = landmarks[to];
      if ((a.visibility ?? 0) > 0.4 && (b.visibility ?? 0) > 0.4) {
        ctx.beginPath();
        ctx.moveTo(imgX + a.x * imgW, imgY + a.y * imgH);
        ctx.lineTo(imgX + b.x * imgW, imgY + b.y * imgH);
        ctx.stroke();
      }
    }
    for (const lm of landmarks) {
      if ((lm.visibility ?? 0) > 0.4) {
        ctx.beginPath();
        ctx.arc(imgX + lm.x * imgW, imgY + lm.y * imgH, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#16A34A';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 2;
      }
    }
  }
  ctx.restore();

  // ── 图片下方标签 ──
  ctx.fillStyle = '#64748b';
  ctx.font = '13px "Microsoft YaHei", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI 姿态检测 · 33个骨骼关键点 · 实时关节角度计算', W / 2, imgY + imgH + 30);

  // ── AI 评语 ──
  const textY = imgY + imgH + 75;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px "Microsoft YaHei", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📋 AI 教练评估', 50, textY);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px "Microsoft YaHei", Arial, sans-serif';
  const lines = wrapText(ctx, aiResult.summary, W - 100);
  lines.forEach((line, i) => {
    ctx.fillText(line, 50, textY + 30 + i * 26);
  });

  // ── 关键问题 ──
  let issueY = textY + 30 + lines.length * 26 + 30;
  if (aiResult.issues.length > 0) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Microsoft YaHei", Arial, sans-serif';
    ctx.fillText('🔍 关键发现', 50, issueY);
    issueY += 30;

    const topIssues = aiResult.issues.slice(0, 3);
    for (const issue of topIssues) {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px "Microsoft YaHei", Arial, sans-serif';
      const text = `${icon} ${issue.bodyPart}: ${issue.problem}`;
      const textLines = wrapText(ctx, text, W - 100);
      textLines.forEach((l, j) => {
        ctx.fillText(l, 50, issueY + j * 22);
      });
      issueY += textLines.length * 22 + 10;
    }
  }

  // ── 底部 ──
  const footerY = H - 100;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath(); ctx.moveTo(50, footerY); ctx.lineTo(W - 50, footerY);
  ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '14px "Microsoft YaHei", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`角度数据: ${angles.map(a => `${a.name} ${a.value}°`).join(' | ')}`, 50, footerY + 35);

  ctx.textAlign = 'right';
  ctx.fillText('Powered by DeepSeek AI + MediaPipe Pose', W - 50, footerY + 35);
  ctx.fillText(new Date().toLocaleString('zh-CN'), W - 50, footerY + 60);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
