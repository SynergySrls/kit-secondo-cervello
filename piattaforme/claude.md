# Claude (Anthropic): Progetti, skill e plugin, Cowork, Claude Code

Verificato il 03/11/2026: le piattaforme cambiano spesso, controlla le pagine ufficiali linkate.

Come si legge: ciò che è segnato *(da confermare)* viene da un estratto di ricerca di una pagina ufficiale, da una
fonte non ufficiale oppure è incerto; prima di contarci, aprilo dal link in fondo. Il resto è stato letto sulle pagine
ufficiali il 03/11/2026. I nomi dei menu sono quelli trovati quel giorno e possono cambiare.

## In breve

| Livello del kit | Su Claude | File del kit |
|---|---|---|
| 1, solo chat | un Progetto di claude.ai; in più, a mano, la skill `cervello` caricata come zip (un ripiego da ricaricare a ogni versione) | `esporta/istruzioni-chat.md`, `esporta/istruzioni-brevi.md`, `esporta/conoscenza-*.md` |
| 2, agente con cartella | Claude Code aperto nella cartella del cervello; Cowork con la cartella collegata | `AGENTS.md`, che Claude Code riceve da `CLAUDE.md` |
| 3, sistema completo | routine Custode nel cloud sul repository; plugin `cervello` dal marketplace del repository (serve il repository su GitHub); attività pianificate di Cowork | `automazioni/routine/routine-custode.md`, `.claude-plugin/marketplace.json` |

Claude è la piattaforma con cui il kit arriva più lontano: tutti e tre i livelli, compresi i controlli automatici e i
comandi di Claude Code. Un secondo account usa lo stesso cervello, ma non le stesse routine.

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat**; **2, agente con cartella**;
**3, sistema completo**.

## Cosa si può fare

| | Progetti di claude.ai | Cowork | Claude Code |
|---|---|---|---|
| Istruzioni | istruzioni di progetto, senza un limite di lunghezza dichiarato | istruzioni globali e istruzioni di cartella *(da confermare)* | i file `CLAUDE.md`; legge `AGENTS.md` da solo solo se non c'è nessun `CLAUDE.md` |
| File | file di conoscenza caricati | solo le cartelle collegate *(da confermare)* | la cartella in cui si apre |
| Scrive file | no | sì, nelle cartelle collegate *(da confermare)* | sì |
| Memoria | memoria del progetto *(da confermare)* | cartella di memoria con `CLAUDE.md` e note *(da confermare)* | memoria automatica: si caricano le prime 200 righe o 25 KB |
| Attività pianificate | non verificato | sì, su tutti i piani a pagamento | routine nel cloud (verificato il 04/11/2026) |
| Connettori e plugin | i connettori dell'account | connettori, skill e plugin, anche nelle attività pianificate | i plugin dell'account, dalla versione 2.1.273 *(da confermare)* |

I dettagli, superficie per superficie:
- **Progetti.** Uno spazio con istruzioni e file suoi. Non ci sono limiti di numero o dimensione dei file indicati;
  sui piani a pagamento, quando i file sono tanti, il progetto passa da solo alla ricerca nei documenti, con una
  capacità fino a 10 volte. Il piano gratuito ha al massimo 5 progetti. Una fonte non ufficiale indica 30 MB per file
  *(da confermare)*. Ogni progetto ha una memoria propria e usa anche quella fuori dai progetti, mai quella degli altri
  progetti; la ricerca nelle chat c'è solo sui piani a pagamento *(da confermare)*. È in arrivo una nuova versione
  beta dei progetti, partita da Claude Code.
