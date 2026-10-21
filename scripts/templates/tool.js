/* {{NAME}} logic: pure function (testable in node) + DOM wiring (browser only). */
(function (root) {
  'use strict';

  function calc(x) {
    x = Number(x);
    if (!isFinite(x) || x < 0) return null;
    return { value: x }; // TODO real calculation
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { calc: calc };
  if (typeof document === 'undefined') return;

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('input1');
    var out = document.getElementById('out');
    function render() {
      var r = calc(input.value);
      if (!r || input.value === '') { out.hidden = true; return; }
      out.hidden = false;
      out.innerHTML = '<div class="line total"><span>Result</span><span>' + r.value + '</span></div>';
    }
    input.addEventListener('input', render);
  });
})(typeof window !== 'undefined' ? window : globalThis);
