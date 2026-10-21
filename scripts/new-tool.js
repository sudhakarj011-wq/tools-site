#!/usr/bin/env node
/* Usage: node scripts/new-tool.js <slug>     (slug must already exist in core/registry.js)
   Creates tools/<slug>.html + tools/<slug>.js from the templates. Everything SEO-related
   (meta tags, JSON-LD, breadcrumbs, related tools, sitemap) is filled in by scripts/build.js. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/new-tool.js <slug>'); process.exit(1); }
const sb = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'core/registry.js'), 'utf8'), sb);
const t = sb.window.TW_TOOLS.find(x => x.slug === slug);
if (!t) { console.error(`"${slug}" is not in core/registry.js. Add it there first.`); process.exit(1); }
const htmlOut = path.join(ROOT, 'tools', slug + '.html'), jsOut = path.join(ROOT, 'tools', slug + '.js');
if (fs.existsSync(htmlOut)) { console.error(`tools/${slug}.html already exists.`); process.exit(1); }
const cat = sb.window.TW_CATEGORIES[t.category].label;
// Title <= 60 chars, description 110-160 chars: edit after generating if the audit warns.
const fill = s => s.replace(/{{NAME}}/g, t.name).replace(/{{SLUG}}/g, slug)
  .replace(/{{TITLE}}/g, `${t.name} Online (Free) | ToolsWebsite`.slice(0, 70))
  .replace(/{{DESC}}/g, t.description.replace(/"/g, '&quot;'));
fs.mkdirSync(path.join(ROOT, 'tools/img'), { recursive: true });
fs.writeFileSync(htmlOut, fill(fs.readFileSync(path.join(__dirname, 'templates/tool.html'), 'utf8')));
fs.writeFileSync(jsOut, fill(fs.readFileSync(path.join(__dirname, 'templates/tool.js'), 'utf8')));
console.log(`Created tools/${slug}.html and tools/${slug}.js (${cat}).\nNext: 1) write widget + logic + article  2) add screenshots to tools/img/${slug}-*.webp\n      3) set ready:true in core/registry.js  4) run: node scripts/build.js  (must say "Audit passed")`);
