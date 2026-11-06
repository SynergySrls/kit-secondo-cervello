#!/usr/bin/env node
// Sincronizza il cervello con il suo repository Git remoto: salva le modifiche fatte su questo computer (commit),
// scarica quelle arrivate da altrove (routine, altri computer), rimette sopra le proprie e carica tutto (push).
// Pensato per girare nascosto ogni pochi minuti (lo pianifica bin/installa-sincronizzazione.mjs): non apre finestre
// e non fa domande. Se manca la rete o l'accesso, il giro fallisce e riprova al successivo.
// Pagina: wiki/entities/strumenti/sincronizza.md · Registro: wiki/meta/strumenti.md
//
// Uso:
//   node bin/sincronizza.mjs              un giro completo, con l'esito sullo schermo (a mano o da un agente)
//   node bin/sincronizza.mjs --pianificato un giro lanciato dall'attività pianificata: niente sullo schermo e, sul
//                                         computer principale, il battito del giorno (lo mette installa-sincronizzazione)
//   node bin/sincronizza.mjs --prova      tutti i controlli, senza commit e senza rete (non tocca l'indice di Git)
//   node bin/sincronizza.mjs --pausa      mette in pausa i giri (per spostamenti o lavori lunghi sui file)
//   node bin/sincronizza.mjs --riprendi   toglie la pausa
//   node bin/sincronizza.mjs --secondario segna questo computer come secondario (niente battito); --principale lo toglie
//   node bin/sincronizza.mjs --stato      ultime righe del registro, lock, pausa, conflitto aperto
//   node bin/sincronizza.mjs --aiuto      questo aiuto
// Codici d'uscita: 0 giro in ordine (anche «in pausa» o «in attesa che un conflitto venga unito»), 1 giro fermo o
// non riuscito (il motivo è nel registro sync.log), 2 opzione sconosciuta.
//
// Impostazioni: sezione «sincronizza» di bin/impostazioni.json (ramo, prefissoConflitti, minuti, pausaOre,
// lockMinuti, maxMB); se il file manca valgono main, conflitto/, 10, 3, 15, 50. Un file più grande di maxMB
// megabyte resta fuori dal commit (GitHub rifiuta i file oltre 100 MB e il caricamento si bloccherebbe).
//
// Cartella di stato, fuori dal cervello: ~/.cervello-sync/<nome della cartella del cervello>/. La variabile
// d'ambiente CERVELLO_SYNC_DIR, se impostata, la sostituisce per intero (serve alle prove; gli hook in bin/hooks/
// leggono la stessa variabile per trovare pausa, sync.log e da-riprendere.md). Contiene:
//   sync.log          registro dei giri (oltre 2 MB diventa sync.log.1)
//   sync.lock         PID e ora del giro in corso; vale solo se il processo è vivo e ha meno di lockMinuti
//   pausa             se è più giovane di pausaOre il giro esce subito; se è più vecchio si ignora e si toglie
//   conflitto.txt     ramo di parcheggio, punta e giri di attesa di un conflitto aperto (una voce per riga)
//   secondario        file vuoto messo a mano sui computer secondari: lì non si scrive il battito
//   da-riprendere.md  facoltativo, non lo scrive questo script: lo legge l'hook di avvio (un lavoro da chiudere)
//
// Un giro, in ordine: pausa; lock; Git senza domande (GIT_TERMINAL_PROMPT=0, GCM_INTERACTIVE=never); se c'è un
// rebase o un merge a metà, o un file con un conflitto non risolto, si ferma; battito
// automazioni/battiti/sincronizza.txt al primo giro pianificato del giorno (non sui computer secondari); git add -A;
// i file oltre maxMB e quelli in cui node bin/controlla.mjs --segreti trova qualcosa restano fuori dal commit
// (git reset), con una riga nel registro (se il controllo non risponde, resta fuori tutto il lotto); commit «Sync
// automatico da <computer>, AAAA-MM-GG HH:MM»; senza remoto si ferma; fetch; conflitto parcheggiato: se il ramo è
// stato unito in origin/<ramo> riprende con rebase --onto (se anche questo va in conflitto, parcheggia di nuovo),
// altrimenti aspetta senza toccare <ramo>; pull --rebase --autostash; se va in conflitto: rebase --abort, ramo
// <prefissoConflitti><computer>-AAAAMMGG-HHMM sulla punta, push di quel ramo, conflitto.txt, uscita 1; push; se
// rimettendo a posto i file tenuti fuori Git lascia un conflitto, il giro carica i commit e poi si ferma.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DUE_MB = 2 * 1024 * 1024;
const LOTTO = 60; // file per ogni chiamata al controllo dei segreti (la riga di comando di Windows ha un limite)

