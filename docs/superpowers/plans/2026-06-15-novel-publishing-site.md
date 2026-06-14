# Novel Publishing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Firefly demo site into a focused `lzcjyx.xyz` Markdown novel publishing site.

**Architecture:** Keep the existing Firefly `posts` collection, routing, archive, search, RSS, and article page. Change configuration and visible content so Markdown novel files become the publishing unit, while unrelated template pages and widgets disappear from the UI.

**Tech Stack:** Astro 6, Svelte 5, Firefly config modules, Markdown content collections, Node built-in test runner, pnpm, Cloudflare static deployment.

---

## File Structure

- Create: `tests/site-content.test.mjs`  
  Node tests that read source files and assert the site/content contract.
- Modify: `src/config/siteConfig.ts`  
  Site identity, domain, page toggles, list layout, share/sponsor-related settings.
- Modify: `src/config/navBarConfig.ts`  
  Remove template/community navigation and expose novel-focused links.
- Modify: `src/config/profileConfig.ts`  
  Replace Firefly demo profile with `lzcjyx` profile and repository/RSS links.
- Modify: `src/config/announcementConfig.ts`  
  Replace sample announcement with current publishing notice.
- Modify: `src/config/sidebarConfig.ts`  
  Remove music/calendar/site-info noise and keep useful browsing widgets.
- Modify: `src/config/musicConfig.ts`  
  Hide the navbar music entry.
- Modify: `src/config/backgroundWallpaper.ts`  
  Update homepage banner text to match the novel archive.
- Modify: `src/utils/content-utils.ts`  
  Exclude `draft: true` posts in both development and production lists.
- Create: `src/content/posts/novel-publishing-guide.md`  
  Pinned public article documenting the Markdown contract for AI novel factory output.
- Modify: existing demo posts in `src/content/posts/**`  
  Mark template/demo posts as drafts so they are no longer visible.
- Modify: `src/content/spec/about.md`  
  Replace template about page with concise personal site description.
- Modify: `.gitignore`  
  Ignore Playwright MCP output.
- Verify: `pnpm build`, `node --test tests/site-content.test.mjs`, local dev server, Playwright desktop/mobile checks.

## Task 1: Add Content Contract Tests

**Files:**
- Create: `tests/site-content.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/site-content.test.mjs`:

```js
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

function walk(dir) {
  const abs = path.join(root, dir);
  return readdirSync(abs).flatMap((name) => {
    const rel = path.join(dir, name);
    const full = path.join(root, rel);
    return statSync(full).isDirectory() ? walk(rel) : [rel];
  });
}

test("site identity targets lzcjyx.xyz", () => {
  const siteConfig = read("src/config/siteConfig.ts");
  assert.match(siteConfig, /title:\s*"lzcjyx"/);
  assert.match(siteConfig, /site_url:\s*"https:\/\/lzcjyx\.xyz"/);
  assert.match(siteConfig, /subtitle:\s*"小说档案"/);
});

test("template-only pages and widgets are hidden", () => {
  const siteConfig = read("src/config/siteConfig.ts");
  for (const page of ["friends", "sponsor", "guestbook", "bangumi", "gallery"]) {
    assert.match(siteConfig, new RegExp(`${page}:\\s*false`));
  }

  const musicConfig = read("src/config/musicConfig.ts");
  assert.match(musicConfig, /showInNavbar:\s*false/);

  const sidebarConfig = read("src/config/sidebarConfig.ts");
  assert.doesNotMatch(sidebarConfig, /type:\s*"music"[\s\S]*enable:\s*true/);
  assert.doesNotMatch(sidebarConfig, /type:\s*"calendar"[\s\S]*enable:\s*true/);
  assert.doesNotMatch(sidebarConfig, /type:\s*"siteInfo"[\s\S]*enable:\s*true/);
});

test("navigation is focused on fiction publishing", () => {
  const nav = read("src/config/navBarConfig.ts");
  for (const label of ["友链", "赞助", "番组计划", "Gitee", "QQ交流群", "Firefly文档"]) {
    assert.doesNotMatch(nav, new RegExp(label));
  }
  for (const label of ["小说", "归档", "分类", "标签", "关于", "GitHub", "RSS"]) {
    assert.match(nav, new RegExp(label));
  }
});

test("draft filtering is consistent in dev and production", () => {
  const contentUtils = read("src/utils/content-utils.ts");
  assert.match(contentUtils, /data\.draft !== true/);
  assert.doesNotMatch(contentUtils, /import\.meta\.env\.PROD\s*\?\s*data\.draft !== true\s*:\s*true/);
});

test("visible content is novel-publishing focused", () => {
  const guide = read("src/content/posts/novel-publishing-guide.md");
  assert.match(guide, /title:\s*"AI 小说 Markdown 发布指南"/);
  assert.match(guide, /category:\s*"小说"/);
  assert.match(guide, /draft:\s*false/);

  const about = read("src/content/spec/about.md");
  assert.match(about, /lzcjyx/);
  assert.match(about, /AI 小说工厂/);

  const visibleDemoFiles = walk("src/content/posts")
    .filter((file) => /\.(md|mdx)$/.test(file))
    .filter((file) => file !== path.join("src/content/posts", "novel-publishing-guide.md"))
    .filter((file) => !/draft:\s*true/.test(read(file)));

  assert.deepEqual(visibleDemoFiles, []);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/site-content.test.mjs`  
