---
title: "Dove si lavora e dove si scrive"
type: regola
ambito: tutto
nucleo: sì
ordine: 30
tags: [regola, superfici, sincronizzazione, chiavi]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da doppioni creati scrivendo attraverso una cartella sincronizzata"
---

# Dove si lavora e dove si scrive

## In breve
- Si scrive in una copia sola, la cartella del cervello (con Git fa fede il repository); mai da una copia sincronizzata (Drive, OneDrive, Dropbox): nascono doppioni.
- Chi non può scrivere legge in sola lettura, lo dice e prepara una nota per `.raw/inbox/`.
- Le chiavi stanno nella cartella privata fuori dal cervello: non si leggono e non si stampano.

## La regola
| Superficie | Come riceve le regole | Dove legge | Dove scrive |
|---|---|---|---|
| Agente sul computer, nella cartella | `AGENTS.md` (Claude Code tramite `CLAUDE.md`), più i controlli automatici | la cartella | la cartella; la sincronizzazione salva nel repository |
| Routine nel cloud | il repository clonato | il clone | commit e push, come dice `automazioni/_comune.md` |
| Chat senza cartella | il plugin `cervello` o il pacchetto di `node bin/costruisci.mjs --esporta` | la copia caricata o il connettore, dichiarandolo | solo una nota per il cervello |
| Visore (Obsidian o un editor) | nessuna | tutto | l'utente a mano |

Chi legge una copia lo dice in una riga, con la data della copia («leggo il pacchetto del 3 novembre»). La nota per
il cervello segue il modello `_modelli/nota-inbox.md`: l'utente la salva in `.raw/inbox/` e la integra il Custode o
la sessione successiva con la cartella.

Una copia sincronizzata nei due sensi non è un posto dove scrivere: né il cervello né i file di Git stanno dentro una
cartella di Drive, OneDrive o Dropbox. Se serve una copia nel cloud per le chat, è di sola lettura. Un file già
condiviso con altri non si ricrea mai: cambierebbero id e link.

Con due computer, uno è il principale: sugli altri la sincronizzazione non scrive il battito. A computer spento si
fermano la sincronizzazione e le attività locali; le routine nel cloud no.

Le chiavi stanno nella cartella privata indicata in `bin/impostazioni.json` (voce `chiavi`), mai nel cervello, in
chat o in una memoria. Gli script le trovano con `bin/lib/chiavi.mjs`, che non mostra mai un valore.

## Perché esiste

Il connettore di un archivio cloud spesso non sovrascrive un file: ne crea uno omonimo. Così i dati finiscono in
copie «(1)», «(2)», «(3)» mentre il file vero resta fermo, e chi lo legge dopo conclude che i dati non ci sono. Se poi
l'archivio sincronizza nei due sensi la cartella del cervello, ciò che una chat scrive lì arriva nel repository senza
revisione, chiavi comprese.

## Collegamenti
- [[sincronizza]]: la sincronizzazione con il repository
- [[chiavi]]: dove gli script cercano le chiavi
- [[strumenti]]: cosa gira su ogni superficie
- [[mappa-del-cervello]]: tutto ciò che vive fuori dalla cartella
