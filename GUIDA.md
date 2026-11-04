# Guida al secondo cervello

Questa guida spiega come costruire e usare un secondo cervello con il kit. Si legge così: i capitoli 0, 1 e 2 tutti;
poi solo il capitolo del livello scelto (3 per il livello 2, 3 e 4 per il livello 3, 5 per il livello 1); i capitoli
dal 6 al 12 quando lo usi; il 13 per capire perché il kit è fatto così; le appendici quando cerchi un file o un
comando.

Le parole tecniche inglesi sono spiegate tra parentesi la prima volta e riprese nel glossario (capitolo 16). I
percorsi come `wiki/hot.md` sono relativi alla cartella del cervello. Il segno `~` vuol dire la tua cartella utente
(su Windows `C:\Users\<il tuo nome utente>`, su macOS `/Users/<il tuo nome utente>`).

## 0. In una pagina

Un secondo cervello è una cartella di file di testo che un'AI legge prima di lavorare e aggiorna dopo. Dentro ci sono
chi sei e per chi lavori, cosa è in corso adesso, una pagina per ogni persona, azienda, progetto e strumento, le
sintesi dei documenti e le regole che vuoi siano rispettate sempre. I file sono in markdown (testo semplice con pochi
segni per titoli, elenchi e tabelle): si aprono con qualunque programma e non dipendono da nessuna piattaforma.

Cosa cambia per te:
- non rispieghi tutto a ogni conversazione: l'AI parte da ciò che il cervello sa già;
- una regola si scrive una volta e vale per tutte le AI che usi;
- ciò che si decide oggi resta in una pagina, invece di perdersi in una chat;
- dei controlli automatici trovano gli errori che la memoria dell'AI lascia passare.

Come è fatto:

| Pezzo | Dove sta | A cosa serve |
|---|---|---|
| Le istruzioni | `AGENTS.md` (e `CLAUDE.md`, che lo importa per Claude Code) | chi sei, cosa leggere per primo, dove si scrive, come si chiude una sessione |
| Le regole | una pagina per regola in `wiki/concepts/` | cosa si fa e cosa no, con il perché |
| Il nucleo | `wiki/meta/nucleo.md` e un blocco in fondo ad `AGENTS.md`, generati | il riassunto di tutte le regole, che arriva a ogni AI |
| I tre file d'ingresso | `wiki/hot.md`, `wiki/index.md`, `wiki/log.md` | cosa è in corso, la mappa delle pagine, la cronologia |
| La conoscenza | `wiki/entities/`, `wiki/sources/`, `wiki/concepts/` | soggetti, sintesi delle fonti, concetti |
| Gli strumenti | gli script (piccoli programmi) in `bin/` | generano il nucleo, controllano, salvano, avvisano |
| Le automazioni | `automazioni/` | le procedure delle routine che lavorano da sole |

Tre livelli, dal più semplice al più completo:

| Livello | Tempo | Cosa ottieni |
|---|---|---|
| 1. Solo chat | 15 minuti | un'AI con progetti e file caricati conosce te e le tue regole; il cervello si legge, e si aggiorna con le note che salvi tu |
| 2. Agente con cartella | da un'ora a due ore e mezza, compresa l'installazione dei programmi | un agente (un'AI che lavora sui file del computer) legge e scrive il cervello: ingerisce documenti, aggiorna pagine, cambia regole |
| 3. Sistema completo | mezza giornata | il cervello si salva da solo su GitHub (il servizio online che conserva i file con la loro storia), si controlla ogni giorno, si riordina la sera e le sue regole arrivano anche alle chat del telefono |

Il primo giorno, al livello 2:
1. installi Node (il programma che fa girare gli script del kit) e un agente;
2. copi la cartella `modello/` del kit in una cartella tua, fuori dalle cartelle sincronizzate;
3. apri l'agente in quella cartella e incolli il prompt (il testo da dare all'AI) A di `PROMPT-DI-AVVIO.md`;
4. rispondi alle domande: chi sei, cosa entra nel cervello, come vuoi che ti si scriva;
5. lanci `node bin/controlla.mjs`: zero rossi vuol dire che il cervello è in ordine.

## 1. Le idee che lo fanno funzionare

Il kit non è un elenco di file: è un modo di lavorare. Queste sette idee spiegano quasi tutte le sue scelte.

### 1.1 Una fonte sola, le regole come pagine, il nucleo generato

Le istruzioni sono una sola: `AGENTS.md` più le pagine regola. Ogni regola sta in una pagina sua in `wiki/concepts/`,
con `type: regola` e una sezione «In breve» di massimo quattro righe. Uno script, `node bin/costruisci.mjs`, raccoglie
gli «In breve» e ne fa il nucleo: il riassunto che entra in `AGENTS.md`, nel plugin per le chat (un pacchetto di
istruzioni che l'account dell'AI installa e tiene aggiornato) e nel pacchetto di file per le altre AI. Il nucleo non si
modifica a mano.

Perché: ogni copia di una regola, prima o poi, diverge dalle altre. Quando la stessa regola sta in un file di
istruzioni, in una memoria dell'AI, in una skill (istruzioni che l'AI apre da sola quando servono) e nel prompt di una
routine, nessuno sa più quale valga. Con una
pagina sola e un riassunto generato, si corregge in un posto e la correzione arriva ovunque. Se una memoria, una
skill o un plugin dicono altro, vale il cervello.

### 1.2 Tre file d'ingresso: hot, index, log

| File | Cosa contiene | Come si scrive |
|---|---|---|
| `wiki/hot.md` | cosa è in corso nelle ultime due settimane, in voci brevi con il rimando alla pagina | voci nuove in cima a «In corso adesso» |
| `wiki/index.md` | la mappa di tutte le pagine, ognuna con una riga che dice cosa contiene | una riga per ogni pagina nuova, nella sezione giusta |
| `wiki/log.md` | la cronologia: cosa è stato fatto, perché, cosa non è stato toccato | voci nuove in fondo, quelle vecchie non si cambiano |

Ogni sessione comincia leggendo hot e index, senza che tu lo chieda, e poi apre solo la pagina che serve. Così l'AI
parte dal contesto giusto senza leggere tutto. Hot resta corta: le voci più vecchie di 14 giorni finiscono in un
archivio mensile, copiate parola per parola.

### 1.3 Estrai, non caricare

Nel cervello entra il dato, non il file. Da un PDF, un foglio, una mail o una registrazione si estraggono i fatti che
contano in una pagina, con il link a dove sta l'originale. I file pesanti (PDF, documenti d'ufficio, audio, video)
restano nel loro archivio; delle trascrizioni entra la sintesi.

Perché: un cervello pieno di file grezzi diventa lento da leggere, pesante da salvare e pieno di dati che non
dovrebbero esserci. Una pagina di sintesi si legge in un attimo e si collega alle altre.

### 1.4 Una sola copia scrivibile, le altre in sola lettura

