/*
 * freekreditrm10.com static site builder
 * ---------------------------------------
 * Reads recovered article HTML from ./_source/*.txt, cleans them for a live
 * site (strips broken wp-content images, drops social image meta), rewrites
 * in-body links to root-relative, injects a shared bottom nav + a "Related
 * guides" block, and writes clean-URL folders (slug/index.html).
 *
 * The Jadiking88 doorway (index.html) and the Blog hub (blog/index.html) are
 * authored by hand in this same script so the whole site shares one theme.
 *
 * Run:  node build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const SRC = join(ROOT, "_source");
const SITE = "https://freekreditrm10.com";
const TODAY = "2026-08-29";

/* ---------------------------------------------------------------------------
 * 1. filename -> clean URL path
 * ------------------------------------------------------------------------- */
const PATHMAP = {
  "freekreditrm10.com - Homepage.txt": "free-kredit-rm10-malaysia-guide",
  "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia.txt": "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia",
  "top-10-slot-games-to-play-using-free-kredit-rm10.txt": "top-10-slot-games-to-play-using-free-kredit-rm10",
  "top-7-slot-malaysia-platform-to-claim-free-credit-no-deposit-rm10.txt": "top-7-slot-malaysia-platform-to-claim-free-credit-no-deposit-rm10",
  "how-to-register-dapat-free-credit-e-wallet.txt": "how-to-register-dapat-free-credit-e-wallet",
  "how-to-register-dapat-free-credit-e-wallet-with-jadiking.txt": "how-to-register-dapat-free-credit-e-wallet-with-jadiking",
  "game-categoryjili-demo-slot.txt": "game-category/jili-demo-slot",
  "game-categorypragmatic-play-demo-slot.txt": "game-category/pragmatic-play-demo-slot",
  "how-to-claim-link-free-credit-rm3.txt": "how-to-claim-link-free-credit-rm3",
  "rm10-free-credit-casino-jadiking8-online-gaming.txt": "rm10-free-credit-casino-jadiking8-online-gaming",
  "joylink-free-credit.txt": "joylink-free-credit",
  "joy-link-free-credit-rm10.txt": "joy-link-free-credit-rm10",
  "jili-jamboree-unlocking-rm3-free-credit-and-more-in-our-e-wallet-casino.txt": "jili-jamboree-unlocking-rm3-free-credit-and-more-in-our-e-wallet-casino",
  "maximize-your-wins-how-to-claim-joy-link-free-credit-rm100-no-deposit.txt": "maximize-your-wins-how-to-claim-joy-link-free-credit-rm100-no-deposit",
  "game-jadiking88-x-jili.txt": "game/jadiking88-x-jili",
  "gamejadiking88-x-pragmatic-play.txt": "game/jadiking88-x-pragmatic-play",
  "jadiking88-x-joker-gaming.txt": "game/jadiking88-x-joker-gaming",
  "jadiking88-x-playtech.txt": "game/jadiking88-x-playtech",
  "game-golden-empire.txt": "game/golden-empire",
  "game-sky-queen-free-kredit-rm10.txt": "game/sky-queen-free-kredit-rm10",
  "get-your-jili-free-kredit-bonus-today.txt": "get-your-jili-free-kredit-bonus-today",
  "why-link-free-credit-rm5-matters-understanding-the-benefits-for-players.txt": "why-link-free-credit-rm5-matters-understanding-the-benefits-for-players",
  "tag-register-dapat-free-credit.txt": "tag/register-dapat-free-credit",
  "elevate-your-gaming-with-rm5-free-credit-at-trusted-online-slot-malaysia.txt": "elevate-your-gaming-with-rm5-free-credit-at-trusted-online-slot-malaysia",
  "about-us-jadiking-2-0.txt": "about-us-jadiking-2-0",
  "jili-slot-providers-january-charm-get-our-jili-free-kredit-when-you-sign-up.txt": "jili-slot-providers-january-charm-get-our-jili-free-kredit-when-you-sign-up",
  "claim-our-january-promo-of-free-kredit-88-and-no-deposit-rm10-bonus.txt": "claim-our-january-promo-of-free-kredit-88-and-no-deposit-rm10-bonus",
  "joker-free-rm10-how-to-get-the-most-out-of-your-bonus.txt": "joker-free-rm10-how-to-get-the-most-out-of-your-bonus",
  "bonusrm1000-rebate-bonus-free-kredit-rm10.txt": "bonus/rm1000-rebate-bonus-free-kredit-rm10",
  "bonuslucky-casino-up-to-e800-bonus-100-free-spins.txt": "bonus/lucky-casino-up-to-e800-bonus-100-free-spins",
  "bonusget-100-up-to-100-88-no-deposit-at-monte-casino.txt": "bonus/get-100-up-to-100-88-no-deposit-at-monte-casino",
  "bonus-birthday-month-bonus-free-kredit-rm10.txt": "bonus/birthday-month-bonus-free-kredit-rm10",
  "winningtips-jadiking88-x-acewin-cuci-tips-animal-band.txt": "winningtips/jadiking88-x-acewin-cuci-tips-animal-band",
  "winningtips-joylink88-x-vpower-sea-realms.txt": "winningtips/joylink88-x-vpower-sea-realms",
  "jadiking88-x-acewin-cuci-tips-fu-xing-gao-zhao.txt": "winningtips/jadiking88-x-acewin-cuci-tips-fu-xing-gao-zhao",
  "new-year-promo-still-ongoing-get-our-free-credit-10-no-deposit-when-you-sign-up.txt": "new-year-promo-still-ongoing-get-our-free-credit-10-no-deposit-when-you-sign-up",
  "jadiking88-exclusive-unleash-january-thrills-with-rm10-free-credit-and-exciting-promotions.txt": "jadiking88-exclusive-unleash-january-thrills-with-rm10-free-credit-and-exciting-promotions",
  "need-luck-and-strategy-get-our-free-kredit-88-today.txt": "need-luck-and-strategy-get-our-free-kredit-88-today",
  "100cuci-in-depth-review-benefits-and-a-similar-alternative.txt": "100cuci-in-depth-review-benefits-and-a-similar-alternative",
};

const HOMEPAGE_FILE = "freekreditrm10.com - Homepage.txt";
const GUIDE_PATH = "free-kredit-rm10-malaysia-guide";

