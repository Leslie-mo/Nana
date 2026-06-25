# Pet Digital Twin / Nana

为 Gemini AI Hackathon 打造的 2 分钟 Demo 原型。Nana 不是普通的宠物管理档案，而是一个会从日常行为、影像和共同经历中持续成长、形成记忆并以宠物视角对话的数字生命。

## 运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。界面移动端优先；在桌面浏览器中会居中显示为最大宽度 430px 的手机 App。

生产构建：

```bash
npm run build
npm start
```

## 页面

- **Home**：数字生命主卡、今日行为总结、情绪状态与 AI 健康发现
- **Memory**：Google Photos 风格的重要记忆时间线
- **Ask Nana**：基于生活档案和历史行为证据回答，而非通用聊天
- **Personality**：五维人格雷达图、属性进度与持续成长的人格类型
- **Life Replay**：年度精彩回顾、AI 总结与模拟生成状态
- **AI Avatar Create**：上传照片或调用浏览器摄像头拍照，预览后模拟生成会浮动、呼吸和眨眼的 Nana 数字分身

右上角支持中文、英文、日文切换。当前数据全部来自 `src/data/mockData.ts`，所有界面文案集中在 `src/i18n/messages.ts`。

## 项目结构

```text
src/
  app/             Next.js App Router 与全局样式
  components/      App Shell、导航与五个页面
  data/            演示用 mock data
  i18n/            中/英/日文案字典
  lib/gemini.ts    Gemini 服务 mock 边界
  types/           TypeScript 类型
public/images/     Nana 演示图片素材
```

## Gemini 接入计划

`src/lib/gemini.ts` 已预留以下服务函数：

- `analyzePetImage`
- `summarizePetDay`
- `generatePetPersonality`
- `chatWithPetMemory`
- `generateLifeReplay`

后续可用 Gemini 多模态能力理解照片与视频，通过 Vertex AI 托管模型，将结构化事件、行为向量和摘要写入 Firebase。聊天时检索宠物档案与时间线作为上下文，年度回忆则由 Gemini 汇总记忆并生成叙事脚本。

数字形象流程计划使用 Gemini Vision 分析宠物特征、Imagen 生成一致的角色形象、Veo 或动画模型生成短循环动画，并将原图和结果保存至 Firebase Storage。浏览器摄像头需要在 `localhost` 或 HTTPS 安全环境中运行。

## 图片素材

Nana 场景图由内置图像生成工具制作，最终项目素材位于 `public/images/nana-moments.png`。
