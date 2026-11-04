#!/usr/bin/env node
// Costruisce i file che si ricavano dalle pagine regola del cervello: il nucleo (wiki/meta/nucleo.md), i blocchi
// generati in AGENTS.md e negli SKILL.md sotto automazioni/, la versione dei plugin e il marketplace
// (.claude-plugin/marketplace.json). Con --esporta prepara anche il pacchetto per le chat senza cartella.
// Pagina: wiki/entities/strumenti/costruisci.md · Registro: wiki/meta/strumenti.md
//
// Uso:
//   node bin/costruisci.mjs              rigenera i file generati; riscrive un file solo se cambia il contenuto
//                                        (la data non conta)
//   node bin/costruisci.mjs --verifica   non scrive niente: esce 1 se una regola non è in ordine o se un file
//                                        generato è indietro, e dice quale
//   node bin/costruisci.mjs --elenco     tabella delle pagine regola: nome, ambito, nucleo, ordine
//   node bin/costruisci.mjs --esporta    rigenera, poi scrive in esporta/ le istruzioni e i file di conoscenza per
//                                        una chat che ha il cervello solo come file caricati (cancella e ricrea
//                                        solo la cartella esporta/): istruzioni-chat.md (istruzioni del progetto),
//                                        istruzioni-brevi.md (per le istruzioni personali, che hanno poco spazio)
//                                        e conoscenza-*.md. Restano fuori le pagine con riservato: true o esporta: no.
//   node bin/costruisci.mjs --esporta --txt   uguale, ma i file di conoscenza escono come .txt (per le piattaforme
//                                        che non accettano i .md come conoscenza)
//   node bin/costruisci.mjs --aiuto      questo testo
//
// Codici d'uscita: 0 tutto in ordine; 1 regole non in ordine o (con --verifica) file da rigenerare; 2 opzione
// sconosciuta o errore d'uso.
//
// Pagine regola: i .md sotto wiki/ (tranne wiki/meta/) con type: regola e status diverso da superseded e archived.
// Prima di scrivere controlla title, ambito, nucleo, ordine, la sezione «In breve» (da 1 a 4 righe che iniziano con
// «- »), i caratteri vietati di bin/impostazioni.json, i nomi di file doppi e la sezione «Regola d'ambito» della
// pagina indicata in fileRegolaAmbito. Se qualcosa non va non scrive niente e dice cosa correggere.
//
// Blocchi generati: in AGENTS.md e in ogni SKILL.md sotto automazioni/ il testo fra una riga <!-- genera: TIPO -->
// e una riga <!-- fine: TIPO --> lo scrive solo questo script. Tipi: nucleo (il nucleo dalla riga «Generato il» in
// giù, titoli abbassati di un livello; senza la tabella degli strumenti se nello stesso file c'è anche un blocco
// instradamento) e instradamento (la tabella «Richiesta → strumento» di wiki/meta/strumenti.md).
//
// Plugin: ogni cartella sotto automazioni/ con .claude-plugin/plugin.json. Quando il contenuto cambia (impronta in
// .claude-plugin/impronte.json alla radice) alza l'ultima cifra della versione; poi riscrive il marketplace.
//
// Si può anche importare: leggiImpostazioni(), frontmatter(testo), sezione(testo, titolo), trovaRegole(),
// costruisci({ scrivi: false }), che restituisce l'elenco delle differenze (vuoto se è tutto aggiornato).
// Node 18 o più recente, nessuna dipendenza; la radice del cervello si calcola dalla posizione dello script.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILE_IMPOSTAZIONI = 'bin/impostazioni.json';
export const FILE_NUCLEO = 'wiki/meta/nucleo.md';
export const FILE_STRUMENTI = 'wiki/meta/strumenti.md';
export const FILE_AGENTS = 'AGENTS.md';
export const FILE_IMPRONTE = '.claude-plugin/impronte.json';
export const FILE_MARKETPLACE = '.claude-plugin/marketplace.json';
export const CARTELLA_ESPORTA = 'esporta';
export const SEZIONE_STRUMENTI = 'Richiesta → strumento';
const SEZIONE_AMBITO = "Regola d'ambito";
const SEZIONE_ALTRE = 'Le altre regole (si aprono quando servono)';
const INTESTAZIONE_STRUMENTI = ['Parole tipiche', 'Strumento, per primo', 'Dove gira', 'Da non usare', 'Pagina'];
const MAX_IN_BREVE = 4;
const COMANDO = 'node bin/costruisci.mjs';
const TABELLA_MANCANTE = `La tabella «${SEZIONE_STRUMENTI}» non è ancora scritta in \`${FILE_STRUMENTI}\`.`;
// Cartelle che non si guardano mai, file di sistema che non contano, estensioni lette come testo.
const SALTATE = new Set(['.git', 'node_modules', '_da_eliminare', 'esporta', '.raw', '_modelli']);
const RUMORE = new Set(['desktop.ini', 'Thumbs.db', '.DS_Store']);
const ESTENSIONI_TESTO = /\.(md|txt|json|ya?ml|mjs|cjs|js|ts|py|ps1|sh|cmd|bat|html?|css|csv|toml|xml|svg)$/i;
const BOM = String.fromCharCode(0xfeff);
const APOSTROFI = new RegExp(`[${String.fromCharCode(0x2018, 0x2019)}]`, 'g');

// Valori usati quando in bin/impostazioni.json manca una chiave.
const PREDEFINITE = {
  persona: '',
  ambiti: [{ chiave: 'tutto', titolo: 'Valgono sempre' }],
  fileRegolaAmbito: 'wiki/concepts/ambito.md',
  caratteriVietati: [],
  marketplace: { nome: 'secondo-cervello', proprietario: '' },
  limiti: { istruzioniChat: 8000, agentsKB: 32, fileEsportaKB: 300, fileEsportaMax: 20, istruzioniBrevi: 5000 },
};

// ---------------------------------------------------------------- utilità