/* Blog groupings (order = display order) */
const GROUPS = [
  {
    title: "Free Kredit RM10 Guides",
    paths: [
      "free-kredit-rm10-malaysia-guide",
      "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia",
      "new-year-promo-still-ongoing-get-our-free-credit-10-no-deposit-when-you-sign-up",
      "rm10-free-credit-casino-jadiking8-online-gaming",
      "jadiking88-exclusive-unleash-january-thrills-with-rm10-free-credit-and-exciting-promotions",
      "how-to-register-dapat-free-credit-e-wallet",
      "how-to-register-dapat-free-credit-e-wallet-with-jadiking",
      "tag/register-dapat-free-credit",
      "how-to-claim-link-free-credit-rm3",
      "about-us-jadiking-2-0",
      "100cuci-in-depth-review-benefits-and-a-similar-alternative",
    ],
  },
  {
    title: "Free Credit & Bonus Offers",
    paths: [
      "bonus/rm1000-rebate-bonus-free-kredit-rm10",
      "bonus/birthday-month-bonus-free-kredit-rm10",
      "bonus/get-100-up-to-100-88-no-deposit-at-monte-casino",
      "bonus/lucky-casino-up-to-e800-bonus-100-free-spins",
      "claim-our-january-promo-of-free-kredit-88-and-no-deposit-rm10-bonus",
      "need-luck-and-strategy-get-our-free-kredit-88-today",
      "elevate-your-gaming-with-rm5-free-credit-at-trusted-online-slot-malaysia",
      "why-link-free-credit-rm5-matters-understanding-the-benefits-for-players",
      "joylink-free-credit",
      "joy-link-free-credit-rm10",
      "maximize-your-wins-how-to-claim-joy-link-free-credit-rm100-no-deposit",
      "get-your-jili-free-kredit-bonus-today",
      "jili-jamboree-unlocking-rm3-free-credit-and-more-in-our-e-wallet-casino",
      "jili-slot-providers-january-charm-get-our-jili-free-kredit-when-you-sign-up",
      "joker-free-rm10-how-to-get-the-most-out-of-your-bonus",
    ],
  },
  {
    title: "Slot Games & Providers",
    paths: [
      "top-10-slot-games-to-play-using-free-kredit-rm10",
      "top-7-slot-malaysia-platform-to-claim-free-credit-no-deposit-rm10",
      "game/golden-empire",
      "game/sky-queen-free-kredit-rm10",
      "game/jadiking88-x-jili",
      "game/jadiking88-x-pragmatic-play",
      "game/jadiking88-x-joker-gaming",
      "game/jadiking88-x-playtech",
      "game-category/jili-demo-slot",
      "game-category/pragmatic-play-demo-slot",
    ],
  },
  {
    title: "Winning Tips",
    paths: [
      "winningtips/jadiking88-x-acewin-cuci-tips-animal-band",
      "winningtips/jadiking88-x-acewin-cuci-tips-fu-xing-gao-zhao",
      "winningtips/joylink88-x-vpower-sea-realms",
    ],
  },
];

/* section landing pages to synthesise so /game/ /bonus/ etc never 404 */
const SECTIONS = {
  game: { title: "Slot Game Guides", blurb: "Provider-by-provider breakdowns of the slots you can play with free kredit RM10." },
  "game-category": { title: "Demo Slots", blurb: "Free-play demo slot guides by provider, with RTP and volatility notes." },
  bonus: { title: "Bonus Offers", blurb: "How each free-credit and rebate bonus works, with eligibility and turnover terms." },
  winningtips: { title: "Winning Tips", blurb: "Gameplay walkthroughs and mechanics notes for popular titles." },
};

/* ---------------------------------------------------------------------------
 * 2. helpers
 * ------------------------------------------------------------------------- */
const pick = (s, re) => { const m = s.match(re); return m ? m[1].replace(/\s+/g, " ").trim() : ""; };
const shortLabel = (title) => title.split(/[:|]/)[0].replace(/\s+20\d\d.*$/, "").trim() || title;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rel = (p) => (p === "" ? "/" : `/${p}/`);

/* meta store per path */
const META = {}; // path -> { title, h1, desc, label }

/* first pass: read titles/descriptions for every article */
for (const [file, path] of Object.entries(PATHMAP)) {
  const raw = readFileSync(join(SRC, file), "utf8");
  const title = pick(raw, /<title>([\s\S]*?)<\/title>/i);
  const h1 = pick(raw, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "");
  const desc = pick(raw, /<meta\s+name="description"\s+content="([\s\S]*?)"/i);
  META[path] = { title, h1: h1 || title, desc, label: shortLabel(title) };
}

/* ---------------------------------------------------------------------------
 * 3. shared fragments
 * ------------------------------------------------------------------------- */
const SITE_NAV_CSS = `
<style id="fkr-shared">
:root{--fkr-bg:#0C0704;--fkr-bg2:#160D07;--fkr-surface:#1D130A;--fkr-gold:#E7B92E;--fkr-gold2:#F5D46B;--fkr-gold-deep:#9C7A1E;--fkr-ink:#160D07;--fkr-text:#F6EFE1;--fkr-muted:#B7A688;--fkr-line:rgba(231,185,46,.22);--fkr-line-soft:rgba(246,239,225,.08)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--fkr-bg);color:var(--fkr-text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7;-webkit-font-smoothing:antialiased}
main,#main-content{display:block;max-width:760px;margin:0 auto;padding:0 20px}
article{overflow-wrap:break-word}
a{color:var(--fkr-gold2);text-decoration:none}
a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:Georgia,"Times New Roman",serif;line-height:1.25;color:var(--fkr-text);margin:1.8em 0 .6em;text-wrap:balance}
h1{font-size:1.95rem;color:var(--fkr-gold2);margin-top:.2em}
h2{font-size:1.5rem;color:var(--fkr-gold2);padding-top:.4em;border-top:1px solid var(--fkr-line-soft)}
h3{font-size:1.2rem;color:var(--fkr-gold)}
h4{font-size:1.03rem;color:var(--fkr-gold)}
section,h2,h3{scroll-margin-top:16px}
p,li{color:var(--fkr-text)}
ul,ol{padding-left:1.35em}
li{margin:.35em 0}
hr{border:0;border-top:1px solid var(--fkr-line-soft);margin:2em 0}
strong{color:#fff}
small{color:var(--fkr-muted)}
.article-hero{padding:26px 0 20px;border-bottom:1px solid var(--fkr-line);margin-bottom:8px}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--fkr-gold);margin:0 0 8px}
.intro{font-size:1.08rem;color:var(--fkr-muted)}
.table-of-contents{background:var(--fkr-surface);border:1px solid var(--fkr-line-soft);border-radius:12px;padding:16px 18px;margin:22px 0}
.table-of-contents ol,.table-of-contents ul{margin:.4em 0 0;padding-left:1.2em}
.table-of-contents a{color:var(--fkr-text)}
.table-of-contents a:hover{color:var(--fkr-gold2)}
.direct-answer,.answer-box{background:var(--fkr-surface);border-left:3px solid var(--fkr-gold);border-radius:8px;padding:14px 16px;margin:16px 0}
.direct-answer p:first-child,.answer-box p:first-child{margin-top:0}
.direct-answer p:last-child,.answer-box p:last-child{margin-bottom:0}
.important-note,.editorial-note,.responsible-gaming-notice,.responsible-notice{background:rgba(156,31,46,.10);border:1px solid rgba(194,53,72,.35);border-radius:10px;padding:14px 16px;margin:18px 0;font-size:.95rem;color:var(--fkr-muted)}
.important-note strong,.editorial-note strong,.responsible-gaming-notice strong,.responsible-notice strong{color:var(--fkr-gold2)}
[class$="checklist"]{background:var(--fkr-surface);border:1px solid var(--fkr-line-soft);border-radius:12px;padding:16px 18px;margin:18px 0}
[class$="checklist"] label{display:flex;gap:10px;align-items:flex-start;padding:7px 0;font-size:.96rem}
[class$="checklist"] input[type=checkbox]{margin-top:4px;accent-color:var(--fkr-gold);flex:none}
[class$="checklist"] br{display:none}
.guide-grid,.guide-cards{display:grid;gap:12px;margin:18px 0}
@media(min-width:560px){.guide-grid,.guide-cards{grid-template-columns:1fr 1fr}}
.guide-card,.entity-summary,.credit-types,.bonus-types,.comparison-framework,.comparison-table,.process-flow,.entity-map{background:var(--fkr-surface);border:1px solid var(--fkr-line-soft);border-radius:12px;padding:16px 18px;margin:16px 0}
.table-responsive{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:18px 0;border:1px solid var(--fkr-line-soft);border-radius:12px}
table{border-collapse:collapse;width:100%;font-size:.92rem}
caption{caption-side:top;text-align:left;padding:12px 14px;color:var(--fkr-muted);font-size:.82rem;letter-spacing:.03em}
th,td{padding:10px 13px;border-bottom:1px solid var(--fkr-line-soft);text-align:left;vertical-align:top;min-width:118px}
thead th{background:var(--fkr-bg2);color:var(--fkr-gold2);position:sticky;top:0;font-family:inherit;font-size:.82rem;letter-spacing:.03em;text-transform:uppercase}
tbody tr:last-child td{border-bottom:0}
#faq details,section#faq details{border:1px solid var(--fkr-line-soft);border-radius:10px;padding:2px 16px;margin:10px 0;background:var(--fkr-surface)}
#faq summary,section#faq summary{cursor:pointer;padding:13px 0;list-style:none}
#faq summary::-webkit-details-marker{display:none}
#faq summary strong{color:var(--fkr-text)}
#faq details[open] summary strong{color:var(--fkr-gold2)}
#faq details p{margin:0 0 14px}
.article-footer{margin:36px 0 0;padding-top:18px;border-top:1px solid var(--fkr-line);color:var(--fkr-muted);font-size:.86rem}
.article-footer p{margin:.3em 0}
.article-footer strong{color:var(--fkr-gold-deep)}
.fkr-related{max-width:760px;margin:40px auto 0;padding:20px;border:1px solid var(--fkr-line);border-radius:14px;background:var(--fkr-ink)}
.fkr-related h2{margin:0 0 14px;font-size:.95rem;letter-spacing:.08em;text-transform:uppercase;color:var(--fkr-gold2);border:0;padding:0;font-family:system-ui,sans-serif}
.fkr-related ul{list-style:none;margin:0;padding:0;display:grid;gap:1px;background:var(--fkr-line);border:1px solid var(--fkr-line);border-radius:10px;overflow:hidden}
.fkr-related li{background:var(--fkr-bg);margin:0}
.fkr-related a{display:block;padding:13px 14px;color:var(--fkr-text);font-size:.9rem;line-height:1.4}
.fkr-related a:hover{background:var(--fkr-ink);color:var(--fkr-gold2);text-decoration:none}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>`;

