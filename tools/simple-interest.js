/* Simple Interest Calculator: pure functions (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  var LIMITS = { maxAmount: 1e10, maxRate: 100, maxYears: 100 };
  var UNIT_YEARS = { years: 1, months: 1 / 12, days: 1 / 365 }; // length of one unit in years (a year = 365 days)

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* SI = P * R * T / 100, T in years. unit: 'years' | 'months' | 'days'.
     Returns null for invalid input (time must be above 0 and at most 100 years). */
  function calcSI(principal, ratePct, time, unit) {
    principal = num(principal); ratePct = num(ratePct); time = num(time);
    if (!UNIT_YEARS.hasOwnProperty(unit)) return null;
    if (!isFinite(principal) || principal <= 0 || principal > LIMITS.maxAmount) return null;
    if (!isFinite(ratePct) || ratePct < 0 || ratePct > LIMITS.maxRate) return null;
    if (!isFinite(time) || time <= 0) return null;
    var years = unit === 'years' ? time : (unit === 'months' ? time / 12 : time / 365);
    if (years > LIMITS.maxYears) return null;
    var interest = principal * ratePct * years / 100;
    return { principal: principal, interest: interest, total: principal + interest, years: years, perYear: principal * ratePct / 100 };
  }

  /* Cumulative interest at the end of each whole year, plus the final (part) year. */
  function schedule(principal, ratePct, time, unit) {
    var r = calcSI(principal, ratePct, time, unit);
    if (!r) return null;
    var rows = [], whole = Math.floor(r.years + 1e-9), per = r.perYear;
    for (var y = 1; y <= whole; y++) rows.push({ year: y, interest: per * y, total: r.principal + per * y });
    if (r.years - whole > 1e-9) rows.push({ year: whole + 1, interest: r.interest, total: r.total, part: true });
    return rows;
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

  var api = { calcSI: calcSI, schedule: schedule, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SI = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var amount = $('amount'), rate = $('rate'), tenure = $('tenure');
    var amountR = $('amount-r'), rateR = $('rate-r'), tenureR = $('tenure-r');
    var unitGroup = $('unit'), out = $('out'), hint = $('hint'), words = $('amount-words'), copy = $('copy');
    var state = { unit: 'years' };
    var RANGE = { years: [1, 30, 1], months: [1, 120, 1], days: [1, 1825, 1] };
    var LABEL = { years: 'Time (years)', months: 'Time (months)', days: 'Time (days)' };
    var last = '';

    function render() {
      words.textContent = inrWords(amount.value) ? '= ' + inrWords(amount.value) : '';
      var filled = amount.value !== '' && rate.value !== '' && tenure.value !== '';
      var r = filled ? calcSI(amount.value, rate.value, tenure.value, state.unit) : null;
      if (!r) { out.hidden = true; last = ''; hint.hidden = !filled; return; }
      hint.hidden = true; out.hidden = false;
      var pPct = Math.round(r.principal / r.total * 1000) / 10, iPct = Math.round((100 - pPct) * 10) / 10;
      var rows = schedule(amount.value, rate.value, tenure.value, state.unit);
      var yrs = Math.round(r.years * 10000) / 10000;
      out.innerHTML =
        '<div class="big"><span>Simple interest</span><strong>' + inr(r.interest, 2) + '</strong></div>' +
        '<div class="line"><span>Principal</span><strong>' + inr(r.principal) + '</strong></div>' +
        '<div class="line total"><span>Total amount</span><span>' + inr(r.total, 2) + '</span></div>' +
        '<div class="line"><span>Interest each year</span><span>' + inr(r.perYear, 2) + '</span></div>' +
        '<div class="line"><span>Time in years</span><span>' + yrs + '</span></div>' +
        '<div class="split" role="img" aria-label="Principal ' + pPct + ' percent, interest ' + iPct + ' percent">' +
          '<span class="split-p" style="width:' + pPct + '%"></span><span class="split-i" style="width:' + iPct + '%"></span></div>' +
        '<div class="split-key"><span><i class="k-p"></i>Principal ' + pPct + '%</span><span><i class="k-i"></i>Interest ' + iPct + '%</span></div>' +
        '<details class="sched"><summary>Show year-by-year interest</summary><div class="sched-scroll"><table><thead><tr><th>Year</th><th>Interest so far</th><th>Total amount</th></tr></thead><tbody>' +
        rows.map(function (x) { return '<tr><td>' + x.year + (x.part ? ' (part)' : '') + '</td><td>' + inr(x.interest, 2) + '</td><td>' + inr(x.total, 2) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = 'Simple interest on ' + inr(r.principal) + ' at ' + rate.value + '% for ' + tenure.value + ' ' + state.unit +
             ' | Interest ' + inr(r.interest, 2) + ' | Total amount ' + inr(r.total, 2);
    }

    function link(numEl, rng) {
      numEl.addEventListener('input', function () { if (numEl.value !== '') rng.value = numEl.value; render(); });
      rng.addEventListener('input', function () { numEl.value = rng.value; render(); });
    }
    link(amount, amountR); link(rate, rateR); link(tenure, tenureR);

    unitGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('data-v') === state.unit) return;
      Array.prototype.forEach.call(unitGroup.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var v = num(tenure.value), old = state.unit;
      state.unit = b.getAttribute('data-v');
      var rg = RANGE[state.unit]; tenureR.min = rg[0]; tenureR.max = rg[1]; tenureR.step = rg[2];
      if (isFinite(v) && v > 0) {
        var years = old === 'years' ? v : (old === 'months' ? v / 12 : v / 365);
        var nv = state.unit === 'years' ? Math.round(years * 100) / 100 : Math.max(1, Math.round(years * (state.unit === 'months' ? 12 : 365)));
        tenure.value = nv;
      }
      tenureR.value = tenure.value;
      $('tenure-l').textContent = LABEL[state.unit];
      render();
    });

    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