Si scrive in una copia sola: la cartella del cervello. Al livello 3 la cartella si salva nel suo repository Git
(l'archivio con la storia di ogni modifica) su GitHub, che diventa la fonte di verità: computer e routine sono copie
di lavoro che si allineano a lui. Tutte le altre copie sono di sola lettura: il pacchetto caricato in una chat, il
plugin, una copia su un archivio cloud (un servizio che tiene i file online, come Drive o OneDrive).

Chi non può scrivere (una chat dal telefono, un'AI con i file caricati) lo dice e, quando nasce un fatto da ricordare,
prepara una **nota per il cervello**: un piccolo file con data, cosa è successo, dove va, cosa è da verificare. Tu la
salvi in `.raw/inbox/` e la integra il Custode (la routine serale) o la sessione successiva con la cartella.

Perché: scrivere da più posti crea doppioni. Il connettore di un archivio cloud (Drive, OneDrive, Dropbox e simili),
quando gli si chiede di modificare un file, spesso ne crea uno nuovo con lo stesso nome: il file vero resta fermo e
nascono le copie «(1)», «(2)». Una sola copia scrivibile elimina il problema alla radice.

### 1.5 I controlli automatici fanno rispettare ciò che la memoria dell'AI dimentica

Un'AI legge le regole, ma non sempre le applica: una regola di forma scritta da settimane può essere violata in
decine di titoli in un pomeriggio. Il kit non si fida della memoria: mette dei controlli meccanici.
- `node bin/controlla.mjs` controlla tutto il cervello (link rotti, caratteri vietati, frasi superate, segreti,
  battiti delle routine e altro) e dà un semaforo per ogni controllo.
- In Claude Code quattro hook (controlli automatici che partono da soli in certi momenti) guardano l'avvio, ogni
  messaggio, ogni modifica e ogni comando.
- Al livello 3 lo stesso controllo gira ogni giorno su GitHub e ti avvisa per mail o sul telefono.

### 1.6 Ogni errore che può ripetersi diventa una pagina

Un errore scritto solo nel log non protegge: il log nessuno lo legge prima di agire. Se un errore può ripetersi,
nella stessa sessione diventa una pagina (una regola o un concetto) e, se si può, una riga di controllo. Se correggi
due volte la stessa cosa nel modo di scrivere, nasce una riga No/Sì nella pagina `wiki/concepts/come-scrivere-per-me.md`.
Il comando `/chiudi` lo chiede a ogni fine sessione.

### 1.7 Formati aperti, perché i contenitori delle piattaforme chiudono

Assistenti personalizzati, «gem», agenti e strumenti a riga di comando delle grandi piattaforme sono stati chiusi,
rinominati o sostituiti nel giro di pochi mesi. Il kit si appoggia a formati che non appartengono a nessuno: file
markdown, Git, `AGENTS.md` (il file di istruzioni che molti agenti leggono da soli), `SKILL.md` (il formato delle
skill, pacchetti di istruzioni che l'AI apre quando servono). Le schede in `piattaforme/` dicono come collegare ogni
AI e portano la data in cui sono state verificate: quando una piattaforma cambia, cambia la scheda, non il cervello.

## 2. Scegli il livello

| | Livello 1: solo chat | Livello 2: agente con cartella | Livello 3: sistema completo |
|---|---|---|---|
| Tempo per partire | 15 minuti | da un'ora a due ore e mezza (un'ora se i programmi ci sono già) | mezza giornata, anche in più volte |
| Cosa installi | Node, solo per preparare il pacchetto (oppure niente, con il ripiego del 5.6) | Node, un agente (Claude Code o un altro che legge `AGENTS.md`), Obsidian per guardare, Git consigliato | in più Git, GitHub CLI (il programma `gh`, per accedere a GitHub dal terminale), un account GitHub; facoltativi Telegram e una piattaforma con routine nel cloud |
| Cosa costa | il piano gratuito o base dell'AI, con i suoi limiti di progetti e file (lo dice la scheda in `piattaforme/`) | il piano dell'AI che comprende l'agente (lo dice la scheda) | GitHub e Telegram gratuiti bastano; le routine nel cloud chiedono un piano a pagamento della piattaforma e ogni giro consuma una parte dei suoi limiti d'uso |
| Chi legge il cervello | l'AI della chat, da una copia caricata | l'agente, dalla cartella | l'agente, le routine nel cloud, le chat con il plugin |
| Chi scrive | tu, integrando le note per il cervello | l'agente, sul posto | l'agente e le routine; la sincronizzazione salva tutto su GitHub |
| Dove funziona | ovunque ci sia la chat, anche sul telefono | sul computer con la cartella | ovunque; il controllo e le routine anche a computer spento |
| Controlli | a mano, quando lanci `node bin/controlla.mjs` | in più gli hook, se usi Claude Code | in più il controllo quotidiano su GitHub con gli avvisi |
| Cosa resta a te | salvare le note e ricaricare il pacchetto | chiudere le sessioni, guardare i rossi | leggere gli avvisi e le proposte del Custode |

Come scegliere:
- **Vuoi provare senza impegno, o lavori solo in chat:** livello 1. Vedi subito se l'AI ti risponde meglio.
- **Lavori al computer e vuoi che l'AI tenga il cervello al posto tuo:** livello 2. È quello che dà più valore per il
  tempo che chiede.
- **Il cervello è diventato indispensabile, usi più computer o vuoi le regole anche nelle chat del telefono:**
  livello 3.

Si sale senza rifare niente. Dal livello 1 al 2 la cartella è la stessa: apri un agente lì dentro. Dal 2 al 3 si
aggiunge il passo Git (capitolo 4) e il resto si accende un pezzo alla volta.

Una cosa vale per tutti i livelli: **il kit non è il cervello.** La cartella del kit contiene la guida e il modello.
Il tuo cervello nasce copiando `modello/` in un'altra cartella; non si lavora mai dentro la cartella del kit, che ha
istruzioni sue per chi ne fa manutenzione.

## 3. Livello 2 passo per passo

### 3.1 I programmi

| Programma | A cosa serve | Dove si scarica | Serve |
|---|---|---|---|
| Node.js, versione LTS (quella con supporto lungo, consigliata sul sito), 18 o più recente | fa girare gli script di `bin/` | https://nodejs.org | sì |
| Un agente che lavora su una cartella | legge e scrive il cervello | Claude Code: https://claude.com/claude-code; gli altri nelle schede di `piattaforme/` | sì |
| Git | tiene la storia di ogni modifica e permette di tornare indietro; obbligatorio al livello 3 | https://git-scm.com | consigliato |
| Obsidian | guardare il cervello: link tra pagine, grafo, ricerca | https://obsidian.md | facoltativo |

Dopo l'installazione apri un terminale (la finestra dove si scrivono i comandi) e controlla:
```
node --version
git --version
```
Il primo deve rispondere `v18` o un numero più alto; il secondo con una versione qualunque.

**Come si apre un terminale nella cartella giusta.**
- Windows 11: in Esplora file entra nella cartella, clic destro in uno spazio vuoto, «Apri nel Terminale».
- macOS: apri l'app Terminale, scrivi `cd ` (con lo spazio), trascina la cartella dentro la finestra e premi Invio.
- Linux: clic destro nella cartella, «Apri nel terminale», oppure `cd` seguito dal percorso.

Al livello 2 quasi tutti i comandi li lancia l'agente quando glielo chiedi: il terminale ti serve per controllare le
versioni e per avviare l'agente.

### 3.2 Dove mettere la cartella e dove no

| Sì | No |
|---|---|
| una cartella nella tua cartella utente, per esempio `~/Cervello` (su Windows `C:\Users\<te>\Cervello`) | dentro Drive, OneDrive, Dropbox, iCloud o un'altra cartella sincronizzata nei due sensi |
| un disco del computer, sempre presente | Documenti o Scrivania, se il sistema li sincronizza con un archivio cloud (succede spesso, anche senza che te ne accorga) |
| un nome corto, senza spazi e senza accenti | Download, una chiavetta, un disco di rete |
| una cartella che non sta dentro un'altra cartella Git | la cartella del kit |

Perché niente cartelle sincronizzate: il programma di sincronizzazione e Git si contendono gli stessi file, nascono
doppioni e la storia di Git si può rovinare.

> **Copia di sicurezza.** Una cartella sola su un disco solo si perde con il disco o con il portatile. Quindi:
> - al livello 2: un repository privato su GitHub anche senza sincronizzazione automatica (4.1 e 4.2, parti A e B,
>   poi `node bin/sincronizza.mjs` a fine giornata), oppure il backup del sistema (Cronologia file su Windows, Time
>   Machine su macOS) su un disco esterno;
> - al livello 3: GitHub copre la cartella, ma non gli originali di `.raw/` né i file pesanti (restano nel loro
>   archivio) né le chiavi (la loro copia sta nel gestore di password);
> - i codici di recupero dell'accesso in due passaggi di GitHub si conservano fuori dal computer.

Scegli il nome una volta. Il nome della cartella entra nel nome dell'attività di sincronizzazione e della sua
cartella di stato, e alcuni agenti legano la loro memoria al percorso della cartella: se la sposti o la rinomini,
dopo dovrai rilanciare l'installazione della sincronizzazione e ricontrollare le memorie.

### 3.3 Copia il modello

1. Copia la cartella `modello` del kit, intera, nel posto scelto.
2. Rinominala con il nome scelto, per esempio `Cervello`.
3. Controlla che siano arrivati anche i file e le cartelle nascosti, quelli che iniziano con un punto: `.claude`,
   `.github`, `.raw`, `.claude-plugin`, `.gitignore`, `.gitattributes`. Copiando la cartella intera arrivano; se
   copi solo il contenuto con Esplora file o Finder, alcuni sistemi li saltano. Per vederli: in Esplora file
   «Visualizza», «Mostra», «Elementi nascosti»; nel Finder i tasti Cmd, Maiuscole e punto insieme.

Il modello è un cervello vuoto ma completo: dieci regole di base, le pagine meta, gli strumenti, le automazioni
spente. Dove serve un tuo dato c'è un segnaposto `{{DA COMPILARE: cosa}}`.

### 3.4 Il primo avvio con il prompt

**Con Claude Code.** Apri un terminale nella cartella del cervello e scrivi `claude`, oppure scegli la cartella
dall'app. La prima volta Claude Code chiede se ti fidi della cartella: rispondi di sì. Solo dopo questo passo partono
gli hook. Claude Code legge `CLAUDE.md`, che importa `AGENTS.md`.

Nella prima sessione l'agente lancia una ventina di comandi (`node --version`, `node bin/controlla.mjs`,
`node bin/costruisci.mjs`, `git init`, `git add`, `git commit`) e modifica molti file, e Claude Code chiede ogni volta
se consentire. Il modello ne approva già alcuni di sola lettura (`.claude/settings.json`, voce `permissions`); per i
comandi `node bin/...` e `git ...` dentro la cartella del cervello puoi rispondere di sì per la sessione. Un comando
che legge la cartella delle chiavi lo nega comunque l'hook `proteggi`.

**Con Cowork** (Claude sul desktop, senza terminale). Collega la cartella del cervello; nelle istruzioni di cartella
scrivi «Prima di tutto leggi AGENTS.md e fai quello che dice». Gli hook non partono: a fine lavoro chiedi la chiusura
di sessione di `AGENTS.md`, che lancia `node bin/controlla.mjs`. Non collegare mai la cartella privata delle chiavi.
Dettagli nella scheda `piattaforme/claude.md`.

**Con un altro agente.** Aprilo sulla cartella del cervello: se legge `AGENTS.md` da solo (Codex, Cursor, GitHub
Copilot e altri, vedi `piattaforme/`), le istruzioni arrivano senza fare niente. Altrimenti il primo messaggio è
«leggi AGENTS.md e seguilo».

**Hai già delle note?** Un vault di Obsidian, una cartella di appunti, un'esportazione da un'altra app: non copiare il
modello dentro il vecchio archivio. Il cervello nasce nella sua cartella nuova; il vecchio archivio resta dov'è, anche
se è in una cartella sincronizzata, perché viene solo letto. Prima il prompt A, poi il prompt C di
`PROMPT-DI-AVVIO.md`, che lo porta dentro un gruppo di file alla volta.

Poi incolla il prompt A di `PROMPT-DI-AVVIO.md`. L'obiettivo della prima sessione è compilare i segnaposto che contano
di più. L'agente te li chiede a voce, non devi aprire i file:

| Cosa | Dove finisce | Perché subito |
|---|---|---|
| Chi sei, che lavoro fai, per chi e con chi lavori | sezione «Chi» di `AGENTS.md` | è la prima cosa che ogni AI legge |
| Di chi è il cervello, cosa ci entra, quali contesti restano fuori | sezione «Regola d'ambito» di `wiki/concepts/ambito.md` | apre il nucleo: ogni sessione sa per chi lavora |
| Lingua e tono | `wiki/concepts/come-scrivere-per-me.md` | vale per ogni risposta e ogni testo |
| Il tuo nome | `marketplace.proprietario` e `persona` in `bin/impostazioni.json` | il primo dà il nome al catalogo dei plugin; il secondo lo usa l'esportazione solo se manca la sezione «Chi» |
| Perché nasce il cervello, con la data di oggi | prima voce di `wiki/log.md` e prima voce di `wiki/hot.md`, dove la data del kit diventa quella di oggi | chiude la nascita; con la data del kit il controllo m darebbe giallo dopo una settimana |
| Altri lavori delicati e le pagine da aprire prima | «Seconda azione» di `AGENTS.md` | se ne hai |

Alla fine l'agente lancia `node bin/costruisci.mjs` (rigenera il nucleo con i tuoi dati) e `node bin/controlla.mjs`.
Il controllo giallo n conta i segnaposto rimasti: alcuni restano fino al livello 3 (plugin, mappa del cervello, id dei
sistemi esterni, casella cloud del Custode) ed è normale.

### 3.5 La prima prova

Apri una sessione nuova e prova queste sei cose. Se una non va, la tabella «Se qualcosa non va» del capitolo 15 dice
cosa guardare.

| Prova | Cosa dici | Cosa deve succedere |
|---|---|---|
| Avvio | «cosa c'è in corso?» | risponde da `wiki/hot.md` senza che tu gli dica di leggerlo |
| Chi sei | «per chi lavoro?» | risponde da `AGENTS.md` e dalla regola d'ambito |
| Ingestione | metti un breve testo in `.raw/` (un appunto, una mail salvata) e di' `/ingerisci` (con altri agenti: «ingerisci i file in .raw») | nasce una pagina in `wiki/sources/`, le pagine dei soggetti citati, una voce in hot, una nel log, le righe nell'index |
| Regola nuova | «d'ora in poi le date nei testi si scrivono per esteso» (o `/nuova-regola ...`) | nasce una pagina regola, il nucleo si rigenera, l'index ha la riga |
| Chiusura | «chiudi» o `/chiudi` | voce in cima a hot, voce in fondo al log, la domanda sugli errori da trasformare in pagina |
| Controllo | `node bin/controlla.mjs` | zero rossi |

In Claude Code puoi anche chiedere «cosa ti ha detto il controllo d'avvio?»: l'hook `avvio` mette nel contesto la
data di hot, lo stato del nucleo, i rossi dei controlli lanciati in quel momento, le note da integrare.

Da qui in poi, se non hai ancora il Custode (livello 3), una volta a settimana fai la manutenzione con il prompt D di
`PROMPT-DI-AVVIO.md`: archivia le voci vecchie di hot, integra le note e fa entrare le fonti di `.raw/`.

### 3.6 Senza Claude Code

I comandi con la barra (`/chiudi`, `/ingerisci`, `/nuova-regola`, `/allinea-routine`) e gli hook esistono solo in
Claude Code. Con un altro agente si dice la stessa cosa a parole, perché i comandi sono file markdown che qualunque
agente sa leggere:

| In Claude Code | Con un altro agente |
|---|---|
| `/chiudi` | «chiudi la sessione come dice `AGENTS.md`» (la chiusura lancia anche controlli e salvataggio) |
| `/ingerisci` | «ingerisci i file in .raw seguendo `automazioni/ingestione.md`» |
| `/nuova-regola ...` | «nuova regola: ... Segui `.claude/commands/nuova-regola.md`» |
| il verificatore | «rileggi questo lavoro come dice `.claude/agents/verificatore.md`» |
| gli hook | lanciare tu, o chiedere all'agente, `node bin/controlla.mjs` dopo i lavori grossi |

### 3.7 Obsidian come visore

Obsidian non serve per far funzionare il cervello: serve a te per guardarlo.
1. In Obsidian: «Apri cartella come vault» (vault è il nome che Obsidian dà a una cartella di note) e scegli la
   cartella del cervello.
2. Lascia i link nel formato tra doppie quadre, `[[nome-pagina]]`: sono quelli che il cervello usa.
3. Usa il grafo, i collegamenti in entrata e la ricerca per orientarti. Puoi correggere una pagina a mano: vale come
   una modifica dell'agente.
4. Tre impostazioni, una volta: in «File e link» lascia i link a doppie quadre; in «File esclusi» metti `_modelli/`,
   `_da_eliminare/` ed `esporta/`, così ricerca e grafo mostrano solo il cervello; non rinominare da Obsidian file già
   linkati (8.2).

Obsidian non mostra le cartelle che iniziano con il punto: `.raw/` (e quindi `.raw/inbox/`, dove si salvano le note
per il cervello) non si vede. Si apre con Esplora file o con il Finder (Cmd, Maiuscole e punto mostrano le cartelle
nascoste).

Due cautele. I file generati (`wiki/meta/nucleo.md`, `wiki/meta/stato-controlli.md`, i blocchi tra
`<!-- genera: ... -->` e `<!-- fine: ... -->`) non si modificano a mano: si cambia la pagina regola e si rilancia lo
script. E non si installano in Obsidian plugin che sincronizzano la cartella per conto loro: due sincronizzazioni
sulla stessa cartella si pestano i piedi.

### 3.8 Git anche al livello 2

Non è obbligatorio, ma conviene: con Git ogni modifica ha una storia e un errore si annulla. Fai la parte A del passo
Git (capitolo 4.2), senza collegare GitHub. Da lì `node bin/sincronizza.mjs` fa il salvataggio locale e si ferma, e
puoi installarlo ogni 10 minuti come al livello 3. Git da solo sta sullo stesso disco: per una copia altrove vedi il
riquadro «Copia di sicurezza» del 3.2.

Senza Git il controllo l (pagine escluse da `.gitignore`) resta spento, ed è normale. Il controllo i resta giallo
finché i battiti di `sincronizza` e `custode` non partono. Il battito `sincronizza` lo scrive solo la sincronizzazione
pianificata (`node bin/installa-sincronizzazione.mjs --fai`): un giro lanciato a mano o dall'agente non lo scrive, così
non diventa rosso se per qualche giorno non lavori. Se non userai una delle due automazioni, togli la sua riga dalla
tabella «Battiti» di `automazioni/LEGGIMI.md` e il giallo sparisce.

## 4. Livello 3: il sistema completo

Il livello 3 parte da un livello 2 che funziona. Si accende un pezzo alla volta, nell'ordine di questo capitolo, e
ogni pezzo si prova prima di passare al successivo.

| Pezzo | A cosa serve | Sezione |
|---|---|---|
| Repository privato su GitHub | la fonte di verità, con la storia di ogni modifica, raggiungibile da ovunque | 4.1, 4.2 |
| Sincronizzazione automatica | salva e allinea la cartella ogni 10 minuti, senza finestre | 4.3 |
| Hook di Claude Code | controlli all'avvio, a ogni messaggio, dopo ogni modifica, prima di ogni comando | 4.4 |
| Controllo quotidiano su GitHub | controlla il cervello ogni giorno e ti avvisa per mail o su Telegram | 4.5 |
| Custode nel cloud | la sera integra le note, archivia hot, unisce i conflitti | 4.6 |
| Plugin per le chat di Claude | rende disponibili le regole nelle chat del web e del telefono (i fatti no) | 4.7 |
| Altro computer, altro account | lavorare da più posti senza doppioni | 4.8, 4.9 |
| Cartella privata delle chiavi | dove stanno i token (codici d'accesso dei servizi), fuori dal cervello | 4.10 |

### 4.1 Account GitHub e repository privato

1. Crea un account su https://github.com, se non ce l'hai, e attiva l'accesso in due passaggi (codice dal telefono
   oltre alla password). Salva i codici di recupero fuori dal computer: senza, un telefono perso chiude fuori anche te.
2. Crea un repository nuovo (il pulsante «New»): un nome corto, per esempio `cervello`, e la visibilità **Private**.
3. **Lascialo vuoto**: niente README, niente `.gitignore`, niente licenza. Il primo caricamento lo fa la
   sincronizzazione, e trova il repository pronto solo se è vuoto. Se GitHub ha già creato dei file, il primo giro
   può finire in conflitto: la via più semplice è cancellare il repository appena nato e ricrearlo vuoto.
4. Annota l'indirizzo, nella forma `https://github.com/<utente>/<nome>.git`.

Il repository resta privato per sempre. Il cervello contiene il tuo lavoro: anche senza segreti, non è roba da
pubblicare.

### 4.2 Il passo Git

**Parte A, sul computer (vale anche al livello 2).** Da un terminale aperto nella cartella del cervello:
```
git init -b main
git config user.name "Il tuo nome"
git config user.email "il-tuo-indirizzo"
node bin/controlla.mjs
node bin/sincronizza.mjs
```
- `git init -b main` trasforma la cartella in un repository con il ramo (branch, la linea principale della storia)
  `main`, quello che la sincronizzazione si aspetta. Se il tuo Git non accetta `-b` (versioni vecchie): `git init`,
  poi dopo il primo salvataggio `git branch -M main`, che rinomina il ramo.
- Nome e indirizzo firmano ogni salvataggio. Se non vuoi che il tuo indirizzo compaia nella storia, GitHub ne dà uno
  privato nelle impostazioni delle email.
- `node bin/controlla.mjs` prima del primo salvataggio: il controllo e deve essere verde (nessun segreto nei file).
- `node bin/sincronizza.mjs` senza GitHub fa il primo salvataggio (commit, cioè una fotografia dei file con data e
  autore) e si ferma: il registro dice «nessun remoto configurato: solo salvataggio locale».

**Parte B, il collegamento con GitHub.**
1. Installa GitHub CLI (il programma da riga di comando di GitHub) da https://cli.github.com.
2. `gh auth login`: scegli GitHub.com, HTTPS e l'accesso dal browser. Poi `gh auth setup-git`: da qui Git usa questo
   accesso e non chiede più la password. È indispensabile, perché la sincronizzazione gira nascosta e non può fare
   domande.
3. Collega la cartella al repository:
   ```
   git remote add origin https://github.com/<utente>/<nome>.git
   node bin/sincronizza.mjs --prova
   node bin/sincronizza.mjs
   node bin/sincronizza.mjs --stato
   ```
4. `--prova` fa tutti i controlli senza salvare e senza rete, e deve dire che il ramo `main` si caricherebbe. Il giro
   vero fa il primo caricamento («primo caricamento del ramo main sul remoto»). `--stato` mostra la cartella di stato,
   il ramo, se il computer è principale e le ultime righe del registro.
5. Apri il repository su GitHub: devono esserci i file del cervello, e la scritta «Private».

Se il giro si ferma, il registro scrive «FERMO» e il motivo:

| Il registro dice | Cosa fare |
|---|---|
| la cartella non è un repository Git | parte A: `git init -b main` |
| la cartella non è la radice del repository trovato | il cervello sta dentro un'altra cartella Git: spostalo fuori, oppure rifai `git init -b main` nella sua cartella |
| il cervello è sul ramo ... | il comando tra parentesi: `git switch main`, oppure `git branch -m main` se il ramo `main` non c'è ancora (il repository è nato con un altro nome, per esempio `master`) |
| un rebase o un merge in sospeso | un'operazione di Git è rimasta a metà: chiedi all'agente di guardare `git status` e sistemarla |
| file con un conflitto non risolto | un file tenuto fuori dal salvataggio (per esempio per un possibile segreto) è stato cambiato anche altrove: aprilo, scegli il testo giusto togliendo i segni `<<<<<<<`, `=======` e `>>>>>>>`, poi `git add <file>`; se `git stash list` mostra «autostash», dopo `git stash drop`. Può farlo l'agente |
| il remoto rifiuta il caricamento perché un file è troppo grande | `git reset --soft origin/main` (rimette le modifiche da salvare, senza perderle), sposta il file fuori dal cervello o mettilo in `.gitignore`, poi lascia ripartire la sincronizzazione |
| commit non riuscito | di solito mancano nome e indirizzo: `git config user.name` e `git config user.email` |
| primo caricamento non riuscito | l'accesso: `gh auth status`, poi `gh auth setup-git`; oppure il repository non è vuoto (4.1) |

### 4.3 La sincronizzazione automatica

```
node bin/installa-sincronizzazione.mjs
node bin/installa-sincronizzazione.mjs --fai
```
Il primo comando mostra cosa farebbe e non cambia niente; il secondo lo fa. Non servono diritti di amministratore.
- **Windows**: un'attività pianificata «Secondo cervello - sincronizza <nome della cartella>» ogni 10 minuti, lanciata
  attraverso `conhost.exe --headless` perché non si apra nessuna finestra, con il permesso di girare anche a batteria.
- **macOS**: un agente di sistema in `~/Library/LaunchAgents/`, che parte all'accesso e poi ogni 10 minuti.
- **Linux**: una riga nella pianificazione dell'utente (crontab).

Dopo una ventina di minuti, `node bin/sincronizza.mjs --stato` deve mostrare giri recenti. Da lì non devi più
salvare a mano: una modifica dell'agente, tua o di una routine arriva su GitHub e torna sugli altri computer.

Cosa fa a ogni giro, in breve: salva le modifiche, tiene fuori dal salvataggio i file che sembrano contenere segreti e
quelli oltre 50 MB (e lo scrive nel registro), scarica le novità, rimette sopra le tue e carica. Una volta al giorno,
nei giri pianificati, scrive il battito `automazioni/battiti/sincronizza.txt`: se smette di girare, il controllo se ne
accorge. Lanciata a mano (o dall'agente a fine sessione) scrive l'esito sullo schermo e non tocca il battito.

Quando due modifiche si scontrano, non decide da solo: parcheggia le tue su un ramo `conflitto/<computer>-<data>`, lo
carica su GitHub e aspetta che qualcuno lo unisca. Lo fa il Custode la sera, oppure lo chiedi all'agente: «unisci il
ramo di conflitto come dice `automazioni/custode.md`, compito 3». Appena il ramo è unito, la sincronizzazione riparte
da sola.

Altre situazioni:
- **Lavori lunghi sui file** (spostamenti, riordini): `node bin/sincronizza.mjs --pausa` prima,
  `node bin/sincronizza.mjs --riprendi` dopo. Una pausa dimenticata scade da sola dopo 3 ore.
- **Hai spostato la cartella o cambiato versione di Node:** rilancia `node bin/installa-sincronizzazione.mjs --fai`
  dalla cartella nuova.
- **Vuoi toglierla:** `node bin/installa-sincronizzazione.mjs --togli`.

**A computer spento.**
- Si fermano: la sincronizzazione e il suo battito, gli hook, le attività pianificate sul computer, e le note che hai
  salvato in `.raw/inbox/` sul computer, che arrivano al Custode solo dopo il primo giro al rientro.
- Continuano: il controllo su GitHub, le routine nel cloud, le chat con il plugin o con il progetto.
- Il battito ha una cadenza «ogni 3 giorni», così un fine settimana spento non fa scattare l'allarme. Dopo più di 4
  giorni (una settimana di ferie) diventa rosso e l'avviso torna a ogni giro quotidiano del controllo: è normale, e
  sparisce al primo giro dopo il rientro.

### 4.4 Gli hook di Claude Code

Gli hook sono già dichiarati in `.claude/settings.json` e i loro script stanno in `bin/hooks/`. Servono Node e una
cartella accettata come attendibile; una modifica alle impostazioni di solito vale subito (se un hook non parte, apri
`/hooks` o riavvia la sessione).

| Hook | Quando parte | Cosa fa |
|---|---|---|
| `avvio` | all'apertura e alla ripresa della sessione | mette nel contesto la data di hot, se il nucleo è aggiornato, i rossi dei controlli (lanciati in quel momento; se non finiscono in 4 secondi, quelli dell'ultimo rapporto con la sua data), i rami di conflitto, la sincronizzazione in pausa o ferma, le note da integrare, un lavoro da riprendere |
| `instrada` | a ogni tuo messaggio | se il messaggio contiene le parole di una riga della tabella «Richiesta → strumento», ricorda all'agente lo strumento giusto |
| `dopo-modifica` | dopo ogni modifica di un file | caratteri vietati con il numero di riga, segreti, promemoria di rigenerare il nucleo |
| `proteggi` | prima di ogni comando del terminale e di ogni lettura | nega i comandi e le letture che mostrerebbero una chiave o una password, e dice cosa usare al posto |

Non bloccano mai il lavoro, tranne `proteggi` sui comandi pericolosi, e un hook rotto tace invece di fermare la
sessione. Per provarli a mano ci sono i comandi dell'appendice B.

Per spegnerli: la variabile d'ambiente `CERVELLO_HOOK=spenti` (valgono anche `0`, `no`, `off`); oppure, solo su un
sistema operativo, `hook.spentiSu` in `bin/impostazioni.json` con `win32` (Windows), `darwin` (macOS) o `linux`. Il
secondo serve per esempio se le routine nel cloud, che girano su Linux e ricevono lo stesso `.claude/settings.json`
dal repository, non devono lanciarli. Per vedere gli errori invece del silenzio: `CERVELLO_HOOK_DEBUG=1`.

Il lavoro lungo da riprendere: se una sessione si chiude a metà di un lavoro importante, scrivi (o fai scrivere
all'agente) un file `da-riprendere.md` nella cartella di stato della sincronizzazione (`~/.cervello-sync/<nome della
cartella>/`). L'hook `avvio` lo mostra in cima alla sessione successiva, finché il lavoro non è chiuso e il file tolto.

### 4.5 Il controllo quotidiano su GitHub

Il file `.github/workflows/controllo.yml` è già nel repository: è un flusso di GitHub Actions (il servizio di GitHub
che lancia comandi da solo). Parte a ogni salvataggio che tocca i file che contano, ogni giorno alle 6:00 del tempo
universale (in Italia le 7 d'inverno e le 8 d'estate) e a mano, dalla scheda «Actions» del repository, «Controllo del
cervello», «Run workflow».

A ogni giro lancia `node bin/controlla.mjs`, manda gli avvisi e salva `wiki/meta/stato-controlli.md` se è cambiato.
Nel giro quotidiano e in quello lanciato a mano, se ci sono rossi, fallisce l'ultimo passo; nei giri nati da un
salvataggio no, perché la sincronizzazione carica ogni pochi minuti e un rosso che resta manderebbe decine di mail.
Con il repository online la pagina di stato la scrive solo questo flusso: sul computer `node bin/controlla.mjs
--scrivi` non la scrive (lo dice), così le due versioni non vanno in conflitto.

**La mail.** Quando un flusso fallisce, GitHub manda una mail al proprietario del repository. Controlla nelle
impostazioni delle notifiche del tuo account GitHub, alla voce Actions, che le mail dei flussi falliti siano attive.

**Telegram, facoltativo ma consigliato.**
1. Su Telegram apri BotFather (il bot ufficiale che crea i bot), scrivi `/newbot` e segui le domande: alla fine ti dà
   il token del bot (la sua chiave).
2. Salva il token nella cartella privata delle chiavi (4.10), nel file `telegram-token.txt`. Scrivi un messaggio
   qualunque al tuo bot, poi dalla cartella del cervello lancia `node bin/avvisa.mjs --trova-chat`: stampa il numero
   della chat, che salvi in `telegram-chat.txt`. Non aprire l'indirizzo delle API di Telegram nel browser con il token
   dentro: resterebbe nella cronologia, e con la cronologia sincronizzata anche nell'account del browser.
3. Nel repository su GitHub: «Settings», «Secrets and variables», «Actions», «New repository secret». Crea
   `TELEGRAM_BOT_TOKEN` con il token e `TELEGRAM_CHAT_ID` con il numero. I segreti del repository (secrets) non si
   vedono più dopo il salvataggio e non finiscono nei file.
4. Lancia il flusso a mano («Run workflow»): lanciato a mano manda sempre la riga di riepilogo, anche se è tutto verde.

Dal computer: `node bin/avvisa.mjs --verifica` e `node bin/avvisa.mjs "prova"`.

**Cosa arriva.** Subito, i segreti trovati nei file. Dal giro quotidiano (non a ogni salvataggio) i battiti fermi: una
routine o la sincronizzazione che non gira più. Il lunedì, dal giro del mattino, e ogni volta che lanci il flusso a
mano, una riga di riepilogo **anche se è tutto verde**. È il segnale che il canale funziona: se il lunedì non arriva
niente, è rotto il controllo oppure mancano i segreti.

Due note. Il piano gratuito di GitHub ha un tetto di minuti al mese per i repository privati: il flusso parte quando
cambiano `wiki/`, `automazioni/`, `bin/`, `AGENTS.md`, `CLAUDE.md` o `.claude/`, più il giro giornaliero; un giro dura
meno di un minuto. E se il passo che salva lo stato fallisce con un errore di permesso, nelle impostazioni del
repository («Settings», «Actions», «General», «Workflow permissions») scegli il permesso di lettura e scrittura.

### 4.6 Il Custode nel cloud

Il Custode è una routine (un lavoro che un'AI fa da sola a orari fissi) che gira ogni sera alle 21:30 sul repository.
La procedura è `automazioni/custode.md`, il testo del prompt è in `automazioni/routine/routine-custode.md`. I suoi
compiti:
1. integra le note per il cervello di `.raw/inbox/` (e della casella cloud, se ne hai una) e le sposta in
   `.raw/inbox/integrate/AAAA-MM/`; le note con una decisione da prendere o con segreti non le integra, le segnala;
2. sposta le voci di hot più vecchie di 14 giorni nell'archivio del mese, parola per parola;
3. unisce i rami di conflitto della sincronizzazione, tenendo tutte e due le versioni quando sono voci indipendenti;
4. rigenera i file generati rimasti indietro;
5. la domenica segnala le fonti da far entrare (gli originali di `.raw/` restano sul computer e non sono su GitHub:
   si ingeriscono lì, con `/ingerisci` o con il prompt D);
6. chiude con un resoconto di al massimo 10 righe, una voce di log, il battito e il salvataggio.

Serve una piattaforma con routine nel cloud che lavorano su un repository Git (per Claude, le routine di Claude Code;
per le altre, le schede di `piattaforme/`). Come si accende:
1. Compila i segnaposto: il tuo nome e l'account che ospiterà la routine (campo `account`) in
   `automazioni/routine/routine-custode.md`; in `automazioni/custode.md` la casella cloud delle note (sotto), oppure
   «nessuna».
2. Crea la routine su **un account solo**, con il repository collegato e senza chiavi. In Claude Code, se la sessione
   ha lo strumento delle routine, lo fa `/allinea-routine` dopo il tuo sì; altrimenti la crei tu dalla pagina delle
   routine della piattaforma, incollando il testo esatto del blocco «Prompt». Orario: 21:30 dell'ora locale. La riga
   `cron` del file (l'orario ricorrente scritto in modo che il computer lo capisca) porta il fuso orario: se non vivi
   in Italia, cambialo lì e sulla piattaforma.
3. Scrivi l'id della routine nel suo file e in `wiki/meta/id-sistemi-esterni.md`, metti `stato: accesa` nel file,
   aggiorna la colonna «Stato» in `automazioni/LEGGIMI.md` e la riga in `wiki/meta/mappa-del-cervello.md`.
4. Il Custode parte in `MODALITA: rapporto`: scrive cosa farebbe senza toccare le pagine (fa solo la voce di log, il
   battito e il salvataggio). Leggi i suoi resoconti per
   qualche sera. Quando le proposte sono giuste, cambia la riga in `MODALITA: azione` nel file della routine e allinea
   con `/allinea-routine`.

Il battito `custode` resta giallo «non ancora partito» finché la routine non gira; poi, se manca da più di due giorni,
diventa rosso e arriva l'avviso. Con il battito rosso guarda prima il collegamento con GitHub dell'account: su alcune
piattaforme, se scade, la routine salta i giri e dopo qualche giorno si spegne da sola, e va riaccesa a mano.

**La casella per le note dal telefono.** `.raw/inbox/` sta sul computer e dal telefono non si raggiunge. Perché le
note nate in una chat dal telefono arrivino al cervello:
1. crea una cartella nel tuo archivio cloud, fuori dal cervello (per esempio `cervello-inbox`): dal telefono salvi lì
   le note;
2. collega alla routine Custode il connettore di quell'archivio e controlla a quale account è agganciato; scrivi
   l'account atteso in `wiki/meta/id-sistemi-esterni.md`;
3. scrivi la cartella nel segnaposto di `automazioni/custode.md` (compito 1) e la sua riga in
   `wiki/meta/mappa-del-cervello.md`;
4. nella casella le note si creano soltanto, non si modificano: il connettore di un archivio cloud spesso crea un
   doppione invece di modificare.
Al livello 2 la stessa casella la svuota il prompt D, a mano.

### 4.7 Il plugin per le chat di Claude

Le chat sul web e sul telefono non vedono la cartella. Il plugin «cervello» (un pacchetto di istruzioni che l'account
installa e tiene aggiornato) rende disponibile in ogni chat la skill `cervello`, con cosa leggere all'avvio, il nucleo
delle regole e la tabella «Richiesta → strumento». Una skill però non si legge in ogni conversazione: la chat la apre
quando la richiesta riguarda il tuo lavoro, o quando la chiami (`/cervello`). Le sue fonti stanno in
`automazioni/plugin-cervello/`, e il catalogo dei plugin del cervello (il marketplace) in
`.claude-plugin/marketplace.json`.

1. Compila i segnaposto: `author` in `automazioni/plugin-cervello/.claude-plugin/plugin.json`, il tuo nome e i
   contesti esclusi nella `description` di `automazioni/plugin-cervello/skills/cervello/SKILL.md` e il nome nel suo
   testo, `marketplace.proprietario` in `bin/impostazioni.json`, l'indirizzo `proprietario/repository` in
   `automazioni/plugin-cervello/README.md`. Poi `node bin/costruisci.mjs` e un giro di sincronizzazione.
2. Collega GitHub all'account di Claude e, quando la finestra lo chiede, installa l'app GitHub di Claude sul
   repository del cervello (è privato). In Impostazioni, «Capabilities», attiva «Code execution and file creation»:
   senza, le skill non funzionano.
3. Su claude.ai: «Personalizza» (Customize), «Plugin», «Add», «Add marketplace», con l'indirizzo
   `<utente>/<nome del repository>` e la sincronizzazione automatica. I nomi dei menu possono cambiare: la scheda
   `piattaforme/claude.md` porta quelli verificati e la data.
4. Installa il plugin «cervello» dall'elenco. Se nell'account c'era una skill con lo stesso nome caricata a mano,
   spegnila prima: due skill con lo stesso nome si confondono.
5. Nelle istruzioni personali dell'account (Impostazioni, «Your Claude», «Instructions for Claude») una riga sola:
   «Per ogni lavoro di <il tuo nome> usa per prima la skill cervello». Le regole non si copiano lì.

La versione non si tocca: quando il contenuto del plugin cambia, `node bin/costruisci.mjs` alza l'ultima cifra (da
0.1.0 a 0.1.1) e riscrive il marketplace; dopo il salvataggio l'account si aggiorna da solo. Prova: in una chat nuova
dal telefono chiedi «apri il cervello: per chi lavoro?». Deve dire che lavora con il nucleo della skill, in sola
lettura, e alla fine preparare una nota per il cervello se nasce un fatto da ricordare.

Il plugin porta le regole, non i fatti: hot, index e pagine non ci sono, e dal telefono «cosa c'è in corso?» resta
senza risposta. Per i fatti serve anche il progetto del livello 1 con il pacchetto di `--esporta`, da ricaricare
quando cambia hot.

Per gli agenti che leggono le skill dalla cartella `.agents/skills/`, si copia lì la cartella
`automazioni/plugin-cervello/skills/cervello`.

### 4.8 Un altro computer

1. Installa gli stessi programmi (3.1 e GitHub CLI), poi `gh auth login` e `gh auth setup-git`.
2. Nella cartella utente: `git clone https://github.com/<utente>/<nome>.git Cervello`, entra nella cartella e imposta
   `git config user.name` e `git config user.email`.
3. `node bin/sincronizza.mjs --secondario`: segna questo computer come secondario (crea il file `secondario` nella
   cartella di stato). Poi `node bin/sincronizza.mjs --stato` deve dire «secondario (niente battito)».
4. Se il cervello ha già note o pagine fatte su questo computer prima del clone, non copiarle sopra: falle entrare con
   l'agente, una alla volta.
5. `node bin/installa-sincronizzazione.mjs --fai`.
6. Le chiavi che servono su questo computer le metti a mano nella sua cartella privata (4.10), mai attraverso una
   cartella sincronizzata o una chat.
7. In Claude Code accetta la cartella come attendibile.

Un solo computer è il principale, ed è l'unico che scrive il battito: due computer che scrivono lo stesso file ogni
mattina litigano. Se il principale cambia: `node bin/sincronizza.mjs --principale` sul nuovo, `--secondario` sul
vecchio.

### 4.9 Un altro account

Se usi la stessa AI con un secondo account (per esempio uno personale e uno di lavoro):
- collega GitHub e aggiungi il marketplace del cervello, poi installa il plugin (4.7);
- autorizza i connettori (i collegamenti dell'AI con posta, archivi, gestionali) uno per uno, e per ciascuno controlla
  a quale account è collegato: gli account attesi stanno in `wiki/meta/id-sistemi-esterni.md`;
- **non ricreare le routine**: girerebbero due volte, con due Custodi che scrivono le stesse cose. `/allinea-routine`
  si lancia solo dall'account che ospita le routine (il campo `account` del file della routine): se un id non si
  trova, quasi sempre sei sull'account sbagliato;
- Claude Code non dipende dall'account: le regole arrivano dalla cartella;
- aggiorna `wiki/meta/mappa-del-cervello.md`.

**Account o computer condiviso** con un'altra persona o con un altro lavoro. Meglio un account per persona. Se non si
può:
- compila con cura il terzo segnaposto della «Regola d'ambito» (i contesti che non si mescolano) e il «non vale per»
  della descrizione della skill;
- il plugin installato nell'account parte in tutte le chat, anche in quelle dell'altra persona; memoria e connettori
  dell'account sono in comune: controlla che la memoria non contenga fatti dell'altro contesto;
- non preparare `~/.claude/CLAUDE.md` (4.11) su un utente del computer usato da altri: vale in ogni sua sessione;
- scrivi il caso in `wiki/meta/mappa-del-cervello.md`.

### 4.10 La cartella privata delle chiavi

Le chiavi (token dei bot, codici di accesso ai servizi) non stanno mai nel cervello. Stanno in una cartella privata,
fuori dal cervello, mai su Git e mai dentro una cartella sincronizzata: nel modello `~/Cervello-Privato/chiavi` (su
Windows `C:\Users\<te>\Cervello-Privato\chiavi`). Per usarne un'altra si cambia `chiavi.cartella` in
`bin/impostazioni.json`, oppure si imposta la variabile d'ambiente `CERVELLO_CHIAVI_DIR`.

- Un file per chiave, con il nome scritto in `bin/impostazioni.json` alla voce `chiavi.elenco` (nel modello
  `telegram-token.txt` e `telegram-chat.txt`), con dentro solo il valore.
- Il file lo scrivi tu, con un editor di testo. Una chiave non si incolla mai in una chat con l'AI.
- `node bin/lib/chiavi.mjs --verifica` dice per ogni chiave se la trova in una variabile, in un file o se manca, e
  non mostra mai il valore. Senza nomi è solo informativo ed esce sempre con 0; per un controllo vero si passa il nome:
  `node bin/lib/chiavi.mjs --verifica telegram-token` esce con 1 se la chiave manca.
- Una chiave nuova: una riga in `chiavi.elenco` (nome, variabili d'ambiente, file), il file, la verifica.
- Su GitHub le chiavi stanno nei segreti del repository; le routine nel cloud, di norma, non ne hanno: uno strumento
  che ne ha bisogno gira sul computer.
- La copia di riferimento di ogni chiave sta nel tuo gestore di password, se ne usi uno.

### 4.11 Le sessioni aperte fuori dalla cartella

Facoltativo. Claude Code legge anche un file di istruzioni personale, `~/.claude/CLAUDE.md`, in ogni cartella. Se ci
scrivi il paragrafo della regola d'ambito e una riga che importa il nucleo per percorso
(`@` seguito dal percorso completo di `wiki/meta/nucleo.md`), anche le sessioni aperte in altre cartelle sanno di chi è
il lavoro e quali regole valgono. Alcune superfici saltano gli import che puntano fuori dalla cartella di lavoro: la
scheda `piattaforme/claude.md` dice quali. Registra il file in `wiki/meta/mappa-del-cervello.md`.

La lingua scritta nella regola di scrittura mettila anche in `~/.claude/settings.json`, alla voce `"language"` (per
esempio `"language": "italiano"`): anche i messaggi di Claude Code restano nella tua lingua.

## 5. Livello 1: solo chat

Al livello 1 l'AI non vede la cartella: riceve una copia del cervello come istruzioni e file caricati in un progetto
(o in un assistente personalizzato). Legge, risponde con il tuo contesto e, quando nasce un fatto da ricordare,
prepara una nota che salvi tu.

### 5.1 Cosa ti serve

- Un'AI che permette di creare progetti con istruzioni e file di conoscenza. Le schede di `piattaforme/` dicono dove,
  con quali limiti di file e di caratteri per piano, e quali contenitori stanno per chiudere.
- La cartella del cervello sul computer (3.2 e 3.3: le stesse regole su dove metterla) e Node per preparare il
  pacchetto. Senza Node c'è il ripiego del 5.6.

### 5.2 Prepara il pacchetto

1. Compila almeno: la sezione «Chi» di `AGENTS.md` e, se hai lavori delicati, la sua «Seconda azione»; la «Regola
   d'ambito» di `wiki/concepts/ambito.md`; lingua e tono in `wiki/concepts/come-scrivere-per-me.md` (anche la riga
   della lingua nell'«In breve»); la voce di nascita di `wiki/hot.md` e di `wiki/log.md`, con la data di oggi. Con un
   editor di testo o con Obsidian; oppure fatti intervistare da una chat con il prompt B di `PROMPT-DI-AVVIO.md`, che
   ti prepara il testo da incollare.
2. Da un terminale nella cartella: `node bin/costruisci.mjs --esporta`. Lo script rigenera il nucleo e scrive la
   cartella `esporta/`, poi elenca i file con la misura e avvisa se nelle istruzioni o nei file restano segnaposto da
   compilare.

| File | Cosa contiene | Dove va |
|---|---|---|
| `istruzioni-chat.md` | chi sei, i lavori delicati, come usare i file, la nota per il cervello per intero, il nucleo delle regole | nel campo delle istruzioni del progetto |
| `istruzioni-brevi.md` | chi sei, la regola d'ambito, come scrivere, la nota per il cervello in breve (sotto i 5.000 caratteri) | nelle istruzioni personali, che valgono in tutte le chat anche fuori dal progetto |
| `conoscenza-01-inizio.md` | hot, index, nucleo, registro degli strumenti, modello della nota | file caricato, il primo che l'AI legge |
| `conoscenza-02-regole.md` | tutte le regole in vigore, intere | file caricato |
| `conoscenza-03-...` e seguenti | uno per ogni sottocartella di `wiki/` che ha pagine (`entities`, `sources`, `meta`, i concetti che non sono regole), più uno per le pagine in cima a `wiki/`, come il log | file caricati |

Se `istruzioni-chat.md` supera gli 8.000 caratteri (il limite di `limiti.istruzioniChat` in `bin/impostazioni.json`,
pensato per le piattaforme più strette) lo script lo dice con la misura e le sezioni più lunghe. Il modello vuoto ne ha
circa 7.200: la tabella «Richiesta → strumento» resta fuori, perché i suoi comandi in chat non girano (sta nel primo
file di conoscenza). Ogni regola nel nucleo aggiunge qualche centinaio di caratteri: se la tua piattaforma accetta
istruzioni più lunghe (lo dice la scheda) puoi alzare il limite; altrimenti accorcia «Chi», gli «In breve» più lunghi,
oppure passa a `nucleo: no` le regole che servono di rado. Il numero massimo di file (20) e la misura di ciascuno
(300 KB) stanno nella stessa voce `limiti` e si adattano alla tua piattaforma. Per le piattaforme che non accettano i
`.md` come conoscenza: `node bin/costruisci.mjs --esporta --txt`.

Restano fuori dal pacchetto le pagine con `riservato: true` o `esporta: no` (le pagine degli script, che servono solo
sul computer), le trappole dell'ambiente del registro degli strumenti, lo stato dei controlli e gli archivi di hot. La
cartella `esporta/` non va su Git e si ricrea a ogni esportazione.

### 5.3 Carica nella chat

1. Crea un progetto nuovo nella tua AI.
2. Copia tutto il testo di `istruzioni-chat.md` nel campo delle istruzioni del progetto.
3. Carica i file `conoscenza-*.md` come file del progetto.
4. Prova in una chat del progetto: «cosa c'è in corso?», «quali regole valgono quando scrivi per me?». Deve
   rispondere dai file e dire che lavora su una copia di sola lettura, con la sua data.

Le regole stanno nelle istruzioni, non solo nei file: alcune piattaforme filtrano i file di conoscenza che sembrano
istruzioni, e una regola che sta solo lì può essere ignorata.

### 5.4 La nota per il cervello

La chat non può modificare il cervello. Quando nasce un fatto da ricordare (una decisione, un accordo, un numero, una
persona o un'azienda nuova, una scadenza, una correzione al modo in cui scrivi), alla fine della risposta in cui nasce
scrive una NOTA PER IL CERVELLO nel formato di `_modelli/nota-inbox.md`: fuori dal blocco il nome del file, nel blocco
data, da quale AI viene, cosa è successo, dove va nel cervello, cosa è da verificare. Nelle chat che non hanno il
pacchetto (fuori dal progetto, un'altra AI) incolla all'inizio il prompt E1 di `PROMPT-DI-AVVIO.md`, o alla fine
l'E2.

Tu la salvi come file `AAAA-MM-GG-<tema>.md` (per esempio `2026-11-03-preventivo-nuovo-cliente.md`) nella cartella
`.raw/inbox/` del cervello. Poi:
- al livello 1 la integri tu: apri la nota e la pagina giusta, copi il fatto, sposti la nota in
  `.raw/inbox/integrate/AAAA-MM/`. La cartella `.raw/` in Obsidian non si vede (inizia con il punto): la nota
  aprila con Esplora file o con il Finder, la pagina con Obsidian;
- quando passi al livello 2, l'agente le integra tutte: «integra le note di .raw/inbox come dice
  `automazioni/custode.md`, compito 1»;
- al livello 3 lo fa il Custode ogni sera.

Niente segreti né dati personali di terzi nelle note: al massimo dove stanno.

### 5.5 Quando ricaricare

Ogni file esportato comincia con «Esportato il AAAA-MM-GG HH:MM dal commit ...» (o «senza Git») e il nucleo porta la
sua data di generazione. Rifai `node bin/costruisci.mjs --esporta` e ricarica **tutti** i file quando:
- cambia una regola (la data del nucleo cambia);
- hai integrato note o aggiunto pagine importanti;
- comunque ogni due settimane, perché hot invecchia.

A ogni esportazione sostituisci anche le istruzioni del progetto, non solo i file: l'elenco dei file sta nelle
istruzioni, e i nomi cambiano quando una cartella di `wiki/` riceve la sua prima pagina. Prima di caricare i file nuovi
togli dal progetto quelli vecchi: due versioni dello stesso file confondono l'AI.

### 5.6 Senza Node

Per provare senza installare niente, usa il prompt B di `PROMPT-DI-AVVIO.md` e, al passo 3, il ramo «se Node non
c'è»: la chat stessa ti prepara le istruzioni (sotto gli 8.000 caratteri, con chi sei, i lavori delicati, le «In
breve» delle regole e la nota per il cervello scritta per intero) e un file `conoscenza-01-inizio.md` con hot, index,
il modello della nota e le pagine nuove.

Non copiare `AGENTS.md` intero nelle istruzioni: senza Node il suo blocco del nucleo non si rigenera (restano i
segnaposto e mancano le regole nuove), supera gli 8.000 caratteri e rimanda a un `conoscenza-01-inizio.md` che non
c'è. È un ripiego: i file non hanno la data in testa, le pagine riservate non restano fuori da sole e la scelta dei file
è a mano. Appena puoi, installa Node e passa all'esportazione.

## 6. Come si usa ogni giorno

Non serve ricordare comandi: quasi sempre basta dirlo a parole. La colonna di destra dice cosa scrivere o lanciare;
dove c'è un comando con la barra vale solo in Claude Code, e con gli altri agenti si dice la stessa cosa a parole
(3.6).

| Cosa vuoi | Cosa dici o lanci |
|---|---|
| Cominciare a lavorare | niente: l'AI legge hot e index da sola. Al livello 1 apri una chat nel progetto |
| Sapere cosa è in corso | «cosa c'è in corso?» |
| Sapere cosa sai di qualcuno o qualcosa | «cosa sappiamo di <nome>?» |
| Far entrare un documento | mettilo in `.raw/` e di' «ingerisci» (`/ingerisci` o `/ingerisci .raw/<nome del file>`) |
| Ricordare un fatto o una decisione | «segna nel cervello che ...»: va nella pagina giusta, con una voce in hot |
| Dare una regola nuova | «d'ora in poi ...» oppure `/nuova-regola <descrizione>` |
| Correggere il modo di scrivere | «te l'ho già detto: ...»: alla seconda volta nasce una riga No/Sì in `wiki/concepts/come-scrivere-per-me.md` |
| Far rileggere un lavoro prima che esca | «passalo al verificatore» |
| Chiudere la sessione | «chiudi» oppure `/chiudi` |
| Controllare il cervello | `node bin/controlla.mjs` |
| Salvare subito (con Git) | `node bin/sincronizza.mjs`: salva anche senza repository online e scrive com'è andata |
| Fermare la sincronizzazione per un lavoro lungo | `node bin/sincronizza.mjs --pausa`, poi `--riprendi` |
| Vedere come va la sincronizzazione | `node bin/sincronizza.mjs --stato` |
| Lavorare dal telefono | una chat con il progetto (fatti e regole) o con il plugin (solo le regole): se nasce un fatto da ricordare, salvi la nota nella casella cloud (4.6) oppure, dal computer, in `.raw/inbox/` |
| Una nota da una chat che non ha il pacchetto | il prompt E1 all'inizio della chat, o l'E2 alla fine (`PROMPT-DI-AVVIO.md`) |
| La manutenzione, senza il Custode | una volta a settimana il prompt D di `PROMPT-DI-AVVIO.md` |
| Una regola da una correzione che ripeti, con un agente diverso da Claude Code | il prompt F |
| Aggiornare il pacchetto per le chat | `node bin/costruisci.mjs --esporta`, poi ricarichi tutti i file |
| Sapere se una chiave c'è | `node bin/lib/chiavi.mjs --verifica` |
| Provare gli avvisi sul telefono | `node bin/avvisa.mjs "prova"` |
| Allineare le routine dell'account ai loro file | `/allinea-routine` |
| Lasciare un lavoro a metà da riprendere | un file `da-riprendere.md` nella cartella di stato (4.4) |

Le abitudini che contano:
- **Chiudi ogni sessione.** È il momento in cui i fatti entrano nelle pagine. Una sessione non chiusa lascia il
  lavoro solo nella conversazione.
- **Guarda i rossi.** In Claude Code l'hook di avvio lancia i controlli e li mette nel contesto; con gli altri agenti
  la chiusura di sessione lancia `node bin/controlla.mjs`; al livello 3 arrivano anche per mail o sul telefono. Un rosso
  si sistema subito, un giallo quando capita.
- **Una volta a settimana, se non hai il Custode:** il prompt D di `PROMPT-DI-AVVIO.md`. Senza, hot si allunga e le
  note restano in `.raw/inbox/`.
- **Correggi una volta, poi fai scrivere la regola.** Se dici due volte la stessa cosa, chiedi che diventi una
  pagina.
- **Non fare il lavoro dell'AI a mano**, tranne le correzioni piccole: se una pagina è sbagliata, dillo, così la
  correzione passa anche da hot e dal log.
- **Ogni tanto leggi hot.** Se non riconosci il tuo lavoro in quella pagina, qualcosa non sta entrando nel cervello.

## 7. Le regole

### 7.1 Cos'è una regola

Una regola dice cosa si fa o non si fa, sempre, in un certo ambito: «i preventivi si mandano solo dopo il sì sul
listino», «nei testi per i clienti si dà del lei». Non è una regola un fatto (va nella pagina del soggetto), un metodo
di lavoro preso da altri (è un concetto, marcato come suggerimento) o una preferenza di un giorno.

### 7.2 Come si scrive

Una regola è una pagina sola in `wiki/concepts/`, dal modello `_modelli/regola.md`. In Claude Code la scrive
`/nuova-regola`; con altri agenti si chiede a parole. Il frontmatter (le righe tra `---` in cima alla pagina, con i
dati che leggono gli script):

```
---
title: "Le date si scrivono per esteso"
type: regola
ambito: scrittura
nucleo: sì
ordine: 20
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Decisa da me il 3/11/2026, dopo due testi con date ambigue"
---
```

Poi il corpo, in quest'ordine:
1. `# Titolo`;
2. `## In breve`, subito: da una a quattro righe che iniziano con `- `, senza righe vuote in mezzo. Ogni riga si deve
   poter eseguire senza aprire la pagina, perché è l'unica parte che entra nel nucleo;
3. `## La regola`: la regola intera, con un esempio di cosa si fa e uno di cosa non si fa;
4. `## Perché esiste`: il fatto che l'ha fatta nascere. Senza, la regola sembra arbitraria e prima o poi qualcuno la
   toglie;
5. `## Come si applica` (facoltativa): i passi, i casi limite, chi decide nel dubbio;
6. `## Collegamenti`.

Dopo ogni modifica a una pagina regola: `node bin/costruisci.mjs`. Se la pagina è scritta male (manca l'«In breve»,
ha più di quattro righe, c'è un carattere vietato nell'«In breve» o nel titolo, l'«In breve» è ancora quello del
modello, l'ambito non è valido) lo script non scrive niente e dice cosa correggere. Un carattere vietato nel resto della
pagina non lo ferma: lo segna in rosso il controllo c. Per questo, dopo, `node bin/controlla.mjs`.

### 7.3 L'ambito

Il campo `ambito` dice dove vale la regola. Il modello ne ha due, nell'elenco `ambiti` di `bin/impostazioni.json`:
`tutto` («Valgono sempre») e `scrittura` («Testi che leggerà qualcun altro»). Se ti serve un ambito più stretto (un
cliente, uno strumento, un tipo di lavoro), aggiungilo all'elenco con il suo titolo: nel nucleo le regole sono
raggruppate per ambito, in quell'ordine. Un ambito che non è nell'elenco finisce in fondo, con la chiave come titolo.

Una regola applicata fuori dal suo ambito è un errore come una regola non applicata: per questo la pagina
`wiki/concepts/ambito.md` apre il nucleo con la regola d'ambito (di chi è il cervello, cosa resta fuori, e che nel
dubbio si chiede).

### 7.4 Nucleo sì o no

- `nucleo: sì`: le righe dell'«In breve» entrano nel nucleo e quindi in ogni sessione, in ogni AI. Per le regole che
  devono valere sempre.
- `nucleo: no`: la regola compare solo come link in «Le altre regole» e si apre quando serve. Per le regole lunghe o
  rare.

Il nucleo va tenuto corto: ogni riga costa attenzione all'AI e caratteri nelle istruzioni delle chat (5.2).

### 7.5 Regole superate e frasi superate

Una regola che cambia si corregge nella sua pagina. Una regola che ne sostituisce un'altra fa due cose:
1. la pagina vecchia prende `status: superseded` e `superata-da: [nome-della-nuova]`, e non si cancella: resta come
   storia e passa nell'index sotto «Superate, solo storico»;
2. la frase vecchia, se può trovarsi ancora scritta in giro (in una procedura, in una pagina, in un prompt), va nella
   tabella di `wiki/meta/frasi-superate.md`: la frase con le sue varianti, la regola nuova, dove cercarla, se blocca.

Da lì `node bin/controlla.mjs` (controllo d) la cerca a ogni giro: rossa se la riga dice «sì» nella colonna Blocca,
gialla se dice «no». Non contano le righe che citano la frase per vietarla, le sezioni di storia, il log e hot. Le
copie che stanno fuori dalla cartella (un prompt sull'account, una skill caricata a mano) il controllo non le vede: si
elencano in fondo alla stessa pagina e si correggono a mano.

Una regola che non vale più si toglie, non si restringe. Una regola ridotta a «solo in certi casi» tende a tornare
intera.

### 7.6 Attribuzione

Ogni regola, numero o vincolo che l'AI cita in un lavoro punta a una pagina del cervello. Ciò che viene dalla
conoscenza generale del modello si dichiara: «prassi generale, non regola mia». Così distingui una tua decisione da
un'abitudine del settore, e un vincolo inventato non diventa invalicabile solo perché è stato detto con sicurezza.

### 7.7 Come arrivano a ogni superficie

| Superficie | Da dove riceve le regole | Quando vede una regola cambiata |
|---|---|---|
| Claude Code nella cartella | `CLAUDE.md`, che importa `AGENTS.md` con il blocco del nucleo; in più l'hook `instrada` | alla sessione successiva a `node bin/costruisci.mjs` |
| Un altro agente nella cartella | `AGENTS.md` | alla sessione successiva |
| Routine nel cloud | `AGENTS.md` del repository clonato | al primo giro dopo il salvataggio su GitHub |
| Chat di Claude con il plugin | la skill `cervello`, con i blocchi del nucleo e della tabella degli strumenti, quando la chat la apre (richiesta che la riguarda, oppure `/cervello`) | quando l'account riceve la versione nuova del plugin dal repository |
| Chat con i file caricati | `istruzioni-chat.md` del pacchetto | quando ricarichi il pacchetto (5.5) |
| Claude Code fuori dalla cartella | `~/.claude/CLAUDE.md`, se lo hai preparato (4.11) | subito, se importa il nucleo per percorso |
| Controllo su GitHub | non applica le regole: controlla le pagine regola, i caratteri vietati e le frasi superate | a ogni salvataggio e ogni giorno |
| Obsidian | nessuna: è un visore | |

### 7.8 Le regole di base del modello

| Pagina | Ambito | In una riga |
|---|---|---|
| `fonte-unica` | tutto | una sola fonte di istruzioni; niente documenti paralleli; ogni regola o numero punta a una pagina |
| `ambito` | tutto | di chi è il cervello, cosa ci entra, estrai e non caricare, niente segreti né dati di terzi |
| `dove-si-lavora` | tutto | una sola copia scrivibile, note per il cervello da chi non può scrivere, chiavi fuori |
| `leggi-prima-di-analizzare` | tutto | prima di un'analisi si legge ciò che c'è già e si dice da cosa si parte |
| `verificato-non-dedotto` | tutto | un'assenza non si deduce, una correzione si verifica sull'effetto |
| `sistemi-esterni` | tutto | si legge sempre, si scrive solo con il sì sulla singola operazione |
| `strumento-giusto` | tutto | prima la tabella «Richiesta → strumento», mai uno strumento doppio |
| `lavoro-consegnato-intero` | tutto | lavoro finito, dubbi in al massimo dieci domande sì o no, niente cancellazioni |
| `imparare-dagli-errori` | tutto | un errore che può ripetersi diventa una pagina nella stessa sessione |
| `come-scrivere-per-me` | scrittura | lingua, tono, correzioni ricorrenti No/Sì, niente lineette lunghe o medie |

Sono un punto di partenza: si cambiano, si tolgono o si superano come tutte le altre. La regola delle lineette, per
esempio, è attiva perché i due caratteri stanno nell'elenco `caratteriVietati` di `bin/impostazioni.json`: se non ti
serve, togli le due voci da lì e la riga dall'«In breve» di `come-scrivere-per-me`, poi `node bin/costruisci.mjs`.

## 8. La conoscenza

### 8.1 Tipi di pagina e vocabolario chiuso

Ogni pagina di `wiki/` ha nel frontmatter un `type` e uno `status` presi da un elenco chiuso, scritto in
`bin/impostazioni.json` alla voce `vocabolario`. Il controllo g segnala in giallo un valore fuori elenco. Un
vocabolario aperto produce in pochi mesi due parole per la stessa cosa e una ventina di stati diversi.

| type | Cosa è | Dove sta | Modello |
|---|---|---|---|
| `regola` | una regola | `wiki/concepts/` | `_modelli/regola.md` |
| `concetto` | un'idea, un metodo, una spiegazione | `wiki/concepts/` | `_modelli/concetto.md` |
| `persona` | una persona: ruolo e rapporto | `wiki/entities/persone/` | `_modelli/persona.md` |
| `azienda`, `cliente` | un'azienda o un cliente | `wiki/entities/aziende/` | `_modelli/azienda.md` |
| `progetto` | un progetto | `wiki/entities/progetti/` | `_modelli/progetto.md` |
| `strumento` | uno strumento o un servizio | `wiki/entities/strumenti/` | `_modelli/strumento.md` |
| `fonte` | la sintesi di un documento, una mail, un report | `wiki/sources/` | `_modelli/fonte.md` |
| `riunione` | la sintesi di una riunione: partecipanti, decisioni, aperti | `wiki/sources/` | `_modelli/riunione.md` |
| `procedura` | i passi di un lavoro ricorrente | `automazioni/` | `_modelli/procedura.md` |
| `routine` | il testo del prompt di una routine | `automazioni/routine/` | `_modelli/routine.md` |
| `meta` | le pagine di servizio: hot, index, log, nucleo, registri | `wiki/` e `wiki/meta/` | |
| `nota-inbox` | una nota per il cervello | `.raw/inbox/` | `_modelli/nota-inbox.md` |

| status | Vuol dire |
|---|---|
| `current` | in vigore |
| `draft` | bozza |
| `prospect` | un'azienda o un contatto possibile, non ancora un rapporto vero |
| `superseded` | sostituita da un'altra pagina (con `superata-da`) |
| `archived` | archiviata, solo storico |
| `evergreen` | pagina di servizio sempre valida (index, log) |

### 8.2 Nomi dei file

Minuscolo, trattini al posto degli spazi, niente accenti: `mario-rossi.md`, `listino-2027.md`. Le fonti finiscono con
la data: `wiki/sources/<tipo>-<tema>-AAAA-MM-GG.md`, per esempio `riunione-lancio-2026-11-03.md`. Due file con lo
stesso nome in cartelle diverse rendono ambiguo un link: il controllo b lo segnala in rosso quando ricevono link.
Una convenzione nuova vale in avanti: un file già linkato non si rinomina.

### 8.3 Hot, index, log e l'archivio

- **Hot** (`wiki/hot.md`): voci nuove in cima a «In corso adesso», nella forma
  `- **AAAA-MM-GG: esito in una frase.** Cosa è cambiato, cosa resta aperto, chi deve muoversi. → [[pagina]]`, al
  massimo cinque righe. È una sintesi con il rimando, non un secondo log: il fatto durevole sta nella pagina linkata.
  Ha anche le sezioni «Aperti (da chiarire)» e «Segnali volatili (verificare dal vivo)». Le voci oltre i 14 giorni
  le sposta il Custode in `wiki/meta/hot-archivio-AAAA-MM.md`, parola per parola. Chi aggiunge una voce mette la data
  di oggi in `updated`. Il controllo m avvisa se hot supera i 40 KB o se non viene aggiornata da una settimana (vale la
  data più recente fra `updated` e le voci).
- **Index** (`wiki/index.md`): una riga per pagina, `- [[pagina]]: cosa contiene in una riga`, nelle sezioni Regole,
  Il secondo cervello, Persone, Aziende e clienti, Progetti, Fonti recenti, Pagine da collegare. Una pagina che non
  trova posto va in «Pagine da collegare», mai fuori dall'index.
- **Log** (`wiki/log.md`): voci nuove in fondo, `## AAAA-MM-GG. Titolo (superficie)` con le righe Area, Fatto, Perché,
  Non toccato, Aperti. Le voci vecchie non si cambiano.

Hot e log hanno l'unione automatica delle righe (in `.gitattributes`): se due agenti scrivono insieme, Git tiene le
righe di tutti e due. Funziona perché in hot si aggiunge solo in cima e nel log solo in fondo. Può lasciare due righe
`updated` nel frontmatter di hot: il controllo g le segnala e il Custode tiene solo la più recente.

### 8.4 Incertezza e contraddizioni

- Ciò che non è certo si scrive marcato *(da verificare)*, invece di essere affermato. I nomi propri e le cifre
  delle trascrizioni automatiche, se sono dubbi, si marcano *(nome da verificare)*: non si corregge la grafia a
  intuito.
- Se una fonte dice una cosa diversa da una pagina, nella pagina si aggiunge un riquadro con le due versioni e la
  fonte di ciascuna, e non si sceglie d'ufficio:
  ```
  > [!contradiction]
  > La pagina dice ... (fonte: ...). La riunione del 3/11 dice ... (fonte: ...).
  ```
- Una pagina non si completa con conoscenza generica o ricerche esterne: chi legge deve distinguere ciò che è stato
  detto da ciò che è stato dedotto.

### 8.5 Una pagina per ogni soggetto nuovo

Ogni persona, azienda, progetto o strumento di cui una fonte dice qualcosa che conta ha la sua pagina. Se c'è già, si
aggiorna quella (prima si cerca per nome e per varianti del nome): mai due pagine per lo stesso soggetto. La fonte
linka il soggetto e il soggetto linka la fonte. Senza questa regola i soggetti restano sepolti nei verbali, e alla
domanda «cosa sappiamo di X?» il cervello non risponde. Delle persone si scrivono ruolo e rapporto, non recapiti.

### 8.6 Pagine riservate

Una pagina con `riservato: true` nel frontmatter resta fuori dal pacchetto per le chat di
`node bin/costruisci.mjs --esporta`. Serve per ciò che non deve uscire dal computer e dal repository: una trattativa,
un caso delicato. Non è una cassaforte: la pagina resta nella cartella e, al livello 3, su GitHub. I segreti non ci
vanno comunque (capitolo 12). Con `esporta: no` una pagina resta fuori dal pacchetto perché in chat non serve (le
pagine degli script del modello lo hanno già).

### 8.7 I modelli di pagina

La cartella `_modelli/` ha un modello per ogni tipo, con il frontmatter già pronto (date `AAAA-MM-GG` e segnaposto
tra `<` e `>`). Gli agenti li usano da soli; tu li copi se scrivi una pagina a mano. Una pagina copiata e lasciata a
metà si vede: il controllo n conta anche i segnaposto `<...>` e le date `AAAA-MM-GG` rimasti nelle pagine di `wiki/`, e
`node bin/costruisci.mjs` non accetta una regola con titolo o «In breve» ancora del modello.

## 9. Strumenti e chiavi

### 9.1 Gli script

Tutti in Node, senza niente da installare oltre a Node, e funzionano su Windows, macOS e Linux. Si lanciano dalla
cartella del cervello con `node` seguito dal percorso. La configurazione di tutti sta in un file solo,
`bin/impostazioni.json`. Ogni script ha `--aiuto` e gli stessi codici d'uscita: 0 tutto in ordine, 1 problemi
trovati, 2 opzione sconosciuta o errore d'uso. Due eccezioni volute: `node bin/lib/chiavi.mjs --verifica` senza nomi
è solo informativo ed esce 0 anche se mancano chiavi (con un nome, `--verifica telegram-token`, esce 1 se manca), e
`node bin/avvisa.mjs` senza chiavi scrive l'avviso sullo schermo ed esce 0 (per non fermare il controllo su GitHub).

| Strumento | Script | Cosa fa | Pagina |
|---|---|---|---|
| Costruisci | `bin/costruisci.mjs` | dalle pagine regola genera il nucleo, i blocchi di `AGENTS.md` e della skill, la versione del plugin e il marketplace; con `--esporta` il pacchetto per le chat | `wiki/entities/strumenti/costruisci.md` |
| Controlla | `bin/controlla.mjs` | controlla il cervello in sola lettura, con un semaforo per ognuno dei controlli dalla a alla n | `wiki/entities/strumenti/controlla.md` |
| Avvisa | `bin/avvisa.mjs` | manda un messaggio Telegram; con `--da-controllo` i rossi gravi e il riepilogo del lunedì (o del giro lanciato a mano); `--trova-chat` dà il numero della chat | `wiki/entities/strumenti/avvisa.md` |
| Sincronizza | `bin/sincronizza.mjs` | salva la cartella su Git e la allinea con GitHub, tiene fuori segreti e file oltre 50 MB, parcheggia i conflitti, scrive il battito nei giri pianificati | `wiki/entities/strumenti/sincronizza.md` |
| Installa la sincronizzazione | `bin/installa-sincronizzazione.mjs` | pianifica la sincronizzazione ogni 10 minuti | `wiki/entities/strumenti/sincronizza.md` |
| Hook | `bin/hooks/` | i quattro controlli automatici di Claude Code | `wiki/entities/strumenti/hook.md` |
| Chiavi | `bin/lib/chiavi.mjs` | trova le chiavi per gli altri script senza mostrarle | `wiki/entities/strumenti/chiavi.md` |

I controlli di `bin/controlla.mjs`, in breve: a) percorsi citati che non esistono; b) link rotti e nomi doppi; c)
caratteri vietati; d) frasi superate; e) segreti e dati personali; f) script e registro degli strumenti; g)
frontmatter e pagine regola; h) file generati aggiornati; i) battiti delle automazioni; j) radice e file di
istruzioni; k) doppioni; l) pagine escluse da `.gitignore`; m) hot; n) segnaposto da compilare. Il dettaglio di cosa
è rosso e cosa giallo sta nella pagina dello strumento.

