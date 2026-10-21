const assert = require('assert');
const { calcPPF, inrWords, LIMITS } = require('../tools/ppf-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation (month-by-month for monthly mode), not from this code.
t('1.5L/year, 7.1%, 15y, yearly -> 40,68,209.22', () => { const r = calcPPF(150000, 'yearly', 7.1, 15); near(r.value, 4068209.2203, 0.001, 'value'); near(r.invested, 2250000, 1e-6, 'invested'); near(r.interest, 1818209.2203, 0.001, 'interest'); });
t('1.5L/year, 7.1%, 25y, yearly -> 1,03,08,014.97', () => near(calcPPF(150000, 'yearly', 7.1, 25).value, 10308014.9677, 0.001, 'value'));
t('minimum 500/year, 15y -> 13,560.70', () => near(calcPPF(500, 'yearly', 7.1, 15).value, 13560.6974, 0.001, 'value'));
t('1L/year, 8%, 20y -> 49,42,292.14', () => near(calcPPF(100000, 'yearly', 8, 20).value, 4942292.1442, 0.001, 'value'));
t('50,000/year, 7.1%, 50y -> 2,25,25,329.31', () => near(calcPPF(50000, 'yearly', 7.1, 50).value, 22525329.312, 0.001, 'value'));
t('12,500/month, 7.1%, 15y -> 39,44,599.22', () => near(calcPPF(12500, 'monthly', 7.1, 15).value, 3944599.2218, 0.001, 'value'));
t('5,000/month, 7.1%, 30y -> 59,92,577.73', () => near(calcPPF(5000, 'monthly', 7.1, 30).value, 5992577.727, 0.001, 'value'));
t('10,000/month, 7.1%, 15y -> 31,55,679.38', () => near(calcPPF(10000, 'monthly', 7.1, 15).value, 3155679.3774, 0.001, 'value'));
t('0% rate: value equals money put in (yearly and monthly)', () => { assert.strictEqual(calcPPF(150000, 'yearly', 0, 15).value, 2250000); near(calcPPF(1000, 'monthly', 0, 15).value, 180000, 1e-6, 'monthly'); });
t('depositing early in the year beats monthly instalments', () => assert.ok(calcPPF(150000, 'yearly', 7.1, 15).value > calcPPF(12500, 'monthly', 7.1, 15).value));
t('schedule yearly: year 1 = 1,60,650 and year 2 = 3,32,706.15', () => { const r = calcPPF(150000, 'yearly', 7.1, 15).rows; assert.strictEqual(r.length, 15); near(r[0].balance, 160650, 1e-6, 'y1'); near(r[1].balance, 332706.15, 1e-6, 'y2'); near(r[14].balance, 4068209.2203, 0.001, 'last'); });
t('schedule monthly: year 1 interest 5,768.75, year 2 interest 16,828.33', () => { const r = calcPPF(12500, 'monthly', 7.1, 15).rows; near(r[0].interest, 5768.75, 1e-6, 'i1'); near(r[0].balance, 155768.75, 1e-6, 'b1'); near(r[1].interest, 16828.33125, 1e-6, 'i2'); near(r[1].balance, 322597.08125, 1e-6, 'b2'); });
t('rows add up: deposits + interest = final balance', () => { const r = calcPPF(100000, 'yearly', 7.1, 20); const sum = r.rows.reduce((s, x) => s + x.deposit + x.interest, 0); near(sum, r.value, 1e-4, 'sum'); });
t('string numbers accepted (form values)', () => near(calcPPF('150000', 'yearly', '7.1', '15').value, 4068209.2203, 0.001, 'value'));
t('limits: 500/year and 1,50,000/year accepted, 499 and 1,50,001 rejected', () => {
  assert.ok(calcPPF(LIMITS.minYear, 'yearly', 7.1, 15)); assert.ok(calcPPF(LIMITS.maxYear, 'yearly', 7.1, 15));
  assert.strictEqual(calcPPF(499, 'yearly', 7.1, 15), null); assert.strictEqual(calcPPF(150001, 'yearly', 7.1, 15), null);
});
t('monthly limit: 12,500 accepted, 12,501 rejected (over 1.5L a year)', () => { assert.ok(calcPPF(12500, 'monthly', 7.1, 15)); assert.strictEqual(calcPPF(12501, 'monthly', 7.1, 15), null); assert.strictEqual(calcPPF(41, 'monthly', 7.1, 15), null); });
t('years must be 15 to 50 in blocks of 5', () => { [15, 20, 25, 30, 35, 40, 45, 50].forEach(y => assert.ok(calcPPF(1000, 'yearly', 7.1, y), 'y' + y)); [14, 16, 17, 21, 55, 60, 10, 0, 15.5].forEach(y => assert.strictEqual(calcPPF(1000, 'yearly', 7.1, y), null, 'y' + y)); });
t('invalid inputs return null', () => {
  [[0, 'yearly', 7.1, 15], [-5, 'yearly', 7.1, 15], [1000, 'yearly', -1, 15], [1000, 'yearly', 16, 15], [1000, 'weekly', 7.1, 15], [1000, '', 7.1, 15],
   ['', 'yearly', 7.1, 15], [1000, 'yearly', '', 15], [1000, 'yearly', 7.1, ''], [null, 'yearly', 7.1, 15], [true, 'yearly', 7.1, 15], [NaN, 'yearly', 7.1, 15], ['abc', 'yearly', 7.1, 15]]
    .forEach(a => assert.strictEqual(calcPPF(...a), null, JSON.stringify(a)));
});
t('inrWords', () => { assert.strictEqual(inrWords(150000), '1.5 Lakh'); assert.strictEqual(inrWords(4068209), '40.68 Lakh'); assert.strictEqual(inrWords(''), ''); });
console.log(`PPF: ${n} tests passed`);