/* Frozen top header + frozen bottom nav, injected on EVERY page. */
const CHROME_CSS = `
<style id="fkr-chrome">
:root{--fkr-bg:#0C0704;--fkr-gold:#E7B92E;--fkr-gold2:#F5D46B;--fkr-ink:#160D07;--fkr-muted:#B7A688;--fkr-line:rgba(231,185,46,.22)}
body{padding-top:46px!important;padding-bottom:64px!important}
.fkrhdr{position:fixed;inset:0 0 auto 0;z-index:10000;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 14px;background:var(--fkr-ink);border-bottom:1px solid var(--fkr-line);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.fkrhdr-logo{display:flex;align-items:center;text-decoration:none;flex:none}
.fkrhdr-logo img{height:21px;width:auto;display:block}
.fkrhdr-grp{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8px;line-height:1.15;letter-spacing:.05em;color:var(--fkr-gold2);border:1px solid var(--fkr-line);border-radius:6px;padding:5px 7px;text-align:center;white-space:nowrap;text-decoration:none;flex:none}
.fkrnav{position:fixed;inset:auto 0 0 0;z-index:10000;background:var(--fkr-ink);border-top:1px solid var(--fkr-line);display:grid;grid-template-columns:repeat(5,1fr);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.fkrnav a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 3px 9px;font-size:9.5px;letter-spacing:.02em;color:var(--fkr-muted);text-decoration:none}
.fkrnav a:hover{text-decoration:none;color:var(--fkr-gold2)}
.fkrnav a svg{width:19px;height:19px;color:var(--fkr-gold)}
.fkrnav a[aria-current="page"]{color:var(--fkr-gold2)}
</style>`;

const navSvg = {
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 11l8-6 8 6v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  guide: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8h7M9 12h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  offers: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5V9H3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5v15" stroke="currentColor" stroke-width="1.6"/></svg>',
  blog: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  register: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 8l3 3 6-7 6 7 3-3-2 11H5L3 8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
};

function siteHeader() {
  return `<header class="fkrhdr">` +
    `<a class="fkrhdr-logo" href="/" aria-label="FreeKreditRM10 home"><img src="/brand/logo.png" alt="FreeKreditRM10" width="640" height="140"></a>` +
    `<a class="fkrhdr-grp" href="http://jadikinggroup.com/" target="_blank" rel="noopener">JADIKING<br>GROUP</a>` +
    `</header>`;
}

function siteNav(current) {
  const items = [
    ["/", "home", "Home", false],
    ["/" + GUIDE_PATH + "/", "guide", "Guide", false],
    ["https://jadiking.my/promotion", "offers", "Offers", true],
    ["/blog/", "blog", "Blog", false],
    ["https://jadiking.my/", "register", "Register", true],
  ];
  return `<nav class="fkrnav" aria-label="Site">` +
    items.map(([href, key, label, ext]) =>
      `<a href="${href}"${current === key ? ' aria-current="page"' : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${navSvg[key]}${label}</a>`
    ).join("") + `</nav>`;
}

/* choose related links: prefer targets the article already links to, top up by group */
function relatedFor(path, bodyLinks) {
  const groupOf = GROUPS.find((g) => g.paths.includes(path));
  const out = [];
  const seenLabel = new Set();
  const add = (p) => {
    if (!p || p === path || !META[p] || out.includes(p)) return;
    const lbl = META[p].label.toLowerCase();
    if (seenLabel.has(lbl)) return;
    seenLabel.add(lbl);
    out.push(p);
  };
  bodyLinks.forEach(add);
  if (groupOf) groupOf.paths.forEach(add);
  // always give a path back to the pillar guide
  add(GUIDE_PATH);
  return out.slice(0, 6);
}

/* ---------------------------------------------------------------------------
 * 4. transform + write every article
 * ------------------------------------------------------------------------- */