const ass = rel => path.join(RADICE, ...rel.split('/'));
const norm = s => String(s ?? '').replace(new RegExp(`^${BOM}`), '').replace(/\r\n/g, '\n');
function leggi(rel) {
  try { return norm(fs.readFileSync(ass(rel), 'utf8')); } catch { return null; }
}
// Scrive mantenendo gli a capo (\r\n o \n) e il BOM del file che c'era.
function scriviFile(rel, testo) {
  let vecchio = null;
  try { vecchio = fs.readFileSync(ass(rel), 'utf8'); } catch { /* file nuovo */ }
  let out = testo;
  if (vecchio && vecchio.includes('\r\n')) out = out.replace(/\n/g, '\r\n');
  if (vecchio && vecchio.startsWith(BOM)) out = BOM + out;
  fs.mkdirSync(path.dirname(ass(rel)), { recursive: true });
  fs.writeFileSync(ass(rel), out, 'utf8');
}
const due = n => String(n).padStart(2, '0');
const kb = byte => (byte / 1024).toFixed(1).replace('.', ',');
export const oggi = (d = new Date()) => `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
const adesso = (d = new Date()) => `${oggi(d)} ${due(d.getHours())}:${due(d.getMinutes())}`;
const normTitolo = s => String(s).toLowerCase().replace(APOSTROFI, "'").replace(/\s+/g, ' ').trim();
const senzaDate = s => s.replace(/^aggiornato: .*$/m, 'aggiornato:').replace(/Generato il \d{4}-\d{2}-\d{2}/g, 'Generato il');
const ordinato = o => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

// File sotto una cartella (relativi alla radice, con /), saltando SALTATE; filtro sul percorso.
function cammina(relDir, filtro = () => true) {
  const out = [];
  const pila = [relDir];
  while (pila.length) {
    const d = pila.pop();
    let voci;
    try { voci = fs.readdirSync(ass(d), { withFileTypes: true }); } catch { continue; }
    for (const v of voci) {
      const rel = d ? `${d}/${v.name}` : v.name;
      if (v.isDirectory()) { if (!SALTATE.has(v.name)) pila.push(rel); }
      else if (v.isFile() && filtro(rel)) out.push(rel);
    }
  }
  return out.sort();
}

// Per ogni riga: true se sta fuori da un blocco di codice (``` o ~~~).
function mappaCodice(righe) {
  const fuori = [];
  let apertura = null;
  for (const r of righe) {
    const m = r.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (apertura) {
      fuori.push(false);
      if (m && m[1][0] === apertura[0] && m[1].length >= apertura.length) apertura = null;
    } else if (m) { apertura = m[1]; fuori.push(false); }
    else fuori.push(true);
  }
  return fuori;
}

// Frontmatter YAML semplice: righe «chiave: valore», virgolette tolte, liste in linea [a, b] come array.
// Le chiavi diventano minuscole; i valori restano stringhe.
export function frontmatter(testo) {
  const m = norm(testo).match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!m) return {};
  const via = s => s.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  const fm = {};
  for (const riga of m[1].split('\n')) {
    const k = riga.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!k) continue;
    const v = k[2].trim();
    fm[k[1].toLowerCase()] = /^\[.*\]$/.test(v) ? v.slice(1, -1).split(',').map(x => via(x.trim())).filter(Boolean) : via(v);
  }
  return fm;
}

// Testo di una sezione (titolo di qualunque livello, maiuscole e apostrofi non contano) fino al titolo successivo
// dello stesso livello o più alto, saltando i blocchi di codice. Senza righe vuote ai bordi; null se manca.
export function sezione(testo, titolo) {
  const righe = norm(testo).split('\n');
  const fuori = mappaCodice(righe);
  const cerca = normTitolo(titolo);
  let inizio = -1, livello = 0, fine = righe.length;
  for (let i = 0; i < righe.length; i++) {
    const h = fuori[i] && righe[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!h) continue;
    if (inizio < 0) { if (normTitolo(h[2]) === cerca) { inizio = i; livello = h[1].length; } }
    else if (h[1].length <= livello) { fine = i; break; }
  }
  if (inizio < 0) return null;
  const corpo = righe.slice(inizio + 1, fine);
  while (corpo.length && !corpo[0].trim()) corpo.shift();
  while (corpo.length && !corpo[corpo.length - 1].trim()) corpo.pop();
  return corpo.join('\n');
}

