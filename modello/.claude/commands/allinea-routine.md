---
description: Confronta i prompt delle routine salvati nel cervello con le routine dell'account e li allinea, con un sì dell'utente per ogni modifica
---

# /allinea-routine

La fonte dei prompt è il cervello: `automazioni/routine/routine-*.md`. L'account dove girano le routine è la
destinazione.

## Cosa fai
1. **Leggi i file.** Per ogni file in `automazioni/routine/`: `id`, `account`, `stato`, `cron`, il testo del blocco
   «Prompt» e la data `testo-verificato`.
   **Prima di toccare l'account:** chiedi all'utente (o leggi dallo strumento delle routine) con quale account è aperta
   questa sessione e confrontalo con il campo `account`. Se è diverso, fermati: le routine vivono su un account solo.
2. **Leggi le routine dell'account.**
   - Se questa sessione ha uno strumento che legge e aggiorna le routine dell'account, usalo per ogni file con un `id`.
   - Se non ce l'ha, chiedi all'utente di incollare, per ogni routine, il prompt attuale, lo stato (accesa o spenta) e
     l'orario, copiandoli dalla pagina delle routine del servizio.
   Se un `id` non si trova nell'account di questa sessione, fermati e non creare niente: quasi sempre è l'account
   sbagliato. Dillo all'utente con il nome dell'account atteso.
3. **Confronta** testo del prompt, stato, orario (e connettori, se il file li elenca). Mostra una tabella: routine,
   cosa differisce, quale versione sembra più recente (`testo-verificato` del file contro la data di modifica della
   routine, se si conosce).
4. **Se la routine è stata cambiata a mano sull'account** dopo l'ultima verifica: prima riporta la modifica nel file
   del cervello (è la fonte), mostrala all'utente, poi riparti dal punto 3.
5. **Per allineare l'account al file:** chiedi il sì dell'utente per ogni modifica, routine per routine. Dopo
   l'aggiornamento rileggi la routine e verifica che siano cambiati solo i campi voluti. Senza strumento: dai
   all'utente il testo esatto da incollare e aspetta che confermi.
6. **Routine nuova** (file con `id` vuoto): solo se l'utente lo chiede, creala con quel prompt, spenta salvo un sì
   esplicito ad accenderla; poi scrivi l'`id` nel file.
7. **Aggiorna** nel file `testo-verificato` (data di oggi) e `stato`; se lo stato è cambiato, aggiorna la colonna
   «Stato» in `automazioni/LEGGIMI.md` (e la tabella «Battiti» se una routine si accende) e la riga in
   `wiki/meta/mappa-del-cervello.md`. Una voce in fondo a `wiki/log.md`.

## Cosa non fai
- Non crei, non accendi e non spegni una routine senza un sì esplicito dell'utente per quella routine.
- Non cambi il prompt sull'account senza aver prima allineato il file: il file viene prima.
- Non ricrei su un altro account routine che esistono già: girerebbero due volte. Un `id` che non si trova non è un
  motivo per crearla di nuovo.
- Non metti nel prompt regole, id o passi di lavoro: il prompt resta corto e rimanda alla procedura in
  `automazioni/`.
