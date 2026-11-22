# MeTalk – aplikacja Android (Capacitor)

Wersja webowa działa jak dotąd (GitHub Pages, ten sam adres). Aplikacja Android to ta sama strona
zapakowana w Capacitor – pliki strony są kopiowane do `www/`, a stamtąd do APK.

> Dokument jest rozwijany etapami. Pełna instrukcja „od telefonu z pudełka do kiosku” pojawi się w etapie 6.

## Czego potrzebujesz (Windows)

| Narzędzie | Wersja | Skąd |
|---|---|---|
| Node.js | 20 LTS lub nowszy | https://nodejs.org (instalator .msi) |
| Android Studio | aktualne | https://developer.android.com/studio |
| JDK | **dokładnie 21** | osobna instalacja – Eclipse Temurin 21: `winget install --id EclipseAdoptium.Temurin.21.JDK -e` albo ZIP z https://adoptium.net |
| Android SDK + Platform-Tools (adb) | API 36, Build-Tools 36 | Android Studio → More Actions → SDK Manager |

> **Nie używaj Javy wbudowanej w Android Studio (`jbr`).** Nowe wersje Studio mają tam Javę 25,
> a projekt używa Gradle 8.14.3 (z Capacitor 8), który na Javie 25 nie działa (wymaga Gradle 9.1+).
> Capacitor 8 wymaga Javy 21 – instaluj ją osobno.

Zmienne środowiskowe (Panel sterowania → System → Zaawansowane → Zmienne środowiskowe):

- `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
- `JAVA_HOME` = folder JDK 21, np. `C:\Program Files\Eclipse Adoptium\jdk-21.0.x-hotspot`
- do `Path` dopisz: `%ANDROID_HOME%\platform-tools` i `%JAVA_HOME%\bin`

W Android Studio ustaw ten sam JDK dla Gradle: **File → Settings → Build, Execution, Deployment →
Build Tools → Gradle → Gradle JDK → `JAVA_HOME`** (domyślnie Studio wybiera swoją Javę 25 i budowanie się nie uda).

Sprawdzenie w nowym oknie PowerShell (po zmianie zmiennych):

```powershell
node -v; java -version; adb version; echo $env:ANDROID_HOME; echo $env:JAVA_HOME
```

`java -version` musi pokazać **21**.

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

## Aktualizacje (wersja 0.32+)

Na **ekranie logowania** (po wylogowaniu) jest przycisk **🔄 Sprawdź aktualizacje**. Tylko sprawdza i pokazuje:

- **Wersja aplikacji** – „aktualna” albo „Możesz zaktualizować aplikację (Twoja wersja to X, dostępna Y)” + **KLIKNIJ TUTAJ**:
  aplikacja pobiera nowy APK i otwiera systemowe okno instalacji („Aktualizuj”). Przy pierwszym razie Android poprosi
  o zgodę „Instalowanie nieznanych aplikacji” dla MeTalk – po jej włączeniu wróć i kliknij jeszcze raz.
  Przed instalacją sprawdzane są: suma SHA-256 z `latest.json`, nazwa pakietu i wyższy numer wersji;
  podpis sprawdza Android (ten sam klucz wydania).
- **Wersja słownika** – „aktualna” albo „Możesz zaktualizować słownik …” + **KLIKNIJ TUTAJ** (pobiera od razu).
  Niezależnie od przycisku aplikacja sama pobiera nowszy słownik przy starcie i co 6 godzin.

### Jak wydać nową wersję aplikacji

1. Podbij `APP_VERSION` w `version.js` (np. `0.32` → `0.33`).
2. `npm run release:android` – sprawdza słownik, buduje podpisany APK, zapisuje `releases/MeTalk.apk`
   i `releases/latest.json` (`appVersion`, `apk`, `sha256`). Potrzebny `JAVA_HOME` i `android/keystore.properties`.
3. Commit obu plików z `releases/` i wypchnięcie na `main`. Po ~1–10 min (GitHub Pages) telefony zobaczą nową wersję
   w „Sprawdź aktualizacje”.

Pliki są pod `https://dz1d3k.github.io/MyWords/releases/`. W repozytorium jest zawsze tylko najnowszy APK
(każde wydanie podmienia `MeTalk.apk`; historia git rośnie o ok. 4 MB na wydanie).
