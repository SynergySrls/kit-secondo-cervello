// Parti comuni degli hook di Claude Code del cervello (avvio, instrada, dopo-modifica, proteggi).
// Un hook è un piccolo script che Claude Code lancia da solo in certi momenti (avvio della sessione, messaggio
// dell'utente, prima e dopo l'uso di uno strumento); i collegamenti stanno in .claude/settings.json.
// Pagina: wiki/entities/strumenti/hook.md · Registro: wiki/meta/strumenti.md
//
// Regole comuni:
//   - nessuna dipendenza, solo moduli node:;
//   - un errore non arriva mai alla sessione: diventa silenzio con uscita 0 (con CERVELLO_HOOK_DEBUG=1 va su stderr);
//   - l'uscita JSON è solo ASCII: i caratteri accentati diventano \uXXXX, così la codifica della console non conta;
//   - tetto di 2 secondi a ogni processo figlio (bin/costruisci.mjs, bin/controlla.mjs, git); se lo script non c'è
//     ancora, quel punto si salta in silenzio.
// Quando non fanno niente: con la variabile d'ambiente CERVELLO_HOOK uguale a 0, no, off o spenti, e sulle
// piattaforme elencate in «hook.spentiSu» di bin/impostazioni.json (win32, darwin, linux). Il criterio sta qui e
// non in .claude/settings.json perché quel file è versionato e arriva anche alle routine nel cloud.
// Cartella di stato della sincronizzazione (pausa, sync.log, da-riprendere.md): ~/.cervello-sync/<nome della
// cartella del cervello>/, oppure per intero quella indicata da CERVELLO_SYNC_DIR (stessa regola di
// bin/sincronizza.mjs). Cartella delle chiavi: «chiavi.cartella» di bin/impostazioni.json, oppure
// CERVELLO_CHIAVI_DIR (stessa regola di bin/lib/chiavi.mjs).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TETTO_MS = 2000;

export const ass = rel => path.join(RADICE, ...rel.split('/'));

// Percorso relativo alla radice con le barre «/», oppure null se il file sta fuori dal cervello.
export const relativo = p => {
  const r = path.relative(RADICE, path.resolve(p)).split(path.sep).join('/');
  return !r || r.startsWith('..') || path.isAbsolute(r) ? null : r;
};

export function leggi(relOAss) {
  try {
    const p = path.isAbsolute(relOAss) ? relOAss : ass(relOAss);
    return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  } catch { return null; }
}

let cacheImpostazioni;
export function impostazioni() {
  if (cacheImpostazioni === undefined) {
    try { cacheImpostazioni = JSON.parse(leggi('bin/impostazioni.json') || '{}') || {}; } catch { cacheImpostazioni = {}; }
  }
  return cacheImpostazioni;
}

export function attivo() {
  if (/^(0|no|off|spent[io])$/i.test(String(process.env.CERVELLO_HOOK || '').trim())) return false;
  const spenti = impostazioni().hook?.spentiSu;
  return !(Array.isArray(spenti) && spenti.includes(process.platform));
}

// L'ingresso dell'hook: JSON su stdin. Se manca o non è JSON, oggetto vuoto.
export function ingresso() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}') || {}; } catch { return {}; }
}

// Frontmatter YAML semplice: «chiave: valore» su una riga, virgolette tolte, liste in linea [a, b] come elenchi.
export function frontmatter(testo) {
  const m = String(testo || '').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  const pulisci = s => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  for (const r of m[1].split('\n')) {
    const k = r.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!k) continue;
    const v = k[2].trim();
    fm[k[1].toLowerCase()] = /^\[.*\]$/.test(v) ? v.slice(1, -1).split(',').map(pulisci).filter(Boolean) : pulisci(v);
  }
  return fm;
}

