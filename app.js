/* MeTalk – prosta aplikacja AAC. Czysty JS, bez frameworków. */
(function () {
  'use strict';

  var LS_FAVS = 'mojeSlowa.favorites';
  var LS_FAVCATS = 'mojeSlowa.favoriteCategories';
  var LS_VOICE = 'mojeSlowa.voiceURI';
  var LS_RATE = 'mojeSlowa.rate';
  var DEFAULT_RATE = 0.9;
  var FAV_ID = '__ulubione';
  var LS_LANG = 'mojeSlowa.lang';
  // Klucze wspólne dla urządzenia; wszystkie inne są zapisywane osobno dla każdego użytkownika.
  var LS_USERS = 'mojeSlowa.users';
  var LS_LAST_USER = 'mojeSlowa.lastUser';
  var GLOBAL_KEYS = {};
  GLOBAL_KEYS[LS_USERS] = true;
  GLOBAL_KEYS[LS_LAST_USER] = true;
  var currentUser = null;   // { id, name } zalogowanego użytkownika

  /* ---------------- Języki ----------------
   * Każdy język ma własny plik słownika w tym samym formacie. */
  var LANGS = {
    pl: {
      label: '🇵🇱 Polski', file: 'dictionary/vocabulary.json', speech: 'pl-PL',
      ui: {
        appTitle: 'MeTalk', tapPicture: 'Dotknij obrazka', favorites: 'Ulubione',
        userLabel: 'Użytkownik', chooseUser: 'Wybierz…', addUser: '➕ Dodaj nowego użytkownika', login: 'Zaloguj',
        logout: 'Wyloguj', newUserTitle: 'Nowy użytkownik', namePlaceholder: 'Imię', save: 'Zapisz', cancel: 'Anuluj',
        nameEmpty: 'Wpisz imię.', nameTaken: 'Taki użytkownik już istnieje.',
        logoutQuestion: 'Czy chcesz się wylogować?', yes: 'Tak', no: 'Nie',
        logoutTitle: 'Wylogowanie', logoutInstr: 'Aby się wylogować, wpisz liczbę:', logoutWrong: 'Błędna liczba.',
        deleteUser: 'Usuń użytkownika', deleteTitle: 'Usuń użytkownika', delete: 'Usuń', undo: 'Cofnij',
        deleteInstr: 'Aby usunąć użytkownika „{name}”, przepisz dokładnie jego nazwę i dopisz na końcu 12. Wielkość liter ma znaczenie. Wpisz: {code}',
        deleteWrong: 'Błędnie wpisana wartość.',
        back: 'Wstecz', home: 'Start', stripClear: 'Usuń', stripPlay: 'Odtwórz', stripLeft: 'Przewiń w lewo', stripRight: 'Przewiń w prawo',
        addFav: 'Dodaj do ulubionych', removeFav: 'Usuń z ulubionych',
        emptyFav: 'Nie masz jeszcze ulubionych. Dotknij gwiazdki ☆ obok słowa albo kategorii.',
        language: '🌐 Język', version: 'Wersja aplikacji', dictVersion: 'słownik', settingsBtn: '⚙️ Ustawienia głosu', settingsTitle: 'Ustawienia głosu',
        voice: 'Głos', rate: 'Tempo', test: '🔊 Test', done: 'Gotowe', hintSummary: 'Jak pobrać lepszy głos?',
        hintHtml: '<p><strong>iPhone:</strong> Ustawienia → Dostępność → Treść mówiona → Głosy → Polski. Pobierz głos „Premium” lub „Rozszerzony”, potem wróć tutaj i wybierz go.</p>' +
          '<p><strong>Android:</strong> Ustawienia → Zamiana tekstu na mowę (często w: Ułatwienia dostępu). Wybierz silnik Google, zainstaluj dane głosowe dla języka polskiego.</p>' +
          '<p>Po pobraniu głosu może być potrzebne ponowne uruchomienie aplikacji.</p>',
        noVoice: 'Nie znaleziono polskiego głosu. Zostanie użyty głos domyślny. Zobacz podpowiedź poniżej, jak pobrać polski głos.',
        noSpeech: 'Ta przeglądarka nie obsługuje mowy.',
        hello: 'Cześć!', testPhrase: 'Cześć! To jest mój głos.', langSpoken: 'Polski',
        loadError: 'Nie udało się wczytać słów. Sprawdź połączenie z internetem i otwórz aplikację ponownie.'
      }
    },
    en: {
      label: '🇺🇸 English', file: 'dictionary/vocabulary.en.json', speech: 'en-US',
      ui: {
        appTitle: 'MeTalk', tapPicture: 'Tap a picture', favorites: 'Favorites',
        userLabel: 'User', chooseUser: 'Choose…', addUser: '➕ Add a new user', login: 'Log in',
        logout: 'Log out', newUserTitle: 'New user', namePlaceholder: 'Name', save: 'Save', cancel: 'Cancel',
        nameEmpty: 'Enter a name.', nameTaken: 'This user already exists.',
        logoutQuestion: 'Do you want to log out?', yes: 'Yes', no: 'No',
        logoutTitle: 'Log out', logoutInstr: 'To log out, type the number:', logoutWrong: 'Wrong number.',
        deleteUser: 'Delete user', deleteTitle: 'Delete user', delete: 'Delete', undo: 'Back',
        deleteInstr: 'To delete the user “{name}”, type the name exactly and add 12 at the end. Letter case matters. Type: {code}',
        deleteWrong: 'Wrong value.',
        back: 'Back', home: 'Home', stripClear: 'Delete', stripPlay: 'Play', stripLeft: 'Scroll left', stripRight: 'Scroll right',
        addFav: 'Add to favorites', removeFav: 'Remove from favorites',
        emptyFav: 'No favorites yet. Tap the star ☆ next to a word or a category.',
        language: '🌐 Language', version: 'App version', dictVersion: 'dictionary', settingsBtn: '⚙️ Voice settings', settingsTitle: 'Voice settings',
        voice: 'Voice', rate: 'Speed', test: '🔊 Test', done: 'Done', hintSummary: 'How to get a better voice?',
        hintHtml: '<p><strong>iPhone:</strong> Settings → Accessibility → Spoken Content → Voices → English. Download a “Premium” or “Enhanced” voice, then come back here and choose it.</p>' +
          '<p><strong>Android:</strong> Settings → Text-to-speech output (often under Accessibility). Choose the Google engine and install English voice data.</p>' +
          '<p>You may need to restart the app after downloading a voice.</p>',
        noVoice: 'No English voice found. The default voice will be used. See the tip below on how to download one.',
        noSpeech: 'This browser does not support speech.',
        hello: 'Hello!', testPhrase: 'Hello! This is my voice.', langSpoken: 'English',
        loadError: 'Could not load the words. Check your internet connection and open the app again.'
      }
    }
  };
  var lang = 'pl'; // ustawiany przy logowaniu z ustawień użytkownika
  function L() { return LANGS[lang]; }
  function ui(key) { return L().ui[key]; }
  function lsGetRaw(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }

  var FAV_TILE = { id: FAV_ID, emoji: '⭐', name: '', color: '#FFE082' };

  var vocab = null;          // zawartość vocabulary.json
  var state = { screen: 'home', depth: 0 };
  // Pasek zdania: ostatnie wybrane słowa (same obrazki) i podświetlony kafelek.
  var STRIP_MAX = 30;
  var strip = [];            // [{ emoji, text, image }]
  var hl = null;             // indeks podświetlonego kafelka albo null
  
  var el = {
    list: document.getElementById('list'),
    title: document.getElementById('title'),
    back: document.getElementById('btn-back'),
    home: document.getElementById('btn-home'),
    fav: document.getElementById('btn-fav'),
    stripItems: document.getElementById('strip-items'),
    logout: document.getElementById('btn-logout'),
    loginScreen: document.getElementById('login'),
    userSelect: document.getElementById('user-select'),
    loginBtn: document.getElementById('btn-login'),
    addDialog: document.getElementById('add-user'),
    addForm: document.getElementById('add-user-form'),
    newName: document.getElementById('new-user-name'),
    newErr: document.getElementById('new-user-error'),
    cancelUser: document.getElementById('btn-cancel-user'),
    logoutDialog: document.getElementById('logout-dialog'),
    logoutForm: document.getElementById('logout-form'),
    logoutCode: document.getElementById('logout-code'),
    logoutInput: document.getElementById('logout-input'),
    logoutErr: document.getElementById('logout-error'),
    logoutCancel: document.getElementById('btn-logout-cancel'),
    yesNoDialog: document.getElementById('confirm-yesno'),
    yesNoQuestion: document.getElementById('yesno-question'),
    yesBtn: document.getElementById('btn-yes'),
    noBtn: document.getElementById('btn-no'),
    deleteBtn: document.getElementById('btn-delete-user'),
    deleteDialog: document.getElementById('delete-user'),
    deleteForm: document.getElementById('delete-user-form'),
    deleteInstr: document.getElementById('delete-instr'),
    deleteInput: document.getElementById('delete-confirm'),
    deleteErr: document.getElementById('delete-error'),
    deleteCancel: document.getElementById('btn-delete-cancel'),
    stripClear: document.getElementById('strip-clear'),
    stripPlay: document.getElementById('strip-play'),
    stripLeft: document.getElementById('strip-left'),
    stripRight: document.getElementById('strip-right'),
    settingsWrap: document.getElementById('settings-wrap'),
    settingsBtn: document.getElementById('btn-settings'),
    dialog: document.getElementById('settings'),
    voiceList: document.getElementById('voice-list'),
    rate: document.getElementById('rate'),
    langWrap: document.getElementById('lang-wrap'),
    langSelect: document.getElementById('lang'),
    rateValue: document.getElementById('rate-value'),
    test: document.getElementById('btn-test')
  };

  /* ---------------- localStorage (zawsze w try/catch) ---------------- */
  // Klucz w pamięci: ustawienia zalogowanego użytkownika trafiają do jego własnej „szuflady”.
  function userKey(key, user) {
    var u = user || currentUser;
    if (!u || GLOBAL_KEYS[key]) return key;
    return 'mojeSlowa.u.' + u.id + '.' + key.replace(/^mojeSlowa\./, '');
  }
  function lsGet(key) {
    try { return window.localStorage.getItem(userKey(key)); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try { window.localStorage.setItem(userKey(key), value); } catch (e) { /* brak pamięci – trudno */ }
  }

  function loadJSONList(key) {
    try {
      var arr = JSON.parse(lsGet(key) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function loadList(key) {
    try {
      var arr = JSON.parse(lsGet(key) || '[]');
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function toggleIn(list, key, value) {
    var i = list.indexOf(value);
    if (i === -1) list.push(value); else list.splice(i, 1);
    try { lsSet(key, JSON.stringify(list)); } catch (e) { /* ignoruj */ }
    return i === -1;
  }
  var favs = [];      // ulubione słowa (po tekście) – wczytywane przy logowaniu
  var favCats = [];   // ulubione kategorie (po id)
  function isFav(text) { return favs.indexOf(text) !== -1; }
  function isFavCat(id) { return favCats.indexOf(id) !== -1; }

  // Ulubione na górę, reszta w kolejności słownika. Sortujemy tylko przy
  // rysowaniu ekranu – kliknięcie gwiazdki nie przesuwa kafelka pod palcem.
  function favFirst(items, test) {
    return items.filter(test).concat(items.filter(function (x) { return !test(x); }));
  }

  /* ---------------- Mowa ---------------- */
  var synth = null;
  try { synth = window.speechSynthesis || null; } catch (e) { synth = null; }
  var voices = [];
  var currentUtterance = null; // trzymamy referencję – Chrome potrafi zgubić zdarzenia

  function rate() {
    var r = parseFloat(lsGet(LS_RATE));
    if (!isFinite(r) || r < 0.5 || r > 1.3) r = DEFAULT_RATE;
    return r;
  }

  function voiceLang(v) { return typeof v.lang === 'string' ? v.lang.replace('_', '-').toLowerCase() : ''; }
  function matchesLang(v) { return !!v && voiceLang(v).indexOf(L().speech.slice(0, 2).toLowerCase()) === 0; }

  // Głosy-żarty z iOS/macOS – nie nadają się do AAC, ukrywamy je.
  var NOVELTY = ['albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester',
    'organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox', 'fred', 'junior', 'kathy', 'ralph',
    'deranged', 'hysterical', 'pipe organ'];
  // Starsze, mało naturalne głosy „Eloquence” (iOS 17+) – dostępne, ale na końcu listy.
  var ELOQUENCE = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley'];
  // Dobre domyślne głosy systemowe, gdy nie ma wersji Premium/Rozszerzonej.
  var PREFERRED = ['samantha', 'ava', 'allison', 'susan', 'nicky', 'tom', 'alex', 'aaron', 'evan', 'zoe',
    'google us english', 'zosia', 'krzysztof', 'ewa', 'google polski'];

  function baseName(v) { return String(v.name || '').toLowerCase().replace(/\s*\(.*\)\s*$/, '').trim(); }
  function isNovelty(v) { return NOVELTY.indexOf(baseName(v)) !== -1; }

  function voiceScore(v) {
    var n = String(v.name || '').toLowerCase(), b = baseName(v), sc = 0;
    if (n.indexOf('premium') !== -1) sc += 30;
    else if (n.indexOf('enhanced') !== -1 || n.indexOf('rozszerz') !== -1) sc += 20;
    if (PREFERRED.indexOf(b) !== -1) sc += 10;
    if (ELOQUENCE.indexOf(b) !== -1) sc -= 10;
    if (v.localService) sc += 1;
    return sc;
  }

  // Głosy dla bieżącego języka: najpierw najlepsza jakość, potem dokładny wariant (np. en-US).
  function langVoices() {
    var exact = L().speech.toLowerCase();
    return voices.filter(function (v) { return matchesLang(v) && !isNovelty(v); }).sort(function (a, b) {
      return voiceScore(b) - voiceScore(a) ||
        (voiceLang(b) === exact) - (voiceLang(a) === exact) ||
        String(a.name).localeCompare(String(b.name), 'pl');
    });
  }
  function voiceKey() { return lang === 'pl' ? LS_VOICE : LS_VOICE + '.' + lang; }

  function refreshVoices() {
    try { voices = (synth && synth.getVoices()) || []; } catch (e) { voices = []; }
    if (el.dialog.open) renderVoiceList();
  }

  function chosenVoice() {
    var pl = langVoices();
    if (!pl.length) return null;
    var uri = lsGet(voiceKey());
    if (uri) {
      for (var i = 0; i < pl.length; i++) if (pl[i].voiceURI === uri) return pl[i];
    }
    return pl[0];
  }

  // Stan mowy do diagnostyki w Ustawieniach.
  var speechInfo = { last: '', started: false, error: '', retried: false };

  function makeUtterance(text) {
    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = (vocab && vocab.language) || L().speech;
    u.rate = rate();
    var v = chosenVoice();
    if (v) u.voice = v;
    return u;
  }

  function speak(text) {
    try {
      if (!synth || typeof window.SpeechSynthesisUtterance !== 'function' || !text) return;
      // iOS: cancel() wywołane, gdy nic nie mówi, potrafi „zjeść” następne zdanie –
      // przerywamy tylko wtedy, gdy coś naprawdę mówi albo czeka w kolejce.
      if (synth.speaking || synth.pending) synth.cancel();
      if (synth.paused && synth.resume) synth.resume();
      var u = makeUtterance(text);
      speechInfo = { last: text, started: false, error: '', retried: false };
      currentUtterance = u;
      u.onstart = function () { if (currentUtterance === u) speechInfo.started = true; };
      u.onend = function () { if (currentUtterance === u) currentUtterance = null; };
      u.onerror = function (e) {
        if (currentUtterance === u) { currentUtterance = null; speechInfo.error = (e && e.error) || 'error'; }
      };
      synth.speak(u);
      // Strażnik: jeśli po 2,5 s nic nie zaczęło mówić, silnik utknął – resetujemy i próbujemy raz jeszcze.
      setTimeout(function () {
        try {
          if (currentUtterance !== u || speechInfo.started || speechInfo.error) return;
          speechInfo.retried = true;
          synth.cancel();
          if (synth.resume) synth.resume();
          var u2 = makeUtterance(text);
          currentUtterance = u2;
          u2.onstart = function () { if (currentUtterance === u2) speechInfo.started = true; };
          u2.onend = u2.onerror = function () { if (currentUtterance === u2) currentUtterance = null; };
          synth.speak(u2);
        } catch (e) { /* ignoruj */ }
      }, 2500);
    } catch (e) {
      speechInfo.error = String(e && e.message || e);
      /* Brak mowy nie może zatrzymać aplikacji. */
    }
  }

  // Po powrocie aplikacji z tła iOS potrafi zostawić mowę „zawieszoną” – czyścimy ją.
  document.addEventListener('visibilitychange', function () {
    try {
      if (document.visibilityState === 'visible' && synth) {
        if (synth.speaking || synth.pending) synth.cancel();
        if (synth.paused && synth.resume) synth.resume();
        currentUtterance = null;
      }
    } catch (e) { /* ignoruj */ }
  });

  function speechDiagnostics() {
    var parts = [];
    if (!synth) return 'Mowa: brak w tej przeglądarce';
    var all = 0, mine = 0;
    try { all = synth.getVoices().length; mine = langVoices().length; } catch (e) { /* ignoruj */ }
    var v = chosenVoice();
    parts.push('głosy: ' + all + ' (ten język: ' + mine + ')');
    parts.push('wybrany: ' + (v ? v.name : 'domyślny'));
    parts.push('stan: ' + (synth.speaking ? 'mówi' : 'cisza') + (synth.pending ? ', w kolejce' : '') + (synth.paused ? ', pauza' : ''));
    if (speechInfo.last) {
      parts.push('ostatnio: „' + speechInfo.last.slice(0, 20) + '” ' +
        (speechInfo.error ? 'błąd: ' + speechInfo.error : speechInfo.started ? 'zaczęło mówić' : 'NIE zaczęło mówić') +
        (speechInfo.retried ? ' (ponowiono)' : ''));
    }
    return parts.join(' · ');
  }

  // Słowo: wypowiedz i dopisz na koniec paska zdania.
  function say(emoji, text, image) {
    addToStrip({ emoji: emoji || '', text: text, image: image || null });
    speak(text);
  }

  if (synth) {
    refreshVoices();
    try {
      if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoices);
      else synth.onvoiceschanged = refreshVoices;
    } catch (e) { /* ignoruj */ }
    // Niektóre przeglądarki nie wysyłają voiceschanged – spróbuj jeszcze raz.
    setTimeout(refreshVoices, 500);
    setTimeout(refreshVoices, 2000);
  }

  /* ---------------- Dane ---------------- */
  // Kategoria może mieć opcjonalne podkategorie w polu "categories" (ten sam kształt).
  function subcats(c) { return Array.isArray(c.categories) ? c.categories : []; }

  // Wszystkie kategorie (z podkategoriami) w kolejności słownika.
  function allCategories() {
    var out = [];
    (function walk(list) {
      list.forEach(function (c) { out.push(c); walk(subcats(c)); });
    })(vocab ? vocab.categories : []);
    return out;
  }

  function categoryById(id) {
    var all = allCategories();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  // Ulubione w kolejności słownika, każde słowo raz.
  function favoriteWords() {
    var out = [], seen = {};
    allCategories().forEach(function (c) {
      c.words.forEach(function (w) {
        if (isFav(w.text) && !seen[w.text]) {
          seen[w.text] = true;
          out.push({ emoji: w.emoji, text: w.text, image: w.image, color: c.color });
        }
      });
    });
    return out;
  }

  /* ---------------- Renderowanie ---------------- */
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function span(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text;
    return s;
  }

  // Ścieżki obrazków w słowniku są względne wobec pliku słów (np. "images/x.svg" → dictionary/images/x.svg).
  function dictUrl(path) {
    try { return new URL(path, new URL(L().file, document.baseURI)).href; } catch (e) { return path; }
  }

  // Słownik offline: po wczytaniu zapisujemy oba pliki słów i wszystkie obrazki
  // w osobnej pamięci, niezależnej od wersji aplikacji.
  function cacheDictionary(data) {
    try {
      if (!('caches' in window)) return;
      var urls = Object.keys(LANGS).map(function (k) { return new URL(LANGS[k].file, document.baseURI).href; });
      (function walk(list) {
        list.forEach(function (c) {
          if (c.image) urls.push(dictUrl(c.image));
          c.words.forEach(function (w) { if (w.image) urls.push(dictUrl(w.image)); });
          walk(subcats(c));
        });
      })(data.categories);
      caches.open('moje-slowa-dict').then(function (cache) {
        urls.forEach(function (u) {
          cache.match(u).then(function (hit) { if (!hit) cache.add(u).catch(function () {}); });
        });
      }).catch(function () {});
    } catch (e) { /* bez pamięci offline aplikacja i tak działa */ }
  }

  // Obrazek (opcjonalne pole "image" w słowniku) albo emoji jako zapas.
  function pictureNode(emoji, image) {
    if (image) {
      var img = document.createElement('img');
      img.className = 'pic';
      img.src = dictUrl(image);
      img.alt = '';
      img.draggable = false;
      img.onerror = function () { img.replaceWith(document.createTextNode(emoji || '')); };
      return img;
    }
    // "🍽️❓" = „inny …”: emoji kategorii z małym znakiem zapytania.
    if (emoji && emoji.length > 1 && /❓$/.test(emoji)) {
      var wrap = span('q-wrap', emoji.replace(/❓$/, ''));
      wrap.appendChild(span('q-badge', '❓'));
      return wrap;
    }
    return document.createTextNode(emoji || '');
  }

  // Bardzo długie słowa (np. „niespodzianka”) dostają mniejszą czcionkę,
  // żeby nie łamały się w środku.
  function textSpan(text) {
    var longest = String(text).split(/\s+/).reduce(function (m, x) { return Math.max(m, x.length); }, 0);
    return span('tile-text' + (longest >= 12 ? ' long' : ''), text);
  }

  function starButton(on, attr, value) {
    var star = document.createElement('button');
    star.type = 'button';
    star.setAttribute(attr, value);
    setStar(star, on);
    return star;
  }
  function setStar(star, on) {
    star.className = 'star' + (on ? ' on' : '');
    star.textContent = on ? '★' : '☆';
    star.setAttribute('aria-pressed', on ? 'true' : 'false');
    star.setAttribute('aria-label', on ? ui('removeFav') : ui('addFav'));
  }

  // c = kategoria ze słownika albo specjalny kafelek Ulubionych (bez gwiazdki).
  function categoryTile(c, special) {
    var d = document.createElement('div');
    d.className = 'tile category' + (special ? ' fav-tile' : '');
    d.style.background = c.color;
    var main = document.createElement('button');
    main.type = 'button';
    main.className = 'tile-main';
    main.setAttribute('data-cat', c.id);
    var cpic = span('tile-emoji', '');
    cpic.appendChild(pictureNode(c.emoji, c.image));
    main.appendChild(cpic);
    main.appendChild(textSpan(c.name));
    d.appendChild(main);
    if (!special) d.appendChild(starButton(isFavCat(c.id), 'data-star-cat', c.id));
    return d;
  }

  function wordTile(w, color) {
    var d = document.createElement('div');
    d.className = 'tile word';
    d.style.background = color;

    var main = document.createElement('button');
    main.type = 'button';
    main.className = 'tile-main';
    main.setAttribute('data-say', w.text);
    main.setAttribute('data-emoji', w.emoji);
    if (w.image) main.setAttribute('data-image', w.image);
    var pic = span('tile-emoji', '');
    pic.appendChild(pictureNode(w.emoji, w.image));
    main.appendChild(pic);
    main.appendChild(textSpan(w.text));
    d.appendChild(main);

    d.appendChild(starButton(isFav(w.text), 'data-star', w.text));
    return d;
  }

  function setTitle(emoji, text) {
    clear(el.title);
    if (emoji) el.title.appendChild(span('title-emoji', emoji + ' '));
    el.title.appendChild(document.createTextNode(text));
    fitTitle();
  }

  // Zmniejsza czcionkę tytułu, aż najdłuższe słowo zmieści się w szerokości (bez łamania w środku słowa).
  function fitTitle() {
    var t = el.title;
    t.style.fontSize = '';
    if (!t.clientWidth) return;
    var size = parseFloat(getComputedStyle(t).fontSize) || 18;
    var guard = 0;
    while (t.scrollWidth > t.clientWidth + 1 && size > 11 && guard++ < 20) {
      size -= 1;
      t.style.fontSize = size + 'px';
    }
  }

  function render() {
    clear(el.list);
    var isHome = state.screen === 'home';
    el.back.disabled = isHome;
    el.home.disabled = isHome;
    el.settingsWrap.hidden = !isHome || !vocab;
    if (isHome && hl !== null) { hl = null; renderStrip(false); } // na ekranie startowym nic nie jest podświetlone
    el.langWrap.hidden = !isHome;

    if (!vocab) {
      setTitle('', ui('appTitle'));
      return;
    }

    if (state.screen === 'category') {
      var c = categoryById(state.cat);
      if (!c) { state = { screen: 'home', depth: 0 }; return render(); }
      setTitle(c.emoji, c.name);
      favFirst(subcats(c), function (x) { return isFavCat(x.id); })
        .forEach(function (x) { el.list.appendChild(categoryTile(x)); });
      favFirst(c.words, function (w) { return isFav(w.text); })
        .forEach(function (w) { el.list.appendChild(wordTile(w, c.color)); });
    } else if (state.screen === 'favorites') {
      setTitle('⭐', ui('favorites'));
      var fc = allCategories().filter(function (c) { return isFavCat(c.id); });
      var fw = favoriteWords();
      if (!fw.length && !fc.length) {
        var e = document.createElement('div');
        e.className = 'empty';
        e.appendChild(span('big', '☆'));
        e.appendChild(document.createTextNode(ui('emptyFav')));
        el.list.appendChild(e);
      } else {
        fc.forEach(function (c) { el.list.appendChild(categoryTile(c)); });
        fw.forEach(function (w) { el.list.appendChild(wordTile(w, w.color)); });
      }
    } else {
      setTitle('', ui('appTitle'));
      FAV_TILE.name = ui('favorites');
      el.list.appendChild(categoryTile(FAV_TILE, true));
      favFirst(vocab.categories, function (c) { return isFavCat(c.id); })
        .forEach(function (c) { el.list.appendChild(categoryTile(c)); });
    }
  }

  /* ---------------- Nawigacja ----------------
   * Każde wejście głębiej (kategoria, podkategoria, ulubione) to nowy wpis
   * w historii z licznikiem depth. Wstecz (nasz i systemowy) = poziom w górę,
   * Start = history.go(-depth). Wpis zapamiętuje pozycję przewinięcia. */
  function go(next) {
    next.depth = (state.depth || 0) + 1;
    try {
      history.replaceState(assign(state, { scroll: window.scrollY || 0 }), '');
      history.pushState(next, '');
    } catch (e) { /* history niedostępne – i tak renderujemy */ }
    state = next;
    render();
    window.scrollTo(0, 0);
  }

  function assign(a, b) {
    var o = {}, k;
    for (k in a) o[k] = a[k];
    for (k in b) o[k] = b[k];
    return o;
  }

  function goBack() {
    if (!state.depth) return;
    try { history.back(); } catch (e) { goHomeNow(); }
  }

  function goHome() {
    if (!state.depth) return;
    try { history.go(-state.depth); } catch (e) { goHomeNow(); }
  }

  function goHomeNow() {
    state = { screen: 'home', depth: 0 };
    render();
    window.scrollTo(0, 0);
  }

  window.addEventListener('popstate', function (ev) {
    if (!currentUser) return; // ekran logowania – nawigacja aplikacji nieaktywna
    var s = ev.state;
    if (!s || !s.screen || s.screen === 'home' || !s.depth) s = { screen: 'home', depth: 0, scroll: s && s.scroll };
    if (s.screen === 'category' && !categoryById(s.cat)) s = { screen: 'home', depth: 0 };
    state = s;
    render();
    window.scrollTo(0, s.scroll || 0);
  });

  /* ---------------- Zdarzenia ---------------- */
  el.list.addEventListener('click', function (ev) {
    var t = ev.target;
    var star = t.closest && t.closest('.star');
    if (star) {
      ev.stopPropagation();
      var isCat = star.hasAttribute('data-star-cat');
      var on = isCat
        ? toggleIn(favCats, LS_FAVCATS, star.getAttribute('data-star-cat'))
        : toggleIn(favs, LS_FAVS, star.getAttribute('data-star'));
      if (state.screen === 'favorites') render(); // odznaczone znika z listy
      else setStar(star, on);
      return; // gwiazdka NIE mówi
    }

    var catTile = t.closest && t.closest('.tile.category');
    var cat = catTile && catTile.querySelector('[data-cat]');
    if (cat) {
      if (cat.getAttribute('data-cat') === FAV_ID) {
        go({ screen: 'favorites' });
        speak(ui('favorites'));
        return;
      }
      var c = categoryById(cat.getAttribute('data-cat'));
      if (!c) return;
      go({ screen: 'category', cat: c.id }); // najpierw nawigacja…
      speak(c.name);                          // …potem mowa (kategorie nie trafiają na pasek)
      return;
    }

    var tile = t.closest && t.closest('.tile.word');
    if (tile) {
      var main = tile.querySelector('[data-say]');
      if (main) say(main.getAttribute('data-emoji'), main.getAttribute('data-say'), main.getAttribute('data-image'));
    }
  });

  el.back.addEventListener('click', goBack);
  el.home.addEventListener('click', goHome);
  el.fav.addEventListener('click', function () { if (state.screen !== 'favorites') go({ screen: 'favorites' }); });

  // Pozwala działać :active na iOS dla elementów innych niż przyciski.
  document.addEventListener('touchstart', function () {}, { passive: true });
  // Blokada pinch-zoom w Safari (ignoruje user-scalable=no).
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  /* ---------------- Ustawienia głosu ---------------- */
  function renderVoiceList() {
    clear(el.voiceList);
    var pl = langVoices();
    if (!pl.length) {
      var p = document.createElement('p');
      p.className = 'none';
      p.textContent = synth ? ui('noVoice') : ui('noSpeech');
      el.voiceList.appendChild(p);
      return;
    }
    var current = chosenVoice();
    pl.forEach(function (v) {
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'voice';
      input.value = v.voiceURI;
      input.checked = current && current.voiceURI === v.voiceURI;
      input.addEventListener('change', function () {
        lsSet(voiceKey(), v.voiceURI);
        speak(ui('hello'));
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(v.name + (v.localService === false ? ' (online)' : '')));
      el.voiceList.appendChild(label);
    });
  }

  function syncRate() {
    var pct = Math.round(rate() * 100);
    el.rate.value = String(pct);
    el.rateValue.textContent = pct + '%';
  }

  el.settingsBtn.addEventListener('click', function () {
    refreshVoices();
    renderVoiceList();
    syncRate();
    showDiag();
    try {
      if (typeof el.dialog.showModal === 'function') el.dialog.showModal();
      else el.dialog.setAttribute('open', '');
    } catch (e) { el.dialog.setAttribute('open', ''); }
  });

  el.dialog.addEventListener('close', function () { el.dialog.removeAttribute('open'); });
  // Fallback zamykania dla przeglądarek bez <dialog>.
  el.dialog.querySelector('.close').addEventListener('click', function (e) {
    if (typeof el.dialog.close !== 'function') { e.preventDefault(); el.dialog.removeAttribute('open'); }
  });

  el.rate.addEventListener('input', function () {
    var pct = parseInt(el.rate.value, 10) || 90;
    el.rateValue.textContent = pct + '%';
    lsSet(LS_RATE, String(pct / 100));
  });

  el.test.addEventListener('click', function () {
    speak(ui('testPhrase'));
    setTimeout(showDiag, 300);
    setTimeout(showDiag, 3000);
  });
  function showDiag() {
    var d = document.getElementById('speech-diag');
    if (d) d.textContent = speechDiagnostics();
  }

  /* ---------------- Start ---------------- */
  function showError(msg) {
    clear(el.list);
    var d = document.createElement('div');
    d.className = 'error';
    d.textContent = msg;
    el.list.appendChild(d);
  }

  function validCats(list) {
    return Array.isArray(list) && list.every(function (c) {
      return c && c.id && Array.isArray(c.words) && (c.categories === undefined || validCats(c.categories));
    });
  }
  function valid(v) { return v && validCats(v.categories); }

  // Po przeładowaniu zaczynamy od startu – historia zawsze ma sens.
  state = { screen: 'home', depth: 0 };
  try { history.replaceState(state, ''); } catch (e) { /* ignoruj */ }
  render();

  // Teksty interfejsu w bieżącym języku.
  function applyUi() {
    document.documentElement.lang = lang;
    document.title = ui('appTitle');
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (n) {
      n.textContent = ui(n.getAttribute('data-i18n'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-html]'), function (n) {
      n.innerHTML = ui(n.getAttribute('data-i18n-html')); // stałe teksty z kodu, nie od użytkownika
    });
    el.back.setAttribute('aria-label', ui('back'));
    el.home.setAttribute('aria-label', ui('home'));
    el.fav.setAttribute('aria-label', ui('favorites'));
    el.logout.setAttribute('aria-label', ui('logout'));
    el.newName.setAttribute('placeholder', ui('namePlaceholder'));
    if (!currentUser) fillUserSelect(el.userSelect.value);
    el.stripClear.setAttribute('aria-label', ui('stripClear'));
    el.stripPlay.setAttribute('aria-label', ui('stripPlay'));
    el.stripLeft.setAttribute('aria-label', ui('stripLeft'));
    el.stripRight.setAttribute('aria-label', ui('stripRight'));
    showVersion();
    if (!strip.length) renderStrip(false);
  }

  // „Wersja aplikacji 0.14 · słownik 1.01” – wersja słownika pochodzi z wczytanego pliku.
  function showVersion() {
    var ver = document.getElementById('app-version');
    if (!ver) return;
    var txt = ui('version') + ' ' + (typeof APP_VERSION === 'string' ? APP_VERSION : '?');
    if (vocab && vocab.dictionaryVersion) txt += ' · ' + ui('dictVersion') + ' ' + vocab.dictionaryVersion;
    ver.textContent = txt;
  }

  /* ---------------- Pasek zdania ---------------- */
  function stripKey() { return 'mojeSlowa.strip.' + lang; }

  function loadStrip() {
    strip = loadJSONList(stripKey()).filter(function (x) { return x && typeof x.text === 'string'; }).slice(-STRIP_MAX);
    hl = null;
    renderStrip(true);
  }
  function saveStrip() { try { lsSet(stripKey(), JSON.stringify(strip)); } catch (e) { /* ignoruj */ } }

  function addToStrip(item) {
    strip.push(item);
    if (strip.length > STRIP_MAX) {
      strip.shift();
      if (hl !== null) { hl -= 1; if (hl < 0) hl = null; }
    }
    saveStrip();
    renderStrip(true);
  }

  function renderStrip(scrollToEnd) {
    layoutStrip();
    var keep = el.stripItems.scrollLeft;
    clear(el.stripItems);
    if (!strip.length) {
      el.stripItems.appendChild(span('strip-placeholder', ui('tapPicture')));
    }
    strip.forEach(function (it, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'strip-item' + (i === hl ? ' hl' : '');
      b.setAttribute('data-i', String(i));
      b.setAttribute('aria-label', it.text);
      b.setAttribute('aria-pressed', i === hl ? 'true' : 'false');
      b.appendChild(pictureNode(it.emoji, it.image));
      el.stripItems.appendChild(b);
    });
    el.stripClear.disabled = !strip.length;
    el.stripPlay.disabled = !strip.length;
    el.stripItems.scrollLeft = scrollToEnd ? el.stripItems.scrollWidth : keep;
    updateArrows();
  }

  /* Ile obrazków mieści się na pasku – zależnie od szerokości ekranu:
   * mały telefon 4, telefon 5, mały tablet 8, duży tablet 10 – ale nigdy mniejsze niż STRIP_MIN px
   * (czytelność ważniejsza niż liczba). Miejsce na strzałki jest zawsze zarezerwowane,
   * więc rozmiar się nie zmienia, gdy strzałki się pojawiają. */
  var STRIP_MIN = 52, STRIP_MAXPX = 88, STRIP_GAP = 4, stripPerPage = 4;
  function layoutStrip() {
    var w = el.stripItems.clientWidth - 4; // padding
    if (w <= 0) return;
    var vw = window.innerWidth;
    var target = vw < 375 ? 4 : vw < 480 ? 5 : vw < 900 ? 8 : 10;
    var min = vw < 360 ? 46 : STRIP_MIN; // najmniejszy telefon: trochę mniejsze, żeby zmieściły się 3
    var fit = Math.max(1, Math.floor((w + STRIP_GAP) / (min + STRIP_GAP)));
    var n = Math.max(1, Math.min(target, fit));
    var size = Math.floor((w - STRIP_GAP * (n - 1)) / n);
    size = Math.min(size, STRIP_MAXPX);
    stripPerPage = n;
    el.stripItems.style.setProperty('--strip-item', size + 'px');
  }

  function updateArrows() {
    var s = el.stripItems;
    var overflow = s.scrollWidth > s.clientWidth + 1;
    el.stripLeft.classList.toggle('off', !overflow);
    el.stripRight.classList.toggle('off', !overflow);
    el.stripLeft.disabled = !overflow || s.scrollLeft <= 1;
    el.stripRight.disabled = !overflow || s.scrollLeft + s.clientWidth >= s.scrollWidth - 1;
  }

  el.stripItems.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', function () { layoutStrip(); updateArrows(); });
  function stripPage() { return el.stripItems.clientWidth; } // cała strona = stripPerPage obrazków
  el.stripLeft.addEventListener('click', function () {
    el.stripItems.scrollBy({ left: -stripPage(), behavior: 'smooth' });
  });
  el.stripRight.addEventListener('click', function () {
    el.stripItems.scrollBy({ left: stripPage(), behavior: 'smooth' });
  });

  // Dotknięcie kafelka na pasku: powtórz; podświetl albo – jeśli już był podświetlony – zgaś.
  el.stripItems.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.strip-item');
    if (!b) return;
    var i = parseInt(b.getAttribute('data-i'), 10);
    if (!strip[i]) return;
    speak(strip[i].text);
    hl = (hl === i) ? null : i;
    renderStrip(false);
  });

  // X: usuwa podświetlony kafelek, a gdy nic nie jest podświetlone – cały pasek.
  el.stripClear.addEventListener('click', function () {
    if (!strip.length) return;
    if (hl !== null) strip.splice(hl, 1);
    else strip = [];
    hl = null;
    saveStrip();
    renderStrip(false);
  });

  // Play: bez podświetlenia – wszystko; z podświetleniem – od podświetlonego do końca.
  el.stripPlay.addEventListener('click', function () {
    if (!strip.length) return;
    var from = hl === null ? 0 : hl;
    speak(strip.slice(from).map(function (it) { return it.text; }).join(' '));
  });

  var loadSeq = 0;
  function loadVocab(onLoaded) {
    var seq = ++loadSeq;
    fetch(L().file)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (seq !== loadSeq) return; // w międzyczasie wybrano inny język
        if (!valid(data)) throw new Error('bad format');
        vocab = data;
        render();
        showVersion();
        cacheDictionary(data);
        if (onLoaded) onLoaded();
      })
      .catch(function () {
        if (seq === loadSeq) showError(ui('loadError'));
      });
  }

  Object.keys(LANGS).forEach(function (code) {
    var o = document.createElement('option');
    o.value = code;
    o.textContent = LANGS[code].label;
    el.langSelect.appendChild(o);
  });
  el.langSelect.value = lang;
  el.langSelect.addEventListener('change', function () {
    if (!LANGS[el.langSelect.value] || el.langSelect.value === lang) return;
    lang = el.langSelect.value;
    lsSet(LS_LANG, lang);
    vocab = null;
    loadStrip();
    applyUi();
    render();
    loadVocab(function () { speak(ui('langSpoken')); });
  });

  // Przewijanie do elementu (np. focus, czytnik ekranu) nie chowa go pod przyklejonym nagłówkiem.
  function syncScrollPadding() {
    var h = document.querySelector('header.sticky');
    if (h) document.documentElement.style.scrollPaddingTop = (h.offsetHeight + 8) + 'px';
  }
  window.addEventListener('resize', syncScrollPadding);

  /* Wysokość kafelków dobierana do ekranu: telefon – 5 kafelków na ekranie,
   * mały telefon (niski ekran) – 4. Nigdy mniej niż 80 px i nie więcej niż 140 px. */
  function layoutTiles() {
    var h = document.querySelector('header.sticky');
    if (!h || !h.offsetHeight) return;
    var vh = window.innerHeight;
    var n = vh >= 680 ? 5 : 4;
    var gap = 12, top = 14, bottom = 12;
    var avail = vh - h.offsetHeight - top - bottom;
    var tile = Math.floor((avail - gap * (n - 1)) / n);
    tile = Math.max(80, Math.min(140, tile));
    document.documentElement.style.setProperty('--tile-h', tile + 'px');
  }
  window.addEventListener('resize', layoutTiles);
  window.addEventListener('resize', function () { fitTitle(); });
  window.addEventListener('orientationchange', layoutTiles);

  /* ---------------- Użytkownicy ----------------
   * Profile na tym urządzeniu (bez haseł). Ulubione, język, głos, tempo i pasek zdania
   * są zapisywane osobno dla każdego użytkownika, automatycznie przy każdej zmianie. */
  function loadUsers() {
    return loadJSONList(LS_USERS).filter(function (u) { return u && typeof u.id === 'string' && typeof u.name === 'string'; });
  }
  function saveUsers(list) { lsSet(LS_USERS, JSON.stringify(list)); }
  function userById(id) {
    var list = loadUsers();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function rawGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function rawSet(key, v) { try { window.localStorage.setItem(key, v); } catch (e) { /* ignoruj */ } }

  // Dane sprzed wprowadzenia użytkowników przechodzą do pierwszego utworzonego użytkownika.
  var LEGACY_KEYS = [LS_FAVS, LS_FAVCATS, LS_VOICE, LS_VOICE + '.en', LS_RATE, LS_LANG, 'mojeSlowa.strip.pl', 'mojeSlowa.strip.en'];
  function migrateLegacy(user) {
    LEGACY_KEYS.forEach(function (k) {
      var v = rawGet(k);
      if (v !== null && rawGet(userKey(k, user)) === null) rawSet(userKey(k, user), v);
    });
  }

  function fillUserSelect(selectedId) {
    var users = loadUsers().slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'pl'); });
    clear(el.userSelect);
    var ph = document.createElement('option');
    ph.value = ''; ph.textContent = ui('chooseUser'); ph.disabled = true;
    el.userSelect.appendChild(ph);
    users.forEach(function (u) {
      var o = document.createElement('option');
      o.value = u.id; o.textContent = u.name;
      el.userSelect.appendChild(o);
    });
    var add = document.createElement('option');
    add.value = '__add'; add.textContent = ui('addUser');
    el.userSelect.appendChild(add);
    el.userSelect.value = (selectedId && userById(selectedId)) ? selectedId : '';
    el.loginBtn.disabled = !userById(el.userSelect.value);
    el.deleteBtn.disabled = el.loginBtn.disabled;
  }

  var selectedBeforeAdd = '';
  el.userSelect.addEventListener('focus', function () { selectedBeforeAdd = el.userSelect.value; });
  el.userSelect.addEventListener('change', function () {
    if (el.userSelect.value === '__add') { openAddUser(); return; }
    selectedBeforeAdd = el.userSelect.value;
    el.loginBtn.disabled = !userById(el.userSelect.value);
    el.deleteBtn.disabled = el.loginBtn.disabled;
  });

  function openAddUser() {
    el.newName.value = '';
    el.newErr.hidden = true;
    try {
      if (typeof el.addDialog.showModal === 'function') el.addDialog.showModal();
      else el.addDialog.setAttribute('open', '');
    } catch (e) { el.addDialog.setAttribute('open', ''); }
    setTimeout(function () { try { el.newName.focus(); } catch (e) { /* ignoruj */ } }, 50);
  }
  function closeAddUser() {
    try { if (typeof el.addDialog.close === 'function') el.addDialog.close(); } catch (e) { /* ignoruj */ }
    el.addDialog.removeAttribute('open');
  }
  el.cancelUser.addEventListener('click', function () {
    closeAddUser();
    fillUserSelect(selectedBeforeAdd);
  });
  el.addDialog.addEventListener('cancel', function () { fillUserSelect(selectedBeforeAdd); }); // klawisz Esc
  el.newName.addEventListener('input', function () { el.newErr.hidden = true; });
  el.addForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = el.newName.value.replace(/\s+/g, ' ').trim();
    var users = loadUsers();
    var err = !name ? ui('nameEmpty') :
      users.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); }) ? ui('nameTaken') : '';
    if (err) { el.newErr.textContent = err; el.newErr.hidden = false; return; }
    var user = { id: 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), name: name };
    if (!users.length) migrateLegacy(user);
    users.push(user);
    saveUsers(users);
    closeAddUser();
    fillUserSelect(user.id);
    selectedBeforeAdd = user.id;
  });

  el.loginBtn.addEventListener('click', function () {
    var u = userById(el.userSelect.value);
    if (u) loginAs(u);
  });

  function loginAs(user) {
    currentUser = user;
    rawSet(LS_LAST_USER, user.id);
    lang = LANGS[lsGet(LS_LANG)] ? lsGet(LS_LANG) : 'pl';
    el.langSelect.value = lang;
    favs = loadList(LS_FAVS);
    favCats = loadList(LS_FAVCATS);
    document.body.classList.remove('logged-out');
    state = { screen: 'home', depth: 0 };
    try { history.replaceState(state, ''); } catch (e) { /* ignoruj */ }
    vocab = null;
    applyUi();
    loadStrip();
    render();
    syncScrollPadding();
    layoutTiles();
    fitTitle();
    window.scrollTo(0, 0);
    loadVocab();
  }

  function showLogin() {
    currentUser = null;
    var last = userById(rawGet(LS_LAST_USER));
    // ekran logowania w języku ostatniego użytkownika
    var l = last ? rawGet(userKey(LS_LANG, last)) : null;
    lang = LANGS[l] ? l : 'pl';
    document.body.classList.add('logged-out');
    applyUi();
    fillUserSelect(last ? last.id : '');
    window.scrollTo(0, 0);
  }

  function openDialog(d) {
    try {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } catch (e) { d.setAttribute('open', ''); }
  }
  function closeDialog(d) {
    try { if (typeof d.close === 'function') d.close(); } catch (e) { /* ignoruj */ }
    d.removeAttribute('open');
  }

  // ⏻ – trzeba wpisać wylosowaną liczbę 01–99; duży „Cofnij” wraca do aplikacji.
  var logoutCode = '';
  el.logout.addEventListener('click', function () {
    logoutCode = ('0' + (1 + Math.floor(Math.random() * 99))).slice(-2);
    el.logoutCode.textContent = logoutCode;
    el.logoutInput.value = '';
    el.logoutErr.hidden = true;
    openDialog(el.logoutDialog);
  });
  el.logoutInput.addEventListener('input', function () {
    el.logoutInput.value = el.logoutInput.value.replace(/\D/g, '').slice(0, 2);
    el.logoutErr.hidden = true;
  });
  el.logoutCancel.addEventListener('click', function () { closeDialog(el.logoutDialog); });
  el.logoutDialog.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(el.logoutDialog); });
  el.logoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = el.logoutInput.value.trim();
    // „7” i „07” to ta sama liczba
    if (!v || parseInt(v, 10) !== parseInt(logoutCode, 10)) {
      el.logoutInput.value = '';
      el.logoutErr.textContent = ui('logoutWrong');
      el.logoutErr.hidden = false;
      return;
    }
    closeDialog(el.logoutDialog);
    logout();
  });

  /* Okno Tak/Nie z kciukami 👍 / 👎 – na razie nieużywane (wcześniej potwierdzało wylogowanie).
   * Użycie: askYesNo('Czy…?', function () { …po Tak… }); */
  var yesNoCallback = null;
  function askYesNo(question, onYes) {
    el.yesNoQuestion.textContent = question;
    yesNoCallback = onYes;
    openDialog(el.yesNoDialog);
  }
  el.noBtn.addEventListener('click', function () { yesNoCallback = null; closeDialog(el.yesNoDialog); });
  el.yesBtn.addEventListener('click', function () {
    var cb = yesNoCallback; yesNoCallback = null;
    closeDialog(el.yesNoDialog);
    if (cb) cb();
  });
  window.MeTalk = { askYesNo: askYesNo }; // dostęp do okna Tak/Nie z zewnątrz (np. przyszłe funkcje)

  function logout() {
    try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) { /* ignoruj */ }
    var depth = state.depth || 0;
    state = { screen: 'home', depth: 0 };
    showLogin();
    if (depth) { try { history.go(-depth); } catch (e) { /* ignoruj */ } }
  }

  /* Usuwanie użytkownika – trzeba przepisać nazwę + „12” (wielkość liter ma znaczenie). */
  function deleteCode(u) { return u.name + '12'; }
  el.deleteBtn.addEventListener('click', function () {
    var u = userById(el.userSelect.value);
    if (!u) return;
    el.deleteInstr.textContent = ui('deleteInstr').replace('{name}', u.name).replace('{code}', deleteCode(u));
    el.deleteInput.value = '';
    el.deleteErr.hidden = true;
    openDialog(el.deleteDialog);
    setTimeout(function () { try { el.deleteInput.focus(); } catch (e) { /* ignoruj */ } }, 50);
  });
  el.deleteInput.addEventListener('input', function () { el.deleteErr.hidden = true; });
  el.deleteCancel.addEventListener('click', function () { closeDialog(el.deleteDialog); });
  el.deleteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var u = userById(el.userSelect.value);
    if (!u) { closeDialog(el.deleteDialog); return; }
    if (el.deleteInput.value !== deleteCode(u)) {
      el.deleteInput.value = '';
      el.deleteErr.textContent = ui('deleteWrong');
      el.deleteErr.hidden = false;
      return;
    }
    removeUser(u);
    closeDialog(el.deleteDialog);
    fillUserSelect('');
  });

  function removeUser(u) {
    saveUsers(loadUsers().filter(function (x) { return x.id !== u.id; }));
    var prefix = 'mojeSlowa.u.' + u.id + '.';
    try {
      var keys = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) keys.push(k);
      }
      keys.forEach(function (k) { window.localStorage.removeItem(k); });
      if (rawGet(LS_LAST_USER) === u.id) window.localStorage.removeItem(LS_LAST_USER);
    } catch (e) { /* ignoruj */ }
  }

  showLogin();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline niedostępny */ });
    });
  }
})();
