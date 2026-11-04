---
title: "Lo strumento giusto per ogni richiesta"
type: regola
ambito: tutto
nucleo: sì
ordine: 70
tags: [regola, strumenti, instradamento]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da uno script cercato tra i servizi esterni e da strumenti doppi per lo stesso compito"
---

# Lo strumento giusto per ogni richiesta

## In breve
- Per una richiesta operativa si usa lo strumento della tabella «Richiesta → strumento», senza chiedere quale.
- Prima di dire «non esiste» si leggono [[strumenti]] e l'elenco di `bin/`.
- Mai un secondo strumento sullo stesso compito: si estende quello che c'è; uno strumento nuovo è script, pagina e riga del registro insieme.

## La regola
Gli strumenti del cervello sono script nella cartella `bin/`, descritti in [[strumenti]]: non sono connettori, skill
o servizi esterni, e si cercano lì. La tabella «Richiesta → strumento» di quella pagina sta anche nel nucleo.

- Si usa lo strumento della tabella per primo, senza chiedere all'utente quale preferisce.
- La colonna «Da non usare» elenca alternative già scartate: non si usano e non si propongono.
- Se lo strumento non gira dove si sta lavorando (tabella «Dove sto lavorando?»), lo si dice in una riga e si indica
  dove gira, invece di ripiegare su altro.
- Se lo strumento c'è ma non fa esattamente quello che serve, si dice cosa fa e cosa no, e lo si estende.
- Le skill generiche portano un metodo: non prendono il posto dello strumento della tabella.

Uno strumento nuovo nasce con tre cose nello stesso lavoro: lo script in `bin/`, la pagina in
`wiki/entities/strumenti/`, la riga in «Gli strumenti». Se risponde a una richiesta frequente, anche la riga in
«Richiesta → strumento» e poi `node bin/costruisci.mjs`, che copia la tabella nel nucleo.

## Perché esiste

Senza un registro, una chat cerca tra i servizi esterni uno strumento che esiste già come script nella cartella del
cervello e, non trovandolo, ne usa un altro. Col tempo nascono due strumenti diversi per lo stesso compito, e una
skill generica ripropone un servizio già scartato.

## Come si applica
In Claude Code il controllo automatico `instrada` legge la prima colonna della tabella e, quando un messaggio contiene
quelle parole, ricorda lo strumento giusto ([[hook]]). `node bin/controlla.mjs` segna in rosso uno script di `bin/`
che manca dal registro.

## Collegamenti
- [[strumenti]]: il registro e la tabella «Richiesta → strumento»
- [[hook]]: il controllo automatico che suggerisce lo strumento
- [[fonte-unica]]: mai un secondo documento o strumento parallelo
