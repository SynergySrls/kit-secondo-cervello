#!/usr/bin/env node
// Pianifica bin/sincronizza.mjs ogni N minuti su questo computer (N è «sincronizza.minuti» di bin/impostazioni.json),
// nascosto e senza finestre. Ricava i percorsi dalla propria posizione: se la cartella del cervello si sposta, si
// rilancia dalla cartella nuova con --fai. Non servono diritti di amministratore.
// Pagina: wiki/entities/strumenti/sincronizza.md · Registro: wiki/meta/strumenti.md
//
// Uso:
//   node bin/installa-sincronizzazione.mjs          mostra cosa farebbe, senza cambiare niente
//   node bin/installa-sincronizzazione.mjs --fai    crea o aggiorna la pianificazione
//   node bin/installa-sincronizzazione.mjs --togli  toglie la pianificazione
//   node bin/installa-sincronizzazione.mjs --aiuto  questo aiuto
// Cosa crea:
//   Windows  attività pianificata «Secondo cervello - sincronizza <nome cartella>» con
//            schtasks /Create /F /SC MINUTE /MO <minuti>, che lancia conhost.exe --headless "<node>" "<sincronizza.mjs>" --pianificato
//            (niente finestre); poi, con Set-ScheduledTask, permette i giri anche a batteria (schtasks da solo li
//            ferma quando il portatile è staccato dalla corrente). Se questo secondo passo non riesce, lo dice.
//   macOS    ~/Library/LaunchAgents/it.secondo-cervello.sincronizza.<nome>.plist con StartInterval in secondi e
//            RunAtLoad, caricato con launchctl load.
//   Linux    una riga di crontab: */<minuti> * * * * cd "<radice>" && "<node>" bin/sincronizza.mjs --pianificato
// Il percorso di node è quello del Node che lancia questo script (process.execPath): se si cambia versione di Node,
// si rilancia con --fai. La cartella di stato resta quella predefinita (~/.cervello-sync/<nome>): la variabile
// CERVELLO_SYNC_DIR serve alle prove e l'attività pianificata non la vede.
// Codici d'uscita: 0 in ordine, 1 comando di sistema non riuscito, 2 opzione sconosciuta.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const QUI = fileURLToPath(import.meta.url);
const RADICE = path.resolve(path.dirname(QUI), '..');

function minuti() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(RADICE, 'bin', 'impostazioni.json'), 'utf8').replace(/^\uFEFF/, ''));
    const m = Number(j?.sincronizza?.minuti);
    return Number.isFinite(m) && m >= 1 ? Math.round(m) : 10;
  } catch { return 10; }
}