### 9.2 Le regole degli strumenti

Il registro è `wiki/meta/strumenti.md`. Contiene le regole degli strumenti, la tabella «Richiesta → strumento» (che
entra nel nucleo e che l'hook `instrada` legge), la tabella «Dove sto lavorando?» (cosa gira su ogni superficie), la
tabella «Gli strumenti» e le trappole dell'ambiente.
- Gli strumenti del cervello sono gli script di `bin/`. Prima di dire «non esiste» si legge il registro e si elenca
  `bin/`.
- Mai un secondo strumento sullo stesso compito: si dice cosa fa quello che c'è e lo si estende.
- Uno strumento nuovo è tre cose nello stesso lavoro: lo script in `bin/`, la pagina in `wiki/entities/strumenti/`, la
  riga nel registro. Se risponde a una richiesta frequente, anche una riga in «Richiesta → strumento», poi
  `node bin/costruisci.mjs`. Il controllo f è rosso se uno script non è nel registro o il registro cita uno script
  che non esiste.
- La tabella «Richiesta → strumento» si tiene corta: entra nelle istruzioni di ogni AI. La prima colonna ha le parole
  tipiche separate da virgole; la colonna «Da non usare» dice cosa evitare, per esempio una skill generica che fa lo
  stesso lavoro in un altro modo.

### 9.3 Le chiavi

Le chiavi stanno nella cartella privata (4.10) e gli script le trovano con `bin/lib/chiavi.mjs`. Nelle pagine si
scrive solo dove stanno: «il token del bot sta nella cartella privata, voce `telegram-token`». Le difese contro le
fughe sono nel capitolo 12.

### 9.4 Le trappole dell'ambiente

- **Finestre che si aprono.** Su Windows PowerShell lanciato da un'attività pianificata o da un terminale bash (quello
  che arriva con Git per Windows) apre una finestra visibile. La sincronizzazione usa `conhost.exe --headless`.
