# Automazioni: tutto ciò che il cervello manda fuori

Questa cartella contiene le procedure delle routine, il testo esatto dei loro prompt, i battiti e le fonti dei
plugin. **Ogni file qui è una fonte, non una copia**: si cambia qui, e da qui si allineano le routine e l'account.
Le regole non stanno qui: stanno nelle pagine regola, riassunte nel nucleo che `AGENTS.md` contiene.

## Cosa c'è

| File o cartella | Cosa contiene |
|---|---|
| `automazioni/_comune.md` | avvio, scrittura, battito, salvataggio e connettori: la parte uguale per tutte le routine |
| `automazioni/custode.md` | la procedura serale che tiene in ordine il cervello |
| `automazioni/ingestione.md` | la procedura per far entrare una fonte nel cervello, a mano o con una routine |
| `automazioni/routine/` | un file per routine, `routine-<nome>.md`, con il testo esatto del prompt |
| `automazioni/battiti/` | un file per automazione con la data e l'esito dell'ultimo giro |
| `automazioni/plugin-cervello/` | il plugin che porta istruzioni e nucleo nelle chat senza cartella |
| `registro-<fonte>.md` | il registro di una fonte ricorrente (cosa è già entrato), creato al primo giro da `automazioni/ingestione.md` |

## Le routine

Una routine è un lavoro che un'AI fa da sola a orari fissi, nel cloud, sul repository del cervello. Il prompt della
routine è corto e uguale per tutte: dice di aprire la procedura e `automazioni/_comune.md`. Il lavoro vero sta nella
procedura, che ha una storia e si corregge con un salvataggio. Il prompt si cambia nel suo file in
`automazioni/routine/` e poi si allinea l'account con `/allinea-routine`: mai a mano sull'account, altrimenti il file e
la routine divergono. Una routine si crea su un account solo: copiata su un secondo account girerebbe due volte.

| Routine | Stato | Dove gira | Quando | Procedura | Cosa scrive | Battito |
|---|---|---|---|---|---|---|
| Custode del cervello (`automazioni/routine/routine-custode.md`) | spenta | cloud, dal repository | ogni giorno alle 21:30 | `automazioni/custode.md` | note di `.raw/inbox/` (e della casella cloud) integrate, archivio di hot, rami di conflitto uniti, fonti in attesa segnalate la domenica, log | custode |

Il Custode parte in modalità «rapporto» (scrive solo cosa farebbe). Dopo qualche giro corretto si cambia la riga
`MODALITA` nel suo file e si allinea la routine. Quando si accende una routine, si aggiorna qui la colonna «Stato» e si
aggiunge il suo battito nella tabella qui sotto.

## Battiti

Ogni automazione, a fine giro, scrive in `automazioni/battiti/<nome>.txt` una riga sola:
`AAAA-MM-GG HH:MM esito: ok`, oppure `esito: niente di nuovo`, oppure `esito: errore: <cosa>`.
Il controllo (`node bin/controlla.mjs`, controllo i) confronta la data con la cadenza scritta qui sotto: rosso se il
battito è più vecchio della cadenza più un giorno, giallo «non ancora partito» se il file non c'è ancora. Le cadenze
che il controllo capisce: «ogni giorno», «ogni N giorni», «settimanale», «mensile».

| Battito | Chi lo scrive | Cadenza |
|---|---|---|
| sincronizza | lo script di sincronizzazione del computer principale (`bin/sincronizza.mjs --pianificato`, cioè l'attività pianificata), al primo giro del giorno; i giri a mano non lo scrivono; il computer può restare spento nel fine settimana | ogni 3 giorni |
| custode | la routine Custode del cervello, a fine giro | ogni giorno |

## Le fonti dei plugin

| Cartella | Plugin | Cosa contiene |
|---|---|---|
| `automazioni/plugin-cervello/` | `cervello` | la skill `cervello`: come iniziare un lavoro, il nucleo delle regole e la tabella «Richiesta → strumento» |

- **Blocchi generati.** Le parti tra `<!-- genera: ... -->` e `<!-- fine: ... -->` le scrive `node bin/costruisci.mjs`
  dalle pagine regola e dal registro degli strumenti: non si correggono a mano, si corregge la pagina e si rilancia lo
  script. Il resto dei file è scritto a mano e non contiene regole.
- **Versione.** La alza lo stesso script quando il contenuto del plugin cambia (la versione sta in
  `automazioni/plugin-cervello/.claude-plugin/plugin.json`), e rigenera il catalogo dei plugin del cervello in
  `.claude-plugin/marketplace.json`, alla radice.
- **Niente copie a mano.** Il plugin arriva all'account collegando il repository come catalogo di plugin: una copia
  caricata a mano prima o poi diverge dalla fonte.