Expected: FAIL because the test file exists but the current site still uses Firefly demo identity and content.

## Task 2: Implement Site Identity and UI Configuration

**Files:**
- Modify: `src/config/siteConfig.ts`
- Modify: `src/config/navBarConfig.ts`
- Modify: `src/config/profileConfig.ts`
- Modify: `src/config/announcementConfig.ts`
- Modify: `src/config/sidebarConfig.ts`
- Modify: `src/config/musicConfig.ts`
- Modify: `src/config/backgroundWallpaper.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Update site identity**

In `src/config/siteConfig.ts`, set:

```ts
title: "lzcjyx",
subtitle: "小说档案",
site_url: "https://lzcjyx.xyz",
description: "lzcjyx 的个人小说档案，收录 AI 小说工厂产出的 Markdown 长篇、短篇与创作记录。",
keywords: ["lzcjyx", "小说", "AI小说工厂", "Markdown", "个人网站"],
```

Set page switches:

```ts
pages: {
  friends: false,
  sponsor: false,
  guestbook: false,
  bangumi: false,
  gallery: false,
},
```

Keep list mode and show tags:

```ts
postListLayout: {
  defaultMode: "list",
  mobileDefaultMode: "list",
  showTags: true,
  descriptionLines: 3,
  allowSwitch: true,
```

- [ ] **Step 2: Replace navbar links**

In `src/config/navBarConfig.ts`, build links in this order:

```ts
const links: NavBarLink[] = [
  LinkPresets.Home,
  {
    name: "小说",
    url: "#",
    icon: "material-symbols:menu-book-outline-rounded",
    children: [
      LinkPresets.Archive,
      LinkPresets.Categories,
      LinkPresets.Tags,
    ],
  },
  LinkPresets.About,
  LinkPresets.RSS,
  {
    name: "GitHub",
    url: "https://github.com/lzcjyx/Firefly",
    external: true,
    icon: "fa7-brands:github",
  },
];
```

Add `RSS` to `LinkPresets`:

```ts
RSS: {
  name: "RSS",
  url: "/rss/",
  icon: "fa7-solid:rss",
},
```

- [ ] **Step 3: Replace profile and announcement**

In `src/config/profileConfig.ts`, set:

```ts
name: "lzcjyx",
bio: "小说、代码与 AI 创作实验的存档。"
```

Keep only GitHub, Email, and RSS links; GitHub URL must be `https://github.com/lzcjyx/Firefly`.

In `src/config/announcementConfig.ts`, set title `更新` and content `AI 小说工厂产出的 Markdown 作品会在这里持续归档。`, linking to `/archive/?category=%E5%B0%8F%E8%AF%B4`.

- [ ] **Step 4: Simplify sidebar and music**

In `src/config/sidebarConfig.ts`, keep enabled widgets:

Left: profile, announcement, categories, tags.  
Right: stats and sidebarToc.  
Mobile bottom: profile, announcement, categories, tags, stats.

Ensure music, calendar, siteInfo, and advertisements are not enabled.

In `src/config/musicConfig.ts`, set `showInNavbar: false`.

- [ ] **Step 5: Update homepage banner copy**

In `src/config/backgroundWallpaper.ts`, set:

```ts
title: "lzcjyx",
subtitle: [
  "小说档案",
  "Markdown stories from the AI novel factory",
  "把碎片、章节与长篇都留在同一个夜晚",
],
titleSize: "3.6rem",
subtitleSize: "1.25rem",
```

- [ ] **Step 6: Ignore Playwright MCP output**

Append this entry to `.gitignore`:

```gitignore
.playwright-mcp/
```

- [ ] **Step 7: Run contract test**

Run: `node --test tests/site-content.test.mjs`  
Expected: still FAIL because content files are not updated yet.

## Task 3: Implement Novel Publishing Content

**Files:**
- Modify: `src/utils/content-utils.ts`
- Create: `src/content/posts/novel-publishing-guide.md`
- Modify: `src/content/spec/about.md`
- Modify: all existing demo Markdown files under `src/content/posts/**`

- [ ] **Step 1: Hide drafts in all environments**

In `src/utils/content-utils.ts`, replace each collection filter:

```ts
return import.meta.env.PROD ? data.draft !== true : true;
```

with:

```ts
return data.draft !== true;
```

- [ ] **Step 2: Add the publishing guide**

Create `src/content/posts/novel-publishing-guide.md`:

```md
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
```

- [ ] **Step 3: Replace about page**

Set `src/content/spec/about.md` to concise personal copy:

```md
# 关于 lzcjyx

这里是 `lzcjyx.xyz`，一个用于保存小说、代码和 AI 创作实验的个人网站。

本站使用 Astro 与 Firefly 构建。保留 Firefly 清爽的阅读体验，同时把内容重心收束到 Markdown 小说归档。

## 小说发布

AI 小说工厂产出的作品会以 Markdown 文件进入 `src/content/posts/`。章节、短篇、设定说明都可以通过分类和标签归档，推送到 GitHub 后由 Cloudflare 自动更新。

## 链接

- GitHub: [lzcjyx/Firefly](https://github.com/lzcjyx/Firefly)
- RSS: [/rss/](/rss/)
```

- [ ] **Step 4: Mark demo posts as drafts**

For every existing Markdown/MDX file under `src/content/posts/` except `novel-publishing-guide.md`, ensure frontmatter contains:

```yaml
draft: true
```

If a file already has `draft: false`, change it to `draft: true`.

- [ ] **Step 5: Run contract test**

Run: `node --test tests/site-content.test.mjs`  
Expected: PASS.

## Task 4: Build and Browser Verification

**Files:**
- Verify only unless a failure requires code changes.

- [ ] **Step 1: Run production build**

Run: `pnpm build`  
Expected: exit code 0 and `dist/` generated.

- [ ] **Step 2: Start dev server**

Run: `pnpm dev -- --host 127.0.0.1`  
Expected: local URL, usually `http://127.0.0.1:4321/`.

- [ ] **Step 3: Verify desktop homepage in Playwright**

Use Playwright with Microsoft Edge/available Chromium engine. Check:

- Page title contains `lzcjyx`.
- Visible navigation contains `小说`, `归档`, `分类`, `标签`, `关于`, `GitHub`, `RSS`.
- Visible navigation does not contain `友链`, `赞助`, `番组计划`, `Gitee`, `QQ交流群`, `Firefly文档`.
- No console errors.
- Screenshot shows non-overlapping cards and banner text.

- [ ] **Step 4: Verify article page in Playwright**

Open `/posts/novel-publishing-guide/`. Check:

- Article title renders.
- Metadata renders.
- Markdown content renders.
- Sidebar TOC or floating TOC is available for headings.
- Sponsor buttons are absent because sponsor page is disabled.
- No console errors.

- [ ] **Step 5: Verify mobile layout in Playwright**

Resize to `390x844` and check `/` and `/posts/novel-publishing-guide/`:

- Navbar and text do not overlap.
- Post cards fit within the viewport.
- Article content is readable without horizontal overflow.
- No console errors.

- [ ] **Step 6: Final status check**

Run:

```bash
git status --short
git diff --stat
```

Expected: only intentional project files plus ignored `.playwright-mcp/` not shown after `.gitignore` update.
