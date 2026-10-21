#!/usr/bin/env node
/* ToolsWebsite build + SEO audit. Zero dependencies: `node scripts/build.js`
 *
 * What it does (all in place, no dist folder, site stays plain static HTML):
 *  1. Stamps shared blocks into every page between <!--@name-->...<!--/@name--> markers
 *     (head tags, header, footer, breadcrumbs, side rails, ads, related tools, homepage grid).
 *     Crawlers therefore get real HTML, not JS-injected HTML.
 *  2. Generates JSON-LD (SoftwareApplication, FAQPage from the visible FAQ, BreadcrumbList).
 *  3. Generates category hub pages (category/<slug>.html) once a category has enough live tools.
 *  4. Writes sitemap.xml (stable lastmod), robots.txt.
 *  5. Audits every page and exits with code 1 if something would hurt SEO or AdSense approval.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));
const CACHE_FILE = path.join(__dirname, '.lastmod.json');
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) : {};

// ── registry ─────────────────────────────────────────────────────────────
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'core/registry.js'), 'utf8'), sandbox);
const CATS = sandbox.window.TW_CATEGORIES;
const TOOLS = sandbox.window.TW_TOOLS;
const READY = TOOLS.filter(t => t.ready);
const bySlug = Object.fromEntries(TOOLS.map(t => [t.slug, t]));

const CAT_COPY = {
  'finance':     { h1: 'Free Finance Calculators Online', intro: 'GST, EMI, SIP, FD, income tax and more. Every calculator runs in your browser, shows the formula it uses and works on your phone. Nothing you type is uploaded.', app: 'FinanceApplication' },
  'pdf-image':   { h1: 'Free PDF and Image Tools Online', intro: 'Merge, split, compress and convert PDFs and images without uploading them anywhere. The work happens on your own device, so your files stay private.', app: 'UtilitiesApplication' },
  'dev':         { h1: 'Free Developer Tools Online', intro: 'Formatters, encoders, generators and testers for everyday development work. Fast, ad-light and fully client-side.', app: 'DeveloperApplication' },
  'seo-utility': { h1: 'Free SEO and Utility Tools Online', intro: 'Word counters, QR codes, text utilities and SEO helpers that run instantly in the browser.', app: 'UtilitiesApplication' },
  'video-audio': { h1: 'Free Video and Audio Tools Online', intro: 'Trim, convert and compress media files directly in your browser, with no upload and no signup.', app: 'MultimediaApplication' }
};
const hubSlugs = Object.keys(CATS).filter(k => READY.filter(t => t.category === k).length >= SITE.hubMinTools);
const hubFile = k => `category/${k}.html`;

// ── helpers ──────────────────────────────────────────────────────────────
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const unesc = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const strip = s => unesc(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));
const url = f => SITE.domain + '/' + (f === 'index.html' ? '' : f);
const rootOf = f => (f.match(/\//g) || []).length ? '../'.repeat((f.match(/\//g) || []).length) : '';
const json = o => '<script type="application/ld+json">' + JSON.stringify(o) + '</script>';

const SIZES = { sky: '160 × 600', rect: '300 × 250', tall: '300 × 600', inline: '320 × 100' };
const adBox = kind => `<div class="ad"><div class="ad-label">Advertisement</div><div class="ad-box ${kind}"><span>Ad slot</span><span>${SIZES[kind]}</span></div></div>`;

function toolCard(t, root) {
  const c = CATS[t.category];
  return `<a class="tool-card" href="${root}tools/${t.slug}.html"><span class="ic">${t.icon}</span>` +
    `<span class="chip" style="background:${c.color}1A;color:${c.color}">${esc(c.label)}</span>` +
    `<h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><span class="go">Open tool →</span></a>`;
}

function headerHtml(root, activeCat) {
  const link = (cat, label, hide) => {
    const hub = hubSlugs.includes(cat);
    const href = hub ? root + hubFile(cat) : root + 'index.html#all-tools';
    const attrs = (hub ? '' : ` data-cat="${cat}"`) + (cat === activeCat ? ' class="active" aria-current="page"' : (hide ? ' class="hide-sm"' : ''));
    return `<a href="${href}"${attrs}>${label}</a>`;
  };
  return `<header class="site-header"><div class="wrap"><a class="logo" href="${root}index.html">Tools<span>Website</span></a>` +
    `<nav class="site-nav" aria-label="Main"><a href="${root}index.html#all-tools">All Tools</a>` +
    link('pdf-image', 'PDF &amp; Image', true) + link('finance', 'Finance', true) + link('dev', 'Dev Tools', true) + `</nav></div></header>`;
}

function footerHtml(root) {
  const cats = Object.keys(CATS).filter(k => READY.some(t => t.category === k));
  const catLinks = cats.map(k => `<a href="${hubSlugs.includes(k) ? root + hubFile(k) : root + 'index.html#all-tools'}">${esc(CATS[k].label)}</a>`).join('');
  return `<footer class="site-footer"><div class="wrap"><div><strong>${esc(SITE.name)}</strong><br>Free tools that run in your browser. Your files never leave your device.</div>` +
    (catLinks ? `<nav aria-label="Categories">${catLinks}</nav>` : '') +
    `<nav aria-label="Company"><a href="${root}about.html">About</a><a href="${root}contact.html">Contact</a></nav>` +
    `<nav aria-label="Legal"><a href="${root}privacy-policy.html">Privacy Policy</a><a href="${root}terms.html">Terms</a><a href="${root}disclaimer.html">Disclaimer</a></nav></div></footer>`;
}

function railHtml(side, root) {
  if (side === 'left') return `<div class="rail-sticky" aria-label="Advertisement">${adBox('sky')}</div>`;
  const pop = READY.slice(0, 5);
  const popHtml = pop.length ? '<section class="rail-card"><h2>Popular tools</h2><ol>' + pop.map(t =>
    `<li><a href="${root}tools/${t.slug}.html"><span>${esc(t.name)}</span><span aria-hidden="true">→</span></a></li>`).join('') + '</ol></section>' : '';
  return `<div class="rail-inner">${adBox('rect')}${popHtml}<div class="rail-sticky">${adBox('tall')}</div></div>`;
}

function relatedHtml(slug, root) {
  const me = bySlug[slug];
  const list = READY.filter(t => t.slug !== slug && (!me || t.category === me.category)).slice(0, 6);
  if (!list.length) return '';
  return `<section class="related-wrap"><h2 class="section-title">Related tools</h2><div class="related">${list.map(t => toolCard(t, root)).join('')}</div></section>`;
}

function crumbs(file, title) {
  const root = rootOf(file); const slug = path.basename(file, '.html');
  const items = [{ name: 'Home', href: root + 'index.html', abs: url('index.html') }];
  let tool = file.startsWith('tools/') ? bySlug[slug] : null;
  if (tool) {
    const hub = hubSlugs.includes(tool.category);
    items.push({ name: CATS[tool.category].label, href: hub ? root + hubFile(tool.category) : root + 'index.html#all-tools', abs: hub ? url(hubFile(tool.category)) : url('index.html') });
    items.push({ name: tool.name });
  } else if (file.startsWith('category/')) {
    items.push({ name: CATS[slug].label });
  } else return null;
  return items;
}

// ── page type + per-page data ────────────────────────────────────────────
function pageInfo(file, html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  const slug = path.basename(file, '.html');
  const isTool = file.startsWith('tools/');
  const tool = isTool ? bySlug[slug] : null;
  const indexable = !(file === '404.html') && (isTool ? !!(tool && tool.ready) : true);
  return { file, title: unesc(title), desc: unesc(desc), slug, isTool, tool, indexable, root: rootOf(file) };
}

function headHtml(pi, html, lastmod) {
  const root = pi.root, canon = url(pi.file);
  const robots = pi.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow';
  let ld = [];
  const crumb = crumbs(pi.file, pi.title);
  if (pi.isTool && pi.tool) {
    ld.push({ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: pi.tool.name, url: canon, description: pi.desc,
      applicationCategory: (CAT_COPY[pi.tool.category] || {}).app || 'UtilitiesApplication', operatingSystem: 'Any (web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, dateModified: lastmod, inLanguage: 'en' });
    const faqs = [...html.matchAll(/<details class="faq"><summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)];
    if (faqs.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(m => ({ '@type': 'Question', name: strip(m[1]), acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) } })) });
  }
  if (pi.file === 'index.html') {
    ld.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: url('index.html') });
    ld.push({ '@context': 'https://schema.org', '@type': 'Organization', name: SITE.name, url: url('index.html') });
  }
  if (pi.file.startsWith('category/')) {
    const k = pi.slug;
    ld.push({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: pi.title, url: canon,
      mainEntity: { '@type': 'ItemList', itemListElement: READY.filter(t => t.category === k).map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: url('tools/' + t.slug + '.html'), name: t.name })) } });
  }
  if (crumb) {
    ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumb.map((c, i) => {
      const o = { '@type': 'ListItem', position: i + 1, name: c.name }; if (i < crumb.length - 1) o.item = c.abs; else o.item = canon; return o; }) });
  }
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<meta name="theme-color" content="${SITE.themeColor}">`,
    `<meta name="robots" content="${robots}">`,
    `<link rel="canonical" href="${canon}">`,
    `<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">`,
    `<meta property="og:type" content="${pi.isTool ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="${esc(SITE.name)}">`,
    `<meta property="og:locale" content="${SITE.locale}">`,
    `<meta property="og:title" content="${esc(pi.title)}">`,
    `<meta property="og:description" content="${esc(pi.desc)}">`,
    `<meta property="og:url" content="${canon}">`,
    '<meta name="twitter:card" content="summary">',
    `<link rel="preload" href="${root}core/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="preload" href="${root}core/fonts/space-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>`,
    `<link rel="stylesheet" href="${root}core/design-system.css">`,
    ...ld.map(json)
  ].join('\n');
}

// ── marker stamping ──────────────────────────────────────────────────────
function stamp(html, pi, lastmod) {
  const root = pi.root;
  const rep = (name, fn) => {
    const re = new RegExp(`<!--@${name}([^>]*?)-->[\\s\\S]*?<!--/@${name}-->`, 'g');
    html = html.replace(re, (m, args) => `<!--@${name}${args}-->${fn(args.trim())}<!--/@${name}-->`);
  };
  const activeCat = pi.tool ? pi.tool.category : (pi.file.startsWith('category/') ? pi.slug : '');
  rep('header', () => headerHtml(root, activeCat));
  rep('footer', () => footerHtml(root));
  rep('rail', a => railHtml(a, root));
  rep('ad', a => `<div class="ad-inline">${adBox(a)}</div>`);
  rep('related', () => relatedHtml(pi.slug, root));
  rep('crumbs', () => {
    const c = crumbs(pi.file, pi.title); if (!c) return '';
    return `<nav class="crumbs" aria-label="Breadcrumb">` + c.map((x, i) => i < c.length - 1 ? `<a href="${x.href}">${esc(x.name)}</a> › ` : esc(x.name)).join('') + `</nav>`;
  });
  rep('cats', () => {
    let h = `<button class="cat-pill active" data-c="all">All (${READY.length})</button>`;
    Object.keys(CATS).forEach(k => { const n = READY.filter(t => t.category === k).length; if (n) h += `<button class="cat-pill" data-c="${k}">${CATS[k].icon} ${esc(CATS[k].label)} (${n})</button>`; });
    return h;
  });
  rep('grid', () => READY.map(t => toolCard(t, root)).join(''));
  rep('hubgrid', () => READY.filter(t => t.category === pi.slug).map(t => toolCard(t, root)).join(''));
  rep('var', a => a === 'badge' ? `${READY.length} ${READY.length === 1 ? 'tool' : 'tools'} live · ${TOOLS.length} planned · No signup`
    : a === 'soon' ? `${TOOLS.length - READY.length} more tools are being added.`
    : a === 'contact' ? (SITE.contactEmail ? `<a href="mailto:${SITE.contactEmail}">${SITE.contactEmail}</a>` : '(email address will be added before launch)')
    : a === 'name' ? esc(SITE.name) : '');
  // head block: replaced as one unit (must stay first in <head>)
  html = html.replace(/<!--@head-->[\s\S]*?<!--\/@head-->/, () => `<!--@head-->\n${headHtml(pi, html, lastmod)}\n<!--/@head-->`);
  // inline tool links: <a data-tool="slug"> gets href only once that tool is live
  html = html.replace(/<a data-tool="([a-z0-9-]+)"(?: href="[^"]*")?>/g, (m, s) => bySlug[s] && bySlug[s].ready ? `<a data-tool="${s}" href="${root}tools/${s}.html">` : `<a data-tool="${s}">`);
  // ad-placeholder look on/off
  html = html.replace(/<html([^>]*?)>/, (m, attrs) => {
    attrs = attrs.replace(/\s*class="[^"]*"/, '');
    return `<html${attrs}${SITE.showAdPlaceholders ? ' class="show-ad-placeholders"' : ''}>`;
  });
  return html;
}

// ── category hub pages (generated) ───────────────────────────────────────
function hubSource(k) {
  const cc = CAT_COPY[k];
  return `<!doctype html>
<html lang="en" data-root="../">
<head>
<!--@head--><!--/@head-->
<title>${esc(cc.h1)} | ${esc(SITE.name)}</title>
<meta name="description" content="${esc(cc.intro.slice(0, 155))}">
</head>
<body>
<!--@header--><!--/@header-->
<div class="wrap layout">
<aside class="rail rail-left"><!--@rail left--><!--/@rail--></aside>
<main>
<!--@crumbs--><!--/@crumbs-->
<header class="tool-head"><h1>${esc(cc.h1)}</h1><p class="lede">${esc(cc.intro)}</p></header>
<div class="tool-grid"><!--@hubgrid--><!--/@hubgrid--></div>
<!--@ad inline--><!--/@ad-->
</main>
<aside class="rail rail-right"><!--@rail right--><!--/@rail--></aside>
</div>
<!--@footer--><!--/@footer-->
</body>
</html>
`;
}
fs.mkdirSync(path.join(ROOT, 'category'), { recursive: true });
Object.keys(CATS).forEach(k => {
  const f = path.join(ROOT, hubFile(k));
  if (hubSlugs.includes(k)) fs.writeFileSync(f, hubSource(k));
  else if (fs.existsSync(f)) fs.unlinkSync(f);
});

// ── process all pages ────────────────────────────────────────────────────
const listHtml = dir => fs.existsSync(path.join(ROOT, dir)) ? fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.html')).map(f => (dir ? dir + '/' : '') + f) : [];
const pages = [...listHtml(''), ...listHtml('tools'), ...listHtml('category')];
const errors = [], warns = [];
const E_ = (f, m) => errors.push(`${f}: ${m}`), W_ = (f, m) => warns.push(`${f}: ${m}`);
const E = E_, W = W_;
const infos = [];
const today = new Date().toISOString().slice(0, 10);

pages.forEach(file => {
  let html = read(file);
  const pi = pageInfo(file, html);
  const prev = cache[file] || { lastmod: today, hash: '' };
  // stamp twice: first pass with provisional lastmod, then final with the real one
  let out = stamp(html, pi, prev.lastmod);
  const bodyHash = crypto.createHash('sha1').update(out.replace(/"dateModified":"[^"]*"/, '')).digest('hex');
  const lastmod = bodyHash === prev.hash ? prev.lastmod : today;
  cache[file] = { lastmod, hash: bodyHash };
  out = stamp(html, pi, lastmod);
  if (out !== html) fs.writeFileSync(path.join(ROOT, file), out);
  infos.push({ pi, html: out, lastmod });
});
fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1) + '\n');

// ── sitemap + robots ─────────────────────────────────────────────────────
const entries = infos.filter(i => i.pi.indexable).map(i => {
  const f = i.pi.file;
  const pr = f === 'index.html' ? '1.0' : f.startsWith('category/') ? '0.9' : f.startsWith('tools/') ? '0.8' : '0.3';
  return { f, pr, lastmod: i.lastmod };
}).sort((a, b) => b.pr.localeCompare(a.pr) || a.f.localeCompare(b.f));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.map(e => `  <url><loc>${url(e.f)}</loc><lastmod>${e.lastmod}</lastmod><priority>${e.pr}</priority></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);

// ── audit ────────────────────────────────────────────────────────────────
const titles = {}, descs = {};
infos.forEach(({ pi, html }) => {
  const f = pi.file, live = pi.indexable;
  const E = live || !pi.isTool ? E_ : (f, m) => W_(f, '(draft) ' + m); // unfinished drafts (ready:false) only warn
  const count = (re) => (html.match(re) || []).length;
  if (!pi.title) E(f, 'missing <title>');
  if (pi.title.length > 60) W(f, `title is ${pi.title.length} chars (aim for <= 60)`);
  if (pi.title && pi.title.length < 25) W(f, `title is short (${pi.title.length} chars)`);
  if (!pi.desc) E(f, 'missing meta description');
  else if (pi.desc.length < 110 || pi.desc.length > 160) W(f, `meta description is ${pi.desc.length} chars (aim for 110-160)`);
  if (live) {
    (titles[pi.title] = titles[pi.title] || []).push(f);
    (descs[pi.desc] = descs[pi.desc] || []).push(f);
  }
  if (count(/<h1[\s>]/g) !== 1) E(f, `needs exactly one <h1> (found ${count(/<h1[\s>]/g)})`);
  if (/TODO|lorem ipsum|PLACEHOLDER/i.test(strip(html.replace(/<script[\s\S]*?<\/script>/g, '')))) E(f, 'contains TODO / lorem / placeholder text');
  // images
  [...html.matchAll(/<img\b[^>]*>/g)].forEach(m => {
    const tag = m[0];
    if (!/\balt="[^"]+"/.test(tag)) E(f, `image without alt text: ${tag.slice(0, 60)}`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) E(f, `image without width/height (causes layout shift): ${tag.slice(0, 60)}`);
    const src = (tag.match(/src="([^"]+)"/) || [])[1];
    if (src && !/^https?:/.test(src)) {
      const p = path.join(path.dirname(path.join(ROOT, f)), src);
      if (!fs.existsSync(p)) E(f, `missing image ${src}`); else if (fs.statSync(p).size > 150 * 1024) W(f, `image ${src} is ${(fs.statSync(p).size / 1024) | 0} KB (compress, aim for < 150 KB)`);
    }
  });
  // links + scripts
  [...html.replace(/<script(?![^>]*src=)[\s\S]*?<\/script>/g, '').matchAll(/(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)].forEach(m => {
    const l = m[1]; if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(l)) return;
    if (!fs.existsSync(path.join(path.dirname(path.join(ROOT, f)), l))) E(f, `broken link/asset: ${l}`);
  });
  [...html.matchAll(/<a data-tool="([a-z0-9-]+)">/g)].forEach(m => { if (live && !(bySlug[m[1]])) E(f, `data-tool points to unknown slug ${m[1]}`); });
  if (html.length > 100 * 1024) W(f, `HTML is ${(html.length / 1024) | 0} KB`);
  if (/<script[^>]+src=[^>]*>/.test(html) && /<script(?![^>]*(?:defer|type=))[^>]+src=/.test(html)) W(f, 'script without defer (blocks rendering)');

  if (pi.isTool && pi.tool) {
    const art = (html.match(/<article[\s\S]*?<\/article>/) || [''])[0];
    const words = strip(art).split(/\s+/).filter(Boolean).length;
    const faqs = count(/<details class="faq">/g);
    const internal = [...art.matchAll(/<a [^>]*href="[^"#]*\.html/g)].length + count(/class="tool-card"/g);
    infos.find(i => i.pi.file === f).stats = { words, faqs, internal };
    if (live) {
      if (words < 600) E(f, `article has ${words} words (need >= 600 for a ready tool)`);
      if (faqs < 3) E(f, `only ${faqs} FAQ items (need >= 3)`);
      if (!/class="widget"/.test(html)) E(f, 'no tool widget found');
      const js = (html.match(/<script src="([^"]+\.js)" defer>/g) || []).length;
      if (!js) W(f, 'no tool script referenced');
      if (!html.includes('class="privacy-note"')) W(f, 'no privacy note near the widget');
      if (!/<!--@related-->/.test(html)) W(f, 'no related-tools block');
    }
  }
  if (live && SITE.contactEmail === '' && /\bcontact\.html$/.test(f)) W(f, 'contactEmail is empty in site.json');
});
Object.entries(titles).forEach(([t, fs_]) => fs_.length > 1 && E(fs_.join(', '), `duplicate title "${t}"`));
Object.entries(descs).forEach(([t, fs_]) => fs_.length > 1 && E(fs_.join(', '), 'duplicate meta description'));
READY.forEach(t => { if (!exists(`tools/${t.slug}.html`)) E('registry', `${t.slug} is ready:true but tools/${t.slug}.html does not exist`); });
TOOLS.forEach(t => { if (!t.ready && exists(`tools/${t.slug}.html`)) W(`tools/${t.slug}.html`, 'page exists but registry has ready:false (page is noindex and not listed)'); });
if (!SITE.domainConfirmed) W('site.json', 'domain not confirmed yet: sitemap/canonical use ' + SITE.domain);

// ── report ───────────────────────────────────────────────────────────────
console.log(`Built ${pages.length} pages | ${READY.length}/${TOOLS.length} tools live | ${hubSlugs.length} category hubs | sitemap ${entries.length} URLs`);
infos.filter(i => i.stats).forEach(i => console.log(`  ${i.pi.file}: ${i.stats.words} words, ${i.stats.faqs} FAQs, ${i.stats.internal} internal links`));
warns.forEach(w => console.log('  WARN  ' + w));
errors.forEach(e => console.log('  ERROR ' + e));
console.log(errors.length ? `\n${errors.length} error(s) must be fixed before publishing.` : '\nAudit passed.');
process.exit(errors.length ? 1 : 0);
