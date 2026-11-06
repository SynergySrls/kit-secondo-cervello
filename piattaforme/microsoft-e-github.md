# Microsoft 365 Copilot e GitHub Copilot

Verificato il 03/11/2026: le piattaforme cambiano spesso, controlla le pagine ufficiali linkate.

Come si legge: ciò che è segnato *(da confermare)* viene da un estratto di ricerca di una pagina ufficiale, da una
fonte non ufficiale oppure è incerto; prima di contarci, aprilo dal link in fondo. Il resto è stato letto sulle pagine
ufficiali il 03/11/2026. Attenzione al nome: Copilot Cowork di Microsoft e Cowork di Claude sono due prodotti diversi.

## In breve

| Livello del kit | Su Microsoft e GitHub | File del kit |
|---|---|---|
| 1, solo chat | un agente di Agent Builder (Microsoft 365 Copilot) | `esporta/istruzioni-chat.md` nelle istruzioni, i file di conoscenza in .txt (`node bin/costruisci.mjs --esporta --txt`) |
| 2, agente con cartella | in parte: Copilot Cowork lavora su OneDrive e SharePoint, non su una cartella locale con Git *(da confermare)*; GitHub Copilot lavora sul repository del cervello | la skill in `automazioni/plugin-cervello/skills/cervello`; `AGENTS.md` |
| 3, sistema completo | prompt pianificati e trigger di Copilot Studio, ma senza la cartella | per il Custode, un'altra piattaforma o il prompt D |

Le regole vanno nelle istruzioni dell'agente, mai solo nei file di conoscenza: Microsoft avverte che i file passano
da filtri anti iniezione e possono essere bloccati *(da confermare)*.

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat**; **2, agente con cartella**;
**3, sistema completo**.

## Cosa si può fare

| | Agent Builder | Copilot Studio | Copilot Cowork (Microsoft) | GitHub Copilot |
|---|---|---|---|---|
| Istruzioni | fino a 8.000 caratteri | non verificato | istruzioni personalizzate | file di istruzioni del repository; `AGENTS.md` nell'agente nel cloud, in Copilot CLI e in VS Code, non nella chat di github.com |
| File | 100 da SharePoint, 50 da OneDrive, 20 caricati; tipi .doc, .docx, .pdf, .ppt, .pptx, .txt, .xls, .xlsx (non .md) | 500 fonti e 500 file, 512 MB per file *(da confermare)* | file Office su OneDrive e SharePoint | il repository |
| Scrive file | non verificato | non verificato | modifica file Office su OneDrive e SharePoint | non verificato |
| Memoria | non verificato | opzione di memoria *(da confermare)* | non verificato | Copilot Memory |
| Attività pianificate | 10 prompt pianificati per utente *(da confermare)* | trigger di ricorrenza, ogni attivazione è un messaggio a pagamento *(da confermare)* | 25 prompt pianificati e attività su evento (mail, Teams) | pianificazione non trovata *(da confermare)* |
| Skill e plugin | skill: uno zip con `SKILL.md` alla radice, fino a 8 per agente | non verificato | skill `SKILL.md` e plugin, anche caricati | non verificato |

