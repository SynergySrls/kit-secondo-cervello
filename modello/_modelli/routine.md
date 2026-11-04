---
type: routine
title: "<Nome della routine>"
# id: si scrive quando la routine esiste davvero sull'account; finché è vuoto la routine non c'è
id: ""
# stato: «spenta» o «accesa»; si cambia qui solo dopo averla accesa o spenta davvero
stato: spenta
dove: "cloud, dal repository Git"
# account: l'account dell'AI che ospita la routine; le routine stanno tutte su uno solo
account: "<account che ospita la routine>"
# cron: minuti, ora, giorno del mese, mese, giorno della settimana; CRON_TZ tiene l'ora giusta anche al cambio d'ora
cron: "CRON_TZ=Europe/Rome 0 8 * * 1"
procedura: "automazioni/<procedura>.md"
battito: <nome>
# testo-verificato: data dell'ultimo confronto tra questo testo e quello sull'account (/allinea-routine)
testo-verificato: AAAA-MM-GG
---

# <Nome della routine>

Il file si chiama `automazioni/routine/routine-<nome>.md`. Qui sta il testo esatto del prompt; il lavoro vero sta
nella procedura. Il prompt si cambia qui e poi si allinea l'account con `/allinea-routine`: mai a mano sull'account,
altrimenti il file e la routine divergono. Quando la routine si accende, il suo battito entra nella tabella
«Battiti» di `automazioni/LEGGIMI.md`.

## Prompt

~~~~text
Sei l'assistente di <persona> che <compito in una riga>. Rispondi nella lingua scritta in `wiki/concepts/come-scrivere-per-me.md`.

Lavori nel repository Git del cervello, clonato nella cartella di lavoro. Prima di tutto: `git checkout main && git pull --rebase origin main`.

Poi apri `automazioni/<procedura>.md` e seguila dall'inizio alla fine, insieme ad `automazioni/_comune.md` per avvio, salvataggio e battito. Se questo messaggio e quei file dicono cose diverse, valgono i file.

Chiudi sempre con il resoconto e l'esito del push.
~~~~
