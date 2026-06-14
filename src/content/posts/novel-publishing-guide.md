---
title: "AI 小说 Markdown 发布指南"
published: 2026-06-15
description: "把 AI 小说工厂产出的 Markdown 放进这个站点时，建议使用的目录、Frontmatter 与发布流程。"
image: ""
tags: ["AI小说工厂", "Markdown", "发布指南"]
category: "小说"
draft: false
pinned: true
---

这里是 `lzcjyx.xyz` 的小说发布入口。AI 小说工厂产出的 Markdown 可以直接放进 `src/content/posts/`，随仓库推送后由 Cloudflare 自动构建并发布。

## 推荐目录

```text
src/content/posts/
└── novels/
    └── series-slug/
        ├── cover.webp
        └── chapter-001.md
```

## Frontmatter

```yaml
---
title: 第一章：醒来的萤火
published: 2026-06-15
description: 本章摘要，用于首页卡片、搜索和 RSS。
image: ./cover.webp
tags: [AI小说工厂, 长篇小说, 系列名]
category: 小说
draft: false
---
```

`draft: true` 的文章不会出现在本地预览或线上站点。准备发布时，把它改成 `false`，提交并推送到 GitHub。

## 发布流程

1. 把 Markdown 和配图放到 `src/content/posts/novels/<series-slug>/`。
2. 确认 `title`、`published`、`description`、`tags` 和 `category` 已填写。
3. 本地运行 `pnpm build`。
4. 推送到远端仓库 `https://github.com/lzcjyx/Firefly.git`。
