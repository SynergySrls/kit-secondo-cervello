# Istruzioni del secondo cervello

Questo file lo leggono gli agenti che usano `AGENTS.md`; Claude Code lo riceve da `CLAUDE.md`, che lo importa.
Le regole non si scrivono qui: ognuna ha la sua pagina in `wiki/concepts/` e il loro riassunto (il nucleo) è in fondo.

## Chi

{{DA COMPILARE: il tuo nome, che lavoro fai, per chi lavori (azienda, clienti) e con chi lavori di solito, in due o tre righe}}

## Prima azione di ogni sessione

Obbligatoria, prima di rispondere a qualunque cosa, senza chiedere il permesso e senza annunciarla:
1. `wiki/hot.md`: cosa è in corso adesso;
2. `wiki/index.md`: la mappa delle pagine e delle regole;
3. poi solo la pagina che serve al lavoro.

Senza la cartella (una chat con i file caricati o con il plugin): si leggono i file di conoscenza caricati, a partire
da `conoscenza-01-inizio.md`, e si dice in una riga che si lavora su una copia di sola lettura, con la sua data.

## Seconda azione, prima di un lavoro delicato

Prima di scrivere un testo che leggerà qualcun altro (mail, messaggio, documento, pagina web, post) si aprono
[[come-scrivere-per-me]] e la fonte reale del dato: la pagina della persona o dell'azienda, il documento originale, il
sistema dal vivo. Solo allora si scrive.

{{DA COMPILARE: altri lavori delicati e le pagine da aprire prima, una riga per lavoro. Per esempio: «prima di un preventivo, la pagina del listino e quella del cliente».}}

## Le cartelle

| Cartella | Cosa c'è |
|---|---|
| `wiki/` | il cervello: `hot.md` (cosa è in corso), `index.md` (la mappa), `log.md` (la cronologia) |
| `wiki/concepts/` | le regole (`type: regola`) e i concetti |
| `wiki/entities/` | persone, aziende e clienti, progetti, strumenti: una pagina per soggetto |
| `wiki/sources/` | le sintesi delle fonti, con il link all'originale |
| `wiki/meta/` | nucleo e stato dei controlli (generati), registro degli strumenti, mappa del cervello, id dei sistemi esterni, glossario, frasi superate |
| `automazioni/` | ciò che il cervello manda fuori: procedure delle routine, testi dei prompt, battiti, plugin; si parte da `automazioni/LEGGIMI.md` |
| `bin/` | gli strumenti (script Node) e la loro configurazione, `bin/impostazioni.json`; registro in [[strumenti]] |
| `.raw/` | le fonti grezze da ingerire; in `.raw/inbox/` le note per il cervello arrivate dalle chat |
| `_modelli/` | i modelli delle pagine nuove |
| `.claude/` | comandi, agente verificatore e controlli automatici di Claude Code |
| `_da_eliminare/` | ciò che esce dal cervello: ci si sposta invece di cancellare, la svuota l'utente |

## Dove si scrive

- Con la cartella: si scrive sul posto, con gli strumenti di modifica dei file.
- Senza la cartella, o con una copia di sola lettura: non si scrive nel cervello e lo si dice. Si prepara una nota per
  il cervello nel formato di `_modelli/nota-inbox.md`, che l'utente salva in `.raw/inbox/`.
- Mai da una copia sincronizzata (Drive, OneDrive, Dropbox e simili): il connettore crea doppioni invece di modificare
  ([[dove-si-lavora]]).

## Chiusura di sessione

A fine lavoro, oppure con `/chiudi` in Claude Code:
1. una voce in cima a «In corso adesso» di `wiki/hot.md`, nella forma indicata lì, e la data di oggi in `updated`
   nel frontmatter di hot (una riga sola);
2. una voce in fondo a `wiki/log.md`;
3. i fatti durevoli nelle loro pagine, non solo in hot;
4. le pagine nuove nell'index, nella sezione giusta;
5. un errore di oggi che può ripetersi diventa una pagina ([[imparare-dagli-errori]]);
6. se hai cambiato una pagina regola o `wiki/meta/strumenti.md`, `node bin/costruisci.mjs`; poi, sempre,
   `node bin/controlla.mjs` e si correggono i rossi causati in questa sessione;
7. se c'è Git, si salva con `node bin/sincronizza.mjs` (salva anche senza repository online e, se c'è, scarica e
   carica) e si riporta la riga che stampa. Senza Node: `git add -A` e `git commit -m "<cosa è cambiato>"`, e con un
   repository online `git pull --rebase origin main` e `git push origin main`.

## Come si cambia una regola

Una regola è una pagina sola in `wiki/concepts/`, con `type: regola`, `ambito`, `nucleo: sì` o `no` e la sezione «In
breve» di massimo quattro righe (modello in `_modelli/regola.md`). Si cambia la pagina, poi si lancia
`node bin/costruisci.mjs`, che rigenera il nucleo qui sotto e `wiki/meta/nucleo.md`. Se la regola nuova supera una
frase scritta altrove, la frase va in [[frasi-superate]]. In Claude Code lo fa `/nuova-regola`.

Mai un paragrafo di regola in questo file, in `CLAUDE.md` o in una memoria.

## Le regole (nucleo generato)

Il blocco qui sotto lo scrive `node bin/costruisci.mjs` dalle pagine regola: non si modifica a mano. Se è vuoto, leggi
`wiki/meta/nucleo.md`.

