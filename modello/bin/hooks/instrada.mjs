#!/usr/bin/env node
// Hook UserPromptSubmit: legge la tabella «Richiesta → strumento» di wiki/meta/strumenti.md e, se il messaggio
// dell'utente contiene le parole tipiche di una riga, aggiunge al contesto lo strumento da usare per primo, dove
// gira, cosa non usare e la pagina. Se nessuna riga corrisponde non scrive niente.
// Pagina: wiki/entities/strumenti/hook.md · Registro: wiki/meta/strumenti.md · Regola: [[strumento-giusto]]
//
// Prova a mano:  echo {"prompt":"salva e sincronizza il cervello"} | node bin/hooks/instrada.mjs
// Si spegne con CERVELLO_HOOK=spenti (regole comuni in bin/hooks/comune.mjs).
//
// Come si leggono le parole tipiche (prima colonna, separate da virgole): maiuscole e accenti non contano; una parola
// di 4 lettere o meno vale solo intera; una più lunga vale anche con un'altra desinenza (immagine trova immagini,
// trascrivi trova trascrivere). Al massimo tre righe, prima quelle con più parole riconosciute; dopo la prima, non
// entra una riga riconosciuta da una sola parola corta. Non fa niente con i comandi «/», con i messaggi oltre 1500
// caratteri e con i resoconti degli agenti.

import { leggi, sezione, ingresso, contesto, esegui } from './comune.mjs';

const FILE = 'wiki/meta/strumenti.md';
const TITOLO = 'Richiesta → strumento';
const MAX_RIGHE = 3;

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ').trim();
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Divide una riga di tabella in celle senza spezzare i wikilink con alias né il codice tra apici inversi.
function celle(riga) {
  const out = [];
  let cur = '', inCodice = false, inLink = 0;
  const t = riga.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '`') inCodice = !inCodice;
    else if (!inCodice && t.startsWith('[[', i)) inLink++;
    else if (!inCodice && t.startsWith(']]', i) && inLink) inLink--;
    if (c === '|' && !inCodice && !inLink && t[i - 1] !== '\\') { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function espressione(parola) {
  const p = norm(parola).split(' ');
  let ultima = p.pop();
  if (!ultima) return null;
  let coda = '(?= |$)';
  if (ultima.length >= 5) {
    if (ultima.length >= 6 && /[aeiou]$/.test(ultima)) ultima = ultima.slice(0, -1);
    coda = '[a-z0-9]*(?= |$)';
  }
  return new RegExp(`(?:^| )${[...p.map(esc), esc(ultima)].join(' ')}${coda}`);
}

esegui(() => {
  const { prompt } = ingresso();
  if (!prompt || typeof prompt !== 'string' || /^\s*\//.test(prompt)) return; // comandi «/»: niente
  if (prompt.length > 1500 || /Subagent hand-back|task-notification|agent-message/.test(prompt)) return; // resoconti e testi lunghi
  const tabella = sezione(leggi(FILE), TITOLO);
  if (!tabella) return;

  const righe = tabella.split('\n').filter(r => /^\s*\|/.test(r));
  if (righe.length < 3) return;
  const intest = celle(righe[0]).map(norm);
  const col = re => intest.findIndex(h => re.test(h));
  const iParole = col(/parol/), iStrum = col(/strument/), iDove = col(/dove/), iNon = col(/non usare/), iPag = col(/pagin/);
  if (iParole < 0 || iStrum < 0) return;

  const testo = norm(prompt);
  const trovate = [];
  righe.slice(2).forEach((r, ordine) => {
    const c = celle(r);
    const parole = (c[iParole] || '').replace(/[`«»*]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    const viste = parole.filter(p => { const re = espressione(p); return re && re.test(testo); });
    if (!viste.length) return;
    trovate.push({ c, viste, ordine, peso: viste.reduce((n, p) => n + p.length, 0) });
  });
  if (!trovate.length) return;
  trovate.sort((a, b) => (b.viste.length - a.viste.length) || (b.peso - a.peso) || (a.ordine - b.ordine));
  // Dopo la prima, una riga entra solo se non poggia su una sola parola corta: meno rumore.
  for (let i = trovate.length - 1; i > 0; i--) if (trovate[i].peso < 5) trovate.splice(i, 1);

  const cella = (c, i) => (i >= 0 && c[i] ? c[i] : '');
  const out = trovate.slice(0, MAX_RIGHE).map(({ c, viste }) => {
    const parti = [`Per questa richiesta lo strumento è ${cella(c, iStrum)}`];
    if (cella(c, iDove)) parti.push(`dove gira: ${cella(c, iDove)}`);
    if (cella(c, iNon)) parti.push(`da non usare: ${cella(c, iNon)}`);
    if (cella(c, iPag)) parti.push(`pagina ${cella(c, iPag)}`);
    return `- ${parti.join('; ')} (parole riconosciute: ${viste.join(', ')}).`;
  });
  const altre = trovate.length - MAX_RIGHE;
  const testa = 'Strumento giusto ([[strumento-giusto]], tabella «Richiesta → strumento» in [[strumenti]]): si usa senza chiedere quale, se la richiesta è davvero questa.';
  contesto('UserPromptSubmit', [testa, ...out,
    ...(altre > 0 ? [`- Altre ${altre} righe della tabella corrispondono: se nessuna di queste è quella giusta, si legge la tabella.`] : [])].join('\n'));
});
