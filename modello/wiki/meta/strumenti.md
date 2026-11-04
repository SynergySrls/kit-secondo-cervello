---
title: "Strumenti: cosa c'è, dove gira, come si usa"
type: meta
status: evergreen
created: 2026-11-03
updated: 2026-11-03
tags: [meta, strumenti, registro, instradamento]
---

# Strumenti

Registro unico degli strumenti del cervello. Si legge prima di dire che uno strumento non esiste e prima di
costruirne uno nuovo ([[strumento-giusto]]).

## Le regole

1. Gli strumenti del cervello sono script nella cartella `bin/`: non connettori, non skill, non servizi esterni. Si
   cercano qui e in `bin/`.
2. Prima di dire «non esiste» o «non lo trovo» si legge questa pagina e si elenca `bin/`. Se lo strumento c'è ma non fa
   esattamente quello che serve, si dice cosa fa e cosa no, e lo si estende: mai un secondo strumento sullo stesso
   compito.
3. Prima si guarda dove si sta lavorando (tabella «Dove sto lavorando?»): se lo strumento lì non gira, lo si dice in
   una riga e si indica dove gira.
4. Gli script si lanciano dalla cartella del cervello, con `node` seguito dal percorso dello script. La configurazione
   di tutti sta in un file solo, `bin/impostazioni.json`.
5. Le chiavi non si leggono, non si stampano e non si scrivono qui: gli script le trovano con `bin/lib/chiavi.mjs`.
6. Uno strumento nuovo è tre cose nello stesso lavoro: lo script in `bin/`, la pagina in `wiki/entities/strumenti/`,
   una riga in «Gli strumenti». Se risponde a una richiesta frequente, anche una riga in «Richiesta → strumento», poi
   `node bin/costruisci.mjs`, che copia la tabella nel nucleo. La tabella entra nelle istruzioni di ogni AI: si tiene
   corta.

## Richiesta → strumento

Si usa lo strumento indicato, senza chiedere quale ([[strumento-giusto]]). La prima colonna la legge anche il
controllo automatico `instrada` ([[hook]]).

| Parole tipiche | Strumento, per primo | Dove gira | Da non usare | Pagina |
|---|---|---|---|---|
| nuova regola, regola nuova, cambiare una regola, cambia una regola, nucleo | `/nuova-regola`, o la pagina e poi `node bin/costruisci.mjs` | computer con Node | regole in `AGENTS.md` o nelle memorie; nucleo a mano | [[fonte-unica]] |
| controlla il cervello, controllo del cervello, link rotti, segnaposto | `node bin/controlla.mjs` ([[stato-controlli]] lo scrive GitHub; senza repository online `--scrivi`) | computer, GitHub | stato dei controlli a mano | [[controlla]] |
| sincronizza, sincronizzazione, salva su github, salvataggio su github, conflitto di sincronizzazione | `node bin/sincronizza.mjs` (`--stato`) | computer principale con Git | una cartella sincronizzata | [[sincronizza]] |
| ingerisci, ingestione, fonte nuova, archivia | `/ingerisci` o `automazioni/ingestione.md` | dove si scrive | il file intero nel cervello | [[ingestione]] |
| chiudi, chiusura, fine sessione | `/chiudi` (chiusura di `AGENTS.md`) | dove si scrive | chiudere senza hot e log | [[log]] |
| altra ai, altre ai, chat esterna, esporta, file di conoscenza | `node bin/costruisci.mjs --esporta` | computer con Node | pagine copiate a mano nelle chat | [[costruisci]] |
| chiave, password, token, credenziali, segreto | `node bin/lib/chiavi.mjs --verifica` (mai il valore) | computer | file delle chiavi letti o stampati | [[chiavi]] |
| avviso, telefono, telegram, notifica | `node bin/avvisa.mjs "testo"` | computer, GitHub | | [[avvisa]] |
| strumento nuovo, script nuovo, strumento che non esiste, script che non trovo, manca uno strumento | [[strumenti]] e `bin/`: si estende quello che c'è | ovunque | un secondo strumento | [[strumento-giusto]] |

## Dove sto lavorando?

| | Computer con un agente nella cartella | Routine nel cloud | Chat senza cartella |
|---|---|---|---|
| Legge il cervello | sì, la cartella | sì, il clone del repository | solo una copia (plugin, file caricati, connettore): lo dice |
| Scrive nel cervello | sì | sì, con commit e push (`automazioni/_comune.md`) | no: prepara una nota per `.raw/inbox/` |
| Node e gli script di `bin/` | sì, con Node 18 o più recente | di solito sì: si verifica con `node --version` | no |
| Chiavi della cartella privata | sì, con `bin/lib/chiavi.mjs` | no: solo variabili d'ambiente, se configurate | mai |
| Controlli automatici di Claude Code | sì, se l'agente è Claude Code e la cartella è attendibile | dove gira Claude Code, salvo `hook.spentiSu` in `bin/impostazioni.json` | no |
| Git e sincronizzazione | sì: `node bin/sincronizza.mjs` ogni 10 minuti sul computer principale | sì, a ogni giro | no |
| A computer spento | si ferma | gira | gira, in sola lettura |

## Gli strumenti

