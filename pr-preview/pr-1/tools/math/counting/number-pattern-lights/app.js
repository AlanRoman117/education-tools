/*
 * Number Pattern Lights
 *
 * The board shows 1–110 in rows of ten. Tapping button k (1–10) lights
 * every number that ends the same way: 1 → 1, 11, 21 … 101 and
 * 10 → 10, 20 … 110. Lit columns stay on; once all ten are lit the board
 * celebrates. Reset turns everything off.
 */
(function () {
  'use strict';

  var MAX = 110;
  var DIGITS = 10;
  var CASCADE_MS = 45;          // keep in sync with --cascade in style.css
  var WAVE_MS = 1800;           // length of the .celebrate wave
  var BANNER_MS = 4000;

  var board = document.getElementById('board');
  var pad = document.getElementById('pad');
  var banner = document.getElementById('banner');
  var status = document.getElementById('status');
  var speech = window.EduTools.speech;

  var cellByNumber = {};
  var buttonByDigit = {};
  var lit = {};                 // digit -> true once its column is lit
  var litCount = 0;
  var celebrated = false;
  var timers = [];

  // Numbers on a 1–max board that end the same way as digit (1–10).
  function columnNumbers(digit, max) {
    var numbers = [];
    for (var n = digit; n <= max; n += 10) numbers.push(n);
    return numbers;
  }

  function columnCells(digit) {
    return columnNumbers(digit, MAX).map(function (n) { return cellByNumber[n]; });
  }

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function buildBoard() {
    for (var n = 1; n <= MAX; n++) {
      var digit = ((n - 1) % DIGITS) + 1;
      var row = Math.floor((n - 1) / DIGITS);
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = n;
      cell.dataset.digit = digit;
      // Placed explicitly so the goal-zone outline can sit behind rows 1–2.
      cell.style.gridRow = String(row + 1);
      cell.style.gridColumn = String(digit);
      cell.style.setProperty('--row', row);
      cell.style.setProperty('--col', digit - 1);
      board.appendChild(cell);
      cellByNumber[n] = cell;
    }
  }

  function buildPad() {
    for (var digit = 1; digit <= DIGITS; digit++) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'pad-btn';
      button.textContent = digit;
      button.dataset.digit = digit;
      button.setAttribute('aria-label', 'Light up ' + digit);
      button.addEventListener('click', onPadClick);
      pad.appendChild(button);
      buttonByDigit[digit] = button;
    }
  }

  function onPadClick(event) {
    tap(Number(event.currentTarget.dataset.digit));
  }

  // Remove and re-add a class so its CSS animation plays again.
  function restartClass(elements, className) {
    elements.forEach(function (el) { el.classList.remove(className); });
    void board.offsetWidth;
    elements.forEach(function (el) { el.classList.add(className); });
  }

  function tap(digit) {
    var cells = columnCells(digit);
    var button = buttonByDigit[digit];

    speech.speak(digit);

    board.querySelectorAll('.cell.newest').forEach(function (el) {
      el.classList.remove('newest');
    });
    cells.forEach(function (el) { el.classList.add('lit'); });
    restartClass(cells, 'newest');
    restartClass([button], 'bounce');
    button.classList.add('on');

    if (!lit[digit]) {
      lit[digit] = true;
      litCount++;
    }

    status.textContent = digit + ': ' + columnNumbers(digit, MAX).join(', ');

    if (litCount === DIGITS && !celebrated) {
      celebrated = true;
      // Let the last column finish lighting before the wave starts.
      later(celebrate, MAX / DIGITS * CASCADE_MS + 500);
    }
  }

  function celebrate() {
    restartClass([board], 'celebrate');
    later(function () { board.classList.remove('celebrate'); }, WAVE_MS);

    banner.classList.remove('hiding');
    banner.hidden = false;
    speech.speak('Great counting!', { queue: true });
    later(hideBanner, BANNER_MS);
  }

  function hideBanner() {
    if (banner.hidden) return;
    banner.classList.add('hiding');
    later(function () {
      banner.hidden = true;
      banner.classList.remove('hiding');
    }, 400);
  }

  function reset() {
    clearTimers();
    speech.cancel();
    board.classList.remove('celebrate');
    board.querySelectorAll('.cell').forEach(function (el) {
      el.classList.remove('lit', 'newest');
    });
    pad.querySelectorAll('.pad-btn').forEach(function (el) {
      el.classList.remove('on', 'bounce');
    });
    banner.hidden = true;
    banner.classList.remove('hiding');
    lit = {};
    litCount = 0;
    celebrated = false;
    status.textContent = 'All lights off.';
  }

  // Keyboard for grown-ups: 1–9, and 0 for 10.
  function onKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!/^[0-9]$/.test(event.key)) return;
    var digit = event.key === '0' ? 10 : Number(event.key);
    buttonByDigit[digit].focus();
    tap(digit);
  }

  buildBoard();
  buildPad();
  speech.bindMuteButton(document.getElementById('mute'));
  document.getElementById('reset').addEventListener('click', reset);
  document.addEventListener('keydown', onKeyDown);
})();
