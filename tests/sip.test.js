const assert = require('assert');
const { calcSIP, schedule, inrWords, LIMITS } = require('../tools/sip-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python calculation (annuity-due formula), not from this code.
t('5,000/month, 12%, 10 years -> 11,61,695.38', () => { const r = calcSIP(5000, 12, 120); near(r.value, 1161695.3818, 0.001, 'value'); assert.strictEqual(r.invested, 600000); near(r.returns, 561695.3818, 0.001, 'returns'); });
t('1,000/month, 12%, 10 years -> 2,32,339.08', () => near(calcSIP(1000, 12, 120).value, 232339.0764, 0.001, 'value'));
t('10,000/month, 12%, 15 years -> 50,45,759.995', () => near(calcSIP(10000, 12, 180).value, 5045759.9951, 0.001, 'value'));
t('25,000/month, 12%, 20 years -> 2,49,78,697.98', () => near(calcSIP(25000, 12, 240).value, 24978697.976, 0.001, 'value'));
t('2,000/month, 10%, 5 years -> 1,56,164.76', () => near(calcSIP(2000, 10, 60).value, 156164.7622, 0.001, 'value'));
t('0% return: value equals invested', () => { const r = calcSIP(12000, 0, 12); assert.strictEqual(r.value, 144000); assert.strictEqual(r.returns, 0); });
t('1 month at 12%: P * 1.01', () => near(calcSIP(1000, 12, 1).value, 1010, 1e-9, 'value'));
t('invested = monthly * months', () => assert.strictEqual(calcSIP(3500, 9, 84).invested, 3500 * 84));
t('longer is better: 20y value > 10y value', () => assert.ok(calcSIP(5000, 12, 240).value > calcSIP(5000, 12, 120).value));
t('part-year tenure (30 months) works', () => assert.ok(calcSIP(5000, 12, 30).value > 150000));
t('string numbers accepted (form values)', () => near(calcSIP('5000', '12', '120').value, 1161695.3818, 0.001, 'value'));
t('max tenure 600 months works', () => assert.ok(isFinite(calcSIP(5000, 12, LIMITS.maxMonths).value)));
t('invalid inputs return null', () => {
  [[0, 12, 120], [-1, 12, 120], [1e9, 12, 120], [5000, -1, 120], [5000, 61, 120], [5000, 12, 0], [5000, 12, 601], [5000, 12, 12.5],
   ['abc', 12, 120], ['', 12, 120], [5000, '', 120], [5000, 12, ''], [5000, '  ', 120], [null, 12, 120], [true, 12, 120], [NaN, 12, 120]]
    .forEach(a => assert.strictEqual(calcSIP(...a), null, JSON.stringify(a)));
});
t('schedule: one row per year, last row equals final result', () => {
  const rows = schedule(5000, 12, 120), r = calcSIP(5000, 12, 120);
  assert.strictEqual(rows.length, 10); near(rows[9].value, r.value, 1e-6, 'last value'); assert.strictEqual(rows[9].invested, 600000);
});
t('schedule: year 1, 2, 3 values (5,000 at 12%)', () => {
  const rows = schedule(5000, 12, 36); near(rows[0].value, 64046.6402, 0.001, 'y1'); near(rows[1].value, 136215.9975, 0.001, 'y2'); near(rows[2].value, 217538.2357, 0.001, 'y3');
});
t('schedule: 30 months gives 3 rows ending at month 30', () => { const rows = schedule(5000, 12, 30); assert.strictEqual(rows.length, 3); assert.strictEqual(rows[2].invested, 150000); });
t('schedule: values strictly increase', () => { const v = schedule(5000, 12, 120).map(x => x.value); v.forEach((x, i) => i && assert.ok(x > v[i - 1])); });
t('schedule returns null for invalid input', () => assert.strictEqual(schedule(0, 12, 120), null));
t('inrWords', () => { assert.strictEqual(inrWords(5000), '5 Thousand'); assert.strictEqual(inrWords(100000), '1 Lakh'); assert.strictEqual(inrWords(10000000), '1 Crore'); assert.strictEqual(inrWords(''), ''); });
console.log(`SIP: ${n} tests passed`);