<!-- genera: nucleo -->
> Generato il 2026-11-04 da `node bin/costruisci.mjs` dalle pagine regola: non si modifica a mano.
> Per cambiare una regola si cambia la sua pagina (sezione «In breve») e si rilancia lo script.

Qui ogni regola è in breve; la regola intera sta nella pagina linkata. Se una memoria, una skill o un plugin dicono
altro, vale questo nucleo.

### Prima di tutto: di chi è questa sessione

Questo cervello è di {{DA COMPILARE: il tuo nome}} e contiene il lavoro per {{DA COMPILARE: attività, azienda o clienti che ci entrano}}. Restano fuori, e non si mescolano con questo, {{DA COMPILARE: i contesti separati, per esempio un secondo lavoro; se non ce ne sono, togli la frase}}: i loro materiali non si archiviano qui e le regole di qui non valgono per loro. Nel dubbio su quale contesto sia attivo in una sessione, si chiede prima di scrivere. ([[ambito]])

### Valgono sempre

#### Fonte unica delle istruzioni e attribuzione ([[fonte-unica]])
- Le istruzioni sono una sola: `AGENTS.md` più le pagine regola, riassunte nel [[nucleo]]; se una memoria, una skill o un plugin dicono altro, vale il cervello.
- Prima di creare qualcosa si cerca se esiste già e non lo si contraddice: il vecchio diventa `superseded` con `superata-da`, mai un doppione.
- Ogni regola o numero citato punta a una pagina, il resto è «prassi generale, non regola mia»; una regola vale solo nel suo `ambito`.

#### Di chi è il cervello e cosa ci entra ([[ambito]])
- Estrai, non caricare: dai documenti si estrae il dato in una pagina con il link all'originale; file pesanti e trascrizioni grezze restano fuori.
- Mai segreti né dati personali di terzi: si scrive solo dove stanno. Le pagine delicate hanno `riservato: true`.

#### Dove si lavora e dove si scrive ([[dove-si-lavora]])
- Si scrive in una copia sola, la cartella del cervello (con Git fa fede il repository); mai da una copia sincronizzata (Drive, OneDrive, Dropbox): nascono doppioni.
- Chi non può scrivere legge in sola lettura, lo dice e prepara una nota per `.raw/inbox/`.
- Le chiavi stanno nella cartella privata fuori dal cervello: non si leggono e non si stampano.

#### Leggi il cervello prima di analizzare ([[leggi-prima-di-analizzare]])
- Prima di un'analisi o di un report si leggono hot, index e le fonti già presenti, e si dice da cosa si parte.
- Un numero che contraddice il cervello si segnala e si verifica prima di concludere.
- A fine lavoro i fatti durevoli vanno nelle pagine, non solo nella risposta.

#### Verificato, non dedotto ([[verificato-non-dedotto]])
- Un'assenza non si deduce: si cerca per nome o id e si guarda se l'elenco è troncato o i dati convertiti male.
- Una correzione si verifica sull'effetto al giro successivo, non rileggendo l'impostazione.
- Sui sistemi esterni vale la lettura dal vivo, non lo stato scritto nel cervello, che si corregge subito.

#### Sistemi esterni: si legge sempre, si scrive con il sì ([[sistemi-esterni]])
- Sui sistemi esterni si legge liberamente; si scrive, si invia, si pubblica o si cancella solo con il sì su quella operazione.
- Ciò che si crea fuori nasce in bozza o spento.
- Prima di usare un connettore si controlla l'account collegato: se è sbagliato ci si ferma e lo si dice.
- Un oggetto che si sostituisce intero si rilegge prima e si verifica dopo.

#### Lo strumento giusto per ogni richiesta ([[strumento-giusto]])
- Per una richiesta operativa si usa lo strumento della tabella «Richiesta → strumento», senza chiedere quale.
- Prima di dire «non esiste» si leggono [[strumenti]] e l'elenco di `bin/`.
- Mai un secondo strumento sullo stesso compito: si estende quello che c'è; uno strumento nuovo è script, pagina e riga del registro insieme.

#### Il lavoro si consegna intero ([[lavoro-consegnato-intero]])
- Il lavoro si consegna finito, mai fermo in attesa di un permesso che nessuno ha chiesto.
- I dubbi vanno in fondo, in una lista di massimo dieci domande sì o no.
- Le decisioni dell'utente sono chiuse; un rilievo si dice una volta sola.
- Non si cancella nulla: ciò che esce va in `_da_eliminare/` e la svuota l'utente.

#### Ogni errore che può ripetersi diventa una pagina ([[imparare-dagli-errori]])
- Un errore che può ripetersi diventa una pagina (regola o concetto) nella stessa sessione: il log non protegge.
- Una correzione che l'utente ripete diventa una riga No/Sì in [[come-scrivere-per-me]].
- Dopo una modifica in blocco si fa una lettura indipendente del risultato.

### Testi che leggerà qualcun altro

#### Come si scrive per me ([[come-scrivere-per-me]])
- Con me si parla in {{DA COMPILARE: lingua}}, anche nel terminale; un termine tecnico straniero solo se devo scriverlo o cliccarlo, spiegato tra parentesi.
- Si scrive come a una persona competente: niente preamboli, spiegazioni non richieste o metafore; si chiude con l'azione concreta.
- Prima di consegnare un testo si rileggono le mie correzioni ricorrenti (le tabelle No/Sì).
- Mai la lineetta lunga né quella media: due punti, virgole, parentesi o un punto fermo.

### Richiesta → strumento

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

### Le altre regole (si aprono quando servono)

Nessuna, per ora.
<!-- fine: nucleo -->
