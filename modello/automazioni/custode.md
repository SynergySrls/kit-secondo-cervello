---
title: "Procedura: Custode del cervello"
type: procedura
tags: [procedura, custode, manutenzione]
status: current
created: 2026-11-03
updated: 2026-11-03
---

# Procedura: Custode del cervello

> **Cosa fa.** Tiene in ordine il cervello senza l'utente: integra le note lasciate dalle chat che non possono
> scrivere, archivia le voci vecchie di `wiki/hot.md`, unisce i rami di conflitto della sincronizzazione, rigenera i
> file generati rimasti indietro e, la domenica, segnala le fonti di `.raw/` ancora da far entrare.
> **Quando gira.** Ogni sera, con la routine in `automazioni/routine/routine-custode.md`, sul repository Git.
> **Questa pagina è la procedura intera.** Avvio, scrittura, battito, salvataggio e connettori:
> `automazioni/_comune.md`. Se il prompt della routine e questa pagina dicono cose diverse, vale la pagina.

## Modalità
Il prompt della routine contiene una riga `MODALITA: rapporto` oppure `MODALITA: azione`.
- **rapporto** (si parte così): per ogni compito scrivi solo cosa faresti, senza toccare i file. La voce di log, il
  battito e il salvataggio si fanno lo stesso.
- **azione**: fai i compiti.

Si passa ad azione quando l'utente, dopo qualche giro in rapporto, ha visto che le proposte sono giuste: cambia la
riga nel file della routine e allinea con `/allinea-routine`.

## Autonomia
In modalità azione scrive nel cervello senza chiedere, ma è conservativo: ciò che non è certo si marca *(da
verificare)*, una contraddizione con il cervello si segnala con `> [!contradiction]` e non si risolve d'ufficio. Non
cancella niente: sposta, archivia, segnala. Ogni regola del nucleo vale anche qui.

## 1. Note per il cervello
Le chat che non possono scrivere nel cervello lasciano una nota (modello `_modelli/nota-inbox.md`) in uno di questi
posti:
- la cartella `.raw/inbox/` del repository;
- la casella cloud, se l'utente ne ha una (è la strada delle note scritte dal telefono): {{DA COMPILARE: cartella cloud delle note e connettore che la legge, se c'è; altrimenti scrivi «nessuna»}}.
  Prima di leggerla, il passo 0 dei connettori di `automazioni/_comune.md`: l'account giusto sta in
  `wiki/meta/id-sistemi-esterni.md`. Nella casella si leggono e si spostano le note, non si modificano.

Per ogni nota, dalla più vecchia:
1. Leggila e decidi dove va: una pagina esistente da aggiornare, una fonte nuova in `wiki/sources/`, una pagina entità
   nuova, una voce di hot o di log. Prima di scrivere cerca se la pagina c'è già: mai una seconda pagina per lo stesso
   soggetto.
2. Integrala seguendo `AGENTS.md` e, per le fonti, `automazioni/ingestione.md`.
3. Spostala in `.raw/inbox/integrate/AAAA-MM/` (mese di oggi), con `git mv` se è già nel repository. Una nota della
   casella cloud si copia lì con lo stesso nome; poi, se il connettore lo permette, l'originale si sposta in una
   sottocartella `integrate` della casella, altrimenti resta dov'è e lo scrivi nel resoconto (al giro dopo la
   riconosci perché la copia esiste già e non la rifai).

Eccezioni:
- Una nota che contiene una decisione da prendere non si integra: resta dov'è e va nel resoconto, con la domanda per
  l'utente.
- Una nota che contiene segreti (password, chiavi, codici di accesso) o dati personali di terzi non si integra, non si
  copia nel repository e non si sposta: va nel resoconto senza riportare il valore.

## 2. Voci vecchie di hot
In `wiki/hot.md`, sezione «In corso adesso», le voci con data più vecchia di 14 giorni (il numero sta in
`bin/impostazioni.json`, `hot.giorni`) si spostano, **con il testo invariato, parola per parola**, in
`wiki/meta/hot-archivio-AAAA-MM.md`, dove AAAA-MM è il mese della voce. Se l'archivio del mese non esiste, lo crei con
questo frontmatter e una riga di spiegazione:

