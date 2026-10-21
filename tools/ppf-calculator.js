/* PPF Calculator logic: pure functions (testable in node) + DOM wiring (browser only).
   Rules modelled: interest is worked out every month on the lowest balance between the 5th and the end of the month,
   and added to the account once a year on 31 March (so it compounds yearly). Money deposited by the 5th earns that month's interest. */
(function (root) {
  'use strict';

  var LIMITS = { minYear: 500, maxYear: 150000, maxRate: 15, minYears: 15, maxYears: 50 };

  // Strict number parsing: '' / '  ' / null / true must NOT become 0.
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* amount   = money put in per period (per year if mode 'yearly', per month if mode 'monthly')
     ratePct  = interest rate, e.g. 7.1 for 7.1% a year (assumed constant)
     years    = account life: 15 to 50, in blocks of 5 (15 years, then 5-year extensions)
     yearly  : the whole year's amount is deposited by 5 April, so all 12 months earn interest.
     monthly : one equal instalment by the 5th of each month, April to March.
     Returns null for invalid input. */
  function calcPPF(amount, mode, ratePct, years) {
    amount = num(amount); ratePct = num(ratePct); years = num(years);
    if (mode !== 'yearly' && mode !== 'monthly') return null;
    if (!isFinite(amount) || amount <= 0) return null;
    var perYear = mode === 'yearly' ? amount : amount * 12;
    if (perYear < LIMITS.minYear || perYear > LIMITS.maxYear) return null;
    if (!isFinite(ratePct) || ratePct < 0 || ratePct > LIMITS.maxRate) return null;
    if (!isFinite(years) || years < LIMITS.minYears || years > LIMITS.maxYears || years % 5 !== 0) return null;

    var r = ratePct / 100, balance = 0, rows = [];
    for (var y = 1; y <= years; y++) {
      var interest;
      if (mode === 'yearly') interest = (balance + perYear) * r;
      else interest = balance * r + (amount * r / 12) * 78; // 1+2+...+12 = 78 instalment-months
      var end = balance + perYear + interest;
      rows.push({ year: y, deposit: perYear, interest: interest, balance: end });
      balance = end;
    }
    var invested = perYear * years;
    return { perYear: perYear, invested: invested, value: balance, interest: balance - invested, years: years, rows: rows };
  }

  function inr(n, d) {
    d = d === undefined ? 0 : d;
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  /* 1250000 -> "12.5 Lakh", 25000000 -> "2.5 Crore", 45000 -> "45 Thousand" */
  function inrWords(n) {
    n = Number(n);
    if (!isFinite(n) || n <= 0) return '';
    var trim = function (x) { return String(Math.round(x * 100) / 100); };
    if (n >= 1e7) return trim(n / 1e7) + ' Crore';
    if (n >= 1e5) return trim(n / 1e5) + ' Lakh';
    if (n >= 1e3) return trim(n / 1e3) + ' Thousand';
    return trim(n);
  }

  var api = { calcPPF: calcPPF, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PPF = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var amount = $('amount'), rate = $('rate'), tenure = $('tenure');
    var amountR = $('amount-r'), rateR = $('rate-r'), tenureR = $('tenure-r');
    var modeGroup = $('mode'), out = $('out'), hint = $('hint'), words = $('amount-words'), copy = $('copy');
    var state = { mode: 'yearly' };
    var last = '';

    function render() {
      words.textContent = inrWords(amount.value) ? '= ' + inrWords(amount.value) : '';
      var filled = amount.value !== '' && rate.value !== '' && tenure.value !== '';
      var r = filled ? calcPPF(amount.value, state.mode, rate.value, tenure.value) : null;
      if (!r) { out.hidden = true; last = ''; hint.hidden = !filled; return; }
      hint.hidden = true; out.hidden = false;
      var pPct = Math.round(r.invested / r.value * 1000) / 10, iPct = Math.round((100 - pPct) * 10) / 10;
      out.innerHTML =
        '<div class="big"><span>Maturity value after ' + r.years + ' years</span><strong>' + inr(r.value) + '</strong></div>' +
        '<div class="line"><span>Total you invest</span><strong>' + inr(r.invested) + '</strong></div>' +
        '<div class="line total"><span>Interest earned (tax-free)</span><span>' + inr(r.interest) + '</span></div>' +
        '<div class="split" role="img" aria-label="Invested ' + pPct + ' percent, interest ' + iPct + ' percent">' +
          '<span class="split-p" style="width:' + pPct + '%"></span><span class="split-i" style="width:' + iPct + '%"></span></div>' +
        '<div class="split-key"><span><i class="k-p"></i>Invested ' + pPct + '%</span><span><i class="k-i"></i>Interest ' + iPct + '%</span></div>' +
        '<details class="sched"><summary>Show year-by-year balance</summary><div class="sched-scroll"><table><thead><tr><th>Year</th><th>Deposited</th><th>Interest</th><th>Balance</th></tr></thead><tbody>' +
        r.rows.map(function (x) { return '<tr><td>' + x.year + '</td><td>' + inr(x.deposit) + '</td><td>' + inr(x.interest) + '</td><td>' + inr(x.balance) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = 'PPF ' + inr(amount.value) + ' ' + (state.mode === 'yearly' ? 'per year' : 'per month') + ' at ' + rate.value + '% for ' + r.years + ' years' +
             ' | Invested ' + inr(r.invested) + ' | Interest ' + inr(r.interest) + ' | Maturity value ' + inr(r.value);
    }

    // number box <-> slider stay in sync; the number box may hold values outside the slider range
    function link(numEl, rng) {
      numEl.addEventListener('input', function () { if (numEl.value !== '') rng.value = numEl.value; render(); });
      rng.addEventListener('input', function () { numEl.value = rng.value; render(); });
    }
    link(amount, amountR); link(rate, rateR); link(tenure, tenureR);

    modeGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('data-v') === state.mode) return;
      Array.prototype.forEach.call(modeGroup.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var v = num(amount.value);
      state.mode = b.getAttribute('data-v');
      if (state.mode === 'monthly') { amountR.min = 500; amountR.max = 12500; amountR.step = 500; if (isFinite(v)) amount.value = Math.min(12500, Math.round(v / 12 / 50) * 50 || 50); }
      else { amountR.min = 5000; amountR.max = 150000; amountR.step = 5000; if (isFinite(v)) amount.value = Math.min(150000, v * 12); }
      amountR.value = amount.value;
      $('amount-l').textContent = state.mode === 'yearly' ? 'Deposit per year (₹)' : 'Deposit per month (₹)';
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
