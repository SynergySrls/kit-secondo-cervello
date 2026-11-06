# Google: Gemini, Gem e skill, Gemini Notebook (ex NotebookLM), Antigravity

Verificato il 03/11/2026: le piattaforme cambiano spesso, controlla le pagine ufficiali linkate.

Come si legge: ciò che è segnato *(da confermare)* viene da un estratto di ricerca di una pagina ufficiale, da una
fonte non ufficiale oppure è incerto; prima di contarci, aprilo dal link in fondo. Il resto è stato letto sulle pagine
ufficiali il 03/11/2026. Su Google molti prodotti stanno cambiando nome o chiudendo: qui più che altrove le date
contano.

## In breve

| Livello del kit | Su Google | File del kit |
|---|---|---|
| 1, solo chat | un Gem (in migrazione alle skill di Gemini); Gemini Notebook (ex NotebookLM) per consultare, in sola lettura | `esporta/istruzioni-chat.md`, `esporta/conoscenza-*.md` |
| 2, agente con cartella | Antigravity aperto nella cartella del cervello *(da confermare)* | `AGENTS.md`, che Antigravity legge da solo |
| 3, sistema completo | non verificato: la pianificazione di Antigravity non è documentata e le azioni pianificate di Gemini non hanno la cartella | per il Custode, un'altra piattaforma o il prompt D |

Gemini CLI e Jules sono in chiusura: non usarli per il cervello. Il livello 2 passa da Antigravity, il livello 3 su
Google oggi non c'è.

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat**; **2, agente con cartella**;
**3, sistema completo**.

## Cosa si può fare

