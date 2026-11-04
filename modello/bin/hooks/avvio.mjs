#!/usr/bin/env node
// Hook SessionStart: all'avvio di Claude Code nel cervello mette nel contesto, in poche righe, lo stato del cervello:
//   1. data dell'ultimo aggiornamento di wiki/hot.md (la più recente fra «updated» e le voci di «In corso adesso»);
//   2. esito di node bin/costruisci.mjs --verifica (nucleo aggiornato o no);
//   3. i rossi dei controlli: node bin/controlla.mjs --json lanciato adesso (tetto di 4 secondi); se non finisce in
//      tempo, le righe ROSSO di wiki/meta/stato-controlli.md con la data del rapporto, e se è vecchio lo dice;
//   4. rami di conflitto della sincronizzazione non ancora uniti (git for-each-ref, solo locale, niente rete);
//   5. sincronizzazione in pausa, oppure ferma (ultima riga di sync.log con FERMO);
//   6. note per il cervello in .raw/inbox/ e file di .raw/ che nessuna pagina cita ancora (da ingerire);
//   7. il file segnale da-riprendere.md nella cartella di stato della sincronizzazione: se c'è, il suo contenuto
//      (un lavoro da chiudere prima di altro; a lavoro chiuso il file si toglie);
//   in fondo: «Prima di rispondere leggi wiki/hot.md e wiki/index.md».
// Pagina: wiki/entities/strumenti/hook.md · Registro: wiki/meta/strumenti.md
//
// Prova a mano:  echo {"source":"startup"} | node bin/hooks/avvio.mjs
// Si spegne con CERVELLO_HOOK=spenti (regole comuni in bin/hooks/comune.mjs). Tetto di 2 secondi a ogni processo figlio
// (4 per i controlli).

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { RADICE, ass, leggi, frontmatter, ingresso, contesto, esegui, figlio, gitRighe, impostazioni,
  cartellaStato } from './comune.mjs';

