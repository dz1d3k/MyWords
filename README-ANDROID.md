# MeTalk – aplikacja Android (Capacitor)

Wersja webowa działa jak dotąd (GitHub Pages, ten sam adres). Aplikacja Android to ta sama strona
zapakowana w Capacitor – pliki strony są kopiowane do `www/`, a stamtąd do APK.

> Dokument jest rozwijany etapami. Pełna instrukcja „od telefonu z pudełka do kiosku” pojawi się w etapie 6.

## Czego potrzebujesz (Windows)

| Narzędzie | Wersja | Skąd |
|---|---|---|
| Node.js | 20 LTS lub nowszy | https://nodejs.org (instalator .msi) |
| Android Studio | aktualne | https://developer.android.com/studio |
| JDK | **21** (Capacitor 8 wymaga 21) | jest w Android Studio (`jbr`) |
| Android SDK + Platform-Tools (adb) | API 36 | Android Studio → More Actions → SDK Manager |

Zmienne środowiskowe (Panel sterowania → System → Zaawansowane → Zmienne środowiskowe):

- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
- `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
- do `Path` dopisz: `%ANDROID_HOME%\platform-tools`

Sprawdzenie w PowerShell:

```powershell
node -v; java -version; adb version; echo $env:ANDROID_HOME
```

## Pierwsze uruchomienie

```powershell
git clone https://github.com/dz1d3k/MyWords.git
cd MyWords
npm install
npm run dev              # wersja webowa: http://localhost:5173
npm run build:android    # kopiuje stronę do www/ i do projektu Android
npm run open:android     # otwiera projekt w Android Studio (▶ Run = instalacja na telefonie/emulatorze)
npm run run:android      # albo: buduje i instaluje na podłączonym telefonie/emulatorze z wiersza poleceń
```

## Skrypty npm

| Skrypt | Co robi |
|---|---|
| `npm run dev` | lokalny serwer wersji webowej (bez instalowania czegokolwiek) |
| `npm run build:web` | kopiuje pliki strony do `www/` |
| `npm run build:android` | `build:web` + `cap sync android` |
| `npm run open:android` | otwiera `android/` w Android Studio |
| `npm run run:android` | buduje i uruchamia na urządzeniu |

## Co jest ustawione (etap 1)

- `appId`: `pl.widera.metalk`, nazwa: **MeTalk** (identyfikatora nie zmieniaj po ustawieniu Device Ownera).
- Orientacja zablokowana w pionie, pełny ekran (paski systemowe schowane – pojawiają się chwilowo po
  przeciągnięciu od krawędzi), ekran nie gaśnie, gdy aplikacja jest na wierzchu.
- Wersja APK (`versionName`/`versionCode`) brana automatycznie z `version.js`.
- Ikona i ekran startowy z logo MeTalk.
- W aplikacji Android service worker przeglądarki jest wyłączony (wszystko jest w APK, działa offline).

## Mowa (etap 2)

- Moduł `speech.js` (`window.MeTalkSpeech`): `speak`, `stop`, `isAvailable`, `checkLanguage`, `getVoices`, `openInstall`.
- **Android:** silnik mowy telefonu przez plugin `@capacitor-community/text-to-speech`, wołany przez
  `Capacitor.nativePromise` – bez importów, więc wersja webowa nie potrzebuje kroku budowania.
  Domyślnie używany jest pierwszy **głos offline** dla wybranego języka (pl-PL / en-US).
- **Przeglądarka:** Web Speech API jak dotąd (logika w `app.js`, sprawdzona na iPhonie).
- **Ustawienia głosu** (na dole ekranu startowego): głos, tempo, **głośność**, **wysokość głosu** – osobno dla każdego użytkownika.
- **Komunikat dla opiekuna** na ekranie startowym, gdy w telefonie brak głosu w wybranym języku
  (albo gdy działa on tylko z internetem). Na Androidzie przycisk **Zainstaluj głos** otwiera systemową instalację.

### Polski głos offline na Samsungu (XCover 5)

1. Ustawienia → Ogólne zarządzanie → **Zamiana tekstu na mowę**.
2. Preferowany mechanizm: **Samsung TTS** albo **Usługi mowy Google** (Google ma zwykle lepszy polski głos).
3. Ikona ⚙️ obok mechanizmu → **Zainstaluj dane głosowe** → **Polski** → pobierz (przy Wi‑Fi).
4. Język: **Polski**. Test: „Odtwórz” – potem włącz tryb samolotowy i sprawdź, czy dalej mówi.
