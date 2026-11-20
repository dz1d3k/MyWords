# Moje Słowa

Prosta aplikacja do komunikacji wspomagającej (AAC) dla niemówiących dzieci.
Dziecko przewija listę dużych obrazków ze słowami – po dotknięciu telefon mówi słowo po polsku.

Działa w przeglądarce (iPhone – Safari, Android – Chrome), po dodaniu do ekranu
początkowego wygląda jak zwykła aplikacja i działa także bez internetu.

## Jak używać

- **Ekran startowy** – na górze kafelek **⭐ Ulubione**, pod nim kategorie (Potrzeby, Jedzenie…). Dotknięcie otwiera kategorię i mówi jej nazwę.
- **Słowo** – dotknięcie wypowiada słowo. Duży pasek u góry pokazuje ostatnie słowo; dotknij go, żeby powtórzyć.
- **⬅️** – poziom wyżej (np. z Zupy do Jedzenia; systemowy Wstecz na Androidzie działa tak samo). **🏠** – od razu ekran startowy.
- **☆ / ★** – dodaje / usuwa słowo lub kategorię z ulubionych (gwiazdka nie mówi). Ulubione są na górze każdej listy –
  kolejność zmienia się przy następnym otwarciu ekranu, nie od razu (żeby kafelek nie uciekał spod palca).
  **⭐** u góry albo kafelek „Ulubione” pokazuje wszystkie ulubione.
- **⚙️ Ustawienia głosu** – na samym dole ekranu startowego: wybór polskiego głosu, tempo mowy, test.

## Instalacja na iPhonie

1. Otwórz adres aplikacji w **Safari** (nie w Chrome – na iPhonie tylko Safari dodaje aplikacje poprawnie).
2. Dotknij **Udostępnij** (kwadrat ze strzałką w górę).
3. Wybierz **Do ekranu początkowego** → **Dodaj**.
4. Uruchom „Moje Słowa” z ikony. Przy pierwszym uruchomieniu musi być internet – potem działa offline.
5. Sprawdź, czy przełącznik wyciszenia (z boku telefonu) nie jest włączony – wyciszony iPhone może nie mówić.

**Lepszy głos:** Ustawienia → Dostępność → Treść mówiona → Głosy → Polski → pobierz głos
„Premium” lub „Rozszerzony”. Potem w aplikacji: ⚙️ Ustawienia głosu → wybierz go.

## Instalacja na Androidzie

1. Otwórz adres aplikacji w **Chrome**.
2. Menu **⋮** → **Dodaj do ekranu głównego** (lub **Zainstaluj aplikację**).
3. Uruchom z ikony. Pierwsze uruchomienie z internetem, potem działa offline.

**Głos polski:** Ustawienia → Zamiana tekstu na mowę (zwykle w: Ułatwienia dostępu) →
silnik Google → zainstaluj dane głosowe dla języka polskiego.

## Języki

Na górze ekranu startowego jest lista **🌐 Język**: 🇵🇱 Polski albo 🇺🇸 English. Zmienia słowa, napisy i głos.
Wybór jest zapamiętywany. Głos w Ustawieniach wybiera się osobno dla każdego języka.

Słowa angielskie są w `vocabulary.en.json` (ten sam format, `"language": "en-US"`, te same `id` kategorii i obrazki).
Dodając słowo po polsku, dodaj je też w pliku angielskim, w tym samym miejscu.

## Jak zmieniać słowa

Wszystkie słowa są w pliku [`vocabulary.json`](vocabulary.json). Format:

```json
{
  "version": 1,
  "language": "pl-PL",
  "categories": [
    {
      "id": "jedzenie",
      "emoji": "🍽️",
      "name": "Jedzenie",
      "color": "#FFE0B2",
      "words": [
        { "emoji": "🍞", "text": "Chleb" }
      ]
    }
  ]
}
```

- Nowe słowo: dopisz `{ "emoji": "…", "text": "…" }` do listy `words` w wybranej kategorii.
- Nowa kategoria: dodaj obiekt do `categories` z unikalnym `id` (małe litery, bez polskich znaków i spacji).
- Podkategorie: kategoria może mieć własne pole `"categories": [ … ]` z kategoriami w tym samym formacie
  (tak jest zrobione Jedzenie → Obiad, Zupa, Przekąski, Owoce i warzywa). Pole `words` musi być zawsze (może być `[]`).
- „Inny …”: ostatnie słowo w kategorii ma emoji kategorii z `❓` na końcu, np. `{ "emoji": "🍲❓", "text": "Inna zupa" }` –
  aplikacja pokazuje wtedy emoji z małym znakiem zapytania.
- Kolor: jasny kolor w zapisie `#RRGGBB` (tekst na kafelku jest czarny).
- Obrazek zamiast emoji (opcjonalnie): dodaj do słowa pole `"image": "images/nazwa.svg"` (może być też `.png`/`.jpg`,
  najlepiej kwadratowy). Pole `emoji` zostaw – jest używane, gdy obrazka brak. Nowy plik dopisz też do listy `FILES` w `sw.js`,
  żeby działał offline.
- Pilnuj przecinków i cudzysłowów – błąd w pliku = aplikacja nie wczyta słów.
  Sprawdź plik np. na https://jsonlint.com przed zapisaniem.
- Ulubione są zapamiętywane po tekście słowa – po zmianie tekstu trzeba je zaznaczyć ponownie.

**Są dwie wersje:**

- **Wersja słownika** – pole `"dictionaryVersion"` w `vocabulary.json` i `vocabulary.en.json` (np. `"1.01"` → `"1.02"`).
  Podbij ją przy każdej zmianie słów. Pole `"version": 1` to numer *formatu* pliku – nie zmieniaj go.
- **Wersja aplikacji** – `version.js` (np. `'0.14'` → `'0.15'`). Podbij ją przy zmianie kodu, wyglądu
  albo przy dodaniu nowych obrazków (wtedy też dopisz je do listy `FILES` w `sw.js`, żeby działały offline).

Obie wersje widać na ekranie startowym pod wyborem języka – tak sprawdzisz, czy telefon ma już nowość.
Nowa wersja pojawia się na telefonie przy drugim otwarciu aplikacji (pierwsze pobiera ją w tle).

Ten sam plik `vocabulary.json` ma być później używany przez aplikację Flutter – nie zmieniaj jego struktury.

## Pliki

| Plik | Co to jest |
|---|---|
| `index.html`, `style.css`, `app.js` | aplikacja |
| `vocabulary.json` | słowa i kategorie |
| `manifest.webmanifest` | opis aplikacji dla telefonu (nazwa, ikona) |
| `sw.js` | tryb offline (service worker) |
| `icons/` | ikona SVG i wygenerowane z niej PNG 180/192/512 |

Uruchomienie lokalne: `python3 -m http.server` w katalogu repo i otwórz http://localhost:8000.
