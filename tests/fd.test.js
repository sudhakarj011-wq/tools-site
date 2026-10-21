const assert = require('assert');
const { calcFD, schedule, inrWords, LIMITS } = require('../tools/fd-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python calculation, not from this code.
t('1L, 7%, 5y, quarterly -> 1,41,477.82', () => { const r = calcFD(100000, 7, 60, 4); near(r.value, 141477.8196, 0.001, 'value'); near(r.interest, 41477.8196, 0.001, 'interest'); });
t('5L, 7.5%, 3y, quarterly -> 6,24,858.19', () => near(calcFD(500000, 7.5, 36, 4).value, 624858.1883, 0.001, 'value'));
t('10L, 6.8%, 2y, quarterly -> 11,44,373.05', () => near(calcFD(1000000, 6.8, 24, 4).value, 1144373.0547, 0.001, 'value'));
t('2L, 7.25%, 10y, quarterly -> 4,10,274.06', () => near(calcFD(200000, 7.25, 120, 4).value, 410274.0625, 0.001, 'value'));
t('compounding: monthly 1,41,762.53', () => near(calcFD(100000, 7, 60, 12).value, 141762.526, 0.001, 'value'));
t('compounding: half-yearly 1,41,059.88', () => near(calcFD(100000, 7, 60, 2).value, 141059.8761, 0.001, 'value'));
t('compounding: yearly 1,40,255.17', () => near(calcFD(100000, 7, 60, 1).value, 140255.1731, 0.001, 'value'));
t('more frequent compounding gives more', () => { const v = [1, 2, 4, 12].map(f => calcFD(100000, 7, 60, f).value); v.forEach((x, i) => i && assert.ok(x > v[i - 1])); });
t('18 months, 3L, 6.5%, monthly -> 3,30,636.43', () => near(calcFD(300000, 6.5, 18, 12).value, 330636.4263, 0.001, 'value'));
t('0% rate: value equals deposit', () => { const r = calcFD(50000, 0, 12, 4); assert.strictEqual(r.value, 50000); assert.strictEqual(r.interest, 0); });
t('yearly compounding, 1 year: P * (1 + r)', () => near(calcFD(100000, 8, 12, 1).value, 108000, 1e-6, 'value'));
t('string numbers accepted (form values, freq as string)', () => near(calcFD('100000', '7', '60', '4').value, 141477.8196, 0.001, 'value'));
t('max tenure works', () => assert.ok(isFinite(calcFD(100000, 7, LIMITS.maxMonths, 4).value)));
t('invalid inputs return null', () => {
  [[0, 7, 60, 4], [-1, 7, 60, 4], [1e11, 7, 60, 4], [1000, -1, 60, 4], [1000, 31, 60, 4], [1000, 7, 0, 4], [1000, 7, 361, 4], [1000, 7, 12.5, 4],
   [1000, 7, 60, 3], [1000, 7, 60, 0], [1000, 7, 60, ''], ['abc', 7, 60, 4], ['', 7, 60, 4], [1000, '', 60, 4], [1000, 7, '', 4], [null, 7, 60, 4], [true, 7, 60, 4], [NaN, 7, 60, 4]]
    .forEach(a => assert.strictEqual(calcFD(...a), null, JSON.stringify(a)));
});
t('schedule: one row per year, last row equals final value', () => { const rows = schedule(100000, 7, 60, 4); assert.strictEqual(rows.length, 5); near(rows[4].value, 141477.8196, 0.001, 'last'); });
t('schedule: years 1, 2, 3 (1L at 7% quarterly)', () => { const r = schedule(100000, 7, 36, 4); near(r[0].value, 107185.9031, 0.001, 'y1'); near(r[1].value, 114888.1783, 0.001, 'y2'); near(r[2].value, 123143.9315, 0.001, 'y3'); });
t('schedule: 18 months gives 2 rows, last at month 18', () => { const r = schedule(300000, 6.5, 18, 12); assert.strictEqual(r.length, 2); near(r[1].value, 330636.4263, 0.001, 'last'); });
t('schedule returns null for invalid input', () => assert.strictEqual(schedule(0, 7, 60, 4), null));
t('inrWords', () => { assert.strictEqual(inrWords(100000), '1 Lakh'); assert.strictEqual(inrWords(12500000), '1.25 Crore'); assert.strictEqual(inrWords(''), ''); });
console.log(`FD: ${n} tests passed`);
