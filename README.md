# ToolsWebsite: static HTML/CSS/JS

Run locally: `node scripts/build.js` then `python3 -m http.server 8000` and open http://localhost:8000
(or `npm run build` and `npm run serve`). No dependencies to install.

Deploy: Netlify / Cloudflare Pages / GitHub Pages. Build command `node scripts/build.js`, publish directory `.` (see `netlify.toml`).

## Add a new tool
1. `node scripts/new-tool.js <slug>` (slug must exist in `core/registry.js`)
2. Write the widget, `tools/<slug>.js` logic (test the pure function in node), the article, and screenshots in `tools/img/`
3. Set `ready: true` in `core/registry.js`
4. `node scripts/build.js` must print `Audit passed`. It updates sitemap, related tools, homepage, category hubs and JSON-LD for you.

See `SEO-PLAYBOOK.md` for the rules and `TASKS.md` for status.