- **File letti con la codifica sbagliata.** PowerShell 5.1 legge come ANSI i file `.ps1` salvati in UTF-8 senza BOM
  (ANSI e UTF-8 sono due codifiche dei caratteri; il BOM è il segno iniziale che dichiara la codifica): le lettere
  accentate si rompono. Gli strumenti del kit sono in Node anche per questo.
- **Cartelle sincronizzate.** Il cervello e i file di Git non stanno dentro Drive, OneDrive, Dropbox o simili.
- **Percorsi con spazi e barre rovesciate.** I percorsi con spazi vanno tra virgolette; nei terminali bash su Windows
  si scrivono con le barre normali (`C:/Users/...`).

Quando una trappola si ripete, si aggiunge al registro; se si ripete ancora, diventa un controllo.

## 10. Automazioni

### 10.1 Come è fatta una routine

Una routine ha quattro pezzi, e il lavoro vero non sta mai nel prompt:

| Pezzo | Dove | Cosa contiene |
|---|---|---|
| Il prompt | `automazioni/routine/routine-<nome>.md`, blocco «Prompt» | poche righe uguali per tutte: chi sei, lavori nel repository, aggiorna, apri la procedura e la parte comune, se dicono cose diverse valgono i file, chiudi con il resoconto e l'esito del salvataggio |
| La procedura | `automazioni/<procedura>.md` | i passi del lavoro, quanta autonomia, cosa non fare, quando avvisare, la verifica di fine giro |
| La parte comune | `automazioni/_comune.md` | avvio, scrittura di hot e log, battito, salvataggio con tre tentativi, controllo del connettore |
| Il battito | `automazioni/battiti/<nome>.txt` e la tabella «Battiti» di `automazioni/LEGGIMI.md` | una riga con data ed esito a ogni giro, e la cadenza attesa |

