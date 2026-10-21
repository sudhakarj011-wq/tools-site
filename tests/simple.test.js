const assert = require('assert');
const { calcSI, schedule, inrWords, LIMITS } = require('../tools/simple-interest.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation, not from this code.
t('50,000 at 8% for 3 years -> 12,000, total 62,000', () => { const r = calcSI(50000, 8, 3, 'years'); near(r.interest, 12000, 1e-9, 'i'); near(r.total, 62000, 1e-9, 't'); });
t('1L at 7.5% for 2.5 years -> 18,750', () => near(calcSI(100000, 7.5, 2.5, 'years').interest, 18750, 1e-9, 'i'));
t('25,000 at 12% for 18 months -> 4,500', () => near(calcSI(25000, 12, 18, 'months').interest, 4500, 1e-9, 'i'));
t('80,000 at 9% for 100 days -> 1,972.60', () => near(calcSI(80000, 9, 100, 'days').interest, 1972.60274, 1e-4, 'i'));
t('60,000 at 6% for 45 days -> 443.84', () => near(calcSI(60000, 6, 45, 'days').interest, 443.835616, 1e-4, 'i'));
t('10L at 6.5% for 5 years -> 3,25,000', () => near(calcSI(1000000, 6.5, 5, 'years').interest, 325000, 1e-6, 'i'));
t('12,345.67 at 5.25% for 4 years -> 2,592.59', () => near(calcSI(12345.67, 5.25, 4, 'years').interest, 2592.5907, 1e-6, 'i'));
t('5L at 10% for 30 months -> 1,25,000', () => near(calcSI(500000, 10, 30, 'months').interest, 125000, 1e-6, 'i'));
t('10,000 at 5% for 6 months -> 250', () => near(calcSI(10000, 5, 6, 'months').interest, 250, 1e-9, 'i'));
t('365 days equals 1 year: 1L at 8% -> 8,000', () => near(calcSI(100000, 8, 365, 'days').interest, 8000, 1e-6, 'i'));
t('units agree: 2 years = 24 months', () => near(calcSI(70000, 9, 2, 'years').interest, calcSI(70000, 9, 24, 'months').interest, 1e-6, 'units'));
t('0% rate: interest 0, total = principal', () => { const r = calcSI(100000, 0, 5, 'years'); assert.strictEqual(r.interest, 0); assert.strictEqual(r.total, 100000); });
t('max: 100% for 100 years on 1L -> 1,00,00,000', () => near(calcSI(100000, 100, 100, 'years').interest, 10000000, 1e-6, 'i'));
t('interest each year: 75,000 at 9.5% -> 7,125', () => near(calcSI(75000, 9.5, 1, 'years').perYear, 7125, 1e-9, 'per'));
t('string numbers accepted (form values)', () => near(calcSI('50000', '8', '3', 'years').interest, 12000, 1e-9, 'i'));
t('invalid inputs return null', () => {
  [[0, 8, 3, 'years'], [-1, 8, 3, 'years'], [1e11, 8, 3, 'years'], [1000, -1, 3, 'years'], [1000, 101, 3, 'years'], [1000, 8, 0, 'years'], [1000, 8, -2, 'years'],
   [1000, 8, 101, 'years'], [1000, 8, 1201, 'months'], [1000, 8, 36501, 'days'], [1000, 8, 3, 'weeks'], [1000, 8, 3, ''], [1000, 8, 3, undefined],
   ['abc', 8, 3, 'years'], ['', 8, 3, 'years'], [1000, '', 3, 'years'], [1000, 8, '', 'years'], [null, 8, 3, 'years'], [true, 8, 3, 'years'], [NaN, 8, 3, 'years']]
    .forEach(a => assert.strictEqual(calcSI(...a), null, JSON.stringify(a)));
});
t('limits accepted: 100 years, 1200 months, 36500 days', () => { assert.ok(calcSI(1000, 8, 100, 'years')); assert.ok(calcSI(1000, 8, 1200, 'months')); assert.ok(calcSI(1000, 8, 36500, 'days')); });
t('schedule: whole years (1L at 10% for 3 years)', () => { const r = schedule(100000, 10, 3, 'years'); assert.strictEqual(r.length, 3); near(r[0].interest, 10000, 1e-9, 'y1'); near(r[2].interest, 30000, 1e-9, 'y3'); near(r[2].total, 130000, 1e-9, 'total'); });
t('schedule: 2.5 years has a part-year row ending at 25,000 interest', () => { const r = schedule(100000, 10, 2.5, 'years'); assert.strictEqual(r.length, 3); assert.ok(r[2].part); near(r[2].interest, 25000, 1e-9, 'last'); });
t('schedule: under a year is one part row', () => { const r = schedule(10000, 5, 6, 'months'); assert.strictEqual(r.length, 1); assert.ok(r[0].part); near(r[0].interest, 250, 1e-9, 'i'); });
t('schedule: exactly 1 year (365 days) has no part row', () => { const r = schedule(100000, 8, 365, 'days'); assert.strictEqual(r.length, 1); assert.ok(!r[0].part); });
t('schedule returns null for invalid input', () => assert.strictEqual(schedule(0, 8, 3, 'years'), null));
t('inrWords', () => { assert.strictEqual(inrWords(100000), '1 Lakh'); assert.strictEqual(inrWords(''), ''); });
console.log(`Simple interest: ${n} tests passed`);
