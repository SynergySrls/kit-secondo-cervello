---
description: Chiude la sessione nel cervello, con la voce in hot, la voce nel log, i fatti durevoli nelle pagine e gli errori ripetibili trasformati in pagina
---

# /chiudi

La chiusura di sessione di `AGENTS.md`, fatta per intero.

## Cosa fai
1. **Ripassa la sessione.** Cosa è stato fatto, deciso, scoperto, lasciato a metà. Guarda anche i file cambiati
   (`git status`, se c'è Git).
2. **Hot.** Una voce in cima alla sezione «In corso adesso» di `wiki/hot.md`, al massimo 5 righe: data ed esito in una
   frase in grassetto, poi cosa è cambiato, cosa resta aperto, chi deve muoversi, e una freccia con il link alla
   pagina che contiene i dettagli. Metti la data di oggi in `updated` nel frontmatter (una riga sola).
3. **Log.** Una voce in fondo a `wiki/log.md`: titolo `## AAAA-MM-GG. Titolo (superficie)`, poi le righe Area, Fatto,
   Perché, Non toccato, Aperti.
4. **Fatti durevoli nelle loro pagine.** Ciò che deve valere anche tra un mese (un accordo, un numero, un ruolo, una
   decisione) va nella pagina della persona, dell'azienda, del progetto o del concetto, non solo in hot.
5. **Pagine nuove nell'index.** Ogni pagina nata oggi ha la sua riga in `wiki/index.md`, nella sezione giusta.
6. **Superato.** Una pagina sostituita prende `status: superseded` e `superata-da: [nome-pagina-nuova]`; se una frase
   è diventata sbagliata e può essere ancora scritta altrove, aggiungi la riga in `wiki/meta/frasi-superate.md`.
7. **C'è un errore di oggi che può ripetersi?** Se sì, diventa una pagina adesso, non domani: una regola (con
   `/nuova-regola`) o un concetto. Se è una correzione che l'utente ha dovuto ripetere sul modo di scrivere, diventa
   una riga No/Sì in `wiki/concepts/come-scrivere-per-me.md`. Il log da solo non protegge: non lo legge nessuno prima
   di agire (`wiki/concepts/imparare-dagli-errori.md`).
8. **Generati e controlli.** Se hai cambiato una pagina regola o il registro degli strumenti: `node bin/costruisci.mjs`.
   Poi `node bin/controlla.mjs`: i rossi causati da questa sessione si correggono prima di chiudere, gli altri si
   dicono.
9. **Fuori dal cervello.** Se hai creato, spostato o spento qualcosa che vive fuori (una routine, un documento
   pubblicato, una cartella), aggiorna la sua riga in `wiki/meta/mappa-del-cervello.md`.
10. **Salvataggio.** Se il cervello sta su Git: `node bin/sincronizza.mjs`, che salva anche senza repository online
    e, se c'è, scarica e carica. Riporta la riga che stampa: se dice FERMO o CONFLITTO, dillo con le sue parole.
    Senza Node: `git add -A` e `git commit -m "<cosa è cambiato>"`; poi, solo se `git remote` elenca origin,
    `git pull --rebase origin main` e `git push origin main`.
11. **Rispondi** in 3-5 righe: cosa è entrato nel cervello e dove, cosa resta aperto, se il salvataggio è riuscito.

## Cosa non fai
- Non riscrivi le voci vecchie di hot o del log: si aggiunge soltanto (in hot in cima, nel log in fondo). Le voci
  vecchie di hot le archivia il Custode.
- Non cancelli niente: ciò che esce si sposta in `_da_eliminare/` e la cartella la svuota l'utente.
- Non scrivi nel log cose non fatte o non verificate.
- Non chiudi lasciando un rosso causato da te senza dirlo.
- Non scrivi regole in `AGENTS.md`, in `CLAUDE.md` o nelle memorie: una regola è una pagina.