const giorniDa = data => {
  const d = new Date(`${data}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const oggi = new Date(); oggi.setHours(12, 0, 0, 0);
  return Math.round((oggi - d) / 86400000);
};
const quando = n => (n === null ? '' : n < 0 ? ' (data nel futuro: da correggere)' : n === 0 ? ' (oggi)' : n === 1 ? ' (ieri)' : ` (${n} giorni fa)`);
const primeRighe = (testo, n) => String(testo || '').split(/\r?\n/).map(r => r.trim()).filter(Boolean).slice(0, n).join(' / ');

// Ultima riga di un file senza leggerlo tutto (sync.log può arrivare a 2 MB).
function ultimaRiga(file) {
  let fd;
  try {
    fd = fs.openSync(file, 'r');
    const { size } = fs.fstatSync(fd);
    const n = Math.min(size, 4096);
    const buf = Buffer.alloc(n);
    fs.readSync(fd, buf, 0, n, size - n);
    return buf.toString('utf8').trimEnd().split(/\r?\n/).pop() || null;
  } catch { return null; } finally { if (fd !== undefined) try { fs.closeSync(fd); } catch { /* niente */ } }
}

// Tutti i file sotto una cartella (relativi a essa), con un tetto per non rallentare l'avvio.
function elencaFile(dir, { salta = () => false, max = 2000 } = {}) {
  const out = [];
  const giro = (d, rel) => {
    let voci = [];
    try { voci = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const v of voci) {
      if (out.length >= max || v.name.startsWith('.')) continue;
      const r = rel ? `${rel}/${v.name}` : v.name;
      if (salta(r, v)) continue;
      if (v.isDirectory()) giro(path.join(d, v.name), r);
      else if (v.isFile()) out.push(r);
    }
  };
  giro(dir, '');
  return out;
}

esegui(() => {
  ingresso(); // l'ingresso (source: startup, resume, clear, compact) non cambia cosa si scrive
  const imp = impostazioni();
  const sinc = imp.sincronizza || {};
  const righe = [];

  // 1. hot: la data più recente fra «updated» (anche ripetuto dall'unione automatica di Git) e le voci di «In corso adesso»
  const fileHot = imp.hot?.file || 'wiki/hot.md';
  const hot = leggi(fileHot);
  if (hot === null) righe.push(`- ${fileHot} non trovato.`);
  else {
    const fm = (hot.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const dateUpd = [...fm.matchAll(/^updated\s*:\s*["']?(\d{4}-\d{2}-\d{2})/gim)].map(m => m[1]);
    const titoloSez = (imp.hot?.sezione || 'In corso adesso').toLowerCase();
    let dentro = false;
    const dateVoci = [];
    for (const r of hot.split(/\r?\n/)) {
      const h = r.match(/^##\s+(.*?)\s*$/);
      if (h) { dentro = h[1].toLowerCase() === titoloSez; continue; }
      const d = dentro && /^[-*]\s/.test(r) && r.match(/\d{4}-\d{2}-\d{2}/);
      if (d) dateVoci.push(d[0]);
    }
    const upd = [...dateUpd, ...dateVoci].filter(d => giorniDa(d) !== null).sort().pop() || '';
    righe.push(upd ? `- ${fileHot} aggiornato il ${upd}${quando(giorniDa(upd))}.` : `- ${fileHot} senza data «updated» nel frontmatter.`);
  }

  // 2. nucleo: costruisci.mjs --verifica esce 1 se qualcosa è indietro o una regola non è in ordine
  const v = figlio('bin/costruisci.mjs', ['--verifica']);
  if (v) {
    if (v.codice === null) righe.push('- Nucleo: verifica non finita in tempo (lancia node bin/costruisci.mjs --verifica).');
    else if (v.codice === 0) righe.push('- Nucleo aggiornato.');
    else if (v.codice === 1) {
      const cosa = primeRighe(v.out, 2).replace(/[.\s]+$/, '') || 'vedi node bin/costruisci.mjs --verifica';
      righe.push(`- Nucleo NON aggiornato o regole non in ordine: ${cosa}.${/node bin\/costruisci\.mjs(?! --verifica)/.test(cosa) ? '' : ' Si sistema e si rilancia node bin/costruisci.mjs.'}`);
    }
    else righe.push(`- Nucleo: verifica non riuscita (codice ${v.codice}): ${primeRighe(v.err || v.out, 1) || 'lancia node bin/costruisci.mjs --verifica'}.`);
  }

  // 3. rossi dei controlli: prima dal vivo; se il controllo non finisce in tempo, l'ultimo rapporto scritto
  let dalVivo = null;
  if (fs.existsSync(ass('bin/controlla.mjs'))) {
    const c = spawnSync(process.execPath, [ass('bin/controlla.mjs'), '--json'], { cwd: RADICE, encoding: 'utf8',
      timeout: 4000, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
    try { if (!c.error && c.status !== null) dalVivo = JSON.parse(c.stdout); } catch { dalVivo = null; }
  }
  if (dalVivo && Array.isArray(dalVivo.controlli)) {
    const rossi = dalVivo.controlli.filter(x => x.esito === 'rosso')
      .map(x => `${x.id}) ${x.titolo}${x.casi && x.casi[0] ? ` (${String(x.casi[0]).replace(/^rosso\s+/, '').slice(0, 120)})` : ''}`);
    righe.push(rossi.length ? `- Controlli (adesso): ${rossi.length} ${rossi.length === 1 ? 'rosso' : 'rossi'}: ${rossi.slice(0, 8).join('; ')}. Dettagli: node bin/controlla.mjs.` : '- Controlli (adesso): nessun rosso.');
  } else {
    const stato = leggi('wiki/meta/stato-controlli.md');
    if (stato === null) righe.push('- Controlli non finiti in tempo e nessun rapporto scritto: lancia node bin/controlla.mjs.');
    else {
      const agg = String(frontmatter(stato).aggiornato || '');
      const eta = giorniDa(agg.slice(0, 10));
      const vecchio = eta !== null && eta >= 1 ? `, vecchio di ${eta} ${eta === 1 ? 'giorno' : 'giorni'}: per lo stato di adesso lancia node bin/controlla.mjs` : '';
      const rossi = stato.split('\n').filter(r => /^ROSSO\s/.test(r)).map(r => r.replace(/^ROSSO\s+/, '').trim());
      const del = agg ? ` (rapporto del ${agg}${vecchio})` : '';
      righe.push(rossi.length ? `- Controlli${del}: ${rossi.length} ${rossi.length === 1 ? 'rosso' : 'rossi'}: ${rossi.slice(0, 8).join('; ')}.` : `- Controlli${del}: nessun rosso.`);
    }
  }

  // 4. rami di conflitto della sincronizzazione non ancora uniti (solo riferimenti locali: niente rete)
  if (fs.existsSync(ass('.git'))) {
    const pref = sinc.prefissoConflitti || 'conflitto/';
    const ramo = sinc.ramo || 'main';
    const modelli = [`refs/heads/${pref}*`, `refs/remotes/origin/${pref}*`];
    const tutti = gitRighe(['for-each-ref', '--format=%(refname:short)', ...modelli]);
    if (tutti && tutti.length) {
      const aperti = new Set(tutti);
      // Un ramo è chiuso quando è unito nel ramo principale del remoto. Il ramo locale non basta: sul computer che ha
      // parcheggiato il conflitto il ramo principale locale contiene già la punta del ramo di parcheggio.
      const base = gitRighe(['rev-parse', '--verify', '-q', `refs/remotes/origin/${ramo}`]) ? `origin/${ramo}` : ramo;
      const uniti = gitRighe(['for-each-ref', '--format=%(refname:short)', `--merged=${base}`, ...modelli]);
      if (uniti) uniti.forEach(r => aperti.delete(r));
      // Lo stesso ramo può esserci due volte, locale e del remoto (origin/...): si conta una volta sola.
      const nomi = [...new Set([...aperti].map(r => r.replace(/^origin\//, '')))];
      if (nomi.length) righe.push(`- Rami di conflitto della sincronizzazione da unire (${nomi.length}): ${nomi.slice(0, 5).join(', ')}. Li unisce il Custode; se servono prima, si uniscono qui.`);
    }
  }

  // 5. sincronizzazione in pausa o ferma (cartella di stato fuori dal cervello)
  const dirStato = cartellaStato();
  try {
    const eta = Date.now() - fs.statSync(path.join(dirStato, 'pausa')).mtimeMs;
    const ore = Number(sinc.pausaOre) || 3;
    if (eta < ore * 3600000) righe.push(`- La sincronizzazione è in pausa da ${Math.round(eta / 60000)} minuti: riparte con node bin/sincronizza.mjs --riprendi, o da sola dopo ${ore} ore.`);
  } catch { /* nessuna pausa */ }
  const ultima = ultimaRiga(path.join(dirStato, 'sync.log'));
  if (ultima && /FERMO/.test(ultima)) righe.push(`- Sincronizzazione ferma, ultimo giro: «${ultima.slice(0, 300)}». Dettagli: node bin/sincronizza.mjs --stato.`);

  // 6. note per il cervello e fonti grezze da ingerire
  const note = elencaFile(ass('.raw/inbox'), { salta: (r, v) => v.isDirectory() })
    .filter(f => f.toLowerCase().endsWith('.md') && !/^leggimi/i.test(f));
  const quanti = (n, uno, molti) => (n === 1 ? `c'è 1 ${uno}` : `ci sono ${n} ${molti}`);
  if (note.length) righe.push(`- In .raw/inbox/ ${quanti(note.length, 'nota', 'note')} per il cervello da integrare (/ingerisci .raw/inbox, oppure le integra il Custode).`);
  const grezzi = elencaFile(ass('.raw'), { salta: r => r === 'inbox' || /^leggimi/i.test(r) });
  if (grezzi.length) {
    // Una fonte è già entrata se il suo nome compare in una pagina di wiki/sources/ o nel registro di automazioni/.
    let citati = '';
    for (const dir of ['wiki/sources', 'automazioni']) {
      for (const f of elencaFile(ass(dir), { max: 3000 })) {
        if (!f.endsWith('.md') || citati.length > 30 * 1024 * 1024) continue;
        citati += (leggi(path.join(ass(dir), f)) || '') + '\n';
      }
    }
    const daIngerire = grezzi.filter(f => {
      const nome = path.basename(f);
      return !citati.includes(nome) && !citati.includes(nome.replace(/ /g, '%20'));
    });
    if (daIngerire.length) righe.push(`- In .raw/ ${quanti(daIngerire.length, 'file', 'file')} che nessuna pagina di wiki/sources/ cita ancora (da ingerire con /ingerisci): ${daIngerire.slice(0, 3).join(', ')}${daIngerire.length > 3 ? '...' : ''}.`);
  }

  // 7. lavoro da riprendere, lasciato da una sessione precedente
  const fRiprendi = path.join(dirStato, 'da-riprendere.md');
  const riprendi = (leggi(fRiprendi) || '').trim();
  if (riprendi) {
    const testo = riprendi.length > 1500 ? `${riprendi.slice(0, 1500)} [...]` : riprendi;
    righe.push(`- DA RIPRENDERE PRIMA DI ALTRO (file ${fRiprendi}): ${testo}\n  A lavoro chiuso il file si toglie.`);
  }

  righe.push('Prima di rispondere leggi wiki/hot.md e wiki/index.md.');
  contesto('SessionStart', ['Stato del cervello all\'avvio (hook avvio, [[hook]]):', ...righe].join('\n'));
});
