# ChatGPT e Codex (OpenAI)

Verificato il 03/11/2026: le piattaforme cambiano spesso, controlla le pagine ufficiali linkate.

Come si legge: ciò che è segnato *(da confermare)* viene da un estratto di ricerca di una pagina ufficiale, da una
fonte non ufficiale oppure è incerto; prima di contarci, aprilo dal link in fondo. Il resto è stato letto sulle pagine
ufficiali il 03/11/2026. I nomi dei menu e dei piani sono quelli trovati quel giorno.

## In breve

| Livello del kit | Su ChatGPT e Codex | File del kit |
|---|---|---|
| 1, solo chat | un Progetto di ChatGPT | `esporta/istruzioni-chat.md` nelle istruzioni, `esporta/conoscenza-*.md` tra i file |
| 2, agente con cartella | Codex aperto nella cartella del cervello; ChatGPT Work nell'app desktop con la cartella collegata *(da confermare)* | `AGENTS.md`, che Codex legge da solo |
| 3, sistema completo | attività pianificate di Codex nell'app desktop, a computer acceso *(da confermare)* | `automazioni/routine/routine-custode.md` |

Con Codex il kit arriva al livello 2 senza adattamenti, perché `AGENTS.md` è il suo file di istruzioni. Mancano i
controlli automatici, che sono di Claude Code. I GPT personalizzati chiudono: non ci si costruisce sopra.

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat**; **2, agente con cartella**;
**3, sistema completo**.

## Cosa si può fare

| | ChatGPT (web, telefono, app) | ChatGPT Work nell'app desktop | Codex |
|---|---|---|---|
| Istruzioni | istruzioni di progetto e istruzioni personali *(da confermare)* | non verificato | `AGENTS.md`, globale e per cartella |
| File | file del progetto *(da confermare)* | cartelle locali collegate *(da confermare)* | la cartella del progetto |
| Scrive file | dal web e dal telefono no | sì, nelle cartelle collegate *(da confermare)* | sì |
| Memoria | memorie salvate e storico delle chat *(da confermare)* | non verificato | memorie locali, spente di default *(da confermare)* |
| Attività pianificate | sì, senza cartella *(da confermare)* | non verificato | nell'app desktop, su un progetto locale *(da confermare)* |
| Connettori e MCP | modalità sviluppatore *(da confermare)* | non verificato | skill; plugin con server MCP *(da confermare)* |

I dettagli:
- **Progetti** *(da confermare)*. File per progetto: 5 sul piano gratuito, 25 su Go e Plus, 40 su Edu, Pro, Business
  ed Enterprise; 10 file per caricamento. Le istruzioni di progetto sostituiscono quelle globali; un limite di 8.000
  caratteri lo indicano solo fonti non ufficiali. Le istruzioni personali arrivano a 5.000 caratteri sui piani a
  pagamento. Memoria di progetto predefinita oppure «solo progetto», che si attiva da sola quando il progetto è
  condiviso.
- **Memoria** *(da confermare)*: memorie salvate più il riferimento allo storico delle chat, con aggiornamento
  automatico dal 04/06/2026.
