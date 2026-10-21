const assert = require('assert');
const { calcCI, schedule, inrWords, LIMITS } = require('../tools/compound-interest.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation, not from this code.
t('1L, 10%, 5y, yearly -> 1,61,051', () => { const r = calcCI(100000, 10, 60, 1); near(r.value, 161051, 1e-6, 'value'); near(r.interest, 61051, 1e-6, 'interest'); });
t('1L, 10%, 5y, monthly -> 1,64,530.89', () => near(calcCI(100000, 10, 60, 12).value, 164530.8935, 0.001, 'value'));
t('1L, 10%, 5y, daily -> 1,64,860.84', () => near(calcCI(100000, 10, 60, 365).value, 164860.8369, 0.001, 'value'));
t('50k, 8%, 3y, quarterly -> 63,412.09', () => near(calcCI(50000, 8, 36, 4).value, 63412.0897, 0.001, 'value'));
t('2L, 6.5%, 18 months, half-yearly -> 2,20,140.62', () => near(calcCI(200000, 6.5, 18, 2).value, 220140.6156, 0.001, 'value'));
t('1L, 12%, 10y, monthly -> 3,30,038.69', () => near(calcCI(100000, 12, 120, 12).value, 330038.6895, 0.001, 'value'));
t('10k, 5%, 6 months, yearly (part year) -> 10,246.95', () => near(calcCI(10000, 5, 6, 1).value, 10246.9508, 0.001, 'value'));
t('2.5L, 7.5%, 25y, monthly -> 16,20,720.11', () => near(calcCI(250000, 7.5, 300, 12).value, 1620720.112, 0.001, 'value'));
t('100% rate, 1 year, daily -> 2,714.57 on 1,000', () => near(calcCI(1000, 100, 12, 365).value, 2714.5675, 0.001, 'value'));
t('0% rate: value equals principal, EAR 0', () => { const r = calcCI(100000, 0, 60, 12); assert.strictEqual(r.value, 100000); assert.strictEqual(r.interest, 0); assert.strictEqual(r.ear, 0); });
t('simple interest: 1L at 10% for 5y = 50,000; extra from compounding = 11,051 (yearly)', () => { const r = calcCI(100000, 10, 60, 1); near(r.simpleInterest, 50000, 1e-6, 'simple'); near(r.interest - r.simpleInterest, 11051, 1e-6, 'extra'); });
t('simple interest uses months/12: 6 months at 5% on 10k = 250', () => near(calcCI(10000, 5, 6, 1).simpleInterest, 250, 1e-9, 'simple'));
t('effective annual rate: 10% monthly 10.4713, daily 10.5156, yearly 10, 8% quarterly 8.2432', () => {
  near(calcCI(1000, 10, 12, 12).ear, 10.471307, 1e-5, 'monthly'); near(calcCI(1000, 10, 12, 365).ear, 10.515578, 1e-5, 'daily');
  near(calcCI(1000, 10, 12, 1).ear, 10, 1e-9, 'yearly'); near(calcCI(1000, 8, 12, 4).ear, 8.243216, 1e-5, 'quarterly');
});
t('more frequent compounding gives more', () => { const v = [1, 2, 4, 12, 365].map(f => calcCI(100000, 10, 60, f).value); v.forEach((x, i) => i && assert.ok(x > v[i - 1])); });
t('string numbers accepted (form values, freq as string)', () => near(calcCI('100000', '10', '60', '12').value, 164530.8935, 0.001, 'value'));
t('max tenure (600 months) works', () => assert.ok(isFinite(calcCI(100000, 10, LIMITS.maxMonths, 12).value)));
t('invalid inputs return null', () => {
  [[0, 10, 60, 12], [-1, 10, 60, 12], [1e11, 10, 60, 12], [1000, -1, 60, 12], [1000, 101, 60, 12], [1000, 10, 0, 12], [1000, 10, 601, 12], [1000, 10, 12.5, 12],
   [1000, 10, 60, 3], [1000, 10, 60, 0], [1000, 10, 60, ''], ['abc', 10, 60, 12], ['', 10, 60, 12], [1000, '', 60, 12], [1000, 10, '', 12], [null, 10, 60, 12], [true, 10, 60, 12], [NaN, 10, 60, 12]]
    .forEach(a => assert.strictEqual(calcCI(...a), null, JSON.stringify(a)));
});
t('schedule: years 1-3 (1L at 10% monthly)', () => { const r = schedule(100000, 10, 36, 12); assert.strictEqual(r.length, 3); near(r[0].value, 110471.3067, 0.001, 'y1'); near(r[1].value, 122039.0961, 0.001, 'y2'); near(r[2].value, 134818.1842, 0.001, 'y3'); });
t('schedule: 18 months gives 2 rows, last at month 18', () => { const r = schedule(200000, 6.5, 18, 2); assert.strictEqual(r.length, 2); near(r[1].value, 220140.6156, 0.001, 'last'); });
t('schedule returns null for invalid input', () => assert.strictEqual(schedule(0, 10, 60, 12), null));
t('inrWords', () => { assert.strictEqual(inrWords(100000), '1 Lakh'); assert.strictEqual(inrWords(12500000), '1.25 Crore'); assert.strictEqual(inrWords(''), ''); });
console.log(`Compound interest: ${n} tests passed`);
