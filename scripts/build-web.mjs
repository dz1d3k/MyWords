// Kopiuje pliki aplikacji webowej do www/ (to jest "output builda" dla Capacitor).
// Aplikacja nie ma kroku kompilacji – to czysty HTML/CSS/JS, więc build = kopiowanie.
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const FILES = ['index.html', 'style.css', 'app.js', 'version.js', 'sw.js', 'manifest.webmanifest', 'icons', 'dictionary'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of FILES) {
  const src = join(root, f);
  if (!existsSync(src)) { console.error('Brak pliku: ' + f); process.exit(1); }
  cpSync(src, join(out, f), { recursive: true });
}
console.log('build:web → www/ (' + FILES.join(', ') + ')');
