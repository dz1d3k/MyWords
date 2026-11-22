// Sprawdza słowniki przed buildem (npm run check:dict, uruchamiane też przez build:web).
// - każde słowo ma "id" (małe litery, cyfry, myślniki), niepowtarzalne w całym pliku,
// - PL i EN mają ten sam układ: te same kategorie i te same id słów w tej samej kolejności,
// - "formerly" (dawne napisy słowa, do przeniesienia ulubionych) to lista napisów,
// - każdy obrazek ze słownika istnieje w dictionary/.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dict = join(dirname(fileURLToPath(import.meta.url)), '..', 'dictionary');
const FILES = ['vocabulary.json', 'vocabulary.en.json'];
const errors = [];

function shape(file) {
  const data = JSON.parse(readFileSync(join(dict, file), 'utf8'));
  const ids = {};
  const out = [];
  (function walk(cats, path) {
    for (const c of cats) {
      const p = path + c.id;
      if (c.image && !existsSync(join(dict, c.image))) errors.push(`${file}: brak obrazka ${c.image} (kategoria ${p})`);
      for (const w of c.words || []) {
        const where = `${file}: ${p} „${w.text}”`;
        if (typeof w.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(w.id)) errors.push(`${where}: brak lub zły "id"`);
        else if (ids[w.id]) errors.push(`${where}: "id" ${w.id} już jest (${ids[w.id]})`);
        else ids[w.id] = p;
        if (w.formerly !== undefined && !(Array.isArray(w.formerly) && w.formerly.every((t) => typeof t === 'string'))) {
          errors.push(`${where}: "formerly" musi być listą napisów`);
        }
        if (w.image && !existsSync(join(dict, w.image))) errors.push(`${where}: brak obrazka ${w.image}`);
        out.push(p + ' ' + w.id);
      }
      walk(c.categories || [], p + '/');
    }
  })(data.categories, '');
  return { version: data.dictionaryVersion, out };
}

const [pl, en] = FILES.map(shape);
if (pl.version !== en.version) errors.push(`dictionaryVersion różni się: PL ${pl.version}, EN ${en.version}`);
const n = Math.max(pl.out.length, en.out.length);
for (let i = 0; i < n; i++) {
  if (pl.out[i] !== en.out[i]) {
    errors.push(`PL i EN rozjeżdżają się na pozycji ${i + 1}: PL „${pl.out[i] || '—'}”, EN „${en.out[i] || '—'}”`);
    break;
  }
}

if (errors.length) {
  console.error('Słownik ma błędy:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log(`check:dict OK – słownik ${pl.version}, ${pl.out.length} słów, PL i EN zgodne`);
