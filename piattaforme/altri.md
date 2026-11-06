# Altri: Cursor, Devin Desktop, Mistral Vibe, modelli locali, Obsidian

Verificato il 03/11/2026: le piattaforme cambiano spesso, controlla le pagine ufficiali linkate.

Come si legge: ciò che è segnato *(da confermare)* viene da un estratto di ricerca di una pagina ufficiale, da una
fonte non ufficiale oppure è incerto; prima di contarci, aprilo dal link in fondo. Il resto è stato letto sulle pagine
ufficiali il 03/11/2026.

## In breve

| Piattaforma | Fino a quale livello | File del kit | Nota |
|---|---|---|---|
| Cursor | 2 sicuro, 3 *(da confermare)* | `AGENTS.md` | legge `AGENTS.md` da solo; le automazioni nel cloud partono su orario |
| Devin Desktop (era Windsurf) | 2 | `AGENTS.md` | legge `AGENTS.md` da solo; non conserva memorie |
| Mistral Vibe | 1 con Work, 2 con Code | `esporta/istruzioni-chat.md`, `esporta/conoscenza-*.md`; `AGENTS.md` | il file di istruzioni di Code non è indicato |
| Modelli locali (Ollama, LM Studio, Open WebUI) | 1, e 2 con un client che legge i file | `esporta/istruzioni-chat.md`, `esporta/conoscenza-*.md`; `AGENTS.md` | nessuno legge da solo un file di istruzioni di cartella *(da confermare)* |
| Obsidian | visore; con un plugin AI che scrive diventa un agente | la cartella intera; `AGENTS.md` | i link `[[...]]` del cervello sono quelli di Obsidian |

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat**; **2, agente con cartella**;
**3, sistema completo**.

Vale per tutti: i controlli automatici e i comandi in `.claude/` sono del kit per Claude Code. Con gli altri agenti i
comandi si usano come testi («segui `.claude/commands/nuova-regola.md`») e a fine lavoro si chiede la chiusura di
sessione di `AGENTS.md`, i cui punti 6 e 7 lanciano `node bin/costruisci.mjs` (se è cambiata una regola),
`node bin/controlla.mjs` e il salvataggio. Per la prima costruzione
c'è il prompt A di `PROMPT-DI-AVVIO.md`.

## Cursor

Cosa si può fare:
- **Istruzioni.** Le regole di Cursor stanno in `.cursor/rules/*.mdc`; un file `.md` semplice lì dentro viene ignorato.
  L'intestazione ha `description`, `globs` e `alwaysApply`. Ci sono anche regole dell'utente e del team. `AGENTS.md`
  alla radice e nelle sottocartelle si combina con quelli dei livelli superiori. Consigli ufficiali: meno di 500
  righe, e citare i file invece di copiarli. La versione da riga di comando legge anche `CLAUDE.md` *(da confermare)*.
- **Scrive file**: sì, nella cartella aperta.
- **Attività pianificate** (verificato il 04/11/2026): automazioni con agenti nel cloud che partono su orario (cron,
  cioè una riga che dice quando) o su eventi di GitHub, Slack, Linear e webhook (avvisi automatici tra servizi). Con
  l'orario il default è nessun repository: l'agente non clona il codice e non può modificarlo. Con un repository il
  risultato previsto è una richiesta di modifica (pull request), attiva di default, non un salvataggio diretto sul
  ramo principale.
- **Memoria**: non verificata *(da confermare)*.

Come si usa il kit:
1. Apri la cartella del cervello in Cursor: `AGENTS.md` arriva da solo. Non serve niente in `.cursor/rules/`.
2. Non copiare le regole in un file `.mdc`: sarebbe una seconda fonte che prima o poi contraddice il nucleo. Se proprio
   ti serve, un `.mdc` con `alwaysApply` e una riga sola: «Le istruzioni stanno in AGENTS.md».
