/* GST Calculator logic — pure functions (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  // Strict number parsing: '' / null must NOT become 0.
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  // mode: 'exclusive' = amount is before GST (add GST); 'inclusive' = amount already includes GST (extract GST)
  function calcGST(amount, ratePct, mode) {
    amount = num(amount); ratePct = num(ratePct);
    if (!isFinite(amount) || amount < 0 || !isFinite(ratePct) || ratePct < 0) return null;
    var base, gst, total;
    if (mode === 'inclusive') {
      total = amount;
      base = amount * 100 / (100 + ratePct);
      gst = total - base;
    } else {
      base = amount;
      gst = amount * ratePct / 100;
      total = base + gst;
    }
    return { base: base, gst: gst, cgst: gst / 2, sgst: gst / 2, igst: gst, total: total };
  }

  function inr(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { calcGST: calcGST };
  root.calcGST = calcGST;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var out = document.getElementById('out');
    var amountEl = document.getElementById('amount');
    var state = { rate: '18', mode: 'exclusive' };
    var last = '';

    function render() {
      var r = calcGST(amountEl.value, state.rate, state.mode);
      if (!r || amountEl.value === '') { out.hidden = true; last = ''; return; }
      out.hidden = false;
      var half = state.rate / 2;
      out.innerHTML =
        '<div class="big"><span>Total amount</span><strong>' + inr(r.total) + '</strong></div>' +
        '<div class="line"><span>Original amount (before GST)</span><strong>' + inr(r.base) + '</strong></div>' +
        '<div class="line"><span>CGST (' + half + '%)</span><strong>' + inr(r.cgst) + '</strong></div>' +
        '<div class="line"><span>SGST (' + half + '%)</span><strong>' + inr(r.sgst) + '</strong></div>' +
        '<div class="line"><span>IGST (inter-state, ' + state.rate + '%)</span><strong>' + inr(r.igst) + '</strong></div>';
      last = 'GST ' + state.rate + '% | Before GST ' + inr(r.base) + ' | CGST ' + inr(r.cgst) + ' | SGST ' + inr(r.sgst) +
             ' | IGST ' + inr(r.igst) + ' | Total ' + inr(r.total);
    }

    // Segmented toggles: one pressed button per group
    ['rate', 'mode'].forEach(function (id) {
      var group = document.getElementById(id);
      group.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        Array.prototype.forEach.call(group.querySelectorAll('button'), function (x) {
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        state[id] = b.getAttribute('data-v');
        render();
      });
    });
    amountEl.addEventListener('input', render);

    var copy = document.getElementById('copy');
    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
