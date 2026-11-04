#!/usr/bin/env node
// avvisa.mjs: manda un avviso sul telefono con un bot di Telegram. Senza le chiavi del bot scrive l'avviso
// solo sullo schermo ed esce senza errore. Pagina della wiki: wiki/entities/strumenti/avvisa.md
//
// Come si lancia, dalla cartella del cervello:
//   node bin/avvisa.mjs "testo"                               manda il testo
//   node bin/avvisa.mjs --da-controllo esito.json             legge l'esito di node bin/controlla.mjs --json e manda
//                                                             subito i rossi del controllo e) segreti e, fuori dai giri
//                                                             nati da un salvataggio, quelli di i) battiti; il lunedì e
//                                                             quando il flusso è lanciato a mano anche una riga di
//                                                             riepilogo, pure se è tutto verde
//   node bin/avvisa.mjs --da-controllo esito.json --riepilogo la riga di riepilogo anche se non è lunedì
//   node bin/avvisa.mjs --verifica                            dice se trova token e chat, senza mostrarli
//   node bin/avvisa.mjs --trova-chat                          con il token già salvato, chiede a Telegram gli ultimi
//                                                             messaggi mandati al bot e stampa il numero della chat
//                                                             (serve una volta sola, per salvare telegram-chat)
//   node bin/avvisa.mjs --aiuto                               questo aiuto
//
// Chiavi: telegram-token e telegram-chat, lette con bin/lib/chiavi.mjs (variabili TELEGRAM_BOT_TOKEN e
// TELEGRAM_CHAT_ID, oppure i file nella cartella privata delle chiavi). Se quel modulo manca, solo le variabili.
// Su GitHub il riepilogo parte dal giro pianificato del lunedì o da quello lanciato a mano (Run workflow), mai da un
// salvataggio; anche i battiti in ritardo non si ripetono a ogni salvataggio, li dice il giro quotidiano.
// Codici d'uscita: 0 avviso mandato, niente da mandare o chiavi assenti (l'avviso resta sullo schermo);
//   1 invio non riuscito, oppure con --verifica una chiave mancante (con --da-controllo un invio non riuscito
//   si scrive e si esce con 0, per non fermare il flusso); 2 opzione sconosciuta o errore d'uso.
// Non stampa mai il token; il numero della chat solo con --trova-chat, che serve proprio a trovarlo.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUESTO_FILE = fileURLToPath(import.meta.url);
const QUI = path.dirname(QUESTO_FILE);
const RADICE = path.resolve(QUI, '..');
const FILE_STATO = 'wiki/meta/stato-controlli.md';
const MAX_TESTO = 4000; // Telegram accetta fino a 4096 caratteri per messaggio

// ---------------------------------------------------------------- opzioni

function stampaAiuto() {
  const testo = fs.readFileSync(QUESTO_FILE, 'utf8').split(/\r?\n/);
  const out = [];
  for (const r of testo.slice(1)) { if (!r.startsWith('//')) break; out.push(r.replace(/^\/\/ ?/, '')); }
  console.log(out.join('\n'));
}
function errUso(msg) { console.error(`${msg} Vedi: node bin/avvisa.mjs --aiuto`); process.exit(2); }

const argv = process.argv.slice(2);
const opz = { daControllo: null, riepilogo: false, verifica: false, trovaChat: false, testo: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--da-controllo') {
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) errUso('--da-controllo vuole il file esito.json.');
    opz.daControllo = argv[++i];
  } else if (a === '--riepilogo') opz.riepilogo = true;
  else if (a === '--verifica') opz.verifica = true;
  else if (a === '--trova-chat') opz.trovaChat = true;
  else if (a === '--aiuto' || a === '--help' || a === '-h') { stampaAiuto(); process.exit(0); }
  else if (a.startsWith('--')) errUso(`Opzione sconosciuta: ${a}.`);
  else opz.testo.push(a);
}
if (opz.riepilogo && !opz.daControllo) errUso('--riepilogo va insieme a --da-controllo.');
if (opz.verifica && (opz.daControllo || opz.testo.length)) errUso('--verifica va da sola.');
if (opz.trovaChat && (opz.daControllo || opz.testo.length || opz.verifica)) errUso('--trova-chat va da sola.');
if (opz.daControllo && opz.testo.length) errUso('Con --da-controllo il testo lo decide il controllo.');

