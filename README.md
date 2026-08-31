# freekreditrm10.com

Static site for **freekreditrm10.com**. No framework, no build step at deploy time:
every page is plain HTML in a clean-URL folder (`slug/index.html`). Cloudflare Pages
serves the repo root as-is.

## Layout

| Path | What it is |
|------|-----------|
| `index.html` | Homepage. The Jadiking88 mobile doorway page (adapted from `jadiking88-mobile-v2.html`). Bottom nav: Home / Promo / Register / **Blog** / Contact. |
| `blog/` | Blog hub. Lists every article, grouped by topic. This is what the bottom-nav **Blog** button opens. |
| `free-kredit-rm10-malaysia-guide/` | The long pillar guide (was the recovered site homepage; canonical moved off `/` so it does not compete with the doorway). |
| `<slug>/` | 38 recovered articles at their original recovered URL paths, including nested `game/`, `game-category/`, `bonus/`, `winningtips/`, `tag/`. |
| `game/`, `game-category/`, `bonus/`, `winningtips/` | Section landing pages so those hub links never 404. |
| `sitemap.xml`, `robots.txt`, `404.html`, `_headers` | Standard static-site plumbing. |
| `brand/` | `logo.png` (copied from `brand-src/` at build time) + generated `cover.svg`. Recovered `wp-content` images were stripped. |

## Internal linking

- In-body links in every article are rewritten to root-relative (`/slug/`) so they work
  on any host and in local preview.
- Every article gets an injected **Related guides** block (deduped, up to 6 links,
  always including the pillar guide) before its editorial footer, plus a shared bottom
  nav (Home / Guide / Blog / Register).
- The Blog hub links to all 45 pages; section pages link their children; the homepage
  footer has a Guides block linking into the cluster.
- `node build.mjs` runs a link check at the end — it currently reports **0 broken**
  internal links across ~980 links.

## Rebuilding

The pages are generated from `_source/*.txt` (the recovered article HTML) by:

```
node build.mjs
```

`build.mjs` cleans each source file (strips broken `wp-content` images and social
image meta, fixes the pillar-guide canonical), rewrites links, injects the nav +
related block, and hand-authors `index.html` and `blog/index.html` in the shared
dark/gold theme. Re-run it after editing anything in `_source/` or `build.mjs`.

## Deploy (Cloudflare Pages, Direct Upload)

Live at **https://freekreditrm10-site.pages.dev** (Pages project `freekreditrm10-site`,
account `Admin@jadiking88.org`). It is **not** Git-connected — the dashboard Git flow
needs an Administrator role this account lacks — so `git push` does not deploy.

To publish after a content change:

```
node deploy.mjs
```

That runs `build.mjs`, stages the site without the build tooling, and
`wrangler pages deploy`s it. Still push to GitHub too so the source stays current.

Custom domain `freekreditrm10.com` is added in the dashboard: Workers & Pages →
freekreditrm10-site → Custom domains.
