/* Compound Interest Calculator: pure functions (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  var LIMITS = { maxAmount: 1e10, maxRate: 100, maxMonths: 600 };
  var FREQS = [1, 2, 4, 12, 365]; // compounding periods per year: yearly, half-yearly, quarterly, monthly, daily

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* A = P * (1 + r / (100 n)) ^ (n * t), t = months / 12.
     Also returns the simple-interest result and the effective annual rate (EAR, in %) for comparison.
     Returns null for invalid input. */
  function calcCI(principal, annualRatePct, months, freq) {
    principal = num(principal); annualRatePct = num(annualRatePct); months = num(months); freq = num(freq);
    if (!isFinite(principal) || principal <= 0 || principal > LIMITS.maxAmount) return null;
    if (!isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > LIMITS.maxRate) return null;
    if (!isFinite(months) || months < 1 || months > LIMITS.maxMonths || Math.floor(months) !== months) return null;
    if (FREQS.indexOf(freq) === -1) return null;
    var value = principal * Math.pow(1 + annualRatePct / (100 * freq), freq * months / 12);
    var simple = principal * annualRatePct * (months / 12) / 100;
    var ear = (Math.pow(1 + annualRatePct / (100 * freq), freq) - 1) * 100;
    return { principal: principal, value: value, interest: value - principal, simpleInterest: simple, ear: ear, months: months };
  }

  /* Value at the end of each year (and at the end of the last, possibly part, year). */
  function schedule(principal, annualRatePct, months, freq) {
    if (!calcCI(principal, annualRatePct, months, freq)) return null;
    var rows = [];
    for (var m = 12; m < months + 12; m += 12) {
      var mm = Math.min(m, months), r = calcCI(principal, annualRatePct, mm, freq);
      rows.push({ year: Math.ceil(mm / 12), interest: r.interest, value: r.value });
    }
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

  var api = { calcCI: calcCI, schedule: schedule, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CI = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var amount = $('amount'), rate = $('rate'), tenure = $('tenure');
    var amountR = $('amount-r'), rateR = $('rate-r'), tenureR = $('tenure-r');
    var unitGroup = $('unit'), compGroup = $('comp'), out = $('out'), hint = $('hint'), words = $('amount-words'), copy = $('copy');
    var state = { unit: 'years', freq: '12' };
    var FREQ_NAMES = { '1': 'yearly', '2': 'half-yearly', '4': 'quarterly', '12': 'monthly', '365': 'daily' };
    var last = '';

    function months() { return state.unit === 'years' ? num(tenure.value) * 12 : num(tenure.value); }

    function render() {
      words.textContent = inrWords(amount.value) ? '= ' + inrWords(amount.value) : '';
      var filled = amount.value !== '' && rate.value !== '' && tenure.value !== '';
      var m = months();
      var r = filled ? calcCI(amount.value, rate.value, m, state.freq) : null;
      if (!r) { out.hidden = true; last = ''; hint.hidden = !filled; return; }
      hint.hidden = true; out.hidden = false;
      var pPct = Math.round(r.principal / r.value * 1000) / 10, iPct = Math.round((100 - pPct) * 10) / 10;
      var extra = r.interest - r.simpleInterest;
      var rows = schedule(amount.value, rate.value, m, state.freq);
      out.innerHTML =
        '<div class="big"><span>Final amount</span><strong>' + inr(r.value) + '</strong></div>' +
        '<div class="line"><span>Principal</span><strong>' + inr(r.principal) + '</strong></div>' +
        '<div class="line total"><span>Compound interest</span><span>' + inr(r.interest) + '</span></div>' +
        '<div class="line"><span>Simple interest would be</span><span>' + inr(r.simpleInterest) + '</span></div>' +
        '<div class="line"><span>Extra earned by compounding</span><span>' + inr(extra) + '</span></div>' +
        '<div class="line"><span>Effective annual rate</span><span>' + r.ear.toFixed(2) + '%</span></div>' +
        '<div class="split" role="img" aria-label="Principal ' + pPct + ' percent, interest ' + iPct + ' percent">' +
          '<span class="split-p" style="width:' + pPct + '%"></span><span class="split-i" style="width:' + iPct + '%"></span></div>' +
        '<div class="split-key"><span><i class="k-p"></i>Principal ' + pPct + '%</span><span><i class="k-i"></i>Interest ' + iPct + '%</span></div>' +
        '<details class="sched"><summary>Show year-by-year growth</summary><div class="sched-scroll"><table><thead><tr><th>Year</th><th>Interest so far</th><th>Amount</th></tr></thead><tbody>' +
        rows.map(function (x) { return '<tr><td>' + x.year + '</td><td>' + inr(x.interest) + '</td><td>' + inr(x.value) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = inr(r.principal) + ' at ' + rate.value + '% for ' + tenure.value + ' ' + state.unit + ' (' + FREQ_NAMES[state.freq] + ' compounding)' +
             ' | Compound interest ' + inr(r.interest) + ' | Final amount ' + inr(r.value);
    }

    function link(numEl, rng) {
      numEl.addEventListener('input', function () { if (numEl.value !== '') rng.value = numEl.value; render(); });
      rng.addEventListener('input', function () { numEl.value = rng.value; render(); });
    }
    link(amount, amountR); link(rate, rateR); link(tenure, tenureR);

    function pressed(group, btn) {
      Array.prototype.forEach.call(group.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
    }
    compGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b) return;
      pressed(compGroup, b); state.freq = b.getAttribute('data-v'); render();
    });
    unitGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('data-v') === state.unit) return;
      pressed(unitGroup, b);
      var v = num(tenure.value);
      state.unit = b.getAttribute('data-v');
      if (state.unit === 'months') { tenureR.min = 6; tenureR.max = 120; tenureR.step = 6; if (isFinite(v)) tenure.value = Math.min(LIMITS.maxMonths, Math.round(v * 12)); }
      else { tenureR.min = 1; tenureR.max = 30; tenureR.step = 1; if (isFinite(v)) tenure.value = Math.max(1, Math.round(v / 12)); }
      tenureR.value = tenure.value;
      $('tenure-l').textContent = state.unit === 'years' ? 'Time period (years)' : 'Time period (months)';
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