const AIUTO = `Sincronizza il cervello con il repository Git remoto (commit, pull --rebase, push).

  node bin/sincronizza.mjs               un giro completo, con l'esito sullo schermo
  node bin/sincronizza.mjs --pianificato un giro dall'attività pianificata (niente schermo, scrive il battito)
  node bin/sincronizza.mjs --prova       tutti i controlli, senza commit e senza rete
  node bin/sincronizza.mjs --pausa       mette in pausa i giri
  node bin/sincronizza.mjs --riprendi    toglie la pausa
  node bin/sincronizza.mjs --secondario  segna questo computer come secondario (--principale lo toglie)
  node bin/sincronizza.mjs --stato       registro, lock, pausa, conflitto
  node bin/sincronizza.mjs --aiuto       questo aiuto

Cartella di stato: ~/.cervello-sync/<nome della cartella>/ (oppure CERVELLO_SYNC_DIR).
Pianificazione: node bin/installa-sincronizzazione.mjs. Pagina: wiki/entities/strumenti/sincronizza.md`;

// ---------------------------------------------------------------- impostazioni e cartella di stato

function leggiImpostazioni() {
  try {
    const testo = fs.readFileSync(path.join(RADICE, 'bin', 'impostazioni.json'), 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(testo) || {};
  } catch { return {}; }
}

const IMP = { ramo: 'main', prefissoConflitti: 'conflitto/', minuti: 10, pausaOre: 3, lockMinuti: 15, maxMB: 50,
  ...(leggiImpostazioni().sincronizza || {}) };

// Stessa regola in bin/hooks/comune.mjs: se si cambia qui, si cambia anche lì.
function cartellaStato() {
  const v = (process.env.CERVELLO_SYNC_DIR || '').trim();
  return v ? path.resolve(v) : path.join(os.homedir(), '.cervello-sync', path.basename(RADICE));
}

const STATO = cartellaStato();
const F = {
  log: path.join(STATO, 'sync.log'),
  lock: path.join(STATO, 'sync.lock'),
  pausa: path.join(STATO, 'pausa'),
  conflitto: path.join(STATO, 'conflitto.txt'),
  secondario: path.join(STATO, 'secondario'),
  indiceProva: path.join(STATO, 'indice-prova'),
};

// ---------------------------------------------------------------- piccoli aiuti

let prova = false;
let pianificato = false; // lanciato dall'attività pianificata: niente sullo schermo (cron manderebbe una mail)
let eco = true;

class Fermo extends Error {} // giro fermo: serve un intervento, il registro dice quale

const esiste = p => { try { fs.statSync(p); return true; } catch { return false; } };
const leggiTesto = p => { try { return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''); } catch { return null; } };