| | Gemini con Gem e skill | Gemini Notebook (ex NotebookLM) | Antigravity |
|---|---|---|---|
| Istruzioni | istruzioni del Gem, limiti non indicati | le pagine ufficiali lette non indicano un campo per le istruzioni | `AGENTS.md` e `GEMINI.md` sempre attivi |
| File | dal dispositivo, da Drive (sempre l'ultima versione) o da un notebook | fonti: da 50 per notebook (gratuito) fino a 600 *(da confermare)* | la cartella aperta |
| Scrive file | non verificato | no, sola lettura | sì *(da confermare)* |
| Memoria | «memory», solo su account personali e non nei Gem *(da confermare)* | non verificato | non verificato |
| Attività pianificate | al massimo 10 azioni pianificate attive *(da confermare)* | non verificato | comando `/schedule` non documentato *(da confermare)* |
| Connettori e MCP | app personalizzate con forti limiti *(da confermare)* | non verificato | server MCP in `mcp_config.json` *(da confermare)* |

I dettagli:
- **Gem.** Istruzioni più file presi dal dispositivo, da Drive (il Gem legge sempre l'ultima versione) o da un
  notebook; limiti non indicati. I Gem spariscono sugli account personali da novembre 2026 (il 17/11 secondo una fonte
  non ufficiale), su Workspace a marzo 2027 e sugli account education a giugno 2027, con migrazione automatica a
  «skill». Le skill di Gemini sono istruzioni riutilizzabili che si richiamano con `/nome`, con file di riferimento; il
  loro formato non è dichiarato *(da confermare)*.
- **Memoria** *(da confermare)*: la funzione «past chats» si chiama ora «memory»; c'è solo sugli account personali e
  non nei Gem.
- **Attività pianificate** *(da confermare)*: al massimo 10 azioni pianificate attive; le pianificazioni dei task sono
  una funzione separata, con un massimo di 50.
- **MCP** (il protocollo con cui un'AI si collega a servizi esterni) *(da confermare)*: app personalizzate dal web in
  Impostazioni > App collegate, solo per maggiorenni, negli Stati Uniti, con account personale e in inglese. In
  Enterprise le aggiunge l'amministratore, solo via HTTPS in Streamable HTTP.
- **Gemini Notebook**, il nuovo nome di NotebookLM (annunciato da Google il 16/07/2026, stesso prodotto): da 50 fonti
  per notebook sul piano gratuito fino a 600, 500.000 parole o 200 MB per fonte *(da confermare i limiti)*. Sola
  lettura: copia le fonti da Drive e non modifica gli originali.
- **Gemini CLI.** Legge `~/.gemini/GEMINI.md`, poi i file della cartella e delle cartelle superiori, con `@import`;
  l'impostazione `context.fileName` gli fa leggere anche `AGENTS.md`. È dismesso: dal 18/06/2026 non risponde più agli
  abbonati AI Pro e Ultra né agli utenti gratuiti; resta con chiavi API a pagamento ed Enterprise.
- **Antigravity**, il successore di Gemini CLI: `AGENTS.md` e `GEMINI.md` sono sempre attivi, senza intestazione,
  letti dalla cartella fino alla radice del repository (verificato il 04/11/2026). Le regole in `.agents/rules/*.md` e
  in `~/.gemini/config/rules/*.md` richiedono un'intestazione con `trigger` (`always_on`, `model_decision`, `glob` o
  `manual`), altrimenti vengono scartate in silenzio; le regole globali sempre attive stanno in `~/.gemini/AGENTS.md`
  o `~/.gemini/GEMINI.md`. Le
  skill (istruzioni in una cartella che l'AI apre da sola quando servono) stanno in `.agents/skills/`, i server MCP in
  `mcp_config.json` (campo `serverUrl`). Il comando `/schedule` compare nell'indice ma non è documentato.
- **Jules.** Legge `AGENTS.md` e ha attività pianificate, ma chiude il 31/12/2026 e si lavora sulle sessioni solo fino
  all'11/11/2026. Da non usare.

## Livello 1: un Gem, oppure Gemini Notebook

Prima, sul computer, dalla cartella del cervello: `node bin/costruisci.mjs --esporta`. Lo script crea `esporta/` con
`istruzioni-chat.md` e i file `conoscenza-*.md`.

Con un Gem:
1. Crea un Gem per il cervello e incolla tutto `esporta/istruzioni-chat.md` nelle sue istruzioni. I limiti non sono
   indicati: se il testo viene tagliato, accorcia le «In breve» delle regole meno usate o mettile `nucleo: no`.
2. Aggiungi come file i `conoscenza-*.md`. Se li tieni in una cartella di Drive, il Gem legge sempre l'ultima
   versione: dopo ogni `--esporta` sostituisci i file in quella cartella. È una copia di sola lettura del pacchetto,
   non il cervello: il cervello di norma non sta dentro Drive, tranne la strada D del capitolo 2.1 della guida.
3. Dopo il primo aggiornamento controlla che il Gem legga davvero i file nuovi: chiedigli la prima riga di
   `conoscenza-01-inizio.md` («Esportato il ...») e confronta la data.
4. Quando ti dà una NOTA PER IL CERVELLO, salvala nella cartella `.raw/inbox/` del cervello.
5. Sugli account personali i Gem spariscono da novembre 2026 e diventano skill. Il pacchetto resta nel cervello: se il
   Gem non migra bene, lo ricrei da `esporta/` come skill o altrove. Scrivi dove sta nella tabella «Account delle AI e
   plugin» di `wiki/meta/mappa-del-cervello.md`.

Con Gemini Notebook (ex NotebookLM), per consultare *(da confermare)*:
1. Carica i file `conoscenza-*.md` come fonti: il pacchetto ne usa al massimo 20 (`limiti.fileEsportaMax`), sotto le
   50 del piano gratuito.
2. Le pagine ufficiali lette non indicano un campo per le istruzioni: carica anche `istruzioni-chat.md` come fonte,
   sapendo che viene letta come un documento, non come un ordine.
3. Gemini Notebook copia le fonti: dopo un nuovo `--esporta`, controlla la data in testa ai file che sta usando.
4. Non scrive: per ricordare qualcosa, chiedigli una nota per il cervello con il prompt E di `PROMPT-DI-AVVIO.md`.

## Livello 2: Antigravity nella cartella

1. Apri la cartella del cervello in Antigravity *(da confermare)*: `AGENTS.md` è sempre attivo. Per la prima
   costruzione usa il prompt A di `PROMPT-DI-AVVIO.md`.
2. Non serve niente in `.agents/rules/`: le regole del cervello stanno nel nucleo dentro `AGENTS.md`. Se un giorno ci
   metti una regola, deve avere l'intestazione con `trigger`, altrimenti viene scartata in silenzio.
3. `CLAUDE.md` e `.claude/` sono di Claude Code: in Antigravity non partono i controlli automatici del kit. A fine
   lavoro chiedi «fai la chiusura di sessione di AGENTS.md»: i punti 6 e 7 lanciano `node bin/costruisci.mjs` (se è
   cambiata una regola), `node bin/controlla.mjs` e il salvataggio. I comandi di `.claude/commands/` sono file di testo: «segui
   `.claude/commands/nuova-regola.md`» funziona anche qui.
4. Sessioni aperte in altre cartelle: in `~/.gemini/AGENTS.md`, sempre attivo, basta una riga che dice dove sta il
   cervello e di leggere il suo `AGENTS.md`. Se usi invece `~/.gemini/config/rules/`, il file deve iniziare con
   l'intestazione `trigger: always_on`, altrimenti viene scartato in silenzio. Non copiarci il nucleo: diventerebbe
   una seconda fonte.
5. I server MCP vanno in `mcp_config.json` solo se ti servono connettori; il kit non ne ha bisogno.

Se hai ancora Gemini CLI con una chiave API a pagamento o con Enterprise: l'impostazione `context.fileName` gli fa
leggere `AGENTS.md`. Per tutti gli altri è chiuso: passa ad Antigravity.

## Livello 3: automazioni

- Git, sincronizzazione e controllo quotidiano su GitHub funzionano anche qui: girano sul computer e su GitHub. Li
  spiega la guida.
- Il Custode su Google non ha un posto sicuro: `/schedule` di Antigravity non è documentato *(da confermare)*, le
  azioni pianificate di Gemini non hanno la cartella, Jules chiude. Due strade: la routine su un'altra piattaforma (la
  scheda `piattaforme/claude.md` o `piattaforme/altri.md`), oppure il prompt D di `PROMPT-DI-AVVIO.md` una volta a
  settimana con Antigravity.
- Le azioni pianificate di Gemini *(da confermare)* servono per un promemoria o un riassunto che chiude con una nota
  per il cervello: non scrivono nella cartella.

## Strada C: solo GitHub, con un agente nel cloud

Su Google la strada C del capitolo 2.1 della guida (il cervello solo nel repository privato su GitHub, con un agente
nel cloud) oggi non c'è: Jules legge `AGENTS.md`, ma chiude il 31/12/2026 e sulle sessioni si lavora solo fino
all'11/11/2026; Antigravity lavora su una cartella del computer. Per la C serve un'altra piattaforma (le schede
`piattaforme/claude.md`, `piattaforme/microsoft-e-github.md`, `piattaforme/chatgpt-e-codex.md`, `piattaforme/altri.md`).

## Cosa non si può fare

- Gemini Notebook non scrive: né nel cervello né negli originali.
- Gem e Gemini Notebook non hanno la cartella: si lavora in sola lettura, con le note per il cervello.
- Gemini CLI non risponde più agli abbonati AI Pro e Ultra né agli utenti gratuiti; Jules chiude il 31/12/2026.
- Gli MCP nel web di Gemini ci sono solo negli Stati Uniti, su account personali, in inglese *(da confermare)*.
- La memoria di Gemini non c'è sugli account di lavoro né nei Gem *(da confermare)*.

## Trappole

- **Contenitori che chiudono.** Gem (novembre 2026 sugli account personali), Gemini CLI (18/06/2026), Jules
  (31/12/2026). Il cervello resta in file aperti (markdown, Git, `AGENTS.md`, `SKILL.md`): se un contenitore chiude,
  si ricrea da `esporta/` con un nuovo `node bin/costruisci.mjs --esporta`. Mai lasciare nel contenitore l'unica copia di qualcosa.
- **Regole scartate in silenzio.** In Antigravity una regola in `.agents/rules/` senza `trigger` non vale, e nessuno lo
  dice.
- **Copie che invecchiano.** Gemini Notebook copia le fonti e il Gem dipende dalla cartella di Drive: dopo un `--esporta`
  si controlla la data letta, non si dà per scontata.
- **Limiti per paese e tipo di account.** Funzioni che ci sono sull'account personale possono mancare su quello di
  lavoro, e viceversa.

## File del kit da usare

| Dove | File |
|---|---|
| Istruzioni di un Gem | `esporta/istruzioni-chat.md` |
| File di un Gem, fonti di Gemini Notebook | `esporta/conoscenza-*.md` |
| Antigravity | `AGENTS.md` |
| Skill, quando il formato delle skill di Gemini sarà chiaro | `automazioni/plugin-cervello/skills/cervello` *(da confermare)* |

## Fonti

Lette sulle pagine ufficiali il 03/11/2026:
- [GEMINI.md](https://geminicli.com/docs/cli/gemini-md.md)
- [Gem](https://support.google.com/gemini/answer/15146780)
- [Skill di Gemini, 30/09/2026](https://blog.google/products-and-platforms/products/gemini/automate-tasks-with-skills/)
- [Chiusura di Jules](https://jules.google/docs/changelog/2026-10-29)
- [Passaggio da Gemini CLI ad Antigravity CLI, 19/05/2026](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [Migrazione ad Antigravity](https://antigravity.google/docs/cli/gcli-migration/)

Lette sulle pagine ufficiali il 04/11/2026 (verifica dei revisori del kit):
- [Regole di Antigravity](https://antigravity.google/docs/rules/)
- [Da NotebookLM a Gemini Notebook](https://blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/)

Viste solo come estratto di ricerca *(da confermare)*:
- [NotebookLM](https://support.google.com/notebooklm/answer/16213268)
- [Azioni pianificate](https://support.google.com/gemini/answer/16316416)
- [App personalizzate e MCP](https://support.google.com/gemini/answer/17209137)

Fonte non ufficiale *(da confermare)*:
- [Android Central sui Gem](https://www.androidcentral.com/apps-software/ai/google-outlines-timeline-to-phase-out-gemini-gems-in-favor-of-skills)
