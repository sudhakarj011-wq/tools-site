/* Discount Calculator: pure functions (testable in node) + DOM wiring (browser only).
   Mode 'sale': original price, a discount and an optional extra discount (applied one after the other) -> price you pay.
   Mode 'pct':  original price and sale price -> discount percentage. */
(function (root) {
  'use strict';

  var MAX = 1e10;

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* extra defaults to 0 only when it is undefined (the form passes 0 for an empty box). Returns null for invalid input. */
  function calcSale(price, disc, extra) {
    price = num(price); disc = num(disc); extra = extra === undefined ? 0 : num(extra);
    if (!isFinite(price) || price <= 0 || price > MAX) return null;
    if (!isFinite(disc) || disc < 0 || disc > 100) return null;
    if (!isFinite(extra) || extra < 0 || extra > 100) return null;
    var afterFirst = price * (1 - disc / 100), final = afterFirst * (1 - extra / 100);
    return { price: price, afterFirst: afterFirst, final: final, saved: price - final, effectivePct: (price - final) / price * 100 };
  }

  /* Discount percentage from the original and the sale price. The sale price cannot be above the original. */
  function calcPct(original, sale) {
    original = num(original); sale = num(sale);
    if (!isFinite(original) || original <= 0 || original > MAX) return null;
    if (!isFinite(sale) || sale < 0 || sale > original) return null;
    return { original: original, sale: sale, saved: original - sale, pct: (original - sale) / original * 100 };
  }

  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  /* up to 4 decimals, trailing zeros removed: 28 -> "28", 23.0947 -> "23.0947" */
  function pctText(n) { n = Math.round(Number(n) * 1e4) / 1e4; return (Object.is(n, -0) ? 0 : n).toLocaleString('en-IN', { maximumFractionDigits: 4 }); }

  var api = { calcSale: calcSale, calcPct: calcPct, pctText: pctText };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DISC = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var p = $('p'), d1 = $('d1'), d2 = $('d2'), s = $('s'), out = $('out'), hint = $('hint'), copy = $('copy'), modeGroup = $('mode');
    var state = { mode: 'sale' };
    var last = '';
    var rows = function (a) { return a.map(function (x, i) { return '<tr><th scope="row">Step ' + (i + 1) + '</th><td>' + x + '</td></tr>'; }).join(''); };
    var working = function (a) { return '<details class="sched"><summary>Show working</summary><div class="sched-scroll"><table><tbody>' + rows(a) + '</tbody></table></div></details>'; };

    function render() {
      var r, html;
      if (state.mode === 'sale') {
        var filled = p.value !== '' && d1.value !== '';
        r = filled ? calcSale(p.value, d1.value, d2.value === '' ? 0 : d2.value) : null;
        if (!r) { out.hidden = true; last = ''; hint.textContent = 'Enter a price above 0 and discounts between 0 and 100%.'; hint.hidden = !filled; return; }
        var ex = d2.value === '' ? 0 : Number(d2.value);
        var steps = ['Price after ' + pctText(d1.value) + '% off: ' + inr(r.price) + ' × (1 − ' + pctText(d1.value) + ' ÷ 100) = ' + inr(r.afterFirst)];
        if (ex > 0) steps.push('Then ' + pctText(ex) + '% extra off: ' + inr(r.afterFirst) + ' × (1 − ' + pctText(ex) + ' ÷ 100) = ' + inr(r.final));
        steps.push('You save ' + inr(r.price) + ' − ' + inr(r.final) + ' = ' + inr(r.saved));
        html = '<div class="big"><span>You pay</span><strong>' + inr(r.final) + '</strong></div>' +
          '<div class="line total"><span>You save</span><span>' + inr(r.saved) + '</span></div>' +
          '<div class="line"><span>Total discount</span><span>' + pctText(r.effectivePct) + '%</span></div>' +
          '<div class="line"><span>Original price</span><span>' + inr(r.price) + '</span></div>' +
          (ex > 0 ? '<div class="line"><span>After first discount</span><span>' + inr(r.afterFirst) + '</span></div>' : '') +
          working(steps);
        last = 'Price ' + inr(r.price) + ', ' + pctText(d1.value) + '%' + (ex > 0 ? ' + ' + pctText(ex) + '%' : '') + ' off | You pay ' + inr(r.final) + ' | You save ' + inr(r.saved) + ' (' + pctText(r.effectivePct) + '%)';
      } else {
        var filled2 = p.value !== '' && s.value !== '';
        r = filled2 ? calcPct(p.value, s.value) : null;
        if (!r) { out.hidden = true; last = ''; hint.textContent = 'Enter an original price above 0 and a sale price between 0 and the original price.'; hint.hidden = !filled2; return; }
        html = '<div class="big"><span>Discount</span><strong>' + pctText(r.pct) + '%</strong></div>' +
          '<div class="line total"><span>You save</span><span>' + inr(r.saved) + '</span></div>' +
          '<div class="line"><span>Original price</span><span>' + inr(r.original) + '</span></div>' +
          '<div class="line"><span>Sale price</span><span>' + inr(r.sale) + '</span></div>' +
          working(['Amount saved: ' + inr(r.original) + ' − ' + inr(r.sale) + ' = ' + inr(r.saved), 'Discount: ' + inr(r.saved) + ' ÷ ' + inr(r.original) + ' × 100 = ' + pctText(r.pct) + '%']);
        last = 'Original ' + inr(r.original) + ', sale ' + inr(r.sale) + ' | Discount ' + pctText(r.pct) + '% | You save ' + inr(r.saved);
      }
      hint.hidden = true; out.hidden = false; out.innerHTML = html;
    }

    function setMode(m) {
      state.mode = m;
      var sale = m === 'sale';
      $('lp').textContent = 'Original price (₹)';
      $('d1-wrap').hidden = !sale; $('d2-wrap').hidden = !sale; $('s-wrap').hidden = sale;
      if (sale) { p.value = 2500; d1.value = 20; d2.value = 10; } else { p.value = 2000; s.value = 1500; }
      render();
    }
    modeGroup.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]'); if (!b || b.getAttribute('data-v') === state.mode) return;
      Array.prototype.forEach.call(modeGroup.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      setMode(b.getAttribute('data-v'));
    });
    [p, d1, d2, s].forEach(function (e) { e.addEventListener('input', render); });
    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    setMode('sale');
  });
})(typeof window !== 'undefined' ? window : globalThis);
