#!/usr/bin/env node
// Hook PostToolUse su Edit, Write e MultiEdit: controlla il solo file appena toccato e, se trova qualcosa, lo dice
// al modello. Non blocca niente (la modifica è già fatta): aggiunge contesto.
//   1. caratteri vietati di bin/impostazioni.json (di base la lineetta lunga e quella media), con i numeri di riga;
//      avviso più forte se il file è in zona vincolante; esenti i file di «esentiStile»;
//   2. segreti e dati personali, con node bin/controlla.mjs --segreti <file> (riporta riga e tipo, mai il valore);
//   3. se il file è una pagina regola, il registro wiki/meta/strumenti.md o AGENTS.md e node bin/costruisci.mjs
//      --verifica esce 1, ricorda di lanciare node bin/costruisci.mjs.
// Pagina: wiki/entities/strumenti/hook.md · Registro: wiki/meta/strumenti.md
//
// Prova a mano:  echo {"tool_name":"Write","tool_input":{"file_path":"wiki/hot.md"}} | node bin/hooks/dopo-modifica.mjs
// Si spegne con CERVELLO_HOOK=spenti (regole comuni in bin/hooks/comune.mjs). Tetto di 2 secondi a ogni processo figlio.

import fs from 'node:fs';
import path from 'node:path';
import { RADICE, relativo, leggi, frontmatter, ingresso, contesto, esegui, figlio, caratteriVietati,
  inZonaVincolante, esenteStile } from './comune.mjs';

const TESTO = /\.(md|txt|html?|mjs|cjs|js|ts|py|ps1|sh|json|css|ya?ml|csv|tsv|cmd|bat|xml|toml|ini)$/i;
const MAX_BYTE = 5 * 1024 * 1024;

const elencoRighe = numeri => numeri.slice(0, 12).join(', ') + (numeri.length > 12 ? ` e altre ${numeri.length - 12}` : '');

esegui(() => {
  const dati = ingresso();
  const ti = dati.tool_input || {};
  const tr = dati.tool_response || {};
  let file = ti.file_path || ti.path || tr.filePath || tr.file_path;
  if (!file || typeof file !== 'string') return;
  if (!path.isAbsolute(file)) file = path.resolve(dati.cwd || RADICE, file);
  if (!TESTO.test(file)) return;
  let st;
  try { st = fs.statSync(file); } catch { return; }
  if (!st.isFile() || st.size > MAX_BYTE) return;

  const rel = relativo(file);
  const nome = rel || file;
  const testo = leggi(file);
  if (testo === null) return;
  const fm = /\.md$/i.test(file) ? frontmatter(testo) : {};
  const eRegola = String(fm.type || '').toLowerCase() === 'regola';
  const avvisi = [];

  // 1. caratteri vietati
  if (!esenteStile(rel)) {
    const righe = testo.split('\n');
    const vincolante = inZonaVincolante(rel, fm);
    for (const c of caratteriVietati()) {
      const numeri = [];
      righe.forEach((r, i) => { if (r.includes(c.carattere)) numeri.push(i + 1); });
      if (!numeri.length) continue;
      const cosa = String(c.nome || 'carattere vietato');
      avvisi.push(`${cosa.charAt(0).toUpperCase()}${cosa.slice(1)} in ${nome}, ${numeri.length === 1 ? 'riga' : `${numeri.length} righe:`} ${elencoRighe(numeri)}. ` +
        (vincolante ? 'È zona vincolante (il controllo diventa rosso): si toglie adesso. ' : 'Si toglie (regola in [[come-scrivere-per-me]], elenco in bin/impostazioni.json). ') +
        (c.consiglio ? `Al suo posto: ${c.consiglio}.` : ''));
    }
  }

  // 2. segreti e dati personali (il controllore stampa file, riga e tipo, mai il valore)
  if (rel !== 'bin/controlla.mjs') {
    const s = figlio('bin/controlla.mjs', ['--segreti', rel || file]);
    if (s && s.codice === 1) {
      const casi = s.out.split(/\r?\n/).map(r => r.match(/:(\d+)\s{2,}(.+)$/)).filter(Boolean).map(m => `riga ${m[1]}, ${m[2].trim()}`);
      avvisi.push(`Possibili segreti o dati personali in ${nome}${casi.length ? `: ${casi.slice(0, 8).join('; ')}` : ''}. ` +
        'Nel cervello non si scrivono password, chiavi, token né dati personali di terzi: si toglie il valore e si scrive solo dove sta ([[ambito]]). ' +
        'La sincronizzazione lo terrebbe comunque fuori dal commit.');
    }
  }

  // 3. pagina regola, registro degli strumenti o AGENTS.md: il nucleo va rigenerato?
  const tocca = rel && (rel === 'wiki/meta/strumenti.md' || rel === 'AGENTS.md' || (rel.startsWith('wiki/') && eRegola));
  if (tocca) {
    const v = figlio('bin/costruisci.mjs', ['--verifica']);
    if (v && v.codice === 1) {
      const primo = v.out.split(/\r?\n/).map(r => r.trim()).filter(Boolean).slice(0, 3).join(' / ').replace(/[.\s]+$/, '');
      const coda = /rilancia|node bin\/costruisci\.mjs/.test(primo) ? '' : ' A modifica finita si lancia node bin/costruisci.mjs.';
      avvisi.push(`Hai toccato ${rel}, che finisce nel nucleo, e la verifica dice: ${primo || 'qualcosa è indietro'}.${coda} Il nucleo e i blocchi generati non si modificano a mano.`);
    }
  }

  if (avvisi.length) contesto('PostToolUse', ['Controllo dopo la modifica ([[hook]]):', ...avvisi.map(a => `- ${a}`)].join('\n'));
});