3. Livello 3: un'automazione nel cloud su orario può fare il lavoro del Custode sul repository del cervello, con il
   testo del blocco «Prompt» di `automazioni/routine/routine-custode.md`. Quando la crei scegli il repository del
   cervello (con l'orario il default è nessun repository) e aspettati una richiesta di modifica da unire tu, non un
   salvataggio diretto: finché non la unisci, il battito `custode` non arriva su main e il controllo lo segna. Prova
   qualche giro in `MODALITA: rapporto` prima di fidarti. Il file resta la fonte: se cambi il prompt, lo cambi lì e
   poi nell'automazione. Scrivi l'automazione in `wiki/meta/mappa-del-cervello.md`.

## Devin Desktop (era Windsurf)

Cosa si può fare:
- È stato rinominato con la versione 3.0.12 (02/06/2026). Con la versione 3.9.19 (08/09/2026) è stato tolto Cascade:
  l'unico agente è Devin Local.
- **Istruzioni.** `AGENTS.md`, `AGENTS.local.md` e `AGENT.md` sono sempre attivi. Le regole stanno in
  `.devin/rules/*.md` con un `trigger`; le regole globali in `~/.devin/`. Restano lette anche `.windsurf/rules` e
  `.windsurfrules`.
- **Altro.** Skill (istruzioni in una cartella che l'AI apre da sola quando servono) in `.devin/skills` o
  `.agents/skills`, plugin da GitHub, MCP (il protocollo con cui un'AI si collega a servizi esterni) con
  autorizzazione OAuth, hook (controlli automatici) in `.devin/hooks.v1.json`.
- **Memoria.** Devin Local non conserva memorie *(da confermare)*; i flussi di lavoro salvati sono deprecati a favore
  delle skill.
- **Attività pianificate.** Le sessioni pianificate sono citate nel registro delle versioni (3.7.25) ma non
  documentate *(da confermare)*.

Come si usa il kit:
1. Apri la cartella del cervello: `AGENTS.md` è sempre attivo.
2. Se usavi Windsurf, cerca i vecchi `.windsurfrules` e `.windsurf/rules` nella cartella: vengono ancora letti e
   possono contenere regole vecchie. Spostali in `_da_eliminare/` dopo averne portato il buono in pagine regola.
3. Gli hook del kit sono scritti per Claude Code: le pagine ufficiali lette non dicono se `.devin/hooks.v1.json` li
   accetta. Senza, i controlli si lanciano a fine lavoro con la chiusura di sessione.
4. Livello 3 non certo: per il Custode usa il prompt D di `PROMPT-DI-AVVIO.md` una volta a settimana.

## Mistral Vibe (era Le Chat)

Cosa si può fare:
- Le Chat è diventato Vibe il 12/08/2026.
- **Work**, sul web e sul telefono: connettori, base di conoscenza al posto delle memorie, progetti, skill al posto
  degli agenti; nessuna cartella locale.
- **Code**: riga di comando, VS Code e sessioni remote su un repository GitHub; modifica file e apre richieste di
  modifica (pull request). Il file di istruzioni non è indicato *(da confermare)*.
- **Attività pianificate** solo in Work, in anteprima pubblica: una volta, ogni giorno, ogni settimana, ogni mese o
  ogni anno. Senza «Always allow» sulle azioni dei connettori si fermano *(da confermare)*.
- **MCP personalizzati**: li aggiunge l'amministratore *(da confermare)*.

Come si usa il kit:
1. Livello 1, con Work: `node bin/costruisci.mjs --esporta` sul computer, poi un progetto con i file
   `esporta/conoscenza-*.md` nella base di conoscenza e `esporta/istruzioni-chat.md` dove il progetto accetta le
   istruzioni (le pagine ufficiali lette non dicono dove) *(da confermare)*. Le note per il cervello vanno in
   `.raw/inbox/`.
2. Livello 2, con Code sul repository del cervello: siccome il file di istruzioni non è indicato, comincia ogni lavoro
   con «leggi AGENTS.md e fai quello che dice».
3. Le attività pianificate di Work non hanno la cartella: possono chiudere con una nota per il cervello (prompt E).
   Invece di dare «Always allow» alle azioni che scrivono, fai produrre solo bozze: sui sistemi esterni si scrive con
   il sì sulla singola operazione (regola `sistemi-esterni` del cervello).

## Modelli locali: Ollama, LM Studio, Open WebUI

Cosa si può fare:
- **Ollama** è solo un server di modelli. Per usare file e strumenti servono programmi di terzi (ollmcp,
  ollama-mcp-bridge) *(da confermare)*.
- **LM Studio** è un host MCP dalla versione 0.3.17, configurato in `%USERPROFILE%/.lmstudio/mcp.json`. Avverte che i
  server MCP riempiono il contesto (la quantità di testo che il modello tiene a mente) dei modelli locali *(da
  confermare)*.
- **Open WebUI** *(da confermare)*: conoscenza legata a un modello o a una chat (in modalità nativa il modello deve
  chiamare la ricerca da solo), memoria per utente, MCP via HTTP o SSE (lo stdio passa da MCPO). Automazioni
  pianificate: una volta, ogni ora, ogni giorno, ogni settimana, ogni mese o con una regola RRULE.
- Nessuno di questi legge da solo un file di istruzioni di cartella *(da confermare)*.

Come si usa il kit:
1. Livello 1, con Open WebUI: i file `esporta/conoscenza-*.md` nella conoscenza del modello o della chat, e il testo di
   `esporta/istruzioni-chat.md` dato all'inizio della chat, oppure nel campo delle istruzioni del modello, se c'è *(da
   confermare)*.
2. Livello 2, con un client che legge i file della cartella: nessuno legge `AGENTS.md` da solo, quindi il primo
   messaggio è «leggi AGENTS.md e fai quello che dice».
3. Contesto piccolo: `istruzioni-chat.md` è sotto gli 8.000 caratteri, ma i file di conoscenza no. Fai leggere prima
   `conoscenza-01-inizio.md` e poi solo il file che serve; tieni pochi server MCP accesi.
4. Le automazioni di Open WebUI non hanno la cartella: possono chiudere con una nota per il cervello.

## Obsidian

Cosa si può fare:
- Il kit usa Obsidian come visore: apri la cartella del cervello come vault (così Obsidian chiama una cartella di
  note) e vedi pagine e collegamenti. I link `[[nome]]` del cervello si risolvono come in Obsidian, e `.gitignore` esclude già i file
  `.obsidian/workspace*.json`, che cambiano a ogni apertura.
- **Smart Connections** *(da confermare)*: ricerca per significato con indici sul computer, senza chiavi di accesso a servizi esterni; la chat sta
  nel plugin Smart Chat. Esiste un server MCP di terzi, in sola lettura, per Claude Code.
- **Copilot for Obsidian** *(da confermare)*: la modalità agente legge, crea e modifica note. La versione 4.0.0 porta
  Claude Code, Codex e opencode dentro Obsidian; i modelli locali passano da opencode; solo su computer.

Come si usa il kit:
1. Quello che scrivi tu a mano in Obsidian va bene: poi lancia `node bin/controlla.mjs` per vedere link rotti,
   frontmatter (le righe tra `---` in cima alla pagina) e caratteri vietati.
2. Un plugin AI che crea e modifica note è un agente con la cartella: non è verificato che legga `AGENTS.md`, quindi
   comincia con «leggi AGENTS.md e fai quello che dice». Se il plugin porta dentro Claude Code o Codex, valgono le
   loro schede.
3. Per vedere il cervello su altri dispositivi la strada più sicura è la B del capitolo 2.1 della guida, con una copia
   di sola lettura nell'archivio cloud. La cartella del cervello dentro Drive, OneDrive o Dropbox (strada D) regge
   solo con un computer che scrive: con due nascono doppioni.

## Strada C: solo GitHub, con un agente nel cloud

Per la strada C del capitolo 2.1 della guida (il cervello solo nel repository privato su GitHub, senza una cartella sul
computer), tra queste piattaforme *(da confermare)*:
- **Cursor**, con gli agenti nel cloud che lavorano su un repository: con un repository il risultato previsto è una
  richiesta di modifica da unire tu, non un salvataggio diretto sul ramo principale;
- **Mistral Vibe Code**, con le sessioni remote su un repository GitHub, che modificano file e aprono richieste di
  modifica; il file di istruzioni non è indicato, quindi si comincia con «leggi AGENTS.md e fai quello che dice».

Devin Desktop, i modelli locali e Obsidian lavorano su una cartella del computer. L'installazione la guida
`INSTALLA.md` del kit; si salva con `git add -A`, commit e push sul ramo che la piattaforma usa, mai con
`node bin/sincronizza.mjs`.

## Cosa non si può fare

- Nessuna di queste piattaforme ha i controlli automatici del kit, che sono di Claude Code.
- Con Mistral Work, i modelli locali e le loro automazioni non si scrive nel cervello: solo note per il cervello.
- Le memorie di Cursor non sono verificate e Devin Local non ne conserva *(da confermare)*: non sono un posto per le
  regole.

## Trappole

- **Regole perse in silenzio.** Un `.md` dentro `.cursor/rules` viene ignorato; le regole di Devin in `.devin/rules/`
  vogliono un `trigger`. Le regole del cervello stanno nel nucleo dentro `AGENTS.md`, che queste piattaforme leggono da sole.
- **Vecchi file di regole.** `.windsurfrules` e simili restano letti dopo il cambio di nome.
- **Automazioni che si fermano.** Senza un permesso dato in anticipo un'attività di Vibe si ferma; dare il permesso a
  tutto è peggio: meglio bozze e note.
- **Contesto piccolo dei modelli locali.** Troppi file o troppi server MCP e il modello perde le istruzioni.

## Fonti

Lette sulle pagine ufficiali il 03/11/2026:
- [Regole di Cursor](https://cursor.com/docs/rules)
- [File di Devin Desktop](https://docs.devin.ai/desktop/cascade/agents-md)
- [Registro delle versioni di Devin Desktop](https://docs.devin.ai/desktop/changelog)
- [Le Chat diventa Vibe](https://help.mistral.ai/en/articles/682992-le-chat-is-now-vibe)
- [Modalità di Vibe](https://docs.mistral.ai/vibe/choose-chat-work-code)

Viste solo come estratto di ricerca *(da confermare)*:
- [Automazioni di Cursor](https://cursor.com/docs/cloud-agent/automations), letta per intero il 04/11/2026
- [Attività pianificate di Mistral](https://docs.mistral.ai/vibe/work/scheduled-tasks)
- [MCP in LM Studio](https://lmstudio.ai/docs/app/mcp)
- [Open WebUI](https://docs.openwebui.com/features/)

Fonti non ufficiali *(da confermare)*:
- [Smart Connections](https://github.com/brianpetro/obsidian-smart-connections)
- [Copilot for Obsidian 4.0.0](https://github.com/logancyang/obsidian-copilot/releases/tag/4.0.0)
- [Client MCP per Ollama](https://github.com/jonigl/mcp-client-for-ollama)