function adesso(d = new Date()) {
  const due = n => String(n).padStart(2, '0');
  const data = `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
  const ora = `${due(d.getHours())}:${due(d.getMinutes())}`;
  return { data, ora, completa: `${data} ${ora}:${due(d.getSeconds())}`, compatta: `${data.replace(/-/g, '')}-${ora.replace(':', '')}` };
}

function scrivi(msg) {
  const riga = `${adesso().completa}  ${prova ? '[prova] ' : ''}${msg}`;
  try { fs.appendFileSync(F.log, riga + '\n', 'utf8'); } catch { /* registro non scrivibile: si va avanti */ }
  if (eco) console.log(riga);
}

// Prima riga utile di un messaggio di Git, senza eventuali credenziali scritte dentro un indirizzo.
function primaRiga(testo) {
  const r = String(testo || '').split(/\r?\n/).map(s => s.trim()).find(Boolean) || '';
  return r.replace(/\/\/[^/@\s]+@/g, '//***@').slice(0, 200);
}

const nomeComputer = () => String(process.env.COMPUTERNAME || os.hostname() || 'computer').replace(/\.local$/i, '');
const perRamo = s => s.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'computer';

// Git senza finestre e senza domande: se manca l'accesso il comando fallisce invece di aspettare.
const envGit = { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', GIT_MERGE_AUTOEDIT: 'no',
  SSH_ASKPASS_REQUIRE: 'never' };
if (process.platform !== 'win32') {
  // Da cron e launchd il PATH è corto: si aggiungono i posti soliti di git.
  const parti = (envGit.PATH || '').split(':').filter(Boolean);
  for (const d of ['/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']) if (!parti.includes(d)) parti.push(d);
  envGit.PATH = parti.join(':');
}

function git(args, { timeout = 120000 } = {}) {
  const r = spawnSync('git', args, { cwd: RADICE, env: envGit, encoding: 'utf8', timeout, windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  if (r.error && r.error.code === 'ENOENT') throw new Fermo('git non trovato su questo computer: va installato');
  return { codice: r.status === null ? -1 : r.status, out: r.stdout || '', err: r.stderr || '' };
}

const conta = intervallo => {
  const r = git(['rev-list', '--count', intervallo]);
  return r.codice === 0 ? parseInt(r.out.trim(), 10) || 0 : null;
};

// ---------------------------------------------------------------- lock

const processoVivo = pid => {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};

function statoLock() {
  const testo = leggiTesto(F.lock);
  if (testo === null) return null;
  const pid = parseInt(testo.split(/\r?\n/)[0], 10);
  let eta = Infinity;
  try { eta = Date.now() - fs.statSync(F.lock).mtimeMs; } catch { /* sparito nel frattempo */ }
  return { pid, vivo: Number.isInteger(pid) && pid > 0 && processoVivo(pid), recente: eta < IMP.lockMinuti * 60000, eta };
}

let lockPreso = false;
function prendiLock() {
  for (let tentativo = 0; tentativo < 2; tentativo++) {
    try {
      const fd = fs.openSync(F.lock, 'wx'); // creazione esclusiva: due giri insieme non la ottengono entrambi
      fs.writeSync(fd, `${process.pid}\n${new Date().toISOString()}\n`);
      fs.closeSync(fd);
      lockPreso = true;
      return true;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      const s = statoLock();
      if (s && s.vivo && s.recente) return false;
      scrivi('lock orfano rimosso');
      try { fs.unlinkSync(F.lock); } catch { /* già tolto */ }
    }
  }
  return false;
}

function rilasciaLock() {
  if (lockPreso) { try { fs.unlinkSync(F.lock); } catch { /* già tolto */ } }
}

// ---------------------------------------------------------------- controllo dei segreti

// Restituisce i file (fra quelli passati) in cui bin/controlla.mjs --segreti trova qualcosa. Il controllo risponde in
// JSON con la posizione dei file nell'elenco passato, così un nome con caratteri particolari non si perde. Ogni
// risposta che non si capisce (tempo scaduto, errore, posizioni che non tornano) tiene fuori tutto il lotto: meglio
// rimandare un salvataggio che caricare un segreto.
function controllaSegreti(files) {
  const script = path.join(RADICE, 'bin', 'controlla.mjs');
  if (!esiste(script)) { scrivi('bin/controlla.mjs assente: controllo dei segreti saltato'); return []; }
  const trovati = new Set();
  for (let i = 0; i < files.length; i += LOTTO) {
    const lotto = files.slice(i, i + LOTTO);
    const r = spawnSync(process.execPath, [script, '--json', '--segreti', ...lotto], { cwd: RADICE, encoding: 'utf8',
      timeout: 120000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
    if (r.status === 0) continue;
    const fuoriTutti = motivo => { lotto.forEach(f => trovati.add(f)); scrivi(`${motivo}: tutto il lotto (${lotto.length} file) resta fuori dal commit per prudenza`); };
    if (r.status !== 1) { fuoriTutti(`controllo dei segreti non riuscito (codice ${r.status === null ? 'tempo scaduto' : r.status})`); continue; }
    let esito = null;
    try { esito = JSON.parse(r.stdout); } catch { /* risposta non in JSON: un errore del controllore */ }
    const indici = esito && Array.isArray(esito.indici) ? esito.indici.filter(n => Number.isInteger(n) && n >= 0 && n < lotto.length) : [];
    if (!esito || !indici.length || (esito.indici.length !== indici.length)) {
      const righeErr = String(r.stderr || '').split(/\r?\n/);
      const errore = righeErr.find(s => /^\s*\w*Error\b/.test(s)) || righeErr.find(s => /Error/.test(s));
      fuoriTutti(errore ? `controllo dei segreti in errore (${primaRiga(errore)})` : 'controllo dei segreti: trovato qualcosa ma non si capisce in quale file');
      continue;
    }
    indici.forEach(n => trovati.add(lotto[n]));
  }
  return [...trovati];
}

// ---------------------------------------------------------------- messaggi per i casi che chiedono un intervento

function messaggioNonUniti(file) {
  const elenco = file.slice(0, 5).join(', ') + (file.length > 5 ? ` e altri ${file.length - 5}` : '');
  return `file con un conflitto non risolto (${elenco}): aprili, scegli il testo giusto e togli i segni <<<<<<<, ======= ` +
    'e >>>>>>>, poi git add <file>; se git stash list mostra una voce «autostash», è la copia locale messa da parte: ' +
    'quando il file è a posto, git stash drop. Finché resta, la sincronizzazione non salva niente';
}

// Il remoto rifiuta il caricamento per la misura (GitHub: errore GH001, file oltre 100 MB)?
const rifiutoMisura = testo => /GH001|exceeds|too large|larger than|file size limit|maximum allowed size/i.test(String(testo || ''));
function messaggioMisura(err) {
  return `il remoto rifiuta il caricamento perché un file è troppo grande (${primaRiga(err)}). Il file è già nei commit ` +
    `di questo computer, quindi anche cancellarlo non basta: git reset --soft origin/${IMP.ramo} (rimette le modifiche da ` +
    'salvare senza perderle), sposta il file fuori dal cervello o aggiungilo a .gitignore, poi lascia ripartire la sincronizzazione';
}

// ---------------------------------------------------------------- il giro

function giro() {
  const fatto = [];
  const t = adesso();

  // La cartella del cervello deve essere la radice di un repository Git (mai il repository di una cartella sopra).
  const top = git(['rev-parse', '--show-toplevel']);
  if (top.codice !== 0) throw new Fermo('la cartella del cervello non è un repository Git (git init, poi git remote add origin <indirizzo>; ' +
    'se il cervello sta in un archivio cloud per scelta, strada D, la sincronizzazione non si usa: niente git init in quella cartella)');
  const vero = p => { try { return fs.realpathSync.native(p); } catch { return path.resolve(p); } }; // link e nomi brevi
  const uguali = (a, b) => process.platform === 'win32' || process.platform === 'darwin'
    ? vero(a).toLowerCase() === vero(b).toLowerCase() : vero(a) === vero(b);
  if (!uguali(top.out.trim(), RADICE)) throw new Fermo(`la cartella del cervello non è la radice del repository Git trovato (${top.out.trim()})`);

  // Un rebase, un merge o un cherry-pick a metà non si toccano: serve un intervento a mano.
  const gitDir = path.resolve(RADICE, git(['rev-parse', '--git-dir']).out.trim());
  const aMeta = { 'rebase-merge': 'un rebase', 'rebase-apply': 'un rebase', MERGE_HEAD: 'un merge',
    CHERRY_PICK_HEAD: 'un cherry-pick', REVERT_HEAD: 'un revert' };
  for (const [f, cosa] of Object.entries(aMeta)) {
    if (esiste(path.join(gitDir, f))) throw new Fermo(`${cosa} in sospeso nel repository: serve un intervento a mano (git status nella cartella del cervello)`);
  }
  // Un file con un conflitto non risolto (segni <<<<<<< e >>>>>>> dentro) non si salva mai: git add -A lo darebbe per
  // risolto e lo porterebbe su tutti i computer.
  const nonUniti = () => [...new Set(git(['-c', 'core.quotepath=off', 'ls-files', '-u']).out.split(/\r?\n/)
    .map(r => r.split('\t')[1]).filter(Boolean))];
  const conflittiAperti = nonUniti();
  if (conflittiAperti.length) throw new Fermo(messaggioNonUniti(conflittiAperti));

  const ramoAttuale = git(['symbolic-ref', '--short', '-q', 'HEAD']).out.trim();
  if (ramoAttuale !== IMP.ramo) {
    // Se il ramo giusto non esiste ancora (repository nato con un altro nome, per esempio master), si rinomina.
    const esisteRamo = git(['rev-parse', '--verify', '-q', `refs/heads/${IMP.ramo}`]).codice === 0;
    const comando = esisteRamo ? `git switch ${IMP.ramo}` : `git branch -m ${IMP.ramo}, che rinomina il ramo attuale`;
    throw new Fermo(ramoAttuale
      ? `il cervello è sul ramo ${ramoAttuale}, la sincronizzazione lavora solo su ${IMP.ramo} (${comando})`
      : `il repository non è su un ramo (HEAD staccato): si torna su ${IMP.ramo} con git switch ${IMP.ramo}`);
  }
  const haCommit = () => git(['rev-parse', '--verify', '-q', 'HEAD']).codice === 0;

  // In prova si lavora su una copia dell'indice: quello vero (e ciò che l'utente ha già preparato) resta com'è.
  if (prova) {
    const indice = path.resolve(RADICE, git(['rev-parse', '--git-path', 'index']).out.trim());
    fs.rmSync(F.indiceProva, { force: true });
    if (esiste(indice)) fs.copyFileSync(indice, F.indiceProva);
    envGit.GIT_INDEX_FILE = F.indiceProva;
    if (!esiste(indice) && haCommit()) git(['read-tree', 'HEAD']);
  }

  // 1. Battito: una riga al primo giro pianificato del giorno, solo sul computer principale (due scrittori litigano).
  // Dice che la sincronizzazione automatica è viva: i giri lanciati a mano non lo scrivono.
  const secondario = esiste(F.secondario);
  const fBattito = path.join(RADICE, 'automazioni', 'battiti', 'sincronizza.txt');
  if (pianificato && !secondario && !(leggiTesto(fBattito) || '').startsWith(t.data)) {
    fs.mkdirSync(path.dirname(fBattito), { recursive: true });
    fs.writeFileSync(fBattito, `${t.data} ${t.ora} esito: ok\n`, 'utf8');
  }

  // 2. Prepara le modifiche e tiene fuori i file troppo grandi e quelli con possibili segreti.
  const add = git(['add', '-A']);
  if (add.codice !== 0) { scrivi(`git add non riuscito, riprovo al prossimo giro: ${primaRiga(add.err)}`); return 1; }
  const togliDalCommit = elenco => {
    for (let i = 0; i < elenco.length; i += LOTTO) {
      const lotto = elenco.slice(i, i + LOTTO);
      if (haCommit()) git(['--literal-pathspecs', 'reset', '-q', '--', ...lotto]);
      else git(['--literal-pathspecs', 'rm', '--cached', '-q', '--', ...lotto]);
    }
  };
  let inUscita = git(['diff', '--cached', '--name-only', '--diff-filter=AMR', '-z']).out.split('\0').filter(Boolean);
  const maxByte = (Number(IMP.maxMB) > 0 ? Number(IMP.maxMB) : 50) * 1024 * 1024;
  const grandi = inUscita.filter(f => { try { return fs.statSync(path.join(RADICE, f)).size > maxByte; } catch { return false; } });
  if (grandi.length) {
    togliDalCommit(grandi);
    scrivi(`file più grandi di ${IMP.maxMB} MB lasciati fuori dal commit (spostali fuori dal cervello o aggiungili a .gitignore): ${grandi.join(', ')}`);
    inUscita = inUscita.filter(f => !grandi.includes(f));
  }
  if (inUscita.length) {
    const sospetti = controllaSegreti(inUscita);
    togliDalCommit(sospetti);
    if (sospetti.length) scrivi(`possibili segreti, file lasciati fuori dal commit: ${sospetti.join(', ')}`);
  }

  // 3. Commit.
  if (git(['diff', '--cached', '--quiet']).codice === 1) {
    if (prova) {
      const n = git(['diff', '--cached', '--name-only', '-z']).out.split('\0').filter(Boolean).length;
      scrivi(`ci sono ${n} file da salvare (in prova non si fa il commit)`);
    } else {
      const c = git(['commit', '-q', '-m', `Sync automatico da ${nomeComputer()}, ${t.data} ${t.ora}`]);
      if (c.codice !== 0) throw new Fermo(`commit non riuscito: ${primaRiga(c.err || c.out)}`);
      fatto.push('modifiche salvate');
    }
  }

  // 4. Senza remoto ci si ferma qui.
  const remoti = git(['remote']).out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!remoti.includes('origin')) {
    scrivi(remoti.length ? `nessun remoto «origin» (ci sono: ${remoti.join(', ')}): solo salvataggio locale`
      : 'nessun remoto configurato: solo salvataggio locale');
    return 0;
  }
  if (!haCommit()) { scrivi('il repository non ha ancora commit: niente da caricare'); return 0; }

  // 5. Fetch (in prova niente rete: si usa l'ultimo fetch).
  if (!prova) {
    const f = git(['fetch', '-q', 'origin'], { timeout: 300000 });
    if (f.codice !== 0) { scrivi(`fetch non riuscito (rete o permessi), riprovo al prossimo giro: ${primaRiga(f.err)}`); return 1; }
  }
  const remotoRamo = `refs/remotes/origin/${IMP.ramo}`;
  if (git(['rev-parse', '--verify', '-q', remotoRamo]).codice !== 0) {
    // Remoto nuovo e vuoto: primo caricamento.
    if (prova) { scrivi(`sul remoto non c'è ancora il ramo ${IMP.ramo}: al giro vero si caricherebbe`); return 0; }
    // -u collega il ramo locale a quello remoto: così anche git pull e git push scritti a mano sanno dove andare.
    const p = git(['push', '-q', '-u', 'origin', IMP.ramo], { timeout: 300000 });
    if (p.codice !== 0) {
      if (rifiutoMisura(p.err)) throw new Fermo(messaggioMisura(p.err));
      scrivi(`primo caricamento non riuscito, riprovo al prossimo giro: ${primaRiga(p.err)}`);
      return 1;
    }
    scrivi(`giro ok: primo caricamento del ramo ${IMP.ramo} sul remoto`);
    return 0;
  }
  // Ramo locale non ancora collegato a quello remoto (primo caricamento fatto a mano senza -u): si collega.
  if (!prova && git(['rev-parse', '--abbrev-ref', `${IMP.ramo}@{upstream}`]).codice !== 0) {
    git(['branch', '-q', `--set-upstream-to=origin/${IMP.ramo}`, IMP.ramo]);
  }

  // Parcheggia i commit di questo computer su un ramo a parte del remoto: <ramo> non si tocca finché non è unito.
  const parcheggia = (motivo) => {
    const punta = git(['rev-parse', 'HEAD']).out.trim();
    const ramoC = `${IMP.prefissoConflitti}${perRamo(nomeComputer())}-${t.compatta}`;
    git(['branch', '-f', ramoC, punta]);
    const p = git(['push', '-q', 'origin', ramoC], { timeout: 300000 });
    if (p.codice !== 0) {
      git(['branch', '-D', ramoC]);
      scrivi(`${motivo} e ramo di parcheggio non caricato, riprovo al prossimo giro: ${primaRiga(p.err)}`);
      return 1;
    }
    fs.writeFileSync(F.conflitto, `${ramoC}\n${punta}\n0\n`, 'utf8');
    scrivi(`${motivo}: i commit di questo computer sono sul ramo ${ramoC} del remoto; ${IMP.ramo} non si tocca finché quel ramo non viene unito`);
    return 1;
  };

  // 6. Conflitto parcheggiato in un giro precedente.
  if (esiste(F.conflitto)) {
    const [ramoC = '', punta = '', attese0 = '0'] = (leggiTesto(F.conflitto) || '').split(/\r?\n/).map(s => s.trim());
    if (!ramoC || !/^[0-9a-f]{7,64}$/i.test(punta)) throw new Fermo(`conflitto.txt illeggibile in ${STATO}: va controllato a mano`);
    const unito = git(['merge-base', '--is-ancestor', punta, remotoRamo]);
    if (unito.codice === 1) {
      const attese = (parseInt(attese0, 10) || 0) + 1;
      if (!prova) fs.writeFileSync(F.conflitto, `${ramoC}\n${punta}\n${attese}\n`, 'utf8');
      scrivi(`in attesa che il ramo ${ramoC} venga unito in ${IMP.ramo}: ${IMP.ramo} non si tocca (giro ${attese})`);
      return 0;
    }
    if (unito.codice !== 0) throw new Fermo(`il commit ${punta} del ramo ${ramoC} non si trova più: serve un intervento (conflitto.txt in ${STATO})`);
    if (prova) { scrivi(`il ramo ${ramoC} risulta unito: al giro vero la sincronizzazione ripartirebbe`); return 0; }
    // Il ramo è stato unito: si rimettono sopra origin/<ramo> solo i commit fatti qui dopo la punta parcheggiata.
    const r = git(['rebase', '-q', '--autostash', '--onto', remotoRamo, punta, IMP.ramo], { timeout: 300000 });
    if (r.codice !== 0) {
      // Anche i commit fatti durante l'attesa vanno in conflitto con il remoto: si parcheggiano su un ramo nuovo,
      // come al primo conflitto, invece di fermarsi per sempre.
      git(['rebase', '--abort']);
      fs.rmSync(F.conflitto, { force: true });
      return parcheggia(`CONFLITTO anche dopo l'unione di ${ramoC}`);
    }
    fs.rmSync(F.conflitto, { force: true });
    scrivi(`conflitto chiuso: ${ramoC} è stato unito in ${IMP.ramo}, la sincronizzazione riparte`);
    fatto.push('conflitto chiuso');
  }

  if (prova) {
    const avanti = conta(`${remotoRamo}..HEAD`), indietro = conta(`HEAD..${remotoRamo}`);
    scrivi(`prova finita: ${avanti ?? '?'} commit da caricare, ${indietro ?? '?'} da scaricare secondo l'ultimo fetch (niente scaricato né caricato)`);
    return 0;
  }

  // 7. Scarica il lavoro arrivato da altrove e rimette sopra il proprio.
  const daScaricare = conta(`HEAD..${remotoRamo}`) || 0;
  const pull = git(['pull', '--rebase', '--autostash', '-q', 'origin', IMP.ramo], { timeout: 300000 });
  if (pull.codice !== 0) {
    const inRebase = esiste(path.join(gitDir, 'rebase-merge')) || esiste(path.join(gitDir, 'rebase-apply'));
    if (!inRebase) { scrivi(`pull non riuscito, riprovo al prossimo giro: ${primaRiga(pull.err)}`); return 1; }
    // Conflitto vero: il lavoro di questo computer va su un ramo a parte e <ramo> non si tocca finché non è unito.
    git(['rebase', '--abort']);
    return parcheggia('CONFLITTO nel pull');
  }
  if (daScaricare) fatto.push(`${daScaricare} commit ${daScaricare === 1 ? 'scaricato' : 'scaricati'}`);
  // Il pull mette da parte i file tenuti fuori dal commit e poi li rimette: se nel frattempo il remoto ha cambiato
  // gli stessi file, Git lascia un conflitto ma esce senza errore. I commit si caricano lo stesso, poi ci si ferma.
  const dopoPull = nonUniti();

  // 8. Carica.
  const daCaricare = conta(`${remotoRamo}..HEAD`);
  if (daCaricare === null || daCaricare > 0) {
    const p = git(['push', '-q', 'origin', IMP.ramo], { timeout: 300000 });
    if (p.codice !== 0) {
      if (rifiutoMisura(p.err)) throw new Fermo(messaggioMisura(p.err));
      scrivi(`push non riuscito (rete o permessi), riprovo al prossimo giro: ${primaRiga(p.err)}`);
      return 1;
    }
    fatto.push(daCaricare ? `${daCaricare} commit ${daCaricare === 1 ? 'caricato' : 'caricati'}` : 'caricato');
  }
  if (dopoPull.length) throw new Fermo(`${fatto.length ? `${fatto.join(', ')}; ma ` : ''}${messaggioNonUniti(dopoPull)}`);

  scrivi(`giro ok: ${fatto.length ? fatto.join(', ') : 'niente di nuovo'}`);
  return 0;
}

