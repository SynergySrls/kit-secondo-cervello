#!/usr/bin/env node
// controlla.mjs: controlla il secondo cervello in sola lettura e dà un semaforo (rosso, giallo, verde)
// a ciascuno dei controlli dalla a alla n. Pagina della wiki: wiki/entities/strumenti/controlla.md
//
// Come si lancia, dalla cartella del cervello:
//   node bin/controlla.mjs                   tutti i controlli, rapporto sullo schermo
//   node bin/controlla.mjs --scrivi          e aggiorna wiki/meta/stato-controlli.md, solo se cambia qualcosa oltre la data
//                                            (con un repository online la pagina la scrive solo il controllo su GitHub:
//                                            sul computer --scrivi non scrive, a meno di aggiungere --forza)
//   node bin/controlla.mjs --json            il rapporto in JSON (lo legge bin/avvisa.mjs)
//   node bin/controlla.mjs --segreti f1 f2   solo il controllo dei segreti su quei file (sincronizzazione e hook);
//                                            con --json dice anche quali file, come posizione nell'elenco passato
//   node bin/controlla.mjs --aiuto           questo aiuto
//
// I controlli:
//   a) percorsi citati che non esistono      h) file generati aggiornati (bin/costruisci.mjs)
//   b) wikilink rotti e omonimi              i) battiti delle automazioni
//   c) caratteri vietati                     j) radice e file di istruzioni
//   d) frasi superate                        k) doppioni
//   e) segreti e dati personali              l) pagine escluse da .gitignore
//   f) strumenti e registro                  m) hot cache
//   g) frontmatter e pagine regola           n) segnaposto da compilare
//
// Codici d'uscita: 0 nessun rosso; 1 almeno un rosso (con --segreti: trovato qualcosa);
//   2 opzione sconosciuta o errore d'uso.
// Scrive solo wiki/meta/stato-controlli.md e solo con --scrivi. Non stampa mai il valore di un segreto.
// Nessuna dipendenza: Node 18 o più recente, più Git se c'è (senza Git i controlli che lo usano lo dicono).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUESTO_FILE = fileURLToPath(import.meta.url);
const RADICE = path.resolve(path.dirname(QUESTO_FILE), '..');
const MAX_CASI = 30;
const QUESTO_REL = 'bin/controlla.mjs';
const FILE_STATO = 'wiki/meta/stato-controlli.md';
const FILE_FRASI = 'wiki/meta/frasi-superate.md';
const FILE_REGISTRO = 'wiki/meta/strumenti.md';
const FILE_IMPOSTAZIONI = 'bin/impostazioni.json';
const FILE_COSTRUISCI = 'bin/costruisci.mjs';
const FILE_AUTOMAZIONI = 'automazioni/LEGGIMI.md';
const CARTELLA_BATTITI = 'automazioni/battiti';
// Scritto in due pezzi perché questo file non contenga il segnaposto che conta il controllo n.
const SEGNAPOSTO = '{{' + 'DA COMPILARE';
// Il segno invisibile che alcuni programmi mettono all'inizio dei file di testo.
const BOM = new RegExp('^' + String.fromCharCode(0xfeff));

// ---------------------------------------------------------------- opzioni

function stampaAiuto() {
  const testo = fs.readFileSync(QUESTO_FILE, 'utf8').split(/\r?\n/);
  const out = [];
  for (const r of testo.slice(1)) { if (!r.startsWith('//')) break; out.push(r.replace(/^\/\/ ?/, '')); }
  console.log(out.join('\n'));
}

const argv = process.argv.slice(2);
const opz = { scrivi: false, forza: false, json: false, segreti: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--scrivi') opz.scrivi = true;
  else if (a === '--forza') opz.forza = true;
  else if (a === '--json') opz.json = true;
  else if (a === '--segreti') {
    opz.segreti = [];
    while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opz.segreti.push(argv[++i]);
  } else if (a === '--aiuto' || a === '--help' || a === '-h') { stampaAiuto(); process.exit(0); }
  else { console.error(`Opzione sconosciuta: ${a}. Vedi: node bin/controlla.mjs --aiuto`); process.exit(2); }
}

// ---------------------------------------------------------------- utilità di base

const posix = p => p.split(path.sep).join('/');
const ass = rel => path.join(RADICE, ...rel.split('/'));
function esiste(rel) { try { fs.statSync(ass(rel)); return true; } catch { return false; } }
const righe = t => t.split(/\r?\n/);
const minuscolo = s => String(s ?? '').trim().toLowerCase();
const testoDi = v => (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim();
const corto = (s, n = 40) => { const t = String(s); return t.length > n ? t.slice(0, n) + '...' : t; };
const pl = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const z = n => String(n).padStart(2, '0');
const ADESSO = new Date();
const OGGI = `${ADESSO.getFullYear()}-${z(ADESSO.getMonth() + 1)}-${z(ADESSO.getDate())}`;
const ORA = `${z(ADESSO.getHours())}:${z(ADESSO.getMinutes())}`;
// Giorni di calendario da una data AAAA-MM-GG a oggi (null se la data non si legge).
function giorniDa(data) {
  const m = String(data ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31) return null;
  const oggi = Date.UTC(ADESSO.getFullYear(), ADESSO.getMonth(), ADESSO.getDate());
  return Math.round((oggi - Date.UTC(+m[1], +m[2] - 1, +m[3])) / 86400000);
}

// ---------------------------------------------------------------- impostazioni (lettore proprio)

const PREDEFINITE = {
  ambiti: [{ chiave: 'tutto', titolo: 'Valgono sempre' }],
  fileRegolaAmbito: 'wiki/concepts/ambito.md',
  caratteriVietati: [
    { nome: 'lineetta lunga', carattere: String.fromCharCode(0x2014) },
    { nome: 'lineetta media', carattere: String.fromCharCode(0x2013) },
  ],
  zonaVincolante: ['AGENTS.md', 'CLAUDE.md', 'wiki/meta/nucleo.md', 'automazioni/', 'type: regola'],
  esentiStile: ['wiki/meta/frasi-superate.md', 'wiki/meta/stato-controlli.md'],
  hot: { file: 'wiki/hot.md', sezione: 'In corso adesso', giorni: 14, maxKB: 40 },
  vocabolario: {
    type: ['regola', 'concetto', 'persona', 'azienda', 'cliente', 'progetto', 'strumento', 'fonte', 'riunione',
      'procedura', 'routine', 'meta', 'nota-inbox'],
    status: ['current', 'draft', 'prospect', 'superseded', 'archived', 'evergreen'],
  },
};

function leggiImpostazioniLocali() {
  let grezzo;
  try { grezzo = fs.readFileSync(ass(FILE_IMPOSTAZIONI), 'utf8'); } catch { return { imp: PREDEFINITE, errore: 'manca' }; }
  let j;
  try { j = JSON.parse(grezzo.replace(BOM, '')); } catch { return { imp: PREDEFINITE, errore: 'non è JSON valido' }; }
  if (!j || typeof j !== 'object' || Array.isArray(j)) return { imp: PREDEFINITE, errore: 'non contiene un oggetto JSON' };
  const imp = { ...PREDEFINITE, ...j };
  imp.hot = { ...PREDEFINITE.hot, ...(j.hot && typeof j.hot === 'object' ? j.hot : {}) };
  imp.vocabolario = { ...PREDEFINITE.vocabolario, ...(j.vocabolario && typeof j.vocabolario === 'object' ? j.vocabolario : {}) };
  for (const k of ['ambiti', 'caratteriVietati', 'zonaVincolante', 'esentiStile']) if (!Array.isArray(imp[k])) imp[k] = PREDEFINITE[k];
  for (const k of ['type', 'status']) if (!Array.isArray(imp.vocabolario[k])) imp.vocabolario[k] = PREDEFINITE.vocabolario[k];
  return { imp, errore: null };
}
const { imp: IMP, errore: ERRORE_IMP } = leggiImpostazioniLocali();
const VIETATI = IMP.caratteriVietati.filter(v => v && typeof v.carattere === 'string' && v.carattere);
// Nei rapporti i caratteri vietati diventano un trattino breve: lo stato dei controlli non deve contenerli.
const pulisci = s => { let t = String(s); for (const v of VIETATI) t = t.split(v.carattere).join('-'); return t; };

// ---------------------------------------------------------------- file

const EST_BINARIE = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp', 'tif', 'tiff', 'heic', 'avif', 'pdf', 'zip',
  'rar', '7z', 'gz', 'tgz', 'mp3', 'mp4', 'm4a', 'wav', 'ogg', 'mov', 'webm', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'xlsx',
  'xls', 'docx', 'doc', 'pptx', 'ppt', 'odt', 'ods', 'psd', 'ai', 'exe', 'dll', 'bin', 'pyc', 'sqlite', 'db']);