- **Skill** (istruzioni in una cartella che l'AI apre da sola quando servono) *(da confermare)*: una cartella con
  `SKILL.md`, con in testa `name` e `description`, caricata come file zip con la cartella al primo livello; serve un
  piano a pagamento con l'esecuzione di codice. Il limite della descrizione non è chiaro: 1.024 caratteri nella
  documentazione della piattaforma, 200 in un articolo di claude.ai. Si consiglia un `SKILL.md` sotto le 500 righe.
- **Plugin e marketplace** (un plugin è un pacchetto di skill che l'account installa e aggiorna; un marketplace è
  l'elenco di plugin che l'account legge da un repository): Personalizza (Customize) > Plugin > Add > Add marketplace,
  con l'indirizzo GitHub o `proprietario/repository`, sincronizzazione a mano o automatica. Per un repository privato
  bisogna dare accesso a quel repository all'app GitHub di Claude (se manca, la finestra propone «Install the Claude
  GitHub App»). Le skill, comprese quelle dei plugin, funzionano in chat solo con «Code execution and file creation»
  attivo in Impostazioni > Capabilities. Una skill non si legge in ogni conversazione: Claude ne vede nome e
  descrizione e la apre quando la richiesta corrisponde (verificato il 04/11/2026). I plugin dell'account arrivano
  anche in Claude Code (dalla versione 2.1.273) e in Cowork.
- **Cowork.** Legge e scrive solo nelle cartelle collegate *(da confermare)*. Ha istruzioni globali (Impostazioni >
  Your Claude), istruzioni di cartella (pannello Personalizza) e una cartella di memoria con `CLAUDE.md` e note *(da
  confermare; non è confermato che corrispondano ai file `CLAUDE.md` del cervello)*. Le attività pianificate girano da
  remoto anche a computer spento, tranne quelle che hanno bisogno di file o app del computer, che girano solo lì; le
  attività create sul computer prima del 06/10 (piani Pro, Max, Ultra) restano lì. Cadenze: ogni ora, ogni giorno,
  ogni settimana, nei giorni feriali o a mano. Hanno connettori, skill e plugin.
- **Claude Code.** Legge i `CLAUDE.md` di organizzazione, dell'utente (`~/.claude/CLAUDE.md`), del progetto
  (`./CLAUDE.md` o `./.claude/CLAUDE.md`) e `CLAUDE.local.md`. Importa altri file con una riga `@percorso`, fino a 4
  salti; `.claude/rules/` accetta regole legate a un percorso. Consiglio ufficiale: meno di 200 righe per file. Gli
  import nei file dell'utente (`~/.claude/CLAUDE.md`) si caricano senza domande; l'approvazione serve solo per gli
  import esterni nei `CLAUDE.md` di progetto; nelle sessioni di Cowork sul desktop gli import di file dell'utente che
  puntano fuori dalla cartella di lavoro si saltano. Gli hook (controlli automatici che partono a ogni evento) di tipo
  PreToolUse bloccano un'azione qualunque cosa decida il modello; una modifica agli hook in `.claude/settings.json` di
  solito vale subito. Le routine, ora chiamate «scheduled tasks», girano nel cloud, partono da un orario, da una
  chiamata o da eventi GitHub, al massimo una volta l'ora, clonano il repository e sono in anteprima; per gli eventi
  serve l'app GitHub di Claude. Se il collegamento con GitHub manca o scade, la routine salta i giri fino a 72 ore e
  poi si spegne da sola: va riaccesa a mano dopo aver ricollegato GitHub (verificato il 04/11/2026). Esistono anche
  attività pianificate locali nell'app desktop *(da confermare)*.

## Livello 1: un Progetto di claude.ai

1. Sul computer, dalla cartella del cervello: `node bin/costruisci.mjs --esporta`. Lo script crea la cartella
   `esporta/` e dice quanti caratteri ha `istruzioni-chat.md`; sopra gli 8.000 avvisa.
2. Su claude.ai crea un Progetto per il cervello.
3. Incolla tutto il contenuto di `esporta/istruzioni-chat.md` nelle istruzioni del progetto.
4. Carica tra i file del progetto tutti i file `esporta/conoscenza-*.md`. Il primo che la chat legge è
   `conoscenza-01-inizio.md` (hot, index, nucleo, registro degli strumenti).