- **MCP** (il protocollo con cui un'AI si collega a servizi esterni) *(da confermare)*: si usa con la modalità
  sviluppatore. Scrittura completa su Business, Enterprise ed Edu (in beta), solo lettura su Pro; le azioni di
  scrittura chiedono conferma. Le fonti non concordano.
- **Attività pianificate** *(da confermare)*. Attive al massimo: 3 su Gratuito e Go, 5 su Plus, 10 su Business ed Edu,
  15 su Pro ed Enterprise. Ricorrenza fino a ogni ora sui piani a pagamento, una volta al giorno sul gratuito. Possono
  partire da eventi (Gmail, Slack, richieste di modifica su GitHub). Un'azione che scrive può chiedere approvazione e
  mettere in pausa l'attività.
- **Agente** *(da confermare)*: «ChatGPT agent» non c'è più, lo sostituisce ChatGPT Work. Work nell'app desktop collega
  cartelle locali («Add folder»), le legge e le modifica; dal web e dal telefono no.
- **Skill e plugin** *(da confermare)*: un plugin è un pacchetto di skill (istruzioni in una cartella che l'AI apre da
  sola quando servono) e di server MCP, più hook (controlli automatici) per Codex e Work. Si costruisce con un file
  `plugin.json`, la cartella `skills/` e un `mcp.json` facoltativo. La directory dei plugin è unica per ChatGPT e Codex;
  l'amministratore carica uno ZIP.
- **GPT personalizzati** *(da confermare)*: 20 file da 512 MB ciascuno. Ritirati l'11/12/2026 (Enterprise con proroga
  fino all'11/02/2027) e sostituiti dai plugin.
- **Codex.** Legge un `AGENTS.md` globale in `~/.codex` (oppure `AGENTS.override.md`), poi uno per cartella, dalla
  radice del repository fino alla cartella corrente, e li concatena. Il tetto complessivo è 32 KiB
  (`project_doc_max_bytes`); i nomi alternativi si impostano con `project_doc_fallback_filenames`. Le skill stanno in
  `.agents/skills` e `~/.agents/skills`. Memorie locali spente di default, in `~/.codex/memories`, e la documentazione
  dice di non usarle come fonte di regole *(da confermare)*. Attività pianificate nell'app desktop su un progetto
  locale, con il computer acceso e l'app aperta; dal web non c'è la cartella locale *(da confermare)*. Codex Cloud è
  per Plus e piani superiori, ma la sua pagina ora è marcata «Legacy» *(da confermare)*.

## Livello 1: un Progetto di ChatGPT

1. Sul computer, dalla cartella del cervello: `node bin/costruisci.mjs --esporta`. Lo script crea `esporta/` e dice
   quanti caratteri ha `istruzioni-chat.md`; sopra gli 8.000 avvisa.
2. Crea un Progetto in ChatGPT per il cervello.
3. Incolla tutto `esporta/istruzioni-chat.md` nelle istruzioni del progetto; e siccome le istruzioni di progetto
   sostituiscono quelle globali *(da confermare)*, tutto ciò che ti serve nel progetto deve stare lì. Per le chat fuori
   dal progetto, nelle istruzioni personali (5.000 caratteri) incolla `esporta/istruzioni-brevi.md`: chi sei, la
   regola d'ambito, come scrivere e la nota per il cervello. Lo script avvisa se supera i 5.000 caratteri
   (`limiti.istruzioniBrevi`).
4. Carica tra i file del progetto i file `esporta/conoscenza-*.md`. Se il tuo piano ne accetta pochi (5 sul piano
   gratuito) *(da confermare)*, metti il numero nella voce `limiti.fileEsportaMax` di `bin/impostazioni.json` e rilancia
   `--esporta`: lo script accorpa i file fino a stare nel numero (il minimo è 2) e avvisa solo se un file supera la
   misura. Si caricano al massimo 10 file per volta *(da confermare)*.
5. Prova in una chat nuova del progetto: «di chi è questo cervello e cosa fai prima di scrivere una mail a un
   cliente?». La risposta deve citare le pagine.
6. Quando la chat ti dà una NOTA PER IL CERVELLO, salvala nella cartella `.raw/inbox/` del cervello come
   `AAAA-MM-GG-<tema>.md`.
7. La memoria non è un posto per le regole: le regole stanno nelle istruzioni e nei file. Se il progetto lo permette,
   la memoria «solo progetto» tiene separato questo lavoro dalle altre chat *(da confermare)*.
8. Quando cambi una regola o il cervello cresce, rilancia `--esporta` e sostituisci sia le istruzioni sia i file (i
   nomi dei file possono cambiare). Scrivi il progetto nella tabella «Account delle AI e plugin» di
   `wiki/meta/mappa-del-cervello.md`.

## Livello 2: Codex nella cartella

1. Apri Codex con la cartella del cervello come progetto. Per la prima costruzione usa il prompt A di
   `PROMPT-DI-AVVIO.md`.
2. Codex legge da solo `AGENTS.md`, insieme all'eventuale `~/.codex/AGENTS.md` globale. Insieme devono stare sotto i
   32 KiB: oltre, Codex smette di aggiungere file. L'`AGENTS.md` del modello pesa circa 11 KB e
   `node bin/costruisci.mjs` avvisa quando supera i 32 KB (`limiti.agentsKB` in `bin/impostazioni.json`). Tieni corto
   il file globale: al massimo una riga che dice dove sta il cervello.
3. `CLAUDE.md` e la cartella `.claude/` sono di Claude Code: in Codex non partono i controlli automatici del kit
   (caratteri vietati, segreti, nucleo da rigenerare). Per questo, a fine lavoro, chiedi «fai la chiusura di sessione
   di AGENTS.md»: i punti 6 e 7 lanciano `node bin/costruisci.mjs` (se è cambiata una regola), `node bin/controlla.mjs`
   e il salvataggio.
4. I comandi di Claude Code sono file di testo che ogni agente può seguire: «segui `.claude/commands/nuova-regola.md`»,
   «segui `.claude/commands/ingerisci.md` su `.raw/`».
5. Sessioni di Codex aperte in altre cartelle: copia la cartella `automazioni/plugin-cervello/skills/cervello` in
   `~/.agents/skills/cervello`, così il nucleo arriva anche lì. È una copia: va rifatta quando
   `node bin/costruisci.mjs` cambia la versione del plugin. Dentro la cartella del cervello non serve, perché c'è
   `AGENTS.md`.
6. Le memorie di Codex restano spente, o contengono solo rimandi di una riga alle pagine.

ChatGPT Work nell'app desktop, in alternativa *(da confermare)*: collega la cartella del cervello con «Add folder».
Non è verificato che legga `AGENTS.md`: comincia ogni lavoro con «leggi AGENTS.md in questa cartella e fai quello che
dice». Dal web e dal telefono questa strada non c'è.

## Livello 3: automazioni

- Git, sincronizzazione e controllo quotidiano su GitHub funzionano allo stesso modo con qualunque AI: girano sul
  computer e su GitHub. Li spiega la guida.
- **Il Custode con Codex** *(da confermare)*: un'attività pianificata nell'app desktop di Codex, su un progetto locale,
  con il testo del blocco «Prompt» di `automazioni/routine/routine-custode.md`. Gira solo con il computer acceso e
  l'app aperta. Il Custode è scritto per lavorare su un clone del repository (fa da solo `git pull` e `git push`):
  dagli un clone a parte, non la cartella dove lavori e dove gira la sincronizzazione, così i due salvataggi non si
  sovrappongono. Scrivi l'attività in `wiki/meta/mappa-del-cervello.md`. Se il computer era spento, il battito
  `custode` invecchia e il controllo lo segnala.
- In alternativa, una volta a settimana, il prompt D di `PROMPT-DI-AVVIO.md` (manutenzione a mano).
- **Attività pianificate di ChatGPT** *(da confermare)*: non hanno la cartella e non scrivono nel cervello. Servono per
  un promemoria o un riassunto da un connettore, che chiude con una nota per il cervello (prompt E). Siccome un'azione
  che scrive può fermare l'attività in attesa di approvazione, per un'attività che gira da sola fai produrre solo testo
  o bozze.
- **Plugin** *(da confermare)*: il manifesto del plugin del kit è nel formato di Claude
  (`automazioni/plugin-cervello/.claude-plugin/plugin.json`). La skill `skills/cervello/SKILL.md` si può riusare, ma
  il pacchetto per ChatGPT e Codex va preparato a parte e lo carica l'amministratore come ZIP. È una copia a mano: va
  rifatta a ogni versione.
- Codex Cloud è marcato «Legacy» *(da confermare)*: non costruirci sopra le routine finché non è chiaro.

## Strada C: solo GitHub, con un agente nel cloud

Per la strada C del capitolo 2.1 della guida (il cervello solo nel repository privato su GitHub, senza una cartella sul
computer) qui servirebbe Codex nel cloud su un repository GitHub, ma la sua pagina è marcata «Legacy» *(da
confermare)*: prima di sceglierlo, controlla sulle pagine ufficiali che ci sia ancora e come salva (sul ramo principale
o su un ramo da unire). Codex legge `AGENTS.md` da solo; l'installazione la guida `INSTALLA.md` del kit, e si salva con
`git add -A`, commit e push sul ramo che la piattaforma usa, mai con `node bin/sincronizza.mjs`. Se non c'è, per la C
serve un'altra piattaforma (le schede `piattaforme/claude.md`, `piattaforme/microsoft-e-github.md`,
`piattaforme/altri.md`).

