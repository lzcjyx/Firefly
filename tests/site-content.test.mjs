import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
	assert.match(musicConfig, /showInNavbar:\s*false/);

	const sidebarConfig = read("src/config/sidebarConfig.ts");
	assert.doesNotMatch(sidebarConfig, /type:\s*"music"[\s\S]*enable:\s*true/);
	assert.doesNotMatch(
		sidebarConfig,
		/type:\s*"calendar"[\s\S]*enable:\s*true/,
	);
	assert.doesNotMatch(
		sidebarConfig,
		/type:\s*"siteInfo"[\s\S]*enable:\s*true/,
	);
});

test("disabled template routes are removed from source routes", () => {
	for (const route of [
		"src/pages/friends.astro",
		"src/pages/sponsor.astro",
		"src/pages/guestbook.astro",
		"src/pages/bangumi.astro",
		"src/pages/gallery/index.astro",
		"src/pages/gallery/[album].astro",
	]) {
		assert.equal(existsSync(path.join(root, route)), false, route);
	}
});

test("navigation is focused on fiction publishing", () => {
	const nav = read("src/config/navBarConfig.ts");
	for (const label of [
		"友链",
		"赞助",
		"番组计划",
		"Gitee",
		"QQ交流群",
		"Firefly文档",
	]) {
		assert.doesNotMatch(nav, new RegExp(label));
	}
	for (const label of ["小说", "归档", "分类", "标签", "关于", "GitHub", "RSS"]) {
		assert.match(nav, new RegExp(label));
	}
});

test("draft filtering is consistent in dev and production", () => {
	const contentUtils = read("src/utils/content-utils.ts");
	assert.match(contentUtils, /data\.draft !== true/);
	assert.doesNotMatch(
		contentUtils,
		/import\.meta\.env\.PROD\s*\?\s*data\.draft !== true\s*:\s*true/,
	);
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