// ---------------------------------------------------------------- comandi semplici

function minutiDa(ms) { return Math.max(0, Math.round(ms / 60000)); }

function mostraStato() {
  console.log(`Cervello:          ${RADICE}`);
  console.log(`Cartella di stato: ${STATO}${process.env.CERVELLO_SYNC_DIR ? ' (da CERVELLO_SYNC_DIR)' : ''}`);
  console.log(`Ramo:              ${IMP.ramo} (rami di conflitto: ${IMP.prefissoConflitti}...)`);
  console.log(`Computer:          ${esiste(F.secondario) ? 'secondario (niente battito)' : 'principale (scrive il battito)'}`);
  let pausa = 'no';
  try {
    const eta = Date.now() - fs.statSync(F.pausa).mtimeMs;
    pausa = eta < IMP.pausaOre * 3600000 ? `sì, da ${minutiDa(eta)} minuti (si ignora dopo ${IMP.pausaOre} ore; --riprendi la toglie)`
      : `file scaduto (più vecchio di ${IMP.pausaOre} ore): si toglie al prossimo giro`;
  } catch { /* nessuna pausa */ }
  console.log(`Pausa:             ${pausa}`);
  const l = statoLock();
  console.log(`Giro in corso:     ${!l ? 'no' : l.vivo && l.recente ? `sì (PID ${l.pid}, da ${minutiDa(l.eta)} minuti)` : `lock orfano (PID ${l.pid}): si toglie al prossimo giro`}`);
  const c = leggiTesto(F.conflitto);
  if (c) {
    const [ramoC, punta, attese] = c.split(/\r?\n/).map(s => s.trim());
    console.log(`Conflitto:         ramo ${ramoC}, punta ${String(punta || '').slice(0, 10)}, giri di attesa ${attese || 0}: va unito in ${IMP.ramo}`);
  } else console.log('Conflitto:         nessuno');
  const log = leggiTesto(F.log);
  const righe = log ? log.trimEnd().split(/\r?\n/).slice(-15) : [];
  console.log(`\nUltime righe di sync.log${righe.length ? ':' : ': nessuna (la sincronizzazione non è ancora partita)'}`);
  for (const r of righe) console.log(`  ${r}`);
  return 0;
}