Perché così: una procedura dentro un prompt non ha storia, non si controlla e diverge dal cervello. Una procedura in
un file si corregge con un salvataggio, e la correzione vale dal giro dopo. Il prompt si cambia nel suo file e poi si
allinea l'account con `/allinea-routine`: mai a mano sull'account, altrimenti file e routine divergono. Se è
successo, prima si riporta la modifica nel file, poi si allinea.

Gli orari si scrivono con il fuso: `cron: "CRON_TZ=Europe/Rome 30 21 * * *"` vuol dire le 21:30 ora italiana, anche
dopo il cambio dell'ora. Un orario in tempo universale si sposta di un'ora due volte l'anno.

Per creare una routine nuova: la procedura dal modello `_modelli/procedura.md`, il file della routine da
`_modelli/routine.md` (con `stato: spenta` e `id` vuoto), la riga nella tabella delle routine e in quella dei battiti
di `automazioni/LEGGIMI.md`, poi `/allinea-routine` per crearla con il tuo sì, e la riga in
`wiki/meta/mappa-del-cervello.md`.

### 10.2 Il Custode

È la routine di manutenzione del modello, descritta nel 4.6. Due principi valgono per ogni routine che scrive: parte in
modalità rapporto finché non hai visto che le proposte sono giuste, ed è conservativa sui fatti (marca ciò che non è
certo, segnala le contraddizioni, non cancella niente).

