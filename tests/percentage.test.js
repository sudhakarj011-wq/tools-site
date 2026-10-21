const assert = require('assert');
const { calcPct, fmt } = require('../tools/percentage-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation, not from this code.
const v = (m, a, b) => calcPct(m, a, b).value;
t('15% of 2000 = 300', () => near(v('of', 15, 2000), 300, 1e-9, 'v'));
t('7.5% of 240 = 18', () => near(v('of', 7.5, 240), 18, 1e-9, 'v'));
t('0.5% of 1000 = 5', () => near(v('of', 0.5, 1000), 5, 1e-9, 'v'));
t('120% of 50 = 60 (over 100% allowed)', () => near(v('of', 120, 50), 60, 1e-9, 'v'));
t('-10% of 200 = -20 (negative allowed)', () => near(v('of', -10, 200), -20, 1e-9, 'v'));
t('12.5% of 80 = 10', () => near(v('of', 12.5, 80), 10, 1e-9, 'v'));
t('45 is 25% of 180', () => near(v('is', 45, 180), 25, 1e-9, 'v'));
t('1 is 33.3333% of 3', () => near(v('is', 1, 3), 33.333333333333, 1e-9, 'v'));
t('50 is 10,000% of 0.5', () => near(v('is', 50, 0.5), 10000, 1e-6, 'v'));
t('0 is 0% of 5', () => assert.strictEqual(v('is', 0, 5), 0));
t('-5 is -25% of 20', () => near(v('is', -5, 20), -25, 1e-9, 'v'));
t('change 80 -> 100 = +25%, diff 20', () => { const r = calcPct('change', 80, 100); near(r.value, 25, 1e-9, 'v'); assert.strictEqual(r.diff, 20); });
t('change 100 -> 80 = -20%, diff -20', () => { const r = calcPct('change', 100, 80); near(r.value, -20, 1e-9, 'v'); assert.strictEqual(r.diff, -20); });
t('change 50 -> 50 = 0%', () => assert.strictEqual(v('change', 50, 50), 0));
t('change 3 -> 10 = 233.3333%', () => near(v('change', 3, 10), 233.333333333333, 1e-9, 'v'));
t('change 200 -> 0 = -100%', () => near(v('change', 200, 0), -100, 1e-9, 'v'));
t('change 2500 -> 3125 = 25%', () => near(v('change', 2500, 3125), 25, 1e-9, 'v'));
t('500 increased by 20% = 600, diff 100', () => { const r = calcPct('increase', 20, 500); near(r.value, 600, 1e-9, 'v'); near(r.diff, 100, 1e-9, 'd'); });
t('1000 increased by 18% = 1180', () => near(v('increase', 18, 1000), 1180, 1e-9, 'v'));
t('80 increased by 12.5% = 90', () => near(v('increase', 12.5, 80), 90, 1e-9, 'v'));
t('increase by 0% = same number', () => near(v('increase', 0, 100), 100, 1e-9, 'v'));
t('500 decreased by 20% = 400, diff 100', () => { const r = calcPct('decrease', 20, 500); near(r.value, 400, 1e-9, 'v'); near(r.diff, 100, 1e-9, 'd'); });
t('500 decreased by 100% = 0', () => near(v('decrease', 100, 500), 0, 1e-9, 'v'));
t('900 decreased by 33.3% = 600.3', () => near(v('decrease', 33.3, 900), 600.3, 1e-9, 'v'));
t('1999 decreased by 15% = 1699.15', () => near(v('decrease', 15, 1999), 1699.15, 1e-9, 'v'));
t('increase then decrease by the same % does not return to the start (100 +20% -20% = 96)', () => near(v('decrease', 20, v('increase', 20, 100)), 96, 1e-9, 'v'));
t('string numbers accepted (form values)', () => near(v('of', '15', '2000'), 300, 1e-9, 'v'));
t('invalid inputs return null', () => {
  [['is', 5, 0], ['change', 0, 10], ['change', -5, 10], ['change', 10, -1], ['increase', -1, 100], ['decrease', -1, 100], ['decrease', 101, 100], ['weekly', 1, 1], ['', 1, 1], [undefined, 1, 1],
   ['of', '', 5], ['of', 5, ''], ['of', null, 5], ['of', 5, null], ['of', true, 5], ['of', 'abc', 5], ['of', NaN, 5], ['of', Infinity, 5], ['of', 1e13, 5], ['of', 5, -1e13]]
    .forEach(a => assert.strictEqual(calcPct(...a), null, JSON.stringify(a)));
});
t('fmt: trims to 4 decimals, Indian grouping, no negative zero', () => {
  assert.strictEqual(fmt(33.3333333), '33.3333'); assert.strictEqual(fmt(1234567.5), '12,34,567.5'); assert.strictEqual(fmt(300), '300'); assert.strictEqual(fmt(-0.00001), '0'); assert.strictEqual(fmt(0.1 + 0.2), '0.3'); assert.strictEqual(fmt(-25), '-25');
});
console.log(`Percentage: ${n} tests passed`);
