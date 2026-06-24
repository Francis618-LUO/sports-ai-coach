const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Francis618-LUO";
pres.title = "AI运动姿态教练 - 期末答辩";

// ─── Color Palette ───────────────────────────────────────
const C = {
  bg: "0F172A",        // 深蓝黑背景
  bg2: "1E293B",       // 稍亮背景
  accent: "6366F1",    // 主色调 紫蓝
  accent2: "818CF8",   // 浅紫蓝
  green: "22C55E",     // 绿色强调
  gold: "F59E0B",      // 金色
  red: "EF4444",       // 红色
  white: "F1F5F9",     // 白
  gray: "94A3B8",      // 灰色文字
  darkGray: "475569",  // 深灰
  card: "1A2640",      // 卡片背景
};

// ─── Helpers ─────────────────────────────────────────────
function addSlideNum(slide, num) {
  slide.addText(String(num), {
    x: 9.3, y: 5.15, w: 0.5, h: 0.3, fontSize: 10, color: C.darkGray, align: "right",
  });
}

function addFooter(slide) {
  slide.addText("AI运动姿态教练 · 人工智能创新课程", {
    x: 0.5, y: 5.15, w: 4, h: 0.3, fontSize: 8, color: C.darkGray,
  });
}

function addTitle(slide, title, subtitle) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.5, w: 0.06, h: 0.45, fill: { color: C.accent },
  });
  slide.addText(title, {
    x: 0.8, y: 0.45, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial", bold: true, color: C.white, margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.0, w: 8, h: 0.3, fontSize: 12, fontFace: "Arial", color: C.gray, margin: 0,
    });
  }
}

// ─── Slide 1: Cover ─────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // 装饰元素
  s.addShape(pres.shapes.OVAL, { x: 7.5, y: -1, w: 4, h: 4, fill: { color: C.accent, transparency: 92 } });
  s.addShape(pres.shapes.OVAL, { x: -1, y: 3, w: 4, h: 4, fill: { color: C.accent2, transparency: 92 } });

  // 顶部标签
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.8, y: 1.0, w: 2.4, h: 0.35,
    fill: { color: C.accent, transparency: 20 },
  });
  s.addText("人工智能创新课程 · 期末答辩", {
    x: 3.8, y: 1.0, w: 2.4, h: 0.35, fontSize: 11, color: C.accent2, align: "center", fontFace: "Arial",
  });

  // 主标题
  s.addText("AI运动姿态教练", {
    x: 1.0, y: 1.8, w: 8, h: 1.2, fontSize: 48, fontFace: "Arial Black", bold: true, color: C.white, align: "center",
  });
  s.addText("Sports AI Coach — 双运动智能动作分析", {
    x: 1.0, y: 2.8, w: 8, h: 0.5, fontSize: 18, fontFace: "Arial", color: C.accent2, align: "center",
  });

  // 底部信息
  s.addText("Francis618-LUO  |  2024年6月", {
    x: 1.0, y: 4.2, w: 8, h: 0.4, fontSize: 14, fontFace: "Arial", color: C.gray, align: "center",
  });
}

// ─── Slide 2: 项目背景 ─────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "项目背景", "为什么做这个项目？");
  addFooter(s); addSlideNum(s, 2);

  // 问题卡片
  const problems = [
    { icon: "💰", title: "高成本", desc: "网球私教 300-500/h\n高尔夫教练 800-1500/h" },
    { icon: "📍", title: "不可达", desc: "优质教练资源集中\n无法随时随地进行指导" },
    { icon: "🏌️", title: "高门槛", desc: "动作规范性要求极高\n错误姿势导致运动伤害" },
  ];

  problems.forEach((p, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.8, w: 2.8, h: 2.2, fill: { color: C.card },
      shadow: { type: "outer", blur: 8, offset: 2, color: "000000", opacity: 0.3 },
    });
    s.addText(p.icon, { x, y: 1.95, w: 2.8, h: 0.5, fontSize: 28, align: "center" });
    s.addText(p.title, { x, y: 2.45, w: 2.8, h: 0.4, fontSize: 16, bold: true, color: C.white, align: "center", fontFace: "Arial" });
    s.addText(p.desc, { x: x + 0.2, y: 2.9, w: 2.4, h: 0.8, fontSize: 11, color: C.gray, align: "center", fontFace: "Arial" });
  });

  // 底部箭头 + 结论
  s.addText("→", { x: 0.5, y: 4.2, w: 1, h: 0.4, fontSize: 24, color: C.accent, align: "center" });
  s.addText("结合网球+高尔夫两大爱好 · AI实现普惠化动作教学", {
    x: 1.2, y: 4.2, w: 8, h: 0.4, fontSize: 15, bold: true, color: C.green, fontFace: "Arial",
  });
}