## Cosa non si può fare

- Dal web e dal telefono ChatGPT non scrive file: lì si lavora con le note per il cervello.
- Le istruzioni personali (5.000 caratteri) non contengono `istruzioni-chat.md`: ci sta solo `istruzioni-brevi.md`;
  per le regole intere e i fatti serve un progetto.
- I GPT personalizzati chiudono l'11/12/2026 *(da confermare)*.
- Le attività pianificate di Codex non girano a computer spento o con l'app chiusa *(da confermare)*.
- I controlli automatici del kit non partono in Codex.

## Trappole

- **32 KiB.** Oltre il tetto Codex smette di aggiungere file di istruzioni, e i file lunghi vengono seguiti peggio.
  Un `AGENTS.md` globale lungo ruba spazio a quello del cervello.
- **Memorie come fonte di regole.** No: lo dice anche la documentazione di Codex *(da confermare)*. Una regola sta in
  una pagina.
- **Istruzioni globali dimenticate.** Nel progetto valgono le istruzioni del progetto, non quelle personali *(da
  confermare)*.
- **Progetto condiviso.** La memoria «solo progetto» si attiva da sola *(da confermare)*: controlla cosa vede chi entra.
- **Automazioni che si fermano.** Un'attività che deve scrivere su un servizio può restare in pausa in attesa di un
  sì: se non arriva un resoconto, non è detto che sia tutto a posto.
