#!/usr/bin/env node
// Un solo modulo per trovare le chiavi degli script (token, chiavi di accesso a servizi) senza mai mostrarle.
// Pagina: wiki/entities/strumenti/chiavi.md · Regola: wiki/concepts/dove-si-lavora.md · Registro: wiki/meta/strumenti.md
//
// Le chiavi note stanno in bin/impostazioni.json, sezione «chiavi»: la cartella e, per ogni nome, le variabili
// d'ambiente («env») e il nome del file («file»). Ordine di ricerca per una chiave:
//   1. le variabili d'ambiente dell'elenco, nell'ordine (routine nel cloud, server, GitHub Actions);
//   2. il file nella cartella delle chiavi, fuori dal cervello: «chiavi.cartella» con ~ espanso nella cartella
//      utente, oppure la cartella indicata dalla variabile d'ambiente CERVELLO_CHIAVI_DIR.
// Un nome che non è nell'elenco si cerca solo come file <nome>.txt (o <nome>, se ha già un'estensione).
// Il valore non si stampa mai: gli errori dicono il nome della chiave e i posti cercati.
//
// Uso negli script (moduli ES):
//   import { chiave, dove, ChiaveMancante } from './lib/chiavi.mjs';
//   chiave('telegram-token')   il testo della chiave (spazi e a capo tolti), oppure lancia ChiaveMancante
//   dove('telegram-token')     { nome, fonte: 'variabile' | 'file', dove } oppure null, senza leggere il valore
// Da riga di comando:
//   node bin/lib/chiavi.mjs --verifica [nome ...]   per ogni chiave: trovata in variabile, trovata in file, mancante
//   node bin/lib/chiavi.mjs --aiuto
// Codici d'uscita: 0 in ordine (senza nomi l'elenco intero è solo informativo ed esce 0 anche se manca qualche
// chiave facoltativa); 1 manca almeno una delle chiavi chieste per nome; 2 opzione sconosciuta.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const QUI = fileURLToPath(import.meta.url);
const FILE_IMPOSTAZIONI = path.resolve(path.dirname(QUI), '..', 'impostazioni.json');
const CARTELLA_PREDEFINITA = '~/Cervello-Privato/chiavi';

function impostazioniChiavi() {
  try {
    const j = JSON.parse(fs.readFileSync(FILE_IMPOSTAZIONI, 'utf8').replace(/^\uFEFF/, ''));
    return (j && j.chiavi) || {};
  } catch { return {}; }
}

export function espandi(p) {
  if (p === '~') return os.homedir();
  if (/^~[\\/]/.test(p)) return path.join(os.homedir(), p.slice(2));
  return p;
}

// La cartella delle chiavi (stessa regola in bin/hooks/comune.mjs).
export function cartellaChiavi() {
  const v = String(process.env.CERVELLO_CHIAVI_DIR || '').trim();
  return path.resolve(espandi(v || impostazioniChiavi().cartella || CARTELLA_PREDEFINITA));
}

export function nomiChiavi() {
  return Object.keys(impostazioniChiavi().elenco || {});
}

function definizione(nome) {
  const n = String(nome || '');
  if (!n || /[\\/]/.test(n) || n.includes('..')) throw new Error(`Nome di chiave non valido: «${n}»`);
  const d = (impostazioniChiavi().elenco || {})[n];
  const file = d ? d.file : (path.extname(n) ? n : `${n}.txt`);
  return {
    env: d ? [].concat(d.env || []).filter(Boolean) : [],
    file: file && !/[\\/]/.test(file) && !file.includes('..') ? file : null,
  };
}

export class ChiaveMancante extends Error {
  constructor(nome, posti) {
    super(`Chiave «${nome}» non trovata. Cercata in: ${posti.join('; ') || 'nessun posto configurato'}. ` +
      'Il valore non si scrive mai nel cervello: vedi wiki/concepts/dove-si-lavora.md');
    this.name = 'ChiaveMancante';
    this.nome = nome;
    this.posti = posti;
  }
}

