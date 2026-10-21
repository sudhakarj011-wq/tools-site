# Browser test for the EMI page. Usage: python3 tests/browser-emi.py   (needs: pip install playwright)
import subprocess, time, sys, os
from playwright.sync_api import sync_playwright
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
srv = subprocess.Popen(['python3', '-m', 'http.server', '8768', '--directory', root], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = 'http://localhost:8768/tools/emi-calculator.html'
fails = []
def check(name, cond, extra=''):
    print(('  ok  ' if cond else '  FAIL ') + name + (f'  [{extra}]' if (extra and not cond) else ''))
    if not cond: fails.append(name)
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1280, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
        errs = []; bad = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('response', lambda r: bad.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        pg.goto(URL); pg.wait_for_load_state('networkidle')
        txt = lambda: pg.inner_text('#out')
        check('default result: EMI 20,758.36', '₹20,758.36' in txt(), txt()[:80])
        check('default: total interest 2,45,501.31', '₹2,45,501.31' in txt())
        check('amount words show "= 10 Lakh"', pg.inner_text('#amount-words') == '= 10 Lakh')
        # type a new amount
        pg.fill('#amount', '5000000'); pg.fill('#rate', '8.5'); pg.fill('#tenure', '20')
        check('50L, 8.5%, 20y -> 43,391.16', '₹43,391.16' in txt(), txt()[:60])
        check('amount words: 50 Lakh', pg.inner_text('#amount-words') == '= 50 Lakh')
        # months toggle converts 20 years -> 240 months and keeps EMI
        pg.click('#unit button[data-v="months"]')
        check('toggle to months converts tenure to 240', pg.input_value('#tenure') == '240')
        check('EMI unchanged after unit switch', '₹43,391.16' in txt())
        check('tenure label says months', 'months' in pg.inner_text('#tenure-l'))
        pg.fill('#tenure', '18'); pg.fill('#amount', '300000'); pg.fill('#rate', '14')
        check('3L, 14%, 18 months result shown', pg.is_visible('#out') and '₹' in txt())
        pg.click('#unit button[data-v="years"]')
        check('toggle back to years rounds 18 months -> 2 years', pg.input_value('#tenure') == '2')
        # sliders
        pg.fill('#amount', '1000000'); pg.fill('#rate', '9'); pg.fill('#tenure', '5')
        pg.eval_on_selector('#amount-r', "e=>{e.value=2000000;e.dispatchEvent(new Event('input',{bubbles:true}))}")
        check('amount slider updates number box', pg.input_value('#amount') == '2000000')
        check('slider move recalculates (20L, 9%, 5y -> 41,516.71)', '₹41,516.71' in txt(), txt()[:60])
        # number outside slider range keeps working
        pg.fill('#amount', '30000000')
        check('value above slider max still calculates', pg.is_visible('#out') and '₹' in txt())
        # invalid and empty
        pg.fill('#rate', '75')
        check('rate 75% shows hint and hides result', pg.is_visible('#hint') and not pg.is_visible('#out'))
        pg.fill('#rate', '')
        check('empty rate hides result, no scary hint', not pg.is_visible('#out') and not pg.is_visible('#hint'))
        pg.fill('#rate', '0'); pg.fill('#amount', '120000'); pg.fill('#tenure', '1')
        check('0% rate: EMI 10,000.00', '₹10,000.00' in txt(), txt()[:60])
        pg.fill('#rate', '9'); pg.fill('#tenure', '2.5')
        check('2.5 years (= 30 months) is accepted', pg.is_visible('#out') and not pg.is_visible('#hint'))
        pg.fill('#tenure', '2.55')
        check('2.55 years (not a whole number of months) shows hint', pg.is_visible('#hint'))
        pg.fill('#tenure', '51')
        check('51 years (612 months) rejected', pg.is_visible('#hint'))
        pg.fill('#tenure', '50')
        check('50 years accepted', pg.is_visible('#out'))
        # schedule + copy
        pg.fill('#amount', '1000000'); pg.fill('#tenure', '5')
        pg.click('.sched summary')
        rows = pg.locator('.sched tbody tr').count()
        check('schedule has 5 rows', rows == 5, str(rows))
        check('schedule last balance is ₹0', pg.locator('.sched tbody tr').last.inner_text().strip().endswith('₹0'))
        pg.click('#copy'); pg.wait_for_timeout(200)
        clip = pg.evaluate('navigator.clipboard.readText()')
        check('Copy result puts summary on clipboard', 'EMI ₹20,758.36' in clip and 'Total interest' in clip, clip)
        check('no JS errors / failed requests', not errs and not bad, str(errs + bad))
        # layout
        for w in (1440, 1280, 1024, 390):
            q = b.new_page(viewport={'width': w, 'height': 900}); q.goto(URL); q.wait_for_load_state('networkidle')
            sw = q.evaluate('document.documentElement.scrollWidth')
            check(f'no horizontal scroll at {w}px', sw <= w, str(sw))
            if w == 390:
                q.click('.sched summary')
                check('schedule table scrolls inside its box on mobile', q.evaluate("document.documentElement.scrollWidth") <= 390)
                tt = q.evaluate("[...document.querySelectorAll('.widget input:not([type=range]), .widget .seg button, .widget .btn')].every(e=>e.getBoundingClientRect().height>=44)")
                check('inputs and buttons are >= 44px tall on mobile', tt)
            q.close()
        b.close()
finally:
    srv.terminate()
print('\nFAILED: ' + ', '.join(fails) if fails else '\nAll browser checks passed.')
sys.exit(1 if fails else 0)