5. Prova in una chat nuova del progetto: «di chi è questo cervello e cosa fai prima di scrivere una mail a un
   cliente?». La risposta deve citare le pagine (i lavori delicati arrivano dalla sezione «Seconda azione» di
   `AGENTS.md`, che l'esportazione mette nelle istruzioni).
6. Quando la chat ti dà una NOTA PER IL CERVELLO, salvala nella cartella `.raw/inbox/` del cervello come
   `AAAA-MM-GG-<tema>.md`. La integra il Custode, o la prossima sessione con la cartella.
7. Quando cambi una regola o il cervello cresce, rilancia `--esporta` e sostituisci sia le istruzioni sia i file (i
   nomi dei file possono cambiare). Scrivi il progetto nella tabella «Account delle AI e plugin» di
   `wiki/meta/mappa-del-cervello.md`.
8. Per le chat fuori dal progetto: nelle istruzioni personali dell'account (Impostazioni, Your Claude, Instructions
   for Claude) incolla `esporta/istruzioni-brevi.md`, oppure, se hai il plugin del livello 3, una riga sola come
   «Per ogni lavoro di <nome> usa per prima la skill cervello». Non copiarci le regole una per una.

Il plugin `cervello` (livello 3, serve il repository su GitHub) rende disponibile in ogni chat dell'account la skill
`cervello`, con il nucleo delle regole: si attiva quando la richiesta riguarda il tuo lavoro o quando la chiami con
`/cervello`, non da sola in ogni conversazione. Porta le regole, non i fatti: hot, index e pagine li porta il
progetto.

## Livello 2: Claude Code nella cartella

1. Apri Claude Code nella cartella del cervello. Alla prima apertura accetta la cartella come attendibile: senza,
   i controlli automatici del kit non partono.
2. Le istruzioni arrivano da sole. `CLAUDE.md` del cervello contiene la riga `@AGENTS.md`, che importa `AGENTS.md`:
   Claude Code legge `AGENTS.md` per conto suo solo se non c'è nessun `CLAUDE.md`, quindi quella riga non si toglie.
3. Per la prima costruzione usa il prompt A di `PROMPT-DI-AVVIO.md`.
4. I controlli automatici, dichiarati in `.claude/settings.json` con gli script in `bin/hooks/`:

   | Controllo | Quando parte | Cosa fa |
   |---|---|---|
   | `avvio` | all'apertura della sessione | data di hot, nucleo aggiornato o no, rossi dei controlli, rami di conflitto, sincronizzazione ferma o in pausa, note da integrare, lavoro da riprendere |
   | `instrada` | a ogni messaggio | fino a tre righe della tabella «Richiesta → strumento» che corrispondono alla richiesta |
   | `dopo-modifica` | dopo ogni modifica di un file | caratteri vietati con il numero di riga, segreti, promemoria di rigenerare il nucleo |
   | `proteggi` | prima di ogni comando del terminale e di ogni lettura | nega quelli che mostrerebbero una chiave o una password e dice cosa usare al posto |

   Si spengono tutti con la variabile d'ambiente `CERVELLO_HOOK=spenti`; `CERVELLO_HOOK_DEBUG=1` mostra gli errori.
   Una modifica a `.claude/settings.json` di solito vale subito; se un controllo non parte, apri `/hooks` o riavvia la
   sessione.
5. I comandi: `/chiudi` (chiusura di sessione), `/ingerisci [file o cartella]`, `/nuova-regola [descrizione]`,
   `/allinea-routine`. L'agente `verificatore` (in `.claude/agents/`) rilegge un lavoro finito e segnala.
6. La memoria automatica contiene solo rimandi di una riga alle pagine, mai regole o fatti suoi: se dicesse altro,
   diventerebbe una seconda fonte. Il modello di rimando sta in fondo a `CLAUDE.md`. Comunque se ne caricano solo le
   prime 200 righe o 25 KB.
