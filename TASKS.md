# TASKS.md — ToolsWebsite (single source of truth: requirements, status, history)

Last updated: 2026-10-17

## 0. Rules for every session (human or AI)

1. Work on **one task at a time**, in order. Do not jump ahead.
2. A task is **Done only when its Definition of Done (DoD) and Test pass**. If a test fails, fix it before touching the next task.
3. After finishing a task: update its status here, add a line to the **History log** (section 7), then stop and report.
4. Never hardcode colors or fonts in pages; use `core/design-system.css` tokens.
5. Never mark a tool `ready: true` in `core/registry.js` until its page exists and passes the per-tool checklist (section 5).

Status legend: ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked

---

## 1. Project summary

- **What:** 94 free online tools (PDF, image, finance, developer, SEO/utility, video/audio) as a website, monetized with Google AdSense.
- **Stack (final):** static HTML + CSS + vanilla JS. No backend, no build step. Free static hosting (Netlify / Cloudflare Pages / GitHub Pages).
- **Differentiator:** all processing happens in the browser — "your files never leave your device".
- **Design:** "Workshop / Toolbelt" — warm paper background, one amber accent (`#B45309`), Space Grotesk headings, Inter body. Category colors give variety.
- **Page format:** every tool is a blog-style page: widget on top, then article (what it is, how to use, formula/steps, examples, FAQ + FAQPage schema, related tools, disclaimer where relevant).
- **Previous attempt:** Laravel 10 + React 18 + Inertia (94 tool pages, working logic using pdf-lib, tesseract.js, ffmpeg.wasm, mammoth, xlsx). Dropped because setup/build overhead slowed solo development. Its tool logic is reused here; only the React/Inertia wrapper is removed.

## 2. Requirements

### 2.1 Must have (V1)
| ID | Requirement | Status |
|---|---|---|
| R1 | Static HTML/CSS/JS, runs by opening `index.html` or any static server | ✅ |
| R2 | Shared design system file used by all pages | ✅ |
| R3 | Shared header/footer/rails/breadcrumbs stamped into every page by `scripts/build.js` (real HTML for crawlers, no JS injection) | ✅ |
| R4 | Central tools registry drives homepage, search, categories, related tools | ✅ |
| R5 | Homepage: hero, search, category filter, tool grid | ✅ |
| R6 | Each tool = own page with blog-format content (500+ words, FAQ, related tools) | 🟡 (1 of 94) |
| R7 | SEO per page: unique title/description, canonical, FAQPage + SoftwareApplication JSON-LD | 🟡 (1 of 94) |
| R8 | `sitemap.xml` + `robots.txt` | 🟡 (lists live pages only; update per tool) |
| R9 | Legal pages: Privacy Policy, Terms, Disclaimer (needed for AdSense) | 🟡 drafts exist, need review |
| R10 | Mobile responsive, no horizontal page scroll at 390px | ✅ (verified on GST page + home) |
| R11 | Browser-side processing for all tools; no file upload | ⬜ (per tool) |
| R12 | Reserved ad space on all pages, no ad code until AdSense approval | 🟡 slots reserved via `<!--@ad-->` / rails, no AdSense code yet |
| R13 | 3-column layout on Home + tool pages: left 160×600 ad, content, right 300×250 ad + Popular tools + sticky 300×600 ad. Left rail hides <1280px, both rails hide <1024px (inline 100px ads take over) | ✅ (tested 1440/1280/1024/390) |
| R15 | Technical SEO automated: canonical, robots, Open Graph, JSON-LD (SoftwareApplication, FAQPage from visible FAQ, BreadcrumbList), sitemap with stable lastmod, robots.txt | ✅ |
| R16 | Build audit fails on: duplicate/long titles, bad descriptions, not exactly one H1, < 600 words, < 3 FAQs, images without alt/size, broken links, TODO text | ✅ |
| R17 | Speed: self-hosted variable fonts + preload, WebP images, deferred scripts, `_headers` caching, fixed-height ad slots (no layout shift) | ✅ (re-test with Lighthouse after deploy) |
| R18 | `scripts/new-tool.js <slug>` scaffold so every tool starts SEO-complete | ✅ |
| R19 | Category hub pages auto-generated when a category has 3+ live tools; inline `data-tool` links activate when the target goes live | ✅ |
| R14 | Tool widget uses segmented toggles (rate, mode) and a Copy result button; same pattern for every calculator | ✅ (GST) |

