---
title: "Costruisci (bin/costruisci.mjs)"
type: strumento
tags: [strumento, cervello, regole, nucleo]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Costruisci

## In breve
- Raccoglie le righe «In breve» delle pagine regola e ne fa il [[nucleo]], poi copia il nucleo e la tabella
  «Richiesta → strumento» nei blocchi generati di `AGENTS.md` e della skill del plugin.
- Si lancia dopo ogni modifica a una pagina regola o alla tabella «Richiesta → strumento» di [[strumenti]]. Se una
  pagina è scritta male non scrive niente e dice cosa correggere.
- Con `--esporta` prepara il pacchetto di file da caricare nelle chat che non vedono la cartella.

## Come si lancia
Dalla cartella del cervello:
```
node bin/costruisci.mjs              rigenera nucleo, blocchi generati, versione del plugin e marketplace
node bin/costruisci.mjs --verifica   non scrive niente: dice se qualcosa è rimasto indietro
node bin/costruisci.mjs --elenco     tabella delle regole: nome, ambito, nucleo, ordine
node bin/costruisci.mjs --esporta    pacchetto per le chat nella cartella esporta/
node bin/costruisci.mjs --esporta --txt   lo stesso, con i file di conoscenza in .txt (per chi non accetta i .md)
node bin/costruisci.mjs --aiuto      come si usa
```
Si usa un'opzione alla volta (`--txt` va solo insieme a `--esporta`). Codici d'uscita: 0 tutto in ordine; 1 problemi trovati (una pagina da correggere,
`bin/impostazioni.json` illeggibile, oppure con `--verifica` qualcosa è indietro); 2 opzione sconosciuta o errore
d'uso.

## Cosa legge
- `bin/impostazioni.json`: l'elenco degli ambiti con i loro titoli, i caratteri vietati, i limiti, il nome del
  marketplace.
- Le pagine regola: tutti i file `.md` sotto `wiki/`, tranne `wiki/meta/`, che hanno `type: regola` e uno `status`
  diverso da `superseded` e `archived`.
- La sezione «Regola d'ambito» della pagina indicata in `fileRegolaAmbito` (di solito [[ambito]]).
- La tabella «Richiesta → strumento» di `wiki/meta/strumenti.md`.

## I controlli prima di scrivere
Se uno solo non passa, lo script non scrive niente, stampa il file e cosa correggere ed esce con 1:
- ogni pagina regola ha il `title`;
- `ambito` è scritto in minuscolo, con lettere, cifre e trattini (`tutto`, `scrittura`, ...);
- `nucleo` vale sì o no (vanno bene anche si, yes, true, false);
- c'è la sezione «In breve» con da 1 a 4 righe che iniziano con `- `;
- nell'In breve e nel titolo non ci sono i caratteri vietati di `impostazioni.json`;
- in tutto il cervello non ci sono due file con lo stesso nome di una pagina regola;
- la pagina d'ambito ha la sezione «Regola d'ambito».

## Cosa scrive
Scrive un file solo se il contenuto cambia davvero: il confronto si fa senza le date, così rilanciarlo senza
modifiche non produce differenze.
1. **Il nucleo**, `wiki/meta/nucleo.md`: in testa il paragrafo della «Regola d'ambito»; poi le regole con
   `nucleo: sì`, raggruppate per ambito nell'ordine dell'elenco `ambiti` (un ambito che non è nell'elenco va in
   fondo, con la chiave come titolo), e dentro ogni ambito ordinate per `ordine` (se manca vale 1000) e poi per
   titolo; poi la tabella «Richiesta → strumento» copiata così com'è; in fondo «Le altre regole», cioè i link alle
   regole con `nucleo: no` (se non ce ne sono: «Nessuna, per ora.»).
2. **I blocchi generati**, cioè il testo tra una riga `<!-- genera: TIPO -->` e una riga `<!-- fine: TIPO -->`. Li
   cerca in `AGENTS.md` e in ogni `SKILL.md` sotto `automazioni/`. Il tipo `nucleo` riceve il nucleo con i titoli
   abbassati di un livello (in `AGENTS.md` intero, nella skill senza la tabella degli strumenti); il tipo
   `instradamento` riceve solo la tabella «Richiesta → strumento». Il resto di quei file è scritto a mano e lo
   script non lo tocca.
3. **La versione dei plugin.** Per ogni cartella sotto `automazioni/` che contiene `.claude-plugin/plugin.json`
   calcola un'impronta dei file (tolte le righe «Generato il ...», così una data nuova non conta come modifica) e la
   tiene in `.claude-plugin/impronte.json`, alla radice del cervello. La prima volta scrive solo l'impronta; dalle
   volte dopo, se l'impronta cambia, alza l'ultima cifra della versione in `plugin.json` (per esempio da 0.1.0 a
   0.1.1). Poi rigenera `.claude-plugin/marketplace.json` dalle impostazioni e dai `plugin.json`.

