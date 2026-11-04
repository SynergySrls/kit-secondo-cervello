---
title: "Id dei sistemi esterni"
type: meta
status: current
created: 2026-11-03
updated: 2026-11-03
tags: [meta, sistemi-esterni, id]
---

# Id dei sistemi esterni

Gli id degli oggetti che procedure, routine e strumenti usano sui sistemi esterni (negozio online, posta, gestionale,
archivio, account delle AI), in un posto solo.

## Le regole della pagina

1. Le procedure e i prompt non scrivono id: citano questa pagina. L'unica eccezione è il campo `id` nel file di una
   routine, che serve ad allinearla; lo stesso id si registra anche qui.
2. Un id nuovo entra qui nello stesso lavoro in cui nasce o si scopre.
3. Un id sostituito va in «Superati»: la riga non si cancella.
4. Niente id di persone (contatti, clienti, iscritti): solo oggetti.

Prima di usare un id si verifica dal vivo che punti ancora allo stesso oggetto e si aggiorna «Verificato il»
([[verificato-non-dedotto]]). L'account collegato a un connettore è il primo controllo di ogni procedura
([[sistemi-esterni]]).

## {{DA COMPILARE: nome del sistema, per esempio il negozio online}}

| Oggetto | Id | Note | Usato da | Verificato il |
|---|---|---|---|---|
| *(esempio)* Account collegato al connettore | {{DA COMPILARE: id o nome dell'account}} | è quello che il passo 0 delle procedure confronta | {{DA COMPILARE: procedura}} | AAAA-MM-GG |
| *(esempio)* Automazione di benvenuto | {{DA COMPILARE: id}} | nata spenta, la accende l'utente | {{DA COMPILARE: procedura}} | AAAA-MM-GG |

## Routine

| Oggetto | Id | Note | Usato da | Verificato il |
|---|---|---|---|---|
| Routine Custode | {{DA COMPILARE: id, dopo la creazione}} | spenta finché non la accendi; l'id va anche nel file della routine | [[routine-custode]] | AAAA-MM-GG |

## Superati

| Oggetto | Id | Note | Usato da | Verificato il |
|---|---|---|---|---|
| *(esempio)* Vecchia automazione di benvenuto | {{DA COMPILARE: id vecchio}} | sostituita il AAAA-MM-GG da quella sopra | nessuno | AAAA-MM-GG |

## Id che il cervello non ha ancora

- {{DA COMPILARE: oggetti usati di cui manca l'id, oppure «nessuno»}}
