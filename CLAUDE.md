# CLAUDE.md

Personal site for www.joaquinrossi.net, styled after Windows XP's explorer.exe. Inspired by, not a simulation: no windows, title bars or canvas.

## Architecture

- **Page title** is the current path as a drive path (`J:\blog\hello-world.md`, `src/path.ts`), set in `__root.tsx`. Routes don't set titles.
- **Explorer frame** (`src/components/Frame.tsx`): `J:\` breadcrumb with an Up button, blue task pane on the left ("Menu" toggle on mobile). Only routes under the pathless layout `src/routes/_explorer.tsx` get it; the root 404 renders it with `routeSidebars={false}`.
- **Per-route sidebar groups**: `staticData: { sidebar: Component }` (typed in `src/router.tsx`), rendered below the fixed groups. `DetailsGroup` is XP's "Details" pane.
- **Blog**: each `src/content/blog/*.md` is a post. The file name with `.md` is the title and the URL (`/blog/hello-world.md`). Frontmatter only has `date` (required, `YYYY-MM-DD`) and `updated` (optional; "Date Modified" falls back to `date`). `plugins/markdown.ts` renders posts at build time (marked + Shiki), so neither ships to the browser.
- **Apps** (`src/apps/<name>/`): mini programs that live inside the frame, shown as icons on the home page. As with posts, the name with its extension is the URL (`/patoshi.exe`, route `src/routes/_explorer/patoshi[.]exe.tsx`).
- **patoshi.exe**: checks that the Patoshi wallets (`src/apps/patoshi/patoshi_pubkeys_COMPLETE.csv`, P2PK pubkeys) have not lost balance. A Nitro plugin (`plugin.ts`, registered in `vite.config.ts`) runs the check at startup and every hour, in-process: 74 requests to mempool.space's `POST /api/scripthashes/txs/summary` (300 scripthashes each, `sha256` of the script, not reversed). The result only lives in memory (`globalThis`, see `state.ts`, because the plugin and the SSR code end up in different bundles), and the page reads it through a server function. "Untouched" means no outflows after the last known one (block 498,031, `LAST_KNOWN_OUTFLOW`): some of these coins were spent between 2009 and 2017.
- **Sitemap** (`src/routes/sitemap[.]xml.ts`): posts are listed automatically, but new pages have to be added to its `pages` list by hand.
- **CSS** (`src/styles.css`): every rule is scoped under `.explorer` so unframed routes stay unstyled.

## Development

- No tests or linter. Format with `pnpm dlx prettier@3 --tab-width 4 --write <files>` (4-space indentation, Prettier is not a dependency).

## Icons

`vendor/windows-xp-icons/` is a third-party XP icon pack (Git LFS, excluded from the Docker image, not AGPL). Only downscaled copies of icons in use go in `public/icons/`, at 2x their display size. When adding one, generate it with ImageMagick and add its row and command to `vendor/windows-xp-icons/README.md`.

## Conventions

- UI text in English; code comments and commit messages in Spanish.
- No em dashes anywhere in the repo.
- External links always open in a new tab via `src/components/ExternalLink.tsx`. `mailto:` and the site's own files don't count as external.
- Binary images and PDFs go through Git LFS.

## Deploy

Push to `master` → `.github/workflows/deploy.yaml`