### 2.2 Should have (V2, after launch + traffic)
| ID | Requirement | Status |
|---|---|---|
| R20 | Favorites, Recently used, Continue last tool (localStorage) | ⬜ |
| R21 | Dark mode toggle (CSS tokens already centralised) | ⬜ |
| R22 | Command palette (Ctrl+K) | ⬜ |
| R23 | Guest daily usage limits for server-heavy tools (localStorage) | ⬜ |
| R24 | Learning center / blog posts beyond tool pages | ⬜ |
| R25 | Google Analytics 4 + Search Console | ⬜ |
| R26 | Feedback form per tool | ⬜ |

### 2.3 Parked (do not build until real traffic, ~1000+ daily users)
Login/accounts, workspace/file manager, workflow/pipeline builder, plugin system, public API/SDKs, mobile app, browser extension, enterprise features, paid premium tier, paid ads.

### 2.4 Monetization plan
- Stage 1: all tools free, AdSense only, no login. Do **not** run paid ads (cost per visitor is higher than AdSense revenue per visitor).
- Apply for AdSense only after: legal pages reviewed, 20–30 real pages live, site indexed.
- Ad rules: keep ads away from action buttons (accidental-click policy); reserve ad height to avoid layout shift.
- Stage 3 (later): premium tier if demand and hosting cost justify it.

## 3. Task list (strict order)

| # | Task | DoD | Test | Status |
|---|---|---|---|---|
| T0 | Decide stack | Static HTML/CSS/JS chosen and written down | — | ✅ |
| T1 | New project folder + design system + shared layout + registry | Files exist, registry loads 94 tools | `node` loads registry: 94 tools, unique slugs | ✅ |
| T2 | Homepage | Search + category filter work, shows only `ready` tools | Headless browser: card count, empty-search message, no JS errors | ✅ |
| T3 | GST Calculator page (template for all tools) | Widget + full article + FAQ + schema + related slot | 5 math cases pass, JSON-LD parses, FAQ count matches schema, no overflow at 390px | ✅ |
| T4 | Legal pages (drafts) + robots + sitemap | 3 pages linked from footer, files present | All local links resolve | ✅ drafts (review pending, see T9) |
| T5 | Finance calculators batch (EMI, SIP, FD, PPF, Income Tax, …) | Each passes per-tool checklist (section 5) | Per-tool checklist | 🟡 in progress: GST, EMI, SIP, FD, PPF, Income Tax, Compound Interest, Simple Interest, Percentage, Age ✅ Discount (11 live); 10 finance tools left: BMI next |
| T6 | Text + developer tools batch (JSON, Base64, word counter, …) | Same | Same | ⬜ |
| T7 | PDF + image tools batch (pdf-lib, compression, …) | Same | Same, plus test with real files | ⬜ |
| T8 | SEO/utility + video/audio tools batch | Same | Same | ⬜ |
| T9 | Review legal pages, set `contactEmail` in `site.json` (About + Contact pages exist as drafts) | Real contact info present | Manual read-through | 🟡 About/Contact drafted, email pending |
| T10 | Deploy to free static host + custom domain + HTTPS | Live URL works for GST page | Open live URL on phone | ⬜ |
| T11 | GA4 + Search Console + submit sitemap | Real-time visit shows in GA4; domain verified | Visit site, check GA4 | ⬜ |
| T12 | Apply for AdSense (after T9–T11 and 20+ live tools) | Application submitted | — | ⬜ |
| T13 | Add `AdSlot` code after approval | Ads render in reserved slots, no layout shift | Visual check, Lighthouse CLS | ⬜ |

## 4. Current focus

