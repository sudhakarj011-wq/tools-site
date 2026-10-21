const assert = require('assert');
const { calcSale, calcPct, pctText } = require('../tools/discount-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation, not from this code.
t('1,999 with 15% off -> 1,699.15, saves 299.85', () => { const r = calcSale(1999, 15); near(r.final, 1699.15, 1e-9, 'f'); near(r.saved, 299.85, 1e-9, 's'); near(r.effectivePct, 15, 1e-9, 'e'); });
t('2,500 with 20% then 10% extra -> 1,800, total 28% off', () => { const r = calcSale(2500, 20, 10); near(r.final, 1800, 1e-9, 'f'); near(r.afterFirst, 2000, 1e-9, 'a'); near(r.saved, 700, 1e-9, 's'); near(r.effectivePct, 28, 1e-9, 'e'); });
t('999 with 50% off -> 499.50', () => near(calcSale(999, 50).final, 499.5, 1e-9, 'f'));
t('4,999 with 30% + 20% -> 2,799.44, total 44%', () => { const r = calcSale(4999, 30, 20); near(r.final, 2799.44, 1e-9, 'f'); near(r.saved, 2199.56, 1e-9, 's'); near(r.effectivePct, 44, 1e-9, 'e'); });
t('100% off -> 0', () => { const r = calcSale(1000, 100); assert.strictEqual(r.final, 0); assert.strictEqual(r.saved, 1000); });
t('0% off -> same price', () => { const r = calcSale(1000, 0); assert.strictEqual(r.final, 1000); assert.strictEqual(r.saved, 0); });
t('1,500 with 12.5% + 5% -> 1,246.875', () => near(calcSale(1500, 12.5, 5).final, 1246.875, 1e-9, 'f'));
t('100 with 33.33% -> 66.67', () => near(calcSale(100, 33.33).final, 66.67, 1e-9, 'f'));
t('12,345.67 with 18% + 7.5% -> 9,364.190695', () => { const r = calcSale(12345.67, 18, 7.5); near(r.final, 9364.190695, 1e-6, 'f'); near(r.effectivePct, 24.15, 1e-9, 'e'); });
t('100% then 50% -> 0', () => assert.strictEqual(calcSale(2500, 100, 50).final, 0));
t('two discounts are not added: 20% + 10% is 28%, not 30%', () => assert.ok(calcSale(1000, 20, 10).effectivePct < 30));
t('order does not matter: 20% then 10% equals 10% then 20%', () => near(calcSale(1234, 20, 10).final, calcSale(1234, 10, 20).final, 1e-9, 'f'));
t('extra discount defaults to 0 when omitted; string numbers accepted', () => { near(calcSale('1999', '15').final, 1699.15, 1e-9, 'f'); near(calcSale(2500, 20).final, 2000, 1e-9, 'f'); });
t('sale invalid inputs return null', () => {
  [[0, 10], [-5, 10], [1e11, 10], [100, -1], [100, 101], [100, 10, -1], [100, 10, 101], ['', 10], [100, ''], [100, 10, ''], [null, 10], [100, null], [100, 10, null], [true, 10], [100, true], ['abc', 10], [100, 'x'], [NaN, 10], [Infinity, 10]]
    .forEach(a => assert.strictEqual(calcSale(...a), null, JSON.stringify(a)));
});
t('discount % from 2,000 -> 1,500 = 25%, saves 500', () => { const r = calcPct(2000, 1500); near(r.pct, 25, 1e-9, 'p'); near(r.saved, 500, 1e-9, 's'); });
t('1,299 -> 999 = 23.0947%', () => near(calcPct(1299, 999).pct, 23.094688221709, 1e-9, 'p'));
t('500 -> 500 = 0%', () => assert.strictEqual(calcPct(500, 500).pct, 0));
t('999 -> 0 = 100%', () => assert.strictEqual(calcPct(999, 0).pct, 100));
t('4,999 -> 3,499 = 30.006%', () => near(calcPct(4999, 3499).pct, 30.00600120024, 1e-9, 'p'));
t('250 -> 199.50 = 20.2%, saves 50.50', () => { const r = calcPct(250, 199.5); near(r.pct, 20.2, 1e-9, 'p'); near(r.saved, 50.5, 1e-9, 's'); });
t('pct invalid inputs return null (sale above original, zero original, empty)', () => {
  [[100, 101], [0, 0], [-1, 5], [100, -1], ['', 5], [100, ''], [null, 5], [100, null], [true, 5], ['abc', 5], [1e11, 5], [NaN, 5]].forEach(a => assert.strictEqual(calcPct(...a), null, JSON.stringify(a)));
});
t('pctText trims decimals and groups digits', () => { assert.strictEqual(pctText(28), '28'); assert.strictEqual(pctText(23.0946882), '23.0947'); assert.strictEqual(pctText(30.006), '30.006'); assert.strictEqual(pctText(-0.00001), '0'); });
console.log(`Discount: ${n} tests passed`);