function main(argv) {
  const OPZIONI = ['--prova', '--pianificato', '--pausa', '--riprendi', '--secondario', '--principale', '--stato', '--aiuto', '-h', '--help'];
  const ignote = argv.filter(a => !OPZIONI.includes(a));
  if (ignote.length || argv.length > 1) {
    console.error(ignote.length ? `Opzione sconosciuta: ${ignote.join(' ')}` : 'Una sola opzione per volta.');
    console.error('Vedi: node bin/sincronizza.mjs --aiuto');
    return 2;
  }
  const op = argv[0] || '';
  if (['--aiuto', '-h', '--help'].includes(op)) { console.log(AIUTO); return 0; }

  try { fs.mkdirSync(STATO, { recursive: true }); } catch (e) {
    console.error(`Cartella di stato non creabile (${STATO}): ${e.message}`);
    return 1;
  }
  try { if (fs.statSync(F.log).size > DUE_MB) fs.renameSync(F.log, F.log + '.1'); } catch { /* registro assente */ }

  if (op === '--stato') return mostraStato();
  if (op === '--pausa') {
    eco = true;
    fs.writeFileSync(F.pausa, `${adesso().completa}\n`, 'utf8');
    scrivi(`pausa messa a mano: i giri ripartono con --riprendi o da soli dopo ${IMP.pausaOre} ore`);
    return 0;
  }
  if (op === '--riprendi') {
    eco = true;
    if (esiste(F.pausa)) { fs.rmSync(F.pausa, { force: true }); scrivi('pausa tolta: la sincronizzazione riparte al prossimo giro'); }
    else console.log('Non c\'era nessuna pausa.');
    return 0;
  }
  if (op === '--secondario') {
    fs.writeFileSync(F.secondario, '', 'utf8');
    scrivi('questo computer è segnato come secondario: qui non si scrive il battito (--principale lo toglie)');
    return 0;
  }
  if (op === '--principale') {
    fs.rmSync(F.secondario, { force: true });
    scrivi('questo computer è segnato come principale: qui si scrive il battito della sincronizzazione');
    return 0;
  }

  prova = op === '--prova';
  pianificato = op === '--pianificato';
  eco = !pianificato;

  // Pausa: se il file è recente il giro non fa niente; se è vecchio si toglie (una pausa dimenticata non ferma tutto).
  if (esiste(F.pausa)) {
    let eta = 0;
    try { eta = Date.now() - fs.statSync(F.pausa).mtimeMs; } catch { /* sparito */ }
    if (eta < IMP.pausaOre * 3600000) { scrivi(`in pausa da ${minutiDa(eta)} minuti (file pausa nella cartella di stato)`); return 0; }
    scrivi(`file di pausa più vecchio di ${IMP.pausaOre} ore: ignorato${prova ? '' : ' e tolto'}, la sincronizzazione riparte`);
    if (!prova) fs.rmSync(F.pausa, { force: true });
  }

  // Un solo giro alla volta.
  if (!prendiLock()) { if (eco) console.log('Un altro giro è in corso: questo esce senza fare niente.'); return 0; }
  try {
    return giro();
  } catch (e) {
    scrivi(e instanceof Fermo ? `FERMO: ${e.message}` : `FERMO: errore inatteso (${primaRiga(e && e.message)})`);
    return 1;
  } finally {
    if (prova) fs.rmSync(F.indiceProva, { force: true });
    rilasciaLock();
  }
}

process.exitCode = main(process.argv.slice(2));