- **Connettori.** Prima di un'azione che scrive, controlla a quale account è collegato il connettore (regola
  `sistemi-esterni` del cervello).

## File del kit da usare

| Dove | File |
|---|---|
| Istruzioni di un Progetto | `esporta/istruzioni-chat.md` |
| File di un Progetto | `esporta/conoscenza-*.md` |
| Codex, ChatGPT Work | `AGENTS.md` |
| Skill per le sessioni fuori dalla cartella | `automazioni/plugin-cervello/skills/cervello`, copiata in `~/.agents/skills/` |
| Custode | `automazioni/routine/routine-custode.md` e la procedura `automazioni/custode.md` |

## Fonti

Lette sulle pagine ufficiali il 03/11/2026:
- [AGENTS.md in Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Personalizzazione](https://learn.chatgpt.com/docs/customization/overview)
- [Skill e plugin](https://learn.chatgpt.com/docs/skills-and-plugins)

Viste solo come estratto di ricerca *(da confermare)*:
- [Progetti](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- [Memoria](https://help.openai.com/en/articles/8590148-memory-in-chatgpt)
- [Attività pianificate](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)
- [Modalità sviluppatore e MCP](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)
- [Ritiro dei GPT](https://help.openai.com/en/articles/20001519)
- [Plugin](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt)
- [ChatGPT agent](https://help.openai.com/en/articles/11752874-chatgpt-agent)
- [Progetti e cartelle](https://learn.chatgpt.com/docs/projects)
- [Attività pianificate di Codex](https://developers.openai.com/codex/app/automations)
- [Memorie di Codex](https://developers.openai.com/codex/memories)

Fonte non ufficiale *(da confermare)*:
- [Visual Studio Magazine sui GPT](https://visualstudiomagazine.com/articles/2026/09/28/openai-replacing-custom-gpts-with-plugins-including-for-codex-in-vs-code.aspx)