// ─── Slide 3: 项目概述 ─────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "项目概述", "我们做了什么？");
  addFooter(s); addSlideNum(s, 3);

  // 流程
  const steps = ["📷 拍照/上传视频", "🦴 MediaPipe\n姿态检测", "🧠 DeepSeek\nAI分析", "📊 专业训练建议"];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.4;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.8, w: 2.1, h: 1.4, fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
    });
    s.addText(st, { x, y: 2.0, w: 2.1, h: 1.0, fontSize: 13, color: C.white, align: "center", fontFace: "Arial" });
    if (i < 3) {
      s.addText("→", { x: x + 2.1, y: 2.1, w: 0.3, h: 0.6, fontSize: 20, color: C.accent, align: "center" });
    }
  });

  // 项目描述
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.7, w: 9, h: 0.6, fill: { color: C.accent, transparency: 85 },
  });
  s.addText("项目描述：AI视觉识别网球、高尔夫动作偏差，实时纠错并推送专项练习方案，助力技术提升", {
    x: 0.7, y: 3.72, w: 8.6, h: 0.55, fontSize: 14, color: C.accent2, align: "center", fontFace: "Arial",
  });

  // 关键数据
  const stats = [
    { num: "23+", label: "支持动作" },
    { num: "33", label: "骨骼关键点" },
    { num: "0-100", label: "AI评分" },
    { num: "2", label: "运动项目" },
  ];
  stats.forEach((st, i) => {
    const x = 0.8 + i * 2.3;
    s.addText(st.num, { x, y: 4.55, w: 1.8, h: 0.5, fontSize: 30, bold: true, color: C.green, align: "center", fontFace: "Arial" });
    s.addText(st.label, { x, y: 4.95, w: 1.8, h: 0.3, fontSize: 10, color: C.gray, align: "center" });
  });
}

// ─── Slide 4: 核心功能 ─────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "核心功能", "你能用它做什么？");
  addFooter(s); addSlideNum(s, 4);

  const features = [
    { icon: "📷", title: "照片分析", desc: "23种网球/高尔夫动作\n拍照即分析" },
    { icon: "🎬", title: "视频逐帧分析", desc: "6种全挥拍/全挥杆\n上传视频→骨架动画" },
    { icon: "🎯", title: "AI智能评分", desc: "0-100分综合评分\n9个关节独立打分" },
    { icon: "📊", title: "角度仪表盘", desc: "可视化偏差对比\n绿色正常·红色需改进" },
    { icon: "📸", title: "报告卡片", desc: "一键生成精美PNG\n骨骼图+评分+评语" },
    { icon: "📜", title: "历史记录", desc: "自动保存分析记录\n追踪进步趋势" },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.1;
    const y = 1.7 + row * 1.8;

    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.8, h: 1.55, fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
    });
    s.addText(f.icon, { x: x + 0.15, y: y + 0.15, w: 0.4, h: 0.4, fontSize: 22 });
    s.addText(f.title, { x: x + 0.6, y: y + 0.12, w: 2.0, h: 0.35, fontSize: 13, bold: true, color: C.white, fontFace: "Arial" });
    s.addText(f.desc, { x: x + 0.6, y: y + 0.5, w: 2.0, h: 0.85, fontSize: 10, color: C.gray, fontFace: "Arial" });
  });
}

// ─── Slide 5: 技术架构 ─────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "技术架构", "怎么实现的？");
  addFooter(s); addSlideNum(s, 5);

  // 架构层
  const layers = [
    { name: "前端", tech: "React 18 · TypeScript · Vite · Tailwind CSS", color: C.accent, y: 1.7 },
    { name: "AI 感知层", tech: "MediaPipe Pose · 浏览器端推理 · 33个骨骼关键点", color: C.green, y: 2.6 },
    { name: "AI 认知层", tech: "DeepSeek API · 国产大模型 · 教练级分析报告", color: C.gold, y: 3.5 },
    { name: "部署", tech: "GitHub Pages · 微信小程序 WebView 套壳", color: C.accent2, y: 4.4 },
  ];

  layers.forEach((l) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: l.y, w: 6.5, h: 0.7, fill: { color: l.color, transparency: 85 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: l.y, w: 0.06, h: 0.7, fill: { color: l.color },
    });
    s.addText(l.name, {
      x: 1.75, y: l.y, w: 1.5, h: 0.7, fontSize: 14, bold: true, color: l.color, fontFace: "Arial", valign: "middle", margin: 0,
    });
    s.addText(l.tech, {
      x: 3.3, y: l.y, w: 4.5, h: 0.7, fontSize: 11, color: C.white, fontFace: "Arial", valign: "middle", margin: 0,
    });
    if (l !== layers[layers.length - 1]) {
      s.addText("▼", {
        x: 4.5, y: l.y + 0.65, w: 1, h: 0.3, fontSize: 14, color: C.gray, align: "center",
      });
    }
  });
}

