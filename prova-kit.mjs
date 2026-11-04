#!/usr/bin/env node
// prova-kit.mjs: prova automatica del kit «secondo cervello».
// Copia modello/ in una cartella di prova, ne fa un repository Git con un autore di prova e controlla che script,
// controlli automatici (hook) e sincronizzazione funzionino insieme. Per ogni passo stampa OK o ERRORE.
// Non usa la rete (il «remoto» è un repository nudo nella cartella di prova) e non cambia niente in modello/.
//
// Uso, dalla cartella del kit:
//   node prova-kit.mjs                          prova in una cartella nuova dentro la cartella temporanea del sistema
//   node prova-kit.mjs --cartella <percorso>    prova in quella cartella: deve essere vuota, non esistere o essere
//                                               una cartella di prova di un giro precedente (che viene ricreata)
//   node prova-kit.mjs --aiuto                  questo aiuto
// Codici d'uscita: 0 tutti i passi OK; 1 almeno un passo in ERRORE; 2 opzione sconosciuta o errore d'uso.
//
// La cartella di prova resta sul disco alla fine, per guardarci dentro: si può cancellare a mano.
// Variabili impostate per tutti i comandi della prova: CERVELLO_SYNC_DIR e CERVELLO_CHIAVI_DIR dentro la cartella di
// prova, una configurazione di Git separata (GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM) con l'autore «Prova Kit»;
// CERVELLO_HOOK e le variabili delle chiavi di Telegram tolte.
// Node 18 o più recente e Git; nessuna dipendenza.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const QUI = path.dirname(fileURLToPath(import.meta.url));
const MODELLO = path.join(QUI, 'modello');
const SEGNO = '.prova-kit'; // file segnale: questa cartella l'ha creata la prova e si può ricreare
const LINEETTA_LUNGA = String.fromCharCode(0x2014);

// ---------------------------------------------------------------- opzioni

function aiuto() {
  const righe = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split(/\r?\n/).slice(1);
  const fine = righe.findIndex(r => !r.startsWith('//'));
  console.log(righe.slice(0, fine).map(r => r.replace(/^\/\/ ?/, '')).join('\n'));
}

let cartellaScelta = null;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--aiuto' || a === '--help' || a === '-h') { aiuto(); process.exit(0); }
  else if (a === '--cartella') {
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) { console.error('--cartella vuole un percorso.'); process.exit(2); }
    cartellaScelta = path.resolve(argv[++i]);
  } else { console.error(`Opzione sconosciuta: ${a}. Vedi: node prova-kit.mjs --aiuto`); process.exit(2); }
}
if (!fs.existsSync(path.join(MODELLO, 'AGENTS.md'))) {
  console.error(`Modello non trovato: ${MODELLO}. La prova si lancia dalla cartella del kit.`);
  process.exit(2);
}

function preparaCartella() {
  if (!cartellaScelta) return fs.mkdtempSync(path.join(os.tmpdir(), 'prova-kit-'));
  const c = cartellaScelta;
  const dentro = (a, b) => { const r = path.relative(b, a); return !r.startsWith('..') && !path.isAbsolute(r); };
  if (dentro(MODELLO, c) || dentro(c, MODELLO)) { console.error('La cartella di prova non può contenere il modello né stare dentro.'); process.exit(2); }
  if (fs.existsSync(c)) {
    const voci = fs.readdirSync(c);
    if (voci.length && !voci.includes(SEGNO)) {
      console.error(`La cartella ${c} esiste e non è una cartella di prova: scegline una vuota o nuova.`);
      process.exit(2);
    }
    fs.rmSync(c, { recursive: true, force: true });
  }
  fs.mkdirSync(c, { recursive: true });
  return c;
}

const PROVA = preparaCartella();
fs.writeFileSync(path.join(PROVA, SEGNO), 'Cartella creata da prova-kit.mjs: si può cancellare.\n');
const CERVELLO = path.join(PROVA, 'cervello');

// ---------------------------------------------------------------- ambiente dei comandi

const GITCONFIG = path.join(PROVA, 'gitconfig');
fs.writeFileSync(GITCONFIG, [
  '[user]', '\tname = Prova Kit', '\temail = prova-kit@example.invalid',
  '[init]', '\tdefaultBranch = main',
  '[core]', '\tautocrlf = false',
  '[commit]', '\tgpgsign = false',
  '',
].join('\n'));

