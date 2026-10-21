/* Income Tax Calculator (India, FY 2026-27, individuals, resident). Pure functions (testable in node) + DOM wiring.
   Compares the new and old regime. Covers income up to Rs 50 lakh: surcharge (and its marginal relief) is NOT modelled.
   Rules modelled: slab tax, standard deduction (salary/pension), old-regime deductions with their caps, 87A rebate
   (old: up to Rs 12,500 if taxable income <= 5 lakh; new: up to Rs 60,000 if <= 12 lakh, with marginal relief just above),
   4% cess, taxable income and final tax rounded to the nearest Rs 10. */
(function (root) {
  'use strict';

  var LIMITS = { maxGross: 5000000, c80c: 150000, nps: 50000, d80d: 100000, homeLoan: 200000 };
  var STD = { new: 75000, old: 50000 };
  var CESS = 4; // percent
  var NEW_SLABS = [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [Infinity, 30]];
  var OLD_SLABS = {
    below60: [[250000, 0], [500000, 5], [1000000, 20], [Infinity, 30]],
    '60to79': [[300000, 0], [500000, 5], [1000000, 20], [Infinity, 30]],
    '80plus': [[500000, 0], [1000000, 20], [Infinity, 30]]
  };
  var NEW_REBATE = { upTo: 1200000, max: 60000 }, OLD_REBATE = { upTo: 500000, max: 12500 };

  // Strict number parsing: '' / '  ' / null / true must NOT become 0.
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }
  var round10 = function (x) { return Math.round(x / 10) * 10; };

  function slabTax(income, slabs) {
    var tax = 0, lower = 0;
    for (var i = 0; i < slabs.length; i++) {
      var upper = slabs[i][0];
      if (income > lower) tax += (Math.min(income, upper) - lower) * slabs[i][1] / 100;
      lower = upper;
      if (income <= upper) break;
    }
    return tax;
  }

  // taxable = income after deductions; returns the full tax working for one regime
  function regime(taxable, slabs, rebate, withRelief, extra) {
    taxable = round10(Math.max(0, taxable));
    var st = slabTax(taxable, slabs), reb = 0, relief = 0;
    if (taxable <= rebate.upTo) reb = Math.min(st, rebate.max);
    else if (withRelief) relief = Math.max(0, st - (taxable - rebate.upTo)); // tax cannot exceed the income above the limit
    var base = st - reb - relief, cess = base * CESS / 100;
    var out = { taxable: taxable, slabTax: st, rebate: reb, relief: relief, cess: cess, total: round10(base + cess) };
    for (var k in extra) out[k] = extra[k];
    return out;
  }

  /* o = { gross, age: 'below60'|'60to79'|'80plus', salaried: bool, c80c, d80d, nps, homeLoan, other }  (deductions optional, default 0)
     Returns { old, new, better: 'old'|'new'|'same', saving } or null for invalid input. */
  function calcTax(o) {
    if (!o || typeof o !== 'object') return null;
    var gross = num(o.gross);
    if (!isFinite(gross) || gross <= 0 || gross > LIMITS.maxGross) return null;
    var slabsOld = OLD_SLABS[o.age];
    if (!slabsOld || typeof o.salaried !== 'boolean') return null;
    var d = {}, keys = ['c80c', 'd80d', 'nps', 'homeLoan', 'other'];
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]] === undefined ? 0 : num(o[keys[i]]);
      if (!isFinite(v) || v < 0) return null;
      if (LIMITS[keys[i]] !== undefined && v > LIMITS[keys[i]]) return null;
      d[keys[i]] = v;
    }
    var dedTotal = d.c80c + d.d80d + d.nps + d.homeLoan + d.other;
    var stdNew = o.salaried ? Math.min(STD.new, gross) : 0, stdOld = o.salaried ? Math.min(STD.old, gross) : 0;
    var n = regime(gross - stdNew, NEW_SLABS, NEW_REBATE, true, { gross: gross, std: stdNew, deductions: 0 });
    var old = regime(gross - stdOld - dedTotal, slabsOld, OLD_REBATE, false, { gross: gross, std: stdOld, deductions: dedTotal });
    var diff = old.total - n.total;
    return { old: old, new: n, better: diff === 0 ? 'same' : (diff > 0 ? 'new' : 'old'), saving: Math.abs(diff) };
  }

  function inr(n, d) {
    d = d === undefined ? 0 : d;
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function inrWords(n) {
    n = Number(n);
    if (!isFinite(n) || n <= 0) return '';
    var trim = function (x) { return String(Math.round(x * 100) / 100); };
    if (n >= 1e7) return trim(n / 1e7) + ' Crore';
    if (n >= 1e5) return trim(n / 1e5) + ' Lakh';
    if (n >= 1e3) return trim(n / 1e3) + ' Thousand';
    return trim(n);
  }

  var api = { calcTax: calcTax, slabTax: slabTax, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TAX = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var gross = $('gross'), grossR = $('gross-r'), out = $('out'), hint = $('hint'), words = $('gross-words'), copy = $('copy');
    var ded = ['c80c', 'd80d', 'nps', 'homeLoan', 'other'];
    var state = { age: 'below60', salaried: 'yes' };
    var last = '';

    function read() {
      var o = { gross: gross.value, age: state.age, salaried: state.salaried === 'yes' };
      ded.forEach(function (k) { o[k] = $(k).value === '' ? 0 : $(k).value; });
      return o;
    }
    function render() {
      words.textContent = inrWords(gross.value) ? '= ' + inrWords(gross.value) : '';
      var r = gross.value === '' ? null : calcTax(read());
      if (!r) { out.hidden = true; last = ''; hint.hidden = gross.value === ''; return; }
      hint.hidden = true; out.hidden = false;
      var rate = function (t, g) { return (t / g * 100).toFixed(1) + '%'; };
      var lab = r.better === 'same' ? 'Both regimes' : (r.better === 'new' ? 'New regime is better' : 'Old regime is better');
      var head = r.better === 'same' ? 'Same tax' : 'Saves ' + inr(r.saving);
      var cell = function (k, f) { return '<td>' + f(r[k]) + '</td>'; };
      var row = function (label, f) { return '<tr><th scope="row">' + label + '</th>' + cell('new', f) + cell('old', f) + '</tr>'; };
      out.innerHTML =
        '<div class="big"><span>' + lab + '</span><strong>' + head + '</strong></div>' +
        '<div class="line' + (r.better === 'new' ? ' total' : '') + '"><span>Tax under new regime</span><strong>' + inr(r.new.total) + '</strong></div>' +
        '<div class="line' + (r.better === 'old' ? ' total' : '') + '"><span>Tax under old regime</span><strong>' + inr(r.old.total) + '</strong></div>' +
        '<div class="line"><span>Effective rate (new / old)</span><span>' + rate(r.new.total, r.new.gross) + ' / ' + rate(r.old.total, r.old.gross) + '</span></div>' +
        '<details class="sched"><summary>Show full working</summary><div class="sched-scroll"><table><thead><tr><th></th><th>New</th><th>Old</th></tr></thead><tbody>' +
        row('Gross income', function (x) { return inr(x.gross); }) +
        row('Standard deduction', function (x) { return inr(x.std); }) +
        row('Other deductions', function (x) { return inr(x.deductions); }) +
        row('Taxable income', function (x) { return inr(x.taxable); }) +
        row('Tax on slabs', function (x) { return inr(x.slabTax); }) +
        row('Rebate / relief', function (x) { return inr(x.rebate + x.relief); }) +
        row('Cess (4%)', function (x) { return inr(x.cess); }) +
        row('Total tax', function (x) { return inr(x.total); }) +
        '</tbody></table></div></details>';
      last = 'Income ' + inr(gross.value) + ' | New regime tax ' + inr(r.new.total) + ' | Old regime tax ' + inr(r.old.total) + ' | ' + lab + ': ' + head;
    }

    gross.addEventListener('input', function () { if (gross.value !== '') grossR.value = gross.value; render(); });
    grossR.addEventListener('input', function () { gross.value = grossR.value; render(); });
    ded.forEach(function (k) { $(k).addEventListener('input', render); });
    function seg(id, key) {
      var g = $(id);
      g.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        Array.prototype.forEach.call(g.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        state[key] = b.getAttribute('data-v'); render();
      });
    }
    seg('age', 'age'); seg('sal', 'salaried');

    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