7. Sessioni aperte in altre cartelle: in `~/.claude/CLAUDE.md` una riga `@<percorso del cervello>/wiki/meta/nucleo.md`
   porta il nucleo anche lì, più una riga che dice dove sta il cervello. Nei file dell'utente l'import si carica
   senza domande: per verificare, `/memory` deve elencare il nucleo. Scrivilo nella tabella «Cartelle sul computer»
   di `wiki/meta/mappa-del-cervello.md`.

Cowork, in alternativa:
- Collega la cartella del cervello. Siccome non è confermato che Cowork legga i file `CLAUDE.md` della cartella, nelle
  istruzioni di cartella scrivi «Prima di tutto leggi AGENTS.md in questa cartella e fai quello che dice», oppure
  installa il plugin `cervello`.
- Nelle sessioni di Cowork sul desktop l'import del nucleo da `~/.claude/CLAUDE.md` non arriva, perché punta fuori
  dalla cartella di lavoro: lì le regole le porta il plugin.
- I controlli automatici sono del kit per Claude Code: le pagine ufficiali lette non dicono se in Cowork partono. A
  fine lavoro chiedi la chiusura di sessione di `AGENTS.md`, che comprende `node bin/controlla.mjs`.
- Non collegare mai a Cowork la cartella privata delle chiavi.

## Livello 3: routine, plugin dal repository, attività pianificate

Prima, uguale per ogni piattaforma: il cervello in un repository Git privato su GitHub, la sincronizzazione
installata sul computer principale (`node bin/installa-sincronizzazione.mjs`, poi `--fai`), il controllo quotidiano
`.github/workflows/controllo.yml` che parte da solo. Li spiega la guida.

### La routine Custode nel cloud
1. GitHub collegato all'account, con l'app GitHub di Claude autorizzata sul repository del cervello: la routine
   lavora su un clone del repository. Le routine si creano da claude.ai/code/routines, dall'app desktop (scheda Code,
   Scheduled, New task, scegliendo Cloud) o con `/schedule` nel terminale.
2. In Claude Code, nella cartella del cervello: `/allinea-routine`. Se la sessione ha uno strumento che legge e crea
   le routine dell'account, lo usa; altrimenti ti dà il testo esatto da incollare nella pagina delle routine. La
   routine nasce spenta, salvo un tuo sì esplicito ad accenderla. Scrivi l'account nel campo `account` del file della
   routine.
3. Il testo è il blocco «Prompt» di `automazioni/routine/routine-custode.md`, parola per parola. L'orario è nella riga
   `cron` dello stesso file: ogni sera alle 21:30, ora italiana. Le routine partono al massimo una volta l'ora: per il
   Custode basta.
4. Il Custode parte in `MODALITA: rapporto` (scrive solo cosa farebbe). Quando i resoconti sono giusti per qualche
   giro, cambi la riga in `MODALITA: azione` nel file e rilanci `/allinea-routine`. Il prompt non si cambia mai a mano
   sull'account: il file e la routine divergerebbero.
5. Quando la routine esiste e la accendi: `id` e `stato: accesa` nel file della routine, la colonna «Stato» in
   `automazioni/LEGGIMI.md`, la riga in `wiki/meta/mappa-del-cervello.md`, l'id in `wiki/meta/id-sistemi-esterni.md`.
6. Nel cloud non ci sono le chiavi della cartella privata del computer: una routine che ne ha bisogno non va nel cloud.
7. A fine giro il Custode scrive il battito `automazioni/battiti/custode.txt`: se manca, il controllo diventa rosso e
   `node bin/avvisa.mjs` lo manda sul telefono, se hai configurato l'avviso. Con il battito rosso controlla prima il
   collegamento con GitHub: se è scaduto, la routine si è spenta da sola e va riaccesa dopo averlo ricollegato.

