/* EMI Calculator logic: pure functions (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  var LIMITS = { maxAmount: 1e10, maxRate: 60, maxMonths: 600 };

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* Equated Monthly Instalment.
     principal in rupees, annualRatePct e.g. 9 for 9% a year, months = tenure in months.
     Returns null for invalid input. */
  function calcEMI(principal, annualRatePct, months) {
    principal = num(principal); annualRatePct = num(annualRatePct); months = num(months);
    if (!isFinite(principal) || principal <= 0 || principal > LIMITS.maxAmount) return null;
    if (!isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > LIMITS.maxRate) return null;
    if (!isFinite(months) || months < 1 || months > LIMITS.maxMonths || Math.floor(months) !== months) return null;
    var emi;
    if (annualRatePct === 0) {
      emi = principal / months;
    } else {
      var r = annualRatePct / 12 / 100;
      var f = Math.pow(1 + r, months);
      emi = principal * r * f / (f - 1);
    }
    var total = emi * months;
    return { emi: emi, total: total, interest: total - principal, principal: principal, months: months };
  }

  /* Year-by-year schedule (loan year 1, 2, ...). Uses unrounded monthly maths, balance ends at 0. */
  function schedule(principal, annualRatePct, months) {
    var res = calcEMI(principal, annualRatePct, months);
    if (!res) return null;
    var r = num(annualRatePct) / 12 / 100, bal = num(principal), rows = [];
    var yp = 0, yi = 0;
    for (var m = 1; m <= months; m++) {
      var interest = bal * r;
      var princ = res.emi - interest;
      bal = bal - princ;
      yp += princ; yi += interest;
      if (m % 12 === 0 || m === months) {
        rows.push({ year: Math.ceil(m / 12), principal: yp, interest: yi, balance: Math.max(0, m === months ? 0 : bal) });
        yp = 0; yi = 0;
      }
    }
    return rows;
  }

  function inr(n, d) {
    d = d === undefined ? 2 : d;
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

  var api = { calcEMI: calcEMI, schedule: schedule, inrWords: inrWords, LIMITS: LIMITS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.EMI = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var amount = $('amount'), rate = $('rate'), tenure = $('tenure');
    var amountR = $('amount-r'), rateR = $('rate-r'), tenureR = $('tenure-r');
    var unitGroup = $('unit'), out = $('out'), hint = $('hint'), words = $('amount-words');
    var state = { unit: 'years' };
    var last = '';

    function months() { return state.unit === 'years' ? Number(tenure.value) * 12 : Number(tenure.value); }

    function render() {
      words.textContent = inrWords(amount.value) ? '= ' + inrWords(amount.value) : '';
      var m = months();
      var r = (amount.value === '' || rate.value === '' || tenure.value === '') ? null : calcEMI(amount.value, rate.value, m);
      if (!r) {
        out.hidden = true; last = '';
        hint.hidden = !(amount.value !== '' && rate.value !== '' && tenure.value !== '');
        return;
      }
      hint.hidden = true; out.hidden = false;
      var pPct = Math.round(r.principal / r.total * 1000) / 10, iPct = Math.round((100 - pPct) * 10) / 10;
      var rows = schedule(amount.value, rate.value, m);
      out.innerHTML =
        '<div class="big"><span>Monthly EMI</span><strong>' + inr(r.emi) + '</strong></div>' +
        '<div class="line"><span>Principal amount</span><strong>' + inr(r.principal) + '</strong></div>' +
        '<div class="line"><span>Total interest</span><strong>' + inr(r.interest) + '</strong></div>' +
        '<div class="line total"><span>Total payment</span><span>' + inr(r.total) + '</span></div>' +
        '<div class="split" role="img" aria-label="Principal ' + pPct + ' percent, interest ' + iPct + ' percent">' +
          '<span class="split-p" style="width:' + pPct + '%"></span><span class="split-i" style="width:' + iPct + '%"></span></div>' +
        '<div class="split-key"><span><i class="k-p"></i>Principal ' + pPct + '%</span><span><i class="k-i"></i>Interest ' + iPct + '%</span></div>' +
        '<details class="sched"><summary>Show year-by-year schedule</summary><div class="sched-scroll"><table><thead><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Balance</th></tr></thead><tbody>' +
        rows.map(function (x) { return '<tr><td>' + x.year + '</td><td>' + inr(x.principal, 0) + '</td><td>' + inr(x.interest, 0) + '</td><td>' + inr(x.balance, 0) + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = 'Loan ' + inr(r.principal, 0) + ' at ' + rate.value + '% for ' + tenure.value + ' ' + state.unit +
             ' | EMI ' + inr(r.emi) + ' | Total interest ' + inr(r.interest) + ' | Total payment ' + inr(r.total);
    }

    // number box <-> slider stay in sync; the number box may hold values outside the slider range
    function link(num, rng) {
      num.addEventListener('input', function () { if (num.value !== '') rng.value = num.value; render(); });
      rng.addEventListener('input', function () { num.value = rng.value; render(); });
    }
    link(amount, amountR); link(rate, rateR); link(tenure, tenureR);

    unitGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('data-v') === state.unit) return;
      Array.prototype.forEach.call(unitGroup.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var v = Number(tenure.value);
      state.unit = b.getAttribute('data-v');
      if (state.unit === 'months') { tenureR.min = 6; tenureR.max = 360; tenureR.step = 6; if (v) tenure.value = Math.min(600, Math.round(v * 12)); }
      else { tenureR.min = 1; tenureR.max = 30; tenureR.step = 1; if (v) tenure.value = Math.max(1, Math.round(v / 12)); }
      tenureR.value = tenure.value;
      $('tenure-l').textContent = state.unit === 'years' ? 'Loan tenure (years)' : 'Loan tenure (months)';
      render();
    });

    var copy = $('copy');
    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });

    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