| Strumento | Script | Cosa fa | Cosa NON fa | Dove gira | Pagina |
|---|---|---|---|---|---|
| Costruisci | `bin/costruisci.mjs` | Dalle pagine regola genera il nucleo (`wiki/meta/nucleo.md`), i blocchi in `AGENTS.md` e nella skill del plugin, la versione del plugin e il marketplace; prima controlla che ogni pagina regola sia in ordine. `--verifica` esce 1 se qualcosa è indietro, `--elenco` mostra le regole, `--esporta` prepara il pacchetto per le chat in `esporta/` (con `--txt` i file di conoscenza escono come .txt) | Non carica niente sugli account delle AI: il marketplace lo leggono loro dal repository | computer con Node, GitHub, routine | [[costruisci]] |
| Controlla | `bin/controlla.mjs` (su GitHub con `.github/workflows/controllo.yml`) | Controlla il cervello in sola lettura: percorsi e link rotti, caratteri vietati, frasi superate, segreti, registro degli strumenti, frontmatter, file generati, battiti, doppioni, segnaposto. `--scrivi` aggiorna [[stato-controlli]] (solo senza repository online: con il repository lo fa GitHub), `--json`, `--segreti` su file scelti | Non corregge niente; trova solo ciò che gli si elenca (una frase superata va registrata in [[frasi-superate]]) | computer con Node; GitHub ogni giorno e a ogni salvataggio | [[controlla]] |
| Avvisa | `bin/avvisa.mjs` | Manda un messaggio Telegram. Con `--da-controllo` manda subito i rossi di segreti e battiti, e il lunedì (o lanciato a mano su GitHub) una riga di riepilogo anche se è tutto verde. `--verifica` dice se trova token e chat, `--trova-chat` dà il numero della chat | Senza chiavi scrive solo sulla console ed esce 0: se il riepilogo del lunedì non arriva, è rotto il canale | computer, GitHub con i segreti del repository | [[avvisa]] |
| Sincronizza | `bin/sincronizza.mjs` | Salva la cartella nel repository Git e la allinea: tiene fuori dal salvataggio i file con segreti e quelli oltre 50 MB, parcheggia un conflitto su un ramo a parte, nei giri pianificati scrive il battito una volta al giorno. `--prova`, `--pausa`, `--riprendi`, `--secondario`, `--stato`; `--pianificato` lo usa l'attività pianificata | Non unisce i rami di conflitto (lo fa il Custode); non apre finestre e non fa domande | computer principale con Git; sui secondari senza battito | [[sincronizza]] |
| Installa la sincronizzazione | `bin/installa-sincronizzazione.mjs` | Pianifica la sincronizzazione ogni 10 minuti su Windows, macOS o Linux. Senza opzioni mostra cosa farebbe, `--fai` lo fa, `--togli` la toglie | Non installa Git né Node | computer | [[sincronizza]] |
| Controlli automatici | `bin/hooks/` (`avvio`, `instrada`, `dopo-modifica`, `proteggi`, parti comuni in `comune.mjs`) | All'avvio lo stato in poche righe; a ogni messaggio lo strumento giusto; dopo ogni modifica caratteri vietati, segreti e nucleo da rigenerare; prima di un comando o di una lettura nega quelli che mostrerebbero un segreto | Non correggono e non fermano il lavoro, tranne i comandi che mostrerebbero un segreto | Claude Code nella cartella | [[hook]] |
| Chiavi | `bin/lib/chiavi.mjs` | Trova le chiavi per gli altri script: prima le variabili d'ambiente, poi la cartella privata (`chiavi.cartella` in `bin/impostazioni.json`, oppure `CERVELLO_CHIAVI_DIR`). `--verifica` dice dove trova ciascuna | Non stampa mai un valore | computer; nel cloud solo variabili d'ambiente | [[chiavi]] |

## Trappole dell'ambiente

- **PowerShell apre finestre.** Su Windows un `powershell.exe` lanciato da un terminale bash o da un'attività
  pianificata apre una finestra visibile. Dagli agenti si usa lo strumento PowerShell; nelle attività pianificate si
  mette `conhost.exe --headless` davanti al comando, come fa l'installazione della sincronizzazione.
- **PowerShell 5.1 legge male i `.ps1` senza BOM.** Un file salvato in UTF-8 senza BOM viene letto come ANSI: le
  lettere accentate diventano caratteri sbagliati e possono rompere le stringhe. Gli script `.ps1` si scrivono solo in
  ASCII o si salvano con BOM; per scrivere file da PowerShell si passa `-Encoding utf8`. Gli strumenti del kit sono in
  Node anche per questo.
- **Cartelle sincronizzate.** Il cervello e i file di Git non stanno dentro una cartella sincronizzata nei due sensi
  (Drive, OneDrive, Dropbox e simili). Il connettore di un archivio cloud spesso crea un file omonimo invece di
  modificarlo e nascono doppioni «(1)»: `node bin/controlla.mjs` li segnala ([[dove-si-lavora]]).
- **Percorsi con spazi e barre rovesciate.** Nei comandi i percorsi con spazi vanno tra virgolette. Nei terminali bash
  su Windows si scrivono con le barre normali (`C:/Users/...`), perché le barre rovesciate vengono interpretate; per
  lo stesso motivo un testo su più righe passato a un comando bash (heredoc) si scrive con il delimitatore tra
  virgolette singole, oppure il file si scrive con gli strumenti di modifica dei file.

Collegate: [[strumento-giusto]] · [[hook]] · [[index]]