// ---------------------------------------------------------------- chiavi

const CHIAVI = [
  { nome: 'telegram-token', env: 'TELEGRAM_BOT_TOKEN', etichetta: 'Token del bot' },
  { nome: 'telegram-chat', env: 'TELEGRAM_CHAT_ID', etichetta: 'Chat' },
];

async function moduloChiavi() {
  try { return await import(pathToFileURL(path.join(QUI, 'lib', 'chiavi.mjs')).href); } catch { return null; }
}
function descriviDove(mod, nome) {
  const fn = mod && (mod.dove || mod.default?.dove);
  if (typeof fn !== 'function') return '';
  try {
    const d = fn(nome);
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object') {
      return ['tipo', 'fonte', 'dove', 'variabile', 'file', 'percorso'].map(k => d[k]).filter(x => typeof x === 'string' && x).join(' ');
    }
  } catch { /* la descrizione è facoltativa */ }
  return '';
}
// Restituisce { valore, dove } oppure { valore: null, motivo }. Il valore non esce mai da questo file.
async function leggiChiave(mod, k) {
  const fn = mod && (mod.chiave || mod.default?.chiave);
  if (typeof fn === 'function') {
    try {
      const v = await fn(k.nome);
      if (v !== undefined && v !== null && String(v).trim()) return { valore: String(v).trim(), dove: descriviDove(mod, k.nome) || 'trovata da bin/lib/chiavi.mjs' };
      return { valore: null, motivo: 'vuota' };
    } catch (e) { return { valore: null, motivo: e?.message || 'non trovata' }; }
  }
  const v = (process.env[k.env] || '').trim();
  if (v) return { valore: v, dove: `variabile ${k.env}` };
  return { valore: null, motivo: `variabile ${k.env} non impostata (bin/lib/chiavi.mjs non disponibile)` };
}
async function leggiChiavi() {
  const mod = await moduloChiavi();
  const [token, chat] = await Promise.all(CHIAVI.map(k => leggiChiave(mod, k)));
  return { token, chat };
}

// ---------------------------------------------------------------- invio

function nascondi(testo, segreti) {
  let t = String(testo);
  for (const s of segreti) if (s) t = t.split(s).join('***');
  return t;
}
async function manda(token, chat, testo) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: testo.slice(0, MAX_TESTO), disable_web_page_preview: true }),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(`Telegram ha risposto ${r.status}${j.description ? `: ${j.description}` : ''}`);
  } finally {
    clearTimeout(timer);
  }
}
// Manda o, senza chiavi, scrive solo sullo schermo. Restituisce true se tutto è andato come doveva.
async function avvisa(testo) {
  const { token, chat } = await leggiChiavi();
  if (!token.valore || !chat.valore) {
    const mancano = CHIAVI.filter((k, i) => ![token, chat][i].valore).map(k => k.nome).join(', ');
    console.log(`Avviso non mandato (mancano le chiavi: ${mancano}). Il testo resta qui:\n${testo}`);
    return true;
  }
  try {
    await manda(token.valore, chat.valore, testo);
    console.log('Avviso mandato.');
    return true;
  } catch (e) {
    const motivo = e?.name === 'AbortError' ? 'nessuna risposta da Telegram entro 15 secondi' : (e?.cause?.code || e?.message || String(e));
    console.error(`Avviso non mandato: ${nascondi(motivo, [token.valore, chat.valore])}. Il testo:\n${testo}`);
    return false;
  }
}

// ---------------------------------------------------------------- messaggi dal controllo

