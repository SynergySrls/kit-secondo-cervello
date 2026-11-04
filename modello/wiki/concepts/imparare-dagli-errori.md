---
title: "Ogni errore che può ripetersi diventa una pagina"
type: regola
ambito: tutto
nucleo: sì
ordine: 90
tags: [regola, errori, metodo, verifica]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da un errore annotato solo nel log e ripetuto un mese dopo"
---

# Ogni errore che può ripetersi diventa una pagina

## In breve
- Un errore che può ripetersi diventa una pagina (regola o concetto) nella stessa sessione: il log non protegge.
- Una correzione che l'utente ripete diventa una riga No/Sì in [[come-scrivere-per-me]].
- Dopo una modifica in blocco si fa una lettura indipendente del risultato.

## La regola
Può ripetersi tutto ciò che dipende da un'abitudine dell'AI, dal comportamento di un sistema esterno o da un formato di
dati. Per questi errori una voce in hot o nel log non basta, perché quei file non si rileggono prima di agire.

- Se l'errore cambia cosa si fa, nasce o si aggiorna una regola, con l'«In breve» che lo impedisce.
- Se è una conoscenza («questa interfaccia sostituisce l'intero oggetto»), nasce un concetto in `wiki/concepts/`,
  linkato dall'index e dalla pagina dello strumento o del sistema.
- Se la regola nuova supera una frase scritta altrove, la frase va in [[frasi-superate]].

Una correzione di stile che l'utente fa per la seconda volta diventa una riga nelle tabelle No/Sì di
[[come-scrivere-per-me]], con l'esempio vero.

Dopo una modifica in blocco (una sostituzione in molti file, una scrittura su molti oggetti) si rilegge il risultato
partendo dal risultato, non dal piano: un campione dei file o degli oggetti, oppure l'agente
`.claude/agents/verificatore.md`. Correggere un errore in blocco è il momento in cui se ne fanno altri.

## Perché esiste

Una lezione scritta solo in hot e nel log non protegge: dopo qualche settimana nessuno la rilegge, e lo stesso
errore torna, spesso più grande, magari proprio mentre si corregge altro in blocco. Lo stesso vale per le correzioni di
stile ripetute a voce: finché non diventano una riga scritta, si ripetono.

## Come si applica
La chiusura di sessione (in Claude Code `/chiudi`) chiede ogni volta: c'è un errore di oggi che può ripetersi? Se sì,
la pagina si scrive prima di chiudere.

## Collegamenti
- [[come-scrivere-per-me]]: le correzioni ricorrenti
- [[frasi-superate]]: le frasi vecchie che il controllo cerca
- [[sistemi-esterni]]: la regola nata dai campi azzerati
- [[log]]: la cronologia, che da sola non protegge