// I posti dove si cerca una chiave, in ordine (solo nomi di variabili e percorsi, mai valori).
export function posti(nome) {
  const d = definizione(nome);
  return [
    ...d.env.map(v => `variabile d'ambiente ${v}`),
    ...(d.file ? [`file ${path.join(cartellaChiavi(), d.file)}`] : []),
  ];
}

// Dove si trova la chiave, senza leggerne il valore: { nome, fonte, dove } oppure null.
export function dove(nome) {
  const d = definizione(nome);
  for (const v of d.env) if (String(process.env[v] || '').trim()) return { nome, fonte: 'variabile', dove: v };
  if (d.file) {
    const p = path.join(cartellaChiavi(), d.file);
    try {
      const st = fs.statSync(p);
      if (st.isFile() && st.size > 0) return { nome, fonte: 'file', dove: p };
    } catch { /* non c'è */ }
  }
  return null;
}

// Il testo della chiave, spazi e a capo tolti. Lancia ChiaveMancante se non c'è o è vuota.
export function chiave(nome) {
  const r = dove(nome);
  if (r) {
    const grezzo = r.fonte === 'variabile' ? process.env[r.dove] : fs.readFileSync(r.dove, 'utf8');
    const valore = String(grezzo || '').replace(/^\uFEFF/, '').trim();
    if (valore) return valore;
  }
  throw new ChiaveMancante(nome, posti(nome));
}

export default { chiave, dove, posti, cartellaChiavi, nomiChiavi, espandi, ChiaveMancante };

// ---------------------------------------------------------------- da riga di comando

function lanciatoDirettamente() {
  if (!process.argv[1]) return false;
  const uguali = (a, b) => (process.platform === 'win32' || process.platform === 'darwin' ? a.toLowerCase() === b.toLowerCase() : a === b);
  try { return uguali(fs.realpathSync(process.argv[1]), fs.realpathSync(QUI)); } catch { return uguali(path.resolve(process.argv[1]), QUI); }
}

if (lanciatoDirettamente()) {
  const argv = process.argv.slice(2);
  const opzioni = argv.filter(a => a.startsWith('-'));
  const nomi = argv.filter(a => !a.startsWith('-'));
  const ignote = opzioni.filter(o => !['--verifica', '--aiuto', '-h', '--help'].includes(o));
  if (ignote.length) {
    console.error(`Opzione sconosciuta: ${ignote.join(' ')}. Vedi: node bin/lib/chiavi.mjs --aiuto`);
    process.exit(2);
  }
  const cartella = `${cartellaChiavi()}${process.env.CERVELLO_CHIAVI_DIR ? ' (da CERVELLO_CHIAVI_DIR)' : ''}`;
  if (!opzioni.includes('--verifica') || opzioni.some(o => o !== '--verifica')) {
    console.log('node bin/lib/chiavi.mjs --verifica [nome ...]   dice dove trova ogni chiave, senza mostrarla');
    console.log('node bin/lib/chiavi.mjs --aiuto                 questo aiuto');
    console.log(`Cartella delle chiavi: ${cartella}`);
    console.log(`Chiavi note (bin/impostazioni.json): ${nomiChiavi().join(', ') || 'nessuna'}`);
    process.exit(0);
  }
  console.log(`Cartella delle chiavi: ${cartella}`);
  const elenco = nomi.length ? nomi : nomiChiavi();
  if (!elenco.length) console.log('Nessuna chiave nell\'elenco di bin/impostazioni.json (sezione «chiavi»).');
  let mancano = 0;
  const larghezza = Math.max(10, ...elenco.map(n => n.length));
  for (const n of elenco) {
    let r;
    try { r = dove(n); } catch (e) { mancano++; console.log(`errore                 ${n.padEnd(larghezza)}  ${e.message}`); continue; }
    if (r && r.fonte === 'variabile') console.log(`trovata in variabile   ${n.padEnd(larghezza)}  ${r.dove}`);
    else if (r) console.log(`trovata in file        ${n.padEnd(larghezza)}  ${r.dove}`);
    else { mancano++; console.log(`mancante               ${n.padEnd(larghezza)}  cercata in: ${posti(n).join('; ')}`); }
  }
  process.exit(mancano && nomi.length ? 1 : 0);
}