**NEXT: T5 — Finance calculators (10 left).** Done (11): GST, EMI, SIP, FD, PPF, Income Tax, Compound Interest, Simple Interest, Percentage, Age, Discount. Suggested order for the rest: BMI, HRA, Gratuity, Home Loan, Loan Prepayment, NPS, Salary (in-hand; depends on current tax rules), Sukanya Samriddhi and Retirement Corpus (rate/rule lookups). Currency Converter needs live exchange rates (a server or API, so not pure static): decide the source before building. Reason: fast to build, strong search volume, no file handling.

Blockers / open questions:
- Domain name not confirmed (`toolswebsite.in` is used as placeholder in canonicals and sitemap).
- Contact email for legal pages not decided.

## 5. Per-tool checklist (copy for every tool)

- [ ] `node scripts/new-tool.js <slug>` run; `tools/<slug>.html` + `.js` created
- [ ] Logic is a pure function where possible and tested in node with 3+ cases
- [ ] Article has: what it is, how to use, formula/steps, worked examples, FAQ (5+), disclaimer if finance/legal
- [ ] 600+ words of real content (not filler); how-to steps have real screenshots in `tools/img/<slug>-*.webp` (WebP, <= 150 KB, width/height set)
- [ ] Unique `<title>` (<= 60 chars) and meta description (110-160 chars); canonical, JSON-LD and breadcrumbs come from the build
- [ ] 2+ inline `data-tool` links to related tools in the article
- [ ] Opens with no console errors; no horizontal scroll at 390px
- [ ] `ready: true` set in `core/registry.js`
- [ ] `node scripts/build.js` prints `Audit passed` (this also updates sitemap, related tools, homepage)
- [ ] Row below updated to ✅

## 6. Tool tracker (94 tools)

Status: ✅ live · ⬜ not built. "React logic" = a working version exists in the old React project, so only the wrapper needs converting.

### PDF & Image (23)

| Tool | Slug | Status | Notes |
|---|---|---|---|
| PDF to Word Converter | `pdf-to-word` | ⬜ | React logic |
| Word to PDF Converter | `word-to-pdf` | ⬜ | React logic |
| Excel to PDF Converter | `excel-to-pdf` | ⬜ | React logic |
| PPT to PDF Converter | `ppt-to-pdf` | ⬜ | React logic |
| PDF Merger | `pdf-merger` | ⬜ | React logic |
| PDF Splitter | `pdf-splitter` | ⬜ | React logic |
| PDF Compressor | `pdf-compressor` | ⬜ | React logic |
| PDF Page Rotator | `pdf-page-rotator` | ⬜ | React logic |
| PDF Watermark Adder | `pdf-watermark` | ⬜ | React logic |
| PDF to Image Converter | `pdf-to-image` | ⬜ | React logic |
| PDF Password Protect | `pdf-password` | ⬜ | React logic |
| Image Compressor | `image-compressor` | ⬜ | React logic |
| Image Resizer | `image-resizer` | ⬜ | React logic |
| Image Format Converter | `image-format-converter` | ⬜ | React logic |
| Image Rotator | `image-rotator` | ⬜ | React logic |
| Image Cropper | `image-cropper` | ⬜ | React logic |
| Image to PDF Converter | `image-to-pdf` | ⬜ | React logic |
| Passport Photo Maker | `passport-photo-maker` | ⬜ | React logic |
| Photo to Sketch | `photo-to-sketch` | ⬜ | React logic |
| HEIC to JPG Converter | `heic-to-jpg` | ⬜ | React logic |
| Image to Text (OCR) | `image-to-text` | ⬜ | React logic |
| Merge Images | `merge-images` | ⬜ | React logic |
| Image Watermark Tool | `watermark-image` | ⬜ | React logic |

### Finance (21)