// Testo di una sezione «## titolo» fino al titolo successivo di livello 1 o 2 (null se non c'è). I titoli dentro
// i blocchi di codice non contano.
export function sezione(testo, titolo) {
  const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const righe = String(testo || '').split('\n');
  let inCodice = false, inizio = -1;
  for (let i = 0; i < righe.length; i++) {
    if (/^\s*(```|~~~)/.test(righe[i])) { inCodice = !inCodice; continue; }
    if (!inCodice && /^##\s+/.test(righe[i]) && norm(righe[i].replace(/^##\s+/, '')) === norm(titolo)) { inizio = i; break; }
  }
  if (inizio < 0) return null;
  const corpo = [];
  inCodice = false;
  for (const r of righe.slice(inizio + 1)) {
    if (/^\s*(```|~~~)/.test(r)) inCodice = !inCodice;
    if (!inCodice && /^#{1,2}\s/.test(r)) break;
    corpo.push(r);
  }
  return corpo.join('\n').trim();
}

// JSON solo ASCII, scritto in modo sincrono (subito dopo c'è process.exit).
function scriviJson(oggetto) {
  const json = JSON.stringify(oggetto).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  fs.writeSync(1, json + '\n');
}

// Aggiunge testo al contesto del modello, nel formato degli hook di Claude Code.
export function contesto(evento, testo) {
  if (!testo) return;
  scriviJson({ hookSpecificOutput: { hookEventName: evento, additionalContext: testo } });
}

// Nega l'uso di uno strumento (solo PreToolUse), con il motivo e cosa usare al posto.
export function nega(motivo) {
  scriviJson({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: motivo } });
}

// Esegue il corpo dell'hook se gli hook sono attivi; qualunque errore finisce in silenzio con uscita 0.
export function esegui(corpo) {
  if (!attivo()) process.exit(0);
  try { corpo(); } catch (e) {
    if (process.env.CERVELLO_HOOK_DEBUG) process.stderr.write(`hook: ${(e && e.stack) || e}\n`);
  }
  process.exit(0);
}

// Lancia uno script Node del cervello con il tetto di 2 secondi. null se lo script non esiste;
// codice null se non è finito in tempo o non è partito.
export function figlio(rel, args = []) {
  const script = ass(rel);
  if (!fs.existsSync(script)) return null;
  const r = spawnSync(process.execPath, [script, ...args], { cwd: RADICE, encoding: 'utf8', timeout: TETTO_MS,
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  return { codice: r.error || r.status === null ? null : r.status, out: r.stdout || '', err: r.stderr || '' };
}

// Righe dell'uscita di un comando git sul cervello (solo locale, tetto di 2 secondi); null se non riesce.
export function gitRighe(args) {
  const r = spawnSync('git', ['-C', RADICE, ...args], { encoding: 'utf8', timeout: TETTO_MS, windowsHide: true,
    stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' } });
  if (r.error || r.status !== 0) return null;
  return String(r.stdout || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

export const espandi = p => (p === '~' ? os.homedir() : /^~[\\/]/.test(p) ? path.join(os.homedir(), p.slice(2)) : p);

// Stessa regola di bin/sincronizza.mjs.
export function cartellaStato() {
  const v = String(process.env.CERVELLO_SYNC_DIR || '').trim();
  return v ? path.resolve(v) : path.join(os.homedir(), '.cervello-sync', path.basename(RADICE));
}

// Stessa regola di bin/lib/chiavi.mjs.
export function cartellaChiavi() {
  const v = String(process.env.CERVELLO_CHIAVI_DIR || '').trim();
  return path.resolve(espandi(v || impostazioni().chiavi?.cartella || '~/Cervello-Privato/chiavi'));
}

// Caratteri vietati da bin/impostazioni.json ([] se l'elenco non c'è: la regola vive lì).
export function caratteriVietati() {
  const elenco = impostazioni().caratteriVietati;
  return Array.isArray(elenco) ? elenco.filter(c => c && typeof c.carattere === 'string' && c.carattere) : [];
}

// Zona vincolante («zonaVincolante» di bin/impostazioni.json): file esatti, cartelle che finiscono con «/» e la
// voce speciale «type: regola» per le pagine regola.
export function inZonaVincolante(rel, fm = {}) {
  if (!rel) return false;
  for (const z of impostazioni().zonaVincolante || []) {
    if (/^type:\s*regola$/i.test(z)) { if (String(fm.type || '').toLowerCase() === 'regola') return true; continue; }
    if (z.endsWith('/') ? rel.startsWith(z) : rel === z) return true;
  }
  return false;
}

export const esenteStile = rel => Boolean(rel) && (impostazioni().esentiStile || []).includes(rel);
