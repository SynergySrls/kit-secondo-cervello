---
title: "Mappa del cervello"
type: meta
status: current
created: 2026-11-03
updated: 2026-11-03
tags: [meta, mappa, infrastruttura]
---

# Mappa del cervello

Tutto ciò che del cervello vive fuori da questa cartella, con chi lo aggiorna. Il cervello vive in più posti di
quanti si crede: prompt delle routine, plugin e skill degli account, documenti pubblicati, cartelle sul computer,
memorie automatiche degli agenti. Una cosa che sta fuori e non è scritta qui, prima o poi diverge senza che nessuno se
ne accorga.

Regola della pagina: chi crea, sposta o spegne qualcosa fuori dalla cartella aggiorna la sua riga qui nello stesso
lavoro. Le righe con il segnaposto sono esempi: si compilano o si tolgono.

## Account delle AI e plugin

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| Plugin `cervello` (istruzioni e nucleo per le chat senza cartella) | {{DA COMPILARE: account e piattaforma}}, dal marketplace del repository | nessuno a mano: `node bin/costruisci.mjs` alza la versione, il salvataggio nel repository fa il resto | [[costruisci]] |
| Istruzioni o file di conoscenza di una chat | {{DA COMPILARE: piattaforma e progetto}} | l'utente, ricaricando il pacchetto di `node bin/costruisci.mjs --esporta` quando cambia la data del nucleo | [[costruisci]] |
| Connettori (posta, archivio, negozio, calendario) | {{DA COMPILARE: account}} | l'utente, dalle impostazioni dell'account; il collegamento si controlla prima dell'uso | [[sistemi-esterni]] |
| Skill e plugin generici installati | {{DA COMPILARE: account}} | nessuno: non si correggono e non decidono | [[fonte-unica]] |

## Routine e attività pianificate

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| Routine Custode (spenta finché non la accendi) | {{DA COMPILARE: account o piattaforma}}; testo in `automazioni/routine/routine-custode.md` | `/allinea-routine` con un sì, mai a mano sull'account | [[routine-custode]] · [[custode]] |
| Sincronizzazione ogni 10 minuti | attività pianificata del computer principale | `node bin/installa-sincronizzazione.mjs --fai` (e `--togli`) | [[sincronizza]] |
| Controllo del cervello | GitHub, flusso `.github/workflows/controllo.yml` nel repository | parte da solo a ogni salvataggio e ogni giorno | [[controlla]] |
| {{DA COMPILARE: altra routine o attività}} | | | |

## Documenti pubblicati

Un documento che vive solo in un servizio esterno (documento condiviso, pagina pubblicata, presentazione) ha una
sintesi nel cervello, altrimenti non lo trova nessuno.

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| {{DA COMPILARE: documento}} | {{DA COMPILARE: servizio e link}} | {{DA COMPILARE: chi lo pubblica}} | la pagina con la sintesi |

## Archivi nel cloud

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| File originali (PDF, documenti, audio) da cui si estraggono i dati | {{DA COMPILARE: servizio e cartella}} | l'utente | [[ambito]] |
| Copia di sola lettura del cervello per le chat, se c'è | {{DA COMPILARE: servizio e cartella}} | solo il computer principale, mai una chat | [[dove-si-lavora]] |

## Cartelle sul computer

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| Cartella privata delle chiavi | `~/Cervello-Privato/chiavi`, oppure quella indicata da `CERVELLO_CHIAVI_DIR` | l'utente, mai una chat | [[chiavi]] |
| Stato della sincronizzazione (registro, pausa, conflitto) | `~/.cervello-sync/<nome della cartella del cervello>/` | lo script | [[sincronizza]] |
| Istruzioni globali dell'agente, per le sessioni aperte fuori dalla cartella | per Claude Code `~/.claude/CLAUDE.md`, che punta al nucleo | l'utente | [[dove-si-lavora]] |
| Memoria automatica dell'agente | {{DA COMPILARE: dove la tiene il tuo agente}} | l'agente, solo rimandi di una riga alle pagine | [[fonte-unica]] |
| Progetti con codice | {{DA COMPILARE: cartella}}, ognuno con il suo repository | l'utente | {{DA COMPILARE: pagina del progetto}} |

## Repository

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| Repository Git privato del cervello | {{DA COMPILARE: indirizzo}} | la sincronizzazione del computer principale, le routine con il loro salvataggio | [[sincronizza]] |
| Rami di conflitto `conflitto/` | nel repository | li crea la sincronizzazione, li unisce il Custode | [[custode]] |

## Server e servizi

| Cosa | Dove | Chi lo aggiorna | Pagina |
|---|---|---|---|
| {{DA COMPILARE: server o servizio, se c'è}} | {{DA COMPILARE: fornitore}} | {{DA COMPILARE: chi}} | {{DA COMPILARE: pagina}} |

## Collegamenti
- [[dove-si-lavora]]: le superfici e chi scrive
- [[id-sistemi-esterni]]: gli id degli oggetti fuori
- [[strumenti]]: gli script che toccano queste cose