| Tool | Slug | Status | Notes |
|---|---|---|---|
| GST Calculator | `gst-calculator` | ✅ | Live. Template page. |
| EMI Calculator | `emi-calculator` | ✅ | 15 unit tests, 29 browser checks, 1,203 words, 6 FAQ, 4 screenshots |
| Income Tax Calculator | `income-tax-calculator` | ✅ | 25 unit tests, 29 browser checks, 1,168 words, 6 FAQ, 4 screenshots |
| SIP Calculator | `sip-calculator` | ✅ | 19 unit tests, 26 browser checks, 1,141 words, 6 FAQ, 4 screenshots |
| PPF Calculator | `ppf-calculator` | ✅ | 19 unit tests, 34 browser checks, 1,145 words, 6 FAQ, 4 screenshots |
| FD Calculator | `fd-calculator` | ✅ | 19 unit tests, 30 browser checks, 1,125 words, 6 FAQ, 4 screenshots |
| Compound Interest Calculator | `compound-interest` | ✅ | 21 unit tests, 36 browser checks, 838 words, 6 FAQ, 4 screenshots |
| Simple Interest Calculator | `simple-interest` | ✅ | 23 unit tests, 34 browser checks, 949 words, 6 FAQ, 4 screenshots |
| HRA Calculator | `hra-calculator` | ⬜ | React logic |
| Gratuity Calculator | `gratuity-calculator` | ⬜ | React logic |
| CTC to In-hand Salary Calculator | `salary-calculator` | ⬜ | React logic |
| Age Calculator | `age-calculator` | ✅ | 9 unit tests (61 date pairs vs dateutil), 24 browser checks, 953 words, 6 FAQ, 4 screenshots |
| Percentage Calculator | `percentage-calculator` | ✅ | 29 unit tests, 34 browser checks, 855 words, 6 FAQ, 4 screenshots |
| Discount Calculator | `discount-calculator` | ✅ | 22 unit tests, 36 browser checks, 826 words, 6 FAQ, 4 screenshots |
| BMI Calculator | `bmi-calculator` | ⬜ | React logic |
| Sukanya Samriddhi Calculator | `sukanya-samriddhi` | ⬜ | React logic |
| Home Loan Eligibility Calculator | `home-loan` | ⬜ | React logic |
| Loan Prepayment Calculator | `loan-prepayment` | ⬜ | React logic |
| NPS Calculator | `nps-calculator` | ⬜ | React logic |
| Retirement Corpus Calculator | `retirement-corpus` | ⬜ | React logic |
| Currency Converter | `currency-converter` | ⬜ | React logic |

### Developer Tools (24)

| Tool | Slug | Status | Notes |
|---|---|---|---|
| JSON Formatter & Validator | `json-formatter` | ⬜ | React logic |
| JSON ↔ CSV Converter | `json-csv` | ⬜ | React logic |
| Base64 Encoder / Decoder | `base64` | ⬜ | React logic |
| URL Encoder / Decoder | `url-encoder` | ⬜ | React logic |
| HTML & CSS Minifier | `css-html-minifier` | ⬜ | React logic |
| JS Minifier / Beautifier | `js-minifier` | ⬜ | React logic |
| Regex Tester | `regex-tester` | ⬜ | React logic |
| UUID Generator | `uuid-generator` | ⬜ | React logic |
| Hash Generator | `hash-generator` | ⬜ | React logic |
| Markdown to HTML | `markdown-to-html` | ⬜ | React logic |
| Diff Checker | `diff-checker` | ⬜ | React logic |
| Lorem Ipsum Generator | `lorem-ipsum` | ⬜ | React logic |
| Password Generator | `password-generator` | ⬜ | React logic |
| QR Code Generator | `qr-code-generator` | ⬜ | React logic |
| Barcode Generator | `barcode-generator` | ⬜ | React logic |
| Timestamp Converter | `timestamp-converter` | ⬜ | React logic |
| Cron Expression Generator | `cron-generator` | ⬜ | React logic |
| XML Formatter | `xml-formatter` | ⬜ | React logic |
| YAML ↔ JSON Converter | `yaml-to-json` | ⬜ | React logic |
| Word Counter | `word-counter` | ⬜ | React logic |
| Character Counter | `character-counter` | ⬜ | React logic |
| Case Converter | `case-converter` | ⬜ | React logic |
| Color Picker / Converter | `color-converter` | ⬜ | React logic |
| Text Diff Checker | `text-diff-checker` | ⬜ | React logic |

### SEO & Utility (14)