const etichetta = nome => nome.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'cervello';
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const psStringa = s => `'${String(s).replace(/'/g, "''")}'`;
const perCron = s => String(s).replace(/(["\\$`])/g, '\\$1').replace(/%/g, '\\%'); // % in crontab vuol dire «a capo»

// Il piano per una piattaforma: cosa si crea e con quali comandi. Esportato per le prove (nessun effetto).
export function piano(piattaforma = process.platform, { radice = RADICE, node = process.execPath, casa = os.homedir() } = {}) {
  const nome = path.basename(radice);
  const m = minuti();
  if (piattaforma === 'win32') {
    const attivita = `Secondo cervello - sincronizza ${nome}`;
    const script = path.win32.join(radice, 'bin', 'sincronizza.mjs');
    const tr = `conhost.exe --headless "${node}" "${script}" --pianificato`;
    const batteria = `$ErrorActionPreference = 'Stop'; $s = (Get-ScheduledTask -TaskName ${psStringa(attivita)}).Settings; ` +
      '$s.DisallowStartIfOnBatteries = $false; $s.StopIfGoingOnBatteries = $false; $s.StartWhenAvailable = $true; ' +
      `Set-ScheduledTask -TaskName ${psStringa(attivita)} -Settings $s | Out-Null`;
    return {
      piattaforma, nome, minuti: m, attivita, tr,
      crea: ['schtasks', ['/Create', '/F', '/SC', 'MINUTE', '/MO', String(m), '/TN', attivita, '/TR', tr]],
      batteria: ['powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', batteria]],
      togli: ['schtasks', ['/Delete', '/F', '/TN', attivita]],
      controlla: ['schtasks', ['/Query', '/TN', attivita]],
    };
  }
  if (piattaforma === 'darwin') {
    const label = `it.secondo-cervello.sincronizza.${etichetta(nome)}`;
    const file = path.posix.join(casa.replace(/\\/g, '/'), 'Library', 'LaunchAgents', `${label}.plist`);
    const script = path.posix.join(radice.replace(/\\/g, '/'), 'bin', 'sincronizza.mjs');
    const contenuto = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xml(label)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(node)}</string>
    <string>${xml(script)}</string>
    <string>--pianificato</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xml(radice)}</string>
  <key>StartInterval</key>
  <integer>${m * 60}</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${xml(process.env.PATH || '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin')}</string>
  </dict>
  <key>StandardOutPath</key>
  <string>/dev/null</string>
  <key>StandardErrorPath</key>
  <string>/dev/null</string>
</dict>
</plist>
`;
    return { piattaforma, nome, minuti: m, label, file, contenuto,
      carica: ['launchctl', ['load', '-w', file]], scarica: ['launchctl', ['unload', '-w', file]] };
  }
  // Linux e gli altri sistemi con cron.
  const mm = Math.min(Math.max(m, 1), 59);
  const quando = m >= 60 ? '0 * * * *' : `*/${mm} * * * *`;
  const riga = `${quando} cd "${perCron(radice)}" && "${perCron(node)}" bin/sincronizza.mjs --pianificato`;
  const marca = `cd "${perCron(radice)}" && `;
  return { piattaforma, nome, minuti: m, riga, eNostra: r => r.includes(marca) && r.includes('bin/sincronizza.mjs') };
}

// ---------------------------------------------------------------- esecuzione

function lancia([cmd, args], opz = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000, ...opz });
  return { codice: r.error ? -1 : r.status, out: (r.stdout || '').trim(), err: (r.stderr || (r.error && r.error.message) || '').trim() };
}

// Come scrivere un argomento a schermo, per chi vuole copiare il comando.
const mostraArg = a => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const mostraCmd = ([cmd, args]) => [cmd, ...args.map(mostraArg)].join(' ');

function leggiCrontab() {
  const r = lancia(['crontab', ['-l']]);
  if (r.codice === 0) return { ok: true, righe: r.out ? r.out.split(/\r?\n/) : [] };
  if (/no crontab/i.test(r.err)) return { ok: true, righe: [] };
  return { ok: false, errore: r.err || `codice ${r.codice}` };
}

function avvertenze() {
  const out = [];
  if (!fs.existsSync(path.join(RADICE, 'bin', 'sincronizza.mjs'))) out.push('bin/sincronizza.mjs non c\'è accanto a questo script: la pianificazione partirebbe a vuoto.');
  const top = lancia(['git', ['-C', RADICE, 'rev-parse', '--show-toplevel']]);
  const stessa = (a, b) => {
    const v = p => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } };
    return process.platform === 'win32' || process.platform === 'darwin' ? v(a).toLowerCase() === v(b).toLowerCase() : v(a) === v(b);
  };
  if (top.codice !== 0) out.push('La cartella del cervello non è ancora un repository Git: ogni giro si fermerebbe (vedi la guida, passo Git).');
  else if (!stessa(top.out, RADICE)) out.push(`La cartella del cervello sta dentro un altro repository Git (${top.out}): ogni giro si fermerebbe finché il cervello non ha un repository suo (git init nella sua cartella).`);
  else {
    const remoti = lancia(['git', ['-C', RADICE, 'remote']]).out.split(/\r?\n/).filter(Boolean);
    if (!remoti.includes('origin')) out.push('Nessun remoto «origin»: i giri salveranno solo in locale finché non lo aggiungi (git remote add origin <indirizzo>).');
  }
  if (process.env.CERVELLO_SYNC_DIR) out.push('CERVELLO_SYNC_DIR è impostata in questa finestra: l\'attività pianificata non la vede e userà ~/.cervello-sync/<nome>.');
  return out;
}

function mostra(p) {
  console.log(`Cervello:  ${RADICE}`);
  if (p.piattaforma === 'win32') {
    const esiste = lancia(p.controlla).codice === 0;
    console.log('Sistema:   Windows (Utilità di pianificazione)');
    console.log(`Attività:  ${p.attivita} (${esiste ? 'esiste già: verrà aggiornata' : 'non esiste ancora'})`);
    console.log(`Lancia:    ${p.tr}`);
    console.log(`Quando:    ogni ${p.minuti} minuti, nascosta`);
    console.log('Comandi:');
    console.log(`  ${mostraCmd(p.crea)}`);
    console.log('  powershell.exe -NoProfile -Command "<Set-ScheduledTask: giri anche a batteria e recupero dei giri persi>"');
    if (p.tr.length > 261) console.log(`ATTENZIONE: il comando è lungo ${p.tr.length} caratteri e schtasks ne accetta 261: serve una cartella con un percorso più corto.`);
  } else if (p.piattaforma === 'darwin') {
    console.log('Sistema:   macOS (launchd)');
    console.log(`File:      ${p.file} (${fs.existsSync(p.file) ? 'esiste già: verrà riscritto' : 'non esiste ancora'})`);
    console.log(`Quando:    ogni ${p.minuti} minuti (StartInterval ${p.minuti * 60}) e all'accesso (RunAtLoad)`);
    console.log(`Comando:   ${mostraCmd(p.carica)}`);
  } else {
    const c = leggiCrontab();
    const gia = c.ok && c.righe.some(p.eNostra);
    console.log('Sistema:   Linux (crontab)');
    console.log(`Riga:      ${p.riga}`);
    console.log(`Stato:     ${!c.ok ? `crontab non leggibile (${c.errore})` : gia ? 'una riga per questo cervello c\'è già: verrà sostituita' : 'nessuna riga per questo cervello'}`);
  }
  for (const a of avvertenze()) console.log(`Nota:      ${a}`);
}