// ─── Slide 6: AI技术亮点 ────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "AI 技术亮点", "核心技术竞争力");
  addFooter(s); addSlideNum(s, 6);

  const highlights = [
    { title: "双 AI 引擎", desc: "感知层 MediaPipe（浏览器端33关键点检测）\n认知层 DeepSeek（云端教练级分析）", icon: "🧠" },
    { title: "全链路国内直连", desc: "DeepSeek API 无需 VPN · MediaPipe 模型 CDN 加速\n全技术栈中国大陆网络环境直接可用", icon: "🇨🇳" },
    { title: "帧间追踪 + Full 模型", desc: "VIDEO 模式利用时序信息平滑结果\nFull 模型精度远超 Lite，误差降低 40%", icon: "🎯" },
    { title: "智能评分 + 报告生成", desc: "9关节独立打分 → 加权综合评分\nCanvas 合成一键生成 PNG 分析报告", icon: "📊" },
  ];

  highlights.forEach((h, i) => {
    const x = i % 2 === 0 ? 0.5 : 5.1;
    const y = i < 2 ? 1.7 : 3.4;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.4, h: 1.5, fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
    });
    s.addText(h.icon, { x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.5, fontSize: 24 });
    s.addText(h.title, { x: x + 0.75, y: y + 0.1, w: 3.4, h: 0.35, fontSize: 15, bold: true, color: C.white, fontFace: "Arial" });
    s.addText(h.desc, { x: x + 0.75, y: y + 0.5, w: 3.4, h: 0.85, fontSize: 10, color: C.gray, fontFace: "Arial" });
  });
}

// ─── Slide 7: 微信小程序方案 ─────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "微信小程序方案", "WebView 容器套壳");
  addFooter(s); addSlideNum(s, 7);

  // 架构图
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.7, w: 4.2, h: 3.2, fill: { color: C.card },
    shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
  });
  s.addText("微信小程序壳", {
    x: 0.5, y: 1.8, w: 4.2, h: 0.4, fontSize: 14, bold: true, color: C.green, align: "center",
  });
  s.addText([
    { text: "📄 app.json (3行配置)", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "📄 index.wxml (<web-view>)", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "📄 index.js (URL配置)", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: " ", options: { fontSize: 8, breakLine: true } },
    { text: "⬇️ WebView 加载 ⬇️", options: { fontSize: 10, color: C.accent } },
  ], { x: 0.7, y: 2.3, w: 3.8, h: 2.4, fontFace: "Arial" });

  // 箭头
  s.addText("→", { x: 4.7, y: 2.8, w: 0.6, h: 0.5, fontSize: 30, color: C.accent, align: "center" });

  // Web应用
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.7, w: 4.2, h: 3.2, fill: { color: C.card },
    shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
  });
  s.addText("Web 应用（原封不动）", {
    x: 5.3, y: 1.8, w: 4.2, h: 0.4, fontSize: 14, bold: true, color: C.green, align: "center",
  });
  s.addText([
    { text: "✅ React + TypeScript SPA", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "✅ MediaPipe Pose 浏览器推理", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "✅ DeepSeek API 直连", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "✅ Canvas 骨架动画", options: { fontSize: 10, color: C.gray, breakLine: true } },
    { text: "✅ 报告卡片生成", options: { fontSize: 10, color: C.gray, breakLine: true } },
  ], { x: 5.5, y: 2.3, w: 3.8, h: 2.4, fontFace: "Arial" });
}