| Tool | Slug | Status | Notes |
|---|---|---|---|
| Slug Generator | `slug-generator` | ⬜ | React logic |
| Meta Tag Generator | `meta-tag-generator` | ⬜ | React logic |
| Readability Checker | `readability-checker` | ⬜ | React logic |
| Unit Converter | `unit-converter` | ⬜ | React logic |
| CSS Gradient Generator | `gradient-generator` | ⬜ | React logic |
| Title Case Generator | `title-case-generator` | ⬜ | React logic |
| Number to Words Converter | `number-to-words` | ⬜ | React logic |
| Random Number Generator | `random-number` | ⬜ | React logic |
| Random Name / Team Picker | `random-name-picker` | ⬜ | React logic |
| Favicon Generator | `favicon-generator` | ⬜ | React logic |
| Screen Resolution Checker | `screen-resolution` | ⬜ | React logic |
| Email Signature Generator | `signature-generator` | ⬜ | React logic |
| Text to Speech | `text-to-speech` | ⬜ | React logic |
| Invoice Generator | `invoice-generator` | ⬜ | React logic |

### Video & Audio (12)

| Tool | Slug | Status | Notes |
|---|---|---|---|
| Video to MP3 Converter | `video-to-mp3` | ⬜ | React logic |
| Video Compressor | `video-compressor` | ⬜ | React logic |
| GIF Maker | `gif-maker` | ⬜ | React logic |
| Video Trimmer | `video-trimmer` | ⬜ | React logic |
| Audio Trimmer | `audio-trimmer` | ⬜ | React logic |
| Screen Recorder | `screen-recorder` | ⬜ | React logic |
| IP Address Lookup | `ip-lookup` | ⬜ | React logic |
| Crypto Price Tracker | `crypto-price-tracker` | ⬜ | React logic |
| Rent Receipt Generator | `rent-receipt` | ⬜ | React logic |
| Salary Slip Generator | `salary-slip` | ⬜ | React logic |
| Website Speed Test | `website-speed-test` | ⬜ | React logic |
| WHOIS Lookup | `whois-lookup` | ⬜ | React logic |

## 7. History log (newest first)