function fai(p) {
  if (p.piattaforma === 'win32') {
    if (p.tr.length > 261) { console.error('Percorso troppo lungo per schtasks: niente creato.'); return 1; }
    const c = lancia(p.crea);
    if (c.codice !== 0) { console.error(`schtasks non riuscito: ${c.err || c.out}`); return 1; }
    console.log(`Attività creata o aggiornata: ${p.attivita}`);
    const b = lancia(p.batteria);
    if (b.codice !== 0) console.log('Nota: non sono riuscito a permettere i giri a batteria. Su un portatile si cambia a mano: Utilità di pianificazione, proprietà dell\'attività, scheda Condizioni, togliere «Avvia l\'attività solo se il computer è alimentato da rete elettrica».');
    else console.log('Giri permessi anche a batteria.');
  } else if (p.piattaforma === 'darwin') {
    fs.mkdirSync(path.dirname(p.file), { recursive: true });
    if (fs.existsSync(p.file)) lancia(p.scarica); // ricarica pulita se c'era già
    fs.writeFileSync(p.file, p.contenuto, 'utf8');
    const c = lancia(p.carica);
    if (c.codice !== 0) { console.error(`launchctl load non riuscito: ${c.err || c.out}`); return 1; }
    console.log(`Pianificazione caricata: ${p.file}`);
  } else {
    const c = leggiCrontab();
    if (!c.ok) { console.error(`crontab non leggibile: ${c.errore}`); return 1; }
    const nuove = c.righe.filter(r => !p.eNostra(r));
    while (nuove.length && !nuove[nuove.length - 1].trim()) nuove.pop();
    nuove.push(p.riga);
    const w = lancia(['crontab', ['-']], { input: nuove.join('\n') + '\n' });
    if (w.codice !== 0) { console.error(`crontab non scritto: ${w.err || w.out}`); return 1; }
    console.log(`Riga aggiunta al crontab: ${p.riga}`);
  }
  console.log('Controllo del primo giro: node bin/sincronizza.mjs --stato (fra qualche minuto).');
  return 0;
}

function togli(p) {
  if (p.piattaforma === 'win32') {
    if (lancia(p.controlla).codice !== 0) { console.log(`Nessuna attività «${p.attivita}»: niente da togliere.`); return 0; }
    const c = lancia(p.togli);
    if (c.codice !== 0) { console.error(`schtasks non riuscito: ${c.err || c.out}`); return 1; }
    console.log(`Attività tolta: ${p.attivita}`);
  } else if (p.piattaforma === 'darwin') {
    if (!fs.existsSync(p.file)) { console.log(`Nessun file ${p.file}: niente da togliere.`); return 0; }
    lancia(p.scarica);
    fs.rmSync(p.file, { force: true });
    console.log(`Pianificazione tolta: ${p.file}`);
  } else {
    const c = leggiCrontab();
    if (!c.ok) { console.error(`crontab non leggibile: ${c.errore}`); return 1; }
    if (!c.righe.some(p.eNostra)) { console.log('Nessuna riga per questo cervello nel crontab: niente da togliere.'); return 0; }
    const w = lancia(['crontab', ['-']], { input: c.righe.filter(r => !p.eNostra(r)).join('\n') + '\n' });
    if (w.codice !== 0) { console.error(`crontab non scritto: ${w.err || w.out}`); return 1; }
    console.log('Riga tolta dal crontab.');
  }
  return 0;
}

function main(argv) {
  const note = ['--fai', '--togli', '--aiuto', '-h', '--help'];
  const ignote = argv.filter(a => !note.includes(a));
  if (ignote.length || (argv.includes('--fai') && argv.includes('--togli'))) {
    console.error(ignote.length ? `Opzione sconosciuta: ${ignote.join(' ')}` : '--fai e --togli insieme non hanno senso.');
    console.error('Vedi: node bin/installa-sincronizzazione.mjs --aiuto');
    return 2;
  }
  if (argv.some(a => ['--aiuto', '-h', '--help'].includes(a))) {
    console.log('node bin/installa-sincronizzazione.mjs          mostra cosa farebbe, senza cambiare niente');
    console.log('node bin/installa-sincronizzazione.mjs --fai    crea o aggiorna la pianificazione di bin/sincronizza.mjs');
    console.log('node bin/installa-sincronizzazione.mjs --togli  toglie la pianificazione');
    console.log('Pagina: wiki/entities/strumenti/sincronizza.md');
    return 0;
  }
  const p = piano();
  if (argv.includes('--togli')) return togli(p);
  mostra(p);
  if (!argv.includes('--fai')) {
    console.log('\nNiente è stato cambiato. Per farlo davvero: node bin/installa-sincronizzazione.mjs --fai');
    return 0;
  }
  console.log('');
  return fai(p);
}

const lanciato = (() => {
  if (!process.argv[1]) return false;
  const a = path.resolve(process.argv[1]), b = QUI;
  return process.platform === 'win32' || process.platform === 'darwin' ? a.toLowerCase() === b.toLowerCase() : a === b;
})();
if (lanciato) process.exitCode = main(process.argv.slice(2));