### 10.3 Ingestione ricorrente con registro

La procedura `automazioni/ingestione.md` vale per le fonti a mano (i file in `.raw/`) e per quelle ricorrenti (le
registrazioni delle riunioni, una casella di posta, una cartella cloud, un report periodico). Ogni fonte ha un
registro, `automazioni/registro-<fonte>.md`, che dice quale connettore si usa e con quale account, la data
dell'ultimo giro, fin dove si è arrivati e cosa è già entrato. Si legge prima e si aggiorna dopo, sempre: così niente
entra due volte e niente si salta.

Le novità si prendono per data di arrivo, non per data dell'evento: una riunione di mesi fa caricata oggi è una
novità di oggi. L'arretrato non si recupera senza una richiesta esplicita. Una fonte vuota o non ancora pronta resta
«in attesa» e, dopo due giri, si avvisa.

### 10.4 I connettori

Un connettore è il collegamento di un'AI con un servizio esterno: posta, archivio cloud, negozio online, gestionale,
calendario.
- **Prima si controlla l'account.** Ogni procedura che usa un connettore comincia con il passo 0: a quale account è
  collegato? Gli account attesi stanno in `wiki/meta/id-sistemi-esterni.md`. Se è sbagliato o non si capisce: non si
  legge, non si scrive, lo si dice in cima al resoconto e ci si ferma. L'account non si cambia da soli.
- **Si legge liberamente, si scrive solo con il sì.** Scrivere, mandare, pubblicare o cancellare su un sistema esterno
  richiede il tuo sì su quella singola operazione. Ciò che si crea nasce in bozza o spento.
- **Un oggetto che si sostituisce intero si rilegge prima e si verifica dopo.** Molti servizi, quando gli si manda un
  oggetto, lo sostituiscono per intero: scrivere un campo solo può azzerare gli altri.
- **Gli id stanno in una pagina sola**, `wiki/meta/id-sistemi-esterni.md`: le procedure la citano e non li scrivono.
- **Le routine stanno su un account solo.** Su un secondo account girerebbero due volte.

### 10.5 Avvisi che non devono tacere

Un sistema di avvisi muto sembra un sistema in cui va tutto bene. Per questo:
- ogni automazione scrive il suo battito anche quando non c'era niente da fare, e il controllo i lo confronta con la
  cadenza: un battito vecchio è rosso e arriva sul telefono;
- il lunedì (e ogni volta che lanci a mano il flusso su GitHub) arriva il riepilogo anche se è tutto verde: se non
  arriva, è rotto il canale;
- senza le chiavi del bot `bin/avvisa.mjs` non si rompe e non avvisa nessuno: il riepilogo del lunedì è l'unico modo
  per accorgersene;
- una procedura non chiude mai in silenzio quando il cervello non è aggiornato (fonte che non risponde, salvataggio
  non riuscito, novità non ingerite), ma senza novità basta una riga.

## 11. Superfici e piattaforme

Una superficie è un posto da cui un'AI lavora con il cervello: un agente nella cartella, una routine nel cloud, una
chat senza cartella, un visore. Di ognuna conta da dove riceve le regole (tabella del 7.7), dove legge e dove scrive
(la regola `wiki/concepts/dove-si-lavora.md` e la tabella «Dove sto lavorando?» di `wiki/meta/strumenti.md`). La
piattaforma che usi decide quali superfici hai:

| Famiglia | Livello 1 | Livello 2 | Livello 3 | Scheda |
|---|---|---|---|---|
| Claude | progetti con istruzioni e file | Claude Code (legge `CLAUDE.md`, che importa `AGENTS.md`); Cowork con la cartella collegata, senza hook | routine di Claude Code nel cloud sul repository; plugin dal marketplace del repository | `piattaforme/claude.md` |
| ChatGPT e Codex | progetti con file, in numero diverso secondo il piano | Codex legge `AGENTS.md` | attività pianificate, con limiti diversi | `piattaforme/chatgpt-e-codex.md` |
| Google | i Gem, in via di sostituzione con le skill, e Gemini Notebook (ex NotebookLM), in sola lettura: prima di costruirci sopra, leggere la scheda | Antigravity legge `AGENTS.md` | da verificare | `piattaforme/google.md` |
| Microsoft e GitHub | agenti di Microsoft 365 Copilot con istruzioni corte e conoscenza in `.txt` | l'agente nel cloud di GitHub Copilot, Copilot CLI e VS Code leggono `AGENTS.md`; la chat su github.com no | prompt pianificati | `piattaforme/microsoft-e-github.md` |
| Editor e modelli locali | dipende dal programma | Cursor, Devin Desktop e altri leggono `AGENTS.md` | dipende | `piattaforme/altri.md` |

Le informazioni sono state verificate il 2026-11-03 sulle pagine ufficiali, in parte solo da estratti, e una parte
di nuovo il 2026-11-04: limiti, nomi dei menu, piani e gradi di certezza stanno nelle schede, ognuna con la sua data. Le piattaforme cambiano in fretta:
prima di un lavoro lungo su una piattaforma, controlla la data della sua scheda.

## 12. Sicurezza e privacy

**Segreti.** Password, chiavi, token e codici d'accesso non stanno mai nelle pagine, nelle chat, nelle memorie
dell'AI, nei prompt delle routine e nemmeno nelle impostazioni locali degli agenti (dove finiscono facilmente, per
esempio dentro una regola di permesso che contiene un comando con la password). Stanno nella cartella privata o nei
segreti del repository GitHub, e nelle pagine si scrive solo dove stanno. Le difese del kit, una sopra l'altra:
- `.gitignore` esclude i file con nomi da credenziale (`.env`, `*password*`, `*secret*`, chiavi private e simili),
  tranne le pagine, gli script e le procedure, che devono arrivare agli altri computer (il controllo l lo verifica);
- `.gitignore` esclude anche gli originali di `.raw/` (esportazioni, trascrizioni, mail): restano sul computer, e su
  Git vanno solo le note di `.raw/inbox/`;
- la sincronizzazione passa ogni file in uscita da `node bin/controlla.mjs --segreti` e tiene fuori quelli sospetti
  (se il controllo non risponde, tutto il gruppo);
- il controllo e cerca i formati tipici delle chiavi nei file del repository, compreso il token del bot Telegram che
  il kit fa creare, e avvisa subito;
- in Claude Code `dopo-modifica` controlla ogni file scritto e `proteggi` nega i comandi che mostrerebbero un valore
  (compresi `gh auth token` e `git credential fill`).

Nessuna di queste difese trova una password scritta in prosa senza la parola «password»: la regola resta la prima
difesa.

**Se un segreto finisce su Git, si cambia la credenziale.** Togliere il file non basta: la storia di Git conserva
ogni versione, in ogni copia del repository. Riscrivere la storia è possibile ma rompe i cloni degli altri computer e
delle routine, e non garantisce niente sulle copie già fatte. La cura vera è rendere inutile il valore trapelato:
cambia la password o rigenera la chiave, poi togli il file e aggiungi il caso al `.gitignore`.

**Dati di terzi.** Delle persone si scrivono ruolo e rapporto. Indirizzi, telefoni, documenti, dati bancari o
sanitari non entrano: si scrive al massimo dove stanno. Il controllo e segnala un file con più di 50 indirizzi email e
i codici IBAN validi.

**Repository privato, sempre.** Controlla ogni tanto la visibilità su GitHub, e chi ha accesso al repository. Chi lo
clona ha tutto il cervello.

**Le chat vedono ciò che carichi.** Il pacchetto di `--esporta` e i file caricati finiscono sui server della
piattaforma: scegli cosa entra, con `riservato: true` sulle pagine che non devono uscire. Una conversazione esportata
da una chat può contenere dati che nel cervello non devono stare: prima di metterla in `.raw/` rileggila.

**Le chiavi non si chiedono all'AI.** Un'AI non deve mai vedere il valore di una chiave: per sapere se c'è,
`node bin/lib/chiavi.mjs --verifica`; per usarla, gli script la leggono da soli.

## 13. Errori da non ripetere

Ogni scelta del kit nasce da un errore successo davvero in un cervello vero. Eccoli, in forma generale, con quello che
il kit fa per evitarli.

### Istruzioni e regole

**1. Istruzioni sparse che si contraddicono.** La stessa regola in un file di istruzioni, in una memoria, in una
skill, in un leggimi: dopo qualche mese le copie dicono cose diverse e nessuno sa quale valga.
*Il kit:* una regola è una pagina; il nucleo lo genera `node bin/costruisci.mjs`; i leggimi non contengono regole e
rimandano alle pagine; il controllo h segnala i file generati rimasti indietro, il controllo j i file di istruzioni
in più in radice.

**2. Regole scritte ma non lette al momento giusto.** Una regola c'era, ma nessuno l'ha aperta prima del lavoro, e una
serie di testi è uscita nel registro sbagliato.
*Il kit:* la «Seconda azione» di `AGENTS.md` (prima di un lavoro delicato si aprono le pagine indicate e la fonte
reale del dato); l'hook `instrada`; il verificatore prima che il lavoro esca.

**3. La memoria automatica dell'AI come fonte nascosta.** Regole che esistevano solo in una memoria, e in una memoria
perfino una password.
*Il kit:* la memoria contiene solo rimandi di una riga alle pagine (`CLAUDE.md` del modello); se dice altro, vale il
cervello.

**4. Procedure e id che vivono solo nei prompt delle routine.** Si corregge il cervello, ma la routine continua a
fare come prima, perché la regola vera stava nel suo prompt.
*Il kit:* prompt corto e uguale per tutte; la procedura in `automazioni/`; il testo del prompt salvato in
`automazioni/routine/` e allineato con `/allinea-routine`; gli id in `wiki/meta/id-sistemi-esterni.md`.

**5. Copie a mano di plugin e skill.** L'account usava una versione vecchia del plugin, con una regola già abolita,
mentre quella giusta era ferma in una cartella.
*Il kit:* il plugin arriva dal repository attraverso il marketplace; la versione la alza lo script quando il contenuto
cambia; una skill con lo stesso nome caricata a mano si spegne.

**6. Regole applicate fuori dal loro ambito.** Le regole scritte per un solo strumento finivano in lavori che non
c'entravano.
*Il kit:* il campo `ambito`; la regola d'ambito in testa al nucleo; nel dubbio si chiede.

**7. Conoscenza generica presentata come regola.** Un vincolo applicato come invalicabile non esisteva in nessuna
pagina.
*Il kit:* l'attribuzione: ogni regola o numero punta a una pagina, il resto è «prassi generale, non regola mia»; il
verificatore cerca le regole citate senza pagina.

