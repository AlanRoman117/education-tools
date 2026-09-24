/*
 * EduTools.speech: say words out loud with the device's built-in voice.
 *
 *   EduTools.speech.speak(13);                     // "thirteen"
 *   EduTools.speech.speak('Great job!', { queue: true });
 *   EduTools.speech.bindMuteButton(buttonElement);
 *
 * Mute is remembered on this device. Browsers only allow speech after the
 * user has tapped something, so call speak() from a tap/click handler.
 */
(function () {
  'use strict';

  var EduTools = (window.EduTools = window.EduTools || {});
  var STORAGE_KEY = 'eduTools.speech.muted';
  var synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  var muted = false;
  var voiceCache = {};

  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    // Storage can be blocked (private mode, file://). Default to sound on.
  }

  if (synth && 'onvoiceschanged' in synth) {
    synth.addEventListener('voiceschanged', function () {
      voiceCache = {};
    });
  }

  // Prefer a voice that matches the language exactly and runs on the device.
  function pickVoice(lang) {
    if (lang in voiceCache) return voiceCache[lang];
    var voices = synth.getVoices();
    var prefix = lang.split('-')[0];
    var exact = voices.filter(function (v) { return v.lang === lang; });
    var close = voices.filter(function (v) { return v.lang.indexOf(prefix) === 0; });
    var pool = exact.length ? exact : close;
    var local = pool.filter(function (v) { return v.localService; });
    var voice = local[0] || pool[0] || null;
    if (voices.length) voiceCache[lang] = voice;
    return voice;
  }

  function setMuted(value) {
    muted = !!value;
    if (muted && synth) synth.cancel();
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch (e) {
      // Not saved; mute still works for this visit.
    }
  }

  EduTools.speech = {
    available: !!synth,

    isMuted: function () {
      return muted;
    },

    setMuted: setMuted,

    toggleMute: function () {
      setMuted(!muted);
      return muted;
    },

    /*
     * options.queue: wait for current speech instead of cutting it off.
     * options.lang, options.rate, options.pitch: passed to the voice.
     */
    speak: function (text, options) {
      if (!synth || muted) return;
      options = options || {};
      if (!options.queue) synth.cancel();
      var utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.85;
      utterance.pitch = options.pitch || 1.1;
      var voice = pickVoice(utterance.lang);
      if (voice) utterance.voice = voice;
      synth.speak(utterance);
    },

    cancel: function () {
      if (synth) synth.cancel();
    },

    /*
     * Wire up a <button class="mute-btn"> (see shared/base.css). The button
     * stays hidden when the device has no voice.
     */
    bindMuteButton: function (button) {
      if (!button) return;
      if (!synth) {
        button.hidden = true;
        return;
      }
      function render() {
        button.setAttribute('aria-pressed', muted ? 'true' : 'false');
        button.title = muted ? 'Turn sound on' : 'Turn sound off';
      }
      button.setAttribute('aria-label', 'Mute');
      button.hidden = false;
      render();
      button.addEventListener('click', function () {
        setMuted(!muted);
        render();
      });
    }
  };
})();