function abbassaTitoli(testo, n = 1) {
  const righe = testo.split('\n');
  const fuori = mappaCodice(righe);
  return righe.map((r, i) => {
    const m = fuori[i] && r.match(/^(#{1,6})(\s.*)$/);
    return m ? '#'.repeat(Math.min(6, m[1].length + n)) + m[2] : r;
  }).join('\n');
}

// ---------------------------------------------------------------- impostazioni e regole

export function leggiImpostazioni() {
  const testo = leggi(FILE_IMPOSTAZIONI);
  if (testo === null) throw new Error(`manca ${FILE_IMPOSTAZIONI}, l'unica configurazione del cervello`);
  let dati;
  try { dati = JSON.parse(testo); } catch (e) { throw new Error(`${FILE_IMPOSTAZIONI} non è un JSON valido: ${e.message}`); }
  return {
    ...PREDEFINITE,
    ...dati,
    ambiti: Array.isArray(dati.ambiti) ? dati.ambiti : PREDEFINITE.ambiti,
    marketplace: { ...PREDEFINITE.marketplace, ...(dati.marketplace || {}) },
    limiti: { ...PREDEFINITE.limiti, ...(dati.limiti || {}) },
  };
}

const vietatiDa = imp => (Array.isArray(imp.caratteriVietati) ? imp.caratteriVietati : [])
  .filter(v => v && typeof v.carattere === 'string' && v.carattere)
  .map(v => ({ nome: v.nome || 'carattere vietato', carattere: v.carattere, consiglio: v.consiglio || 'toglilo' }));
// Un pezzo di riga da mostrare, con i caratteri vietati scritti per nome (così non finiscono nei rapporti).
const mostra = (s, vietati) => vietati.reduce((t, v) => t.split(v.carattere).join(`[${v.nome}]`), String(s).trim()).slice(0, 90);

const siNo = v => {
  const s = String(v ?? '').trim().toLowerCase();
  if (['sì', 'si', 'yes', 'true'].includes(s)) return true;
  if (['no', 'false'].includes(s)) return false;
  return null;
};

// Le pagine regola in vigore. Restituisce un array di { file, nome, titolo, ambito, nucleo, ordine, status,
// inBreve, testo, errori }; sull'array ci sono anche .regole (lo stesso elenco) e .errori (tutti i problemi).
export function trovaRegole(imp = leggiImpostazioni()) {
  const vietati = vietatiDa(imp);
  const regole = [];
  for (const file of cammina('wiki', f => /\.md$/i.test(f) && !f.startsWith('wiki/meta/'))) {
    const testo = leggi(file);
    const fm = frontmatter(testo);
    if (String(fm.type || '').toLowerCase() !== 'regola') continue;
    const status = String(fm.status || '').toLowerCase();
    if (status === 'superseded' || status === 'archived') continue;
    const r = {
      file, nome: path.posix.basename(file).replace(/\.md$/i, ''), titolo: String(fm.title || '').trim(),
      ambito: String(fm.ambito || '').trim(), nucleo: siNo(fm.nucleo), ordine: 1000, status, inBreve: [], testo, errori: [],
    };
    const err = m => r.errori.push(`${file}: ${m}`);
    if (!r.titolo) err('manca «title» nel frontmatter');
    if (!r.ambito) err('manca «ambito» nel frontmatter (per esempio tutto o scrittura)');
    else if (!/^[a-z][a-z0-9-]*$/.test(r.ambito)) err(`ambito «${r.ambito}» non valido: una parola minuscola, con cifre e trattini se servono (per esempio tutto o scrittura)`);
    if (r.nucleo === null) err(`«nucleo» deve essere sì o no, trovato «${fm.nucleo ?? ''}»`);
    if (fm.ordine !== undefined && String(fm.ordine).trim() !== '') {
      const n = Number(fm.ordine);
      if (Number.isFinite(n)) r.ordine = n;
      else err(`«ordine» deve essere un numero, trovato «${fm.ordine}»`);
    }
    const breve = sezione(testo, 'In breve');
    if (breve === null) err('manca la sezione «## In breve», subito sotto il titolo della pagina');
    else if (!breve.trim()) err('la sezione «In breve» è vuota: servono da 1 a 4 righe che iniziano con «- »');
    else {
      const righe = breve.split('\n');
      if (righe.length > MAX_IN_BREVE) err(`«In breve» ha ${righe.length} righe, il massimo è ${MAX_IN_BREVE}: accorcia o unisci le righe (la regola intera sta nelle sezioni sotto)`);
      righe.forEach((x, i) => {
        if (!x.trim()) err(`«In breve», riga ${i + 1}: riga vuota in mezzo: le righe dell'«In breve» stanno attaccate, ognuna inizia con «- »`);
        else if (!x.startsWith('- ')) err(`«In breve», riga ${i + 1}: ogni riga deve iniziare con «- » (niente riquadri >, niente ---): «${mostra(x, vietati)}»`);
        else if (/^- <[^<>]*>?\s*$|^- <[A-Za-zÀ-ÿ][^<>]*\s/.test(x)) err(`«In breve», riga ${i + 1}: è ancora il segnaposto del modello (_modelli/regola.md): scrivi la regola al posto di «${mostra(x, vietati)}»`);
      });
      r.inBreve = righe;
    }
    if (/^<.*>$/.test(r.titolo)) err(`il titolo «${r.titolo}» è ancora il segnaposto del modello: scrivi il nome della regola`);
    for (const v of vietati) {
      if (r.titolo.includes(v.carattere)) err(`il titolo contiene un carattere vietato (${v.nome}): ${v.consiglio}`);
      (breve || '').split('\n').forEach((x, i) => {
        if (x.includes(v.carattere)) err(`«In breve», riga ${i + 1}: carattere vietato (${v.nome}): ${v.consiglio}`);
      });
    }
    regole.push(r);
  }
  // Un nome di file regola deve essere unico in tutto il cervello, altrimenti [[nome]] è ambiguo.
  const doppi = [];
  const perNome = new Map();
  for (const f of cammina('', x => /\.md$/i.test(x))) {
    const n = path.posix.basename(f).replace(/\.md$/i, '').toLowerCase();
    if (!perNome.has(n)) perNome.set(n, []);
    perNome.get(n).push(f);
  }
  for (const r of regole) {
    const stessi = perNome.get(r.nome.toLowerCase()) || [];
    if (stessi.length > 1) doppi.push(`${stessi.join(', ')}: più file con lo stesso nome «${r.nome}.md», così [[${r.nome}]] è ambiguo: rinomina uno dei due`);
  }
  regole.regole = regole;
  regole.errori = [...regole.flatMap(r => r.errori), ...doppi];
  return regole;
}

function ordinaAmbiti(chiavi, imp) {
  const noti = imp.ambiti.map(a => a.chiave);
  return [...new Set(chiavi)].sort((a, b) => {
    const ia = noti.indexOf(a), ib = noti.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0 || ib >= 0) return ia >= 0 ? -1 : 1;
    return a.localeCompare(b);
  });
}
const titoloAmbito = (k, imp) => (imp.ambiti.find(a => a.chiave === k) || {}).titolo || k;
const perOrdine = (a, b) => (a.ordine - b.ordine) || a.titolo.localeCompare(b.titolo, 'it');
function ordinaRegole(regole, imp) {
  const ambiti = ordinaAmbiti(regole.map(r => r.ambito), imp);
  return [...regole].sort((a, b) => (ambiti.indexOf(a.ambito) - ambiti.indexOf(b.ambito)) || perOrdine(a, b));
}

// ---------------------------------------------------------------- nucleo e blocchi

// La tabella «Richiesta → strumento» del registro, copiata così com'è: { tabella, avviso }.
function tabellaStrumenti() {
  const testo = leggi(FILE_STRUMENTI);
  if (testo === null) return { tabella: null, avviso: `manca ${FILE_STRUMENTI}: il nucleo esce senza la tabella «${SEZIONE_STRUMENTI}»` };
  const righe = (sezione(testo, SEZIONE_STRUMENTI) || '').split('\n');
  const i = righe.findIndex(r => r.trim().startsWith('|'));
  if (i < 0) return { tabella: null, avviso: `${FILE_STRUMENTI}: manca la sezione «## ${SEZIONE_STRUMENTI}» con la sua tabella` };
  let j = i;
  while (j < righe.length && righe[j].trim().startsWith('|')) j++;
  const celle = righe[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const avviso = celle.join('|') === INTESTAZIONE_STRUMENTI.join('|') ? null
    : `${FILE_STRUMENTI}: l'intestazione della tabella «${SEZIONE_STRUMENTI}» non è quella attesa (| ${INTESTAZIONE_STRUMENTI.join(' | ')} |)`;
  return { tabella: righe.slice(i, j).join('\n'), avviso };
}

function testoNucleo({ imp, regole, data, testa, tabella }) {
  const nomeAmbito = path.posix.basename(imp.fileRegolaAmbito).replace(/\.md$/i, '');
  const out = [
    '---', 'title: "Nucleo delle regole"', 'type: meta', 'status: current', 'generato: true', `aggiornato: ${data}`, '---', '',
    '# Nucleo delle regole', '',
    `> Generato il ${data} da \`${COMANDO}\` dalle pagine regola: non si modifica a mano.`,
    '> Per cambiare una regola si cambia la sua pagina (sezione «In breve») e si rilancia lo script.', '',
    'Qui ogni regola è in breve; la regola intera sta nella pagina linkata. Se una memoria, una skill o un plugin dicono',
    'altro, vale questo nucleo.', '',
    '## Prima di tutto: di chi è questa sessione', '',
    `${testa} ([[${nomeAmbito}]])`, '',
  ];
  const nelNucleo = regole.filter(r => r.nucleo === true);
  for (const k of ordinaAmbiti(nelNucleo.map(r => r.ambito), imp)) {
    out.push(`## ${titoloAmbito(k, imp)}`, '');
    for (const r of nelNucleo.filter(x => x.ambito === k).sort(perOrdine)) out.push(`### ${r.titolo} ([[${r.nome}]])`, ...r.inBreve, '');
  }
  out.push(`## ${SEZIONE_STRUMENTI}`, '', tabella || TABELLA_MANCANTE, '', `## ${SEZIONE_ALTRE}`, '');
  const altre = regole.filter(r => r.nucleo === false);
  if (!altre.length) out.push('Nessuna, per ora.');
  for (const k of ordinaAmbiti(altre.map(r => r.ambito), imp)) {
    out.push(`- **${titoloAmbito(k, imp)}**: ${altre.filter(x => x.ambito === k).sort(perOrdine).map(r => `[[${r.nome}]]`).join(' · ')}`);
  }
  return `${out.join('\n')}\n`;
}

// Il corpo del nucleo dalla riga «Generato il» in giù, con i titoli abbassati di un livello. «senza» toglie le
// sezioni ## con quei titoli; «senzaTesta» toglie le due righe iniziali che parlano dello script.
function corpoNucleo(nucleo, { senza = [], senzaTesta = false } = {}) {
  const righe = nucleo.trimEnd().split('\n');
  const via = new Set(senza.map(normTitolo));
  const out = [];
  let salta = false;
  for (const r of righe.slice(Math.max(0, righe.findIndex(x => x.startsWith('> Generato il'))))) {
    const h = r.match(/^##\s+(.*)$/);
    if (h) salta = via.has(normTitolo(h[1]));
    if (salta || (senzaTesta && /^> (Generato il|Per cambiare una regola)/.test(r))) continue;
    out.push(r);
  }
  return abbassaTitoli(out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), 1);
}

const TIPI_BLOCCO = ['nucleo', 'instradamento'];

// Riscrive i blocchi di un file. Restituisce { testo, blocchi, errori }.
function rigeneraBlocchi(rel, testo, contenuti) {
  const righe = testo.split('\n');
  const fuori = mappaCodice(righe);
  const errori = [];
  const blocchi = [];
  let aperto = null;
  righe.forEach((r, i) => {
    if (!fuori[i]) return;
    const a = r.match(/^<!-- genera: ([a-z][a-z0-9-]*) -->\s*$/);
    const c = r.match(/^<!-- fine: ([a-z][a-z0-9-]*) -->\s*$/);
    if (a) {
      if (aperto) errori.push(`${rel}:${aperto.inizio + 1}: il blocco «${aperto.tipo}» non ha la riga <!-- fine: ${aperto.tipo} --> prima del blocco successivo`);
      aperto = { tipo: a[1], inizio: i };
    } else if (c) {
      if (!aperto) errori.push(`${rel}:${i + 1}: riga <!-- fine: ${c[1]} --> senza la sua riga <!-- genera: ${c[1]} -->`);
      else if (c[1] !== aperto.tipo) errori.push(`${rel}:${i + 1}: <!-- fine: ${c[1]} --> chiude il blocco «${aperto.tipo}»: i nomi devono essere uguali`);
      else blocchi.push({ ...aperto, fine: i });
      aperto = null;
    }
  });
  if (aperto) errori.push(`${rel}:${aperto.inizio + 1}: il blocco «${aperto.tipo}» non ha la riga <!-- fine: ${aperto.tipo} -->`);
  for (const b of blocchi) if (!TIPI_BLOCCO.includes(b.tipo)) errori.push(`${rel}:${b.inizio + 1}: tipo di blocco sconosciuto «${b.tipo}» (si usano ${TIPI_BLOCCO.join(' e ')})`);
  if (errori.length) return { testo, blocchi: [], errori };
  const conInstradamento = blocchi.some(b => b.tipo === 'instradamento');
  const nuove = [...righe];
  for (const b of [...blocchi].reverse()) {
    const corpo = b.tipo === 'nucleo' ? contenuti.nucleo(!conInstradamento) : contenuti.instradamento;
    nuove.splice(b.inizio + 1, b.fine - b.inizio - 1, ...corpo.split('\n'));
  }
  return { testo: nuove.join('\n'), blocchi, errori };
}

// ---------------------------------------------------------------- plugin e marketplace

// Impronta del contenuto di un plugin: tutti i suoi file tranne plugin.json, a capo normalizzati, righe
// «Generato il ...» tolte. «piano» contiene i testi che stanno per essere scritti.
function impronta(cartella, piano) {
  const h = crypto.createHash('sha256');
  for (const rel of cammina(cartella, f => !RUMORE.has(path.posix.basename(f)))) {
    if (rel === `${cartella}/.claude-plugin/plugin.json`) continue;
    let dati;
    if (piano.has(rel) || ESTENSIONI_TESTO.test(rel)) {
      const t = piano.has(rel) ? piano.get(rel).testo : leggi(rel) ?? '';
      dati = Buffer.from(t.split('\n').filter(r => !/Generato il \d{4}-\d{2}-\d{2}/.test(r)).join('\n'), 'utf8');
    } else dati = fs.readFileSync(ass(rel));
    h.update(`${rel.slice(cartella.length + 1)}\0`);
    h.update(dati);
    h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

const alza = v => v.split('.').map((n, i) => (i === 2 ? String(Number(n) + 1) : n)).join('.');

function testoMarketplace(imp, plugin) {
  return `${JSON.stringify({
    name: imp.marketplace.nome,
    owner: { name: imp.marketplace.proprietario },
    metadata: { description: `Plugin generati dalle pagine del cervello: non si modificano a mano (${COMANDO}).` },
    plugins: plugin.map(p => ({ name: p.nome, source: `./${p.cartella}`, description: p.descrizione, version: p.versione })),
  }, null, 2)}\n`;
}

// ---------------------------------------------------------------- costruzione

// Costruisce tutto in memoria, poi (con scrivi) scrive solo i file cambiati. Restituisce un array: gli errori se ce
// ne sono (e allora non scrive niente), altrimenti le differenze trovate («file (cosa)»); con scrivi: false un array
// vuoto vuol dire tutto aggiornato. Sull'array: .errori, .avvisi, .differenze, .scritti, .regole, .nucleo,
// .plugin, .blocchi.
export function costruisci({ scrivi = true, data = oggi(), impostazioni } = {}) {
  const imp = impostazioni || leggiImpostazioni();
  const vietati = vietatiDa(imp);
  const regole = trovaRegole(imp);
  const errori = [...regole.errori];
  const avvisi = [];
  const piano = new Map();
  const esito = (extra = {}) => {
    const differenze = [...piano].map(([rel, p]) => `${rel} (${p.cosa})`);
    return Object.assign(errori.length ? [...errori] : differenze, { errori, avvisi, differenze: errori.length ? [] : differenze, scritti: [], regole, ...extra });
  };
  const proponi = (rel, testo, cosa, conDate = false) => {
    const vecchio = leggi(rel);
    const uguale = vecchio !== null && (conDate ? senzaDate(vecchio) === senzaDate(testo) : vecchio === testo);
    if (!uguale) piano.set(rel, { testo, cosa });
  };

  // 1. la regola d'ambito, che apre il nucleo, e la tabella degli strumenti
  const testoAmbito = leggi(imp.fileRegolaAmbito);
  const testa = testoAmbito === null ? null : sezione(testoAmbito, SEZIONE_AMBITO);
  if (testoAmbito === null) errori.push(`manca ${imp.fileRegolaAmbito} (fileRegolaAmbito in ${FILE_IMPOSTAZIONI}): la sua sezione «## ${SEZIONE_AMBITO}» apre il nucleo`);
  else if (!testa) errori.push(`${imp.fileRegolaAmbito}: manca la sezione «## ${SEZIONE_AMBITO}» o è vuota: un paragrafo che dice di chi è il cervello, quali contesti non si mescolano e che nel dubbio si chiede`);
  const { tabella, avviso } = tabellaStrumenti();
  if (avviso) avvisi.push(avviso);
  if (errori.length) return esito();

  // 2. il nucleo, senza caratteri vietati
  const nucleo = testoNucleo({ imp, regole, data, testa, tabella });
  nucleo.split('\n').forEach((r, i) => {
    for (const v of vietati) {
      if (r.includes(v.carattere)) errori.push(`${FILE_NUCLEO}: la riga ${i + 1} conterrebbe un carattere vietato (${v.nome}), preso da una pagina regola, dalla «${SEZIONE_AMBITO}» o dalla tabella degli strumenti: «${mostra(r, vietati)}»; ${v.consiglio}`);
    }
  });
  if (errori.length) return esito();
  proponi(FILE_NUCLEO, nucleo, 'nucleo', true);

  // 3. i blocchi generati in AGENTS.md e negli SKILL.md sotto automazioni/
  const contenuti = {
    nucleo: conStrumenti => corpoNucleo(nucleo, { senza: conStrumenti ? [] : [SEZIONE_STRUMENTI] }),
    instradamento: tabella || TABELLA_MANCANTE,
  };
  let nBlocchi = 0;
  for (const rel of [FILE_AGENTS, ...cammina('automazioni', f => path.posix.basename(f) === 'SKILL.md')]) {
    const vecchio = leggi(rel);
    if (vecchio === null) { avvisi.push(`manca ${FILE_AGENTS}: gli agenti non ricevono il nucleo`); continue; }
    const r = rigeneraBlocchi(rel, vecchio, contenuti);
    errori.push(...r.errori);
    if (r.errori.length) continue;
    nBlocchi += r.blocchi.length;
    if (rel === FILE_AGENTS) {
      if (!r.blocchi.some(b => b.tipo === 'nucleo')) avvisi.push(`${FILE_AGENTS} non ha il blocco <!-- genera: nucleo --> ... <!-- fine: nucleo -->: gli agenti non ricevono le regole`);
      const byte = Buffer.byteLength(r.testo, 'utf8');
      if (byte > imp.limiti.agentsKB * 1024) avvisi.push(`${FILE_AGENTS} pesa ${kb(byte)} KB, oltre il limite di ${imp.limiti.agentsKB} KB (limiti.agentsKB): qualche agente lo taglia; accorcia la parte scritta a mano o metti nucleo: no alle regole meno usate`);
    }
    if (r.blocchi.length) proponi(rel, r.testo, 'blocchi generati', true);
  }
  if (errori.length) return esito();

  // 4. versioni dei plugin (con il contenuto appena rigenerato), impronte e marketplace
  let vecchie = {};
  try { vecchie = JSON.parse(leggi(FILE_IMPRONTE) || '{}'); } catch { avvisi.push(`${FILE_IMPRONTE} non è un JSON valido: lo riscrivo da capo, senza alzare versioni`); }
  const impronte = {};
  const plugin = [];
  const fine = '/.claude-plugin/plugin.json';
  for (const cartella of cammina('automazioni', f => f.endsWith(fine)).map(f => f.slice(0, -fine.length))) {
    const fileMan = cartella + fine;
    const testoMan = leggi(fileMan);
    let man;
    try { man = JSON.parse(testoMan); } catch (e) { errori.push(`${fileMan}: non è un JSON valido (${e.message})`); continue; }
    const nome = String(man.name || path.posix.basename(cartella));
    const prima = String(man.version ?? '');
    if (!/^\d+\.\d+\.\d+$/.test(prima)) { errori.push(`${fileMan}: versione «${prima}» non valida: si scrive come 0.1.0`); continue; }
    if (nome in impronte) { errori.push(`${fileMan}: c'è già un altro plugin che si chiama «${nome}»: cambia il nome in uno dei due plugin.json`); continue; }
    const nuova = impronta(cartella, piano);
    let versione = prima;
    if (vecchie[nome] && vecchie[nome] !== nuova) {
      versione = alza(prima);
      proponi(fileMan, testoMan.replace(/("version"\s*:\s*")[^"]*(")/, `$1${versione}$2`), `contenuto del plugin ${nome} cambiato: versione da ${prima} a ${versione}`);
    }
    impronte[nome] = nuova;
    plugin.push({ nome, cartella, descrizione: String(man.description || ''), versione });
  }
  if (errori.length) return esito();
  if (plugin.length || leggi(FILE_IMPRONTE) !== null) proponi(FILE_IMPRONTE, `${JSON.stringify(ordinato(impronte), null, 2)}\n`, 'impronte dei plugin');
  if (plugin.length || leggi(FILE_MARKETPLACE) !== null) proponi(FILE_MARKETPLACE, testoMarketplace(imp, plugin), 'marketplace dei plugin');

  // 5. scrittura
  const risultato = esito({ nucleo, plugin, blocchi: nBlocchi });
  if (scrivi) for (const [rel, p] of piano) { scriviFile(rel, p.testo); risultato.scritti.push(rel); }
  return risultato;
}

// ---------------------------------------------------------------- esportazione per le chat

function commitBreve() {
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel', '--short', 'HEAD'], {
      cwd: RADICE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000, windowsHide: true,
    }).trim().split(/\r?\n/);
    const vero = p => { const x = fs.realpathSync.native(p); return process.platform === 'win32' ? x.toLowerCase() : x; };
    return out.length >= 2 && vero(out[0]) === vero(RADICE) ? out[1].trim() : null;
  } catch { return null; }
}

// La nota per il cervello: quando scatta, cosa contiene, la forma esatta (quella di _modelli/nota-inbox.md).
const NOTA_PER_IL_CERVELLO = [
  'Non puoi modificare il cervello. Quando in una risposta nasce qualcosa da ricordare (decisione, accordo, numero, persona o azienda nuova, scadenza, correzione al modo in cui scrivi), alla fine di quella risposta scrivi una NOTA PER IL CERVELLO, che l\'utente salverà in `.raw/inbox/`: fuori dal blocco il nome del file, `AAAA-MM-GG-<tema>.md`; nel blocco, da copiare così com\'è:',
  '~~~text', '---', 'title: "Nota per il cervello: <tema>"', 'type: nota-inbox', 'data: AAAA-MM-GG', 'da: "<quale AI e dove>"', '---',
  '# Nota per il cervello: <tema>', '## Cosa è successo o si è deciso', '- <fatti con data, chi e numeri esatti; il detto separato dal dedotto>',
  '## Dove va nel cervello', '- <pagina da aggiornare, o tipo di pagina nuova>', '## Da verificare', '- <ciò che non è certo; le decisioni dell\'utente>', '~~~',
  'Niente password, chiavi, recapiti o dati personali di altre persone: al massimo dove stanno.',
];
const NOTA_BREVE = [
  'Non puoi modificare il cervello. Quando nasce qualcosa da ricordare (decisione, accordo, numero, persona o azienda nuova, scadenza, correzione al modo in cui scrivi), alla fine della risposta scrivi una NOTA PER IL CERVELLO: fuori dal blocco il nome del file `AAAA-MM-GG-<tema>.md`; nel blocco, tra due righe ---, le righe title: "Nota per il cervello: <tema>", type: nota-inbox, data: AAAA-MM-GG, da: <quale AI e dove>; poi le sezioni «## Cosa è successo o si è deciso» (fatti con data, chi e numeri esatti), «## Dove va nel cervello» e «## Da verificare». Niente password, chiavi o dati personali di altre persone.',
];

// Le sezioni più lunghe di un testo markdown (titoli ##), per dire cosa accorciare.
function blocchiPiuLunghi(testo) {
  const parti = [];
  let titolo = '(inizio)', misura = 0;
  for (const r of testo.split('\n')) {
    const h = r.match(/^#{2,3}\s+(.*)$/);
    if (h) { parti.push([titolo, misura]); titolo = h[1]; misura = 0; } else misura += r.length + 1;
  }
  parti.push([titolo, misura]);
  return parti.sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, m]) => `«${n}» ${m}`).join(', ');
}

// Scrive esporta/: istruzioni-chat.md più i file di conoscenza. Restituisce { file: [{ nome, misura, pagine }], avvisi }.
function esporta(imp, nucleo, regole, { estensione = 'md' } = {}) {
  const avvisi = [];
  const commit = commitBreve();
  const testata = `Esportato il ${adesso()} ${commit ? `dal commit ${commit}` : 'senza Git'}. Copia di sola lettura: la fonte è il cervello.`;
  // Fuori: le pagine riservate e quelle che servono solo sul computer (esporta: no, per esempio le pagine degli script).
  const riservata = fm => ['true', 'sì', 'si', 'yes'].includes(String(fm.riservato ?? '').toLowerCase()) ||
    ['no', 'false'].includes(String(fm.esporta ?? '').toLowerCase());
  const usate = new Set();
  const prendi = (rel, testo = leggi(rel)) => {
    if (testo === null) return null;
    usate.add(rel);
    return riservata(frontmatter(testo)) ? null : { rel, testo };
  };
  // Dal registro degli strumenti si tolgono le trappole dell'ambiente: riguardano il terminale, non la chat.
  const senzaSezione = (testo, titolo) => {
    if (testo === null) return null;
    const righe = testo.split(/\r?\n/);
    const i = righe.findIndex(r => normTitolo(r.replace(/^##\s+/, '')) === normTitolo(titolo) && /^##\s/.test(r));
    if (i < 0) return testo;
    let j = i + 1;
    while (j < righe.length && !/^#{1,2}\s/.test(righe[j])) j++;
    return [...righe.slice(0, i), ...righe.slice(j)].join('\n');
  };
  const gruppi = [
    { etichetta: 'inizio', descrizione: 'hot, index, nucleo, registro degli strumenti, modello della nota',
      pagine: [prendi('wiki/hot.md'), prendi('wiki/index.md'), prendi(FILE_NUCLEO, nucleo),
        prendi(FILE_STRUMENTI, senzaSezione(leggi(FILE_STRUMENTI), "Trappole dell'ambiente")), prendi('_modelli/nota-inbox.md')] },
    { etichetta: 'regole', descrizione: 'le regole intere', pagine: ordinaRegole(regole, imp).map(r => prendi(r.file, r.testo)) },
  ];
  // Le altre pagine di wiki/, una cartella di primo livello per file; le regole superate restano fuori.
  const perCartella = new Map();
  for (const rel of cammina('wiki', f => /\.md$/i.test(f))) {
    if (usate.has(rel) || rel === 'wiki/meta/stato-controlli.md' || /^wiki\/meta\/hot-archivio-/.test(rel)) continue;
    const testo = leggi(rel);
    const fm = frontmatter(testo);
    if (String(fm.type || '').toLowerCase() === 'regola' || riservata(fm)) continue;
    const parti = rel.split('/');
    const k = parti.length > 2 ? parti[1] : 'altre';
    if (!perCartella.has(k)) perCartella.set(k, []);
    perCartella.get(k).push({ rel, testo });
  }
  const descrizioni = {
    entities: 'persone, aziende, progetti, strumenti', sources: 'sintesi delle fonti', concepts: 'concetti che non sono regole',
    meta: 'pagine di servizio', altre: 'pagine in cima a wiki/, come il log',
  };
  const rango = k => (['entities', 'sources', 'concepts'].includes(k) ? ['entities', 'sources', 'concepts'].indexOf(k) : k === 'altre' ? 99 : 50);
  for (const k of [...perCartella.keys()].sort((a, b) => (rango(a) - rango(b)) || a.localeCompare(b))) {
    gruppi.push({ etichetta: k, descrizione: descrizioni[k] || `le pagine di wiki/${k}/`, pagine: perCartella.get(k) });
  }

  // File spezzati oltre fileEsportaKB; se sono troppi, si accorpano i vicini più leggeri (il primo resta da solo).
  const limite = imp.limiti.fileEsportaKB * 1024;
  const peso = f => f.pagine.reduce((n, p) => n + Buffer.byteLength(p, 'utf8'), 0);
  let file = [];
  for (const g of gruppi) {
    const pezzi = g.pagine.filter(Boolean).map(p => `===== ${p.rel} =====\n\n${p.testo.trim()}\n`);
    const parti = [];
    let corrente = [], misura = 0;
    pezzi.forEach((t, i) => {
      const n = Buffer.byteLength(t, 'utf8');
      if (corrente.length && misura + n > limite) { parti.push(corrente); corrente = []; misura = 0; }
      if (n > limite) avvisi.push(`${g.pagine.filter(Boolean)[i].rel} da sola supera ${imp.limiti.fileEsportaKB} KB (limiti.fileEsportaKB): resta in un file più grande del limite`);
      corrente.push(t);
      misura += n;
    });
    if (corrente.length) parti.push(corrente);
    parti.forEach((pagine, i) => file.push({
      etichetta: parti.length > 1 ? `${g.etichetta}-${i + 1}` : g.etichetta,
      descrizione: parti.length > 1 ? `${g.descrizione} (parte ${i + 1} di ${parti.length})` : g.descrizione,
      pagine,
    }));
  }
  const massimo = Math.max(2, Number(imp.limiti.fileEsportaMax) || 2);
  if (file.length > massimo) {
    avvisi.push(`servirebbero ${file.length} file di conoscenza, il massimo è ${massimo} (limiti.fileEsportaMax): accorpo i vicini più leggeri`);
    while (file.length > massimo) {
      let scelto = 1;
      for (let i = 2; i < file.length - 1; i++) if (peso(file[i]) + peso(file[i + 1]) < peso(file[scelto]) + peso(file[scelto + 1])) scelto = i;
      const [a, b] = [file[scelto], file[scelto + 1]];
      const etichetta = `${a.etichetta}-e-${b.etichetta}`;
      file.splice(scelto, 2, { etichetta: etichetta.length > 40 ? 'varie' : etichetta, descrizione: `${a.descrizione}; ${b.descrizione}`, pagine: [...a.pagine, ...b.pagine] });
    }
  }
  file = file.map((f, i) => ({ ...f, nome: `conoscenza-${due(i + 1)}-${f.etichetta}.${estensione}` }));
  for (const f of file) {
    if (f.pagine.length > 1 && peso(f) > limite) avvisi.push(`${f.nome} pesa ${kb(peso(f))} KB, oltre ${imp.limiti.fileEsportaKB} KB (limiti.fileEsportaKB): se la piattaforma lo rifiuta, alza limiti.fileEsportaMax`);
  }

  // Le istruzioni per la chat.
  const AGENTS = leggi(FILE_AGENTS);
  const chi = sezione(AGENTS, 'Chi') || imp.persona || `(manca la sezione «## Chi» in ${FILE_AGENTS})`;
  const delicati = sezione(AGENTS, 'Seconda azione, prima di un lavoro delicato');
  const primo = file[0] ? file[0].nome : `conoscenza-01-inizio.${estensione}`;
  const istruzioni = [
    testata, '',
    '# Istruzioni del secondo cervello', '',
    '## Chi', '', chi, '',
    ...(delicati ? ['## Prima di un lavoro delicato', '', delicati, ''] : []),
    '## Come usi i file', '',
    '- All\'inizio di ogni chat di\' in una riga che lavori su una copia di sola lettura, con la data della prima riga di questo testo.',
    `- Prima di rispondere leggi \`${primo}\`, poi solo il file che serve:`,
    ...file.map(f => `  - \`${f.nome}\`: ${f.descrizione}.`),
    '- Ogni pagina comincia con `===== wiki/percorso.md =====`: citala fra doppie quadre.',
    '- La copia invecchia: sui sistemi esterni vale la lettura dal vivo.',
    '- I comandi `node bin/...` e quelli con la barra (`/chiudi`) girano solo sul computer con la cartella: se servono, dillo.', '',
    '## Nota per il cervello', '',
    ...NOTA_PER_IL_CERVELLO, '',
    '## Le regole (nucleo)', '',
    corpoNucleo(nucleo, { senza: [SEZIONE_ALTRE, SEZIONE_STRUMENTI], senzaTesta: true }), '',
  ].join('\n');
  if (istruzioni.length > imp.limiti.istruzioniChat) {
    avvisi.push(`istruzioni-chat.md ha ${istruzioni.length} caratteri, oltre il limite di ${imp.limiti.istruzioniChat} (limiti.istruzioniChat): se la piattaforma lo taglia, accorcia le sezioni più lunghe (${blocchiPiuLunghi(istruzioni)}) o metti nucleo: no alle regole meno usate`);
  }

  // Le istruzioni brevi: per le istruzioni personali di una piattaforma (valgono in tutte le chat, hanno poco spazio).
  const testoAmbito = leggi(imp.fileRegolaAmbito);
  const ambito = testoAmbito === null ? null : sezione(testoAmbito, SEZIONE_AMBITO);
  const scrittura = ordinaRegole(regole, imp).filter(r => r.ambito === 'scrittura' && r.nucleo === true).flatMap(r => r.inBreve);
  const brevi = [
    testata, '',
    '# Istruzioni brevi del secondo cervello', '',
    '## Chi', '', chi, '',
    ...(ambito ? ['## Di chi è questa sessione', '', ambito, ''] : []),
    ...(scrittura.length ? ['## Come scrivere', '', ...scrittura, ''] : []),
    '## Nota per il cervello', '',
    ...NOTA_BREVE, '',
    `Le regole intere e i fatti stanno nel progetto con i file del cervello: se una richiesta li riguarda, dillo e consiglia di lavorare lì.`, '',
  ].join('\n');
  const limiteBrevi = Number(imp.limiti.istruzioniBrevi) || 5000;
  if (brevi.length > limiteBrevi) avvisi.push(`istruzioni-brevi.md ha ${brevi.length} caratteri, oltre ${limiteBrevi} (limiti.istruzioniBrevi): accorcia la sezione «Chi» o la «Regola d'ambito»`);

  // Segnaposto rimasti: la chat li leggerebbe come fatti.
  const SEGNO = '{{' + 'DA COMPILARE';
  const contaSegni = s => s.split(SEGNO).length - 1;
  if (contaSegni(istruzioni)) avvisi.push(`istruzioni-chat.md contiene ancora ${contaSegni(istruzioni)} segnaposto da compilare (${SEGNO}...}}): compilali prima di caricarlo (node bin/controlla.mjs, controllo n, dice dove)`);
  for (const f of file) {
    if (/-meta/.test(f.nome)) continue; // le pagine di servizio hanno segnaposto del livello 3: si possono lasciare
    const per = f.pagine.filter(p => !/^generato:\s*(true|sì|si|yes)\s*$/m.test(p)).map(p => [p.split('\n')[0].replace(/^=+\s*|\s*=+$/g, ''), contaSegni(p)]).filter(x => x[1]);
    if (per.length) avvisi.push(`${f.nome}: segnaposto da compilare in ${per.map(([rel, n]) => `${rel} (${n})`).join(', ')}`);
  }

  const cartella = ass(CARTELLA_ESPORTA);
  fs.rmSync(cartella, { recursive: true, force: true });
  fs.mkdirSync(cartella, { recursive: true });
  fs.writeFileSync(path.join(cartella, 'istruzioni-chat.md'), istruzioni, 'utf8');
  fs.writeFileSync(path.join(cartella, 'istruzioni-brevi.md'), brevi, 'utf8');
  for (const f of file) fs.writeFileSync(path.join(cartella, f.nome), `${testata}\n\n${f.pagine.join('\n')}`, 'utf8');
  return { istruzioni: istruzioni.length, brevi: brevi.length, file: file.map(f => ({ nome: f.nome, misura: peso(f), pagine: f.pagine.length })), avvisi };
}

// ---------------------------------------------------------------- riga di comando

function stampaAiuto() {
  const righe = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split(/\r?\n/).slice(1);
  const fine = righe.findIndex(r => !r.startsWith('//'));
  console.log(righe.slice(0, fine < 0 ? righe.length : fine).map(r => r.replace(/^\/\/ ?/, '')).join('\n'));
}

function stampaElenco(imp) {
  const regole = trovaRegole(imp);
  const testa = ['nome', 'ambito', 'nucleo', 'ordine'];
  const righe = ordinaRegole(regole, imp).map(r => [r.nome, r.ambito || '?', r.nucleo === null ? '?' : r.nucleo ? 'sì' : 'no', String(r.ordine)]);
  const larghe = testa.map((t, i) => Math.max(t.length, ...righe.map(r => r[i].length)));
  const riga = celle => `| ${celle.map((c, i) => c.padEnd(larghe[i])).join(' | ')} |`;
  console.log([riga(testa), `|${larghe.map(l => '-'.repeat(l + 2)).join('|')}|`, ...righe.map(riga)].join('\n'));
  console.log(`\n${regole.length} pagine regola, ${regole.filter(r => r.nucleo === true).length} nel nucleo.`);
  if (!regole.errori.length) return 0;
  console.log(`\nDa correggere (${regole.errori.length}):`);
  for (const e of regole.errori) console.log(`  - ${e}`);
  return 1;
}

function principale(argv) {
  const note = ['--verifica', '--elenco', '--esporta', '--aiuto'];
  const scelte = new Set();
  let txt = false;
  for (const a of argv) {
    if (a === '--txt') txt = true;
    else if (note.includes(a)) scelte.add(a);
    else if (a === '-h' || a === '--help') scelte.add('--aiuto');
    else { console.error(`Opzione sconosciuta: ${a}. Le opzioni sono ${note.join(', ')}.`); return 2; }
  }
  if (scelte.size > 1) { console.error(`Un'opzione alla volta: ${[...scelte].join(' e ')} non vanno insieme.`); return 2; }
  const scelta = [...scelte][0] || '';
  if (txt && scelta !== '--esporta') { console.error('--txt va insieme a --esporta.'); return 2; }
  if (scelta === '--aiuto') { stampaAiuto(); return 0; }

  let imp;
  try { imp = leggiImpostazioni(); } catch (e) { console.log(`Impostazioni non leggibili: ${e.message}.`); return 1; }
  if (scelta === '--elenco') return stampaElenco(imp);

  const verifica = scelta === '--verifica';
  const r = costruisci({ scrivi: !verifica, impostazioni: imp });
  const finale = () => { for (const a of r.avvisi) console.log(`Avviso: ${a}.`); };
  if (r.errori.length) {
    console.log(`Regole non in ordine (${r.errori.length}): non scrivo niente. Correggi e rilancia ${COMANDO}.`);
    for (const e of r.errori) console.log(`  - ${e}`);
    finale();
    return 1;
  }
  const quadro = `${r.regole.length} pagine regola (${r.regole.filter(x => x.nucleo === true).length} nel nucleo), ${r.blocchi} blocchi generati`
    + `${r.plugin.length ? `, plugin: ${r.plugin.map(p => `${p.nome} ${p.versione}`).join(', ')}` : ''}`;
  if (verifica) {
    if (r.differenze.length) {
      for (const d of r.differenze) console.log(`Non aggiornato: ${d}. Lancia ${COMANDO}.`);
      finale();
      return 1;
    }
    console.log(`Tutto aggiornato: ${quadro}.`);
    finale();
    return 0;
  }
  if (r.scritti.length) for (const d of r.differenze) console.log(`Scritto ${d}.`);
  else console.log('Niente da riscrivere: i file generati erano già aggiornati.');
  console.log(`${quadro}.`);
  if (scelta === '--esporta') {
    const e = esporta(imp, r.nucleo, r.regole, { estensione: txt ? 'txt' : 'md' });
    console.log(`Esportati in ${CARTELLA_ESPORTA}/:`);
    console.log(`  istruzioni-chat.md (${e.istruzioni} caratteri): da incollare nelle istruzioni del progetto o della chat`);
    console.log(`  istruzioni-brevi.md (${e.brevi} caratteri): per le istruzioni personali, che valgono in tutte le chat`);
    for (const f of e.file) console.log(`  ${f.nome} (${kb(f.misura)} KB, ${f.pagine} ${f.pagine === 1 ? 'pagina' : 'pagine'}): da caricare come file`);
    r.avvisi.push(...e.avvisi);
  }
  finale();
  return 0;
}

// Lanciato da riga di comando (non importato): stesso file di process.argv[1].
const vero = p => { let x = p; try { x = fs.realpathSync.native(p); } catch { /* resta com'è */ } return process.platform === 'win32' ? x.toLowerCase() : x; };
if (process.argv[1] && pathToFileURL(vero(process.argv[1])).href === pathToFileURL(vero(fileURLToPath(import.meta.url))).href) {
  process.exitCode = principale(process.argv.slice(2));
}