### Le attività pianificate di Cowork
- Girano da remoto a computer spento, tranne quelle che usano file o app del computer: un'attività che lavora sulla
  cartella collegata del cervello gira quindi solo a computer acceso.
- Per il Custode è meglio la routine nel cloud, che lavora sul repository e non dipende dal computer.
- Il testo di ogni attività pianificata che tocca il cervello si salva come una routine, in `automazioni/routine/`
  (modello `_modelli/routine.md`), con la sua riga in `wiki/meta/mappa-del-cervello.md`: altrimenti diventa una regola
  nascosta in un posto che il cervello non vede.

### Il plugin `cervello` dal repository
1. Compila i segnaposto del plugin: `marketplace.proprietario` in `bin/impostazioni.json`; l'autore in
   `automazioni/plugin-cervello/.claude-plugin/plugin.json`; nella `description` di
   `automazioni/plugin-cervello/skills/cervello/SKILL.md` il tuo nome e i contesti esclusi, e il nome nel testo;
   l'indirizzo `proprietario/repository` in `automazioni/plugin-cervello/README.md`. Poi `node bin/costruisci.mjs`,
   che rigenera `.claude-plugin/marketplace.json`, e salva sul repository.
2. In Impostazioni > Capabilities attiva «Code execution and file creation»: senza, le skill non funzionano.
3. Su claude.ai: Personalizza (Customize) > Plugin > Add > Add marketplace, con l'indirizzo `proprietario/repository`
   e la sincronizzazione automatica. Quando la finestra lo chiede, installa l'app GitHub di Claude sul repository del
   cervello (è privato).
4. Installa il plugin «cervello» dall'elenco.
5. Se nell'account c'era già una skill con lo stesso nome caricata a mano, spegnila prima: due skill con lo stesso
   nome si confondono.
6. Da lì in poi, quando cambi una regola, `node bin/costruisci.mjs` alza da solo la versione del plugin, la
   sincronizzazione la salva sul repository e l'account si aggiorna *(da confermare: con la sincronizzazione
   automatica)*.
7. Il plugin porta le regole, non i fatti: dal telefono «cosa c'è in corso?» ha risposta solo nel Progetto del livello
   1, con il pacchetto di `--esporta` (da ricaricare quando cambia hot).

Per un'organizzazione: repository privato o interno con l'app GitHub di Claude; ogni sincronizzazione sostituisce
tutti i plugin e può durare fino a 30 minuti. Su cosa la fa partire le fonti non sono d'accordo (04/11/2026): la
pagina della documentazione dice a ogni push sul ramo principale con «Sync automatically», l'articolo di supporto
parla di una richiesta di modifica (pull request) unita con la versione aumentata. Il controllo da fare: dopo il primo
cambio di versione guarda «Last synced» del marketplace nelle impostazioni dell'organizzazione; se non si muove, usa
Re-sync oppure una richiesta di modifica.

Ripiego, la skill caricata a mano *(da confermare)*: comprimi in un file zip la cartella
`automazioni/plugin-cervello/skills/cervello` e caricala come skill. È una copia: va ricaricata ogni volta che
`node bin/costruisci.mjs` cambia la versione del plugin, altrimenti resta indietro. Il plugin dal repository evita
questo lavoro.

## Stesso cervello su un secondo account

1. Claude Code non dipende dall'account: legge la cartella. Lì non c'è niente da rifare.
2. Collega GitHub e aggiungi lo stesso marketplace, con la sincronizzazione automatica.
3. Autorizza i connettori uno per uno e controlla a quale account è agganciato ciascuno, confrontandolo con
   `wiki/meta/id-sistemi-esterni.md`: un connettore agganciato all'account sbagliato legge e scrive i dati di qualcun
   altro.
4. **Non ricreare le routine** e le attività pianificate che scrivono nel cervello: girerebbero due volte, con due
   Custodi che archiviano e uniscono le stesse cose. Le routine stanno su un account solo.
