const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ── Helpers ──────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 32, bold: true })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 28, bold: true })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 24, bold: true })] });
}
function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, ...opts, children: [new TextRun({ text, font: "Microsoft YaHei", size: 21, ...opts.run })] });
}
function boldPara(text) {
  return new Paragraph({ spacing: { after: 80, line: 340 }, children: text.split(/(\*\*[^*]+\*\*)/g).map(part => {
    if (part.startsWith("**") && part.endsWith("**")) return new TextRun({ text: part.slice(2, -2), font: "Microsoft YaHei", size: 21, bold: true });
    return new TextRun({ text: part, font: "Microsoft YaHei", size: 21 });
  })});
}
function emptyPara() {
  return new Paragraph({ spacing: { after: 0 }, children: [] });
}

// ── Table helper ──────────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      borders, width: { size: colWidths[i], type: WidthType.DXA }, margins: cellMargins,
      shading: { fill: "1A5276", type: ShadingType.CLEAR },
      children: [new Paragraph({ children: [new TextRun({ text: h, font: "Microsoft YaHei", size: 20, bold: true, color: "FFFFFF" })] })]
    }))
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders, width: { size: colWidths[ci], type: WidthType.DXA }, margins: cellMargins,
      shading: ri % 2 === 0 ? { fill: "F8F9FA", type: ShadingType.CLEAR } : undefined,
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Microsoft YaHei", size: 20 })] })]
    }))
  }));
  return new Table({ width: { size: totalWidth, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

// ═══════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ═══════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Microsoft YaHei", color: "1A3C5E" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2C5F8A" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei", color: "3A7BBF" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "双运动AI姿态教练 —— 项目需求分析文档", font: "Microsoft YaHei", size: 16, color: "999999" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "— ", font: "Microsoft YaHei", size: 16, color: "999999" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 16, color: "999999" }),
          new TextRun({ text: " —", font: "Microsoft YaHei", size: 16, color: "999999" })]
        })]
      })
    },
    children: [
      // ═══ COVER / TITLE ═══
      emptyPara(), emptyPara(), emptyPara(), emptyPara(),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "双运动AI姿态教练", font: "Microsoft YaHei", size: 48, bold: true, color: "1A3C5E" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "Sports AI Coach", font: "Arial", size: 32, color: "3A7BBF" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "项目需求分析文档", font: "Microsoft YaHei", size: 36, bold: true, color: "1A3C5E" })] }),
      emptyPara(), emptyPara(),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "人工智能创新课程 · 期末实践项目", font: "Microsoft YaHei", size: 24, color: "666666" })] }),
      emptyPara(),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "开发者：Francis618-LUO", font: "Microsoft YaHei", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "日期：2026年6月11日", font: "Microsoft YaHei", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "版本：v1.1", font: "Microsoft YaHei", size: 22, color: "555555" })] }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // ═══ 一、背景意义 ═══
      heading1("一、背景意义"),
      heading2("1.1 项目背景"),
      para("随着全民健身意识的提升，网球和高尔夫两项运动在中国正迅速普及。然而，这两项运动都属于高技巧门槛运动——动作的规范性直接影响击球效果和运动安全。传统模式下，初学者依赖教练一对一指导，费用高昂（网球私教约300-500元/小时，高尔夫教练约800-1500元/小时），且教练资源分布不均，难以随时随地进行动作指导。"),
      para("与此同时，人工智能技术在计算机视觉领域取得重大突破。以Google MediaPipe为代表的姿态估计算法已能在浏览器端实时提取人体33个关键点，结合国产大语言模型（如DeepSeek）的强大推理能力，使得低成本、普惠化的AI运动教学成为可能。"),

      heading2("1.2 项目意义"),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "降低运动学习门槛：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "使用者只需手机拍照即可获得专业级动作分析，无需昂贵私教，普惠运动爱好者。", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "覆盖两项运动：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "同时支持网球和高尔夫，满足项目负责人（本人）真实的双运动需求，区别于市面单一运动分析工具。", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "AI技术落地教学场景：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "将姿态识别与大模型智能分析结合，探索AI在体育教学中的创新应用。", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "服务真实生活需求：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "解决\"打球动作不标准却无从纠正\"的痛点，具有明确的实用价值。", font: "Microsoft YaHei", size: 21 })] }),

      // ═══ 二、可行性分析 ═══
      heading1("二、可行性分析"),
      heading2("2.1 技术可行性"),
      makeTable(
        ["技术模块", "选型方案", "成熟度"],
        [
          ["姿态关键点检测", "MediaPipe Pose（Google开源）", "成熟，已在生产环境广泛使用"],
          ["智能分析与建议生成", "DeepSeek API（国产大语言模型）", "成熟，推理能力强，国内直连"],
          ["前端框架", "React + TypeScript + Vite", "成熟，生态完善"],
          ["响应式设计", "CSS Media Queries + Tailwind CSS", "成熟"],
          ["部署", "Vercel / 国内云静态托管", "成熟，一键部署"],
        ],
        [2800, 4000, 3760]
      ),
      emptyPara(),
      boldPara("技术风险低：核心依赖均为开源且文档完善的成熟技术，无自研算法门槛。MediaPipe Pose的浏览器端推理可在主流手机浏览器上流畅运行，DeepSeek API国内直连、调用稳定。"),

      heading2("2.2 网络环境与API可达性"),
      boldPara("本项目部署于中国大陆境内，开发者与目标用户均无VPN。基于此约束，技术选型遵循\"全链路国内直连\"原则："),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "前端部署：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "Vercel在国内可通过边缘节点访问；备选方案为阿里云OSS + CDN或腾讯云静态托管", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "AI API：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "选用DeepSeek API（深度求索），服务器位于国内，无需VPN即可调用，响应延迟低", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "姿态检测模型：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "MediaPipe Pose模型文件托管于CDN，加载后浏览器缓存，后续离线可用", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "结论：本方案在当前中国大陆网络环境下完全可行。", font: "Microsoft YaHei", size: 21, bold: true })] }),

      heading2("2.3 经济可行性"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "开发成本：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "使用免费开源工具，无软件授权费用", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "API费用：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "DeepSeek API按token计费（¥2/百万token），单次动作分析约消耗500-800 tokens（约¥0.001-0.002），作业演示期间费用可忽略不计", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "部署成本：", font: "Microsoft YaHei", size: 21, bold: true }), new TextRun({ text: "Vercel免费套餐足够支撑课堂演示", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "总结：零经济负担，完全可承担", font: "Microsoft YaHei", size: 21, bold: true })] }),

      heading2("2.4 操作可行性"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "用户仅需手机浏览器访问网页、允许摄像头权限、拍照上传即可完成全流程", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "界面设计遵循移动端直觉交互，无需学习成本", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "无需安装任何App，扫码即用", font: "Microsoft YaHei", size: 21 })] }),

      heading2("2.5 时间可行性"),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "开发周期：8天（6月11日—6月19日），预留2天缓冲至6月21日截止日期", font: "Microsoft YaHei", size: 21 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "功能范围已做裁剪，聚焦核心流程：拍照 → 姿态检测 → AI分析 → 结果展示", font: "Microsoft YaHei", size: 21 })] }),

      // ═══ 三、项目需求分析 ═══
      heading1("三、项目需求分析"),
      heading2("3.1 功能需求"),
      heading3("核心功能（Must Have）"),
      makeTable(
        ["编号", "功能", "描述"],
        [
          ["F1", "运动类型选择", "用户选择\"网球\"或\"高尔夫\"运动项目"],
          ["F2", "动作类型选择", "网球：正手准备、发球托举、半西方式握拍；高尔夫：站位准备、上杆顶点、推杆姿势"],
          ["F3", "拍照/上传", "调用手机摄像头拍照或从相册选择照片"],
          ["F4", "姿态关键点检测", "浏览器端使用MediaPipe Pose提取人体33个关键点坐标"],
          ["F5", "骨骼线可视化", "在原图上叠加骨骼连接线和关键点标注"],
          ["F6", "关节角度计算", "提取肩、肘、髋、膝等关节角度数据"],
          ["F7", "AI动作分析", "将姿态数据发送至DeepSeek API，生成动作规范性评价"],
          ["F8", "训练建议", "AI给出分步骤的改进训练方案"],
          ["F9", "结果展示页", "展示标注图、角度数据、AI分析报告、训练建议"],
        ],
        [800, 2600, 7160]
      ),
      emptyPara(),
      heading3("扩展功能（Nice to Have）"),
      makeTable(
        ["编号", "功能", "描述"],
        [
          ["F10", "标准动作对比", "并排展示用户动作与标准动作参考图"],
          ["F11", "历史记录", "保存分析历史，追踪动作改善趋势"],
          ["F12", "语音播报", "AI分析结果语音朗读"],
        ],
        [800, 2600, 7160]
      ),

      heading2("3.2 非功能需求"),
      makeTable(
        ["需求", "指标"],
        [
          ["响应时间", "姿态检测 < 2秒，AI分析 < 5秒"],
          ["兼容性", "iOS Safari、Android Chrome 主流版本"],
          ["界面适配", "手机端优先，同时适配平板和桌面端"],
          ["隐私保护", "照片仅在浏览器端处理，不上传至服务器存储"],
          ["可用性", "首屏加载 < 3秒，首次交互引导清晰"],
        ],
        [4000, 6560]
      ),

      heading2("3.3 用户角色"),
      para("本系统面向单类用户（无需区分角色）：网球或高尔夫的初学者及业余爱好者，希望通过AI技术检验和改善运动动作。"),

      // ═══ 四、项目总体设计 ═══
      heading1("四、项目总体设计"),
      heading2("4.1 系统架构"),
      para("系统采用前后端分离架构。前端（React Web应用）负责拍照、姿态检测与结果展示；后端（Node.js轻量API）作为中间层转发请求至DeepSeek API，保护密钥安全。所有服务均在国内网络环境下可访问。"),

      heading2("4.2 核心数据流"),
      para("用户选择运动与动作类型 → 拍照/上传照片 → MediaPipe Pose提取关键点坐标 → 计算关节角度并绘制骨骼线 → 组装Prompt发送至后端API → 后端调用DeepSeek API → 返回动作评价、偏差标注与训练步骤建议 → 前端渲染结果页面。"),

      heading2("4.3 技术选型总览"),
      makeTable(
        ["层级", "技术方案", "说明"],
        [
          ["前端框架", "React 18 + TypeScript", "类型安全，组件化开发"],
          ["构建工具", "Vite", "极速热更新，开箱即用"],
          ["样式方案", "Tailwind CSS", "原子化CSS，快速构建移动端界面"],
          ["姿态检测", "@mediapipe/pose", "Google开源，浏览器端推理"],
          ["后端层", "Node.js + Express", "轻量API层，转发DeepSeek请求"],
          ["AI引擎", "DeepSeek API (深度求索)", "国产大语言模型，国内直连，教练级分析"],
          ["部署", "Vercel / 国内云静态托管", "免费、国内可达、零运维"],
        ],
        [2200, 3600, 4760]
      ),

      // ═══ 五、模块设计 ═══
      heading1("五、模块设计"),
      heading2("5.1 前端模块划分"),
      para("前端采用组件化架构，主要分为6个功能模块和3个页面："),
      makeTable(
        ["模块", "文件", "职责"],
        [
          ["运动类型选择器", "SportSelector.tsx", "网球/高尔夫切换卡片，选中态视觉反馈"],
          ["动作类型选择器", "PoseSelector.tsx", "根据运动展示可选动作网格"],
          ["拍照/上传模块", "CameraCapture.tsx", "摄像头调用 + 相册上传，构图参考线"],
          ["骨骼线叠加模块", "PoseOverlay.tsx", "Canvas绘制33个关键点及骨骼连线"],
          ["AI分析报告模块", "AnalysisReport.tsx", "渲染AI返回的JSON分析报告"],
          ["训练计划模块", "TrainingPlan.tsx", "分步卡片展示训练建议"],
        ],
        [3000, 3500, 4060]
      ),

      heading2("5.2 后端模块划分"),
      para("后端仅一个API端点 /api/analyze，通过Express接收姿态数据 → 构建含运动知识库的Prompt → 调用DeepSeek API（OpenAI兼容格式）→ 返回结构化JSON（摘要、问题列表、训练方案）。"),

      heading2("5.3 关键关节角度计算"),
      para("系统围绕以下关节进行角度计算与标准动作对比："),
      makeTable(
        ["关节", "计算方式", "应用场景"],
        [
          ["肩关节角度", "大臂与躯干夹角", "判断挥拍/挥杆手臂位置"],
          ["肘关节角度", "大臂与小臂夹角", "判断手臂伸展是否充分"],
          ["髋关节角度", "躯干与大腿夹角", "判断站位前倾角度"],
          ["膝关节角度", "大腿与小腿夹角", "判断下盘稳定性"],
          ["躯干前倾角", "躯干与垂直线的夹角", "判断整体身体姿态"],
        ],
        [2500, 3000, 5060]
      ),

      // ═══ 六、风险预估 ═══
      heading1("六、风险预估"),
      makeTable(
        ["编号", "风险描述", "影响等级", "应对策略"],
        [
          ["R1", "MediaPipe在低端手机浏览器性能不足", "中", "使用lite模型；超时>5s时提示使用更清晰照片；备选降级为服务端处理"],
          ["R2", "用户照片不满足检测要求（光线暗、身体不全）", "中", "拍照前显示构图参考线框；失败时给出明确提示并引导重新拍摄"],
          ["R3", "DeepSeek API请求超时或限流", "低", "国内直连延迟低（<2s）；设置10秒超时；失败提供重试按钮"],
          ["R4", "网络环境差，首屏加载慢", "低", "Vite代码分割；MediaPipe模型CDN加载；按需加载模型"],
          ["R5", "API Key泄漏", "高", "Key仅存后端环境变量；前端不直接调用DeepSeek API；环境变量加密存储"],
          ["R6", "开发时间不足（10天）", "高", "严格控制MVP范围；每日git commit；第8天功能冻结，后续只修bug"],
          ["R7", "不同设备摄像头兼容性", "低", "使用标准getUserMedia API；提供相册选择备用方案"],
          ["R8", "标准角度参考值不精确", "中", "参考运动生物力学文献；Prompt注明因人而异；AI考虑个体差异"],
        ],
        [600, 4400, 1000, 4560]
      ),

      // ═══ 附录 ═══
      heading1("附录：项目信息"),
      makeTable(
        ["项目", "内容"],
        [
          ["项目名称", "双运动AI姿态教练（Sports AI Coach）"],
          ["项目描述", "AI视觉识别网球、高尔夫动作偏差，实时纠错并推送专项练习方案，助力技术提升"],
          ["技术栈", "React + TypeScript + Vite + MediaPipe Pose + DeepSeek API"],
          ["网络约束", "中国大陆网络环境，所有服务均需国内直连，不使用VPN"],
          ["开发周期", "2026年6月11日 — 6月21日（10天）"],
          ["目标平台", "移动端Web应用（响应式，支持手机/平板/桌面）"],
          ["开发者", "Francis618-LUO"],
        ],
        [2500, 8060]
      ),
      emptyPara(),
      para("文档版本：v1.1    日期：2026年6月11日", { alignment: AlignmentType.CENTER, run: { color: "999999" } }),
    ]
  }]
});

// ── Generate ─────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:/Users/31922/Desktop/需求分析文档.docx", buffer);
  console.log("✅ 需求分析文档.docx 已生成到桌面");
});