| Date | What happened |
|---|---|
| 2026-10-20 | Discount Calculator built and tested (T5, tool 11). `calcSale` (price, discount, optional extra discount applied one after the other; shows total discount %) and `calcPct` (original + sale price -> discount %). Tests: `tests/discount.test.js` (22, expected values from a separate Python/Decimal calculation), `tests/browser-discount.py` (36). Bugs found while building: the `hidden` attribute did not hide `.field` boxes because `.field` sets display:flex (fixed with a global `[hidden]{display:none!important}` in design-system.css), and the Copy text in Discount % mode lacked the % sign (fixed, test added). Article points checked by calculation: 20%+10% = 28% not 30%, 50%+50% = 75%, reverse formula 1,500 / 0.75 = 2,000. |
| 2026-10-20 | Age Calculator built and tested (T5, tool 10). `calcAge` works on calendar dates in UTC (no time-zone or DST effects): whole months first (day clamped to month end), then leftover days; also total months/weeks/days, birth weekday, next birthday. 29 Feb birthdays count as 28 Feb in non-leap years (same clamp as the age maths). Tests: `tests/age.test.js` (61 date pairs whose expected values come from Python dateutil.relativedelta, plus invalid-date cases) and `tests/browser-age.py` (24 checks). `scripts/screenshots.py` got a per-tool PRE hook (fills sample inputs for tools whose defaults are empty). Note: headless Chromium shows the date box in US format; real visitors see their own device format. |
| 2026-10-20 | Percentage Calculator built and tested (T5, tool 9). `calcPct` with 5 modes (A% of B, A is what % of B, % change A to B, increase B by A%, decrease B by A%), mode chosen from a drop-down so it works on a 390px screen; labels and sensible defaults change with the mode; shows the answer, a sentence and the working. Tests: `tests/percentage.test.js` (29, expected values from a separate Python/Decimal calculation, incl. invalid cases per mode), `tests/browser-percentage.py`. Article examples (discount, GST, marks, hike, percent vs percentage points, +20% then -20% = 96) re-checked by calculation. |
| 2026-10-20 | Simple Interest Calculator built and tested (T5, tool 8). `calcSI` (time in years/months/days, 365-day year, up to 100 years, rate up to 100%) + `schedule` with part-year row. Tests: `tests/simple.test.js` (23, expected values from a separate Python/Decimal calculation), `tests/browser-simple.py`. Article covers inverse formulas (rate/time/principal, each example checked), simple vs compound, and flat-rate loans (8% flat on 1L for 3y ≈ 14.5% reducing-balance, computed independently). |
| 2026-10-20 | Compound Interest Calculator built and tested (T5, tool 7). `calcCI` (yearly/half-yearly/quarterly/monthly/daily compounding, months up to 600, rate up to 100%) also returns simple interest and effective annual rate; `schedule`. Tests: `tests/compound.test.js` (21, expected values from a separate Python/Decimal calculation), `tests/browser-compound.py`. Article tables (frequency, time, simple vs compound) re-checked by calculation. Registry slug is `compound-interest`. |
| 2026-10-20 | Income Tax Calculator built and tested (T5, tool 6). `calcTax` compares new vs old regime for FY 2026-27 (slabs, standard deduction 75,000/50,000, old-regime deductions with caps, 87A rebate with marginal relief in the new regime, 4% cess, rounding to Rs 10, 3 age groups). Rules looked up (slabs unchanged from FY 2025-26). Scope: income up to Rs 50 lakh; surcharge not modelled and the page says so. Tests: `tests/tax.test.js` (25, expected values from a separate Python/Decimal slab calculation), `tests/browser-tax.py` (29). Registry description updated from FY 2024-25. Article tables re-checked by calculation. **Re-check slabs and limits after every Union Budget.** |
| 2026-10-19 | PPF Calculator built and tested (T5, tool 5). `calcPPF` (yearly deposit by 5 April, or 12 equal monthly instalments; interest on the lowest monthly balance, credited yearly; 15–50 years in 5-year blocks; ₹500–₹1,50,000 a year). Rate default 7.1% (Oct–Dec 2026, looked up, reset quarterly by the government). Tests: `tests/ppf.test.js` (19, expected values from a separate month-by-month Python/Decimal calculation), `tests/browser-ppf.py` (34 checks). Article figures re-checked by calculation. Loans and the exact withdrawal formula were left out of the article on purpose (sources disagreed). |
| 2026-10-19 | FD Calculator built and tested (T5, tool 4). `calcFD` (cumulative FD, yearly/half-yearly/quarterly/monthly compounding, months tenure up to 30 years) + `schedule`. Tests: `tests/fd.test.js` (19, expected values from a separate Python calculation), `tests/browser-fd.py` (compounding toggle, unit switch, sliders, invalid input, copy, layout). Article claims re-checked by calculation (e.g. interest in years 6-10 is ₹58,682 vs ₹41,478 in years 1-5; 10 years doubles ₹1,00,000). |
| 2026-10-19 | SIP Calculator built and tested (T5, tool 3). `calcSIP` (annuity-due, instalment at start of month) + `schedule` + `inrWords`; same widget pattern as EMI. Tests: `tests/sip.test.js` (19, expected values from a separate Python calculation), `tests/browser-sip.py` (26 checks). Added `scripts/screenshots.py <slug>` (captures the 4 how-to screenshots as WebP and writes width/height into the page) and made `npm test` also run browser tests when playwright is installed. Order of work for a tool: build.js first (so the page is styled), then screenshots, then build.js again. |
| 2026-10-19 | EMI Calculator built and tested (T5, tool 2). Logic `calcEMI` + `schedule` + `inrWords`; widget with number boxes + sliders, Years/Months toggle, breakup bar, collapsible yearly schedule, Copy result. Tests: `tests/emi.test.js` (15 cases, expected values cross-checked with a separate high-precision calculation), `tests/gst.test.js` (6), `tests/browser-emi.py` (29 checks incl. sliders, unit switch, invalid input, clipboard, no overflow at 1440/1280/1024/390, 44px touch targets). Bugs found by tests and fixed: empty field was treated as 0 (EMI + GST), Copy button was 39px tall (now `.btn` min-height 44px), rail link colours. `npm test` runs unit tests + build audit. |
| 2026-10-18 | SEO + speed pass requested by Sudhakar. Added `scripts/build.js` (stamps shared HTML, JSON-LD, sitemap, category hubs, audit), `scripts/new-tool.js` + templates, `site.json`, `_headers`, `netlify.toml`, `favicon.svg`, About/Contact/404 pages, `SEO-PLAYBOOK.md`. Removed `core/layout.js` (JS injection). Fonts self-hosted, screenshots to WebP. Tested 8 pages at 1440/390: no console errors, no failed requests, no horizontal scroll; homepage grid and header present in raw HTML (no JS needed). |
| 2026-10-18 | UI redesigned to 3-column layout (wireframe approved by Sudhakar): `.layout` grid + rails in `design-system.css`, rails/ads injected by `core/layout.js` (`data-rail`, `data-ad`, `SHOW_AD_PLACEHOLDERS` flag), Home + GST page updated, segmented toggles + Copy button on GST. Tested: no horizontal scroll at 390px, rails hide at the breakpoints, GST results correct. |
| 2026-10-17 | Created `TASKS.md`. Built new static project: design system, shared layout, registry (94 tools), homepage, GST Calculator blog-format page, 3 legal drafts, sitemap, robots. Tests passed (GST math, JSON-LD, mobile overflow fixed for article tables). Corrected earlier miscount: registry has 94 tools, not 95. |
| 2026-10-17 | Confirmed final decision: static HTML + CSS + vanilla JS for MVP; each tool as a blog-format page. |
| Earlier (React era) | Pivoted away from Laravel + React after setup time became a bottleneck. Analysis of that project found: no dynamic routing (95 hand-written routes), shared layout missing (code duplicated across tool files), SEO incomplete (~400-word articles, no Related tools, no FAQ schema), dark mode/favorites missing. |
| Earlier (React era) | Redesigned look away from near-black + teal/purple gradient (generic "AI look") to warm light theme with amber accent and Space Grotesk/Inter pairing. |
| Earlier (React era) | Competitor research done (iLovePDF, Smallpdf, TinyWow, Convertio, FreeConvert, ILoveIMG, TinyPNG, JSONLint, RapidTables, Calculator.net). Main gap found: most competitors upload files to servers (privacy concern) and use ads/CAPTCHA as friction. Our angle: browser-only processing + fair free use. |
| Earlier (React era) | Scoped down a 570+ feature wish-list (enterprise, plugins, workflow builder, mobile app, public API) to realistic V1; parked the rest (section 2.3). |
| Earlier (React era) | Built 94 tool pages in React with real client-side libraries (pdf-lib, tesseract.js, ffmpeg.wasm, mammoth, xlsx). |

