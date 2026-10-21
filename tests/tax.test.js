const assert = require('assert');
const { calcTax, slabTax, inrWords, LIMITS } = require('../tools/income-tax-calculator.js');
let n = 0; const t = (name, fn) => { fn(); n++; console.log('  ok  ' + name); };
// Expected values come from a separate Python/Decimal calculation (slab table, rounding to Rs 10), not from this code.
const chk = (o, nt, nTax, ot, oTax) => { const r = calcTax(o); assert.deepStrictEqual([r.new.taxable, r.new.total, r.old.taxable, r.old.total], [nt, nTax, ot, oTax], JSON.stringify(o)); return r; };
const S = (gross, extra) => Object.assign({ gross, age: 'below60', salaried: true }, extra);
t('15L salaried, 80C 1.5L: new 97,500 vs old 2,10,600 -> new saves 1,13,100', () => { const r = chk(S(1500000, { c80c: 150000 }), 1425000, 97500, 1300000, 210600); assert.strictEqual(r.better, 'new'); assert.strictEqual(r.saving, 113100); });
t('12L non-salaried: new regime zero tax (87A), old 1,79,400', () => chk({ gross: 1200000, age: 'below60', salaried: false }, 1200000, 0, 1200000, 179400));
t('12.75L salaried: new regime zero (taxable 12L)', () => chk(S(1275000), 1200000, 0, 1225000, 187200));
t('12.8L salaried: marginal relief, new tax 5,200', () => { const r = chk(S(1280000), 1205000, 5200, 1230000, 188760); assert.ok(r.new.relief > 0); });
t('13L salaried: new 26,000, old 1,95,000', () => chk(S(1300000), 1225000, 26000, 1250000, 195000));
t('12.5L non-salaried: new 52,000 (no relief needed)', () => chk({ gross: 1250000, age: 'below60', salaried: false }, 1250000, 52000, 1250000, 195000));
t('5L salaried: zero tax in both', () => { const r = chk(S(500000), 425000, 0, 450000, 0); assert.strictEqual(r.better, 'same'); assert.strictEqual(r.saving, 0); });
t('5.5L salaried: old regime rebate gives zero (taxable 5L), new zero', () => chk(S(550000), 475000, 0, 500000, 0));
t('7L salaried with 80C: old zero tax (taxable 5L)', () => { const r = chk(S(700000, { c80c: 150000 }), 625000, 0, 500000, 0); assert.strictEqual(r.better, 'same'); });
t('8L salaried: new zero, old 65,000 -> new better', () => { const r = chk(S(800000), 725000, 0, 750000, 65000); assert.strictEqual(r.better, 'new'); });
t('25L salaried, all deductions at caps: new 3,19,800, old 4,36,800', () => chk(S(2500000, { c80c: 150000, d80d: 25000, nps: 50000, homeLoan: 200000 }), 2425000, 319800, 2025000, 436800));
t('16L with all deductions at caps: new still wins (1,13,100 vs 1,48,200)', () => { const r = chk(S(1600000, { c80c: 150000, d80d: 50000, nps: 50000, homeLoan: 200000 }), 1525000, 113100, 1100000, 148200); assert.strictEqual(r.better, 'new'); });
t('20L with 3L extra deductions (HRA etc): old 2,73,000 vs new 1,92,400', () => chk(S(2000000, { c80c: 150000, other: 300000 }), 1925000, 192400, 1500000, 273000));
t('50L (limit): new 10,99,800, old 13,49,400', () => chk(S(5000000), 4925000, 1099800, 4950000, 1349400));
t('senior 10L: old 1,04,000, new zero', () => chk({ gross: 1000000, age: '60to79', salaried: true }, 925000, 0, 950000, 104000));
t('super senior 6L non-salaried: old 20,800 (5L exempt, no rebate over 5L)', () => chk({ gross: 600000, age: '80plus', salaried: false }, 600000, 0, 600000, 20800));
t('super senior 9L salaried: old 72,800', () => chk({ gross: 900000, age: '80plus', salaried: true }, 825000, 0, 850000, 72800));
t('old regime wins with big deductions: 30L, 80C+NPS+home loan+5L HRA -> old 4,44,600 vs new 4,75,800', () => { const r = chk(S(3000000, { c80c: 150000, nps: 50000, homeLoan: 200000, other: 500000 }), 2925000, 475800, 2050000, 444600); assert.strictEqual(r.better, 'old'); assert.strictEqual(r.saving, 31200); });
t('4L and 8L salaried boundaries', () => { chk(S(400000), 325000, 0, 350000, 0); });
t('standard deduction capped at income (gross 40,000)', () => { const r = calcTax(S(40000)); assert.strictEqual(r.new.std, 40000); assert.strictEqual(r.new.taxable, 0); });
t('slabTax helper: 8L new slabs = 20,000', () => assert.strictEqual(slabTax(800000, [[400000, 0], [800000, 5], [Infinity, 10]]), 20000));
t('string numbers accepted (form values)', () => assert.strictEqual(calcTax({ gross: '1500000', age: 'below60', salaried: true, c80c: '150000' }).new.total, 97500));
t('deduction caps enforced', () => {
  assert.ok(calcTax(S(1500000, { c80c: LIMITS.c80c }))); assert.strictEqual(calcTax(S(1500000, { c80c: 150001 })), null);
  assert.strictEqual(calcTax(S(1500000, { nps: 50001 })), null); assert.strictEqual(calcTax(S(1500000, { homeLoan: 200001 })), null); assert.strictEqual(calcTax(S(1500000, { d80d: 100001 })), null);
});
t('invalid inputs return null', () => {
  [null, undefined, 5, { gross: 0, age: 'below60', salaried: true }, { gross: -1, age: 'below60', salaried: true }, { gross: 5000001, age: 'below60', salaried: true },
   { gross: '', age: 'below60', salaried: true }, { gross: null, age: 'below60', salaried: true }, { gross: true, age: 'below60', salaried: true }, { gross: 'abc', age: 'below60', salaried: true },
   { gross: 1e6, age: 'teen', salaried: true }, { gross: 1e6, age: 'below60' }, { gross: 1e6, age: 'below60', salaried: 'yes' },
   S(1e6, { c80c: -1 }), S(1e6, { c80c: '' }), S(1e6, { other: 'x' }), S(1e6, { other: null })].forEach(o => assert.strictEqual(calcTax(o), null, JSON.stringify(o)));
});
t('inrWords', () => { assert.strictEqual(inrWords(1500000), '15 Lakh'); assert.strictEqual(inrWords(''), ''); });
console.log(`Income tax: ${n} tests passed`);
