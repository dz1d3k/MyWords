/* Moje Słowa – prosta aplikacja AAC. Czysty JS, bez frameworków. */
(function () {
  'use strict';

  var LS_FAVS = 'mojeSlowa.favorites';
  var LS_FAVCATS = 'mojeSlowa.favoriteCategories';
  var LS_VOICE = 'mojeSlowa.voiceURI';
  var LS_RATE = 'mojeSlowa.rate';
  var DEFAULT_RATE = 0.9;
  var FAV_ID = '__ulubione';
  var FAV_TILE = { id: FAV_ID, emoji: '⭐', name: 'Ulubione', color: '#FFE082' };

  var vocab = null;          // zawartość vocabulary.json
  var state = { screen: 'home', depth: 0 };
  var lastSpoken = null;     // { emoji, text, image }
  
  var el = {
    list: document.getElementById('list'),
    title: document.getElementById('title'),
    back: document.getElementById('btn-back'),
    home: document.getElementById('btn-home'),
    fav: document.getElementById('btn-fav'),
    last: document.getElementById('lastword'),
    lastEmoji: document.getElementById('lastword-emoji'),
    lastText: document.getElementById('lastword-text'),
    settingsWrap: document.getElementById('settings-wrap'),
    settingsBtn: document.getElementById('btn-settings'),
    dialog: document.getElementById('settings'),
    voiceList: document.getElementById('voice-list'),
    rate: document.getElementById('rate'),
    rateValue: document.getElementById('rate-value'),
    test: document.getElementById('btn-test')
  };

  /* ---------------- localStorage (zawsze w try/catch) ---------------- */
  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* brak pamięci – trudno */ }
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
  var favs = loadList(LS_FAVS);        // ulubione słowa (po tekście)
  var favCats = loadList(LS_FAVCATS);  // ulubione kategorie (po id)
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

  function isPolish(v) {
    return !!v && typeof v.lang === 'string' && v.lang.replace('_', '-').toLowerCase().indexOf('pl') === 0;
  }

  function voiceScore(v) {
    var n = (v.name || '').toLowerCase();
    if (n.indexOf('premium') !== -1) return 3;
    if (n.indexOf('enhanced') !== -1 || n.indexOf('rozszerz') !== -1) return 2;
    if (v.localService) return 1;
    return 0;
  }

  function polishVoices() {
    return voices.filter(isPolish).sort(function (a, b) {
      return voiceScore(b) - voiceScore(a) || String(a.name).localeCompare(String(b.name), 'pl');
    });
  }

  function refreshVoices() {
    try { voices = (synth && synth.getVoices()) || []; } catch (e) { voices = []; }
    if (el.dialog.open) renderVoiceList();
  }

  function chosenVoice() {
    var pl = polishVoices();
    if (!pl.length) return null;
    var uri = lsGet(LS_VOICE);
    if (uri) {
      for (var i = 0; i < pl.length; i++) if (pl[i].voiceURI === uri) return pl[i];
    }
    return pl[0];
  }

  function speak(text) {
    try {
      if (!synth || typeof window.SpeechSynthesisUtterance !== 'function' || !text) return;
      synth.cancel(); // iOS potrafi się zawiesić bez tego
      if (synth.paused && synth.resume) synth.resume();
      var u = new window.SpeechSynthesisUtterance(text);
      u.lang = (vocab && vocab.language) || 'pl-PL';
      u.rate = rate();
      var v = chosenVoice();
      if (v) u.voice = v;
      currentUtterance = u;
      u.onend = u.onerror = function () { if (currentUtterance === u) currentUtterance = null; };
      synth.speak(u);
    } catch (e) {
      /* Brak mowy nie może zatrzymać aplikacji. */
    }
  }

  function say(emoji, text, image) {
    setLast(emoji, text, image);
    speak(text);
  }

  function setLast(emoji, text, image) {
    lastSpoken = { emoji: emoji, text: text, image: image || null };
    clear(el.lastEmoji);
    el.lastEmoji.appendChild(pictureNode(emoji || '💬', image));
    el.lastText.textContent = text;
    el.lastText.classList.remove('placeholder');
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

  // Obrazek (opcjonalne pole "image" w słowniku) albo emoji jako zapas.
  function pictureNode(emoji, image) {
    if (image) {
      var img = document.createElement('img');
      img.className = 'pic';
      img.src = image;
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
    star.setAttribute('aria-label', on ? 'Usuń z ulubionych' : 'Dodaj do ulubionych');
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
    main.appendChild(span('tile-emoji', c.emoji));
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
  }

  function render() {
    clear(el.list);
    var isHome = state.screen === 'home';
    el.back.disabled = isHome;
    el.home.disabled = isHome;
    el.settingsWrap.hidden = !isHome || !vocab;

    if (!vocab) {
      setTitle('', 'Moje Słowa');
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
      setTitle('⭐', 'Ulubione');
      var fc = allCategories().filter(function (c) { return isFavCat(c.id); });
      var fw = favoriteWords();
      if (!fw.length && !fc.length) {
        var e = document.createElement('div');
        e.className = 'empty';
        e.appendChild(span('big', '☆'));
        e.appendChild(document.createTextNode('Nie masz jeszcze ulubionych. Dotknij gwiazdki ☆ obok słowa albo kategorii.'));
        el.list.appendChild(e);
      } else {
        fc.forEach(function (c) { el.list.appendChild(categoryTile(c)); });
        fw.forEach(function (w) { el.list.appendChild(wordTile(w, w.color)); });
      }
    } else {
      setTitle('', 'Moje Słowa');
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
        say('⭐', 'Ulubione');
        return;
      }
      var c = categoryById(cat.getAttribute('data-cat'));
      if (!c) return;
      go({ screen: 'category', cat: c.id }); // najpierw nawigacja…
      say(c.emoji, c.name);                   // …potem mowa
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
  el.last.addEventListener('click', function () { if (lastSpoken) speak(lastSpoken.text); });

  // Pozwala działać :active na iOS dla elementów innych niż przyciski.
  document.addEventListener('touchstart', function () {}, { passive: true });
  // Blokada pinch-zoom w Safari (ignoruje user-scalable=no).
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  /* ---------------- Ustawienia głosu ---------------- */
  function renderVoiceList() {
    clear(el.voiceList);
    var pl = polishVoices();
    if (!pl.length) {
      var p = document.createElement('p');
      p.className = 'none';
      p.textContent = synth
        ? 'Nie znaleziono polskiego głosu. Zostanie użyty głos domyślny. Zobacz podpowiedź poniżej, jak pobrać polski głos.'
        : 'Ta przeglądarka nie obsługuje mowy.';
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
        lsSet(LS_VOICE, v.voiceURI);
        speak('Cześć!');
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

  el.test.addEventListener('click', function () { speak('Cześć! To jest mój głos.'); });

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

  fetch('vocabulary.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!valid(data)) throw new Error('Zły format');
      vocab = data;
      render();
    })
    .catch(function () {
      showError('Nie udało się wczytać słów. Sprawdź połączenie z internetem i otwórz aplikację ponownie.');
    });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline niedostępny */ });
    });
  }
})();