const EST_TESTO = /\.(md|markdown|txt|json|jsonc|ya?ml|toml|ini|cfg|conf|csv|tsv|xml|html?|css|mjs|cjs|js|ts|py|ps1|psm1|sh|cmd|bat)$/i;
const testoFile = rel => EST_TESTO.test(rel) || /^\.[^.]+$/.test(path.posix.basename(rel));

const cacheTesti = new Map();
function leggiTesto(rel) {
  if (cacheTesti.has(rel)) return cacheTesti.get(rel);
  let t = null;
  const est = rel.includes('.') ? rel.split('.').pop().toLowerCase() : '';
  if (!EST_BINARIE.has(est)) {
    try {
      const p = path.isAbsolute(rel) ? rel : ass(rel);
      const st = fs.statSync(p);
      if (st.isFile() && st.size <= 10 * 1024 * 1024) {
        const buf = fs.readFileSync(p);
        if (!buf.subarray(0, 8000).includes(0)) t = buf.toString('utf8').replace(BOM, '');
      }
    } catch { /* illeggibile: vale come assente */ }
  }
  cacheTesti.set(rel, t);
  return t;
}

// Elenco dei file del cervello: fuori sempre .git e node_modules, e in radice _da_eliminare, esporta, .obsidian.
const SEMPRE_FUORI = new Set(['.git', 'node_modules']);
const FUORI_IN_RADICE = new Set(['_da_eliminare', 'esporta', '.obsidian']);
function cammina({ cartelle = false } = {}) {
  const out = [];
  const pila = [''];
  while (pila.length) {
    const d = pila.pop();
    let voci;
    try { voci = fs.readdirSync(d ? ass(d) : RADICE, { withFileTypes: true }); } catch { continue; }
    for (const v of voci) {
      if (SEMPRE_FUORI.has(v.name) || (!d && FUORI_IN_RADICE.has(v.name))) continue;
      const rel = d ? `${d}/${v.name}` : v.name;
      if (v.isDirectory()) { pila.push(rel); if (cartelle) out.push(rel + '/'); }
      else if (v.isFile() && !/^(desktop\.ini|thumbs\.db|\.ds_store)$/i.test(v.name)) out.push(rel);
    }
  }
  return out.sort();
}
// La pagina di stato è l'uscita di questo script, non una sua fonte: resta fuori, così il rapporto non
// cambia per il solo fatto che la pagina esiste.
let _tutti = null;
const tutti = () => (_tutti ??= cammina().filter(f => f !== FILE_STATO));
const fuoriRaw = f => !f.startsWith('.raw/');
const fuoriModelli = f => !f.startsWith('_modelli/');

// ---------------------------------------------------------------- markdown (lettori propri)