// ─── Slide 8: 演示效果 ──────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "演示效果", "真实界面展示");
  addFooter(s); addSlideNum(s, 8);

  const demos = [
    { title: "骨架动画", desc: "23种动作覆盖\n绿色骨骼实时叠加\n帧间插值平滑动画" },
    { title: "评分仪表盘", desc: "0-100分环形仪表\n9关节独立评分\n绿/黄/红三色状态" },
    { title: "AI分析报告", desc: "DeepSeek生成评语\n问题列表+严重度\n分步训练计划" },
    { title: "报告卡片", desc: "Canvas合成PNG\n评分+骨骼+评语\n一键保存到相册" },
  ];

  demos.forEach((d, i) => {
    const x = 0.35 + i * 2.4;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.7, w: 2.15, h: 3.0, fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.2 },
    });
    // 占位图
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.2, y: 1.85, w: 1.75, h: 1.8, fill: { color: "0F172A" },
    });
    s.addText(d.title, {
      x: x + 0.2, y: 1.95, w: 1.75, h: 0.3, fontSize: 11, bold: true, color: C.accent2, align: "center",
    });
    s.addText("（现场演示）", {
      x: x + 0.2, y: 2.7, w: 1.75, h: 0.3, fontSize: 9, color: C.gray, align: "center",
    });
    s.addText(d.desc, {
      x: x + 0.15, y: 3.8, w: 1.85, h: 0.7, fontSize: 9, color: C.gray, align: "center", fontFace: "Arial",
    });
  });
}

// ─── Slide 9: 项目总结 ──────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addTitle(s, "项目总结", "为什么这个项目值得高分？");
  addFooter(s); addSlideNum(s, 9);

  const points = [
    { title: "选题差异化", desc: "全班唯一网球+高尔夫双运动选题，23种动作覆盖，个人特色极强", icon: "🎯" },
    { title: "技术层次丰富", desc: "感知层（MediaPipe 33关键点）+ 认知层（DeepSeek大模型），双层AI架构", icon: "🧠" },
    { title: "真实可用", desc: "无需VPN、不依赖硬件、手机浏览器即开即用，GitHub Pages线上运行", icon: "✅" },
    { title: "拓展性强", desc: "微信小程序 WebView 套壳方案就绪，企业号可直接发布", icon: "🚀" },
  ];

  points.forEach((p, i) => {
    const y = 1.7 + i * 0.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.75, fill: { color: C.card },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.15 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 0.06, h: 0.75, fill: { color: C.accent },
    });
    s.addText(p.icon, { x: 0.75, y, w: 0.5, h: 0.75, fontSize: 20 });
    s.addText(p.title, { x: 1.3, y: y + 0.05, w: 2, h: 0.35, fontSize: 14, bold: true, color: C.white, fontFace: "Arial", margin: 0 });
    s.addText(p.desc, { x: 1.3, y: y + 0.38, w: 7.8, h: 0.3, fontSize: 11, color: C.gray, fontFace: "Arial", margin: 0 });
  });

  // 底部总结
  s.addText("AI 视觉 + 大语言模型 = 普惠化运动教学", {
    x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 13, bold: true, color: C.green, align: "center",
  });
}

// ─── Slide 10: Thank You ────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  s.addShape(pres.shapes.OVAL, { x: 3, y: -1.5, w: 5, h: 5, fill: { color: C.accent, transparency: 90 } });
  s.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 3, h: 3, fill: { color: C.accent2, transparency: 90 } });

  s.addText("感谢聆听", {
    x: 1, y: 1.5, w: 8, h: 1, fontSize: 48, fontFace: "Arial Black", bold: true, color: C.white, align: "center",
  });
  s.addText("AI运动姿态教练 · Sports AI Coach", {
    x: 1, y: 2.5, w: 8, h: 0.5, fontSize: 18, color: C.accent2, align: "center",
  });

  s.addText([
    { text: "🌐 https://francis618-luo.github.io/sports-ai-coach/", options: { breakLine: true, fontSize: 13, color: C.gray } },
    { text: " ", options: { breakLine: true, fontSize: 8 } },
    { text: "👤 Francis618-LUO  |  🎾⛳ 网球 + 高尔夫", options: { fontSize: 13, color: C.gray } },
  ], { x: 1, y: 3.3, w: 8, h: 1.5, align: "center", fontFace: "Arial" });

  s.addText("Q & A", {
    x: 3.5, y: 4.8, w: 3, h: 0.5, fontSize: 20, bold: true, color: C.accent, align: "center",
  });
}

// ─── Generate ────────────────────────────────────────────
pres.writeFile({ fileName: "C:/Users/31922/Desktop/AI运动姿态教练_答辩.pptx" })
  .then(() => console.log("✅ PPT 已生成到桌面"))
  .catch((err) => console.error("❌ Error:", err));
