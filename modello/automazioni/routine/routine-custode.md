---
type: routine
title: "Custode del cervello"
id: ""
stato: spenta
dove: "cloud, dal repository Git"
account: "{{DA COMPILARE: account dell'AI che ospita la routine (uno solo)}}"
cron: "CRON_TZ=Europe/Rome 30 21 * * *"
procedura: "automazioni/custode.md"
battito: custode
testo-verificato: ""
---

# Custode del cervello

Testo esatto del prompt della routine serale. Il lavoro sta in `automazioni/custode.md`; questo testo si cambia qui e
poi si allinea l'account con `/allinea-routine`, mai a mano sull'account.

- `id` e `testo-verificato` restano vuoti finché la routine non esiste: li scrive `/allinea-routine` quando la crea,
  con il sì dell'utente.
- Si crea su un account solo (il campo `account` qui sopra), con il repository del cervello collegato e senza chiavi. Ogni sera alle 21:30, ora
  italiana: il fuso sta nella riga `cron`.
- Parte in `MODALITA: rapporto`. Quando i resoconti sono giusti per qualche giro, si cambia la riga in
  `MODALITA: azione` qui sotto e si allinea.
- Quando la routine viene accesa: `stato: accesa` qui, la colonna «Stato» in `automazioni/LEGGIMI.md` e la riga in
  `wiki/meta/mappa-del-cervello.md`.

## Prompt

~~~~text
Sei il Custode del secondo cervello di {{DA COMPILARE: il tuo nome}}. Rispondi nella lingua scritta in `wiki/concepts/come-scrivere-per-me.md`.

MODALITA: rapporto

Lavori nel repository Git del cervello, clonato nella cartella di lavoro. Prima di tutto: `git checkout main && git pull --rebase origin main`.

Poi apri `automazioni/custode.md` e seguila dall'inizio alla fine, insieme ad `automazioni/_comune.md` per avvio, salvataggio e battito. Se questo messaggio e quei file dicono cose diverse, valgono i file. Con MODALITA: rapporto scrivi solo cosa faresti; con MODALITA: azione fai i compiti. In entrambi i casi una voce in fondo a `wiki/log.md` e il battito in `automazioni/battiti/custode.txt`.

Chiudi sempre con il resoconto e l'esito del push.
~~~~