const togliVirgolette = s => s.trim().replace(/^(["'])([\s\S]*)\1$/, '$2').trim();
// Frontmatter minimo: righe «chiave: valore», valori tra virgolette o no, liste [a, b] o righe «  - voce».
function frontmatter(testo) {
  if (!testo) return {};
  const m = testo.replace(BOM, '').match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return {};
  const fm = {};
  let ultima = null;
  for (const r of righe(m[1])) {
    const voce = r.match(/^\s+-\s+(.*)$/);
    if (voce && ultima && (fm[ultima] === '' || Array.isArray(fm[ultima]))) {
      if (fm[ultima] === '') fm[ultima] = [];
      fm[ultima].push(togliVirgolette(voce[1]));
      continue;
    }
    const k = r.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!k) { ultima = null; continue; }
    ultima = k[1].toLowerCase();
    const v = k[2].trim();
    fm[ultima] = /^\[.*\]$/.test(v) ? v.slice(1, -1).split(',').map(togliVirgolette).filter(Boolean) : togliVirgolette(v);
  }
  return fm;
}
const fmDi = rel => frontmatter(leggiTesto(rel));
const eRegola = rel => /\.md$/i.test(rel) && minuscolo(testoDi(fmDi(rel).type)) === 'regola';
const eStoria = rel => /\.md$/i.test(rel) && ['superseded', 'archived'].includes(minuscolo(testoDi(fmDi(rel).status)));

// Righe del testo con i blocchi di codice recintati (``` o ~~~) svuotati: stesso numero di righe.
function righeSenzaCodice(testo) {
  let apertura = null;
  return righe(testo).map(r => {
    if (apertura) {
      const m = r.trim().match(/^(`{3,}|~{3,})$/);
      if (m && m[1][0] === apertura[0] && m[1].length >= apertura.length) apertura = null;
      return '';
    }
    const m = r.match(/^ {0,3}(`{3,}|~{3,})/);
    if (m) { apertura = m[1]; return ''; }
    return r;
  });
}
const senzaCodiceInRiga = r => r.replace(/`[^`\n]*`/g, m => ' '.repeat(m.length));

const normTitolo = s => s.trim().toLowerCase().replace(/[‘’]/g, "'").replace(/:$/, '').replace(/^perche\b/, 'perché').trim();
// Sezione con quel titolo: righe fino al titolo successivo di livello uguale o più alto; da = indice della prima riga.
function sezione(testo, titolo) {
  if (!testo) return null;
  const rr = righe(testo);
  const pul = righeSenzaCodice(testo);
  let inizio = -1, livello = 0;
  for (let i = 0; i < rr.length; i++) {
    const m = pul[i].match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    if (inizio < 0) { if (normTitolo(m[2]) === normTitolo(titolo)) { inizio = i + 1; livello = m[1].length; } }
    else if (m[1].length <= livello) return { righe: rr.slice(inizio, i), da: inizio };
  }
  return inizio < 0 ? null : { righe: rr.slice(inizio), da: inizio };
}

function celleTabella(riga) {
  return riga.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(x => x.trim());
}
const rigaSeparatore = celle => celle.every(x => /^:?-{2,}:?$/.test(x));

function globRe(g) {
  let g2 = g.trim().replace(/^\.\//, '');
  if (g2.endsWith('/')) g2 += '**';
  let re = '';
  for (let i = 0; i < g2.length; i++) {
    const c = g2[i];
    if (c === '*' && g2[i + 1] === '*') { re += '.*'; i++; if (g2[i + 1] === '/') i++; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += escapeRe(c);
  }
  return new RegExp('^' + re + '$', 'i');
}

// ---------------------------------------------------------------- Git

function git(args, { input, accetta1 = false } = {}) {
  try {
    return execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
      cwd: RADICE, encoding: 'utf8', input, maxBuffer: 256 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true, timeout: 60000,
    });
  } catch (e) {
    if (accetta1 && e.status === 1 && typeof e.stdout === 'string') return e.stdout;
    return null;
  }
}
const percorsoNorm = p => {
  let x;
  try { x = fs.realpathSync.native(p); } catch { x = path.resolve(p); }
  x = path.resolve(x);
  return process.platform === 'win32' ? x.toLowerCase() : x;
};
// Git conta solo se la cartella del cervello è la radice del repository (non una sottocartella di un altro).
let _gitAttivo;
function gitAttivo() {
  if (_gitAttivo !== undefined) return _gitAttivo;
  const top = git(['rev-parse', '--show-toplevel']);
  _gitAttivo = !!top && percorsoNorm(top.trim()) === percorsoNorm(RADICE);
  return _gitAttivo;
}

// ---------------------------------------------------------------- a) percorsi citati

function controlloPercorsi(c) {
  // .claude/settings.local.json (e simili) resta fuori: lo scrive Claude Code da solo, è escluso da Git e su GitHub
  // non c'è, quindi darebbe rossi diversi sul computer e sul repository.
  const fonti = tutti().filter(f => testoFile(f) && fuoriRaw(f) && fuoriModelli(f) && (
    f === 'AGENTS.md' || f === 'CLAUDE.md' || f.startsWith('automazioni/') ||
    (f.startsWith('.claude/') && !/\.local\.json$/i.test(f)) ||
    (f.startsWith('wiki/') && eRegola(f))));
  const PREF = '(?:wiki|bin|automazioni|\\.claude|\\.raw|_modelli|\\.github)/';
  const reNudo = new RegExp(`(?<![\\w./\\\\~:$%-])${PREF}[^\\s\`'"()\\[\\]<>|,;«»\\\\]*`, 'g');
  const reInizio = new RegExp(`^${PREF}`);
  const segnaposto = p => /AAAA|MM-GG|[<>{}*?$%]|\.\.\.|…/.test(p);
  const esenzione = /non esist|da creare/i;
  const visti = new Set();
  for (const f of fonti) {
    const t = leggiTesto(f);
    if (!t) continue;
    righe(t).forEach((rigaOrig, i) => {
      if (esenzione.test(rigaOrig)) return;
      // negli hook di Claude Code i percorsi partono dalla variabile della cartella del progetto
      const riga = rigaOrig.replace(/\$\{?CLAUDE_PROJECT_DIR\}?[\\/]|%CLAUDE_PROJECT_DIR%[\\/]/g, ' ');
      const prova = (cand) => {
        const p = cand.replace(/#.*$/, '').replace(/[.,:;!?»)\]]+$/, '').replace(/:\d+(?:-\d+)?$/, '').replace(/[.,:;!?»)\]]+$/, '');
        if (!p || segnaposto(p)) return;
        if (!/\.[A-Za-z0-9]{1,8}$/.test(p) && !p.endsWith('/')) return;
        if (p.startsWith(CARTELLA_BATTITI + '/')) return;
        if (p === FILE_STATO || esiste(p)) return;
        const k = `${f}:${i + 1}:${p}`;
        if (visti.has(k)) return;
        visti.add(k);
        c.casi.push(`${f}:${i + 1}  ${p}`);
      };
      const nudi = testo => { for (const m of testo.matchAll(reNudo)) prova(m[0]); };
      let fuori = '';
      let ultimo = 0;
      for (const m of riga.matchAll(/`([^`\n]+)`/g)) {
        fuori += riga.slice(ultimo, m.index) + ' ';
        ultimo = m.index + m[0].length;
        const span = m[1].trim();
        if (reInizio.test(span)) prova(span.split(/\s+/)[0]); else nudi(span);
      }
      fuori += riga.slice(ultimo);
      nudi(fuori);
    });
  }
  c.nota = `${fonti.length} file letti`;
  if (c.casi.length) c.esito = 'rosso';
}

// ---------------------------------------------------------------- b) wikilink

function controlloWikilink(c) {
  const md = tutti().filter(f => /\.md$/i.test(f));
  const principali = md.filter(f => fuoriRaw(f) && fuoriModelli(f));
  const nomeDi = f => path.posix.basename(f).replace(/\.md$/i, '').toLowerCase();
  const aggiungi = (mappa, k, v) => { if (!mappa.has(k)) mappa.set(k, []); mappa.get(k).push(v); };
  const perNome = new Map();      // pagine del cervello, per nome senza .md
  const perNomeAltri = new Map(); // pagine in .raw/ e _modelli/: risolvono un link ma non fanno omonimi
  const perNomeFile = new Map();  // ogni file, per nome con estensione
  for (const f of principali) aggiungi(perNome, nomeDi(f), f);
  for (const f of md) if (!fuoriRaw(f) || !fuoriModelli(f)) aggiungi(perNomeAltri, nomeDi(f), f);
  for (const f of tutti()) aggiungi(perNomeFile, path.posix.basename(f).toLowerCase(), f);
  // Link con percorso ([[cartella/pagina]]): indice per coda di percorso, senza .md per le pagine.
  const perCodaMd = new Map(), perCoda = new Map();
  const code = (mappa, chiave, f) => { const p = chiave.split('/'); for (let k = 0; k < p.length; k++) aggiungi(mappa, p.slice(k).join('/'), f); };
  for (const f of md) code(perCodaMd, f.toLowerCase().replace(/\.md$/, ''), f);
  for (const f of tutti()) code(perCoda, f.toLowerCase(), f);
  // la pagina di stato la scrive questo script: vale come esistente anche prima del primo --scrivi
  if (!perNome.has('stato-controlli')) perNome.set('stato-controlli', [FILE_STATO]);
  if (!perCodaMd.has(FILE_STATO.replace(/\.md$/, ''))) code(perCodaMd, FILE_STATO.replace(/\.md$/, ''), FILE_STATO);
  const segnaposto = b => /[<>{}]|AAAA|^\.\.\.$|…|^(pagina|nome|nome-file|link|wikilink|x+)$/i.test(b);
  const rotti = [];
  const ambigui = new Map();
  for (const f of principali) {
    if (f === FILE_STATO) continue;
    const t = leggiTesto(f);
    if (!t) continue;
    righeSenzaCodice(t).forEach((r0, i) => {
      const r = senzaCodiceInRiga(r0);
      for (const m of r.matchAll(/!?\[\[([^\]\n]+?)\]\]/g)) {
        const b = m[1].split(/\\?\|/)[0].split('#')[0].split('^')[0].trim().replace(/\\$/, '');
        if (!b || segnaposto(b)) continue;
        let trovati;
        if (b.includes('/')) {
          const bb = b.toLowerCase().replace(/^\.?\//, '').replace(/\.md$/, '');
          trovati = perCodaMd.get(bb) || perCoda.get(bb) || [];
        } else {
          const bl = b.toLowerCase();
          const nome = bl.replace(/\.md$/, '');
          trovati = perNome.get(nome) || [];
          if (trovati.length > 1) {
            if (!ambigui.has(nome)) ambigui.set(nome, { file: trovati, link: 0, da: new Set() });
            const a = ambigui.get(nome);
            a.link++;
            a.da.add(f);
          }
          if (!trovati.length) trovati = perNomeAltri.get(nome) || [];
          if (!trovati.length) trovati = perNomeFile.get(bl) || [];
        }
        if (!trovati.length) rotti.push(`${f}:${i + 1}  [[${b}]]`);
      }
    });
  }
  for (const [nome, a] of [...ambigui].sort((x, y) => y[1].link - x[1].link)) {
    c.casi.push(`rosso  omonimo [[${nome}]]: ${a.link} link da ${pl(a.da.size, 'pagina', 'pagine')}; file: ${a.file.join(', ')}`);
  }
  for (const r of rotti) c.casi.push(`giallo rotto ${r}`);
  c.nota = `${pl(ambigui.size, 'omonimo', 'omonimi')}, ${pl(rotti.length, 'link rotto', 'link rotti')}`;
  if (ambigui.size) c.esito = 'rosso';
  else if (rotti.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- c) caratteri vietati

function inZonaVincolante(f) {
  for (const voce of IMP.zonaVincolante) {
    const s = String(voce ?? '').trim();
    if (!s) continue;
    const cond = s.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (cond && !s.includes('/')) {
      if (/\.md$/i.test(f) && minuscolo(testoDi(fmDi(f)[cond[1].toLowerCase()])) === minuscolo(cond[2])) return true;
      continue;
    }
    if (s.endsWith('/')) { if (f.startsWith(s)) return true; continue; }
    if (s.includes('*')) { if (globRe(s).test(f)) return true; continue; }
    if (f === s) return true;
  }
  return false;
}

function controlloCaratteri(c) {
  if (!VIETATI.length) { c.esito = 'neutro'; c.nota = `nessun carattere vietato in ${FILE_IMPOSTAZIONI}`; return; }
  const esenti = new Set(IMP.esentiStile.map(String));
  const trovati = [];
  for (const f of tutti()) {
    if (!testoFile(f) || !fuoriRaw(f) || esenti.has(f)) continue;
    const t = leggiTesto(f);
    if (!t || !VIETATI.some(v => t.includes(v.carattere))) continue;
    const perNome = new Map();
    const righeTrovate = [];
    righe(t).forEach((r, i) => {
      let su = false;
      for (const v of VIETATI) {
        const n = r.split(v.carattere).length - 1;
        if (n) { perNome.set(v.nome || 'carattere vietato', (perNome.get(v.nome || 'carattere vietato') || 0) + n); su = true; }
      }
      if (su) righeTrovate.push(i + 1);
    });
    const totale = [...perNome.values()].reduce((a, b) => a + b, 0);
    const rosso = inZonaVincolante(f);
    const dettaglio = [...perNome].map(([nome, n]) => `${nome} ${n}`).join(', ');
    const elencoRighe = righeTrovate.slice(0, 8).join(', ') + (righeTrovate.length > 8 ? ', ...' : '');
    trovati.push({ rosso, totale, testo: `${rosso ? 'rosso ' : 'giallo'} ${f}: ${totale} (${dettaglio}), righe ${elencoRighe}` });
  }
  trovati.sort((a, b) => (b.rosso - a.rosso) || (b.totale - a.totale));
  for (const x of trovati) c.casi.push(x.testo);
  const nr = trovati.filter(x => x.rosso).length;
  c.nota = `${pl(nr, 'file', 'file')} nella zona vincolante, ${trovati.length - nr} altrove`;
  if (nr) c.esito = 'rosso'; else if (trovati.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- d) frasi superate

// Per la ricerca: minuscole, senza * ` " « » e virgolette tipografiche, spazi e a capo compressi.
function normalizza(testo, conRighe = false) {
  let out = '';
  const mappa = conRighe ? [] : null;
  let riga = 1, inizioRiga = true, spazio = false;
  for (const ch of testo) {
    if (ch === '\n') {
      riga++; inizioRiga = true;
      if (!spazio && out) { out += ' '; mappa?.push(riga - 1); spazio = true; }
      continue;
    }
    if (inizioRiga && (ch === ' ' || ch === '\t' || ch === '>')) continue;
    inizioRiga = false;
    if ('*`"«»“”\r'.includes(ch)) continue;
    if (/\s/.test(ch)) { if (!spazio && out) { out += ' '; mappa?.push(riga); spazio = true; } continue; }
    const c2 = (ch === '’' || ch === '‘') ? "'" : ch.toLowerCase();
    for (const x of c2) { out += x; if (mappa) mappa.push(riga); }
    spazio = false;
  }
  return conRighe ? { testo: out, righe: mappa } : out.trim();
}

function leggiTabellaFrasi() {
  const t = leggiTesto(FILE_FRASI);
  if (t === null) return null;
  let col = null;
  const voci = [];
  for (const r of righeSenzaCodice(t)) {
    if (!r.trim().startsWith('|')) { col = null; continue; }
    const celle = celleTabella(r);
    if (!col) {
      const idx = n => celle.findIndex(x => normalizza(x).startsWith(n));
      const ci = { frase: idx('frase'), da: idx('superata'), dove: idx('dove'), blocca: idx('blocca') };
      if (ci.frase >= 0 && ci.dove >= 0 && ci.blocca >= 0) col = ci;
      continue;
    }
    if (rigaSeparatore(celle)) continue;
    const cellaFrase = celle[col.frase] || '';
    const frasi = [...cellaFrase.matchAll(/«([^»]+)»/g)].map(m => m[1].trim()).filter(Boolean);
    if (!frasi.length && cellaFrase.replace(/[*`]/g, '').trim()) frasi.push(cellaFrase.replace(/[*`]/g, '').trim());
    const cellaDove = celle[col.dove] || '';
    const dove = [...cellaDove.matchAll(/`([^`]+)`/g)].map(m => m[1].trim());
    if (/type:\s*regola/i.test(cellaDove.replace(/`[^`]*`/g, ''))) dove.push('type: regola');
    const da = col.da >= 0 ? (celle[col.da] || '') : '';
    const superataDa = [...da.matchAll(/\[\[([^\]|#\\]+)/g)].map(m => m[1].trim().toLowerCase());
    const blocca = /^s[iì]/i.test((celle[col.blocca] || '').replace(/[*`]/g, '').trim());
    if (frasi.length && dove.length) voci.push({ frasi, dove, superataDa, blocca });
  }
  return voci;
}

function controlloFrasi(c) {
  const voci = leggiTabellaFrasi();
  if (!voci) { c.esito = 'giallo'; c.casi.push(`giallo ${FILE_FRASI} non trovato`); return; }
  const hot = IMP.hot.file;
  const esclusoSempre = f => f === FILE_FRASI || f === FILE_STATO || f === 'wiki/log.md' || f === hot ||
    /^wiki\/meta\/hot-archivio/.test(f) || eStoria(f);
  const candidati = tutti().filter(f => testoFile(f) && fuoriRaw(f) && !esclusoSempre(f));
  const negazione = /(?:^|[^a-zà-ÿ])(mai|niente|nessun[oa]?|non si|invece di|né|anziché)(?=[^a-zà-ÿ]|$)/;
  const rigaStorica = /superat|abolit|non vale più/i;
  const rigaVieta = /^[\s>*\-\d.]*(\*\*)?\s*(mai|niente|vietat)\b/i; // la riga vieta la frase: la cita, non la usa
  const titoloStorico = /storia|storic|origine|perch[eé] esiste|\blog\b|cronologia/i;
  const titoliDi = (t) => {
    const out = [];
    let h = '';
    for (const r of righeSenzaCodice(t)) { if (/^#{1,6}\s/.test(r)) h = r; out.push(h); }
    return out;
  };
  const casi = new Map();
  const cache = new Map();
  for (const v of voci) {
    const filtri = v.dove.map(d => (minuscolo(d).replace(/\s+/g, ' ') === 'type: regola' ? 'REGOLA' : globRe(d)));
    const files = candidati.filter(f =>
      !v.superataDa.includes(path.posix.basename(f).replace(/\.md$/i, '').toLowerCase()) &&
      filtri.some(r => (r === 'REGOLA' ? eRegola(f) : r.test(f))));
    for (const frase of v.frasi) {
      const fn = normalizza(frase);
      if (!fn) continue;
      for (const f of files) {
        const t = leggiTesto(f) || '';
        if (!cache.has(f)) cache.set(f, { ...normalizza(t, true), titoli: null, orig: null });
        const nn = cache.get(f);
        let idx = nn.testo.indexOf(fn);
        while (idx >= 0) {
          const riga = nn.righe[idx];
          nn.orig ??= righe(t);
          nn.titoli ??= titoliDi(t);
          const prima = nn.testo.slice(Math.max(0, idx - 45), idx).split(/[.;!?]/).pop();
          const rigaTesto = nn.orig[riga - 1] || '';
          const scarta = negazione.test(prima) || rigaVieta.test(rigaTesto) || rigaStorica.test(rigaTesto) ||
            titoloStorico.test(nn.titoli[riga - 1] || '');
          if (!scarta) {
            const k = `${f}:${riga}`;
            if (!casi.has(k)) casi.set(k, { f, riga, frasi: new Set(), blocca: false });
            const caso = casi.get(k);
            caso.frasi.add(frase);
            caso.blocca ||= v.blocca;
          }
          idx = nn.testo.indexOf(fn, idx + fn.length);
        }
      }
    }
  }
  const elenco = [...casi.values()].sort((a, b) => (b.blocca - a.blocca) || a.f.localeCompare(b.f) || a.riga - b.riga);
  for (const x of elenco) c.casi.push(`${x.blocca ? 'rosso ' : 'giallo'} ${x.f}:${x.riga}  ${[...x.frasi].map(s => `«${s}»`).join(' ')}`);
  const nr = elenco.filter(x => x.blocca).length;
  c.nota = `${pl(nr, 'riga bloccante', 'righe bloccanti')}, ${elenco.length - nr} da correggere; ${pl(voci.length, 'riga', 'righe')} in tabella`;
  if (nr) c.esito = 'rosso'; else if (elenco.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- e) segreti e dati personali

const SEGRETI = [
  ['chiave Anthropic', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['chiave OpenAI', /\bsk-(?!ant-)(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{20,}/],
  ['chiave Google', /\bAIza[0-9A-Za-z_-]{35}/],
  ['token GitHub', /\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{20,}/],
  ['token Slack', /\bxox[abpr]-[A-Za-z0-9-]{10,}/],
  ['chiave AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['chiave privata', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['private_key in un JSON', /"private_key"\s*:\s*"[^"]{20,}/],
  // il token di un bot Telegram: numero del bot, due punti, 35 caratteri (è la chiave che il kit fa creare)
  ['token Telegram', /(?<!\d)\d{8,10}:[A-Za-z0-9_-]{35}(?![A-Za-z0-9_-])/],
];
// Nomi di gestori di password e di posti: «Password: 1Password» dice dove sta la password, non la password.
const POSTI_PASSWORD = /^(1password|bitwarden|keepass\w*|lastpass|dashlane|nordpass|proton\s*pass|enpass|roboform|keeper|gestore\w*|portachiavi|keychain|cassaforte|vault|cartella\w*|onedrive|dropbox|icloud|drive|gmail|outlook|chrome|firefox|edge|safari)$/i;
// Un valore dopo «password:» sembra una parola d'ordine vera? Variabili, segnaposto, percorsi e posti no.
function valoreSembraPassword(v) {
  const s = v.replace(/^[*_`'"«]+|[*_`'",;.:)\]}»]+$/g, '');
  if (s.length < 8) return false;
  if (POSTI_PASSWORD.test(s)) return false;
  if (/^[<{$%([]|^\$\{|process\.env|os\.environ|getenv|env\.|this\.|self\.|config\.|^\*{3}|\.\.\.|…|redact|nascost|^x{3,}$/i.test(s)) return false;
  if (/[\\/]|^~|^[A-Za-z]:|\.(txt|json|md|env|key|pem|ya?ml|js|mjs|py|ps1)$/i.test(s)) return false;
  if (/\(\)|=>|\($/.test(s)) return false;
  if (/^(Get|Set|New|Read|Join|Split|Test|Convert)-[A-Z]/.test(s)) return false;
  if (/^(null|undefined|true|false|none|string|required|hidden|input|password|passwd|vuota|vuoto)$/i.test(s)) return false;
  // lettere insieme a cifre o simboli: una parola sola, anche con maiuscole in mezzo, è più spesso un nome
  return /[A-Za-z]/.test(s) && (/\d/.test(s) || /[!@#$%^&*?+=_.-]/.test(s));
}
function ibanValido(grezzo) {
  const s = grezzo.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  let resto = 0;
  for (const ch of s.slice(4) + s.slice(0, 4)) {
    const v = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of v) resto = (resto * 10 + Number(d)) % 97;
  }
  return resto === 1;
}
function cercaSegreti(nome, testo) {
  const trovati = [];
  const rePwd = /(?<![A-Za-z])(password|passwd|pwd)["'\]]?\s*[:=]\s*\**\s*[`"']?(\S+)/gi;
  const reIban = /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/g;
  righe(testo).forEach((r, i) => {
    let sk = false;
    for (const [tipo, re] of SEGRETI) {
      if (!re.test(r)) continue;
      if (tipo === 'chiave Anthropic') sk = true;
      if (tipo === 'chiave OpenAI' && sk) continue;
      trovati.push(`${nome}:${i + 1}  ${tipo}`);
    }
    rePwd.lastIndex = 0;
    let m;
    while ((m = rePwd.exec(r))) if (valoreSembraPassword(m[2])) { trovati.push(`${nome}:${i + 1}  password in chiaro`); break; }
    reIban.lastIndex = 0;
    while ((m = reIban.exec(r))) if (ibanValido(m[0])) { trovati.push(`${nome}:${i + 1}  IBAN`); break; }
  });
  // Indirizzi email: solo nelle righe con una @ e con parti di lunghezza limitata, così una lunga stringa senza @
  // (per esempio i dati in base64 di un'esportazione) non rallenta il controllo.
  const email = new Set();
  const reEmail = /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.([A-Za-z]{2,24})(?![A-Za-z])/g;
  for (const r of righe(testo)) {
    if (!r.includes('@')) continue;
    for (const m of r.matchAll(reEmail)) {
      if (/^(png|jpe?g|gif|webp|svg|js|mjs|css)$/i.test(m[1])) continue;
      email.add(m[0].toLowerCase());
    }
  }
  if (email.size > 50) trovati.push(`${nome}  ${email.size} indirizzi email diversi`);
  return trovati;
}
function controlloSegreti(c, elenco = null) {
  let file = elenco;
  if (!file) {
    if (gitAttivo()) {
      // file tracciati più quelli nuovi che Git terrebbe (non esclusi da .gitignore)
      const out = git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
      if (out !== null) file = [...new Set(out.split('\0').filter(Boolean))];
    }
    if (!file) { file = tutti(); c.nota = 'senza Git: controllati tutti i file di testo'; }
  }
  let letti = 0;
  for (const f of file) {
    const rel = path.isAbsolute(f) ? f : posix(f);
    let nome = rel;
    if (path.isAbsolute(rel)) { const r = posix(path.relative(RADICE, rel)); if (!r.startsWith('..') && !path.isAbsolute(r)) nome = r; }
    if (nome === QUESTO_REL || nome === FILE_STATO) continue;
    const t = leggiTesto(rel);
    if (t === null) continue;
    letti++;
    c.casi.push(...cercaSegreti(nome, t));
  }
  if (!elenco) c.nota = c.nota || `${letti} file letti`;
  if (c.casi.length) c.esito = 'rosso';
}

// ---------------------------------------------------------------- f) strumenti

function controlloStrumenti(c) {
  const reg = leggiTesto(FILE_REGISTRO);
  if (reg === null) { c.esito = 'rosso'; c.casi.push(`${FILE_REGISTRO} non trovato`); return; }
  const EST = /\.(mjs|js|cjs|py|ps1|sh|cmd|bat)$/i;
  const script = tutti().filter(f => f.startsWith('bin/') && !f.startsWith('bin/lib/') && !f.startsWith('bin/dati/') && EST.test(f));
  // basta il percorso dello script o quello di una sua sottocartella di bin/ (bin/hooks/ vale per tutta la cartella)
  const citato = f => {
    if (reg.includes(f)) return true;
    const parti = f.split('/');
    for (let n = parti.length - 1; n >= 2; n--) if (reg.includes(parti.slice(0, n).join('/') + '/')) return true;
    return false;
  };
  const senzaRiga = script.filter(f => !citato(f));
  const citati = new Set();
  for (const m of reg.matchAll(/(?<![\w./\\-])bin\/[^\s`'"()|,;«»<>[\]\\]*/g)) {
    const p = m[0].replace(/[.,:;!?)]+$/, '');
    if (/[*{}]|AAAA/.test(p)) continue;
    citati.add(p);
  }
  const mancanti = [...citati].filter(p => !esiste(p) && !esiste(p.replace(/\/$/, '')));
  for (const f of senzaRiga) c.casi.push(`${f} non compare in ${FILE_REGISTRO}`);
  for (const f of mancanti) c.casi.push(`${f} è citato in ${FILE_REGISTRO} ma non esiste`);
  c.nota = `${script.length} script in bin/, ${senzaRiga.length} senza riga nel registro, ${mancanti.length} citati e assenti`;
  if (c.casi.length) c.esito = 'rosso';
}

// ---------------------------------------------------------------- g) frontmatter e pagine regola

const maiuscola = s => s.charAt(0).toUpperCase() + s.slice(1);
function problemiCorpo(t) {
  const p = [];
  const rr = righe(t);
  const pul = righeSenzaCodice(t);
  let i = 0;
  if (/^---\s*$/.test(rr[0] || '')) { i = 1; while (i < rr.length && !/^---\s*$/.test(rr[i])) i++; i++; }
  while (i < rr.length && !rr[i].trim()) i++;
  if (!/^#\s+\S/.test(rr[i] || '')) p.push('il corpo non inizia con il titolo «# Titolo»');
  else {
    i++;
    while (i < rr.length && !rr[i].trim()) i++;
    if (!/^##\s+in breve\s*$/i.test(rr[i] || '')) p.push('subito dopo il titolo ci vuole «## In breve»');
  }
  const titoli = [];
  pul.forEach((r, k) => { const m = r.match(/^##\s+(.+?)\s*#*\s*$/); if (m) titoli.push({ t: normTitolo(m[1]), k }); });
  const pos = nome => titoli.findIndex(x => x.t === nome);
  const ib = pos('in breve');
  if (ib < 0) p.push('manca la sezione «## In breve»');
  else {
    const corpo = rr.slice(titoli[ib].k + 1, ib + 1 < titoli.length ? titoli[ib + 1].k : rr.length);
    while (corpo.length && !corpo[0].trim()) corpo.shift();
    while (corpo.length && !corpo[corpo.length - 1].trim()) corpo.pop();
    if (!corpo.length) p.push('«In breve» è vuota');
    else {
      if (corpo.some(r => !r.trim())) p.push('«In breve» ha righe vuote in mezzo');
      if (corpo.some(r => r.trim() && !r.startsWith('- '))) p.push('in «In breve» ogni riga inizia con «- » (niente riquadri, niente ---, niente righe a capo)');
      const n = corpo.filter(r => r.startsWith('- ')).length;
      if (n > 4) p.push(`«In breve» ha ${n} righe: al massimo 4`);
    }
  }
  const ordine = ['in breve', 'la regola', 'perché esiste', 'come si applica', 'collegamenti'];
  const obbligatorie = new Set(['la regola', 'perché esiste', 'collegamenti']);
  let ultima = -1, ultimoNome = '';
  for (const nome of ordine) {
    const k = pos(nome);
    if (k < 0) { if (obbligatorie.has(nome)) p.push(`manca la sezione «## ${maiuscola(nome)}»`); continue; }
    if (k < ultima) p.push(`la sezione «${maiuscola(nome)}» va dopo «${maiuscola(ultimoNome)}»`);
    else { ultima = k; ultimoNome = nome; }
  }
  return p;
}
function problemiRegola(t, fm) {
  const p = [];
  const v = k => testoDi(fm[k]);
  if (!v('title')) p.push('manca title');
  const ambito = v('ambito');
  if (!ambito) p.push('manca ambito');
  else if (!/^[a-z][a-z0-9-]*$/.test(ambito)) p.push(`ambito «${corto(ambito)}» non valido (minuscole, cifre e trattini)`);
  const nucleo = minuscolo(v('nucleo'));
  if (!nucleo) p.push('manca nucleo (sì o no)');
  else if (!['sì', 'si', 'yes', 'true', 'no', 'false'].includes(nucleo)) p.push(`nucleo «${corto(nucleo)}» non valido (sì o no)`);
  if (v('ordine') && !/^-?\d+(?:\.\d+)?$/.test(v('ordine'))) p.push('ordine non è un numero');
  const stato = minuscolo(v('status'));
  if (!stato) p.push('manca status');
  for (const k of ['created', 'updated']) {
    if (!v(k)) p.push(`manca ${k}`);
    else if (giorniDa(v(k)) === null) p.push(`${k} non è una data AAAA-MM-GG`);
  }
  if (!v('fonte')) p.push('manca fonte');
  const haSuperata = !!v('superata-da');
  if (haSuperata && stato !== 'superseded') p.push('ha superata-da ma status non è superseded');
  if (stato === 'superseded' && !haSuperata) p.push('status superseded senza superata-da');
  // la forma del corpo conta solo per le regole in vigore (quelle che entrano nel nucleo)
  if (stato !== 'superseded' && stato !== 'archived') p.push(...problemiCorpo(t));
  return p;
}

function controlloFrontmatter(c) {
  const tipi = new Set(IMP.vocabolario.type.map(minuscolo));
  const stati = new Set(IMP.vocabolario.status.map(minuscolo));
  const rossi = [], gialli = [];
  let pagine = 0, regole = 0;
  for (const f of tutti().filter(x => x.startsWith('wiki/') && /\.md$/i.test(x))) {
    const t = leggiTesto(f);
    if (t === null) continue;
    pagine++;
    const fm = frontmatter(t);
    const tipo = minuscolo(testoDi(fm.type));
    const stato = minuscolo(testoDi(fm.status));
    const generata = /^(true|sì|si|yes)$/i.test(testoDi(fm.generato));
    const prob = [];
    if (!tipo) prob.push('manca type');
    else if (!tipi.has(tipo)) prob.push(`type «${corto(tipo)}» fuori vocabolario`);
    if (!generata) {
      if (!stato) prob.push('manca status');
      else if (!stati.has(stato)) prob.push(`status «${corto(stato)}» fuori vocabolario`);
    }
    // Una chiave scritta due volte (succede con l'unione automatica di Git) non è YAML valido per Obsidian.
    const blocco = (t.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const chiavi = [...blocco.matchAll(/^([A-Za-z_][\w-]*)\s*:/gm)].map(m => m[1].toLowerCase());
    const doppie = [...new Set(chiavi.filter((k, i) => chiavi.indexOf(k) !== i))];
    if (doppie.length) prob.push(`chiave doppia nel frontmatter (${doppie.join(', ')}): tieni una riga sola`);
    if (prob.length) gialli.push(`giallo ${f}: ${prob.join(', ')}`);
    if (tipo === 'regola') {
      regole++;
      for (const x of problemiRegola(t, fm)) rossi.push(`rosso  ${f}: ${x}`);
    }
  }
  const amb = IMP.fileRegolaAmbito;
  if (amb) {
    const t = leggiTesto(amb);
    if (t === null) rossi.push(`rosso  ${amb} non esiste: serve per la sezione «Regola d'ambito»`);
    else if (!sezione(t, "Regola d'ambito")) rossi.push(`rosso  ${amb}: manca la sezione «## Regola d'ambito»`);
  }
  c.casi.push(...rossi, ...gialli);
  c.nota = `${pagine} pagine, ${regole} regole`;
  if (rossi.length) c.esito = 'rosso'; else if (gialli.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- h) file generati

function descriviDifferenza(d) {
  if (typeof d === 'string') return d;
  if (d && typeof d === 'object') {
    const dove = d.file || d.percorso || d.path || '';
    const cosa = d.cosa || d.motivo || d.messaggio || d.descrizione || d.tipo || '';
    if (dove || cosa) return [dove, cosa].filter(Boolean).join(': ');
  }
  return corto(JSON.stringify(d), 160);
}
// Importa bin/costruisci.mjs e chiede le differenze senza scrivere. Mentre gira, le sue stampe e una sua
// eventuale richiesta di uscita vengono trattenute, così non sporcano il JSON e non chiudono questo processo.
async function differenzeDaImport() {
  const salva = { exit: process.exit, out: process.stdout.write, err: process.stderr.write, codice: process.exitCode };
  process.exit = (n) => { throw new Error(`il modulo ha chiesto di uscire con codice ${n ?? 0}`); };
  process.stdout.write = () => true;
  process.stderr.write = () => true;
  try {
    const mod = await import(pathToFileURL(ass(FILE_COSTRUISCI)).href);
    if (typeof mod.costruisci !== 'function') return { ok: false, motivo: 'costruisci() non esportata' };
    const r = await mod.costruisci({ scrivi: false });
    let elenco = null;
    if (Array.isArray(r)) elenco = r;
    else if (r && typeof r === 'object' && Array.isArray(r.differenze)) elenco = [...r.differenze, ...(Array.isArray(r.errori) ? r.errori : [])];
    if (!elenco) return { ok: false, motivo: 'risultato di costruisci() non riconosciuto' };
    return { ok: true, differenze: elenco.map(descriviDifferenza) };
  } catch (e) {
    return { ok: false, motivo: corto(e?.message || String(e), 120) };
  } finally {
    process.exit = salva.exit;
    process.stdout.write = salva.out;
    process.stderr.write = salva.err;
    process.exitCode = salva.codice;
  }
}
async function controlloGenerati(c) {
  if (!esiste(FILE_COSTRUISCI)) { c.esito = 'neutro'; c.nota = `${FILE_COSTRUISCI} non esiste: controllo spento`; return; }
  const ris = await differenzeDaImport();
  if (ris.ok) {
    if (ris.differenze.length) {
      c.esito = 'rosso';
      c.casi.push(...ris.differenze);
      c.nota = 'da rigenerare con node bin/costruisci.mjs';
    } else c.nota = 'nucleo, blocchi generati e plugin aggiornati';
    return;
  }
  // ripiego: lo script da riga di comando, in prova
  const r = spawnSync(process.execPath, [ass(FILE_COSTRUISCI), '--verifica'], {
    cwd: RADICE, encoding: 'utf8', timeout: 120000, windowsHide: true,
  });
  if (r.error) { c.esito = 'rosso'; c.casi.push(`errore del controllore: ${corto(r.error.message, 120)}`); return; }
  if (r.status === 0) { c.nota = 'node bin/costruisci.mjs --verifica superata'; return; }
  c.esito = 'rosso';
  c.nota = `node bin/costruisci.mjs --verifica è uscito con codice ${r.status ?? '?'}`;
  for (const riga of righe(`${r.stdout || ''}\n${r.stderr || ''}`).map(s => s.trim()).filter(Boolean).slice(0, 20)) c.casi.push(riga);
}

// ---------------------------------------------------------------- i) battiti

function giorniCadenza(testo) {
  const s = minuscolo(testo).replace(/[«»*`]/g, '');
  const m = s.match(/ogni\s+(\d+)\s+giorni/);
  if (m) return Number(m[1]);
  if (/ogni\s+giorno|giornalier|quotidian/.test(s)) return 1;
  if (/settimanal|ogni\s+settimana/.test(s)) return 8;
  if (/mensil|ogni\s+mese/.test(s)) return 32;
  return null;
}
function controlloBattiti(c) {
  const leggimi = leggiTesto(FILE_AUTOMAZIONI);
  const sez = leggimi ? sezione(leggimi, 'Battiti') : null;
  const attesi = new Map();
  if (sez) {
    let col = null;
    for (const r of sez.righe) {
      if (!r.trim().startsWith('|')) { col = null; continue; }
      const celle = celleTabella(r);
      if (!col) {
        const idx = n => celle.findIndex(x => minuscolo(x.replace(/[*`]/g, '')).startsWith(n));
        const ci = { nome: idx('battito'), cad: idx('cadenza') };
        if (ci.nome >= 0 && ci.cad >= 0) col = ci;
        continue;
      }
      if (rigaSeparatore(celle)) continue;
      const nome = (celle[col.nome] || '').replace(/[`*«»[\]]/g, '').trim()
        .replace(new RegExp('^' + escapeRe(CARTELLA_BATTITI) + '/'), '').replace(/\.txt$/i, '');
      if (!nome) continue;
      const cadenza = (celle[col.cad] || '').replace(/[`*«»]/g, '').trim();
      attesi.set(nome.toLowerCase(), { nome, cadenza, giorni: giorniCadenza(cadenza) });
    }
  }
  const file = tutti().filter(f => f.startsWith(CARTELLA_BATTITI + '/') && /\.txt$/i.test(f));
  if (!sez && !file.length) { c.esito = 'neutro'; c.nota = `nessuna sezione «Battiti» in ${FILE_AUTOMAZIONI} e nessun battito`; return; }
  const perNome = new Map(file.map(f => [path.posix.basename(f).replace(/\.txt$/i, '').toLowerCase(), f]));
  const nomi = [...new Set([...attesi.keys(), ...perNome.keys()])].sort();
  const rossi = [], gialli = [];
  for (const k of nomi) {
    const att = attesi.get(k);
    const f = perNome.get(k);
    if (!f) { gialli.push(`giallo ${CARTELLA_BATTITI}/${att.nome}.txt: non ancora partito`); continue; }
    const t = leggiTesto(f) || '';
    const ultimaRiga = righe(t).map(s => s.trim()).filter(Boolean).pop() || '';
    let data = (ultimaRiga.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1];
    if (!data) data = [...t.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map(m => m[1]).filter(d => giorniDa(d) !== null).sort().pop();
    if (!data || giorniDa(data) === null) { gialli.push(`giallo ${f}: nessuna data leggibile`); continue; }
    if (!att || att.giorni === null) {
      gialli.push(`giallo ${f}: ultimo battito ${data}, cadenza non scritta nella tabella «Battiti» di ${FILE_AUTOMAZIONI}`);
      continue;
    }
    if (giorniDa(data) > att.giorni + 1) rossi.push(`rosso  ${f}: ultimo battito ${data}, cadenza «${att.cadenza}»`);
    else if (/esito:\s*errore/i.test(ultimaRiga)) gialli.push(`giallo ${f}: il giro del ${data} è finito in errore`);
  }
  c.casi.push(...rossi, ...gialli);
  c.nota = `${pl(nomi.length, 'battito', 'battiti')}, ${rossi.length} in ritardo`;
  if (rossi.length) c.esito = 'rosso'; else if (gialli.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- j) radice

function controlloRadice(c) {
  const voci = fs.readdirSync(RADICE).sort();
  if (!voci.includes('AGENTS.md')) c.casi.push('rosso  manca AGENTS.md: è il file di istruzioni che leggono tutti gli agenti');
  else {
    // Senza il blocco generato gli agenti non ricevono più le regole (e bin/costruisci.mjs dà solo un avviso).
    const agents = leggiTesto('AGENTS.md') || '';
    if (!/<!--\s*genera:\s*nucleo\s*-->[\s\S]*?<!--\s*fine:\s*nucleo\s*-->/.test(agents)) {
      c.casi.push('rosso  AGENTS.md ha perso il blocco «<!-- genera: nucleo -->» ... «<!-- fine: nucleo -->»: rimettilo in fondo (due righe) e lancia node bin/costruisci.mjs');
    }
  }
  if (ERRORE_IMP) c.casi.push(`rosso  ${FILE_IMPOSTAZIONI} ${ERRORE_IMP}: i controlli usano i valori predefiniti`);
  for (const v of voci) {
    if (/^(README|LEGGIMI|HANDOFF|ISTRUZIONI)/i.test(v) || /-START\.md$/i.test(v)) {
      c.casi.push(`giallo file di istruzioni in più in radice: ${v} (le istruzioni stanno in AGENTS.md)`);
    }
  }
  if (c.casi.some(x => x.startsWith('rosso'))) c.esito = 'rosso'; else if (c.casi.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- k) doppioni

// I nomi tipici delle copie in conflitto: «(1)», « 2.», «copia di», «copy of», «- Copia», «conflicted copy» e
// «copia in conflitto» (Dropbox), e il nome di questo computer in coda prima dell'estensione, «-<nome computer>»,
// come fa OneDrive (senza distinguere maiuscole). Un nome che non segue questi schemi può sfuggire.
function controlloDoppioni(c) {
  const segni = [/\(\d+\)/, / \d+\.[^./\s]+$/, /copia di/i, /copy of/i, / - copia/i, /conflitt|conflicted copy/i];
  // Nomi di computer troppo corti o generici (ubuntu, localhost, pc...) segnerebbero pagine legittime: si saltano.
  const GENERICI = new Set(['localhost', 'ubuntu', 'debian', 'fedora', 'linux', 'raspberrypi', 'pc', 'desktop', 'laptop',
    'computer', 'macbook', 'imac', 'mac', 'server', 'home', 'host']);
  const host = String(os.hostname() || '').trim();
  for (const h of new Set([host, host.split('.')[0]])) {
    if (h.length >= 4 && !GENERICI.has(h.toLowerCase())) segni.push(new RegExp(`-${escapeRe(h)}(\\.[^./]+)?$`, 'i'));
  }
  for (const f of cammina({ cartelle: true })) {
    if (!fuoriRaw(f)) continue;
    const nome = path.posix.basename(f.replace(/\/$/, ''));
    if (segni.some(re => re.test(nome))) c.casi.push(f);
  }
  if (c.casi.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- l) .gitignore

function controlloGitignore(c) {
  if (!gitAttivo()) { c.esito = 'neutro'; c.nota = 'Git non attivo in questa cartella'; return; }
  // Le pagine di wiki/ e i file di testo degli strumenti, delle procedure e dei comandi: se Git li esclude,
  // non arrivano mai agli altri computer né alle routine (le impostazioni locali di Claude Code restano fuori apposta).
  const md = tutti().filter(f => (f.startsWith('wiki/') && /\.md$/i.test(f)) ||
    (/^(bin|automazioni|\.claude|\.github)\//.test(f) && testoFile(f) && !/\.local\.json$/i.test(f)) ||
    ['AGENTS.md', 'CLAUDE.md'].includes(f));
  if (!md.length) { c.nota = 'nessuna pagina in wiki/'; return; }
  const out = git(['check-ignore', '--no-index', '-z', '--stdin'], { input: md.join('\0') + '\0', accetta1: true });
  if (out === null) { c.esito = 'rosso'; c.casi.push('errore del controllore: git check-ignore non ha risposto'); return; }
  for (const f of out.split('\0').filter(Boolean)) c.casi.push(`${f} è escluso da .gitignore`);
  c.nota = `${md.length} file controllati (wiki/, bin/, automazioni/, .claude/, .github/)`;
  if (c.casi.length) c.esito = 'rosso';
}

// ---------------------------------------------------------------- m) hot

function controlloHot(c) {
  const h = IMP.hot;
  const rel = h.file;
  const t = leggiTesto(rel);
  if (t === null) { c.esito = 'giallo'; c.casi.push(`${rel} non trovato`); return; }
  const kb = Buffer.byteLength(t, 'utf8') / 1024;
  if (kb > Number(h.maxKB)) c.casi.push(`${rel} pesa ${Math.round(kb)} KB, oltre ${h.maxKB} KB`);
  // Data dell'ultimo aggiornamento: la più recente fra «updated» (anche se l'unione automatica di Git ne ha lasciate
  // due righe) e la data della voce più recente di «In corso adesso» (chi aggiunge una voce non sempre cambia updated).
  const fmBlocco = (t.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const dateUpd = [...fmBlocco.matchAll(/^updated\s*:\s*["']?(\d{4}-\d{2}-\d{2})/gim)].map(m => m[1]);
  if (dateUpd.length > 1) c.casi.push(`${rel}: ${dateUpd.length} righe «updated» nel frontmatter (unione automatica di Git): tieni solo la più recente`);
  const sezVoci = sezione(t, h.sezione);
  const dateVoci = sezVoci ? sezVoci.righe.filter(r => /^[-*]\s/.test(r)).map(r => (r.match(/\d{4}-\d{2}-\d{2}/) || [])[0]).filter(d => d && giorniDa(d) !== null) : [];
  const ultima = [...dateUpd, ...dateVoci].filter(d => giorniDa(d) !== null).sort().pop();
  const eta = ultima ? giorniDa(ultima) : null;
  if (!dateUpd.length) c.casi.push(`${rel}: manca updated nel frontmatter`);
  if (eta !== null && eta > 7) c.casi.push(`${rel}: non aggiornato da ${eta} giorni (ultima data ${ultima}, fra updated e voci di «${h.sezione}»)`);
  const sez = sezVoci;
  if (!sez) c.casi.push(`${rel}: manca la sezione «${h.sezione}»`);
  else {
    let vecchie = 0;
    sez.righe.forEach((r, k) => {
      if (!/^[-*]\s/.test(r)) return;
      const m = r.match(/\d{4}-\d{2}-\d{2}/);
      if (!m) return;
      const e = giorniDa(m[0]);
      if (e !== null && e > Number(h.giorni)) { vecchie++; c.casi.push(`${rel}:${sez.da + k + 1}  voce del ${m[0]}`); }
    });
    if (vecchie) c.nota = `${pl(vecchie, 'voce', 'voci')} di «${h.sezione}» ${vecchie === 1 ? 'più vecchia' : 'più vecchie'} di ${h.giorni} giorni: le archivia il Custode`;
  }
  if (c.casi.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- n) segnaposto

function controlloSegnaposto(c) {
  // Una citazione della sintassi tra apici inversi (con «descrizione», «cosa», «...» o senza chiusura) non conta.
  const citazione = new RegExp('`' + escapeRe(SEGNAPOSTO) + '(?::\\s*(?:descrizione|cosa|\\.\\.\\.|…))?(?:\\}\\})?`', 'g');
  // Le copie generate (nucleo, blocchi generati, marketplace) ripetono i segnaposto delle pagine d'origine:
  // si contano solo le parti scritte a mano.
  const blocchiGenerati = /<!--\s*genera:\s*([\w-]+)\s*-->[\s\S]*?<!--\s*fine:\s*\1\s*-->/g;
  const per = [];
  for (const f of tutti()) {
    if (!/\.(md|json|ya?ml|txt)$/i.test(f) || !fuoriRaw(f) || !fuoriModelli(f)) continue;
    if (f === '.claude-plugin/marketplace.json') continue;
    const t = leggiTesto(f);
    if (!t || !t.includes(SEGNAPOSTO)) continue;
    if (/\.md$/i.test(f) && /^(true|sì|si|yes)$/i.test(testoDi(frontmatter(t).generato))) continue;
    const n = t.replace(blocchiGenerati, '').replace(citazione, '').split(SEGNAPOSTO).length - 1;
    if (n) per.push([f, n]);
  }
  // Le pagine copiate da _modelli/ e lasciate a metà: segnaposto tra < e > (con almeno uno spazio, così un tag HTML
  // non conta) e le date AAAA-MM-GG non sostituite.
  const reModello = /^\s*(?:[-*]\s+)?(?:\*\*)?(?:#{1,6}\s+)?(?:[A-Za-zÀ-ÿ][\wÀ-ÿ ]*:\s*["']?)?<[A-Za-zÀ-ÿ][^<>=/]*\s[^<>=/]*>|^\s*(?:created|updated|data):\s*AAAA-MM-GG|^\s*[-*]\s+\*\*AAAA-MM-GG/;
  for (const f of tutti()) {
    if (!f.startsWith('wiki/') || !/\.md$/i.test(f)) continue;
    const t = leggiTesto(f);
    if (!t || /^(true|sì|si|yes)$/i.test(testoDi(frontmatter(t).generato))) continue;
    const n = righeSenzaCodice(t.replace(blocchiGenerati, m => m.replace(/[^\n]/g, ''))).filter(r => reModello.test(senzaCodiceInRiga(r))).length;
    if (!n) continue;
    const gia = per.find(x => x[0] === f);
    if (gia) gia[1] += n; else per.push([f, n]);
  }
  per.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  for (const [f, n] of per) c.casi.push(`${f}: ${n}`);
  const tot = per.reduce((a, x) => a + x[1], 0);
  c.nota = tot ? `${tot} segnaposto da compilare in ${per.length} file` : 'nessun segnaposto da compilare';
  if (per.length) c.esito = 'giallo';
}

// ---------------------------------------------------------------- --segreti: solo i file indicati

if (opz.segreti) {
  if (!opz.segreti.length) { console.error('--segreti vuole almeno un file'); process.exit(2); }
  // Ogni file resta legato alla sua posizione nell'elenco passato: chi chiama (la sincronizzazione) ritrova così il
  // file esatto anche se il nome ha caratteri particolari.
  const voci = opz.segreti.map((f, indice) => {
    const a = path.resolve(process.cwd(), f);
    const r = posix(path.relative(RADICE, a));
    return { indice, rel: r.startsWith('..') || path.isAbsolute(r) ? a : r };
  }).filter(v => { try { return fs.statSync(path.isAbsolute(v.rel) ? v.rel : ass(v.rel)).isFile(); } catch { return false; } });
  const c = { id: 'e', titolo: 'Segreti e dati personali', esito: 'verde', casi: [], nota: '' };
  const indici = [];
  for (const v of voci) {
    const prima = c.casi.length;
    controlloSegreti(c, [v.rel]);
    if (c.casi.length > prima) indici.push(v.indice);
  }
  // Qui i nomi dei file si stampano come sono (sono nomi, non valori): pulisci() serve solo alla pagina di stato.
  if (opz.json) console.log(JSON.stringify({ controllati: voci.length, trovati: c.casi.length, indici, casi: c.casi }, null, 2));
  else if (c.casi.length) {
    console.log(`Possibili segreti o dati personali (${c.casi.length}) nei ${voci.length} file controllati:`);
    for (const x of c.casi) console.log(x);
  } else console.log(`Nessun segreto nei ${voci.length} file controllati.`);
  process.exit(c.casi.length ? 1 : 0);
}

// ---------------------------------------------------------------- esecuzione

const CONTROLLI = [
  ['a', 'Percorsi citati che non esistono', controlloPercorsi],
  ['b', 'Wikilink rotti e omonimi', controlloWikilink],
  ['c', 'Caratteri vietati', controlloCaratteri],
  ['d', 'Frasi superate', controlloFrasi],
  ['e', 'Segreti e dati personali', c => controlloSegreti(c)],
  ['f', 'Strumenti e registro', controlloStrumenti],
  ['g', 'Frontmatter e pagine regola', controlloFrontmatter],
  ['h', 'File generati aggiornati', controlloGenerati],
  ['i', 'Battiti delle automazioni', controlloBattiti],
  ['j', 'Radice e file di istruzioni', controlloRadice],
  ['k', 'Doppioni', controlloDoppioni],
  ['l', 'Pagine escluse da .gitignore', controlloGitignore],
  ['m', 'Hot cache', controlloHot],
  ['n', 'Segnaposto da compilare', controlloSegnaposto],
];
const controlli = [];
for (const [id, titolo, fn] of CONTROLLI) {
  const c = { id, titolo, esito: 'verde', casi: [], nota: '' };
  controlli.push(c);
  try { await fn(c); } catch (e) {
    c.esito = 'rosso';
    c.casi.push(`errore del controllore: ${corto(e?.message || String(e), 160)}`);
  }
}

const n = { rosso: 0, giallo: 0, verde: 0, neutro: 0 };
for (const c of controlli) n[c.esito]++;
const parola = (k, uno, tanti) => `${n[k]} ${n[k] === 1 ? uno : tanti}`;
const riepilogo = [parola('rosso', 'rosso', 'rossi'), parola('giallo', 'giallo', 'gialli'), parola('verde', 'verde', 'verdi')]
  .concat(n.neutro ? [parola('neutro', 'spento', 'spenti')] : []).join(', ');

const ETICHETTA = { rosso: 'ROSSO   ', giallo: 'GIALLO  ', verde: 'VERDE   ', neutro: 'SPENTO  ' };
const rapporto = [riepilogo, ''];
for (const c of controlli) {
  const tot = c.casi.length;
  rapporto.push(`${ETICHETTA[c.esito]}${c.id}) ${c.titolo}${tot ? ` (${tot})` : ''}${c.nota ? `: ${c.nota}` : ''}`);
  for (const caso of c.casi.slice(0, MAX_CASI)) rapporto.push(`          ${caso}`);
  if (tot > MAX_CASI) rapporto.push(`          e altri ${tot - MAX_CASI}`);
}
const corpo = rapporto.map(pulisci);
const avvisi = [];

// Con un repository online la pagina di stato la scrive solo il controllo su GitHub: se la scrivesse anche il
// computer, le due versioni andrebbero in conflitto alla sincronizzazione successiva.
const conRemoto = () => gitAttivo() && (git(['remote']) || '').split(/\r?\n/).map(s => s.trim()).includes('origin');
if (opz.scrivi && !opz.forza && !process.env.GITHUB_ACTIONS && conRemoto()) {
  opz.scrivi = false;
  avvisi.push(`${FILE_STATO} non scritto: con un repository online lo scrive solo il controllo su GitHub (così non nascono conflitti). Il rapporto qui sopra è quello di adesso. Per scriverlo lo stesso: --scrivi --forza.`);
}

if (opz.scrivi) {
  const recinto = '`'.repeat(3);
  const pagina = [
    '---',
    'title: "Stato dei controlli"',
    'type: meta',
    'generato: true',
    `aggiornato: ${OGGI} ${ORA}`,
    '---',
    '',
    '# Stato dei controlli',
    '',
    '> Generato da `node bin/controlla.mjs --scrivi`: non si modifica a mano.',
    '',
    recinto + 'text',
    ...corpo,
    recinto,
    '',
  ].join('\n');
  const senzaData = s => s.replace(/\r\n/g, '\n').split('\n').filter(r => !/^aggiornato:/.test(r)).join('\n');
  let vecchia = null;
  try { vecchia = fs.readFileSync(ass(FILE_STATO), 'utf8'); } catch { /* prima volta */ }
  if (vecchia === null || senzaData(vecchia) !== senzaData(pagina)) {
    fs.mkdirSync(path.dirname(ass(FILE_STATO)), { recursive: true });
    fs.writeFileSync(ass(FILE_STATO), pagina, 'utf8');
    avvisi.push(`Scritto ${FILE_STATO}.`);
  } else avvisi.push(`${FILE_STATO} invariato.`);
}

if (opz.json) {
  console.log(JSON.stringify({
    data: `${OGGI} ${ORA}`,
    riepilogo: n,
    testo: riepilogo,
    controlli: controlli.map(c => ({
      id: c.id, titolo: c.titolo, esito: c.esito, nota: pulisci(c.nota), totale: c.casi.length,
      casi: c.casi.slice(0, MAX_CASI).map(pulisci),
    })),
  }, null, 2));
} else {
  console.log(`Controllo del cervello: ${OGGI} ${ORA}`);
  console.log(corpo.join('\n'));
  if (avvisi.length) console.log('\n' + avvisi.join('\n'));
}
process.exit(n.rosso ? 1 : 0);
