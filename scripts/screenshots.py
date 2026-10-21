#!/usr/bin/env python3
"""Capture the 4 how-to screenshots for a tool page (needs: pip install playwright pillow; playwright install chromium).
Usage: python3 scripts/screenshots.py <slug>
Edit STEPS below for a new tool: each step = (file suffix, [CSS selectors to outline], open the .sched details?)."""
import sys, os, subprocess, time, re
from playwright.sync_api import sync_playwright
from PIL import Image

STEPS = {
  'emi-calculator': [('step1', ['#amount-wrap', '#rate-wrap'], False), ('step2', ['#tenure-wrap', '#unit-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'fd-calculator': [('step1', ['#amount-wrap', '#rate-wrap'], False), ('step2', ['#tenure-wrap', '#unit-wrap', '#comp-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'ppf-calculator': [('step1', ['#mode-wrap', '#amount-wrap'], False), ('step2', ['#rate-wrap', '#tenure-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'income-tax-calculator': [('step1', ['#gross-wrap', '#age-wrap', '#sal-wrap'], False), ('step2', ['#ded-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'compound-interest': [('step1', ['#amount-wrap', '#rate-wrap'], False), ('step2', ['#tenure-wrap', '#unit-wrap', '#comp-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'simple-interest': [('step1', ['#amount-wrap', '#rate-wrap'], False), ('step2', ['#tenure-wrap', '#unit-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'percentage-calculator': [('step1', ['#mode-wrap'], False), ('step2', ['#inputs-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'age-calculator': [('step1', ['#dob-wrap'], False), ('step2', ['#ason-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'discount-calculator': [('step1', ['#mode-wrap'], False), ('step2', ['#inputs-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
  'sip-calculator': [('step1', ['#amount-wrap'], False), ('step2', ['#rate-wrap', '#tenure-wrap'], False), ('step3', ['#out'], False), ('step4', ['.sched summary'], True)],
}
PRE = {'age-calculator': "()=>{const f=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};f('dob','1995-08-15');f('ason','2026-10-20')}"}
slug = sys.argv[1]; root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
srv = subprocess.Popen(['python3', '-m', 'http.server', '8771', '--directory', root], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
html = open(f'{root}/tools/{slug}.html').read()
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--lang=en-IN']); pg = b.new_page(viewport={'width': 760, 'height': 1200}, device_scale_factor=2, locale='en-IN')
        pg.goto(f'http://localhost:8771/tools/{slug}.html'); pg.wait_for_load_state('networkidle')
        if slug in PRE: pg.evaluate(PRE[slug])
        pg.add_style_tag(content='*{caret-color:transparent!important} .widget{margin:12px}'); pg.wait_for_timeout(300)
        for suffix, sels, open_sched in STEPS[slug]:
            pg.evaluate("document.querySelectorAll('[data-hl]').forEach(e=>{e.style.outline='';e.removeAttribute('data-hl')})")
            for s in sels:
                pg.evaluate("s=>{const e=document.querySelector(s);e.setAttribute('data-hl','1');e.style.outline='3px solid #B45309';e.style.outlineOffset='6px';e.style.borderRadius='12px'}", s)
            pg.evaluate(f"document.querySelector('details.sched').open={'true' if open_sched else 'false'}")
            box = pg.locator('.widget').bounding_box()
            name = f'{slug}-{suffix}'
            png = f'{root}/tools/img/{name}.png'
            pg.screenshot(path=png, full_page=True, clip={'x': box['x'] - 14, 'y': box['y'] - 14, 'width': box['width'] + 28, 'height': box['height'] + 28})
            im = Image.open(png).convert('RGB'); w, h = im.size
            im.save(png[:-4] + '.webp', 'WEBP', quality=82, method=6); os.remove(png)
            html = re.sub(r'(src="img/%s\.webp" width=")\d+(" height=")\d*"' % re.escape(name), r'\g<1>%d\g<2>%d"' % (w // 2, h // 2), html)
            print(name, w // 2, h // 2, os.path.getsize(png[:-4] + '.webp') // 1024, 'KB')
        b.close()
finally:
    srv.terminate()
open(f'{root}/tools/{slug}.html', 'w').write(html)