function nomeCervello() {
  const repo = (process.env.GITHUB_REPOSITORY || '').split('/').pop();
  return repo || path.basename(RADICE);
}
// I rossi di un controllo: i casi che iniziano con «rosso»; se nessuno ha il prefisso, tutti i casi di un controllo rosso.
function elencoRossi(c, max = 5) {
  const casi = Array.isArray(c.casi) ? c.casi.map(String) : [];
  const conPrefisso = casi.filter(s => /^rosso\b/.test(s)).map(s => s.replace(/^rosso\s+/, ''));
  const elenco = conPrefisso.length ? conPrefisso : casi;
  const altri = Math.max(0, (conPrefisso.length ? conPrefisso.length : (c.totale || casi.length)) - max);
  return elenco.slice(0, max).join('; ') + (altri ? `; e altri ${altri}` : '');
}
function messaggioDaControllo(file) {
  let esito;
  try { esito = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { esito = null; }
  const testa = `Cervello «${nomeCervello()}»`;
  if (!esito || !Array.isArray(esito.controlli) || !esito.riepilogo) {
    return `${testa}: il controllo non ha prodotto un esito leggibile (${path.basename(file)}). Guarda il registro del flusso: forse si è rotto il controllo stesso.`;
  }
  const trova = id => esito.controlli.find(x => x.id === id);
  const parti = [];
  const e = trova('e');
  if (e?.esito === 'rosso') parti.push(`Possibili segreti o dati personali nei file: ${elencoRossi(e)}. Togli il dato; se era una chiave vera, cambiala.`);
  const evento = process.env.GITHUB_EVENT_NAME || '';
  const i = trova('i');
  if (i?.esito === 'rosso' && evento !== 'push') parti.push(`Battiti in ritardo: ${elencoRossi(i)}. Un'automazione non gira più.`);
  const lunedi = new Date().getDay() === 1;
  if (opz.riepilogo || evento === 'workflow_dispatch' || (lunedi && evento !== 'push')) {
    const r = esito.riepilogo;
    const rossi = esito.controlli.filter(x => x.esito === 'rosso').map(x => `${x.id}) ${x.titolo}`);
    parti.push(`Riepilogo del controllo: ${r.rosso ?? 0} rossi, ${r.giallo ?? 0} gialli, ${r.verde ?? 0} verdi.` +
      (rossi.length ? ` Rossi: ${rossi.join('; ')}.` : '') + ` Dettagli in ${FILE_STATO}.`);
  }
  return parti.length ? `${testa}\n\n${parti.join('\n\n')}` : '';
}

// ---------------------------------------------------------------- esecuzione

if (opz.verifica) {
  const { token, chat } = await leggiChiavi();
  for (const [k, r] of [[CHIAVI[0], token], [CHIAVI[1], chat]]) {
    console.log(`${k.etichetta} (${k.nome}): ${r.valore ? `trovata (${r.dove})` : `manca (${nascondi(r.motivo, [token.valore, chat.valore])})`}`);
  }
  process.exit(token.valore && chat.valore ? 0 : 1);
}

if (opz.trovaChat) {
  const { token } = await leggiChiavi();
  if (!token.valore) { console.log(`Manca il token del bot (telegram-token): salvalo prima, poi rilancia. ${nascondi(token.motivo || '', [])}`); process.exit(1); }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`https://api.telegram.org/bot${token.valore}/getUpdates`, { signal: ctrl.signal });
    clearTimeout(timer);
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(`Telegram ha risposto ${r.status}${j.description ? `: ${j.description}` : ''}`);
    const chat = new Map();
    for (const u of j.result || []) {
      const c = (u.message || u.channel_post || u.my_chat_member || {}).chat;
      if (c && c.id !== undefined) chat.set(String(c.id), c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.username || c.type || '');
    }
    if (!chat.size) { console.log('Nessun messaggio recente al bot: scrivigli un messaggio qualunque dal telefono e rilancia.'); process.exit(1); }
    console.log('Numero della chat da salvare come telegram-chat (nel file telegram-chat.txt o nel segreto TELEGRAM_CHAT_ID):');
    for (const [id, nome] of chat) console.log(`  ${id}${nome ? `  (${nome})` : ''}`);
    process.exit(0);
  } catch (e) {
    const motivo = e?.name === 'AbortError' ? 'nessuna risposta da Telegram entro 15 secondi' : (e?.cause?.code || e?.message || String(e));
    console.error(`Richiesta non riuscita: ${nascondi(motivo, [token.valore])}`);
    process.exit(1);
  }
}

if (opz.daControllo) {
  const file = path.resolve(process.cwd(), opz.daControllo);
  if (!fs.existsSync(file)) errUso(`Il file ${opz.daControllo} non esiste.`);
  const testo = messaggioDaControllo(file);
  if (!testo) { console.log('Niente da mandare: nessun rosso nei controlli e) e i), e oggi non tocca il riepilogo (arriva il lunedì, o lanciando il flusso a mano).'); process.exit(0); }
  await avvisa(testo);
  process.exit(0);
}

const testo = opz.testo.join(' ').trim();
if (!testo) errUso('Manca il testo del messaggio.');
process.exit((await avvisa(testo)) ? 0 : 1);
