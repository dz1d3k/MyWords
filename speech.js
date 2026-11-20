/* MeTalk – warstwa mowy (TTS) z wykrywaniem platformy.
 *
 * Interfejs (window.MeTalkSpeech):
 *   isNative()                    – true wewnątrz aplikacji Android (Capacitor), false w przeglądarce
 *   isAvailable()                 – czy jest jakikolwiek silnik mowy
 *   speak(text, opts) → Promise   – opts: { lang, rate, pitch, volume, voiceURI }
 *   stop()            → Promise
 *   checkLanguage(lang) → Promise<{ ok, offline, voices: [{ voiceURI, name, lang, localService }] }>
 *   getVoices(lang)   → Promise<[{ voiceURI, name, lang, localService }]>
 *   openInstall()     – Android: otwiera systemową instalację danych głosowych
 *
 * Android: plugin @capacitor-community/text-to-speech (silnik mowy telefonu, działa offline,
 * gdy głos jest pobrany). Wołany przez Capacitor.nativePromise – BEZ importów, więc wersja
 * webowa nie wymaga żadnego kroku budowania i nic się w niej nie psuje.
 *
 * Przeglądarka: Web Speech API. Samo mówienie w przeglądarce nadal robi app.js
 * (sprawdzona na iPhonie logika: wybór głosu, strażnik zawieszonego silnika itd.);
 * ten moduł daje jej tylko wspólne sprawdzenie języka i interfejs.
 */
(function () {
  'use strict';

  var PLUGIN = 'TextToSpeech';

  function cap() { return window.Capacitor; }

  function isNative() {
    try { return !!(cap() && cap().isNativePlatform && cap().isNativePlatform()); } catch (e) { return false; }
  }

  function hasNativeTTS() {
    try {
      var c = cap();
      if (!isNative() || typeof c.nativePromise !== 'function') return false;
      var h = c.PluginHeaders;
      return !h || h.some(function (p) { return p.name === PLUGIN; });
    } catch (e) { return false; }
  }

  function call(method, options) {
    return cap().nativePromise(PLUGIN, method, options || {});
  }

  // Silnik mowy Androida startuje asynchronicznie – pierwsze wywołania mogą się nie udać.
  function withRetry(fn, tries, delay) {
    return fn().catch(function (err) {
      if (tries <= 1) throw err;
      return new Promise(function (res) { setTimeout(res, delay); }).then(function () {
        return withRetry(fn, tries - 1, delay);
      });
    });
  }

  function langPrefix(lang) { return String(lang || '').slice(0, 2).toLowerCase(); }

  /* ---------- Android ---------- */
  var nativeVoices = null; // lista w kolejności zwracanej przez plugin (indeks = numer głosu)

  function loadNativeVoices() {
    return withRetry(function () { return call('getSupportedVoices'); }, 4, 700).then(function (r) {
      nativeVoices = (r && r.voices) || [];
      return nativeVoices;
    });
  }

  function nativeVoiceIndex(voiceURI) {
    if (!voiceURI || !nativeVoices) return -1;
    for (var i = 0; i < nativeVoices.length; i++) if (nativeVoices[i].voiceURI === voiceURI) return i;
    return -1;
  }

  function defaultVoiceIndex(lang) {
    if (!nativeVoices) return -1;
    var any = -1;
    for (var i = 0; i < nativeVoices.length; i++) {
      var v = nativeVoices[i];
      if (langPrefix(v.lang) !== langPrefix(lang)) continue;
      if (v.localService) return i;
      if (any < 0) any = i;
    }
    return any;
  }

  function nativeSpeak(text, o) {
    var opts = {
      text: text,
      lang: o.lang || 'pl-PL',
      rate: typeof o.rate === 'number' ? o.rate : 1.0,
      pitch: typeof o.pitch === 'number' ? o.pitch : 1.0,
      volume: typeof o.volume === 'number' ? o.volume : 1.0,
      queueStrategy: 0 // Flush – nowe słowo przerywa poprzednie
    };
    var idx = nativeVoiceIndex(o.voiceURI);
    if (idx < 0) idx = defaultVoiceIndex(opts.lang); // nic nie wybrano → pierwszy głos offline w tym języku
    if (idx >= 0) opts.voice = idx;
    return call('speak', opts);
  }

  /* ---------- Przeglądarka ---------- */
  function webSynth() { try { return window.speechSynthesis || null; } catch (e) { return null; } }

  function webVoices(lang) {
    var s = webSynth();
    if (!s) return Promise.resolve([]);
    var pick = function () {
      return (s.getVoices() || []).filter(function (v) {
        return langPrefix(String(v.lang).replace('_', '-')) === langPrefix(lang);
      }).map(function (v) {
        return { voiceURI: v.voiceURI, name: v.name, lang: v.lang, localService: v.localService !== false };
      });
    };
    var now = pick();
    if (now.length) return Promise.resolve(now);
    // głosy w przeglądarce ładują się asynchronicznie
    return new Promise(function (res) {
      var done = false;
      var finish = function () { if (!done) { done = true; res(pick()); } };
      try { s.addEventListener('voiceschanged', finish, { once: true }); } catch (e) { /* ignoruj */ }
      setTimeout(finish, 2000);
    });
  }

  /* ---------- Wspólny interfejs ---------- */
  var api = {
    isNative: isNative,

    isAvailable: function () {
      return hasNativeTTS() || !!(webSynth() && typeof window.SpeechSynthesisUtterance === 'function');
    },

    // W przeglądarce mówi app.js (zwraca false, żeby app.js użył swojej ścieżki).
    usesNative: hasNativeTTS,

    speak: function (text, o) {
      if (!text) return Promise.resolve();
      if (hasNativeTTS()) return nativeSpeak(text, o || {});
      return Promise.reject(new Error('web speech handled by app.js'));
    },

    stop: function () {
      if (hasNativeTTS()) return call('stop').catch(function () {});
      try { var s = webSynth(); if (s) s.cancel(); } catch (e) { /* ignoruj */ }
      return Promise.resolve();
    },

    getVoices: function (lang) {
      if (hasNativeTTS()) {
        return (nativeVoices ? Promise.resolve(nativeVoices) : loadNativeVoices()).then(function (all) {
          return all.filter(function (v) { return langPrefix(v.lang) === langPrefix(lang); });
        });
      }
      return webVoices(lang);
    },

    // ok: czy da się mówić w tym języku; offline: czy jest głos działający bez internetu.
    checkLanguage: function (lang) {
      if (hasNativeTTS()) {
        return withRetry(function () { return call('isLanguageSupported', { lang: lang }); }, 4, 700)
          .then(function (r) {
            return api.getVoices(lang).then(function (voices) {
              var offline = voices.some(function (v) { return v.localService; });
              return { ok: !!(r && r.supported) && voices.length > 0, offline: offline, voices: voices };
            });
          })
          .catch(function () { return { ok: false, offline: false, voices: [] }; });
      }
      if (!api.isAvailable()) return Promise.resolve({ ok: false, offline: false, voices: [] });
      return webVoices(lang).then(function (voices) {
        return { ok: voices.length > 0, offline: voices.some(function (v) { return v.localService; }), voices: voices };
      });
    },

    openInstall: function () {
      if (hasNativeTTS()) return call('openInstall').catch(function () {});
      return Promise.resolve();
    }
  };

  window.MeTalkSpeech = api;
})();
