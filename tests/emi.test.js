const assert = require('assert');
const { calcEMI, schedule, inrWords, LIMITS } = require('../tools/emi-calculator.js');
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b}`);
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };

t('10 lakh, 9%, 5 years -> EMI 20,758.36', () => { const r = calcEMI(1000000, 9, 60); near(r.emi, 20758.3552, 0.001, 'emi'); near(r.interest, 245501.31, 0.05, 'interest'); });
t('50 lakh, 8.5%, 20 years -> EMI 43,391.16', () => near(calcEMI(5000000, 8.5, 240).emi, 43391.1617, 0.001, 'emi'));
t('5 lakh, 12%, 12 months -> EMI 44,424.39', () => near(calcEMI(500000, 12, 12).emi, 44424.3943, 0.001, 'emi'));
t('0% interest -> principal / months', () => { const r = calcEMI(120000, 0, 12); assert.strictEqual(r.emi, 10000); assert.strictEqual(r.interest, 0); });
t('total = emi * months and interest = total - principal', () => { const r = calcEMI(750000, 10.25, 84); near(r.total, r.emi * 84, 1e-6, 'total'); near(r.interest, r.total - 750000, 1e-6, 'interest'); });
t('1 month loan: EMI = P + one month interest', () => near(calcEMI(100000, 12, 1).emi, 101000, 0.01, 'emi'));
t('max tenure 600 months works', () => assert.ok(calcEMI(1000000, 8, LIMITS.maxMonths).emi > 0));
t('750000 at 10.25% for 84 months -> 12,547.98', () => near(calcEMI(750000, 10.25, 84).emi, 12547.9826, 0.001, 'emi'));
t('invalid inputs return null', () => {
  [[0, 9, 60], [-5, 9, 60], [1e11, 9, 60], [1000, -1, 12], [1000, 61, 12], [1000, 9, 0], [1000, 9, 601], [1000, 9, 12.5], ['abc', 9, 12], [1000, '', 12], [NaN, 9, 12], ['', 9, 12], [1000, '  ', 12], [1000, 9, ''], [null, 9, 12], [true, 9, 12]]
    .forEach(a => assert.strictEqual(calcEMI(...a), null, JSON.stringify(a)));
});
t('string numbers are accepted (form values)', () => near(calcEMI('1000000', '9', '60').emi, 20758.3552, 0.001, 'emi'));
t('schedule: balance ends at 0, principal sums to loan, interest sums to total interest', () => {
  const rows = schedule(1000000, 9, 60), r = calcEMI(1000000, 9, 60);
  assert.strictEqual(rows.length, 5);
  assert.strictEqual(rows[rows.length - 1].balance, 0);
  near(rows.reduce((s, x) => s + x.principal, 0), 1000000, 0.01, 'principal sum');
  near(rows.reduce((s, x) => s + x.interest, 0), r.interest, 0.01, 'interest sum');
  assert.ok(rows[0].interest > rows[4].interest, 'interest share falls over time');
});
t('schedule: part-year tenure (30 months) gives 3 rows', () => assert.strictEqual(schedule(500000, 10, 30).length, 3));
t('schedule: first-year balance is correct (10L, 9%, 60m -> 8,34,169.98)', () => near(schedule(1000000, 9, 60)[0].balance, 834169.98, 0.05, 'balance'));
t('schedule returns null for invalid input', () => assert.strictEqual(schedule(0, 9, 60), null));
t('inrWords', () => { assert.strictEqual(inrWords(1000000), '10 Lakh'); assert.strictEqual(inrWords(25000000), '2.5 Crore'); assert.strictEqual(inrWords(45000), '45 Thousand'); assert.strictEqual(inrWords(500), '500'); assert.strictEqual(inrWords(''), ''); });
console.log(`EMI: ${n} tests passed`);