const ENV = {
  ...process.env,
  CERVELLO_SYNC_DIR: path.join(PROVA, 'stato-sync'),
  CERVELLO_CHIAVI_DIR: path.join(PROVA, 'chiavi'),
  GIT_CONFIG_GLOBAL: GITCONFIG,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Prova Kit', GIT_AUTHOR_EMAIL: 'prova-kit@example.invalid',
  GIT_COMMITTER_NAME: 'Prova Kit', GIT_COMMITTER_EMAIL: 'prova-kit@example.invalid',
  GIT_TERMINAL_PROMPT: '0', GIT_MERGE_AUTOEDIT: 'no',
};
for (const v of ['CERVELLO_HOOK', 'CERVELLO_HOOK_DEBUG', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE']) delete ENV[v];
fs.mkdirSync(ENV.CERVELLO_CHIAVI_DIR, { recursive: true });

function lancia(comando, args, { cwd = CERVELLO, env = {}, input, timeout = 180000 } = {}) {
  const r = spawnSync(comando, args, { cwd, env: { ...ENV, ...env }, input, encoding: 'utf8', timeout,
    windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${comando} non è partito: ${r.error.message}`);
  return { codice: r.status, out: r.stdout || '', err: r.stderr || '' };
}
const node = (script, args = [], opz = {}) => lancia(process.execPath, [script, ...args], opz);
const git = (args, opz = {}) => lancia('git', args, opz);
function gitOk(args, opz = {}) {
  const r = git(args, opz);
  if (r.codice !== 0) throw new Error(`git ${args.join(' ')} non riuscito: ${riga(r.err || r.out)}`);
  return r.out.trim();
}

// ---------------------------------------------------------------- piccoli aiuti

const riga = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean).slice(0, 3).join(' / ').slice(0, 300);
const leggi = (dir, rel) => fs.readFileSync(path.join(dir, ...rel.split('/')), 'utf8');
const scrivi = (dir, rel, testo) => {
  const p = path.join(dir, ...rel.split('/'));
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, testo, 'utf8');
};
const esiste = (dir, rel) => fs.existsSync(path.join(dir, ...rel.split('/')));
const versione = dir => JSON.parse(leggi(dir, 'automazioni/plugin-cervello/.claude-plugin/plugin.json')).version;
const versioneMarketplace = dir => (JSON.parse(leggi(dir, '.claude-plugin/marketplace.json')).plugins || [])
  .find(p => p.name === 'cervello')?.version;
const alza = v => v.replace(/(\d+)$/, n => String(Number(n) + 1));
const blocco = (testo, tipo) => {
  const m = testo.match(new RegExp(`<!-- genera: ${tipo} -->\\r?\\n([\\s\\S]*?)<!-- fine: ${tipo} -->`));
  return m ? m[1].trim() : null;
};

class Errore extends Error {}
function atteso(condizione, messaggio) { if (!condizione) throw new Errore(messaggio); }
function uscita(r, attesa, cosa) {
  atteso(r.codice === attesa, `${cosa}: uscita ${r.codice}, attesa ${attesa}. ${riga(r.out + '\n' + r.err)}`);
}
function json(testo, cosa) {
  try { return JSON.parse(testo); } catch { throw new Errore(`${cosa}: l'uscita non è JSON valido: ${riga(testo) || '(vuota)'}`); }
}

const esiti = [];
function passo(nome, corpo) {
  let ok = false, nota = '';
  try {
    const r = corpo();
    ok = true;
    if (typeof r === 'string') nota = r;
  } catch (e) {
    nota = e instanceof Errore ? e.message : `errore della prova: ${e && e.message}`;
  }
  esiti.push({ nome, ok });
  console.log(`${ok ? 'OK    ' : 'ERRORE'}  ${nome}${nota ? `\n        ${nota}` : ''}`);
  return ok;
}

// ---------------------------------------------------------------- i passi

console.log(`Prova del kit «secondo cervello»\nModello:          ${MODELLO}\nCartella di prova: ${PROVA}\n`);

const versioneGit = (() => { try { return lancia('git', ['--version'], { cwd: PROVA }).out.trim(); } catch { return null; } })();
if (!versioneGit) { console.log('ERRORE  Git non trovato: la prova ha bisogno di git.'); process.exit(1); }

let v0 = null;
const pronto = passo('Preparazione: copia del modello, file generati svuotati, git init e primo commit', () => {
  fs.cpSync(MODELLO, CERVELLO, { recursive: true,
    filter: s => !['.git', 'esporta', 'node_modules', '_da_eliminare'].includes(path.basename(s)) });
  // Si svuota ciò che genera costruisci.mjs, così il passo dopo lo genera davvero da zero.
  for (const rel of ['wiki/meta/nucleo.md', 'wiki/meta/stato-controlli.md', '.claude-plugin/impronte.json']) {
    fs.rmSync(path.join(CERVELLO, ...rel.split('/')), { force: true });
  }
  for (const rel of ['AGENTS.md', 'automazioni/plugin-cervello/skills/cervello/SKILL.md']) {
    scrivi(CERVELLO, rel, leggi(CERVELLO, rel).replace(/(<!-- genera: ([\w-]+) -->)[\s\S]*?(<!-- fine: \2 -->)/g, '$1\n$3'));
  }
  v0 = versione(CERVELLO);
  gitOk(['init', '-q'], { cwd: CERVELLO });
  gitOk(['symbolic-ref', 'HEAD', 'refs/heads/main']);
  gitOk(['add', '-A']);
  gitOk(['commit', '-q', '-m', 'Primo commit di prova']);
  const n = gitOk(['ls-files']).split('\n').length;
  return `${versioneGit}, Node ${process.version}; ${n} file nel primo commit, versione del plugin ${v0}`;
});
if (!pronto) { console.log('\nLa preparazione non è riuscita: gli altri passi non hanno senso.'); process.exit(1); }

passo('costruisci.mjs genera nucleo, blocchi, impronta e marketplace', () => {
  const r = node('bin/costruisci.mjs');
  uscita(r, 0, 'node bin/costruisci.mjs');
  atteso(esiste(CERVELLO, 'wiki/meta/nucleo.md'), 'wiki/meta/nucleo.md non è stato creato');
  const nucleo = leggi(CERVELLO, 'wiki/meta/nucleo.md');
  for (const t of ['## Prima di tutto: di chi è questa sessione', '## Valgono sempre', '## Richiesta → strumento', '## Le altre regole']) {
    atteso(nucleo.includes(t), `nel nucleo manca la sezione «${t}»`);
  }
  atteso(blocco(leggi(CERVELLO, 'AGENTS.md'), 'nucleo'), 'il blocco nucleo di AGENTS.md è rimasto vuoto');
  const skill = leggi(CERVELLO, 'automazioni/plugin-cervello/skills/cervello/SKILL.md');
  atteso(blocco(skill, 'nucleo'), 'il blocco nucleo della skill è rimasto vuoto');
  atteso(blocco(skill, 'instradamento'), 'il blocco instradamento della skill è rimasto vuoto');
  atteso(!blocco(skill, 'nucleo').includes('| Parole tipiche |'), 'il blocco nucleo della skill contiene la tabella degli strumenti');
  atteso(esiste(CERVELLO, '.claude-plugin/impronte.json'), '.claude-plugin/impronte.json non è stato creato');
  atteso(versione(CERVELLO) === v0, `alla prima impronta la versione doveva restare ${v0}, è ${versione(CERVELLO)}`);
  atteso(versioneMarketplace(CERVELLO) === v0, 'marketplace.json non ha la versione del plugin');
  const regole = (nucleo.match(/^### .+\(\[\[[^\]]+\]\]\)$/gm) || []).length;
  return `${regole} regole nel nucleo`;
});

passo('costruisci.mjs --verifica esce 0 subito dopo', () => {
  uscita(node('bin/costruisci.mjs', ['--verifica']), 0, '--verifica');
});

passo('costruisci.mjs --elenco mostra le regole di base', () => {
  const r = node('bin/costruisci.mjs', ['--elenco']);
  uscita(r, 0, '--elenco');
  for (const n of ['fonte-unica', 'ambito', 'come-scrivere-per-me']) atteso(r.out.includes(n), `--elenco non mostra ${n}`);
});

const REGOLA = 'wiki/concepts/fonte-unica.md';
const originaleRegola = leggi(CERVELLO, REGOLA);
passo('Un «In breve» cambiato: --verifica esce 1, rigenerando torna 0', () => {
  const nuova = '- Riga di prova aggiunta da prova-kit.';
  const testo = originaleRegola.replace(/(## In breve\r?\n(?:- .*\r?\n)+)/, `$1${nuova}\n`);
  atteso(testo !== originaleRegola, `non trovo la sezione «In breve» in ${REGOLA}`);
  scrivi(CERVELLO, REGOLA, testo);
  uscita(node('bin/costruisci.mjs', ['--verifica']), 1, '--verifica con un In breve cambiato');
  uscita(node('bin/costruisci.mjs'), 0, 'node bin/costruisci.mjs');
  uscita(node('bin/costruisci.mjs', ['--verifica']), 0, '--verifica dopo la rigenerazione');
  atteso(leggi(CERVELLO, 'wiki/meta/nucleo.md').includes(nuova), 'la riga nuova non è entrata nel nucleo');
  atteso(blocco(leggi(CERVELLO, 'AGENTS.md'), 'nucleo').includes(nuova), 'la riga nuova non è entrata in AGENTS.md');
});

passo('Il plugin alza la versione quando il suo contenuto cambia', () => {
  const v = versione(CERVELLO);
  atteso(v === alza(v0), `versione del plugin ${v}, attesa ${alza(v0)}`);
  atteso(versioneMarketplace(CERVELLO) === v, `marketplace.json dice ${versioneMarketplace(CERVELLO)}, plugin.json ${v}`);
  return `da ${v0} a ${v}`;
});

passo('controlla.mjs: nessun rosso sul cervello appena costruito', () => {
  scrivi(CERVELLO, REGOLA, originaleRegola);
  uscita(node('bin/costruisci.mjs'), 0, 'rigenerazione con la regola originale');
  const r = node('bin/controlla.mjs', ['--json']);
  const j = json(r.out, 'controlla.mjs --json');
  const rossi = (j.controlli || []).filter(c => c.esito === 'rosso');
  atteso(!rossi.length, `rossi: ${rossi.map(c => `${c.id}) ${c.titolo}: ${(c.casi || []).slice(0, 3).join(' | ')}`).join('; ')}`);
  uscita(r, 0, 'controlla.mjs');
  const gialli = (j.controlli || []).filter(c => c.esito === 'giallo').map(c => c.id);
  return `${j.testo}${gialli.length ? ` (gialli: ${gialli.join(', ')})` : ''}`;
});

passo('controlla.mjs trova i rossi: lineetta lunga in una regola e una finta chiave', () => {
  const regola = 'wiki/concepts/verificato-non-dedotto.md';
  const prima = leggi(CERVELLO, regola);
  const fileChiave = 'wiki/sources/prova-segreto.md';
  // La finta chiave si costruisce qui, a ogni giro: nessun file del kit la contiene.
  const finta = 'sk-' + 'ant-' + crypto.randomBytes(30).toString('hex');
  try {
    scrivi(CERVELLO, regola, prima.replace('## La regola\n', `## La regola\nRiga di prova ${LINEETTA_LUNGA} con il carattere vietato.\n`));
    atteso(leggi(CERVELLO, regola) !== prima, `non trovo «## La regola» in ${regola}`);
    scrivi(CERVELLO, fileChiave, `---\ntitle: "Prova"\ntype: fonte\nstatus: draft\n---\n\n# Prova\n\nchiave: ${finta}\n`);
    const r = node('bin/controlla.mjs', ['--json']);
    atteso(!r.out.includes(finta) && !r.err.includes(finta), 'il rapporto stampa il valore della chiave');
    const j = json(r.out, 'controlla.mjs --json');
    const esito = id => (j.controlli || []).find(c => c.id === id)?.esito;
    atteso(esito('c') === 'rosso', `controllo c (caratteri vietati): ${esito('c')}, atteso rosso`);
    atteso(esito('e') === 'rosso', `controllo e (segreti): ${esito('e')}, atteso rosso`);
    uscita(r, 1, 'controlla.mjs con due rossi');
    const s = node('bin/controlla.mjs', ['--segreti', fileChiave]);
    uscita(s, 1, '--segreti sul file con la chiave');
    atteso(!s.out.includes(finta) && !s.err.includes(finta), '--segreti stampa il valore della chiave');
    atteso(/prova-segreto\.md:\d+\s{2,}\S/.test(s.out), `--segreti non dice file e riga: ${riga(s.out)}`);
    return j.testo;
  } finally {
    scrivi(CERVELLO, regola, prima);
    fs.rmSync(path.join(CERVELLO, ...fileChiave.split('/')), { force: true });
  }
});

passo('Ogni hook risponde con JSON valido a un ingresso di prova', () => {
  const hook = (nome, ingresso) => node(`bin/hooks/${nome}.mjs`, [], { input: JSON.stringify(ingresso), timeout: 20000 });
  const risposta = (nome, ingresso, evento) => {
    const r = hook(nome, ingresso);
    uscita(r, 0, nome);
    atteso(/^[\x00-\x7f]*$/.test(r.out), `${nome}: l'uscita non è solo ASCII`);
    const j = json(r.out.trim(), nome);
    atteso(j.hookSpecificOutput && j.hookSpecificOutput.hookEventName === evento, `${nome}: manca hookSpecificOutput per ${evento}`);
    return j.hookSpecificOutput;
  };
  const avvio = risposta('avvio', { hook_event_name: 'SessionStart', source: 'startup' }, 'SessionStart');
  atteso(avvio.additionalContext.includes('wiki/hot.md'), 'avvio: manca il rimando a wiki/hot.md');
  atteso(/Nucleo aggiornato/.test(avvio.additionalContext), `avvio non dice «Nucleo aggiornato»: ${riga(avvio.additionalContext)}`);

  const instrada = risposta('instrada', { hook_event_name: 'UserPromptSubmit', prompt: 'voglio cambiare una regola del cervello' }, 'UserPromptSubmit');
  atteso(instrada.additionalContext.includes('bin/costruisci.mjs'), 'instrada non indica bin/costruisci.mjs');
  const muto = hook('instrada', { prompt: '/chiudi' });
  uscita(muto, 0, 'instrada su un comando /');
  atteso(!muto.out.trim(), 'instrada parla anche sui comandi /');

  const prova = 'wiki/sources/prova-hook.md';
  scrivi(CERVELLO, prova, `---\ntitle: "Prova"\ntype: fonte\nstatus: draft\n---\n\n# Prova\n\nRiga ${LINEETTA_LUNGA} di prova.\n`);
  try {
    const dopo = risposta('dopo-modifica', { hook_event_name: 'PostToolUse', tool_name: 'Write',
      tool_input: { file_path: path.join(CERVELLO, ...prova.split('/')) } }, 'PostToolUse');
    atteso(/lineetta lunga/i.test(dopo.additionalContext) && /riga 9\b/.test(dopo.additionalContext),
      `dopo-modifica non segnala la lineetta lunga alla riga 9: ${riga(dopo.additionalContext)}`);
  } finally { fs.rmSync(path.join(CERVELLO, ...prova.split('/')), { force: true }); }

  const nega = risposta('proteggi', { hook_event_name: 'PreToolUse', tool_name: 'Bash',
    tool_input: { command: 'cat ~/Cervello-Privato/chiavi/telegram-token.txt' } }, 'PreToolUse');
  atteso(nega.permissionDecision === 'deny', 'proteggi non dice deny');
  return 'avvio, instrada, dopo-modifica, proteggi';
});

passo('proteggi nega la lettura di un file delle chiavi e lascia passare git status', () => {
  const hook = (strumento, tool_input) => node('bin/hooks/proteggi.mjs', [],
    { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: strumento, tool_input }), timeout: 20000 });
  const negato = r => { uscita(r, 0, 'proteggi'); return Boolean(r.out.trim()) && json(r.out.trim(), 'proteggi').hookSpecificOutput?.permissionDecision === 'deny'; };
  const fileChiave = path.join(ENV.CERVELLO_CHIAVI_DIR, 'telegram-token.txt');
  const casi = [
    ['Bash', { command: 'cat ~/Cervello-Privato/chiavi/telegram-token.txt' }, true],
    ['Bash', { command: `cat "${fileChiave.replace(/\\/g, '/')}"` }, true],
    ['PowerShell', { command: `Get-Content "${fileChiave}"` }, true],
    ['Bash', { command: 'printenv' }, true],
    ['Bash', { command: 'echo $TELEGRAM_BOT_TOKEN' }, true],
    ['Read', { file_path: fileChiave }, true],
    ['Bash', { command: 'git status' }, false],
    ['PowerShell', { command: 'git status' }, false],
    ['Bash', { command: 'node bin/lib/chiavi.mjs --verifica' }, false],
    ['Read', { file_path: path.join(CERVELLO, 'wiki', 'hot.md') }, false],
  ];
  const sbagliati = casi.filter(([s, ti, deve]) => negato(hook(s, ti)) !== deve)
    .map(([s, ti, deve]) => `${s} ${ti.command || ti.file_path}: ${deve ? 'doveva essere negato' : 'doveva passare'}`);
  atteso(!sbagliati.length, sbagliati.join('; '));
  return `${casi.length} casi`;
});

passo('costruisci.mjs --esporta crea istruzioni-chat.md e i file di conoscenza e dice la misura', () => {
  const r = node('bin/costruisci.mjs', ['--esporta']);
  uscita(r, 0, '--esporta');
  atteso(esiste(CERVELLO, 'esporta/istruzioni-chat.md'), 'esporta/istruzioni-chat.md non c\'è');
  const conoscenza = fs.readdirSync(path.join(CERVELLO, 'esporta')).filter(f => /^conoscenza-.*\.md$/.test(f));
  atteso(conoscenza.length >= 2, `file di conoscenza: ${conoscenza.length}, attesi almeno 2`);
  atteso(conoscenza.includes('conoscenza-01-inizio.md'), 'manca conoscenza-01-inizio.md');
  const m = r.out.match(/istruzioni-chat\.md \(([\d.]+) caratteri\)/);
  atteso(m, `l'uscita non dice la misura di istruzioni-chat.md: ${riga(r.out)}`);
  const misura = fs.readFileSync(path.join(CERVELLO, 'esporta', 'istruzioni-chat.md'), 'utf8').length;
  const avviso = r.out.split(/\r?\n/).find(x => /^Avviso:/.test(x));
  return `istruzioni-chat.md ${misura} caratteri, ${conoscenza.length} file di conoscenza${avviso ? `; ${avviso}` : ''}`;
});

passo('chiavi.mjs --verifica gira e non trova chiavi nella cartella di prova', () => {
  const r = node('bin/lib/chiavi.mjs', ['--verifica']);
  uscita(r, 0, 'chiavi.mjs --verifica');
  atteso(r.out.includes('telegram-token') && r.out.includes('telegram-chat'), `--verifica non elenca le due chiavi: ${riga(r.out)}`);
  const conNome = node('bin/lib/chiavi.mjs', ['--verifica', 'telegram-token']);
  uscita(conNome, 1, 'chiavi.mjs --verifica telegram-token senza chiave');
});

passo('installa-sincronizzazione.mjs senza --fai mostra cosa farebbe', () => {
  const r = node('bin/installa-sincronizzazione.mjs');
  uscita(r, 0, 'installa-sincronizzazione.mjs');
  const atteso1 = { win32: 'schtasks', darwin: 'launchctl', linux: 'crontab' }[process.platform];
  if (atteso1) atteso(r.out.includes(atteso1), `l'uscita non cita ${atteso1}: ${riga(r.out)}`);
  uscita(node('bin/installa-sincronizzazione.mjs', ['--opzione-inventata']), 2, 'opzione sconosciuta');
});

// ---------------------------------------------------------------- sincronizzazione: remoto nudo e due cloni

const REMOTO = path.join(PROVA, 'remoto.git');
const B = path.join(PROVA, 'cervello-b');
const statoA = { CERVELLO_SYNC_DIR: path.join(PROVA, 'stato-a') };
const statoB = { CERVELLO_SYNC_DIR: path.join(PROVA, 'stato-b') };
const sincronizza = (dir, stato, args = []) => node(path.join(dir, 'bin', 'sincronizza.mjs'), args, { cwd: dir, env: stato });
const registro = stato => { try { return fs.readFileSync(path.join(stato.CERVELLO_SYNC_DIR, 'sync.log'), 'utf8'); } catch { return ''; } };
const ultima = stato => registro(stato).trimEnd().split(/\r?\n/).pop() || '';
const nelRemoto = rel => git(['--git-dir', REMOTO, 'cat-file', '-e', `main:${rel}`], { cwd: PROVA }).codice === 0;

const syncPronto = passo('sincronizza.mjs: primo caricamento sul remoto nudo e clone B', () => {
  gitOk(['init', '-q', '--bare', REMOTO], { cwd: PROVA });
  gitOk(['--git-dir', REMOTO, 'symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: PROVA });
  gitOk(['remote', 'add', 'origin', REMOTO]);
  const p = node('bin/sincronizza.mjs', ['--prova'], { env: statoA });
  uscita(p, 0, 'sincronizza.mjs --prova');
  // il giro pianificato (quello dell'attività del computer) scrive anche il battito
  const r = sincronizza(CERVELLO, statoA, ['--pianificato']);
  uscita(r, 0, `giro di A (${ultima(statoA)})`);
  atteso(/primo caricamento/.test(registro(statoA)), `il registro non dice «primo caricamento»: ${ultima(statoA)}`);
  atteso(nelRemoto('AGENTS.md'), 'sul remoto non c\'è AGENTS.md');
  atteso(nelRemoto('automazioni/battiti/sincronizza.txt'), 'il battito di sincronizza non è arrivato sul remoto');
  gitOk(['clone', '-q', REMOTO, B], { cwd: PROVA });
  atteso(esiste(B, 'bin/sincronizza.mjs'), 'il clone B non ha bin/sincronizza.mjs');
  uscita(node(path.join(B, 'bin', 'sincronizza.mjs'), ['--stato'], { cwd: B, env: statoB }), 0, 'sincronizza.mjs --stato su B');
});

const PAGINA = 'wiki/sources/prova-sincronizza.md';
const testoPagina = valore => `---\ntitle: "Prova di sincronizzazione"\ntype: fonte\nstatus: draft\ncreated: 2026-11-03\nupdated: 2026-11-03\n---\n\n# Prova di sincronizzazione\n\nValore: ${valore}\n`;

const passaggio = syncPronto && passo('sincronizza.mjs: una modifica fatta in A arriva in B', () => {
  scrivi(CERVELLO, PAGINA, testoPagina('scritto da A'));
  uscita(sincronizza(CERVELLO, statoA), 0, `giro di A (${ultima(statoA)})`);
  atteso(nelRemoto(PAGINA), `${PAGINA} non è arrivata sul remoto`);
  uscita(sincronizza(B, statoB), 0, `giro di B (${ultima(statoB)})`);
  atteso(esiste(B, PAGINA) && leggi(B, PAGINA).includes('scritto da A'), `${PAGINA} non è arrivata in B`);
});

passaggio && passo('sincronizza.mjs: un file con un possibile segreto resta fuori, anche con la lineetta nel nome', () => {
  const nome = `wiki/sources/riunione ${String.fromCharCode(0x2013)} prova.md`;
  scrivi(CERVELLO, nome, `chiave: ${'sk-ant-' + 'X'.repeat(30)}\n`);
  scrivi(CERVELLO, 'wiki/sources/prova-innocua.md', testoPagina('innocua'));
  uscita(sincronizza(CERVELLO, statoA), 0, `giro di A (${ultima(statoA)})`);
  atteso(!nelRemoto(nome), 'il file con il possibile segreto è arrivato sul remoto');
  atteso(nelRemoto('wiki/sources/prova-innocua.md'), 'la pagina innocua non è arrivata sul remoto');
  atteso(/possibili segreti/.test(registro(statoA)), 'il registro non dice «possibili segreti»');
  fs.rmSync(path.join(CERVELLO, ...nome.split('/')));
  uscita(sincronizza(B, statoB), 0, `giro di B (${ultima(statoB)})`);
});

let ramoConflitto = null;
const conflitto = passaggio && passo('sincronizza.mjs: un conflitto finisce su un ramo conflitto/ e il giro dopo aspetta', () => {
  scrivi(CERVELLO, PAGINA, testoPagina('versione di A'));
  scrivi(B, PAGINA, testoPagina('versione di B'));
  uscita(sincronizza(CERVELLO, statoA), 0, `giro di A (${ultima(statoA)})`);
  const r = sincronizza(B, statoB);
  uscita(r, 1, `giro di B con il conflitto (${ultima(statoB)})`);
  atteso(/CONFLITTO/.test(ultima(statoB)), `il registro di B non dice CONFLITTO: ${ultima(statoB)}`);
  atteso(fs.existsSync(path.join(statoB.CERVELLO_SYNC_DIR, 'conflitto.txt')), 'conflitto.txt non c\'è');
  const rami = git(['--git-dir', REMOTO, 'for-each-ref', '--format=%(refname:short)', 'refs/heads/conflitto/'], { cwd: PROVA }).out.trim().split(/\r?\n/).filter(Boolean);
  atteso(rami.length === 1, `rami conflitto/ sul remoto: ${rami.length}, atteso 1`);
  ramoConflitto = rami[0];
  atteso(!leggi(B, PAGINA).includes('<<<<<<<'), `in B ${PAGINA} è rimasta con i segni del conflitto`);
  // Mentre aspetta, B continua a salvare in locale e non tocca main sul remoto.
  scrivi(B, 'wiki/sources/prova-dopo-conflitto.md', testoPagina('nata in B durante l\'attesa'));
  uscita(sincronizza(B, statoB), 0, `giro di B in attesa (${ultima(statoB)})`);
  atteso(/in attesa/.test(ultima(statoB)), `il registro di B non dice «in attesa»: ${ultima(statoB)}`);
  atteso(!nelRemoto('wiki/sources/prova-dopo-conflitto.md'), 'durante l\'attesa B ha caricato su main');
  const avvio = node(path.join(B, 'bin', 'hooks', 'avvio.mjs'), [], { cwd: B, env: statoB, input: '{"source":"startup"}', timeout: 20000 });
  atteso(avvio.out.includes('conflitto/'), 'l\'hook avvio di B non mostra il ramo di conflitto');
  return ramoConflitto;
});

conflitto && passo('sincronizza.mjs: dopo l\'unione del ramo il giro di B riprende', () => {
  // L'unione la fa il Custode o l'utente: qui la fa la prova, nel clone A.
  gitOk(['fetch', '-q', 'origin']);
  const m = git(['merge', '--no-ff', '--no-edit', `origin/${ramoConflitto}`]);
  atteso(m.codice !== 0, 'l\'unione doveva andare in conflitto');
  scrivi(CERVELLO, PAGINA, testoPagina('versione di A e versione di B, unite'));
  gitOk(['add', PAGINA]);
  gitOk(['commit', '-q', '--no-edit']);
  gitOk(['push', '-q', 'origin', 'main']);
  const r = sincronizza(B, statoB);
  uscita(r, 0, `giro di B dopo l'unione (${ultima(statoB)})`);
  atteso(/conflitto chiuso/.test(registro(statoB)), `il registro di B non dice «conflitto chiuso»: ${ultima(statoB)}`);
  atteso(!fs.existsSync(path.join(statoB.CERVELLO_SYNC_DIR, 'conflitto.txt')), 'conflitto.txt è rimasto');
  atteso(nelRemoto('wiki/sources/prova-dopo-conflitto.md'), 'il lavoro fatto da B durante l\'attesa non è arrivato sul remoto');
  uscita(sincronizza(CERVELLO, statoA), 0, `giro di A (${ultima(statoA)})`);
  atteso(esiste(CERVELLO, 'wiki/sources/prova-dopo-conflitto.md'), 'il lavoro di B non è arrivato in A');
  atteso(leggi(B, PAGINA).includes('unite'), 'B non ha la versione unita');
  const testaA = gitOk(['rev-parse', 'HEAD']);
  const testaB = gitOk(['rev-parse', 'HEAD'], { cwd: B });
  atteso(testaA === testaB, 'A e B non sono allineati');
});

// ---------------------------------------------------------------- riepilogo

const errori = esiti.filter(e => !e.ok).length;
console.log(`\n${esiti.length - errori} passi OK, ${errori} in ERRORE. Cartella di prova: ${PROVA}`);
process.exit(errori ? 1 : 0);
