# Restore Music Player And Hide Publishing Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore Firefly music player access and remove the public AI novel Markdown publishing guide from the website.

**Architecture:** This is a configuration and content hygiene change. Existing Firefly music components remain the single implementation; `musicConfig.ts` controls the navbar entry and `sidebarConfig.ts` controls sidebar/mobile widgets. The public guide is removed from `src/content/posts` so it cannot be routed, indexed, or listed, and empty taxonomy pages keep building by generating valid icons from Astro `<Icon name="...">` usage.

**Tech Stack:** Astro, TypeScript config files, Node test runner, pnpm, Playwright.

---

## File Map

- Modify: `tests/site-content.test.mjs`
  - Owns regression assertions for site identity, hidden template routes, visible content, and restored music configuration.
- Modify: `src/config/musicConfig.ts`
  - Enables the navbar music player entry through `showInNavbar: true`.
- Modify: `src/config/sidebarConfig.ts`
  - Restores enabled `music` entries for desktop sidebar and mobile bottom widgets.
- Modify: `scripts/generate-icons.js`
  - Scans Astro files and extracts `astro-icon` `<Icon name="...">` icon names without treating ordinary meta `name` attributes as icons.
- Modify: `src/pages/tags/index.astro`
  - Uses a valid Material Symbols empty-state icon for the no-tags state.
- Modify: `src/constants/icons.ts`
  - Regenerated output from `scripts/generate-icons.js`, including taxonomy empty-state icons.
- Delete: `src/content/posts/novel-publishing-guide.md`
  - Removes the local workflow article from the public content tree.
- Create: `docs/superpowers/specs/2026-06-15-music-restore-private-publishing-design.md`
  - Captures requirements and design decisions.
- Create: `docs/superpowers/plans/2026-06-15-music-restore-private-publishing.md`
  - Captures implementation tasks and verification.

## Task 1: Update Regression Tests First

**Files:**
- Modify: `tests/site-content.test.mjs`

- [ ] **Step 1: Replace the music assertions in `template-only pages and widgets are hidden`**

Change the test body so music is no longer treated as hidden, while calendar and siteInfo remain hidden:

```js
test("template-only pages and widgets are hidden", () => {
	const siteConfig = read("src/config/siteConfig.ts");
	for (const page of [
		"friends",
		"sponsor",
		"guestbook",
		"bangumi",
		"gallery",
	]) {
		assert.match(siteConfig, new RegExp(`${page}:\\s*false`));
	}

	const musicConfig = read("src/config/musicConfig.ts");
	assert.match(musicConfig, /showInNavbar:\s*true/);

	const sidebarConfig = read("src/config/sidebarConfig.ts");
	assert.match(sidebarConfig, /type:\s*"music"[\s\S]*enable:\s*true/);
	assert.doesNotMatch(
		sidebarConfig,
		/type:\s*"calendar"[\s\S]*enable:\s*true/,
	);
	assert.doesNotMatch(
		sidebarConfig,
		/type:\s*"siteInfo"[\s\S]*enable:\s*true/,
	);
});
```

- [ ] **Step 2: Replace the visible content test**

Use this test to prove the guide must not exist as public content and no non-draft article publishes its title:

```js
test("public content hides local publishing guide", () => {
	const guidePath = path.join(root, "src/content/posts/novel-publishing-guide.md");
	assert.equal(existsSync(guidePath), false, "local publishing guide must not be a public post");

	const visiblePosts = walk("src/content/posts")
		.filter((file) => /\.(md|mdx)$/.test(file))
		.filter((file) => !/draft:\s*true/.test(read(file)));

	for (const file of visiblePosts) {
		assert.doesNotMatch(read(file), /AI 小说 Markdown 发布指南/, file);
	}

	const about = read("src/content/spec/about.md");
	assert.match(about, /lzcjyx/);
	assert.match(about, /AI 小说工厂/);
});
```

- [ ] **Step 3: Run the focused test and confirm it fails**

Run:

```powershell
node --test tests/site-content.test.mjs
```

Expected before implementation:

- FAIL because `showInNavbar` is still `false`.
- FAIL because no enabled `music` component exists in `sidebarConfig.ts`.
- FAIL because `src/content/posts/novel-publishing-guide.md` still exists.

## Task 2: Restore Music Configuration

**Files:**
- Modify: `src/config/musicConfig.ts`
- Modify: `src/config/sidebarConfig.ts`

- [ ] **Step 1: Enable navbar music entry**

In `src/config/musicConfig.ts`, change:

```ts
showInNavbar: false,
```

to:

```ts
showInNavbar: true,
```

- [ ] **Step 2: Add desktop sidebar music widget**

In `src/config/sidebarConfig.ts`, insert this object in `leftComponents` after the `announcement` component and before taxonomy widgets:

```ts
{
	type: "music",
	enable: true,
	position: "top",
	showOnPostPage: true,
},
```

- [ ] **Step 3: Add mobile bottom music widget**

In `src/config/sidebarConfig.ts`, insert this object in `mobileBottomComponents` after the `announcement` component and before taxonomy widgets:

```ts
{
	type: "music",
	enable: true,
	showOnPostPage: true,
},
```

## Task 3: Remove Public Publishing Guide

**Files:**
- Delete: `src/content/posts/novel-publishing-guide.md`

- [ ] **Step 1: Delete the public guide file**