## 8. Decisions log

| Decision | Why |
|---|---|
| Static HTML/CSS/JS, no framework | Fastest for a solo developer with a full-time job; no build errors; free hosting |
| Registry file (`core/registry.js`) as single source of truth | Homepage, search, categories, related tools all derive from it; adding a tool = one page + one flag |
| Homepage shows only `ready` tools | Avoids dead links and thin/empty pages that hurt SEO and AdSense approval |
| No paid ads | AdSense earns ~₹0.05–0.15 per visitor; buying a visitor costs ₹3–25 |
| Blog-format tool pages | Gives each URL real content for Google (and for AdSense "valuable content" review) |
| Ads live in side rails + inline slots, never next to action buttons | Higher RPM on desktop, AdSense-policy safe, fixed heights avoid layout shift |
| Build script that edits pages in place (no `dist/`), zero dependencies | Keeps "open index.html and it works"; crawlers get real HTML; automation replaces manual sitemap/related/JSON-LD edits. Deploy command is `node scripts/build.js` |
| JSON-LD FAQ is generated from the visible FAQ | Google requires them to match; generating removes the chance of drift |
| Keep `.html` in URLs for now | Works locally and on every host. If clean URLs are wanted later, enable pretty URLs on the host and add 301s |
| Strict number parsing (`''`/null are invalid, never 0) in every calculator | Number('') is 0 in JS, which silently produced wrong results; found by the EMI tests |
| Light warm theme | Matches trusted tool sites (iLovePDF/Smallpdf feel) and avoids the generic dark-gradient look |