Alla fine controlla che il nucleo non contenga caratteri vietati e che `AGENTS.md` resti sotto il limite di
`limiti.agentsKB` (32 KB nelle impostazioni del modello): se lo supera, avvisa ma non si ferma.

## Il pacchetto per le chat (`--esporta`)
Serve alle AI che non vedono la cartella e ricevono il cervello come file caricati (un progetto di chat, un
assistente personalizzato). Cancella e ricrea solo la cartella `esporta/`, che non va su Git. Dentro:
- `istruzioni-chat.md`: chi è la persona (la sezione «Chi» di `AGENTS.md`), i lavori delicati (la sezione «Seconda
  azione»), come usare i file di conoscenza (dire all'inizio che è una copia di sola lettura e di quale data, poi
  `conoscenza-01-inizio.md`; i comandi `node` e `/` girano solo sul computer), la nota per il cervello per intero
  (quando scatta, il nome del file fuori dal blocco, la forma di `_modelli/nota-inbox.md`) e il nucleo senza «Le
  altre regole» e senza la tabella «Richiesta → strumento», che in chat non serve (sta nel primo file di conoscenza).
  Se il file supera `limiti.istruzioniChat` caratteri (8.000 nel modello), lo script avvisa con la misura e le sezioni
  più lunghe.
- `istruzioni-brevi.md`: per le istruzioni personali di una piattaforma, che valgono in tutte le chat ma hanno poco
  spazio: «Chi», la regola d'ambito, le righe «In breve» delle regole di scrittura e la nota per il cervello in una
  riga. Avvisa oltre `limiti.istruzioniBrevi` (5.000).
- `conoscenza-01-inizio.md` (hot, index, nucleo, registro degli strumenti e il modello della nota per il cervello) e
  `conoscenza-02-regole.md` (tutte le pagine regola intere in vigore; le superate restano fuori).
- Un file per ogni sottocartella di primo livello di `wiki/` che ha pagine (persone, aziende, fonti, concetti che
  non sono regole, altre), diviso in parti quando supera `limiti.fileEsportaKB`. In tutto non più di
  `limiti.fileEsportaMax` file: se ne servirebbero di più, avvisa e li accorpa (e dice quale file supera la misura,
solo se succede).
- Se nelle istruzioni o nei file di conoscenza restano segnaposto da compilare, avvisa e dice in quali pagine (quelle
  di servizio, `wiki/meta/`, no: hanno segnaposto del livello 3).

Ogni file inizia con «Esportato il AAAA-MM-GG HH:MM dal commit <hash breve>» (o «senza Git») e «Copia di sola
lettura: la fonte è il cervello.», e ogni pagina dentro è introdotta da una riga `===== wiki/percorso.md =====`.
Restano fuori le pagine con `riservato: true` o `esporta: no` (per esempio le pagine degli script, che servono solo
sul computer), la sezione «Trappole dell'ambiente» del registro degli strumenti, lo [[stato-controlli]] e gli
archivi di hot. Con `--txt` i file di conoscenza escono con l'estensione `.txt` e le istruzioni li citano così.

## Per chi scrive altri script
Lo script si può anche importare: espone `leggiImpostazioni()`, `frontmatter(testo)`, `sezione(testo, titolo)`,
`trovaRegole()` e `costruisci({ scrivi: false })`, che restituisce l'elenco delle differenze senza scrivere. Il
[[controlla]] se ne serve per il controllo h (file generati aggiornati).

## Cosa NON fa
- Non modifica le pagine regola e non corregge gli errori che trova: li dice.
- Non decide quali regole entrano nel nucleo: lo decide il campo `nucleo` di ogni pagina.
- Non tocca la parte scritta a mano di `AGENTS.md` e delle skill, solo i blocchi generati.
- Non carica i plugin sull'account e non manda niente in rete: il marketplace è un file che la piattaforma legge dal
  repository collegato.
- Non cancella niente fuori da `esporta/`.

## Dove gira
Ovunque ci siano Node 18 o più recente e la cartella del cervello: sul computer, nelle routine nel cloud (lavorano
sul repository clonato) e nel controllo su GitHub. Nessuna dipendenza da installare. Il controllo automatico dopo
ogni modifica ([[hook]]) ricorda di lanciarlo quando una pagina regola o il registro sono cambiati e il nucleo è
rimasto indietro.

## Collegamenti
- [[nucleo]]: il risultato.
- [[fonte-unica]]: perché le regole si scrivono una volta sola, nelle loro pagine.
- [[strumenti]]: il registro, con la tabella «Richiesta → strumento».
- [[controlla]]: il controllo h verifica che i file generati siano aggiornati.