Remove `src/content/posts/novel-publishing-guide.md` from the content tree.

- [ ] **Step 2: Confirm the file is gone**

Run:

```powershell
Test-Path src\content\posts\novel-publishing-guide.md
```

Expected:

```text
False
```

## Task 4: Keep Empty Taxonomy Pages Buildable

**Files:**
- Modify: `tests/site-content.test.mjs`
- Modify: `scripts/generate-icons.js`
- Modify: `src/pages/tags/index.astro`
- Modify: `src/constants/icons.ts`

- [ ] **Step 1: Add regression assertions for Astro icon generation**

Extend `tests/site-content.test.mjs` so it proves the generator scans `.astro`, recognizes `<Icon name="...">`, and the tags page no longer uses invalid `material-symbols:tag-off`.

- [ ] **Step 2: Verify the new assertions fail before the fix**

Run:

```powershell
node --test tests/site-content.test.mjs
```

Expected before implementation:

- FAIL while `src/pages/tags/index.astro` still uses `material-symbols:tag-off`.
- FAIL while `scripts/generate-icons.js` does not specifically scan `<Icon name="...">`.

- [ ] **Step 3: Update the icon generator and empty-state icon**

Change `scripts/generate-icons.js` so source extensions include `.astro` and `extractIconNames()` matches:

```js
/<Icon\b[\s\S]*?\bname=["']([a-z0-9-]+:[a-z0-9-]+)["']/gi
```

Change `src/pages/tags/index.astro` to use:

```astro
name="material-symbols:label-off-outline-rounded"
```

- [ ] **Step 4: Regenerate icons**

Run:

```powershell
node scripts/generate-icons.js
```

Expected:

- All discovered icons load successfully.
- `src/constants/icons.ts` includes empty taxonomy icons.

## Task 5: Green Automated Verification

**Files:**
- Test: `tests/site-content.test.mjs`

- [ ] **Step 1: Run focused regression test**

Run:

```powershell
node --test tests/site-content.test.mjs
```

Expected:

```text
# pass 7
# fail 0
```

- [ ] **Step 2: Run Astro checks**

Run:

```powershell
pnpm check
```

Expected:

```text
Result (... files):
- 0 errors
- 0 warnings
- 0 hints
```

- [ ] **Step 3: Build production site**

Run:

```powershell
pnpm build
```

Expected:

- Astro build exits with code 0.
- Existing non-blocking warnings about chunk size, Pagefind Chinese stemming, or Astro markdown deprecations may still appear.
- No route is generated for `novel-publishing-guide`.

## Task 6: Playwright Browser Verification

**Files:**
- No source edits expected unless verification finds a bug.

- [ ] **Step 1: Start production preview**

Run a hidden preview server on an unused localhost port, for example:

```powershell
Start-Process -WindowStyle Hidden -FilePath 'pnpm.cmd' -ArgumentList @('exec','astro','preview','--host','localhost','--port','4322') -WorkingDirectory 'D:\Learning\Code\Git\website\Firefly' -RedirectStandardOutput '.\astro-preview.out.log' -RedirectStandardError '.\astro-preview.err.log' -PassThru
```

Expected:

- Preview server starts on `http://localhost:4322/`.

- [ ] **Step 2: Verify desktop behavior with Playwright**

Use Playwright to navigate to:

```text
http://localhost:4322/
```

Expected:

- Page loads without console errors.
- A navbar button with accessible name `音乐` exists.
- Clicking the music button opens `#music-nav-panel`.
- At least one `.music-player-widget` is visible.
- Page text does not include `AI 小说 Markdown 发布指南`.
- Search for `Markdown` does not show the removed guide title.
- The direct old route `/posts/novel-publishing-guide/` returns 404.
- RSS does not contain the removed guide title or local paths.

- [ ] **Step 3: Verify mobile behavior with Playwright**

Resize to a mobile viewport such as `390x844`.

Expected:

- Page does not have horizontal overflow.
- Music-related controls remain reachable without layout overlap.
- The removed guide title is not visible.

- [ ] **Step 4: Stop preview server**

Identify the server process for the preview port and stop it after verification.

## Task 7: Commit, Push, And Live Smoke Test

**Files:**
- Commit all changed files from this plan.

- [ ] **Step 1: Review diff**

Run:

```powershell
git diff --stat
git diff --check
```

Expected:

- Only planned files changed.
- `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Commit**

Run:

```powershell
git add docs/superpowers/specs/2026-06-15-music-restore-private-publishing-design.md docs/superpowers/plans/2026-06-15-music-restore-private-publishing.md tests/site-content.test.mjs scripts/generate-icons.js src/config/musicConfig.ts src/config/sidebarConfig.ts src/constants/icons.ts src/pages/tags/index.astro src/content/posts/novel-publishing-guide.md
git commit -m "fix: restore music and hide publishing guide"
```

Expected:

- Commit succeeds.

- [ ] **Step 3: Push**

Run:

```powershell
git push origin master
```

Expected:

- Push succeeds and Cloudflare can deploy the updated site.

- [ ] **Step 4: Live smoke test**

Use Playwright to open:

```text
https://lzcjyx.xyz/?deploy-check=<commit-sha>
```

Expected:

- Site loads.
- Music entry is present.
- `AI 小说 Markdown 发布指南` is not present on the public page.
