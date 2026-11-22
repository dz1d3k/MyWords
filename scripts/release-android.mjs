// Wydanie aplikacji Android dla przycisku „Sprawdź aktualizacje” (npm run release:android).
// 1. sprawdza słownik i buduje podpisany APK (wersja z version.js),
// 2. kopiuje go do releases/MeTalk.apk i zapisuje releases/latest.json { appVersion, apk, sha256 },
// 3. po commicie i wypchnięciu na main GitHub Pages udostępnia oba pliki – telefony widzą nową wersję.
// Wymaga JAVA_HOME (JDK 21) i android/keystore.properties (stały klucz wydania – patrz README-ANDROID.md).
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const android = join(root, 'android');
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit' });

if (!existsSync(join(android, 'keystore.properties'))) {
  console.error('Brak android/keystore.properties – bez stałego klucza telefony nie przyjmą aktualizacji.');
  process.exit(1);
}
const m = /APP_VERSION\s*=\s*'([0-9]+\.[0-9]+)'/.exec(readFileSync(join(root, 'version.js'), 'utf8'));
if (!m) { console.error('Nie znaleziono APP_VERSION w version.js'); process.exit(1); }
const version = m[1];

const latestFile = join(root, 'releases', 'latest.json');
if (existsSync(latestFile)) {
  const prev = JSON.parse(readFileSync(latestFile, 'utf8')).appVersion;
  if (prev === version) {
    console.error(`Wersja ${version} jest już wydana – podbij APP_VERSION w version.js.`);
    process.exit(1);
  }
}

run('npm run build:android');
// pełna ścieżka – Windows bywa ustawiony tak, że nie uruchamia programów z bieżącego folderu
const gradlew = join(android, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run(`"${gradlew}" assembleRelease`, android);

const apk = join(android, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
mkdirSync(join(root, 'releases'), { recursive: true });
copyFileSync(apk, join(root, 'releases', 'MeTalk.apk'));
const sha256 = createHash('sha256').update(readFileSync(apk)).digest('hex');
writeFileSync(latestFile, JSON.stringify({ appVersion: version, apk: 'MeTalk.apk', sha256 }, null, 2) + '\n');

console.log(`\nWydanie ${version} gotowe: releases/MeTalk.apk + releases/latest.json`);
console.log('Teraz commit obu plików i wypchnięcie na main – telefony zobaczą je w „Sprawdź aktualizacje”.');
