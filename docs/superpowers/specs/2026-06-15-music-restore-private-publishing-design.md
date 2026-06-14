# Restore Music Player And Hide Publishing Guide Design

## Context

The site is a customized Firefly Astro blog deployed by pushing to `https://github.com/lzcjyx/Firefly.git`, with the public domain `lzcjyx.xyz`. The previous novel-publishing adaptation disabled the Firefly music player and published an article titled `AI 小说 Markdown 发布指南` that includes local publishing workflow details. The latest requirement is to restore the music player and keep local setup details off the public website.

References checked:

- Firefly music guide: `https://docs-firefly.cuteleaf.cn/zh/guide/music.html`
- Firefly template repository: `https://github.com/CuteLeaf/Firefly.git`
- Current local implementation: `src/config/musicConfig.ts`, `src/config/sidebarConfig.ts`, `src/components/features/MusicManager.astro`, `src/components/features/MusicPlayer.astro`, `src/components/widget/Music.astro`

## Requirements

- Restore Firefly's music player functionality without redesigning or replacing the existing player UI.
- Follow the Firefly guide behavior:
  - `musicConfig.ts` controls the navbar music entry with `showInNavbar`.
  - `sidebarConfig.ts` controls the sidebar music widget with a `music` component entry.
  - The player can use either `meting` or `local` mode.
- Keep the UI consistent with the current Firefly site by reusing existing components and styles.
- Remove the public `AI 小说 Markdown 发布指南` article from the website.
- Ensure local machine paths, setup instructions, and publishing workflow details from that guide do not appear in public routes, search index, or RSS.
- Verify with automated tests, `pnpm check`, `pnpm build`, and Playwright against a local production preview. Playwright must work in the current environment where Edge is available and Chrome is not.
- Push the verified change to the remote repository so Cloudflare deployment can update the live site.

## Design

### Music Player

Use the existing Firefly player implementation. The current repository still has the singleton `MusicManager`, reusable `MusicPlayer` UI, and `Music` sidebar widget. The regression is configuration-only:

- Set `musicPlayerConfig.showInNavbar` to `true` so the navbar music button and floating player panel render.
- Restore an enabled `music` widget in `sidebarLayoutConfig.leftComponents`.
- Restore an enabled `music` item in `sidebarLayoutConfig.mobileBottomComponents` so mobile visitors can reach the player from the bottom widget list.

The visual style remains unchanged because no new player markup, colors, or layout rules are introduced. The player continues to inherit Firefly card styling, icons, theme color, and dark-mode behavior.

### Music Source

Keep the existing `mode: "meting"` configuration because it matches the Firefly guide default and current project configuration. The existing local playlist remains available in the config for future switching, but this task does not change the user's playlist choice.

### Publishing Guide Privacy

Delete `src/content/posts/novel-publishing-guide.md` from the public content tree. This prevents Astro from creating an article route for it and prevents Pagefind/RSS from indexing it. Drafting the file would hide it from routes in the current site, but deletion is cleaner for a public website because it removes the local workflow article from the active content source.

No replacement public article is added in this task. The novel archive can be empty until real AI novel Markdown files are published.

### Tests

Update `tests/site-content.test.mjs` to assert the desired behavior:

- The music navbar entry is enabled.
- `sidebarConfig.ts` includes an enabled `music` widget.
- The publishing guide file does not exist in `src/content/posts`.
- No visible Markdown post contains the `AI 小说 Markdown 发布指南` title.
- Existing template-only page and navigation assertions remain intact.
- Empty taxonomy pages still build after the public guide is removed:
  - The icon generator scans `.astro` files as well as component/script files.
  - The generator recognizes `<Icon name="...">` usage from `astro-icon`.
  - Empty-state icons use valid names from the installed Iconify packages.

### Browser Verification

After building, run a local production preview and verify with Playwright:

- Home page loads without console errors.
- The navbar music button is visible.
- Clicking the navbar music button opens the player panel.
- The sidebar music player is visible on desktop.
- The title `AI 小说 Markdown 发布指南` is absent from the home page and search results.
- The old guide route returns 404, and RSS does not contain the guide title or local paths.
- Mobile viewport has no obvious horizontal overflow or incoherent overlap.

## Out Of Scope

- Changing the music playlist, adding new songs, or converting the player to local-only mode.
- Reintroducing unrelated template pages such as friends, sponsor, guestbook, bangumi, or gallery.
- Publishing new novel content.
- Adding private local machine setup documentation to the website.