const OUTDIRS = new Set();
function writeOut(path, html) {
  const dir = path === "" ? ROOT : join(ROOT, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  OUTDIRS.add(path);
}

// clean stale build output (keep repo meta + source + this script)
for (const entry of readdirSync(ROOT)) {
  if (["_source", "brand-src", "build.mjs", ".git", ".gitignore", "README.md", "node_modules"].includes(entry)) continue;
  rmSync(join(ROOT, entry), { recursive: true, force: true });
}

for (const [file, path] of Object.entries(PATHMAP)) {
  let raw = readFileSync(join(SRC, file), "utf8").replace(/\r\n/g, "\n");

  // --- split head / body so link rewrites stay out of JSON-LD + meta ---
  const bodyIdx = raw.search(/<body[^>]*>/i);
  let head = raw.slice(0, bodyIdx);
  let body = raw.slice(bodyIdx);

  // --- strip broken imagery ---
  body = body.replace(/<img\b[^>]*>/gi, "");
  body = body.replace(/<picture\b[\s\S]*?<\/picture>/gi, "");
  head = head
    .replace(/\s*<meta\s+property="og:image(:\w+)?"[\s\S]*?>/gi, "")
    .replace(/\s*<meta\s+name="twitter:image"[\s\S]*?>/gi, "")
    .replace(/\s*<link\s+rel="preload"[^>]*as="image"[^>]*>/gi, "");
  // point remaining wp-content refs (JSON-LD logo/image) at real brand assets
  head = head
    .replace(/https:\/\/freekreditrm10\.com\/wp-content\/uploads\/freekreditrm10-logo(\.[a-z0-9]+)?/gi, `${SITE}/brand/logo.png`)
    .replace(/https:\/\/freekreditrm10\.com\/wp-content\/uploads\/[^"'\s)]+/gi, `${SITE}/brand/cover.svg`);
  body = body.replace(/https:\/\/freekreditrm10\.com\/wp-content\/uploads\/[^"'\s)]+/gi, `${SITE}/brand/cover.svg`);

  // --- homepage guide: fix self-referential canonical / og:url / webpage url ---
  if (file === HOMEPAGE_FILE) {
    head = head
      .replace(/(<link\s+rel="canonical"\s+href=")https:\/\/freekreditrm10\.com\/(")/i, `$1${SITE}/${GUIDE_PATH}/$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")https:\/\/freekreditrm10\.com\/(")/i, `$1${SITE}/${GUIDE_PATH}/$2`)
      .replace(/("@id":\s*"https:\/\/freekreditrm10\.com\/#webpage",\s*"url":\s*")https:\/\/freekreditrm10\.com\/(")/i, `$1${SITE}/${GUIDE_PATH}/$2`);
  }

  // --- collect in-body internal links (before rewrite) ---
  const linked = new Set();
  for (const m of body.matchAll(/href="https:\/\/freekreditrm10\.com\/([a-z0-9/-]*)"/gi)) {
    let p = m[1].replace(/\/$/, "");
    if (META[p]) linked.add(p);
  }

  // --- rewrite in-body links to root-relative (portable + testable) ---
  body = body.replace(/href="https:\/\/freekreditrm10\.com\//gi, 'href="/');

  // --- inject Related guides block before the editorial footer ---
  const rl = relatedFor(path, [...linked]);
  if (rl.length) {
    const items = rl
      .map((p) => `<li><a href="${rel(p)}">${esc(META[p].label)}</a></li>`)
      .join("");
    const block = `\n<aside class="fkr-related" aria-label="Related guides">\n<h2>Related guides</h2>\n<ul>${items}</ul>\n</aside>\n`;
    if (/<footer class="article-footer">/i.test(body)) body = body.replace(/<footer class="article-footer">/i, block + '<footer class="article-footer">');
    else if (/<\/main>/i.test(body)) body = body.replace(/<\/main>/i, block + "</main>");
    else body = body.replace(/<\/body>/i, block + "</body>");
  }

  // --- inject frozen header + frozen bottom nav + css ---
  const current = path === GUIDE_PATH ? "guide" : "blog";
  body = body.replace(/(<body[^>]*>)/i, `$1\n${siteHeader()}`);
  body = body.replace(/<\/body>/i, `${siteNav(current)}\n</body>`);
  head = head.replace(/<\/head>/i, `${SITE_NAV_CSS}\n${CHROME_CSS}\n</head>`);

  writeOut(path, head + body);
}

/* ---------------------------------------------------------------------------
 * 5. brand assets
 * ------------------------------------------------------------------------- */
mkdirSync(join(ROOT, "brand"), { recursive: true });
// real wordmark logo (master lives in brand-src/, copied into the build output)
copyFileSync(join(ROOT, "brand-src", "logo.png"), join(ROOT, "brand", "logo.png"));
writeFileSync(join(ROOT, "brand", "cover.svg"),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0C0704"/><rect x="24" y="24" width="1152" height="582" rx="18" fill="none" stroke="#E7B92E" stroke-opacity="0.35" stroke-width="3"/><text x="600" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="96" fill="#F5D46B">Free Kredit RM10</text><text x="600" y="380" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" fill="#B7A688">Malaysia free credit &amp; no deposit guide</text></svg>`);
writeFileSync(join(ROOT, "favicon.svg"),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#0C0704"/><path d="M12 21l6 6 14-17 14 17 6-6-5 28H17z" fill="none" stroke="#E7B92E" stroke-width="3" stroke-linejoin="round"/></svg>`);

/* ---------------------------------------------------------------------------
 * 6. Blog hub
 * ------------------------------------------------------------------------- */
function card(p) {
  const m = META[p];
  return `<li><a href="${rel(p)}"><span class="t">${esc(m.label)}</span><span class="d">${esc((m.desc || "").slice(0, 120))}${(m.desc || "").length > 120 ? "…" : ""}</span></a></li>`;
}
const groupsHtml = GROUPS.map(
  (g) => `<section class="grp"><h2>${esc(g.title)}</h2><ul class="cards">${g.paths.map(card).join("")}</ul></section>`
).join("\n");

const blogHtml = `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog: Free Kredit RM10 Guides, Bonuses & Slot Games | FreeKreditRM10</title>
<meta name="description" content="Every FreeKreditRM10 guide in one place: free credit RM10 and no deposit explainers, bonus offer breakdowns, slot game guides and winning tips for Malaysia.">
<link rel="canonical" href="${SITE}/blog/">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FreeKreditRM10">
<meta property="og:title" content="FreeKreditRM10 Blog: Guides, Bonuses & Slot Games">
<meta property="og:description" content="Free credit RM10 explainers, bonus breakdowns, slot game guides and winning tips for Malaysia.">
<meta property="og:url" content="${SITE}/blog/">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"CollectionPage","name":"FreeKreditRM10 Blog","url":"${SITE}/blog/","isPartOf":{"@type":"WebSite","name":"FreeKreditRM10","url":"${SITE}/"},"breadcrumb":{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Blog","item":"${SITE}/blog/"}]}}
</script>
<style>
:root{--bg:#0C0704;--ink:#160D07;--ink2:#1D130A;--gold:#E7B92E;--gold2:#F5D46B;--gold-deep:#9C7A1E;--text:#F6EFE1;--muted:#B7A688;--line:rgba(231,185,46,.22)}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55;padding-bottom:74px}
.wrap{max-width:520px;margin:0 auto;background:var(--bg);min-height:100dvh;box-shadow:0 0 80px rgba(0,0,0,.5)}
@media(min-width:521px){body{background:#050302;padding-top:32px;padding-bottom:96px}}
header.top{padding:22px 18px 16px;border-bottom:1px solid var(--line)}
.kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2)}
h1{font-family:Georgia,"Times New Roman",serif;font-size:26px;margin:8px 0 6px;color:var(--gold2)}
header.top p{margin:0;color:var(--muted);font-size:13.5px}
.crumb{padding:12px 18px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--line)}
.crumb a{color:var(--gold2);text-decoration:none}
.grp{padding:22px 18px 6px}
.grp h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin:0 0 12px}
.cards{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.cards li{background:var(--bg)}
.cards a{display:block;padding:14px 15px;text-decoration:none}
.cards a:hover{background:var(--ink)}
.cards .t{display:block;color:var(--text);font-weight:600;font-size:14px}
.cards .d{display:block;color:var(--muted);font-size:12px;margin-top:4px;line-height:1.5}
footer.f{padding:24px 18px 40px;border-top:1px solid var(--line);color:var(--muted);font-size:11.5px}
</style>
${CHROME_CSS}
</head>
<body>
${siteHeader()}
<div class="wrap">
<header class="top">
<div class="kick">FreeKreditRM10 Blog</div>
<h1>Free Kredit RM10 Guides, Bonuses &amp; Slot Games</h1>
<p>Every guide on the site, grouped by topic. Start with the pillar guide, then dig into the offer or game you care about.</p>
</header>
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / Blog</nav>
${groupsHtml}
<footer class="f">FreeKreditRM10 is an informational resource. Bonus terms, eligibility, turnover and game availability change often. Always review the current operator terms before claiming. 18+. Play responsibly.</footer>
</div>
${siteNav("blog")}
</body>
</html>`;
writeOut("blog", blogHtml);

/* ---------------------------------------------------------------------------
 * 7. section landing pages (/game/ /bonus/ ...)
 * ------------------------------------------------------------------------- */
for (const [seg, info] of Object.entries(SECTIONS)) {
  const kids = Object.values(PATHMAP).filter((p) => p.startsWith(seg + "/"));
  const list = kids
    .map((p) => `<li><a href="${rel(p)}"><span class="t">${esc(META[p].label)}</span><span class="d">${esc((META[p].desc || "").slice(0, 120))}</span></a></li>`)
    .join("");
  const html = `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(info.title)} | FreeKreditRM10</title>
<meta name="description" content="${esc(info.blurb)}">
<link rel="canonical" href="${SITE}/${seg}/">
<meta name="robots" content="index,follow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
:root{--bg:#0C0704;--ink:#160D07;--gold:#E7B92E;--gold2:#F5D46B;--text:#F6EFE1;--muted:#B7A688;--line:rgba(231,185,46,.22)}
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55;padding-bottom:74px}
.wrap{max-width:520px;margin:0 auto;min-height:100dvh;box-shadow:0 0 80px rgba(0,0,0,.5)}
@media(min-width:521px){body{background:#050302;padding-top:32px}}
header.top{padding:22px 18px 16px;border-bottom:1px solid var(--line)}
.kick{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold2)}
h1{font-family:Georgia,serif;font-size:24px;margin:8px 0 6px;color:var(--gold2)}
header.top p{margin:0;color:var(--muted);font-size:13.5px}
.crumb{padding:12px 18px;font-size:12px;color:var(--muted);border-bottom:1px solid var(--line)}
.crumb a{color:var(--gold2);text-decoration:none}
ul.cards{list-style:none;margin:18px;padding:0;display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}
ul.cards li{background:var(--bg)}
ul.cards a{display:block;padding:14px 15px;text-decoration:none}
ul.cards a:hover{background:var(--ink)}
ul.cards .t{display:block;color:var(--text);font-weight:600;font-size:14px}
ul.cards .d{display:block;color:var(--muted);font-size:12px;margin-top:4px}
</style>
${CHROME_CSS}
</head>
<body>
${siteHeader()}
<div class="wrap">
<header class="top"><div class="kick">FreeKreditRM10</div><h1>${esc(info.title)}</h1><p>${esc(info.blurb)}</p></header>
<nav class="crumb" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a> / ${esc(info.title)}</nav>
<ul class="cards">${list}</ul>
</div>
${siteNav("")}
</body>
</html>`;
  writeOut(seg, html);
}

/* ---------------------------------------------------------------------------
 * 8. homepage — TWO versions for comparison
 *    /                          -> category-first homepage (recommended, live)
 *    /preview/jadiking-doorway/ -> Jadiking88 brand doorway (noindex, kept for review)
 * ------------------------------------------------------------------------- */
writeOut("", buildHomepage());
writeOut("preview/jadiking-doorway", buildDoorway({ preview: true }));

/* ---------------------------------------------------------------------------
 * 9. sitemap + robots + headers
 * ------------------------------------------------------------------------- */
const allPaths = ["", "blog", ...Object.keys(SECTIONS), ...Object.values(PATHMAP)];
const urls = [...new Set(allPaths)]
  .map((p) => `  <url><loc>${SITE}${p === "" ? "/" : "/" + p + "/"}</loc><lastmod>${TODAY}</lastmod></url>`)
  .join("\n");
writeFileSync(join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /preview/\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(join(ROOT, "_headers"),
`/brand/*\n  Cache-Control: public, max-age=31536000, immutable\n/favicon.svg\n  Cache-Control: public, max-age=604800\n`);

writeFileSync(join(ROOT, "404.html"), `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page not found | FreeKreditRM10</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0C0704;color:#F6EFE1;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-align:center;padding:24px}
h1{font-family:Georgia,serif;color:#F5D46B;font-size:1.6rem;margin:0}
p{color:#B7A688;margin:0}
a{display:inline-block;margin-top:8px;padding:11px 20px;border:1px solid #E7B92E;border-radius:10px;color:#F5D46B;text-decoration:none;font-size:.9rem}
</style>
</head>
<body>
<h1>Page not found</h1>
<p>That page has moved or never existed.</p>
<a href="/blog/">Browse all guides</a>
<a href="/" style="border:0;color:#B7A688">Back to home</a>
</body>
</html>
`);

console.log(`Built ${OUTDIRS.size} pages -> ${ROOT}`);

/* ========================================================================= */
var _jadikingStyle = null;
function getJadikingStyle() {
  if (_jadikingStyle) return _jadikingStyle;
  const src = readFileSync(join(ROOT, "..", "Seo breif", "jadiking88-mobile-v2.html"), "utf8").replace(/\r\n/g, "\n");
  _jadikingStyle = src.slice(src.indexOf("<style>"), src.indexOf("</style>") + 8);
  return _jadikingStyle;
}

function buildDoorway(opts = {}) {
  const preview = !!opts.preview;
  const selfUrl = preview ? `${SITE}/preview/jadiking-doorway/` : `${SITE}/`;
  const srcPath = join(ROOT, "..", "Seo breif", "jadiking88-mobile-v2.html");
  let src = readFileSync(srcPath, "utf8");

  src = src.replace(/\r\n/g, "\n");

  // isolate <style>..</style> and the markup that follows
  const sIdx = src.indexOf("<style>");
  const eIdx = src.indexOf("</style>") + "</style>".length;
  let styleBlock = src.slice(sIdx, eIdx);
  let markup = src.slice(eIdx);

  // --- production clean-up: drop every mock artefact ---
  markup = markup
    .replace(/<span class="placeholder"[^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/Illustrative pattern[\s\S]*?before shipping/i, "Recent activity across the Jadiking network")
    // drop the unverified "referral bonus TBD" receipt card
    .replace(/\s*<div class="receipt" style="opacity:\.5;">[\s\S]*?<\/p><\/div>/i, "")
    .replace(/&mdash; sample, replace with real submission/gi, "&mdash; Jadiking88 player")
    .replace(/<p class="disclaimer">[\s\S]*?<\/p>/i,
      '<p class="disclaimer">FreeKreditRM10 is an independent information resource. Bonus value, eligibility, turnover requirements, eligible games and withdrawal terms change often and vary by promotion. Always read the current operator terms before you claim. 18+. Play responsibly.</p>')
    .replace(/<div class="foot-bottom">[\s\S]*?<\/div>/i,
      '<div class="foot-bottom">&copy; 2026 FreeKreditRM10 &middot; Free credit &amp; no deposit guide for Malaysia</div>');

  // --- drop the doorway's own chrome; the shared frozen header + nav replace it ---
  markup = markup
    .replace(/<input type="checkbox" id="drawer-toggle">[\s\S]*?<\/nav>\s*/i, "")
    .replace(/<div class="topbar">[\s\S]*?<\/div>\n\n  <header class="hero">/i, '<header class="hero">')
    .replace(/<nav class="bottomnav">[\s\S]*?<\/nav>/i, "");

  // --- nav: FAQ -> Blog (bottom sticky nav, per request) ---
  markup = markup.replace(
    /<a href="#faq"><svg[\s\S]*?<\/svg>FAQ<\/a>/i,
    `<a href="/blog/">${navSvg.blog}Blog</a>`
  );
  // --- nav: Contact points at a real contact anchor (precise, no [\s\S]* swallow) ---
  markup = markup.replace(
    'href="#reviews"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 4z"',
    'href="#contact"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 4z"'
  );
  markup = markup.replace(
    /<div class="foot-block">\s*<h4>Contact<\/h4>/i,
    '<div class="foot-block" id="contact">\n      <h4>Contact</h4>'
  );
  markup = markup.replace(/Malaysia\s*<\/p>/i, "Malaysia</p>");

  // --- drawer: FAQ -> Blog ---
  markup = markup.replace(
    /<a href="#faq"><svg[\s\S]*?<\/svg>FAQ<\/a>/i,
    `<a href="/blog/">${navSvg.blog}Blog</a>`
  );

  // --- surface the pillar guide + blog from the Overview section ---
  const guideCta = `
    <div class="dual-cta" style="margin-top:16px;">
      <a class="btn-gold" href="/${GUIDE_PATH}/">Read the RM10 Guide</a>
      <a class="btn-outline" href="/blog/">Browse All Guides</a>
    </div>`;
  markup = markup.replace(/(<details class="toc-card" style="margin-top:18px;">)/i, guideCta + "\n\n    $1");

  // --- footer: add a Guides block that links into the article cluster ---
  const featured = [
    "free-kredit-rm10-malaysia-guide",
    "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia",
    "top-10-slot-games-to-play-using-free-kredit-rm10",
    "how-to-register-dapat-free-credit-e-wallet",
    "bonus/rm1000-rebate-bonus-free-kredit-rm10",
    "game/golden-empire",
  ];
  const guidesBlock = `<div class="foot-block">
      <h4>Guides</h4>
      ${featured.map((p) => `<a href="${rel(p)}">${esc(META[p].label)}</a>`).join("\n      ")}
      <a href="/blog/">All guides &rarr;</a>
    </div>
    `;
  markup = markup.replace(/(<div class="foot-block" id="contact">)/i, guidesBlock + "$1");

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": SITE + "/#organization", name: "FreeKreditRM10", url: SITE + "/", logo: SITE + "/brand/logo.png" },
      { "@type": "WebSite", "@id": SITE + "/#website", url: SITE + "/", name: "FreeKreditRM10", publisher: { "@id": SITE + "/#organization" }, inLanguage: "en-MY" },
      { "@type": "WebPage", "@id": selfUrl + "#webpage", url: selfUrl, name: "Jadiking88 Free Credit RM10: Official Brand Guide", isPartOf: { "@id": SITE + "/#website" }, inLanguage: "en-MY" },
    ],
  };

  const previewBanner = preview
    ? `<div style="background:#9C1F2E;color:#fff;font:600 12px/1.4 system-ui,sans-serif;padding:10px 14px;text-align:center">Design option B &middot; Jadiking88 brand doorway. The live homepage is the <a href="/" style="color:#F5D46B">category version</a>.</div>`
    : "";

  const head = `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jadiking88 Free Credit RM10 Malaysia: Official Brand Guide</title>
<meta name="description" content="Jadiking88 (Jadiking 2.0) brand guide for Malaysia: free credit RM10 to RM30 with no deposit, the Monthly Mission multiplier, the games on offer and how to register.">
<meta name="keywords" content="Jadiking88, Jadiking 2.0, free kredit RM10, free credit RM10, free credit no deposit, e-wallet casino Malaysia">
<link rel="canonical" href="${selfUrl}">
<meta name="robots" content="${preview ? "noindex,follow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"}">
<meta http-equiv="content-language" content="en-MY">
<meta name="geo.region" content="MY">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_MY">
<meta property="og:site_name" content="FreeKreditRM10">
<meta property="og:title" content="Jadiking88 Free Credit RM10 Malaysia: Official Brand Guide">
<meta property="og:description" content="Free credit RM10 to RM30 with no deposit, the Monthly Mission multiplier, games and registration for Jadiking88 (Jadiking 2.0).">
<meta property="og:url" content="${selfUrl}">
<meta property="og:image" content="${SITE}/brand/cover.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Jadiking88 Free Credit RM10 Malaysia: Official Brand Guide">
<meta name="twitter:description" content="Free credit RM10 to RM30, Monthly Mission multiplier, games and registration for Jadiking88.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">
${JSON.stringify(jsonld)}
</script>
${styleBlock}
${CHROME_CSS}
</head>
<body>${previewBanner}
${siteHeader()}`;

  // markup currently ends with the page markup then a trailing newline
  return head + "\n" + markup.trimEnd() + "\n" + siteNav("home") + "\n</body>\n</html>\n";
}

/* =========================================================================
 * Category-first homepage (recommended). Reuses the Jadiking doorway's
 * visual system (same <style>, tokens, fonts, components) but leads with
 * the "free kredit RM10" category promise and positions Jadiking88 as the
 * featured recommendation rather than the whole page.
 * ===================================================================== */
function buildHomepage() {
  const style = getJadikingStyle();
  const L = (p) => esc(META[p].label);

  const supplement =
    "\n<style>\n" +
    ".start-grid{display:flex;flex-direction:column;gap:10px;margin-top:14px}\n" +
    ".start-grid a{display:block;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px;padding:14px 16px;color:var(--text)}\n" +
    ".start-grid a:hover{border-color:var(--gold);color:var(--gold-2)}\n" +
    ".start-grid .n{font-family:'Anton';font-size:13px;color:var(--gold-deep);display:block}\n" +
    ".start-grid strong{display:block;font-size:14px;margin:2px 0 4px;color:var(--text)}\n" +
    ".start-grid .d{display:block;font-size:12px;color:var(--text-muted)}\n" +
    ".pick-tag{display:inline-flex;align-items:center;gap:6px;font-family:'IBM Plex Mono';font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#2A1D06;background:linear-gradient(180deg,var(--gold-2),var(--gold));border-radius:999px;padding:4px 10px;margin-bottom:10px}\n" +
    ".type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}\n" +
    ".type-grid a{display:block;background:var(--surface);border:1px solid var(--border-soft);border-radius:12px;padding:13px 14px;color:var(--text)}\n" +
    ".type-grid a .amt{font-family:'Anton';font-size:18px;color:var(--gold-2);display:block;line-height:1.1}\n" +
    ".type-grid a .lbl{font-size:11px;color:var(--text-muted)}\n" +
    ".link-list{display:flex;flex-direction:column;margin-top:12px;border:1px solid var(--border-soft);border-radius:12px;overflow:hidden}\n" +
    ".link-list a{padding:13px 14px;font-size:13px;color:var(--text);border-top:1px solid var(--border-soft)}\n" +
    ".link-list a:first-child{border-top:0}\n" +
    ".link-list a:hover{background:var(--surface);color:var(--gold-2)}\n" +
    /* hero trim */
    ".hero{padding:14px 16px 14px}\n" +
    ".hero-crown{width:100px;height:100px;top:-6px}\n" +
    ".hero .kicker-row{margin-bottom:7px}\n" +
    ".hero h1{font-size:27px;margin-bottom:8px}\n" +
    ".hero p.sub{max-width:none;font-size:13px;margin-bottom:12px}\n" +
    ".hero .dual-cta{margin-top:12px}\n" +
    /* conversion CTA: flowing rainbow gradient + shine sweep */
    ".cta-get{position:relative;overflow:hidden;color:#fff;border:1px solid rgba(255,255,255,0.28);letter-spacing:.03em;text-shadow:0 1px 3px rgba(0,0,0,0.55);background:linear-gradient(90deg,#ff2d75,#ff7a1a,#ffd23f,#3ddc97,#2f9bff,#a24bff,#ff2d75);background-size:340% 100%;animation:cta-flow 7s linear infinite;box-shadow:0 12px 30px -8px rgba(255,45,117,0.55),0 0 0 1px rgba(255,255,255,0.06) inset}\n" +
    "@keyframes cta-flow{to{background-position:340% 50%}}\n" +
    ".cta-get::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.16)}\n" +
    ".cta-get::after{content:'';position:absolute;top:0;left:-75%;width:45%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);transform:skewX(-20deg);animation:cta-shine 3.2s ease-in-out infinite}\n" +
    "@keyframes cta-shine{0%,58%{left:-75%}100%{left:150%}}\n" +
    ".cta-get span{position:relative;z-index:1}\n" +
    "@media (prefers-reduced-motion:reduce){.cta-get{animation:none;background-position:0 50%}.cta-get::after{display:none}}\n" +
    "</style>";

  const faq = [
    ["How does FreeKreditRM10 pick a featured offer?", "We read each promotion against the same four points: eligibility, turnover, eligible games and withdrawal cap. The offer that is clearest on all four, and usable without a deposit, becomes the featured pick. Right now that is Jadiking88."],
    ["Is free credit really free?", "The credit costs nothing to claim, but it is not the same as cash. It normally has to be wagered several times on set games before any winnings can be withdrawn, and those winnings are often capped. The full guide works through an example."],
    ["How often are the offers updated?", "Promotions change without notice. Treat every amount, condition and claim window on this site as a starting point and confirm it on the operator page before you claim."],
    ["Do you earn anything if I sign up?", "Yes. If you register through our link to the featured pick we may receive a referral fee. It does not change the offer you get, and it is not the reason an offer is featured. The checklist decides that."],
    ["Which guide should I read first?", "If you have never claimed free credit, start with the full RM10 guide. If you already know the mechanics and want a shortlist, go to the RM10 no deposit comparison."],
  ];

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": SITE + "/#organization", name: "FreeKreditRM10", url: SITE + "/", logo: SITE + "/brand/logo.png" },
      { "@type": "WebSite", "@id": SITE + "/#website", url: SITE + "/", name: "FreeKreditRM10", publisher: { "@id": SITE + "/#organization" }, inLanguage: "en-MY" },
      { "@type": "WebPage", "@id": SITE + "/#webpage", url: SITE + "/", name: "Free Kredit RM10 Malaysia 2026: Free Credit & No Deposit Guide", isPartOf: { "@id": SITE + "/#website" }, inLanguage: "en-MY", about: "Free credit RM10 Malaysia" },
      { "@type": "FAQPage", "@id": SITE + "/#faq", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      { "@type": "BreadcrumbList", "@id": SITE + "/#breadcrumb", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }] },
    ],
  };

  const featured = [
    "free-kredit-rm10-malaysia-guide",
    "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia",
    "top-10-slot-games-to-play-using-free-kredit-rm10",
    "top-7-slot-malaysia-platform-to-claim-free-credit-no-deposit-rm10",
    "how-to-register-dapat-free-credit-e-wallet",
    "joylink-free-credit",
    "game/golden-empire",
    "about-us-jadiking-2-0",
  ];
  const types = [
    ["RM3", "how-to-claim-link-free-credit-rm3", "Link free kredit RM3"],
    ["RM5", "why-link-free-credit-rm5-matters-understanding-the-benefits-for-players", "Link free credit RM5"],
    ["RM10", "best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia", "No deposit RM10"],
    ["RM88", "need-luck-and-strategy-get-our-free-kredit-88-today", "Free kredit 88"],
    ["RM100", "maximize-your-wins-how-to-claim-joy-link-free-credit-rm100-no-deposit", "Joy Link RM100"],
    ["RM1000", "bonus/rm1000-rebate-bonus-free-kredit-rm10", "Rebate bonus"],
  ];

  const crown = '<svg viewBox="0 0 24 24" fill="none"><path d="M3 8l3 3 6-7 6 7 3-3-2 11H5L3 8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  const check = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const faqHtml = faq
    .map(([q, a], i) => `    <details class="faq-item"${i === 0 ? " open" : ""}><summary class="faq-q">${esc(q)} <span class="plus">+</span></summary><p class="faq-a">${esc(a)}</p></details>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en-MY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Free Kredit RM10 Malaysia 2026: Free Credit & No Deposit Guide</title>
<meta name="description" content="FreeKreditRM10 tracks free credit and no deposit promotions in Malaysia and reads every one against a fixed checklist: eligibility, turnover, eligible games and withdrawal cap. Start with the full RM10 guide or go to the featured pick.">
<meta name="keywords" content="free kredit RM10, free credit RM10, free kredit Malaysia, free kredit no deposit, slot free kredit, free credit casino Malaysia, no deposit bonus Malaysia">
<link rel="canonical" href="${SITE}/">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta http-equiv="content-language" content="en-MY">
<meta name="geo.region" content="MY">
<meta name="geo.placename" content="Malaysia">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_MY">
<meta property="og:site_name" content="FreeKreditRM10">
<meta property="og:title" content="Free Kredit RM10 Malaysia 2026: Free Credit & No Deposit Guide">
<meta property="og:description" content="Free credit and no deposit promotions in Malaysia, each read against the same checklist. Start with the full RM10 guide or go to the featured pick.">
<meta property="og:url" content="${SITE}/">
<meta property="og:image" content="${SITE}/brand/cover.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Free Kredit RM10 Malaysia 2026: Complete Guide">
<meta name="twitter:description" content="Free credit and no deposit promotions in Malaysia, each checked for eligibility, turnover, eligible games and withdrawal cap.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">
${JSON.stringify(jsonld)}
</script>
${style}
${supplement}
${CHROME_CSS}
</head>
<body>
${siteHeader()}

<div class="page">

  <header class="hero" id="top">
    <svg class="hero-crown" viewBox="0 0 24 24" fill="none"><path d="M3 8l3 3 6-7 6 7 3-3-2 11H5L3 8z" stroke="var(--gold)" stroke-width="0.8"/></svg>
    <div class="kicker-row">${crown}<span>Malaysia Free Credit Guide</span></div>
    <h1>Free Kredit RM10<br>Malaysia</h1>
    <p class="sub">FreeKreditRM10 follows free credit and no deposit promotions in Malaysia and records what each one asks for before a withdrawal is possible. Use the full guide to learn the mechanics, compare offers by amount, or go straight to the pick we send readers to.</p>
    <div class="dual-cta">
      <a class="btn-gold" href="/${GUIDE_PATH}/">Read the full guide</a>
      <a class="btn-outline cta-get" href="https://jadiking.my/" target="_blank" rel="noopener"><span>Get free credit RM10</span></a>
    </div>
  </header>

  <section id="start">
    <div class="kicker">Start here</div>
    <h2 class="h-section">Three ways in</h2>
    <div class="start-grid">
      <a href="/${GUIDE_PATH}/"><span class="n">01</span><strong>New to free credit</strong><span class="d">Read the full RM10 guide for how claiming, turnover and withdrawal actually work.</span></a>
      <a href="/best-online-casinos-offering-free-credit-10-no-deposit-in-malaysia/"><span class="n">02</span><strong>Comparing offers</strong><span class="d">See which platforms run RM10 no deposit credit and what each one attaches to it.</span></a>
      <a href="#pick"><span class="n">03</span><strong>Ready to play</strong><span class="d">Go to the featured pick and register.</span></a>
    </div>
  </section>

  <section id="pick">
    <div class="kicker">Our top pick</div>
    <span class="pick-tag">${crown} Featured recommendation</span>
    <h2 class="h-section">Jadiking88 (Jadiking 2.0)</h2>
    <p class="lede">Of the RM10 offers we have looked at, Jadiking88 is the one we send readers to. It settles through e-wallet instead of bank transfer, the sign up credit of RM10 to RM30 needs no deposit, and the Monthly Mission multiplier rewards steady play rather than paying out once and stopping.</p>
    <div class="credit-panel">
      <div class="credit-medal">${crown}</div>
      <div class="body">
        <div class="amt">RM10 TO RM30 FREE CREDIT</div>
        <div class="note">No deposit needed for new players</div>
      </div>
      <a class="collect-btn" href="https://jadiking.my" target="_blank" rel="noopener">CLAIM</a>
    </div>
    <div class="ledger-scroll">
      <div class="receipt"><span class="tag">No deposit</span><div class="amount">RM10<small> to 30</small></div><p>Free credit for new players registering for the first time.</p></div>
      <div class="receipt"><span class="tag">Recurring</span><div class="amount">3.5<small>x</small></div><p>Monthly Mission deposit multiplier based on activity.</p></div>
      <div class="receipt"><span class="tag">E-wallet</span><div class="amount">Fast</div><p>Deposits and withdrawals through e-wallet rather than bank queues.</p></div>
    </div>
    <div class="dual-cta">
      <a class="btn-gold" href="https://jadiking.my" target="_blank" rel="noopener">Register at Jadiking</a>
      <a class="btn-outline" href="/about-us-jadiking-2-0/">Read the review</a>
    </div>
  </section>

  <section id="types">
    <div class="kicker">By amount</div>
    <h2 class="h-section">Free credit by amount</h2>
    <p class="lede">The headline number is the part people search for. The conditions attached to it are the part that decides whether the credit is worth claiming. Each guide takes one amount and works through both.</p>
    <div class="type-grid">
      ${types.map(([amt, p, lbl]) => `<a href="${rel(p)}"><span class="amt">${amt}</span><span class="lbl">${esc(lbl)}</span></a>`).join("\n      ")}
    </div>
  </section>

  <section id="guides">
    <div class="sec-head">
      <div class="title">${crown}<h2>Popular guides</h2></div>
      <a class="view-all" href="/blog/">View all</a>
    </div>
    <div class="link-list">
      ${featured.map((p) => `<a href="${rel(p)}">${L(p)}</a>`).join("\n      ")}
    </div>
  </section>

  <section id="checklist">
    <div class="kicker">Our method</div>
    <h2 class="h-section">What we check in every review</h2>
    <p class="lede">Every offer on this site is read against the same four points. If a promotion hides any of them, that goes in the review.</p>
    <div class="why-grid">
      <div class="why-item">${check}<h3>Eligibility</h3><p>Who can claim: new accounts only, region limits, verification, or a minimum deposit first.</p></div>
      <div class="why-item">${check}<h3>Turnover</h3><p>How many times the credit has to be wagered, on what, and inside what time window.</p></div>
      <div class="why-item">${check}<h3>Eligible games</h3><p>Which titles count toward that turnover and how much each one contributes.</p></div>
      <div class="why-item">${check}<h3>Withdrawal cap</h3><p>The ceiling on what can be cashed out from credit that started as a bonus.</p></div>
    </div>
  </section>

  <section id="faq">
    <div class="kicker">FAQ</div>
    <h2 class="h-section">Frequently asked questions</h2>
${faqHtml}
  </section>

  <footer>
    <div class="foot-block">
      <h4>FreeKreditRM10</h4>
      <p>Tracks free credit and no deposit promotions in Malaysia and reviews each one against a fixed checklist. We are not an operator. Registration and play happen on the sites we link to.</p>
    </div>
    <div class="foot-block">
      <h4>Guides</h4>
      ${featured.slice(0, 6).map((p) => `<a href="${rel(p)}">${L(p)}</a>`).join("\n      ")}
      <a href="/blog/">All guides &rarr;</a>
    </div>
    <div class="foot-block" id="contact">
      <h4>Contact</h4>
      <p class="mono">+60 11-2063 1805</p>
      <p>Malaysia</p>
    </div>
    <div class="foot-bottom">&copy; 2026 FreeKreditRM10 &middot; Free credit and no deposit guide for Malaysia</div>
    <p class="disclaimer">FreeKreditRM10 is an independent information resource. Bonus value, eligibility, turnover requirements, eligible games and withdrawal terms change often and vary by promotion. Always read the current operator terms before you claim. 18+. Play responsibly.</p>
  </footer>

</div>

${siteNav("home")}
</body>
</html>
`;
}