```
---
title: "Archivio di hot, AAAA-MM"
type: meta
status: archived
created: AAAA-MM-GG
---

# Archivio di hot, AAAA-MM

Voci tolte da hot perché più vecchie di 14 giorni, copiate parola per parola, nell'ordine originale.
```

Nell'archivio le voci vanno nello stesso ordine che avevano in hot. In hot non resta la voce; se in cima a hot c'è un
elenco degli archivi, aggiungi quello nuovo. Un archivio esistente non si rinomina mai: potrebbe essere già citato.

Se il frontmatter di hot ha due o più righe `updated` (le lascia l'unione automatica di Git), tieni solo quella con la
data più recente. Se una voce che è già nell'archivio è tornata in hot con l'unione automatica, toglila da hot e
dillo nel resoconto.

## 3. Rami di conflitto della sincronizzazione
Quando la sincronizzazione di un computer trova un conflitto, parcheggia il suo lavoro su un ramo che inizia con il
prefisso `sincronizza.prefissoConflitti` di `bin/impostazioni.json` (nel modello `conflitto/`). Lo stesso fa una
routine il cui push viene rifiutato (`automazioni/_comune.md`, salvataggio).
1. `git fetch origin` ed elenca i rami `origin/conflitto/*`.
2. Per ognuno non ancora unito: `git merge --no-ff origin/<ramo>` sul ramo principale.
3. Nei conflitti: quando sono voci indipendenti (log, hot, registri, tabelle) tieni **tutte e due**; quando sono due
   versioni dello stesso testo, tieni la più recente e scrivi nel resoconto quale hai scelto e perché.
4. Push sul ramo principale. La sincronizzazione del computer si accorge da sola che il ramo è stato unito e riparte.
5. Il ramo non si cancella: resta finché l'utente non decide.

## 4. File generati
Lancia `node bin/costruisci.mjs --verifica`. Se esce con 1 (nucleo o blocchi generati indietro), in modalità azione
lancia `node bin/costruisci.mjs` e dillo nel resoconto. Se lo script si ferma perché una pagina regola è scritta male,
non correggere la regola: segnala file e problema nel resoconto.

## 5. Fonti da far entrare (solo la domenica)
Le fonti grezze di `.raw/` restano sul computer e non sono nel repository (`.gitignore`: contengono dati di altre
persone): la routine non le vede e non le ingerisce. Il compito è un altro: cerca in `automazioni/` i registri delle
ingestioni ricorrenti (per esempio `automazioni/registro-*.md`) e le pagine fonte con `status: draft`, e scrivi nel
resoconto quali aspettano da più di una settimana. Le fonti si fanno entrare sul computer, con `/ingerisci` o con il
prompt D di manutenzione.

## 6. Resoconto e chiusura
1. **Resoconto**, al massimo 10 righe: note integrate o segnalate, voci archiviate, rami uniti, file rigenerati, fonti
   entrate, cose che richiedono l'utente (in cima, in ordine di urgenza). In modalità rapporto: cosa faresti per
   ciascun compito.
2. **Log**: una voce in fondo a `wiki/log.md`, titolo `## AAAA-MM-GG. Custode (routine)`.
3. **Battito** `custode`, come in `automazioni/_comune.md`.
4. **Salvataggio** come in `automazioni/_comune.md`, con il messaggio «Custode: AAAA-MM-GG (routine)». Chiudi
   dicendo se il push è riuscito.

## Cosa non fare
- Non cancellare niente: né note, né rami, né voci. Ciò che esce si sposta (le note in `.raw/inbox/integrate/AAAA-MM/`,
  le voci di hot nel loro archivio, il resto in `_da_eliminare/` se lo chiede l'utente).
- Non riscrivere le voci archiviate: il testo resta quello di hot.
- Non correggere le pagine regola né prendere decisioni che spettano all'utente: si segnalano.
- Non recuperare l'arretrato di `.raw/` oltre le cinque fonti della domenica.