**8. Una regola gonfiata fino a diventare un cancello.** «Controlla prima di pubblicare» era diventato un controllo a
ogni passo, con avvisi ripetuti e decisioni riaperte. Ristretta invece che tolta, è tornata.
*Il kit:* la regola del lavoro consegnato intero (dubbi in al massimo dieci domande sì o no in fondo, decisioni
dell'utente chiuse, un rilievo detto una volta); una regola che non vale più si toglie e la sua frase va tra le frasi
superate.

**9. Regole di forma violate anche se scritte.** Una regola di punteggiatura c'era da settimane, eppure in un giorno è
stata violata in decine di titoli.
*Il kit:* i caratteri vietati in `bin/impostazioni.json`; `costruisci.mjs` rifiuta una pagina regola che li ha nel
titolo o nell'«In breve» (le righe che vanno nel nucleo); il controllo c li segna ovunque, in rosso nella zona
vincolante; `dopo-modifica` dà il numero di riga appena il file è scritto.

**10. Una lezione scritta solo nel log, quindi ripetuta.** Lo stesso errore è tornato settimane dopo, più grande,
perché la lezione stava solo in hot e nel log.
*Il kit:* la regola «ogni errore che può ripetersi diventa una pagina nella stessa sessione»; `/chiudi` lo chiede ogni
volta.

**11. Le stesse correzioni, ogni giorno.** Le stesse correzioni di stile, ripetute ogni giorno; e intanto il
terminale ripeteva il gergo inglese delle istruzioni di sistema.
*Il kit:* `come-scrivere-per-me` con le tabelle No/Sì e la lingua scelta, anche nel terminale.

**12. Skill generiche che contraddicono le regole.** Una skill di scrittura chiedeva varianti che le regole vietavano,
un'altra proponeva uno strumento diverso da quello scelto.
*Il kit:* il nucleo dice che le skill generiche portano un metodo e non decidono; la colonna «Da non usare» della
tabella degli strumenti; le skill che portano fuori strada si spengono.

**13. Strumenti non trovati, o doppi.** Una chat cercava tra i servizi esterni uno script che c'era già; per lo stesso
lavoro esistevano due strumenti.
*Il kit:* il registro degli strumenti; la tabella «Richiesta → strumento» nel nucleo e l'hook `instrada`; uno
strumento nuovo è script, pagina e riga insieme, e il controllo f lo verifica.

### Conoscenza

**14. Hot che diventa un secondo log.** Il file di ciò che è in corso era arrivato a occupare metà del contesto
dell'AI, con voci lunghe come paragrafi.
*Il kit:* voci di al massimo cinque righe, sintesi più rimando; il Custode archivia le voci oltre i 14 giorni a testo
invariato; il controllo m avvisa sopra i 40 KB.

**15. Ingestione fatta male.** Soggetti che esistevano solo dentro i verbali; nomi propri sentiti male dalle
trascrizioni e corretti a intuito; una riunione vecchia caricata tardi e saltata, perché le fonti erano ordinate per
data dell'evento.
*Il kit:* una pagina per ogni soggetto nuovo, linkata nei due sensi; *(nome da verificare)* invece della correzione a
intuito; ordine per data di arrivo e un registro per ogni fonte.

**16. Vocabolario aperto.** Due lingue per lo stesso tipo di pagina e una ventina di stati diversi.
*Il kit:* `type` e `status` da un elenco chiuso in `bin/impostazioni.json`; il controllo g segnala i valori fuori
elenco.

**17. Una premessa sbagliata che si propaga.** Un ruolo attribuito per errore a una persona reggeva una regola in più
pagine e in tutte le sessioni successive; altre persone erano state assegnate per analogia.
*Il kit:* «verificato, non dedotto»; l'ingestione scrive solo ciò che la fonte dice e marca il resto *(da
verificare)*; la frase sbagliata va tra le frasi superate, così le copie si trovano.

**18. Il cervello usato come magazzino.** Il cervello pieno di siti, file pesanti e dati personali.
*Il kit:* estrai, non caricare; `.gitignore` esclude i file pesanti, le credenziali e gli originali di `.raw/`; la
sincronizzazione tiene fuori i file oltre 50 MB; il codice dei progetti sta nei suoi repository (capitolo 14).

### Verifica e sistemi esterni

**19. Un'assenza dedotta da una fonte parziale.** Un «non esiste» ricavato da un elenco che si fermava a una pagina, o
da un file in cui la conversione dei numeri era sbagliata.
*Il kit:* la regola «verificato, non dedotto»: si cerca per nome o per id, si controlla se l'elenco è troncato, si
controlla la conversione; il verificatore guarda proprio le assenze.

**20. Una correzione verificata rileggendo l'impostazione.** La correzione «risultava fatta», ma il giro dopo il
problema c'era ancora.
*Il kit:* si verifica l'effetto al giro successivo; le routine ricorrenti rileggono lo stato e ripetono i punti
aperti.

