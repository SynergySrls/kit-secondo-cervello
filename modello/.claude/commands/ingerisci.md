---
description: Fa entrare nel cervello le fonti di .raw o il file o la cartella indicati, con la procedura di ingestione
argument-hint: "[file o cartella]"
---

# /ingerisci

Argomento: $ARGUMENTS

## Cosa fai
1. Apri `automazioni/ingestione.md` e seguila dall'inizio alla fine: è la procedura intera.
2. Su cosa lavori:
   - se l'argomento è vuoto: tutti i file di `.raw/` che non risultano ancora entrati nel registro dei file a mano
     (la procedura dice come si chiama e come si crea al primo giro), esclusa la cartella `.raw/inbox/`;
   - se l'argomento è un file o una cartella: solo quello. Se sta fuori da `.raw/` lo leggi dove sta e non lo copi.
   - le note per il cervello in `.raw/inbox/` le tratti come dice il compito 1 di `automazioni/custode.md`, solo se
     l'argomento le indica (`/ingerisci .raw/inbox`).
3. Prima di cominciare, se i file sono più di dieci o molto grandi, dì quanti sono e in che ordine li prendi (per data
   di arrivo, dal più vecchio). Poi vai avanti senza aspettare.
4. Per ogni fonte: pagina in `wiki/sources/`, pagine dei soggetti create o aggiornate, link nei due sensi, incertezze
   marcate, contraddizioni segnalate, registro aggiornato.
5. Alla fine: voce in hot, voce nel log, righe nuove nell'index, `node bin/controlla.mjs` sui rossi che hai causato,
   e il resoconto della procedura.

## Cosa non fai
- Non copi testi grezzi o trascrizioni intere nel cervello: estrai i fatti e linki l'originale.
- Non modifichi, non sposti e non cancelli gli originali di `.raw/`.
- Non completi le pagine con conoscenza generica o ricerche esterne: solo ciò che la fonte dice.
- Non scrivi segreti né dati personali di terzi.
- Non recuperi l'arretrato di una fonte ricorrente se l'utente non lo chiede.
