/* Age Calculator: pure functions (testable in node) + DOM wiring (browser only).
   Dates are 'YYYY-MM-DD' strings. All date arithmetic is done on calendar dates in UTC, so the visitor's time zone and daylight saving never matter.
   Years/months/days: add whole months to the birth date (day clamped to the end of a shorter month), then count the days left over. */
(function (root) {
  'use strict';

  var MIN_YEAR = 1900, MAX_YEAR = 2200;
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var isLeap = function (y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; };
  var dim = function (y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; };
  var dayNo = function (d) { return Math.round(Date.UTC(d.y, d.m - 1, d.d) / 86400000); }; // days since 1970-01-01
  var cmp = function (a, b) { return a.y - b.y || a.m - b.m || a.d - b.d; };

  /* 'YYYY-MM-DD' -> {y, m, d}, or null if it is not a real calendar date between 1900 and 2200. */
  function parse(s) {
    if (typeof s !== 'string') return null;
    var k = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!k) return null;
    var y = +k[1], m = +k[2], d = +k[3];
    if (y < MIN_YEAR || y > MAX_YEAR || m < 1 || m > 12 || d < 1 || d > dim(y, m)) return null;
    return { y: y, m: m, d: d };
  }

  function addMonths(b, n) {
    var t = b.y * 12 + (b.m - 1) + n, y = Math.floor(t / 12), m = t % 12 + 1;
    return { y: y, m: m, d: Math.min(b.d, dim(y, m)) };
  }

  /* Returns null for invalid input or a birth date after the "as on" date. */
  function calcAge(dobStr, asOfStr) {
    var b = parse(dobStr), a = parse(asOfStr);
    if (!b || !a || cmp(b, a) > 0) return null;
    var M = (a.y - b.y) * 12 + (a.m - b.m);
    if (cmp(addMonths(b, M), a) > 0) M--;
    var days = dayNo(a) - dayNo(addMonths(b, M));
    var totalDays = dayNo(a) - dayNo(b);
    // next birthday on or after the "as on" date (29 February birthdays fall on 28 February in non-leap years, the same rule used for the age itself)
    var on = function (y) { return (b.m === 2 && b.d === 29 && !isLeap(y)) ? { y: y, m: 2, d: 28 } : { y: y, m: b.m, d: b.d }; };
    var nb = on(a.y);
    if (cmp(nb, a) < 0) nb = on(a.y + 1);
    var wd = function (d) { return WEEKDAYS[(dayNo(d) % 7 + 11) % 7]; }; // 1970-01-01 was a Thursday
    return {
      years: Math.floor(M / 12), months: M % 12, days: days,
      totalMonths: M, totalWeeks: Math.floor(totalDays / 7), weeksDays: totalDays % 7, totalDays: totalDays,
      bornWeekday: wd(b),
      nextBirthday: nb, nextBirthdayWeekday: wd(nb), daysToBirthday: dayNo(nb) - dayNo(a), turning: nb.y - b.y
    };
  }

  function fmtDate(d) { return d.d + ' ' + MONTHS[d.m - 1] + ' ' + d.y; }

  var api = { calcAge: calcAge, parse: parse, fmtDate: fmtDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AGE = api;

  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (id) { return document.getElementById(id); };
    var dob = $('dob'), asOn = $('ason'), out = $('out'), hint = $('hint'), copy = $('copy'), today = $('today');
    var last = '';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function todayStr() { var t = new Date(); return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()); }
    var plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };

    function render() {
      if (!asOn.value) asOn.value = todayStr();
      if (dob.value === '') { out.hidden = true; hint.hidden = true; last = ''; return; }
      var r = calcAge(dob.value, asOn.value);
      if (!r) {
        out.hidden = true; last = '';
        hint.textContent = !parse(dob.value) || !parse(asOn.value) ? 'Enter a valid date of birth (between 1900 and 2200).' : 'The date of birth must be on or before the "Age as on" date.';
        hint.hidden = false; return;
      }
      hint.hidden = true; out.hidden = false;
      var age = plural(r.years, 'year') + ', ' + plural(r.months, 'month') + ', ' + plural(r.days, 'day');
      var nbText = r.daysToBirthday === 0 ? 'Today! You turn ' + r.turning : fmtDate(r.nextBirthday) + ' (' + r.nextBirthdayWeekday + '), in ' + plural(r.daysToBirthday, 'day');
      out.innerHTML =
        '<div class="big"><span>Your age</span><strong>' + age + '</strong></div>' +
        '<div class="line"><span>Born on</span><span>' + r.bornWeekday + '</span></div>' +
        '<div class="line total"><span>Next birthday</span><span>' + nbText + '</span></div>' +
        '<details class="sched"><summary>Show age in months, weeks and days</summary><div class="sched-scroll"><table><tbody>' +
        '<tr><th scope="row">Total months</th><td>' + r.totalMonths.toLocaleString('en-IN') + '</td></tr>' +
        '<tr><th scope="row">Total weeks</th><td>' + r.totalWeeks.toLocaleString('en-IN') + ' weeks, ' + plural(r.weeksDays, 'day') + '</td></tr>' +
        '<tr><th scope="row">Total days</th><td>' + r.totalDays.toLocaleString('en-IN') + '</td></tr>' +
        '</tbody></table></div></details>';
      last = 'Born ' + fmtDate(parse(dob.value)) + ', age on ' + fmtDate(parse(asOn.value)) + ': ' + age + ' | Next birthday: ' + (r.daysToBirthday === 0 ? 'today' : fmtDate(r.nextBirthday));
    }

    dob.addEventListener('input', render); asOn.addEventListener('input', render);
    today.addEventListener('click', function () { asOn.value = todayStr(); render(); });
    copy.addEventListener('click', function () {
      if (!last) return;
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy result'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(last).then(done, function () {});
      else done();
    });
    render();
  });
})(typeof window !== 'undefined' ? window : globalThis);
