# Novel Publishing Site Design

## Context

This repository is an Astro 6 + Svelte Firefly site deployed from `https://github.com/lzcjyx/Firefly.git` to `https://lzcjyx.xyz` through Cloudflare. The upstream Firefly documentation at `https://docs-firefly.cuteleaf.cn/zh` confirms the project model: site behavior is configured in `src/config/*`, posts live in `src/content/posts/`, and Cloudflare deployment builds `dist/` with `pnpm build`.

The site currently still exposes template/demo material: Firefly demo posts, CuteLeaf community links, Gitee/QQ links, sponsor/Bangumi/friends/gallery pages, sample announcements, and optional music widgets. Those are noise for a personal novel publishing site.

## Goal

Turn the site into a focused personal fiction archive where Markdown files produced by the AI novel factory can be dropped into `src/content/posts/` and published by pushing to GitHub.

## Approaches Considered

### Recommended: Use Firefly Posts as Novel Entries

Keep the existing `posts` content collection and treat each novel chapter or novel announcement as a normal Markdown post. Use categories and tags for series, arcs, genres, and production source. This preserves Firefly routing, archive, RSS, search, Pagefind, related posts, table of contents, and Cloudflare deployment without new infrastructure.

Trade-off: novels and non-fiction notes share the same collection. That is acceptable because the immediate need is publishing Markdown novels, not building a full library database.

### Alternative: Create a Separate Novel Collection

Add a `novels` content collection and new `/novels` routes. This would allow custom metadata such as series, volume, chapter number, and status.

Trade-off: it duplicates list/archive/search behavior that Firefly already provides and creates more code to verify before publishing real content.

### Alternative: Keep the Theme Mostly As-Is

Only update the site URL and add a publishing guide.

Trade-off: it leaves visible template content and unrelated pages, so the site would still feel like a copied demo rather than a personal fiction archive.

## Product Shape

The first screen should still feel like Firefly: banner wallpaper, translucent navigation, rounded cards, and the calm green theme. The content voice changes from theme demo to personal fiction archive:

- Site title: `lzcjyx`
- Domain: `https://lzcjyx.xyz`
- Homepage hero: brand-first wording around fiction archive / AI novel output
- Homepage list: published posts only, led by a pinned Markdown publishing guide
- Navigation: home, novels/archive, categories, tags, about, RSS, GitHub
- Hidden pages: friends, sponsor, guestbook, Bangumi, gallery
- Sidebar: profile, announcement, categories, tags, site stats, and post TOC
- Removed from visible UI: QQ/Gitee/Firefly-docs community links, sponsor prompts, Bangumi entry, gallery entry, music player, calendar, build-info widget

## Content Model

AI novel factory output should be saved as Markdown under `src/content/posts/`, preferably grouped by series:

```text
src/content/posts/
└── novels/
    └── series-slug/
        ├── cover.webp
        └── chapter-001.md
```

Each published novel Markdown file must include Firefly frontmatter:

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

Drafts are excluded from local development and production lists so hidden demo content cannot reappear during browser verification.

## UI Direction

Use a restrained editorial archive style rather than a marketing page. Keep Firefly's existing rounded cards, soft shadows, translucent navbar, banner image, wave/gradient transition, and green theme. Avoid adding new decorative blobs, oversized cards, or a separate landing page. The site should open directly to the usable post list.

Specific visual adjustments:

- Keep the Firefly card and banner system.
- Use Chinese interface copy for the site identity and announcement.
- Make list cards the default for scan-friendly chapter browsing.
- Keep tags and categories visible because they are the main way to browse series and genres.
- Keep the right-side table of contents on article pages for long chapters.

## Deployment

Deployment remains push-based:

- Repository remote: `https://github.com/lzcjyx/Firefly.git`
- Site URL in config: `https://lzcjyx.xyz`
- Build command: `pnpm build`
- Cloudflare output: `dist/`
- Cloudflare config should use a project name tied to `lzcjyx-firefly`

## Verification Requirements

Automated checks:

- Node test confirms site URL, title, disabled pages, navigation links, music visibility, and publishing docs.
- Build succeeds with `pnpm build`.
- Type checking succeeds with `pnpm astro check` or the closest available local command if `astro check` reports pre-existing framework warnings.

Browser checks with Playwright using installed Microsoft Edge:

- Desktop homepage at local dev server renders the `lzcjyx` brand and novel archive copy.
- Desktop homepage does not expose Firefly demo/community links in visible navigation.
- Desktop post page renders a Markdown article, metadata, content, and sidebar TOC without console errors.
- Mobile homepage and post page do not overlap text, cards, navbar, or controls.
- Search route loads without a blank screen.

## Non-Goals

- No new CMS.
- No database.
- No separate novel route system.
- No AI novel factory integration code in this repository.
- No custom Cloudflare workflow changes beyond config alignment.