**21. Il connettore sull'account sbagliato.** Una routine ha letto i dati di un altro account, e il cervello per
settimane ha indicato l'account sbagliato.
*Il kit:* il passo 0 di `automazioni/_comune.md` (si verifica l'account, se è sbagliato ci si ferma); gli account
attesi in `wiki/meta/id-sistemi-esterni.md`.

**22. Lo stato scritto non è lo stato vero.** Un'automazione chiamata «bozza, non attivare» era accesa da settimane;
un oggetto aggiornato in un campo solo ha perso tutti gli altri.
*Il kit:* sui sistemi esterni vale la lettura dal vivo; ciò che si crea nasce spento o in bozza; un oggetto che si
sostituisce intero si rilegge prima e si verifica dopo.

### Sincronizzazione e automazioni

**23. Scrivere attraverso un archivio cloud.** Il connettore creava un file nuovo invece di modificare quello vecchio:
settimane di dati sono finite in copie «(1)», «(2)», mentre il file vero restava fermo. In un altro caso la cartella
del cervello era sincronizzata nei due sensi e ciò che una chat scriveva lì arrivava nel repository senza revisione.
*Il kit:* una sola copia scrivibile; le chat lasciano una nota per il cervello; il cervello fuori dalle cartelle
sincronizzate; il controllo k segnala i doppioni.

**24. Più scrittori sugli stessi file.** Sessioni, routine e due computer che scrivevano insieme: la sincronizzazione
si fermava più volte in pochi giorni.
*Il kit:* unione automatica delle righe su hot e log, con le voci aggiunte solo in cima o in fondo; i conflitti su un
ramo a parte, uniti dal Custode; un solo computer principale, gli altri «secondari».

**25. Controlli e avvisi muti.** Il registro della sincronizzazione scriveva solo quando salvava; gli avvisi non
arrivavano perché mancavano le chiavi, e sembrava tutto in ordine.
*Il kit:* un battito per ogni automazione, controllato ogni giorno; il riepilogo del lunedì anche se è tutto verde;
`avvisa.mjs --verifica`.

**26. Routine doppie e orari sbagliati.** Routine copiate su un secondo account giravano due volte; con il cambio
dell'ora alcune routine sono partite un'ora prima.
*Il kit:* le routine stanno su un account solo; l'orario si scrive con il fuso (`CRON_TZ`).

**27. Il cervello vive fuori dalla cartella più di quanto si crede.** Prompt delle routine, plugin, documenti
pubblicati, cartelle con istruzioni proprie, memorie: una ricognizione ne ha trovati più del doppio di quelli noti.
*Il kit:* `wiki/meta/mappa-del-cervello.md`; chi crea, sposta o spegne qualcosa fuori aggiorna la sua riga nello
stesso lavoro.

**28. Percorsi citati che non esistono più, e nomi doppi.** Uno spostamento rompeva le routine che citavano il file;
una cartella citata in più posti non era mai stata creata.
*Il kit:* i controlli a e b; uno spostamento per salvataggio, con `git mv` e i riferimenti corretti nello stesso
salvataggio.

### Sicurezza

**29. Segreti nel repository.** Credenziali che finiscono in una chat esportata e salvata, password dentro le regole
di permesso di un agente, una chiave lasciata nel codice come ripiego.
*Il kit:* la cartella privata e il modulo unico delle chiavi; `.gitignore`, controllo e, sincronizzazione che tiene
fuori i file sospetti, `dopo-modifica` e `proteggi`; se succede, si cambia la credenziale.

**30. Cancellazioni.** Un file spostato a mano in una cartella esclusa da Git è sparito dal repository senza che
nessuno lo decidesse.
*Il kit:* l'AI non cancella niente: ciò che esce va in `_da_eliminare/` e la svuoti tu. Quella cartella non va su
Git: un file spostato lì esce dal repository al salvataggio successivo (resta solo nella storia) e rimane sul
computer finché non svuoti la cartella.

## 14. Quando il cervello cresce

### 14.1 Il log si allunga

Il log cresce di qualche voce al giorno e, dopo un anno, diventa lungo da leggere anche a pezzi. Quando supera qualche
migliaio di righe, sposta le voci degli anni passati in un archivio, per esempio `wiki/meta/log-archivio-AAAA.md`, con
`type: meta` e `status: archived`, copiate parola per parola e nello stesso ordine. In cima al log metti una riga con
il link agli archivi. Come per hot, un archivio già citato non si rinomina.

### 14.2 Hot non scende

Se hot resta sopra i 40 KB anche dopo i giri del Custode o del prompt D, le voci sono troppo lunghe: i dettagli vanno
nelle pagine linkate e la voce torna a cinque righe.

### 14.3 Progetti e codice in repository separati

Il codice di un sito, di un'app o di uno script grosso non sta nel cervello: ha un repository suo, con un suo
`AGENTS.md` o `CLAUDE.md` per le istruzioni tecniche. Nel cervello c'è la pagina del progetto in
`wiki/entities/progetti/`, con lo stato, le decisioni e il link al repository. Un progetto che vive dentro il cervello
lo appesantisce, ne mescola le regole e porta su Git file che non c'entrano.

### 14.4 I file pesanti fuori

PDF, documenti d'ufficio, audio, video e immagini restano nel loro archivio (una cartella cloud, un disco). La pagina
fonte dice dove sta l'originale nel campo `originale`. `.gitignore` li esclude già; se ne compaiono di nuovi tipi,
aggiungi l'estensione.

### 14.5 Riprogettare senza rompere

Prima o poi la struttura che andava bene all'inizio non basta più. Si cambia senza rompere niente così:
1. **Inventario.** Cosa c'è, dove, chi lo legge: la cartella, la mappa del cervello, le routine, gli account. Fallo
   fare all'agente, cartella per cartella, con un elenco di chi cita cosa (i controlli a e b aiutano).
2. **Verifica dell'inventario.** Un secondo giro indipendente, per esempio con il verificatore, cerca ciò che il primo
   ha saltato.
3. **Decisioni.** Ogni cambiamento diventa una domanda sì o no, e la risposta si scrive.
4. **La struttura nuova su carta**, approvata prima di toccare un file.
5. **Una mossa per volta.** Uno spostamento per salvataggio, con `git mv` e i riferimenti corretti nello stesso
   salvataggio. Durante i lavori: `node bin/sincronizza.mjs --pausa`. Se il lavoro dura più sessioni, un file
   `da-riprendere.md` nella cartella di stato dice alla sessione dopo da dove ripartire.
6. **Dopo ogni mossa** `node bin/costruisci.mjs` e `node bin/controlla.mjs`: zero rossi prima della mossa successiva.
7. **Verifica al giro dopo.** Ogni routine toccata si controlla al suo giro successivo (battito e resoconto), non
   rileggendo il file.
8. **Le frasi vecchie** vanno tra le frasi superate; le convenzioni nuove valgono in avanti.

Se una generazione porta un errore ovunque insieme (succede: il nucleo arriva in molti posti), lo si vede nella
differenza del salvataggio e lo si annulla con `git revert`.

### 14.6 Aggiornare gli script da un kit nuovo

Il cervello nasce da una copia di `modello/`: le correzioni che arrivano con un kit più nuovo non entrano da sole. La
versione del kit è scritta in `LEGGIMI.md` del kit e nella prima voce del log del cervello. Per portarle:
1. sincronizzazione in pausa (`node bin/sincronizza.mjs --pausa`);
2. dal kit nuovo copia sopra quelli del cervello solo: `bin/` tranne `bin/impostazioni.json` (confronta a mano le voci
   nuove e aggiungile al tuo), `.claude/commands/`, `.claude/agents/`, `.claude/settings.json`, `.github/workflows/`;
3. non copiare mai `wiki/`, `AGENTS.md`, `CLAUDE.md`, `automazioni/` e `_modelli/`: sono tuoi. Se il kit nuovo cambia
   una procedura di `automazioni/`, confronta e riporta a mano le differenze che ti servono;
4. `node bin/costruisci.mjs`, poi `node bin/controlla.mjs`, poi `--riprendi`; una voce nel log con la versione del
   kit.

### 14.7 Con un team

Più persone sullo stesso cervello:
- ognuna è collaboratore del repository privato su GitHub; per il catalogo dei plugin, l'account GitHub collegato
  all'AI deve vedere il repository;
- un solo computer principale per tutto il team, gli altri «secondari»; un solo Custode, su un account;
- «Chi», la regola d'ambito e `come-scrivere-per-me` sono pensati per una persona: una pagina
  `come-scrivere-per-<nome>` per persona, e nella regola d'ambito di chi è il cervello;
- `riservato: true` non è un controllo d'accesso: chi ha il repository legge tutto. Dove servono dati che non si
  condividono, un cervello per persona;
- le pagine che più persone toccano hanno un solo scrittore alla volta (per esempio un registro, una tabella di
  stato): due sessioni che riscrivono lo stesso file si sovrascrivono;
- per un'organizzazione che usa Claude, il plugin per l'organizzazione della scheda `piattaforme/claude.md`.

## 15. Prova finale

Il cervello funziona se tutte le voci del tuo livello sono vere.

**Livello 1**
- [ ] In una chat nuova del progetto, «cosa c'è in corso?» riceve una risposta dai file, con la data della copia.
- [ ] «Per chi lavoro?» riceve la risposta giusta, dalla regola d'ambito.
- [ ] Quando dici un fatto nuovo, la chat chiude con una nota per il cervello nel formato giusto.
- [ ] Le note salvate in `.raw/inbox/` hanno il nome `AAAA-MM-GG-<tema>.md`.
- [ ] Il pacchetto caricato ha la stessa data del nucleo.

**Livello 2, in più**
- [ ] Esiste una copia del cervello fuori da questo computer (repository privato su GitHub o backup su un disco
      esterno, 3.2).
- [ ] In una sessione nuova l'agente legge hot e index senza che tu lo chieda.
- [ ] `/ingerisci` (o la richiesta a parole) produce la pagina fonte, le pagine dei soggetti, la voce in hot e nel
      log, le righe nell'index.
- [ ] Una regola nuova nasce come pagina e il nucleo si rigenera.
- [ ] `/chiudi` scrive hot e log e chiede degli errori da trasformare in pagina.
- [ ] `node bin/controlla.mjs` dà zero rossi; i gialli rimasti li conosci.
- [ ] `node bin/costruisci.mjs --verifica` esce senza differenze.
- [ ] Con Claude Code: l'agente sa dire cosa gli ha detto il controllo d'avvio.

**Livello 3, in più**
- [ ] Il repository su GitHub è privato e contiene il cervello.
- [ ] `node bin/sincronizza.mjs --stato` mostra giri recenti e nessun conflitto aperto.
- [ ] Una modifica fatta sul computer compare su GitHub entro 10 minuti; una fatta da una routine torna sul computer.
- [ ] Il flusso «Controllo del cervello» su GitHub è verde, e lanciato a mano manda il riepilogo su Telegram.
- [ ] Il lunedì arriva il riepilogo.
- [ ] Il Custode ha scritto il suo battito ieri sera, e i suoi resoconti sono sensati.
- [ ] Da una chat del telefono con il plugin, l'AI sa chi sei e prepara una nota quando serve; la nota arriva al
      cervello dalla casella cloud (4.6).
- [ ] Sugli altri computer `--stato` dice «secondario».
- [ ] `node bin/lib/chiavi.mjs --verifica` trova le chiavi che servono, senza mostrarle.
- [ ] La mappa del cervello elenca tutto ciò che vive fuori dalla cartella.

**Se qualcosa non va**

| Cosa vedi | Causa probabile | Cosa fare |
|---|---|---|
| L'agente non legge hot da solo | cartella non accettata come attendibile, oppure `@AGENTS.md` tolto da `CLAUDE.md`; con un altro agente, non legge `AGENTS.md` da solo | accetta la cartella; rimetti la riga; con gli altri agenti il primo messaggio è «leggi AGENTS.md e seguilo» |
| Nessun messaggio dell'hook d'avvio | cartella non attendibile, Node mancante, `CERVELLO_HOOK` impostato a `spenti` | `node --version`; togli la variabile; prova a mano con l'appendice B |
| Il nucleo non cambia dopo una regola nuova | `node bin/costruisci.mjs` non lanciato o fermo su una pagina scritta male | lancialo e correggi la pagina come dice |
| Una pagina nuova non è nell'index | la chiusura di sessione non è stata fatta | «chiudi la sessione» o `/chiudi` |
| Controllo m giallo dal primo giorno | la data di nascita del kit è rimasta in hot e nel log | metti la data di oggi nella voce di nascita e in `updated` |
| Il plugin sul telefono dice cose vecchie | la sincronizzazione del marketplace è a mano, oppure il salvataggio non è arrivato su GitHub | sincronizza il marketplace nelle impostazioni dell'account; `node bin/sincronizza.mjs --stato` |
| Battito `custode` rosso | routine spenta (anche da sola, se il collegamento con GitHub è scaduto), creata su un altro account, oppure push rifiutato | guarda la routine sull'account; ricollega GitHub; cerca rami `conflitto/` su GitHub |
| Battito `sincronizza` rosso | computer spento per più di 4 giorni, sincronizzazione ferma o tolta | `node bin/sincronizza.mjs --stato`; al rientro sparisce da solo |
| Niente riepilogo il lunedì | segreti `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` mancanti, Actions disattivate | lancia il flusso a mano e guarda il registro del passo «Avvisi su Telegram» |
| `stato-controlli.md` vecchio di giorni | il flusso su GitHub non gira più (Actions spente, minuti finiti) | scheda «Actions» del repository; l'hook d'avvio intanto lancia i controlli dal vivo |
| File con «(1)» nel nome | qualcuno ha scritto da una cartella sincronizzata | il controllo k li elenca: porta il contenuto nel file vero, il doppione in `_da_eliminare/` |
| Conflitto aperto da giorni | il Custode non gira o non vede il ramo | unisci tu: «unisci il ramo di conflitto come dice `automazioni/custode.md`, compito 3» |
| La sincronizzazione dice FERMO | vedi la tabella del 4.2 | il registro dice il comando; `node bin/sincronizza.mjs --stato` |

## 16. Glossario

| Parola | Cosa vuol dire |
|---|---|
| Agente | un'AI che lavora sui file di una cartella: li legge, li modifica, lancia comandi |
| `AGENTS.md` | il file di istruzioni che molti agenti leggono da soli; nel cervello contiene chi sei, la prima azione, le cartelle e il nucleo |
| Ambito | il campo di una regola che dice dove vale: `tutto` o un ambito più stretto |
| ANSI, UTF-8 | due codifiche dei caratteri: lo stesso file letto con quella sbagliata ha le lettere accentate rotte |
| Archivio cloud | un servizio che tiene i file online e li sincronizza, come Drive, OneDrive, Dropbox |
| Bash | un tipo di terminale; su Windows arriva con Git (Git Bash) |
| Battito | una riga con data ed esito che ogni automazione scrive a ogni giro, per dimostrare che gira |
| Blocco generato | il testo tra `<!-- genera: ... -->` e `<!-- fine: ... -->`, scritto solo da `bin/costruisci.mjs` |
| BotFather | il bot ufficiale di Telegram che crea i bot e ne dà il token |
| Cartella attendibile | in Claude Code, una cartella che hai accettato: solo lì partono gli hook |
| Cartella di stato | `~/.cervello-sync/<nome>/`, fuori dal cervello: registro, pausa, conflitti della sincronizzazione |
| Cartella privata delle chiavi | `~/Cervello-Privato/chiavi`, dove stanno le chiavi, mai su Git |
| Chiave, token | un codice che dà accesso a un servizio; si tratta come una password |
| `CLAUDE.md` | il file di istruzioni che legge Claude Code; nel cervello importa `AGENTS.md` |
| Clone | la copia di un repository su un altro computer o nel cloud |
| Commit (salvataggio) | una fotografia dei file in un momento, con data, autore e messaggio |
| Computer principale, secondario | il principale scrive il battito della sincronizzazione; i secondari hanno il file `secondario` nella cartella di stato |
| Conflitto, ramo di conflitto | due modifiche incompatibili; la sincronizzazione parcheggia le sue su un ramo `conflitto/...` |
| Connettore | il collegamento di un'AI con un servizio esterno (posta, archivio, negozio, gestionale) |
| Cron, `CRON_TZ` | il modo di scrivere un orario ricorrente; `CRON_TZ` fissa il fuso orario |
| Custode | la routine serale che tiene in ordine il cervello |
| Frasi superate | la tabella delle frasi di regole vecchie che il controllo cerca nei file |
| Frontmatter | le righe tra `---` in cima a una pagina, con i dati per gli script (`type`, `status`, date) |
| Git | il programma che tiene la storia di ogni modifica ai file |
| GitHub | il servizio online che ospita i repository Git |
| GitHub Actions, flusso (workflow) | il servizio di GitHub che lancia comandi da solo; il flusso è il file che dice quali |
| GitHub CLI | il programma da riga di comando di GitHub (`gh`), usato per l'accesso |
| Hook | un controllo automatico che Claude Code lancia da solo in certi momenti |
| Hot | `wiki/hot.md`: cosa è in corso nelle ultime due settimane |
| Impronta | un codice calcolato dal contenuto del plugin: se cambia, la versione sale |
| Index | `wiki/index.md`: la mappa di tutte le pagine |
| Ingestione | far entrare una fonte nel cervello: estrarre i fatti, aggiornare le pagine |
| Lock | il file che segnala che un giro di sincronizzazione è in corso, perché non ne partano due insieme |
| Log | `wiki/log.md`: la cronologia del cervello |
| Markdown | testo semplice con pochi segni per titoli, elenchi e tabelle |
| Marketplace | l'elenco di plugin da cui un account li installa; per il cervello è un file nel repository |
| Memoria automatica | ciò che un'AI ricorda da sola tra una sessione e l'altra; nel cervello solo rimandi |
| Modalità rapporto, azione | in rapporto una routine scrive cosa farebbe, in azione lo fa |
| Node.js | il programma che fa girare gli script del kit |
| Nota per il cervello | il file che una chat senza scrittura prepara e che tu salvi in `.raw/inbox/` |
| Nucleo | il riassunto generato di tutte le regole, che arriva a ogni AI |
| Obsidian | un programma per leggere e collegare note markdown, usato come visore |
| Plugin | un pacchetto di istruzioni e skill che un account installa e tiene aggiornato |
| Prompt | il testo che si dà a un'AI per farle fare un lavoro |
| Pull, push | scaricare le novità dal repository online, caricare le proprie |
| Ramo (branch) | una linea della storia di Git; quella principale si chiama `main` |
| Rebase | il modo in cui Git rimette le tue modifiche sopra quelle arrivate da altrove |
| Regola | una pagina con `type: regola`: cosa si fa o non si fa, con il perché |
| Remoto, `origin` | il repository online a cui la cartella è collegata |
| Repository | la cartella con tutta la storia di Git; su GitHub, la sua copia online |
| Riservato | `riservato: true`: la pagina resta fuori dal pacchetto per le chat; `esporta: no` fa lo stesso per le pagine che servono solo sul computer |
| Routine | un lavoro che un'AI fa da sola a orari fissi, nel cloud |
| Segnaposto | `{{DA COMPILARE: cosa}}`: un dato tuo ancora da scrivere |
| Segreti del repository (secrets) | i valori che GitHub custodisce per i flussi, come il token del bot |
| Sincronizzazione | il giro che salva la cartella e la allinea con GitHub |
| Skill | un pacchetto di istruzioni (`SKILL.md`) che l'AI apre quando servono |
| Superficie | un posto da cui un'AI lavora con il cervello: agente, routine, chat, visore |
| Terminale | la finestra in cui si scrivono i comandi |
| Vault | il nome che Obsidian dà a una cartella di note |
| Wikilink | un link tra doppie quadre, `[[nome-pagina]]`, risolto per nome del file |
| Zona vincolante | i file che danno istruzioni (`AGENTS.md`, `CLAUDE.md`, nucleo, `automazioni/`, pagine regola): lì un carattere vietato è rosso |

## Appendice A. L'albero del modello

```
AGENTS.md                      istruzioni per ogni agente: parte a mano più il blocco del nucleo
CLAUDE.md                      importa AGENTS.md; in più hook, comandi e memoria di Claude Code
.gitignore                     cosa non va su Git: credenziali, file pesanti, originali di .raw, cartelle d'uso
.gitattributes                 nessuna conversione dei fine riga; unione automatica di hot e log
.raw/
  LEGGIMI.md                   cosa mettere in .raw e come si chiede l'ingestione
  inbox/                       le note per il cervello; integrate/AAAA-MM/ quelle già entrate
_modelli/                      un modello per tipo di pagina: regola, concetto, persona, azienda,
                               progetto, fonte, riunione, strumento, procedura, routine, nota-inbox
wiki/
  hot.md  index.md  log.md     i tre file d'ingresso
  concepts/                    le regole di base e i concetti
  entities/persone/            una pagina per persona
  entities/aziende/            una pagina per azienda o cliente
  entities/progetti/           una pagina per progetto
  entities/strumenti/          costruisci, controlla, sincronizza, hook, chiavi, avvisa
  sources/                     le sintesi delle fonti
  meta/
    nucleo.md                  generato da bin/costruisci.mjs
    stato-controlli.md         generato da bin/controlla.mjs --scrivi
    strumenti.md               registro degli strumenti e tabella «Richiesta → strumento»
    frasi-superate.md          le frasi vecchie che il controllo cerca
    mappa-del-cervello.md      tutto ciò che vive fuori dalla cartella
    id-sistemi-esterni.md      gli id degli oggetti sui sistemi esterni
    glossario.md               le tue sigle e i tuoi nomi propri
automazioni/
  LEGGIMI.md                   routine, battiti e fonti dei plugin
  _comune.md                   avvio, scrittura, battito, salvataggio, connettori
  custode.md                   la procedura serale
  ingestione.md                la procedura per far entrare le fonti
  routine/routine-custode.md   il testo del prompt del Custode
  battiti/                     un file per automazione
  plugin-cervello/             il plugin «cervello»: plugin.json, README.md, skills/cervello/SKILL.md
.claude-plugin/
  marketplace.json             il catalogo dei plugin, generato
  impronte.json                le impronte dei plugin, generato
.claude/
  settings.json                gli hook di Claude Code e i comandi di sola lettura già approvati
  commands/                    chiudi, ingerisci, nuova-regola, allinea-routine
  agents/verificatore.md       l'agente che rilegge un lavoro finito
.github/workflows/controllo.yml   il controllo quotidiano su GitHub
bin/
  impostazioni.json            l'unica configurazione di tutti gli script
  costruisci.mjs               nucleo, blocchi, plugin, pacchetto per le chat
  controlla.mjs                i controlli dalla a alla n
  avvisa.mjs                   gli avvisi su Telegram
  sincronizza.mjs              la sincronizzazione con GitHub
  installa-sincronizzazione.mjs   la pianificazione della sincronizzazione
  hooks/                       comune, avvio, instrada, dopo-modifica, proteggi
  lib/chiavi.mjs               il modulo delle chiavi
```

Le cartelle `esporta/` (il pacchetto per le chat) e `_da_eliminare/` le crea l'uso e non vanno su Git.

## Appendice B. Tutti i comandi

Si lanciano dalla cartella del cervello. Codici d'uscita di tutti gli script: 0 in ordine, 1 problemi trovati, 2
opzione sconosciuta o errore d'uso. Eccezioni: `chiavi.mjs --verifica` senza nomi è solo informativo (esce 0), e
`avvisa.mjs` senza chiavi esce 0 lasciando l'avviso sullo schermo (9.1).

**Costruisci**
```
node bin/costruisci.mjs              rigenera nucleo, blocchi generati, versione del plugin e marketplace
node bin/costruisci.mjs --verifica   non scrive niente: esce 1 se qualcosa è indietro e dice cosa
node bin/costruisci.mjs --elenco     tabella delle regole: nome, ambito, nucleo, ordine
node bin/costruisci.mjs --esporta    pacchetto per le chat nella cartella esporta/
node bin/costruisci.mjs --esporta --txt   lo stesso, con i file di conoscenza in .txt
node bin/costruisci.mjs --aiuto      come si usa
```

**Controlla**
```
node bin/controlla.mjs                    tutti i controlli, rapporto a schermo
node bin/controlla.mjs --scrivi           aggiorna anche wiki/meta/stato-controlli.md (solo senza repository online)
node bin/controlla.mjs --json             il rapporto in JSON (lo legge avvisa.mjs)
node bin/controlla.mjs --segreti f1 f2    solo i segreti, su quei file
node bin/controlla.mjs --aiuto            come si usa
```

**Avvisa**
```
node bin/avvisa.mjs "testo"                                 manda il testo
node bin/avvisa.mjs --da-controllo esito.json               i rossi gravi; il lunedì e lanciato a mano anche il riepilogo
node bin/avvisa.mjs --da-controllo esito.json --riepilogo   il riepilogo anche se non è lunedì
node bin/avvisa.mjs --verifica                              dice se trova token e chat, senza mostrarli
node bin/avvisa.mjs --trova-chat                            con il token salvato, stampa il numero della chat
node bin/avvisa.mjs --aiuto                                 come si usa
```

**Sincronizza**
```
node bin/sincronizza.mjs               un giro completo, con l'esito sullo schermo
node bin/sincronizza.mjs --pianificato il giro dell'attività pianificata: niente schermo, scrive il battito
node bin/sincronizza.mjs --prova       tutti i controlli, senza salvare e senza rete
node bin/sincronizza.mjs --pausa       mette in pausa i giri (scade da sola dopo 3 ore)
node bin/sincronizza.mjs --riprendi    toglie la pausa
node bin/sincronizza.mjs --secondario  questo computer è secondario (--principale lo toglie)
node bin/sincronizza.mjs --stato       registro, lock (il segnale di un giro in corso), pausa, conflitto, computer principale o secondario
node bin/sincronizza.mjs --aiuto      come si usa

node bin/installa-sincronizzazione.mjs          mostra cosa farebbe
node bin/installa-sincronizzazione.mjs --fai    crea o aggiorna la pianificazione
node bin/installa-sincronizzazione.mjs --togli  la toglie
```

**Chiavi**
```
node bin/lib/chiavi.mjs --verifica          per ogni chiave: trovata in variabile, in file, mancante
node bin/lib/chiavi.mjs --verifica <nome>   solo quella chiave
node bin/lib/chiavi.mjs --aiuto             come si usa
```

**Hook, prova a mano** (in un terminale Bash; su Windows Git Bash)
```
echo '{"source":"startup"}' | node bin/hooks/avvio.mjs
echo '{"prompt":"voglio cambiare una regola"}' | node bin/hooks/instrada.mjs
echo '{"tool_name":"Write","tool_input":{"file_path":"wiki/hot.md"}}' | node bin/hooks/dopo-modifica.mjs
echo '{"tool_name":"Bash","tool_input":{"command":"printenv"}}' | node bin/hooks/proteggi.mjs
```
Nessuna uscita vuol dire che l'hook non ha niente da dire (o che il comando passa); un JSON è il contesto aggiunto o,
per `proteggi`, il diniego.

**Comandi di Claude Code**
```
/chiudi                          chiusura di sessione
/ingerisci [file o cartella]     ingestione di .raw/ o di ciò che indichi
/nuova-regola [descrizione]      una regola nuova o cambiata, con il nucleo rigenerato
/allinea-routine                 confronta i file delle routine con l'account, un sì per ogni modifica
```

**Git e GitHub usati nella guida**
```
git init -b main                                    la cartella diventa un repository, ramo main
git config user.name "Il tuo nome"                  chi firma i salvataggi
git config user.email "il-tuo-indirizzo"
git remote add origin https://github.com/<utente>/<nome>.git   collega il repository online
git clone https://github.com/<utente>/<nome>.git Cervello       il cervello su un altro computer
git status                                          cosa è cambiato, e se un'operazione è a metà
git switch main                                     torna sul ramo principale
git branch -m main                                  rinomina il ramo attuale in main (se il repository è nato con master)
git mv <vecchio> <nuovo>                            sposta un file tenendone la storia
git revert <salvataggio>                            annulla un salvataggio con uno nuovo
gh auth login                                       accesso a GitHub dal browser
gh auth setup-git                                   Git usa quell'accesso, senza chiedere password
gh auth status                                      controlla l'accesso (gh auth token invece lo stampa: l'hook proteggi lo nega)
```

**Variabili d'ambiente**

| Variabile | A cosa serve |
|---|---|
| `CERVELLO_HOOK` | `spenti` (o `0`, `no`, `off`) spegne tutti gli hook |
| `CERVELLO_HOOK_DEBUG` | `1` mostra gli errori degli hook invece del silenzio |
| `CERVELLO_SYNC_DIR` | un'altra cartella di stato per la sincronizzazione; serve alle prove, l'attività pianificata non la vede |
| `CERVELLO_CHIAVI_DIR` | un'altra cartella delle chiavi |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | token del bot e numero della chat, al posto dei file della cartella privata |

Per impostarne una solo per la sessione che apri: su Windows, in PowerShell, `$env:CERVELLO_HOOK = "spenti"` e poi
`claude` nella stessa finestra; su macOS e Linux `CERVELLO_HOOK=spenti claude`.

**Il kit**
```
node prova-kit.mjs     dalla cartella del kit: prova automatica di modello, script e sincronizzazione
```
