/* Percentage Calculator: pure functions (testable in node) + DOM wiring (browser only).
   Modes: 'of' (A% of B), 'is' (A is what % of B), 'change' (% change from A to B), 'increase' (B increased by A%), 'decrease' (B decreased by A%). */
(function (root) {
  'use strict';

  var MAX = 1e12;
  var MODES = ['of', 'is', 'change', 'increase', 'decrease'];

  // Strict number parsing: '' / '  ' / null / true must NOT become 0 (Number('') === 0).
  function num(x) {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '') return Number(x);
    return NaN;
  }

  /* Returns { value, diff } or null for invalid input.
     of:       value = A% of B                      diff = value
     is:       value = A / B * 100 (a percentage)   B must not be 0
     change:   value = (B - A) / A * 100            diff = B - A    A must be above 0, B must not be negative
     increase: value = B * (1 + A/100)              diff = B * A / 100     A must be 0 or more
     decrease: value = B * (1 - A/100)              diff = B * A / 100     A must be between 0 and 100 */
  function calcPct(mode, a, b) {
    if (MODES.indexOf(mode) === -1) return null;
    a = num(a); b = num(b);
    if (!isFinite(a) || !isFinite(b) || Math.abs(a) > MAX || Math.abs(b) > MAX) return null;
    switch (mode) {
      case 'of': return { value: a * b / 100, diff: a * b / 100 };
      case 'is': if (b === 0) return null; return { value: a / b * 100, diff: a - b };
      case 'change': if (!(a > 0) || b < 0) return null; return { value: (b - a) / a * 100, diff: b - a };
      case 'increase': if (a < 0) return null; return { value: b * (1 + a / 100), diff: b * a / 100 };
      case 'decrease': if (a < 0 || a > 100) return null; return { value: b * (1 - a / 100), diff: b * a / 100 };
    }
    return null;
  }

  /* 1234.5 -> "1,234.5", 33.33333 -> "33.3333" (up to 4 decimals, trailing zeros removed, Indian digit grouping) */
  function fmt(n) {
    n = Math.round(Number(n) * 1e4) / 1e4;
    if (Object.is(n, -0)) n = 0;
    return n.toLocaleString('en-IN', { maximumFractionDigits: 4 });
  }

  var api = { calcPct: calcPct, fmt: fmt, MODES: MODES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PCT = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var mode = $('mode'), a = $('a'), b = $('b'), out = $('out'), hint = $('hint'), copy = $('copy');
    var CFG = {
      of:       { q: 'What is A% of B?',            la: 'Percentage (%)',  lb: 'Of this number',      da: 15, db: 2000, hint: 'Enter two numbers.' },
      is:       { q: 'A is what % of B?',           la: 'This number (A)', lb: 'Out of (B)',          da: 45, db: 180,  hint: 'Enter two numbers. The second one cannot be 0.' },
      change:   { q: '% change from A to B',        la: 'Old value (A)',   lb: 'New value (B)',       da: 80, db: 100,  hint: 'The old value must be above 0 and the new value cannot be negative.' },
      increase: { q: 'Increase B by A%',            la: 'Increase by (%)', lb: 'Number (B)',          da: 20, db: 500,  hint: 'The percentage cannot be negative.' },
      decrease: { q: 'Decrease B by A%',            la: 'Decrease by (%)', lb: 'Number (B)',          da: 20, db: 500,  hint: 'The percentage must be between 0 and 100.' }
    };
    var last = '';

    function render() {
      var c = CFG[mode.value];
      var filled = a.value !== '' && b.value !== '';
      var r = filled ? calcPct(mode.value, a.value, b.value) : null;
      if (!r) { out.hidden = true; last = ''; hint.textContent = c.hint; hint.hidden = !filled; return; }
      hint.hidden = true; out.hidden = false;
      var A = fmt(num(a.value)), B = fmt(num(b.value)), V = fmt(r.value), D = fmt(r.diff), m = mode.value;
      var big, label, steps, sentence;
      if (m === 'of') {
        label = A + '% of ' + B + ' is'; big = V;
        steps = [A + ' ÷ 100 × ' + B, '= ' + V];
        sentence = A + '% of ' + B + ' is ' + V + '.';
      } else if (m === 'is') {
        label = A + ' is this percent of ' + B; big = V + '%';
        steps = [A + ' ÷ ' + B + ' × 100', '= ' + V + '%'];
        sentence = A + ' is ' + V + '% of ' + B + '.';
      } else if (m === 'change') {
        var dir = r.diff > 0 ? 'increase' : (r.diff < 0 ? 'decrease' : 'no change');
        label = '% change from ' + A + ' to ' + B; big = V + '%';
        steps = ['(' + B + ' − ' + A + ') ÷ ' + A + ' × 100', '= ' + V + '%'];
        sentence = r.diff === 0 ? 'There is no change.' : 'That is a ' + fmt(Math.abs(r.value)) + '% ' + dir + ' (' + (r.diff > 0 ? '+' : '−') + fmt(Math.abs(r.diff)) + ').';
      } else if (m === 'increase') {
        label = B + ' increased by ' + A + '% is'; big = V;
        steps = [B + ' × (1 + ' + A + ' ÷ 100)', '= ' + V];
        sentence = 'The increase is ' + D + ', so ' + B + ' becomes ' + V + '.';
      } else {
        label = B + ' decreased by ' + A + '% is'; big = V;
        steps = [B + ' × (1 − ' + A + ' ÷ 100)', '= ' + V];
        sentence = 'The decrease is ' + D + ', so ' + B + ' becomes ' + V + '.';
      }
      out.innerHTML =
        '<div class="big"><span>' + label + '</span><strong>' + big + '</strong></div>' +
        '<div class="line"><span>In words</span><span>' + sentence + '</span></div>' +
        '<details class="sched"><summary>Show working</summary><div class="sched-scroll"><table><tbody>' +
        steps.map(function (s, i) { return '<tr><th scope="row">Step ' + (i + 1) + '</th><td>' + s + '</td></tr>'; }).join('') +
        '</tbody></table></div></details>';
      last = c.q.replace('A', A).replace('B', B) + ' = ' + big;
    }
    function num(x) { return Number(x); }

    function setMode() {
      var c = CFG[mode.value];
      $('la').textContent = c.la; $('lb').textContent = c.lb;
      a.value = c.da; b.value = c.db;
      render();
    }
    mode.addEventListener('change', setMode);
    a.addEventListener('input', render); b.addEventListener('input', render);

    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    setMode();
  });
})(typeof window !== 'undefined' ? window : globalThis);
