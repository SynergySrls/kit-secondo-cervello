---
title: "Fonte unica delle istruzioni e attribuzione"
type: regola
ambito: tutto
nucleo: sì
ordine: 10
tags: [regola, istruzioni, contraddizioni, attribuzione]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da istruzioni sparse in più file che si contraddicevano"
---

# Fonte unica delle istruzioni e attribuzione

## In breve
- Le istruzioni sono una sola: `AGENTS.md` più le pagine regola, riassunte nel [[nucleo]]; se una memoria, una skill o un plugin dicono altro, vale il cervello.
- Prima di creare qualcosa si cerca se esiste già e non lo si contraddice: il vecchio diventa `superseded` con `superata-da`, mai un doppione.
- Ogni regola o numero citato punta a una pagina, il resto è «prassi generale, non regola mia»; una regola vale solo nel suo `ambito`.

## La regola
Una sola fonte. `AGENTS.md` dice chi, la prima azione, le cartelle e la chiusura; le regole stanno ognuna nella sua
pagina in `wiki/concepts/` con `type: regola`. Il nucleo (`wiki/meta/nucleo.md` e il blocco in fondo ad `AGENTS.md`)
lo genera `node bin/costruisci.mjs` e non si modifica a mano. Le memorie automatiche degli agenti contengono solo
rimandi di una riga alle pagine; le skill e i plugin generici portano un metodo, non decidono.

Prima di creare o cambiare una regola, una pagina, un documento o una configurazione:
1. si cerca in `wiki/concepts/`, `wiki/entities/` e `wiki/sources/` se esiste già qualcosa sul tema;
2. non lo si contraddice; se il nuovo supera il vecchio, il vecchio prende `status: superseded` e `superata-da`;
3. mai una seconda pagina o un secondo documento sullo stesso tema: si estende quello che c'è;
4. una regola ambigua o sbagliata si segnala, non si aggira.

Attribuzione. Ogni regola, numero o vincolo citato in un lavoro punta a una pagina del cervello. Ciò che viene dalla
conoscenza generale del modello o da fonti esterne si dichiara: «prassi generale, non regola mia». Esempio: «il
preventivo vale 30 giorni, come dice la pagina del listino» va bene; «di solito un preventivo vale 30 giorni», detto
come regola e senza pagina, no.

Ambito. Il campo `ambito` dice dove vale una regola: `tutto` (ovunque), oppure un ambito più stretto (`scrittura`, il
nome di uno strumento o di un cliente). Il metodo di terzi o un consiglio esterno non è una regola: si scrive come
concetto, marcato come suggerimento.

## Perché esiste

Quando le istruzioni stanno in più posti (file di istruzioni, memorie, skill, plugin), prima o poi si
contraddicono: ogni copia di una regola diverge. Succede anche che un vincolo venga applicato come invalicabile senza
stare in nessuna pagina, perché è conoscenza generica presentata come regola; o che regole scritte per un solo
strumento finiscano in lavori dove non valgono, perché nessuno diceva dove valevano.

## Come si applica
Per cambiare una regola: si cambia la pagina, si lancia `node bin/costruisci.mjs` e, se la regola nuova supera una
frase scritta altrove, la frase va in [[frasi-superate]]. In Claude Code lo fa `/nuova-regola`. Se il nucleo è rimasto indietro,
`node bin/controlla.mjs` lo segna in rosso.

## Collegamenti
- [[nucleo]]: il riassunto generato delle regole
- [[costruisci]]: lo script che genera nucleo e blocchi
- [[frasi-superate]]: dove vanno le frasi vecchie
- [[ambito]]: di chi è il cervello e cosa ci entra