I dettagli:
- **Agent Builder** (Microsoft 365 Copilot), verificato il 04/11/2026: istruzioni fino a 8.000 caratteri. Microsoft
  sconsiglia di spostare le istruzioni nei file di conoscenza, che passano per i filtri anti iniezione (protezioni
  contro testi che cercano di dare ordini all'AI) e possono essere bloccati. Conoscenza: 100 file da SharePoint, 50 da
  OneDrive, 20 caricati, nei tipi .doc, .docx, .html (solo da SharePoint), .pdf, .ppt, .pptx, .txt, .xls, .xlsx: i
  `.md` non ci sono, per questo il kit li esporta anche come `.txt`. Skill: uno zip fino a 50 MB con `SKILL.md` alla
  radice dello zip (non dentro una cartella, al contrario di claude.ai), istruzioni sotto i 20.000 caratteri, al
  massimo 8 skill per agente. 10 prompt pianificati per utente.
- **Copilot Studio** *(da confermare)*: 500 fonti e 500 file, 512 MB per file. Trigger di ricorrenza in cui ogni
  attivazione è un messaggio fatturato; c'è un'opzione di memoria.
- **Copilot Cowork** di Microsoft (verificato il 04/11/2026): disponibile in generale per gli account di lavoro e
  scuola, in anteprima per quelli personali. Modifica file Office su OneDrive e SharePoint. Le skill (istruzioni in una
  cartella che l'AI apre da sola quando servono) sono file `SKILL.md`: al massimo 50 skill, 1 MB per file, 20 file di
  supporto e 10 MB per skill. Si caricano da Customize > Skills > Upload skill (un `.md`, oppure uno zip o un file
  `.skill` con `SKILL.md` alla radice); Customize > Plugins > Upload plugin accetta anche un pacchetto di plugin di
  Claude e lo converte. Ha istruzioni personalizzate, 25 prompt pianificati e attività che partono da un evento (mail,
  Teams). Cartella locale e Git non sono documentati *(da confermare)*.
- **GitHub Copilot** (verificato il 04/11/2026): l'agente nel cloud legge `.github/copilot-instructions.md`,
  `.github/instructions/**/*.instructions.md` (con `applyTo`), i file `AGENTS.md` anche nelle sottocartelle (vince il
  più vicino) e, alla radice, anche `CLAUDE.md` e `GEMINI.md`; `AGENTS.md` lo leggono anche Copilot CLI e la chat in
  VS Code, non la chat su github.com. In VS Code gli `AGENTS.md` fuori dalla radice sono spenti di default. Copilot
  Memory, sui piani a pagamento, tiene fatti per repository e preferenze per utente e fa scadere quelli non
  riconfermati: 90 giorni di default, regolabili dall'organizzazione. Una pianificazione non è stata trovata.

## Livello 1: un agente di Agent Builder

1. Sul computer, dalla cartella del cervello: `node bin/costruisci.mjs --esporta`. Lo script crea `esporta/` e dice
   quanti caratteri ha `istruzioni-chat.md`.
2. Crea un agente e incolla tutto `esporta/istruzioni-chat.md` nelle sue istruzioni. Il limite è 8.000 caratteri *(da
   confermare)*, lo stesso che lo script usa per l'avviso (`limiti.istruzioniChat`). Il file del modello ci sta, ma con
   poco margine: quando compili «Chi» e aggiungi regole può superarlo. Se lo script avvisa, accorcia le «In breve» o
   metti `nucleo: no` alle regole meno usate, poi rilancia `--esporta`.
3. Agent Builder non accetta i `.md` come conoscenza: prepara il pacchetto con `node bin/costruisci.mjs --esporta --txt`
   e carica i file `esporta/conoscenza-*.txt`. Il pacchetto ne fa al massimo 20 (`limiti.fileEsportaMax`), quanti se ne
   possono caricare. Se preferisci tenerli in OneDrive o SharePoint, metti lì solo il pacchetto: è una copia di sola
   lettura. Il cervello di norma non sta in OneDrive, tranne la strada D del capitolo 2.1 della guida. In alternativa
   al nucleo nelle istruzioni, puoi caricare come skill
   uno zip della cartella `automazioni/plugin-cervello/skills/cervello` con `SKILL.md` alla radice dello zip: è una
   copia, da ricaricare quando cambia la versione del plugin.
4. Le regole restano nelle istruzioni: è per questo che `istruzioni-chat.md` contiene il nucleo intero. Se un file di
   conoscenza viene bloccato dai filtri, l'agente perde i fatti ma non le regole.
5. Quando l'agente ti dà una NOTA PER IL CERVELLO, salvala nella cartella `.raw/inbox/` del cervello.
6. Scrivi l'agente nella tabella «Account delle AI e plugin» di `wiki/meta/mappa-del-cervello.md` e ricaricalo dopo
   ogni cambio di regola.

## Livello 2, in parte

Con Copilot Cowork di Microsoft:
- Lavora su file Office in OneDrive e SharePoint; il cervello è fatto di file markdown in una cartella del computer,
  con Git. Che Cowork lavori su una cartella locale o con Git non è documentato *(da confermare)*: non spostare il
  cervello in OneDrive per farglielo vedere, perché una cartella sincronizzata crea doppioni. Di norma il cervello non
  sta in OneDrive, tranne la strada D del capitolo 2.1 della guida; e anche con la D, Copilot Cowork che modifica i
  file su OneDrive sarebbe un secondo scrittore accanto al computer.
- Puoi portargli le regole come skill: Customize > Skills > Upload skill, con uno zip della cartella
  `automazioni/plugin-cervello/skills/cervello` (`SKILL.md` alla radice dello zip), oppure Customize > Plugins > Upload
  plugin con lo zip di `automazioni/plugin-cervello`. È una copia: non si modifica lì, si cambia il cervello e si
  ricarica dopo ogni `node bin/costruisci.mjs` che cambia la versione del plugin.
- Nelle istruzioni personalizzate basta una riga: «All'inizio di ogni lavoro usa la skill cervello».

Con GitHub Copilot sul repository del cervello (serve il repository su GitHub del livello 3):
- L'agente nel cloud, Copilot CLI e VS Code leggono `AGENTS.md` alla radice; la chat su github.com no. L'agente nel
  cloud legge anche `CLAUDE.md` alla radice: quello del kit contiene solo l'import di `AGENTS.md` e la parte per Claude
  Code, quindi non dice cose diverse.
- Non aggiungere `.github/copilot-instructions.md` con una copia delle regole: diventerebbe una seconda fonte. Se serve,
  una riga sola: «Le istruzioni stanno in AGENTS.md».
- Copilot Memory fa scadere i ricordi non riconfermati (90 giorni di default, regolabili dall'organizzazione): non è
  un posto per le regole.
- A fine lavoro chiedi la chiusura di sessione di `AGENTS.md`: i punti 6 e 7 lanciano i controlli e il salvataggio,
  perché qui i controlli automatici di Claude Code non partono.
- Il controllo quotidiano del cervello (`.github/workflows/controllo.yml`) è un'altra cosa: gira su GitHub qualunque
  AI tu usi.

## Livello 3: automazioni

- Git, sincronizzazione e controllo quotidiano su GitHub funzionano anche qui: girano sul computer e su GitHub. Li
  spiega la guida.
- I prompt pianificati (10 in Agent Builder *(da confermare)*, 25 in Copilot Cowork) e i trigger di Copilot Studio
  *(da confermare)* non hanno la cartella del cervello: possono preparare un riassunto o un resoconto che chiude con
  una nota per il cervello (prompt E di `PROMPT-DI-AVVIO.md`), non scrivere nel cervello.
- In Copilot Studio ogni attivazione è un messaggio a pagamento *(da confermare)*: un'attività ogni ora costa 24
  messaggi al giorno.
- Per il Custode serve un'altra piattaforma (`piattaforme/claude.md`, `piattaforme/altri.md`) oppure il prompt D, una
  volta a settimana, con un agente che lavora nella cartella.

## Strada C: solo GitHub, con un agente nel cloud

Per la strada C del capitolo 2.1 della guida (il cervello solo nel repository privato su GitHub, senza una cartella sul
computer) c'è l'agente nel cloud di GitHub Copilot: lavora sul repository del cervello e legge `AGENTS.md` e
`CLAUDE.md` alla radice (verificato il 04/11/2026). L'installazione la guida `INSTALLA.md` del kit. Le modifiche
arrivano su un ramo separato, con una richiesta di modifica da unire tu su GitHub *(da confermare)*; si salva con
`git add -A`, commit e push, mai con `node bin/sincronizza.mjs`. I controlli automatici di Claude Code qui non
partono: a fine lavoro serve la chiusura di sessione di `AGENTS.md`. Se un caricamento che tocca `.github/workflows/`
viene rifiutato, l'accesso dell'agente non ha quel permesso *(da confermare)*: il file lo carichi tu dal sito.

## Cosa non si può fare

- Cartella locale e Git non sono documentati per Copilot Cowork *(da confermare)*.
- Le regole nei soli file di conoscenza possono essere bloccate dai filtri anti iniezione *(da confermare)*.
- Una pianificazione per GitHub Copilot non è stata trovata *(da confermare)*.
- Nessuna superficie Microsoft verificata ha i controlli automatici del kit, che sono di Claude Code.

## Trappole

- **Stesso nome, prodotti diversi.** Copilot Cowork è di Microsoft, Cowork è di Claude: le schede sono separate.
- **Il cervello in OneDrive.** Per farlo vedere a Copilot viene la tentazione di spostarlo: nascono doppioni e
  modifiche senza revisione. Di norma, tranne la strada D del capitolo 2.1 della guida, in OneDrive va solo il
  pacchetto di `--esporta`, o la copia della skill; e anche con la D, Copilot Cowork che modifica i file su OneDrive
  sarebbe un secondo scrittore.
- **Copie che restano indietro.** La skill copiata in OneDrive e i file caricati in Agent Builder non si aggiornano da
  soli: dopo ogni cambio di regola si ricaricano.
- **Margine stretto sulle istruzioni.** 8.000 caratteri si superano in fretta: guarda la misura che stampa
  `--esporta`.
- **Automazioni che si fermano.** Un'attività che deve scrivere su un servizio può aspettare un sì: se non arriva un
  resoconto, non è detto che sia tutto a posto.

## File del kit da usare

| Dove | File |
|---|---|
| Istruzioni di un agente di Agent Builder | `esporta/istruzioni-chat.md` |
| Conoscenza dell'agente | `esporta/conoscenza-*.txt` (con `--esporta --txt`) |
| Skill di Agent Builder e di Copilot Cowork | uno zip di `automazioni/plugin-cervello/skills/cervello`, con `SKILL.md` alla radice |
| GitHub Copilot | `AGENTS.md` |

## Fonti

Lette sulle pagine ufficiali il 03/11/2026 e di nuovo il 04/11/2026:
- [Copilot Cowork](https://learn.microsoft.com/en-us/copilot/cowork/use-cowork)
- [Personalizzare Copilot Cowork](https://learn.microsoft.com/en-us/copilot/cowork/cowork-customize)
- [Conoscenza di Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-knowledge)
- [Skill di Agent Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agent-builder-add-skills)
- [Istruzioni di GitHub Copilot](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [Copilot Memory](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)

Viste solo come estratto di ricerca *(da confermare)*:
- [Quote di Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-quotas)
- [Istruzioni degli agenti](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-instructions)
- [Prompt pianificati](https://support.microsoft.com/en-us/microsoft-365-copilot/schedule-your-most-used-copilot-prompts)
