/* SIP Calculator logic: pure functions (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  var LIMITS = { maxMonthly: 1e8, maxRate: 60, maxMonths: 600 };

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* Future value of a monthly SIP. Instalments are invested at the START of each month
     (the usual convention for SIP calculators): FV = P * ((1+i)^n - 1) / i * (1+i), i = annual% / 12 / 100.
     Returns null for invalid input. */
  function calcSIP(monthly, annualRatePct, months) {
    monthly = num(monthly); annualRatePct = num(annualRatePct); months = num(months);
    if (!isFinite(monthly) || monthly <= 0 || monthly > LIMITS.maxMonthly) return null;
    if (!isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > LIMITS.maxRate) return null;
    if (!isFinite(months) || months < 1 || months > LIMITS.maxMonths || Math.floor(months) !== months) return null;
    var invested = monthly * months, value;
    if (annualRatePct === 0) {
      value = invested;
    } else {
      var i = annualRatePct / 12 / 100;
      value = monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    }
    return { invested: invested, value: value, returns: value - invested, months: months };
  }

  /* Value at the end of each year (and at the end of the last, possibly part, year). */
  function schedule(monthly, annualRatePct, months) {
    if (!calcSIP(monthly, annualRatePct, months)) return null;
    var rows = [];
    for (var m = 12; m < months + 12; m += 12) {
      var mm = Math.min(m, months), r = calcSIP(monthly, annualRatePct, mm);
      rows.push({ year: Math.ceil(mm / 12), invested: r.invested, value: r.value, returns: r.returns });
    }
    return rows;
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

  var api = { calcSIP: calcSIP, schedule: schedule, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SIP = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var amount = $('amount'), rate = $('rate'), tenure = $('tenure');
    var amountR = $('amount-r'), rateR = $('rate-r'), tenureR = $('tenure-r');
    var out = $('out'), hint = $('hint'), words = $('amount-words'), copy = $('copy');
    var last = '';

    function render() {
      words.textContent = inrWords(amount.value) ? '= ' + inrWords(amount.value) + ' per month' : '';
      var filled = amount.value !== '' && rate.value !== '' && tenure.value !== '';
      var months = num(tenure.value) * 12;
      var r = filled ? calcSIP(amount.value, rate.value, months) : null;
      if (!r) { out.hidden = true; last = ''; hint.hidden = !filled; return; }
      hint.hidden = true; out.hidden = false;
      var iPct = Math.round(r.invested / r.value * 1000) / 10, gPct = Math.round((100 - iPct) * 10) / 10;
      var rows = schedule(amount.value, rate.value, months);
      out.innerHTML =
        '<div class="big"><span>Expected value</span><strong>' + inr(r.value) + '</strong></div>' +
        '<div class="line"><span>Amount you invest</span><strong>' + inr(r.invested) + '</strong></div>' +
        '<div class="line total"><span>Estimated returns</span><span>' + inr(r.returns) + '</span></div>' +
        '<div class="split" role="img" aria-label="Invested ' + iPct + ' percent, returns ' + gPct + ' percent">' +
          '<span class="split-p" style="width:' + iPct + '%"></span><span class="split-i" style="width:' + gPct + '%"></span></div>' +
        '<div class="split-key"><span><i class="k-p"></i>Invested ' + iPct + '%</span><span><i class="k-i"></i>Returns ' + gPct + '%</span></div>' +
        '<details class="sched"><summary>Show year-by-year growth</summary><div class="sched-scroll"><table><thead><tr><th>Year</th><th>Invested</th><th>Returns</th><th>Value</th></tr></thead><tbody>' +
        rows.map(function (x) { return '<tr><td>' + x.year + '</td><td>' + inr(x.invested) + '</td><td>' + inr(x.returns) + '</td><td>' + inr(x.value) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = 'SIP ' + inr(num(amount.value)) + '/month at ' + rate.value + '% for ' + tenure.value + ' years | Invested ' + inr(r.invested) +
             ' | Returns ' + inr(r.returns) + ' | Expected value ' + inr(r.value);
    }

    // number box <-> slider stay in sync; the number box may hold values outside the slider range
    function link(numEl, rng) {
      numEl.addEventListener('input', function () { if (numEl.value !== '') rng.value = numEl.value; render(); });
      rng.addEventListener('input', function () { numEl.value = rng.value; render(); });
    }
    link(amount, amountR); link(rate, rateR); link(tenure, tenureR);

    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });

    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
