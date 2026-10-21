# SEO + Revenue Playbook

Goal: pages that rank on Google, load fast, pass AdSense review, and need no manual upkeep as tools are added.

## 1. How the automation works (so nothing is added by hand)

Run `node scripts/build.js` (Netlify/Cloudflare run it on every deploy via `netlify.toml`). It:

| Automatic | Source of truth |
|---|---|
| `<head>` tags: canonical, robots, Open Graph, Twitter, favicon, font preload, CSS | page `<title>` + `<meta description>` + file path |
| JSON-LD: SoftwareApplication, FAQPage, BreadcrumbList, WebSite, CollectionPage | registry + the visible FAQ on the page (they can never disagree) |
| Header, footer, breadcrumbs, side rails, ad slots | `scripts/build.js` |
| Related tools, Popular tools, homepage grid and pills | `core/registry.js` (`ready: true`) |
| Category hub pages (`category/finance.html`) | created automatically once a category has 3+ live tools |
| Inline links between tools: `<a data-tool="emi-calculator">EMI Calculator</a>` | link turns on by itself when that tool goes live |
| `sitemap.xml` (with stable `lastmod`), `robots.txt` | live pages only |
| Audit (fails the build) | see section 2 |

Adding a tool: `node scripts/new-tool.js <slug>` → write widget, logic, article, screenshots → set `ready: true` → `node scripts/build.js` must print `Audit passed`.

## 2. What the audit enforces for every live tool page

- Unique title (<= 60 chars) and unique meta description (110-160 chars)
- Exactly one H1
- 600+ words in the article, 3+ FAQ items, a widget, a privacy note, a related-tools block
- Every image has alt text, width and height (prevents layout shift) and is <= 150 KB
- No broken links or missing assets, no TODO/lorem text
- Scripts use `defer`; HTML < 100 KB
- Registry and files agree (no `ready: true` without a page; draft pages stay `noindex`)

## 3. How to write a tool page that ranks

1. **One page = one search intent.** "GST calculator", not "tax tools". Do not create two pages for the same query.
2. **Title formula:** `<Tool name> Online (Free) | ToolsWebsite`, or `<Tool> India: <benefit>` for India-specific searches. Put the main keyword first.
3. **Answer first.** The widget sits above the fold, so the visitor gets the result in seconds. Google rewards pages where the query is answered immediately.
4. **Article order:** what it is, how to use (steps + screenshots), formula, worked examples table, extra concept (e.g. CGST vs IGST), FAQ, disclaimer.
5. **FAQ questions = real searches** ("how to calculate EMI for a 20 lakh loan"). Check Google's "People also ask" for the tool and reuse those questions.
6. **Link tools to each other** inside paragraphs with `data-tool` links, not only in the Related block.
7. **Original content only.** Write explanations in your own words with your own examples; copied text hurts rankings and AdSense approval.
8. **Update, do not duplicate.** When a rule changes (e.g. GST slabs), edit the page; `lastmod` in the sitemap updates by itself.

## 4. Speed rules (already applied; keep them)

- Self-hosted variable fonts (about 70 KB total, plus a 1 KB rupee-sign font), preloaded, `font-display: swap`. No Google Fonts request.
- One small CSS file, no framework, no tracking script until GA4 is added (add it with `defer`/async).
- Screenshots in WebP with fixed width/height and `loading="lazy"`.
- Ad slots have fixed heights, so ads loading never moves the page (good CLS).
- `_headers` gives fonts/images a 1-year cache; HTML always revalidates.
- Tool JS is per-page and deferred; the homepage is the only page that loads the registry.
- Target: Lighthouse mobile >= 95 performance, CLS < 0.05, LCP < 2 s. Re-test every 10 new tools.

## 5. AdSense: do in this order

1. Finish legal/About/Contact pages (drafts exist; need real contact email in `site.json`).
2. 20-30 tool pages with real articles, indexed in Google Search Console.
3. Domain live on HTTPS, `domainConfirmed: true` in `site.json`.
4. Apply. After approval add the ad code in the build script's `adBox()` once, and every page updates.
5. Keep ads away from buttons and results; never label ads as anything but "Advertisement".
6. Set `showAdPlaceholders: false` in `site.json` when real ads go live.

## 6. Ideas that pay off long term (ordered by value / effort)

**High value, low effort**
- **Calculator-result pages for popular inputs** (e.g. "EMI on 10 lakh at 9% for 5 years") generated from one template. Hundreds of long-tail pages. Only do this once each page shows unique, useful numbers (a small amortisation table), otherwise Google treats them as thin.
- **Hindi versions** of the top 20 tools. India search volume in Hindi is large and competition is lower.
- **Shareable results:** a "Copy link" that stores inputs in the URL (`?amount=1000&rate=18`). People share results on WhatsApp, which brings backlinks and repeat visits. No server needed.
- **Currency / number formats and examples for India** (lakh, crore, rupee, GST, ITR terms) already differentiate us from global sites.
- **Embeddable widget** ("Embed this calculator", with a link back). Bloggers add it, we earn backlinks.

**Medium**
- **Learning blog** (R24): 1 article per 5 tools, e.g. "How is EMI calculated?", linking to the tools. Targets informational queries that tools alone miss.
- **Compare pages** ("SIP vs FD", "Old vs new tax regime calculator") which are high-intent and low-competition.
- **PWA / installable + offline** for calculators: repeat usage, better engagement signals.
- **Recently used + favourites** in localStorage (R20): increases pages per visit, which raises ad revenue per visitor.
- **Dark mode** (R21): tokens are already central.
- **Search (Ctrl+K)** (R22) across tools.

**Later, only with real traffic**
- Email/WhatsApp "tax deadline" reminders (consent required), affiliate links for relevant products (loans, mutual-fund platforms; clearly labelled), premium tier (R23-R25 parked list).

## 7. Things to avoid

- Auto-generating thousands of near-identical pages (thin content penalty).
- Buying traffic (visitor cost is higher than AdSense revenue per visitor).
- Clicking your own ads or asking others to (account ban).
- Copying competitor text.
- Putting ads close to Calculate/Copy/Download buttons.
- Changing URLs after they are indexed. If you must, add a 301 redirect in `_redirects`.