5. Spegni prima le skill caricate a mano con lo stesso nome del plugin.
6. Un Progetto con i file esportati si può ricreare: è una copia di sola lettura.
7. Scrivi il secondo account in `wiki/meta/mappa-del-cervello.md`.

## Cosa non si può fare

- Dai Progetti non si scrive nel cervello: solo note per il cervello.
- Le routine nel cloud non hanno le chiavi della cartella privata del computer e non partono più di una volta l'ora
  *(da confermare)*.
- Le attività di Cowork che usano file del computer non girano a computer spento.
- Nelle sessioni di Cowork sul desktop non arrivano gli import di file che stanno fuori dalla cartella di lavoro.

## Trappole

- **`AGENTS.md` ignorato.** Se togli `@AGENTS.md` da `CLAUDE.md`, Claude Code non legge più le istruzioni del cervello.
- **Regole nella memoria.** Una memoria automatica che contiene regole o fatti diventa una seconda fonte, che prima o
  poi contraddice le pagine: solo rimandi di una riga.
- **Controlli automatici spenti senza saperlo.** Partono solo con la cartella attendibile; se dopo una modifica alle
  impostazioni non partono, apri `/hooks` o riavvia la sessione.
- **Prompt cambiato a mano sull'account.** Il file in `automazioni/routine/` non lo sa più. Si cambia il file, poi
  `/allinea-routine`.
- **Orari delle routine.** Controlla che la pagina delle routine mostri l'orario nel tuo fuso: al cambio dell'ora una
  routine senza fuso può partire un'ora prima o dopo.
- **Copie a mano di skill e plugin.** Divergono sempre, prima o poi: meglio il plugin dal repository.
- **Descrizione della skill.** Quella del kit è sotto i 1.000 caratteri; se vale il limite di 200 citato da un articolo
  *(da confermare)*, va accorciata.
- **Cartella sincronizzata.** Il cervello non sta in Drive, OneDrive o Dropbox, neanche per farlo vedere a Cowork:
  nascono doppioni.

## File del kit da usare

| Dove | File |
|---|---|
| Istruzioni di un Progetto | `esporta/istruzioni-chat.md` |
| Istruzioni personali dell'account | `esporta/istruzioni-brevi.md`, oppure una riga che rimanda alla skill `cervello` |
| File di un Progetto | `esporta/conoscenza-*.md` |
| Claude Code, Cowork | `AGENTS.md` (Claude Code lo riceve da `CLAUDE.md`) |
| Plugin e skill | `automazioni/plugin-cervello/skills/cervello`, pubblicata con `.claude-plugin/marketplace.json` |
| Routine | `automazioni/routine/routine-custode.md` e la procedura `automazioni/custode.md` |

## Fonti

Lette sulle pagine ufficiali il 03/11/2026:
- [Progetti](https://support.claude.com/en/articles/9517075-what-are-projects)
- [Attività pianificate di Cowork](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork)
- [Memoria di Claude Code](https://code.claude.com/docs/en/memory)

Lette sulle pagine ufficiali il 04/11/2026 (verifica dei revisori del kit): panoramica delle skill
(https://claude.com/docs/skills/overview.md), plugin (https://claude.com/docs/plugins/overview.md), plugin per
l'organizzazione (https://claude.com/docs/plugins/org-sync.md), hook (https://code.claude.com/docs/en/hooks),
routine (https://code.claude.com/docs/en/routines).

Viste solo come estratto di ricerca *(da confermare)*:
- [Memoria e ricerca nelle chat](https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-context)
- [Skill](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Plugin in Cowork](https://claude.com/docs/cowork/guide/plugins)
- [Plugin per l'organizzazione](https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization)
- [Routine](https://code.claude.com/docs/en/routines)

Fonte non ufficiale *(da confermare)*:
- [fast.io, limiti dei progetti Claude](https://fast.io/resources/claude-project-file-size-limit/)
