# Parte comune a tutte le routine

Ogni procedura in `automazioni/` rimanda qui per avvio, scrittura, battito, salvataggio e connettori. Se una
procedura e questo file dicono cose diverse, vale la procedura per il suo lavoro e questo file per il resto.

## 1. Avvio
1. Lavori sul repository Git del cervello, clonato nella cartella di lavoro.
2. `git checkout main && git pull --rebase origin main`. Se il ramo principale ha un altro nome, è quello scritto in
   `bin/impostazioni.json` alla voce `sincronizza.ramo`: usa quello in tutti i comandi di questo file.
3. Leggi `AGENTS.md`, che contiene il nucleo delle regole, poi le pagine che la procedura indica. Le parti di
   `AGENTS.md` sulla cartella del computer e sulle copie sincronizzate non riguardano le routine: tu lavori sul
   repository e scrivi con Git.

## 2. Scrittura
Scrivi solo i file che la procedura indica.

`wiki/hot.md`: voce nuova **in cima** alla sezione «In corso adesso», al massimo 5 righe, in questa forma (alla fine
una freccia e il link alla pagina con i dettagli):

```
- **AAAA-MM-GG: esito in una frase.** Cosa è cambiato, cosa resta aperto, chi deve muoversi. → [[nome-pagina]]
```

`wiki/log.md`: voce nuova **in fondo**, in questa forma (per una routine bastano le righe che servono):

```
## AAAA-MM-GG. Titolo (routine <nome>)
- Area: [[nome-pagina]]
- Fatto: ...
- Perché: ...
- Non toccato: ...
- Aperti: ...
```

- Quando aggiungi una voce in hot, metti la data di oggi in `updated` nel frontmatter di `wiki/hot.md`: è la data che
  guardano il controllo m e l'hook di avvio. Deve restare una riga sola.
- Questi due file hanno l'unione automatica delle righe (`.gitattributes`): se un'altra routine o un computer
  scrivono insieme a te, Git tiene le righe di tutti e due invece di fermarsi in conflitto. Per questo hot si scrive
  solo aggiungendo in cima e il log solo aggiungendo in fondo. L'unione può lasciare due righe `updated` nel
  frontmatter di hot: se le trovi, tieni solo la più recente.
- Nei testi valgono le regole del nucleo: niente caratteri vietati (`caratteriVietati` in `bin/impostazioni.json`),
  niente segreti né dati personali di terzi, dai documenti si estrae il dato e non si copia il grezzo.

## 3. Battito
A fine giro, anche se non c'era niente da fare, scrivi `automazioni/battiti/<battito>.txt` (il nome è nel campo
`battito` del file della routine in `automazioni/routine/`) con una riga sola, che sostituisce la precedente:

```
AAAA-MM-GG HH:MM esito: ok | niente di nuovo | errore: <cosa>
```

Scegli uno dei tre esiti. Il controllo su GitHub avvisa se il battito manca oltre la cadenza scritta nella tabella
«Battiti» di `automazioni/LEGGIMI.md`.

## 4. Salvataggio
```
git add -A
git commit -m "<Nome routine>: AAAA-MM-GG (routine)"
git pull --rebase origin main
git push origin HEAD:main
```
- Se il pull dà conflitti: tieni **entrambe** le versioni, continua il rebase e riprova, fino a 3 volte.
- Se il push sul ramo principale viene rifiutato, fai push su un ramo `conflitto/<routine>-AAAA-MM-GG` (il prefisso
  è `sincronizza.prefissoConflitti` di `bin/impostazioni.json`, lo stesso della sincronizzazione) e scrivilo nel
  resoconto: così lo unisce il Custode al giro dopo (compito 3) e l'hook di avvio lo mostra sul computer.
- Chiudi sempre dicendo se il push è riuscito.

## 5. Connettori
Passo 0 di ogni procedura che usa un connettore (posta, negozio online, gestionale, cartelle cloud): prima di leggere
qualunque cosa verifica a quale account è collegato. Gli account e gli id attesi stanno in
`wiki/meta/id-sistemi-esterni.md`. Se l'account è sbagliato o non si capisce: non leggere, non scrivere, dillo in cima
al resoconto, scrivi il battito con `esito: errore: connettore su un altro account` e fermati. Non cambiare account da
solo. Sui sistemi esterni si legge; si scrive, si invia o si pubblica solo se la procedura lo prevede e l'utente ha
detto sì a quella operazione (regola [[sistemi-esterni]]).
