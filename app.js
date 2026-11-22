/* MeTalk – prosta aplikacja AAC. Czysty JS, bez frameworków. */
(function () {
  'use strict';

  var LS_FAVS = 'mojeSlowa.favorites';          // stare ulubione – po napisie (czekają na przeniesienie)
  var LS_FAV_IDS = 'mojeSlowa.favoriteWordIds'; // ulubione słowa – po "id" ze słownika
  var LS_FAVCATS = 'mojeSlowa.favoriteCategories';
  var LS_VOICE = 'mojeSlowa.voiceURI';
  var LS_RATE = 'mojeSlowa.rate';
  var LS_VOLUME = 'mojeSlowa.volume';
  var LS_PITCH = 'mojeSlowa.pitch';
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
        logoutTitle: 'Wylogowanie', logoutInstr: 'Aby się wylogować, wpisz cyframi liczbę:', logoutWrong: 'Błędna liczba.',
        editModeBtn: '✏️ Tryb edycji', editModeTitle: 'Tryb edycji', editModeInstr: 'Aby wejść w tryb edycji, wpisz cyframi liczbę:',
        editEnter: 'Wejdź', editBarDone: 'Zakończ edycję', editBarHint: '✏️ Tryb edycji – dotknij ✏️ przy kafelku',
        clipCut: '✂️ Wycięte: {x}', clipCopy: '📋 Skopiowane: {x}', pasteHere: 'Wklej tutaj', pasteGoCategory: '{clip} – wejdź do kategorii i wklej',
        pasteIntoSelf: 'Nie można wkleić kategorii do niej samej.',
        editWord: 'Edytuj kafelek', editCat: 'Edytuj kategorię', newWord: 'Nowy kafelek', newCat: 'Nowa kategoria',
        textLabel: 'Tekst (to powie aplikacja)', nameLabel: 'Nazwa kategorii', emojiPlaceholder: 'Emoji (opcjonalnie), np. 🐰',
        photoBtn: '📷 Zdjęcie z telefonu', resetBtn: '↩️ Przywróć oryginał', cutBtn: '✂️ Wytnij', copyBtn: '📋 Kopiuj',
        deleteBtn: '🗑️ Usuń', restoreBtn: '♻️ Przywróć', textEmpty: 'Wpisz tekst.',
        noSpace: 'Brak miejsca w pamięci – usuń kilka zdjęć albo wybierz mniejsze.', photoError: 'Nie udało się wczytać zdjęcia.',
        addWordTile: '➕ Dodaj kafelek', addCatTile: '➕ Dodaj kategorię', hiddenMark: '(ukryte)',
        deleteUser: 'Usuń użytkownika', deleteTitle: 'Usuń użytkownika', delete: 'Usuń', undo: 'Cofnij',
        deleteInstr: 'Aby usunąć użytkownika „{name}”, przepisz dokładnie jego nazwę i dopisz na końcu 12. Wielkość liter ma znaczenie. Wpisz: {code}',
        deleteWrong: 'Błędnie wpisana wartość.',
        back: 'Wstecz', home: 'Start', stripClear: 'Usuń', stripPlay: 'Odtwórz', stripLeft: 'Przewiń w lewo', stripRight: 'Przewiń w prawo',
        addFav: 'Dodaj do ulubionych', removeFav: 'Usuń z ulubionych',
        emptyFav: 'Nie masz jeszcze ulubionych. Dotknij gwiazdki ☆ obok słowa albo kategorii.',
        volume: 'Głośność', pitch: 'Wysokość głosu', installVoice: 'Zainstaluj głos', gotIt: 'Rozumiem',
        warnNoVoice: '⚠️ Dla opiekuna: w tym urządzeniu nie ma polskiego głosu, więc aplikacja nie będzie mówić.',
        warnNoVoiceNative: ' Dotknij „Zainstaluj głos” i pobierz polski głos (internet potrzebny tylko do pobrania).',
        warnNoVoiceWeb: ' iPhone: Ustawienia → Dostępność → Treść mówiona → Głosy → Polski. Android: Ustawienia → Zamiana tekstu na mowę.',
        warnOnline: '⚠️ Dla opiekuna: polski głos działa tylko z internetem. Pobierz głos offline, żeby aplikacja mówiła zawsze.',
        language: '🌐 Język', version: 'Wersja aplikacji', dictVersion: 'słownik', settingsBtn: '⚙️ Ustawienia głosu', settingsTitle: 'Ustawienia głosu',
        voice: 'Głos', rate: 'Tempo', test: '🔊 Test', done: 'Gotowe',
        voiceFemale: '👩 Głos żeński', voiceMale: '👨 Głos męski', voiceDefault: 'Głos domyślny telefonu',
        updatesBtn: '🔄 Sprawdź aktualizacje', updatesTitle: 'Aktualizacje',
        appVersionTitle: 'Wersja aplikacji', dictVersionTitle: 'Wersja słownika', checking: 'Sprawdzam…', clickHere: 'KLIKNIJ TUTAJ',
        appUpToDate: 'Twoja wersja aplikacji jest aktualna ({cur}).',
        appAvailable: 'Możesz zaktualizować aplikację (Twoja wersja to {cur}, dostępna {new}).',
        dictUpToDate: 'Twoja wersja słownika jest aktualna ({cur}).',
        dictAvailable: 'Możesz zaktualizować słownik (Twoja wersja to {cur}, dostępna {new}).',
        checkFailed: 'Nie udało się sprawdzić. Sprawdź połączenie z internetem.',
        appDownloading: 'Pobieram aktualizację aplikacji…',
        appInstaller: 'Otworzyło się okno instalacji – dotknij „Aktualizuj”. Jeśli Play Protect zaproponuje skanowanie: „Więcej szczegółów” → „Zainstaluj bez skanowania”. Gdy pojawi się „Aplikacja nie została zainstalowana” – kliknij jeszcze raz.',
        appNeedPermission: 'Zezwól MeTalk na instalowanie aplikacji (otworzyły się ustawienia), wróć tutaj i kliknij ponownie.',
        appUpdateFailed: 'Nie udało się zaktualizować aplikacji: {err}',
        appWebReload: 'Wczytuję nową wersję…',
        dictDownloading: 'Pobieram słownik…',
        dictUpdated: 'Słownik zaktualizowany do wersji {new}. Nowe słowa będą widoczne po zalogowaniu.',
        noVoice: 'Nie znaleziono polskiego głosu. Zostanie użyty głos domyślny.',
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
        logoutTitle: 'Log out', logoutInstr: 'To log out, type this number in digits:', logoutWrong: 'Wrong number.',
        editModeBtn: '✏️ Edit mode', editModeTitle: 'Edit mode', editModeInstr: 'To enter edit mode, type this number in digits:',
        editEnter: 'Enter', editBarDone: 'Finish editing', editBarHint: '✏️ Edit mode – tap ✏️ next to a tile',
        clipCut: '✂️ Cut: {x}', clipCopy: '📋 Copied: {x}', pasteHere: 'Paste here', pasteGoCategory: '{clip} – open a category to paste',
        pasteIntoSelf: 'A category cannot be pasted into itself.',
        editWord: 'Edit tile', editCat: 'Edit category', newWord: 'New tile', newCat: 'New category',
        textLabel: 'Text (the app says this)', nameLabel: 'Category name', emojiPlaceholder: 'Emoji (optional), e.g. 🐰',
        photoBtn: '📷 Photo from the phone', resetBtn: '↩️ Restore original', cutBtn: '✂️ Cut', copyBtn: '📋 Copy',
        deleteBtn: '🗑️ Delete', restoreBtn: '♻️ Restore', textEmpty: 'Enter the text.',
        noSpace: 'Out of storage – delete some photos or choose smaller ones.', photoError: 'Could not load the photo.',
        addWordTile: '➕ Add tile', addCatTile: '➕ Add category', hiddenMark: '(hidden)',
        deleteUser: 'Delete user', deleteTitle: 'Delete user', delete: 'Delete', undo: 'Back',
        deleteInstr: 'To delete the user “{name}”, type the name exactly and add 12 at the end. Letter case matters. Type: {code}',
        deleteWrong: 'Wrong value.',
        back: 'Back', home: 'Home', stripClear: 'Delete', stripPlay: 'Play', stripLeft: 'Scroll left', stripRight: 'Scroll right',
        addFav: 'Add to favorites', removeFav: 'Remove from favorites',
        emptyFav: 'No favorites yet. Tap the star ☆ next to a word or a category.',
        volume: 'Volume', pitch: 'Pitch', installVoice: 'Install voice', gotIt: 'Got it',
        warnNoVoice: '⚠️ For the caregiver: this device has no English voice, so the app will not speak.',
        warnNoVoiceNative: ' Tap “Install voice” and download an English voice (internet needed only to download).',
        warnNoVoiceWeb: ' iPhone: Settings → Accessibility → Spoken Content → Voices → English. Android: Settings → Text-to-speech output.',
        warnOnline: '⚠️ For the caregiver: the English voice works only online. Download an offline voice so the app always speaks.',
        language: '🌐 Language', version: 'App version', dictVersion: 'dictionary', settingsBtn: '⚙️ Voice settings', settingsTitle: 'Voice settings',
        voice: 'Voice', rate: 'Speed', test: '🔊 Test', done: 'Done',
        voiceFemale: '👩 Female voice', voiceMale: '👨 Male voice', voiceDefault: 'Phone default voice',
        updatesBtn: '🔄 Check for updates', updatesTitle: 'Updates',
        appVersionTitle: 'App version', dictVersionTitle: 'Dictionary version', checking: 'Checking…', clickHere: 'TAP HERE',
        appUpToDate: 'Your app version is up to date ({cur}).',
        appAvailable: 'You can update the app (your version is {cur}, {new} is available).',
        dictUpToDate: 'Your dictionary version is up to date ({cur}).',
        dictAvailable: 'You can update the dictionary (your version is {cur}, {new} is available).',
        checkFailed: 'Could not check. Check your internet connection.',
        appDownloading: 'Downloading the app update…',
        appInstaller: 'The install window has opened – tap “Update”. If Play Protect suggests a scan: “More details” → “Install without scanning”. If you see “App not installed”, tap again.',
        appNeedPermission: 'Allow MeTalk to install apps (settings have opened), come back here and tap again.',
        appUpdateFailed: 'Could not update the app: {err}',
        appWebReload: 'Loading the new version…',
        dictDownloading: 'Downloading the dictionary…',
        dictUpdated: 'Dictionary updated to version {new}. New words will show after logging in.',
        noVoice: 'No English voice found. The default voice will be used.',
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

  var vocab = null;          // słownik do wyświetlania: vocabulary.json + zmiany użytkownika (applyCustom)
  var baseVocab = null;      // sam słownik (z paczki albo pobrany z internetu), bez zmian użytkownika
  var editMode = false;      // tryb edycji (wejście z ekranu logowania, po teście z liczbą)
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
    editModeBtn: document.getElementById('btn-edit-mode'),
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
    volume: document.getElementById('volume'),
    volumeValue: document.getElementById('volume-value'),
    pitch: document.getElementById('pitch'),
    pitchValue: document.getElementById('pitch-value'),
    voiceWarning: document.getElementById('voice-warning'),
    voiceWarningText: document.getElementById('voice-warning-text'),
    installVoice: document.getElementById('btn-install-voice'),
    hideWarning: document.getElementById('btn-hide-warning'),
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
  // Ulubione słowa są zapisywane po "id" słowa, nie po napisie – zmiana napisu w słowniku
  // nie gubi gwiazdki, a te same id w PL i EN dają wspólne ulubione dla obu języków.
  var favs = [];        // ulubione słowa (po id) – wczytywane przy logowaniu
  var legacyFavs = [];  // stare ulubione po napisie, jeszcze nieprzeniesione na id
  var favCats = [];     // ulubione kategorie (po id)
  function isFav(w) { return !!w.id && favs.indexOf(w.id) !== -1; }
  function isFavCat(id) { return favCats.indexOf(id) !== -1; }

  // Jednorazowe przeniesienie starych ulubionych (napisy) na id słów z wczytanego słownika.
  // Słowo, które zmieniło nazwę, ma w słowniku "formerly": [dawne napisy] – wtedy stara gwiazdka
  // trafia tylko do niego. Bez "formerly" napis pasuje do każdego słowa o takim napisie (jak dawniej).
  // Napisy z drugiego języka czekają, aż ten język zostanie wczytany.
  function migrateFavs() {
    if (!legacyFavs.length || !vocab) return;
    var byFormer = {}, byText = {};
    allCategories().forEach(function (c) {
      c.words.forEach(function (w) {
        if (!w.id) return;
        (w.formerly || []).forEach(function (t) { (byFormer[t] = byFormer[t] || []).push(w.id); });
        (byText[w.text] = byText[w.text] || []).push(w.id);
      });
    });
    var left = legacyFavs.filter(function (t) {
      var ids = byFormer[t] || byText[t];
      if (!ids) return true;
      ids.forEach(function (id) { if (favs.indexOf(id) === -1) favs.push(id); });
      return false;
    });
    if (left.length === legacyFavs.length) return;
    legacyFavs = left;
    lsSet(LS_FAV_IDS, JSON.stringify(favs));
    lsSet(LS_FAVS, JSON.stringify(legacyFavs));
  }

  // Ulubione na górę, reszta w kolejności słownika. Sortujemy tylko przy
  // rysowaniu ekranu – kliknięcie gwiazdki nie przesuwa kafelka pod palcem.
  function favFirst(items, test) {
    return items.filter(test).concat(items.filter(function (x) { return !test(x); }));
  }
  // „Inna …” / „Inne …” (emoji kończy się na ❓) – zawsze na końcu swojej grupy:
  // ulubione „Inne” na końcu ulubionych, pozostałe „Inne” na samym końcu kategorii.
  function isOther(w) { return /❓$/.test(String(w.emoji || '')); }
  function othersLast(words) {
    return words.filter(function (w) { return !isOther(w); }).concat(words.filter(isOther));
  }

  /* ---------------- Mowa ---------------- */
  var synth = null;
  try { synth = window.speechSynthesis || null; } catch (e) { synth = null; }
  var voices = [];
  var currentUtterance = null; // trzymamy referencję – Chrome potrafi zgubić zdarzenia

  function volume() {
    var v = parseFloat(lsGet(LS_VOLUME));
    return isFinite(v) && v >= 0.1 && v <= 1 ? v : 1;
  }
  function pitch() {
    var p = parseFloat(lsGet(LS_PITCH));
    return isFinite(p) && p >= 0.5 && p <= 1.5 ? p : 1;
  }
  function TTS() { return window.MeTalkSpeech || null; }
  function nativeTTS() { try { return !!(TTS() && TTS().usesNative()); } catch (e) { return false; } }

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

  /* Głos żeński / męski – w Ustawieniach zamiast listy technicznych nazw głosów.
   * Silniki mowy nie podają płci głosu, więc rozpoznajemy ją po nazwie: kody głosów Google
   * (np. pl-pl-x-oda-local) i nazwy głosów Apple/Microsoft (np. Zosia, Krzysztof).
   * Kolejność na listach = pierwszeństwo przy wyborze; głos offline zawsze przed głosem z internetu. */
  var FEMALE_VOICES = ['oda', 'afb', 'zfg', 'sfg', 'tpf', 'iob', 'iog', 'tpc',
    'zosia', 'ewa', 'paulina', 'agnieszka', 'maja', 'samantha', 'ava', 'allison', 'susan', 'nicky', 'zoe',
    'karen', 'moira', 'tessa', 'victoria', 'female'];
  var MALE_VOICES = ['bmg', 'jmk', 'imk', 'iom', 'iol', 'tpd',
    'krzysztof', 'jacek', 'adam', 'tom', 'alex', 'aaron', 'evan', 'daniel', 'male'];
  function genderKey() { return lang === 'pl' ? 'mojeSlowa.voiceGender' : 'mojeSlowa.voiceGender.' + lang; }
  function voiceTokens(v) { return (String(v.name || '') + ' ' + String(v.voiceURI || '')).toLowerCase().split(/[^a-z]+/); }
  function genderRank(v, names) {
    var best = -1;
    voiceTokens(v).forEach(function (t) {
      var i = names.indexOf(t);
      if (i !== -1 && (best === -1 || i < best)) best = i;
    });
    return best;
  }
  function voiceGender(v) {
    if (genderRank(v, FEMALE_VOICES) !== -1) return 'f';
    if (genderRank(v, MALE_VOICES) !== -1) return 'm';
    return '';
  }
  function isOfflineVoice(v) { return v.localService !== false && !/network/i.test(String(v.voiceURI || '')); }
  function bestVoiceOf(list, g) {
    var names = g === 'f' ? FEMALE_VOICES : MALE_VOICES;
    return list.filter(function (v) { return voiceGender(v) === g; }).sort(function (a, b) {
      return (isOfflineVoice(b) - isOfflineVoice(a)) || (genderRank(a, names) - genderRank(b, names)) ||
        (voiceScore(b) - voiceScore(a));
    })[0] || null;
  }
  // Wybrana płeć: zapisana w Ustawieniach, a dla starszych ustawień – płeć dawniej wybranego głosu; domyślnie żeński.
  function chosenGender(list) {
    var g = lsGet(genderKey());
    if (g === 'f' || g === 'm') return g;
    var uri = lsGet(voiceKey());
    for (var i = 0; uri && i < list.length; i++) {
      if (list[i].voiceURI === uri && voiceGender(list[i])) return voiceGender(list[i]);
    }
    return 'f';
  }
  // Głos do mówienia z listy głosów języka; null = domyślny głos silnika.
  function genderVoice(list) {
    if (!list || !list.length) return null;
    var g = chosenGender(list);
    return bestVoiceOf(list, g) || bestVoiceOf(list, g === 'f' ? 'm' : 'f');
  }

  // Głosy telefonu (Android) – lista wczytywana w tle, żeby speak() mógł wybrać głos od razu.
  var nativeVoiceCache = {};
  function loadNativeVoices() {
    if (!nativeTTS()) return;
    var forLang = lang;
    TTS().getVoices(L().speech).then(function (list) { nativeVoiceCache[forLang] = list || []; }).catch(function () {});
  }
  function nativeVoiceURI() {
    var v = genderVoice(nativeVoiceCache[lang]);
    return v ? v.voiceURI : lsGet(voiceKey());
  }

  function chosenVoice() {
    var pl = langVoices();
    if (!pl.length) return null;
    return genderVoice(pl) || pl[0];
  }

  // Stan mowy do diagnostyki w Ustawieniach.
  var speechInfo = { last: '', started: false, error: '', retried: false };

  function makeUtterance(text) {
    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = (vocab && vocab.language) || L().speech;
    u.rate = rate();
    u.volume = volume();
    u.pitch = pitch();
    var v = chosenVoice();
    if (v) u.voice = v;
    return u;
  }

  function speak(text) {
    // Android (Capacitor): mowa przez silnik telefonu (plugin), działa offline.
    if (text && nativeTTS()) {
      speechInfo = { last: text, started: false, error: '', retried: false };
      TTS().speak(text, {
        lang: (vocab && vocab.language) || L().speech,
        rate: rate(), pitch: pitch(), volume: volume(),
        voiceURI: nativeVoiceURI()
      }).then(function () { speechInfo.started = true; })
        .catch(function (e) { speechInfo.error = String(e && e.message || e); });
      speechInfo.started = true; // plugin mówi od razu; zakończenie zgłasza po wypowiedzeniu
      return;
    }
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
    if (nativeTTS()) {
      parts.push('silnik: Android TTS');
      parts.push('głos: ' + (nativeVoiceURI() || 'domyślny'));
      if (speechInfo.last) parts.push('ostatnio: „' + speechInfo.last.slice(0, 20) + '” ' + (speechInfo.error ? 'błąd: ' + speechInfo.error : 'OK'));
      return parts.join(' · ');
    }
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
        if (isFav(w) && !seen[w.id]) {
          seen[w.id] = true;
          out.push({ id: w.id, emoji: w.emoji, text: w.text, image: w.image, color: c.color });
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
      img.src = remoteImages[image] || dictUrl(image);
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
    if (!special) {
      if (editMode) {
        if (c._hidden) d.classList.add('is-hidden');
        d.appendChild(editButton('data-edit-cat', c.id));
      } else d.appendChild(starButton(isFavCat(c.id), 'data-star-cat', c.id));
    }
    return d;
  }
  // Tryb edycji: ✏️ zamiast gwiazdki.
  function editButton(attr, id) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'star edit-btn';
    b.setAttribute(attr, id);
    b.textContent = '✏️';
    return b;
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

    if (editMode && w.id) {
      if (w._hidden) d.classList.add('is-hidden');
      d.appendChild(editButton('data-edit-word', w.id));
    } else if (w.id) d.appendChild(starButton(isFav(w), 'data-star', w.id));
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
    if (isHome && remoteDictPending) setTimeout(applyPendingDict, 0); // nowy słownik z internetu czekał na ekran startowy

    if (!vocab) {
      setTitle('', ui('appTitle'));
      return;
    }

    if (state.screen === 'category') {
      var c = categoryById(state.cat);
      if (!c) { state = { screen: 'home', depth: 0 }; return render(); }
      setTitle(c.emoji, c.name);
      // Kolejność: ulubione (podkategorie, słowa, „Inne”), potem reszta (podkategorie, słowa, „Inne”).
      var favCatOn = function (x) { return isFavCat(x.id); };
      var subs = subcats(c);
      var addCat = function (x) { el.list.appendChild(categoryTile(x)); };
      var addWord = function (w) { el.list.appendChild(wordTile(w, c.color)); };
      subs.filter(favCatOn).forEach(addCat);
      othersLast(c.words.filter(isFav)).forEach(addWord);
      subs.filter(function (x) { return !favCatOn(x); }).forEach(addCat);
      othersLast(c.words.filter(function (w) { return !isFav(w); })).forEach(addWord);
      if (editMode) {
        el.list.appendChild(addTile('word', ui('addWordTile')));
        el.list.appendChild(addTile('cat', ui('addCatTile')));
      }
    } else if (state.screen === 'favorites') {
      setTitle('⭐', ui('favorites'));
      var fc = allCategories().filter(function (c) { return isFavCat(c.id); });
      var fw = othersLast(favoriteWords());
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
      if (editMode) el.list.appendChild(addTile('cat', ui('addCatTile')));
    }
    updateEditBar();
  }
  function addTile(kind, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile add-tile';
    b.setAttribute('data-add', kind);
    b.textContent = label;
    return b;
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
    if (editMode && t.closest) {
      var eb = t.closest('.edit-btn');
      if (eb) {
        ev.stopPropagation();
        if (eb.hasAttribute('data-edit-cat')) openEditor('cat', eb.getAttribute('data-edit-cat'));
        else openEditor('word', eb.getAttribute('data-edit-word'));
        return;
      }
      var at = t.closest('[data-add]');
      if (at) { openEditor(at.getAttribute('data-add'), null); return; }
      var wt = t.closest('.tile.word');
      var wb = wt && wt.querySelector('[data-edit-word]');
      if (wb) { openEditor('word', wb.getAttribute('data-edit-word')); return; } // w edycji słowo nie mówi
    }
    var star = t.closest && t.closest('.star');
    if (star) {
      ev.stopPropagation();
      var isCat = star.hasAttribute('data-star-cat');
      var on = isCat
        ? toggleIn(favCats, LS_FAVCATS, star.getAttribute('data-star-cat'))
        : toggleIn(favs, LS_FAV_IDS, star.getAttribute('data-star'));
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
  // Ustawienia: tylko „Głos żeński” / „Głos męski” (ta płeć, dla której telefon ma głos).
  // Gdy telefon ma głosy, ale żadnego nie rozpoznamy – jedna opcja „Głos domyślny telefonu”.
  function renderGenderList(list, emptyMsg) {
    clear(el.voiceList);
    if (!list.length) {
      var p = document.createElement('p');
      p.className = 'none';
      p.textContent = emptyMsg;
      el.voiceList.appendChild(p);
      return;
    }
    var options = [['f', ui('voiceFemale')], ['m', ui('voiceMale')]].filter(function (o) { return bestVoiceOf(list, o[0]); });
    if (!options.length) options = [['', ui('voiceDefault')]];
    var current = genderVoice(list);
    var currentG = current ? voiceGender(current) : '';
    options.forEach(function (o) {
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'voice';
      input.value = o[0];
      input.checked = o[0] === currentG;
      input.addEventListener('change', function () {
        if (!o[0]) return;
        lsSet(genderKey(), o[0]);
        speak(ui('hello'));
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(o[1]));
      el.voiceList.appendChild(label);
    });
  }

  function renderNativeVoiceList() {
    clear(el.voiceList);
    var forLang = lang;
    TTS().getVoices(L().speech).then(function (list) {
      nativeVoiceCache[forLang] = list || [];
      if (forLang === lang) renderGenderList(list || [], ui('noVoice'));
    }).catch(function () { /* brak listy – zostaje pusto */ });
  }

  function renderVoiceList() {
    if (nativeTTS()) { renderNativeVoiceList(); return; }
    renderGenderList(langVoices(), synth ? ui('noVoice') : ui('noSpeech'));
  }

  function syncRate() {
    var pct = Math.round(rate() * 100);
    el.rate.value = String(pct);
    el.rateValue.textContent = pct + '%';
    var vol = Math.round(volume() * 100);
    el.volume.value = String(vol);
    el.volumeValue.textContent = vol + '%';
    var pit = Math.round(pitch() * 100);
    el.pitch.value = String(pit);
    el.pitchValue.textContent = pit + '%';
  }
  el.volume.addEventListener('input', function () {
    var v = parseInt(el.volume.value, 10) || 100;
    el.volumeValue.textContent = v + '%';
    lsSet(LS_VOLUME, String(v / 100));
  });
  el.pitch.addEventListener('input', function () {
    var v = parseInt(el.pitch.value, 10) || 100;
    el.pitchValue.textContent = v + '%';
    lsSet(LS_PITCH, String(v / 100));
  });

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

  /* ---------------- Sprawdzenie głosu (komunikat dla opiekuna) ---------------- */
  var warningDismissed = {};
  function checkVoice() {
    var tts = TTS();
    if (!tts) return;
    var forLang = lang;
    tts.checkLanguage(L().speech).then(function (r) {
      if (forLang !== lang || !currentUser) return;
      var msg = '';
      if (!r.ok) msg = ui('warnNoVoice') + (tts.usesNative() ? ui('warnNoVoiceNative') : ui('warnNoVoiceWeb'));
      else if (tts.usesNative() && !r.offline) msg = ui('warnOnline');
      el.installVoice.hidden = !tts.usesNative();
      el.voiceWarningText.textContent = msg;
      el.voiceWarning.hidden = !msg || !!warningDismissed[lang];
    }).catch(function () { /* brak sprawdzenia – bez komunikatu */ });
  }
  el.hideWarning.addEventListener('click', function () {
    warningDismissed[lang] = true; // do następnego uruchomienia aplikacji
    el.voiceWarning.hidden = true;
  });
  el.installVoice.addEventListener('click', function () { if (TTS()) TTS().openInstall(); });

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

  /* ---------------- Zdalny słownik (aplikacja Android) ----------------
   * Strona (PWA) dostaje nowy słownik przez service workera. Aplikacja Android ma słownik w paczce APK,
   * więc sama sprawdza w internecie (GitHub Pages), czy jest nowszy "dictionaryVersion".
   * Nowy słownik jest przyjmowany w całości albo wcale: oba języki + wszystkie obrazki (jako data: URL),
   * zapisane w pamięci telefonu – działa potem bez internetu. Starszy lub zepsuty słownik z sieci
   * jest ignorowany; słownik z APK zawsze zostaje jako zapas.
   * Nowe słowa pojawiają się po powrocie na ekran startowy, żeby kafelki nie zmieniały się pod palcem. */
  var REMOTE_DICT_BASE = 'https://dz1d3k.github.io/MyWords/';
  var LS_REMOTE_DICT = 'mojeSlowa.remoteDictionary';
  var LS_REMOTE_BASE = 'mojeSlowa.remoteDictionaryBase'; // tylko do testów: inny adres słownika
  var REMOTE_CHECK_EVERY = 6 * 60 * 60 * 1000;          // telefon w trybie kiosku może nie być restartowany
  GLOBAL_KEYS[LS_REMOTE_DICT] = true;
  GLOBAL_KEYS[LS_REMOTE_BASE] = true;
  var remoteImages = {};      // obrazki aktualnie używanego zdalnego słownika: ścieżka → data: URL
  var remoteDictPending = false;
  var remoteCheckedAt = 0, remoteChecking = false;

  function remoteBase() { return rawGet(LS_REMOTE_BASE) || REMOTE_DICT_BASE; }
  function remoteDictEnabled() { return isNativeApp() || !!rawGet(LS_REMOTE_BASE); }

  // "1.10" > "1.9" – porównanie liczb po kropkach.
  function versionNewer(a, b) {
    var pa = String(a || '0').split('.'), pb = String(b || '0').split('.');
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = parseInt(pa[i] || '0', 10) || 0, y = parseInt(pb[i] || '0', 10) || 0;
      if (x !== y) return x > y;
    }
    return false;
  }
  function eachWord(data, fn) {
    (function walk(list) {
      list.forEach(function (c) { c.words.forEach(function (w) { fn(w, c); }); walk(subcats(c)); });
    })(data.categories);
  }
  function hasWordIds(data) {
    var ok = true;
    eachWord(data, function (w) { if (typeof w.id !== 'string' || !w.id) ok = false; });
    return ok;
  }
  function storedRemoteDict() {
    try {
      var s = JSON.parse(rawGet(LS_REMOTE_DICT) || 'null');
      return s && s.version && s.files && s.images ? s : null;
    } catch (e) { return null; }
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }
  function fetchOk(url, asJson) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return asJson ? r.json() : r.blob();
    });
  }

  // Wersja słownika, którego aplikacja teraz używa: z paczki albo nowsza, pobrana wcześniej z internetu.
  function currentDictVersion() {
    return fetch(L().file).then(function (r) { return r.json(); }).then(function (data) {
      var v = data.dictionaryVersion;
      var s = remoteDictEnabled() ? storedRemoteDict() : null;
      return s && versionNewer(s.version, v) ? s.version : v;
    });
  }

  // Oba pliki słów z internetu → { version, files, list }; błąd, gdy zepsute albo wersje PL/EN się różnią.
  function fetchRemoteDictFiles() {
    var base = remoteBase(), codes = Object.keys(LANGS);
    return Promise.all(codes.map(function (k) { return fetchOk(new URL(LANGS[k].file, base).href, true); }))
      .then(function (list) {
        var files = {}, version = null;
        list.forEach(function (data, i) {
          if (!valid(data) || !hasWordIds(data)) throw new Error('bad format');
          if (version === null) version = data.dictionaryVersion;
          if (data.dictionaryVersion !== version) throw new Error('versions differ');
          files[LANGS[codes[i]].file] = data;
        });
        return { version: version, files: files, list: list, dictFile: new URL(LANGS[codes[0]].file, base).href };
      });
  }

  // Pobiera słownik nowszy niż `have` razem ze wszystkimi obrazkami i zapisuje w telefonie.
  // Wszystko albo nic. Promise<nowa wersja>; błąd 'not newer', gdy w internecie nie ma nowszego.
  function downloadRemoteDict(have) {
    return fetchRemoteDictFiles().then(function (r) {
      if (!versionNewer(r.version, have)) throw new Error('not newer');
      var paths = {};
      r.list.forEach(function (data) {
        (function walk(cats) {
          cats.forEach(function (c) {
            if (c.image) paths[c.image] = true;
            c.words.forEach(function (w) { if (w.image) paths[w.image] = true; });
            walk(subcats(c));
          });
        })(data.categories);
      });
      var images = {};
      return Promise.all(Object.keys(paths).map(function (p) {
        return fetchOk(new URL(p, r.dictFile).href, false)
          .then(blobToDataUrl)
          .then(function (url) { images[p] = url; });
      })).then(function () {
        window.localStorage.setItem(LS_REMOTE_DICT, JSON.stringify({ version: r.version, files: r.files, images: images }));
        remoteDictPending = true;
        return r.version;
      });
    });
  }

  // Automatycznie: przy starcie i co 6 godzin (aplikacja Android).
  function checkRemoteDict() {
    if (!remoteDictEnabled() || remoteChecking || !vocab) return;
    if (Date.now() - remoteCheckedAt < REMOTE_CHECK_EVERY) return;
    remoteChecking = true;
    remoteCheckedAt = Date.now();
    var have = vocab.dictionaryVersion;
    var stored = storedRemoteDict();
    if (stored && versionNewer(stored.version, have)) have = stored.version;
    downloadRemoteDict(have)
      .then(function () { if (state.screen === 'home') applyPendingDict(); })
      .catch(function () { /* brak internetu, starszy lub zepsuty słownik – zostaje obecny */ })
      .then(function () { remoteChecking = false; });
  }
  function applyPendingDict() {
    if (!remoteDictPending || !currentUser) return;
    remoteDictPending = false;
    loadVocab();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && currentUser) checkRemoteDict();
  });

  /* ---------------- Sprawdź aktualizacje (ekran logowania) ----------------
   * Przycisk tylko SPRAWDZA i pokazuje stan aplikacji i słownika. Aktualizuje dopiero „KLIKNIJ TUTAJ”:
   *  - aplikacja Android: plugin AppUpdater pobiera APK z releases/latest.json i otwiera instalator,
   *  - strona (PWA): nowa wersja z serwera (service worker) i przeładowanie,
   *  - słownik: to samo pobieranie co automatyczne (downloadRemoteDict); na stronie – odświeżenie pamięci słownika.
   * releases/latest.json = { "appVersion": "0.32", "apk": "MeTalk.apk", "sha256": "…" } – tworzy go
   * scripts/release-android.mjs (npm run release:android). */
  var LATEST_APP = 'releases/latest.json';
  var upd = {
    open: document.getElementById('btn-check-updates'),
    dlg: document.getElementById('updates-dialog'),
    appStatus: document.getElementById('update-app-status'),
    appBtn: document.getElementById('btn-update-app'),
    dictStatus: document.getElementById('update-dict-status'),
    dictBtn: document.getElementById('btn-update-dict'),
    close: document.getElementById('btn-updates-close')
  };
  var latestApp = null, latestDict = null;
  function fmt(key, o) {
    return ui(key).replace('{cur}', o.cur || '').replace('{new}', o.latest || '').replace('{err}', o.err || '');
  }
  function useReleaseFile() { return isNativeApp() || !!rawGet(LS_REMOTE_BASE); }

  function checkAppUpdate() {
    var cur = typeof APP_VERSION === 'string' ? APP_VERSION : '0';
    if (useReleaseFile()) {
      var url = new URL(LATEST_APP, remoteBase()).href;
      return fetchOk(url, true).then(function (r) {
        if (!r || !r.appVersion || !r.apk) throw new Error('bad release file');
        return { cur: cur, latest: String(r.appVersion), apk: new URL(r.apk, url).href, sha256: r.sha256 || '' };
      });
    }
    return fetch('version.js?check=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function (t) {
        var m = /APP_VERSION\s*=\s*'([^']+)'/.exec(t);
        if (!m) throw new Error('no version');
        return { cur: cur, latest: m[1], web: true };
      });
  }
  function checkDictUpdate() {
    return currentDictVersion().then(function (cur) {
      var remote = remoteDictEnabled()
        ? fetchRemoteDictFiles().then(function (r) { return r.version; })
        : fetchOk(L().file + '?check=' + Date.now(), true).then(function (d) { return d.dictionaryVersion; });
      return remote.then(function (v) { return { cur: cur, latest: v }; });
    });
  }

  function showUpdateResult(r, statusEl, btn, keyAvail, keyOk) {
    var newer = versionNewer(r.latest, r.cur);
    statusEl.textContent = fmt(newer ? keyAvail : keyOk, r);
    btn.hidden = !newer;
    btn.disabled = false;
    return newer ? r : null;
  }
  function checkUpdates() {
    latestApp = latestDict = null;
    upd.appBtn.hidden = upd.dictBtn.hidden = true;
    upd.appStatus.textContent = upd.dictStatus.textContent = ui('checking');
    checkAppUpdate()
      .then(function (r) { latestApp = showUpdateResult(r, upd.appStatus, upd.appBtn, 'appAvailable', 'appUpToDate'); })
      .catch(function () { upd.appStatus.textContent = ui('checkFailed'); });
    checkDictUpdate()
      .then(function (r) { latestDict = showUpdateResult(r, upd.dictStatus, upd.dictBtn, 'dictAvailable', 'dictUpToDate'); })
      .catch(function () { upd.dictStatus.textContent = ui('checkFailed'); });
  }

  upd.open.addEventListener('click', function () { openDialog(upd.dlg); checkUpdates(); });
  upd.close.addEventListener('click', function () { closeDialog(upd.dlg); });

  upd.appBtn.addEventListener('click', function () {
    var r = latestApp;
    if (!r) return;
    if (r.web) {
      upd.appStatus.textContent = ui('appWebReload');
      var reg = navigator.serviceWorker ? navigator.serviceWorker.getRegistration() : Promise.resolve(null);
      reg.then(function (g) { return g && g.update(); }).catch(function () {})
        .then(function () { setTimeout(function () { location.reload(); }, 1500); });
      return;
    }
    var cap = window.Capacitor;
    if (!cap || typeof cap.nativePromise !== 'function') {
      upd.appStatus.textContent = fmt('appUpdateFailed', { err: 'brak modułu aktualizacji' });
      return;
    }
    upd.appBtn.disabled = true;
    upd.appStatus.textContent = ui('appDownloading');
    cap.nativePromise('AppUpdater', 'downloadAndInstall', { url: r.apk, sha256: r.sha256 })
      .then(function () { upd.appStatus.textContent = ui('appInstaller'); })
      .catch(function (e) {
        upd.appStatus.textContent = e && e.code === 'NEED_PERMISSION'
          ? ui('appNeedPermission')
          : fmt('appUpdateFailed', { err: (e && e.message) || String(e) });
      })
      .then(function () { upd.appBtn.disabled = false; });
  });

  upd.dictBtn.addEventListener('click', function () {
    var r = latestDict;
    if (!r) return;
    upd.dictBtn.disabled = true;
    upd.dictStatus.textContent = ui('dictDownloading');
    if (!remoteDictEnabled()) {
      // Strona: usuwamy zapamiętane pliki słów – po przeładowaniu przyjdą nowe z serwera.
      if (!('caches' in window)) { location.reload(); return; }
      caches.open('moje-slowa-dict').then(function (c) {
        return c.keys().then(function (keys) {
          return Promise.all(keys.filter(function (k) { return /\.json(\?|$)/.test(k.url); })
            .map(function (k) { return c.delete(k); }));
        });
      }).catch(function () {}).then(function () { location.reload(); });
      return;
    }
    downloadRemoteDict(r.cur)
      .then(function (v) {
        upd.dictStatus.textContent = fmt('dictUpdated', { latest: v });
        upd.dictBtn.hidden = true;
      })
      .catch(function (e) {
        upd.dictStatus.textContent = e && e.message === 'not newer' ? fmt('dictUpToDate', r) : ui('checkFailed');
        upd.dictBtn.disabled = false;
      });
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
        // Nowszy słownik pobrany z internetu (aplikacja Android) ma pierwszeństwo przed tym z APK.
        var stored = remoteDictEnabled() ? storedRemoteDict() : null;
        remoteImages = {};
        if (stored && stored.files[L().file] && versionNewer(stored.version, data.dictionaryVersion)) {
          data = stored.files[L().file];
          remoteImages = stored.images;
        }
        baseVocab = data;
        vocab = applyCustom(data); // słownik + zmiany użytkownika z trybu edycji
        migrateFavs();
        render();
        showVersion();
        if (!Object.keys(remoteImages).length) cacheDictionary(data); // zdalny słownik ma obrazki w pamięci telefonu
        checkVoice();
        loadNativeVoices();
        checkRemoteDict();
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
    el.editModeBtn.disabled = el.loginBtn.disabled;
  }

  var selectedBeforeAdd = '';
  el.userSelect.addEventListener('focus', function () { selectedBeforeAdd = el.userSelect.value; });
  el.userSelect.addEventListener('change', function () {
    if (el.userSelect.value === '__add') { openAddUser(); return; }
    selectedBeforeAdd = el.userSelect.value;
    el.loginBtn.disabled = !userById(el.userSelect.value);
    el.deleteBtn.disabled = el.loginBtn.disabled;
    el.editModeBtn.disabled = el.loginBtn.disabled;
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

  function loginAs(user, edit) {
    currentUser = user;
    editMode = !!edit;
    custom = loadCustom();
    clip = null;
    rawSet(LS_LAST_USER, user.id);
    lang = LANGS[lsGet(LS_LANG)] ? lsGet(LS_LANG) : 'pl';
    el.langSelect.value = lang;
    favs = loadList(LS_FAV_IDS);
    legacyFavs = loadList(LS_FAVS);
    favCats = loadList(LS_FAVCATS);
    document.body.classList.remove('logged-out');
    state = { screen: 'home', depth: 0 };
    try { history.replaceState(state, ''); } catch (e) { /* ignoruj */ }
    vocab = null;
    baseVocab = null;
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

  /* Test dla opiekuna (wylogowanie, wejście w tryb edycji): liczba 100–999 zapisana słownie,
   * np. „sześćset dwadzieścia jeden” → trzeba wpisać 621. Duży „Cofnij” zamyka okno. */
  var NUM = {
    pl: {
      units: ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'],
      teens: ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście',
        'siedemnaście', 'osiemnaście', 'dziewiętnaście'],
      tens: ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt',
        'osiemdziesiąt', 'dziewięćdziesiąt'],
      hundreds: ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset']
    },
    en: {
      units: ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    }
  };
  function numberInWords(n) {
    var h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10;
    var w = NUM[lang] || NUM.pl;
    var rest = t === 1 ? w.teens[u] : (lang === 'en'
      ? [w.tens[t], w.units[u]].filter(Boolean).join('-')
      : [w.tens[t], w.units[u]].filter(Boolean).join(' '));
    var head = lang === 'en' ? w.units[h] + ' hundred' : NUM.pl.hundreds[h];
    return [head, rest].filter(Boolean).join(' ');
  }

  var codeNumber = 0, codeOnOk = null;
  function askCode(title, instr, confirmText, onOk) {
    codeNumber = 100 + Math.floor(Math.random() * 900);
    codeOnOk = onOk;
    document.getElementById('code-title').textContent = title;
    document.getElementById('code-instr').textContent = instr;
    document.getElementById('btn-logout-confirm').textContent = confirmText;
    el.logoutCode.textContent = numberInWords(codeNumber);
    el.logoutInput.value = '';
    el.logoutErr.hidden = true;
    openDialog(el.logoutDialog);
  }
  el.logout.addEventListener('click', function () {
    askCode(ui('logoutTitle'), ui('logoutInstr'), ui('logout'), logout);
  });
  el.logoutInput.addEventListener('input', function () {
    el.logoutInput.value = el.logoutInput.value.replace(/\D/g, '').slice(0, 3);
    el.logoutErr.hidden = true;
  });
  el.logoutCancel.addEventListener('click', function () { codeOnOk = null; closeDialog(el.logoutDialog); });
  el.logoutDialog.addEventListener('cancel', function (e) { e.preventDefault(); codeOnOk = null; closeDialog(el.logoutDialog); });
  el.logoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = el.logoutInput.value.trim();
    if (!v || parseInt(v, 10) !== codeNumber) {
      el.logoutInput.value = '';
      el.logoutErr.textContent = ui('logoutWrong');
      el.logoutErr.hidden = false;
      return;
    }
    closeDialog(el.logoutDialog);
    var cb = codeOnOk; codeOnOk = null;
    if (cb) cb();
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
    editMode = false;
    clip = null;
    updateEditBar();
    try { if (synth && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) { /* ignoruj */ }
    if (nativeTTS()) TTS().stop();
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

  /* ---------------- Tryb edycji (wersja 0.35) ----------------
   * Wejście: ekran logowania → „✏️ Tryb edycji” → test z liczbą słownie → słownik użytkownika do edycji.
   * Zmiany są tylko dla tego użytkownika na tym telefonie i są NAKŁADKĄ na słownik (po "id"),
   * więc aktualizacja słownika ich nie kasuje:
   *   words[id] / cats[id] – zmiany słów/kategorii ze słownika: text|name {pl,en}, photo, hidden, cat|parent (przeniesione), t
   *   newWords / newCats – kafelki i kategorie dodane przez użytkownika (id "u-…" / "uc-…").
   * Słowa i kategorie ze słownika nie są kasowane, tylko ukrywane (w edycji widać je wyszarzone – można przywrócić). */
  var LS_CUSTOM = 'mojeSlowa.custom';
  var custom = emptyCustom();
  function emptyCustom() { return { words: {}, cats: {}, newWords: [], newCats: [] }; }
  function loadCustom() {
    var c = null;
    try { c = JSON.parse(lsGet(LS_CUSTOM) || 'null'); } catch (e) { c = null; }
    var d = emptyCustom();
    if (c && typeof c === 'object') {
      if (c.words && typeof c.words === 'object') d.words = c.words;
      if (c.cats && typeof c.cats === 'object') d.cats = c.cats;
      if (Array.isArray(c.newWords)) d.newWords = c.newWords;
      if (Array.isArray(c.newCats)) d.newCats = c.newCats;
    }
    return d;
  }
  // Zapis; false = brak miejsca (wtedy zmiana jest cofana).
  function saveCustom() {
    try { window.localStorage.setItem(userKey(LS_CUSTOM), JSON.stringify(custom)); return true; }
    catch (e) { custom = loadCustom(); return false; }
  }

  function applyCustom(base) {
    if (!base) return base;
    var data = JSON.parse(JSON.stringify(base));
    var cats = {}, order = [], parentOf = {};
    (function walk(list, parent) {
      list.forEach(function (c) {
        cats[c.id] = c; order.push(c.id); parentOf[c.id] = parent;
        walk(subcats(c), c.id);
      });
    })(data.categories, '');
    var stay = [], moved = [];
    order.forEach(function (id) { cats[id].words.forEach(function (w) { stay.push({ w: w, cat: id, t: 0 }); }); });

    custom.newCats.forEach(function (n) {
      if (!n || !n.id || cats[n.id]) return;
      cats[n.id] = { id: n.id, emoji: n.emoji || '', name: n.name || '', color: n.color || '#E3F2FD',
        image: n.photo || undefined, words: [], categories: [], user: true };
      order.push(n.id);
      parentOf[n.id] = n.parent || '';
    });
    Object.keys(custom.cats).forEach(function (id) {
      var o = custom.cats[id], c = cats[id];
      if (!c || !o) return;
      if (o.name && o.name[lang]) c.name = o.name[lang];
      if (o.photo) c.image = o.photo;
      if (o.hidden) c._hidden = true;
      if (typeof o.parent === 'string' && (o.parent === '' || cats[o.parent])) parentOf[id] = o.parent;
    });
    // Kategoria nie może być w samej sobie – przy pętli wraca na najwyższy poziom.
    order.forEach(function (id) {
      var p = parentOf[id], n = 0;
      while (p && n++ < 50) { if (p === id) { parentOf[id] = ''; break; } p = parentOf[p]; }
    });
    stay = stay.filter(function (x) {
      var o = custom.words[x.w.id];
      if (!o) return true;
      if (o.text && o.text[lang]) x.w.text = o.text[lang];
      if (o.photo) x.w.image = o.photo;
      if (o.hidden) x.w._hidden = true;
      if (o.cat && cats[o.cat] && o.cat !== x.cat) { x.cat = o.cat; x.t = o.t || 0; moved.push(x); return false; }
      return true;
    });
    moved.sort(function (a, b) { return a.t - b.t; });
    var added = custom.newWords.filter(function (n) { return n && n.id && cats[n.cat]; }).map(function (n) {
      return { w: { id: n.id, emoji: n.emoji || '', text: n.text || '', image: n.photo || undefined, user: true }, cat: n.cat };
    });

    order.forEach(function (id) { cats[id].words = []; cats[id].categories = []; });
    stay.concat(moved, added).forEach(function (x) {
      if (!editMode && x.w._hidden) return;
      cats[x.cat].words.push(x.w);
    });
    var top = [];
    order.forEach(function (id) {
      var c = cats[id];
      if (!editMode && c._hidden) return;
      var p = parentOf[id];
      if (p && cats[p]) cats[p].categories.push(c); else top.push(c);
    });
    data.categories = top;
    return data;
  }
  function refreshCustom() { if (baseVocab) { vocab = applyCustom(baseVocab); render(); } }

  function findWord(id) {
    var found = null;
    allCategories().forEach(function (c) { c.words.forEach(function (w) { if (w.id === id && !found) found = { w: w, cat: c }; }); });
    return found;
  }
  function baseItem(kind, id) {
    var found = null;
    (function walk(list) {
      list.forEach(function (c) {
        if (kind === 'cat' && c.id === id) found = c;
        if (kind === 'word') c.words.forEach(function (w) { if (w.id === id) found = w; });
        walk(subcats(c));
      });
    })(baseVocab ? baseVocab.categories : []);
    return found;
  }
  function userEntry(kind, id) {
    var list = kind === 'cat' ? custom.newCats : custom.newWords;
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function newId(prefix) { return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }

  /* Zdjęcie z telefonu → kwadrat 320×320 JPEG (data: URL), żeby zmieściło się w pamięci. */
  function readPhoto(file, cb) {
    var url;
    try { url = URL.createObjectURL(file); } catch (e) { cb(null); return; }
    var img = new Image();
    img.onload = function () {
      try {
        var side = Math.min(img.naturalWidth, img.naturalHeight), size = Math.min(320, side);
        var c = document.createElement('canvas');
        c.width = c.height = size;
        c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
        cb(c.toDataURL('image/jpeg', 0.82));
      } catch (e) { cb(null); }
      URL.revokeObjectURL(url);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  /* ---- Okno edycji ---- */
  var ed = {
    dlg: document.getElementById('edit-dialog'), form: document.getElementById('edit-form'),
    title: document.getElementById('edit-title'), preview: document.getElementById('edit-preview'),
    label: document.getElementById('edit-text-label'), text: document.getElementById('edit-text'),
    emoji: document.getElementById('edit-emoji'), err: document.getElementById('edit-error'),
    photo: document.getElementById('edit-photo'), reset: document.getElementById('edit-reset'),
    cut: document.getElementById('edit-cut'), copy: document.getElementById('edit-copy'),
    del: document.getElementById('edit-delete'), save: document.getElementById('edit-save'),
    cancel: document.getElementById('edit-cancel'), file: document.getElementById('edit-file')
  };
  var editing = null; // { kind, id (null = nowy), user, parent, photo: undefined | data URL | null (usuń) , emoji, image }

  function showPreview() {
    clear(ed.preview);
    var image = editing.photo === undefined ? editing.image : (editing.photo || editing.origImage);
    var emoji = editing.user || !editing.id ? ed.emoji.value.trim() : editing.emojiShown;
    if (image || emoji) ed.preview.appendChild(pictureNode(emoji, image));
  }

  function openEditor(kind, id) {
    var item = null, user = false;
    if (id) {
      item = kind === 'cat' ? categoryById(id) : (findWord(id) || {}).w;
      if (!item) return;
      user = !!item.user;
    }
    var isNew = !id;
    editing = { kind: kind, id: id, user: user, photo: undefined,
      parent: state.screen === 'category' ? state.cat : '',
      image: item ? item.image : undefined, emojiShown: item ? item.emoji : '',
      origImage: !isNew && !user ? (baseItem(kind, id) || {}).image : undefined };
    ed.title.textContent = ui(isNew ? (kind === 'cat' ? 'newCat' : 'newWord') : (kind === 'cat' ? 'editCat' : 'editWord'));
    ed.label.textContent = ui(kind === 'cat' ? 'nameLabel' : 'textLabel');
    ed.text.value = item ? (kind === 'cat' ? item.name : item.text) : '';
    ed.emoji.hidden = !(isNew || user);
    ed.emoji.placeholder = ui('emojiPlaceholder');
    ed.emoji.value = item && (isNew || user) ? (item.emoji || '') : '';
    ed.err.hidden = true;
    ed.photo.textContent = ui('photoBtn');
    ed.reset.textContent = ui('resetBtn');
    ed.cut.textContent = ui('cutBtn');
    ed.copy.textContent = ui('copyBtn');
    ed.save.textContent = ui('save');
    ed.cancel.textContent = ui('cancel');
    var o = id && !user ? (kind === 'cat' ? custom.cats[id] : custom.words[id]) : null;
    ed.reset.hidden = !(o && ((o.text && o.text[lang]) || (o.name && o.name[lang]) || o.photo));
    ed.cut.hidden = isNew;
    ed.copy.hidden = isNew || kind === 'cat';
    ed.cut.parentNode.hidden = isNew;
    ed.del.hidden = isNew;
    ed.del.textContent = item && item._hidden ? ui('restoreBtn') : ui('deleteBtn');
    ed.del.className = 'dlg-btn ' + (item && item._hidden ? 'save' : 'danger');
    showPreview();
    openDialog(ed.dlg);
    // Bez automatycznej klawiatury – zasłaniała przyciski; pojawia się po dotknięciu pola tekstu.
    setTimeout(function () { try { if (document.activeElement) document.activeElement.blur(); } catch (e) { /* ignoruj */ } }, 0);
  }

  function closeEditor() { closeDialog(ed.dlg); editing = null; }
  function editorFail(msg) { ed.err.textContent = msg; ed.err.hidden = false; }

  ed.emoji.addEventListener('input', function () { if (editing) showPreview(); });
  ed.text.addEventListener('input', function () { ed.err.hidden = true; });
  ed.cancel.addEventListener('click', closeEditor);
  ed.dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeEditor(); });
  ed.photo.addEventListener('click', function () { ed.file.value = ''; ed.file.click(); });
  ed.file.addEventListener('change', function () {
    var f = ed.file.files && ed.file.files[0];
    if (!f || !editing) return;
    readPhoto(f, function (url) {
      if (!editing) return;
      if (!url) { editorFail(ui('photoError')); return; }
      editing.photo = url;
      showPreview();
    });
  });

  ed.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!editing) return;
    var text = ed.text.value.trim();
    if (!text) { editorFail(ui('textEmpty')); return; }
    var k = editing.kind, emoji = ed.emoji.value.trim();
    if (!editing.id) {
      if (k === 'word') {
        if (!editing.parent) return closeEditor();
        custom.newWords.push({ id: newId('u-'), cat: editing.parent, text: text, emoji: emoji, photo: editing.photo || undefined });
      } else {
        var pc = editing.parent ? categoryById(editing.parent) : null;
        custom.newCats.push({ id: newId('uc-'), parent: editing.parent, name: text, emoji: emoji,
          color: pc ? pc.color : '#E3F2FD', photo: editing.photo || undefined });
      }
    } else if (editing.user) {
      var en = userEntry(k, editing.id);
      if (en) {
        if (k === 'cat') en.name = text; else en.text = text;
        en.emoji = emoji;
        if (editing.photo !== undefined) en.photo = editing.photo || undefined;
      }
    } else {
      var store = k === 'cat' ? custom.cats : custom.words;
      var o = store[editing.id] || (store[editing.id] = {});
      var key = k === 'cat' ? 'name' : 'text';
      var orig = baseItem(k, editing.id);
      o[key] = o[key] || {};
      if (orig && text === orig[key]) delete o[key][lang]; else o[key][lang] = text;
      if (editing.photo !== undefined) { if (editing.photo) o.photo = editing.photo; else delete o.photo; }
    }
    if (!saveCustom()) { editorFail(ui('noSpace')); return; }
    closeEditor();
    refreshCustom();
  });

  // ↩️ Przywróć oryginał – tekst i obrazek ze słownika (przeniesienie i ukrycie zostają).
  ed.reset.addEventListener('click', function () {
    if (!editing || !editing.id || editing.user) return;
    var o = (editing.kind === 'cat' ? custom.cats : custom.words)[editing.id];
    if (o) { delete o.photo; if (o.text) delete o.text[lang]; if (o.name) delete o.name[lang]; }
    saveCustom();
    closeEditor();
    refreshCustom();
  });

  // 🗑️ Usuń: słowo/kategoria ze słownika → ukryte (można przywrócić); własne → usunięte na stałe.
  ed.del.addEventListener('click', function () {
    if (!editing || !editing.id) return;
    var k = editing.kind, id = editing.id, label = ed.text.value.trim();
    if (!editing.user) {
      var store = k === 'cat' ? custom.cats : custom.words;
      var o = store[id] || (store[id] = {});
      o.hidden = !o.hidden;
      if (!o.hidden) delete o.hidden;
      saveCustom();
      closeEditor();
      refreshCustom();
      return;
    }
    closeEditor();
    askYesNo(ui('deleteBtn').replace(/^\S+\s/, '') + ' „' + label + '”?', function () {
      if (k === 'word') custom.newWords = custom.newWords.filter(function (n) { return n.id !== id; });
      else {
        custom.newCats = custom.newCats.filter(function (n) { return n.id !== id; });
        custom.newWords = custom.newWords.filter(function (n) { return n.cat !== id; });
        Object.keys(custom.words).forEach(function (w) { if (custom.words[w].cat === id) delete custom.words[w].cat; });
        Object.keys(custom.cats).forEach(function (c) { if (custom.cats[c].parent === id) delete custom.cats[c].parent; });
        custom.newCats.forEach(function (n) { if (n.parent === id) n.parent = ''; });
      }
      saveCustom();
      if (clip && clip.id === id) clip = null;
      refreshCustom();
    });
  });

  /* ---- Schowek: wytnij / kopiuj → wklej w bieżącej kategorii ---- */
  var clip = null; // { kind, id, mode: 'cut' | 'copy', label }
  var bar = {
    el: document.getElementById('edit-bar'), info: document.getElementById('edit-clip'),
    paste: document.getElementById('edit-paste'), clear: document.getElementById('edit-clip-clear'),
    done: document.getElementById('edit-done')
  };
  ed.cut.addEventListener('click', function () {
    if (!editing || !editing.id) return;
    clip = { kind: editing.kind, id: editing.id, mode: 'cut', label: ed.text.value.trim() };
    closeEditor(); updateEditBar();
  });
  ed.copy.addEventListener('click', function () {
    if (!editing || !editing.id || editing.kind !== 'word') return;
    clip = { kind: 'word', id: editing.id, mode: 'copy', label: ed.text.value.trim() };
    closeEditor(); updateEditBar();
  });

  function pasteTarget() {
    if (state.screen === 'category') return state.cat;
    if (state.screen === 'home' && clip && clip.kind === 'cat') return '';
    return null; // słowo można wkleić tylko w kategorii
  }
  function isInside(catId, ancestorId) { // czy catId leży w ancestorId (albo nim jest)
    var n = 0, c = catId;
    while (c && n++ < 50) {
      if (c === ancestorId) return true;
      var parent = null;
      allCategories().forEach(function (x) { if (subcats(x).some(function (s) { return s.id === c; })) parent = x.id; });
      c = parent;
    }
    return false;
  }

  function updateEditBar() {
    document.body.classList.toggle('editing', editMode);
    bar.el.hidden = !editMode;
    if (!editMode) return;
    bar.done.textContent = ui('editBarDone');
    var target = pasteTarget();
    if (!clip) {
      bar.info.textContent = ui('editBarHint');
      bar.paste.hidden = bar.clear.hidden = true;
      return;
    }
    var label = ui(clip.mode === 'cut' ? 'clipCut' : 'clipCopy').replace('{x}', clip.label);
    bar.info.textContent = target === null ? ui('pasteGoCategory').replace('{clip}', label) : label;
    bar.paste.textContent = ui('pasteHere');
    bar.paste.hidden = target === null;
    bar.clear.hidden = false;
  }

  bar.clear.addEventListener('click', function () { clip = null; updateEditBar(); });
  bar.done.addEventListener('click', function () {
    editMode = false;
    clip = null;
    var depth = state.depth || 0;
    state = { screen: 'home', depth: 0 };
    if (depth) { try { history.go(-depth); } catch (e) { /* ignoruj */ } }
    refreshCustom();
    window.scrollTo(0, 0);
  });
  bar.paste.addEventListener('click', function () {
    var target = pasteTarget();
    if (!clip || target === null) return;
    var id = clip.id;
    if (clip.kind === 'word') {
      if (clip.mode === 'copy') {
        var src = findWord(id);
        if (!src) { clip = null; updateEditBar(); return; }
        custom.newWords.push({ id: newId('u-'), cat: target, text: src.w.text, emoji: src.w.emoji, photo: src.w.image });
      } else {
        var en = userEntry('word', id);
        if (en) {
          custom.newWords = custom.newWords.filter(function (n) { return n !== en; });
          en.cat = target;
          custom.newWords.push(en); // na koniec kategorii
        } else {
          var o = custom.words[id] || (custom.words[id] = {});
          o.cat = target; o.t = Date.now();
        }
        clip = null;
      }
    } else {
      if (target && isInside(target, id)) { alertBar(ui('pasteIntoSelf')); return; }
      var ce = userEntry('cat', id);
      if (ce) ce.parent = target;
      else (custom.cats[id] || (custom.cats[id] = {})).parent = target;
      clip = null;
    }
    if (!saveCustom()) { alertBar(ui('noSpace')); return; }
    refreshCustom();
  });
  function alertBar(msg) { bar.info.textContent = msg; }

  /* ---- Wejście w tryb edycji z ekranu logowania ---- */
  el.editModeBtn.addEventListener('click', function () {
    var u = userById(el.userSelect.value);
    if (!u) return;
    askCode(ui('editModeTitle'), ui('editModeInstr'), ui('editEnter'), function () { loginAs(u, true); });
  });

  showLogin();

  // W aplikacji Android (Capacitor) wszystkie pliki są w paczce APK – service worker niepotrzebny.
  // window.Capacitor istnieje tylko wewnątrz aplikacji natywnej; w przeglądarce go nie ma.
  function isNativeApp() {
    try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); }
    catch (e) { return false; }
  }

  if ('serviceWorker' in navigator && !isNativeApp()) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline niedostępny */ });
    });
  }
})();
