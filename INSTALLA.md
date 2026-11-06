# Istruzioni per l'AI che installa il secondo cervello

Questo file è scritto per un'AI che lavora con il terminale (Claude Code, Codex, Cursor, Antigravity, Devin Desktop o
un altro agente). Ti dice, passo per passo, come scaricare il kit «secondo cervello», installare i programmi che
servono, costruire il cervello insieme alla persona e verificare che funzioni. Alla fine la persona ha un cervello
funzionante al livello che ha scelto e un resoconto di cosa è acceso e cosa resta da fare.

Il kit contiene anche la guida per la persona (`GUIDA.md`) e i prompt (`PROMPT-DI-AVVIO.md`): questo file non li
ripete, li richiama nel punto in cui servono.

## Come si usa (per la persona)

1. Apri un agente con il terminale in una cartella qualunque, per esempio la tua cartella utente.
2. Scrivi: «Leggi le istruzioni INSTALLA.md del kit secondo cervello e seguile con me», aggiungendo l'indirizzo del
   repository del kit (quello della pagina GitHub da cui hai preso questo file). Se l'agente non apre pagine web,
   scarica lo zip del kit dal pulsante «Code», «Download ZIP», estrailo, apri l'agente nella cartella estratta e
   scrivi «Leggi INSTALLA.md e seguilo».
3. Se vuoi il cervello solo su GitHub, senza installare niente sul computer (strada C del capitolo 2.1 della guida):
   crea su https://github.com un repository nuovo e **Private**, apri una sessione di un agente nel cloud su quel
   repository e scrivi lì la stessa frase.
4. Tieni a portata di mano: da una a due ore e mezza per il livello 2, mezza giornata per il livello 3 (anche in più
   volte); per il livello 3 un account GitHub e il telefono per l'accesso in due passaggi.

## Regole ferme per te

1. Parla in italiano semplice. Una parola tecnica inglese la spieghi tra parentesi la prima volta.
2. Una fase alla volta. All'inizio di ogni fase dici in due righe cosa farai; alla fine, cosa è cambiato. Non passi
   alla fase dopo se la verifica della fase non torna.
3. Installare un programma, creare un repository, pianificare un'attività, cambiare un'impostazione del sistema: solo
   dopo il sì della persona su quella singola operazione, dicendo prima il comando esatto.
4. Gli accessi li fa la persona: il login a GitHub nel browser, i codici dell'accesso in due passaggi, la creazione
   degli account e dei bot. Non chiedi mai una password, un token o una chiave in chat, non ne leggi il valore e non
   lo scrivi in nessun file del cervello. Le chiavi vanno nella cartella privata (fase 4.9), e i file con le chiavi
   li scrive la persona con un editor di testo.
5. Il cervello non sta mai dentro un altro repository Git o nella cartella del kit. Dentro Drive, OneDrive, Dropbox,
   iCloud o una cartella Documenti o Scrivania sincronizzata sta solo se la persona sceglie la strada D alla fase 1,
   dopo che le hai spiegato le conseguenze; in quel caso niente Git in quella cartella.
6. Il repository del cervello su GitHub è sempre privato. Il kit può essere pubblico, il cervello no.
7. Non cancelli niente: ciò che esce va in `_da_eliminare/` dentro il cervello, e la svuota la persona.
8. Se un comando fallisce: leggi l'errore, prova il rimedio indicato qui («Se qualcosa va storto») o nella guida
   (capitolo 15, tabella «Se qualcosa non va»; capitolo 4.2, tabella dei messaggi «FERMO»). Se non basta, fermati e
   spiega in tre righe cosa è successo e cosa serve.
9. Tieni nota delle fasi fatte: alla fine le riassumi alla persona (fase 6).

## Fase 0: il computer e i programmi

Se lavori in una sessione nel cloud su un repository (strada C), salta questa fase: sul computer della persona non
c'è niente da installare. Alla fase 1 scarichi il kit in una cartella temporanea fuori dal repository e, ai punti 5 e
6, la strada è la C.

1. Capisci su quale sistema sei (Windows, macOS o Linux) e controlla:
   ```
   node --version
   git --version
   gh --version
   ```
   Node deve essere 18 o più recente. Git serve dal livello 2 (consigliato) e al livello 3 (obbligatorio). GitHub CLI
   (il programma `gh`, per accedere a GitHub dal terminale) serve solo al livello 3.
2. Proponi alla persona di installare ciò che manca, con il comando del suo sistema, e aspetta il sì:

   | Programma | Windows | macOS | Linux (Debian, Ubuntu) |
   |---|---|---|---|
   | Node.js LTS | `winget install --id OpenJS.NodeJS.LTS -e` | `brew install node`, oppure l'installatore di https://nodejs.org | `sudo apt install nodejs npm`; se la versione è sotto la 18, il pacchetto di https://nodejs.org |
   | Git | `winget install --id Git.Git -e` | `xcode-select --install` oppure `brew install git` | `sudo apt install git` |
   | GitHub CLI | `winget install --id GitHub.cli -e` | `brew install gh` | le istruzioni di https://cli.github.com |
   | Obsidian (facoltativo, per guardare il cervello) | `winget install --id Obsidian.Obsidian -e` | `brew install --cask obsidian` | il pacchetto di https://obsidian.md |

3. Su Windows, dopo un'installazione, i comandi nuovi si vedono solo in un terminale nuovo: chiedi alla persona di
   chiudere e riaprire il terminale (o la sessione dell'agente) e ricontrolla le versioni.

Verifica: `node --version` risponde v18 o più; per i livelli 2 e 3 anche `git --version` risponde.

## Fase 1: il kit e il livello

1. Se il kit non è già sul computer, scaricalo in una cartella sua, separata dal cervello, per esempio
   `~/kit-secondo-cervello` (`~` è la cartella utente; su Windows `C:\Users\<utente>`):
   ```
   git clone <indirizzo del repository del kit> ~/kit-secondo-cervello
   ```
   Senza Git: lo zip dal pulsante «Code», «Download ZIP», estratto nella stessa cartella.
2. Facoltativo, un paio di minuti: dalla cartella del kit `node prova-kit.mjs`. Deve finire con «0 in ERRORE». Prova
   script, controlli e sincronizzazione in una cartella temporanea, senza toccare niente della persona.
3. Leggi `LEGGIMI.md`, i capitoli 0 e 2 di `GUIDA.md` e la scheda della tua piattaforma in `piattaforme/`.
4. Chiedi alla persona il livello, spiegandolo in una riga ciascuno:
   - **1, solo chat**: il cervello si prepara sul computer e si carica in un progetto di una chat; la chat legge, la
     persona salva le note. Vai alla fase 2 e poi alla 5.
   - **2, agente con cartella**: un agente come te legge e scrive il cervello sul computer. Fasi 2, 3 e 6.
   - **3, sistema completo**: in più GitHub privato, sincronizzazione ogni 10 minuti, controllo quotidiano con avvisi,
     routine serale, plugin per le chat. Fasi 2, 3, 4 e 6.
   Se la persona non sa, proponi il 2: si sale dopo senza rifare niente.
5. Chiedi dove vive il cervello. Spiega le quattro strade e le loro conseguenze (per intero nel capitolo 2.1 della
   guida, che hai appena letto) e falle scegliere. Se non sa, proponi la A per provare e la B per tenerlo.

   | Strada | Dove sta la copia su cui si scrive | Conseguenze principali | Livelli | Fasi |
   |---|---|---|---|---|
   | A. Sul computer | una cartella del computer | semplice e privata; una copia sola (serve un backup); niente livello 3 finché non si aggiunge GitHub | 1 e 2 | 2, 3, 6 (5 per il livello 1) |
   | B. Computer e GitHub (consigliata) | la cartella del computer, salvata ogni 10 minuti su un repository privato | storia completa, copia fuori dal computer, più computer, controllo quotidiano, Custode, plugin; serve un account GitHub e mezza giornata | 1, 2 e 3 | 2, 3, 4, 6 |
   | C. Solo GitHub | il repository privato, su cui lavora un agente nel cloud | niente da installare, si lavora da ogni dispositivo; serve una piattaforma con agenti nel cloud su un repository; niente Obsidian né sincronizzazione; hook solo se la piattaforma li esegue; gli originali in `.raw/` non restano tra una sessione e l'altra (`.raw/` è escluso da Git), quindi si ingerisce subito un testo incollato in chat o caricato nella sessione ed entra la sintesi | 3 senza computer | 2, 3, 4 (dal 4.5), 6 |
   | D. In Drive, OneDrive, Dropbox o iCloud | una cartella dentro l'archivio cloud | si vede da ogni dispositivo e le chat con il connettore la leggono *(da confermare)*; un solo computer scrive, niente Git, niente livello 3, storia corta, le chat non modificano le pagine; nell'archivio va tutta la cartella, anche gli originali di `.raw/` (che su GitHub non andrebbero) e le pagine riservate, e il connettore di una chat legge anche le pagine con `riservato: true` | 1 e 2 | 2, 3, 6 (5 per il livello 1) |

   Se la persona ha scelto il livello 3, le strade sono la B o la C. La scelta, con la data e le conseguenze accettate,
   la scrivi in `wiki/meta/mappa-del-cervello.md` durante la fase 2.
6. Chiedi il nome del cervello e, per le strade A, B e D, la cartella:
   - **A e B.** Proponi `~/Cervello`. Prima di accettare un percorso controlla che non sia sincronizzato. Windows: il
     percorso non contiene `OneDrive`, `Google Drive`, `Dropbox`, `iCloud`; se la persona vuole Documenti, controlla
     con `[Environment]::GetFolderPath('MyDocuments')` in PowerShell che non sia dentro OneDrive. macOS: evita
     `~/Documents` e `~/Desktop` se è attiva la sincronizzazione di iCloud per Scrivania e Documenti.
   - **D.** Una cartella dentro la parte dell'archivio che il suo programma tiene sul computer (con Drive per desktop
     su Windows di solito una lettera come `G:\Il mio Drive\Cervello`, su macOS una cartella sotto
     `~/Library/CloudStorage/`; con OneDrive `~/OneDrive/Cervello`). Chiedi alla persona di rendere quella cartella
     «disponibile offline» (Drive per desktop), «mantieni sempre su questo dispositivo» (OneDrive), «Rendi disponibile
     offline» (Dropbox) o «Mantieni scaricato» (iCloud) *(da confermare per Dropbox e iCloud)*, e di non aprirla da un
     secondo computer.
   - **C.** Nessuna cartella sul computer: la persona crea su https://github.com un repository nuovo, **Private**, vuoto
     oppure con il solo README (se c'è, lo sposti alla fase 2, punto 1), e apre una sessione di un agente nel cloud su
     quel repository (la voce «Strada C» della scheda della sua piattaforma dice quali agenti nel cloud lo permettono;
     dove si apre la sessione lo dicono le pagine ufficiali linkate nella scheda). Lì scrive: «Leggi INSTALLA.md
     del kit secondo cervello e riprendi dalla fase 2, strada C», con l'indirizzo del kit. Da lì continua l'agente di
     quella sessione.
   - **Ovunque:** con Git, `git -C <cartella genitore> rev-parse --show-toplevel` deve dare errore (nessun repository
     sopra), tranne nella strada C, dove il repository è proprio quello del cervello.

## Fase 2: il cervello e l'intervista

1. Copia la cartella `modello` del kit, intera, nel posto scelto:
   - Windows, in PowerShell: `Copy-Item -Recurse "$HOME\kit-secondo-cervello\modello" "$HOME\Cervello"`
   - macOS e Linux: `cp -R ~/kit-secondo-cervello/modello ~/Cervello`
   Controlla che siano arrivati anche i file nascosti: `.claude`, `.claude-plugin`, `.github`, `.raw`, `.gitignore`,
   `.gitattributes`.
   **Strada C:** il kit sta nella cartella temporanea della fase 1, fuori dal repository (se non c'è:
   `git clone <indirizzo del kit> /tmp/kit-secondo-cervello`, o dove la piattaforma lo permette); copia il
   **contenuto** di `modello/`, file nascosti compresi, nella radice del repository del cervello
   (`cp -R /tmp/kit-secondo-cervello/modello/. .`). Se il
   repository è nato con un README, spostalo: `mkdir -p _da_eliminare`, poi `git mv README.md _da_eliminare/README.md`
   (altrimenti il controllo j dà giallo). Poi salva e carica subito, prima dell'intervista: `git add -A`,
   `node bin/controlla.mjs` (il controllo e deve essere verde), `git commit -m "Copia del modello"` e `git push` sul
   ramo che la piattaforma usa. La sessione nel cloud lavora su una copia temporanea: se cade, si perde tutto ciò che
   non è stato caricato. Se il caricamento è rifiutato per i file di `.github/workflows/` (l'accesso della piattaforma
   non ha quel permesso), sposta il file fuori dalla cartella dei flussi (`git mv .github/workflows/controllo.yml
   _da_eliminare/controllo.yml`), salva e carica il resto; poi la persona, dal sito di GitHub, crea
   `.github/workflows/controllo.yml` con «Add file» e ci incolla il contenuto di quel file. Se la sessione cade e la
   piattaforma salva su un ramo separato, una sessione nuova parte da `main` e non vede il lavoro: la persona unisce
   prima il ramo su GitHub, oppure apre la sessione nuova su quel ramo, e scrive «riprendi dalla fase 2, strada C».
2. Le istruzioni del cervello (`AGENTS.md`, e in Claude Code `CLAUDE.md` che lo importa) e gli hook di Claude Code
   partono solo da una sessione aperta **dentro** la cartella del cervello. Se tu sei stato aperto altrove, dillo alla
   persona e chiedile di aprire una sessione nuova nella cartella del cervello (in Claude Code: `cd ~/Cervello`, poi
   `claude`, e alla prima domanda accettare la cartella come attendibile) e di scrivere lì: «Leggi
   ~/kit-secondo-cervello/INSTALLA.md e riprendi dalla fase 2, punto 3». Lì ti fermi.
   **Strada C:** sei già nel repository, ma la sessione è nata quando il repository era vuoto: le istruzioni del
   cervello e gli hook non sono partiti. Leggi tu `AGENTS.md` e seguilo fino alla fine dell'installazione. Quando il
   primo salvataggio è su `main` (unito dalla persona, se la piattaforma usa un ramo separato: fase 3), la persona apre
   una sessione nuova sul repository: da lì partono le istruzioni e, se la piattaforma li esegue, gli hook.
3. L'intervista: segui il prompt A di `PROMPT-DI-AVVIO.md` (nella cartella del kit) come se la persona te l'avesse
   incollato, dal blocco «PRIMA DI TUTTO» fino al punto 3 di «QUANDO L'INTERVISTA È FINITA» compreso. I suoi punti
   dal 4 al 7 li sostituiscono le fasi 3 e 6 di questo file. **Strada C:** dopo ogni blocco dell'intervista, oltre a
   scrivere nei file, salvi e carichi (`git add -A`, `git commit -m "Intervista: <blocco>"`, `git push` sul ramo che
   la piattaforma usa), così una sessione che cade non perde il lavoro.
4. Se la persona ha già un archivio di note (un vault di Obsidian, una cartella di appunti, un'esportazione), non
   lo copi dentro: finita l'intervista, proponi di portarlo dentro in una sessione a parte con il prompt C.
5. Controlla che in `wiki/meta/mappa-del-cervello.md`, sezione «Dove vive il cervello», ci sia la strada scelta alla
   fase 1 (A, B, C o D; la scrive il punto 3 di «PRIMA DI TUTTO» del prompt A), con la data, dove sta la copia su cui
   si scrive e le conseguenze che la persona ha accettato. Con la strada D aggiungi lì anche il computer
   che scrive (l'unico) e che gli altri dispositivi leggono soltanto.

Verifica: `node bin/costruisci.mjs --verifica` esce senza segnalazioni; `node bin/controlla.mjs` dà zero rossi. I
gialli normali a questo punto sono i battiti «non ancora partiti» e i segnaposto del livello 3.

## Fase 3: Git e la prima prova (livelli 2 e 3)

Prima la tua strada:
- **A e B:** tutta la fase, come è scritta.
- **C:** togli la riga `sincronizza` dalla tabella «Battiti» di `automazioni/LEGGIMI.md` (qui la sincronizzazione non
  gira mai). Al posto del punto 1 salvi e carichi dal repository: `git add -A`, `node bin/controlla.mjs` (il controllo
  e deve essere verde), `git commit -m "Nascita del secondo cervello"`, `git push` sul ramo che la piattaforma usa. Se
  è un ramo separato, la persona lo unisce su GitHub («Pull requests», «Merge»). Poi la persona apre una sessione
  nuova sul repository, dove partono le istruzioni: lì fa la prima prova del punto 2, con l'ingestione su un testo
  incollato in chat invece che su un file in `.raw/` (un file lì non resta da una sessione all'altra). Il punto 3 vale
  solo se la piattaforma esegue gli hook; i punti 4 e 5 non ti riguardano. Poi vai alla fase 4, dal 4.5.
- **D:** niente Git: salti il punto 1 e togli le righe `sincronizza` e `custode` dalla tabella «Battiti» di
  `automazioni/LEGGIMI.md` (senza GitHub non partiranno mai). Al punto 5 la copia fuori dal computer c'è già
  (l'archivio), ma la storia è corta: proponi comunque il backup del sistema. Poi vai alla fase 6.

1. Dalla cartella del cervello, con il sì della persona:
   ```
   git init -b main
   git config user.name "<nome della persona>"
   git config user.email "<indirizzo della persona>"
   node bin/controlla.mjs
   node bin/sincronizza.mjs
   ```
   Nome e indirizzo chiedili alla persona; se non vuole il suo indirizzo nella storia, GitHub gliene dà uno privato
   nelle impostazioni delle email. Il controllo e (segreti) deve essere verde prima del salvataggio.
   `node bin/sincronizza.mjs` fa il primo salvataggio e scrive «nessun remoto configurato: solo salvataggio locale».
   Con un Git che non accetta `-b`: `git init`, e dopo il primo salvataggio `git branch -M main`.
2. La prima prova la fa la persona, in una sessione nuova nella cartella del cervello: le sei prove della tabella del
   capitolo 3.5 della guida (avvio, chi sei, ingestione, regola nuova, chiusura, controllo). Spiegale quali sono e
   cosa deve vedere.
3. Con Claude Code, prova gli hook a mano (da un terminale Bash; su Windows Git Bash):
   ```
   echo '{"source":"startup"}' | node bin/hooks/avvio.mjs
   echo '{"tool_name":"Bash","tool_input":{"command":"printenv"}}' | node bin/hooks/proteggi.mjs
   ```
   Il primo risponde con lo stato del cervello, il secondo con un diniego.
4. Obsidian, se la persona lo vuole: le tre impostazioni del capitolo 3.7 della guida, da fare lei.
5. Se ci si ferma al livello 2, proponi una copia fuori dal computer: un repository privato su GitHub con le fasi 4.1,
   4.2 e 4.3 senza la pianificazione, oppure il backup del sistema su un disco esterno (riquadro «Copia di sicurezza»
   del capitolo 3.2). Poi vai alla fase 6.

## Fase 4: il sistema completo (livello 3)

Un pezzo alla volta, nell'ordine; ognuno si prova prima del successivo. I dettagli per la persona stanno nel
capitolo 4 della guida.

Strade: la fase 4 è della B, e della C dal punto 4.5 (senza computer non ci sono accesso da terminale, primo
caricamento, sincronizzazione e cartella delle chiavi: 4.1-4.4 e 4.9 non ti riguardano). Nella C il Telegram del 4.6
chiede un computer una volta, per trovare il numero della chat; se non c'è, restano le mail di GitHub. Con la strada
D la fase 4 non si fa: vive tutta su GitHub. Per passare dalla D alla B: la cartella si copia fuori dall'archivio, si
lavora solo sulla copia nuova, la vecchia si sposta in una cartella d'archivio dove nessuno la modifica più, poi la
fase 3 e questa.

**4.1 Accesso a GitHub.** La persona ha un account su https://github.com con l'accesso in due passaggi attivo e i
codici di recupero conservati fuori dal computer. Poi lancia lei (il login si completa nel browser):
```
gh auth login
gh auth setup-git
gh auth status
```
In `gh auth login`: GitHub.com, HTTPS, accesso dal browser. `gh auth setup-git` fa usare a Git lo stesso accesso: la
sincronizzazione gira nascosta e non può chiedere password.

**4.2 Il repository privato, vuoto.** Con il sì della persona (il nome lo sceglie lei):
```
gh repo create <nome> --private
git remote add origin https://github.com/<utente>/<nome>.git
gh repo view <utente>/<nome> --json visibility
```
L'ultimo comando deve dire `PRIVATE`. Il repository nasce vuoto, senza README: il primo caricamento lo fa la
sincronizzazione.

**4.3 Il primo caricamento.**
```
node bin/sincronizza.mjs --prova
node bin/sincronizza.mjs
node bin/sincronizza.mjs --stato
```
Il giro vero scrive «primo caricamento del ramo main sul remoto». Se scrive «FERMO», la tabella del capitolo 4.2 della
guida dice cosa fare.

**4.4 La sincronizzazione ogni 10 minuti.**
```
node bin/installa-sincronizzazione.mjs
node bin/installa-sincronizzazione.mjs --fai
```
Il primo mostra cosa farebbe, il secondo (dopo il sì) lo fa, senza diritti di amministratore. Dopo una ventina di
minuti `node bin/sincronizza.mjs --stato` deve mostrare giri recenti. Su un secondo computer della persona, dopo il
clone, `node bin/sincronizza.mjs --secondario` (capitolo 4.8).

**4.5 Il controllo quotidiano su GitHub.** Il flusso `.github/workflows/controllo.yml` è già nel repository.
```
gh workflow list
gh workflow run controllo.yml
gh run list --workflow controllo.yml --limit 1
```
L'ultimo giro deve finire con successo (`gh run watch` lo segue). Se il passo che salva lo stato fallisce per un
permesso, la persona sceglie lettura e scrittura in «Settings», «Actions», «General», «Workflow permissions» del
repository. Chiedile di controllare che le mail dei flussi falliti siano attive nelle notifiche del suo account.
**Strada C:** se nella sessione nel cloud `gh` non c'è (o non ha l'accesso), la persona fa gli stessi passi dal sito:
la scheda «Actions» del repository, «Controllo del cervello», «Run workflow», poi l'esito dell'ultimo giro.

**4.6 Telegram, facoltativo ma consigliato.** Lo fa la persona, tu la guidi:
1. su Telegram apre BotFather, scrive `/newbot` e riceve il token del bot;
2. lo salva lei, con un editor di testo, nel file `telegram-token.txt` della cartella privata delle chiavi (4.9);
3. scrive un messaggio qualunque al suo bot; poi tu lanci `node bin/avvisa.mjs --trova-chat`, che stampa il numero
   della chat, e lei lo salva in `telegram-chat.txt` nella stessa cartella;
4. mette i due valori nei segreti del repository, dal suo terminale (tu non leggi quei file):
   - macOS e Linux: `gh secret set TELEGRAM_BOT_TOKEN < ~/Cervello-Privato/chiavi/telegram-token.txt` e
     `gh secret set TELEGRAM_CHAT_ID < ~/Cervello-Privato/chiavi/telegram-chat.txt`;
   - Windows, in PowerShell: `Get-Content "$HOME\Cervello-Privato\chiavi\telegram-token.txt" -Raw | gh secret set TELEGRAM_BOT_TOKEN`
     e lo stesso con `telegram-chat.txt` e `TELEGRAM_CHAT_ID`;
   - oppure da GitHub: «Settings», «Secrets and variables», «Actions», «New repository secret».

Verifica: `node bin/avvisa.mjs --verifica`, poi `node bin/avvisa.mjs "prova"`; `gh workflow run controllo.yml` deve
far arrivare la riga di riepilogo sul telefono.

**4.7 Il Custode, la routine serale.** Serve una piattaforma con routine nel cloud che lavorano su un repository Git
(la scheda in `piattaforme/` dice quale). Segui il capitolo 4.6 della guida: compila i segnaposto di
`automazioni/routine/routine-custode.md` (il nome e l'account che ospita la routine) e di `automazioni/custode.md` (la
casella cloud delle note, oppure «nessuna»); la routine si crea su **un account solo**, con il repository collegato,
senza chiavi, alle 21:30 dell'ora locale e in `MODALITA: rapporto`. Se la tua sessione ha lo strumento delle routine,
la crei con `/allinea-routine` dopo il sì della persona; altrimenti la crea lei dalla pagina delle routine della
piattaforma, incollando il blocco «Prompt» del file. Poi l'id nel file e in `wiki/meta/id-sistemi-esterni.md`,
`stato: accesa`, la riga in `automazioni/LEGGIMI.md` e in `wiki/meta/mappa-del-cervello.md`. Il passaggio a
`MODALITA: azione` lo decide la persona dopo qualche sera di resoconti giusti.

**4.8 Il plugin per le chat di Claude**, solo se la persona usa le chat di claude.ai. Tu compili i segnaposto del
capitolo 4.7 della guida (`plugin.json`, `SKILL.md`, `README.md` del plugin, `marketplace.proprietario` in
`bin/impostazioni.json`), poi `node bin/costruisci.mjs` e il salvataggio: con Git sul computer (strada B)
`node bin/sincronizza.mjs`; con un agente nel cloud sul repository (strada C) `git add -A`, commit e push sul ramo che
la piattaforma usa, mai `node bin/sincronizza.mjs`. Gli altri passi sono nelle impostazioni dell'account e li fa
lei: collegare GitHub e installare l'app GitHub di Claude sul repository, attivare
l'esecuzione del codice, aggiungere il marketplace `<utente>/<nome>` con la sincronizzazione automatica, installare il
plugin «cervello», una riga nelle istruzioni personali. I nomi verificati dei menu sono in `piattaforme/claude.md`.

**4.9 La cartella privata delle chiavi.** Con il sì della persona crea `~/Cervello-Privato/chiavi`, fuori dal
cervello e fuori da ogni cartella sincronizzata (un'altra posizione si scrive in `chiavi.cartella` di
`bin/impostazioni.json`). I file con le chiavi li scrive lei. Verifica senza vedere i valori:
`node bin/lib/chiavi.mjs --verifica`.

**4.10 Facoltativo, solo con Claude Code.** Il file personale `~/.claude/CLAUDE.md` con la regola d'ambito e
l'import del nucleo, e la lingua in `~/.claude/settings.json` (capitolo 4.11 della guida). Non su un utente del
computer usato anche da altri.

## Fase 5: solo chat (livello 1)

1. Fatta l'intervista della fase 2 (basta il prompt A fino al punto 3 di «QUANDO L'INTERVISTA È FINITA»), lancia
   `node bin/costruisci.mjs --esporta`. Lo script scrive la cartella `esporta/` e avvisa se restano segnaposto o se
   le istruzioni superano il limite.
2. Spiega alla persona cosa caricare e dove (capitolo 5.3 della guida): un progetto nuovo nella sua AI; tutto il
   testo di `esporta/istruzioni-chat.md` nelle istruzioni del progetto; i file `esporta/conoscenza-*.md` come file del
   progetto; `esporta/istruzioni-brevi.md` nelle istruzioni personali, se vuole le regole anche fuori dal progetto.
   I limiti della sua piattaforma stanno nella scheda in `piattaforme/`.
3. Spiega la nota per il cervello: quando nasce un fatto da ricordare la chat la scrive alla fine della risposta, e
   lei la salva in `.raw/inbox/` con il nome `AAAA-MM-GG-<tema>.md`. Si integra a mano o con il prompt D.
4. Quando ricaricare: dopo una regola nuova, dopo note integrate, comunque ogni due settimane, sostituendo anche le
   istruzioni del progetto (capitolo 5.5).
5. Se Node non si può installare: il prompt B di `PROMPT-DI-AVVIO.md`, con il suo ramo «se Node non c'è».

## Fase 6: verifica finale e resoconto

1. Lancia `node bin/controlla.mjs` e `node bin/costruisci.mjs --verifica`; al livello 3 anche
   `node bin/sincronizza.mjs --stato` (non nella strada C) e `gh run list --workflow controllo.yml --limit 3`.
2. Ripassa con la persona la lista del capitolo 15 della guida («Prova finale») per il suo livello, saltando le voci
   che la sua strada non ha: ogni voce vera o da sistemare.
3. Chiudi la sessione come dice `AGENTS.md` (in Claude Code `/chiudi`): voce in hot, voce nel log con la versione del
   kit scritta in `LEGGIMI.md` del kit.
4. Dai alla persona un resoconto di massimo quindici righe:
   - il livello raggiunto, la strada scelta (A, B, C o D) e dove sta il cervello, con le conseguenze della strada in
     una riga;
   - cosa è acceso: sincronizzazione, controllo quotidiano, Telegram, Custode, plugin;
   - cosa resta da fare, da chi e quando, e i gialli rimasti con il perché;
   - le tre abitudini: chiudere ogni sessione, guardare i rossi, una volta a settimana il prompt D se il Custode non
     c'è;
   - che la cartella del kit resta sul computer per gli aggiornamenti (capitolo 14.6 della guida), ma non ci si lavora
     dentro.

## Se qualcosa va storto

| Cosa vedi | Cosa fare |
|---|---|
| `node` o `git` non trovati subito dopo l'installazione | chiudere e riaprire il terminale o la sessione: il sistema aggiorna l'elenco dei programmi solo nei terminali nuovi |
| `winget` non esiste (Windows) | installare «Programma di installazione app» dal Microsoft Store, oppure usare l'installatore dal sito del programma |
| `git init -b main` rifiutato | `git init`, poi dopo il primo salvataggio `git branch -M main` |
| la cartella scelta sta dentro un altro repository, o in una cartella sincronizzata senza che la persona abbia scelto la strada D | sceglierne un'altra (fase 1, punto 6) e ricopiare il modello lì |
| strada D: compaiono copie in conflitto, con «(1)», «(2)», il nome del computer o «conflicted copy» nel nome | c'è stato un secondo scrittore (un altro computer, il sito dell'archivio, una chat): il controllo k trova i nomi tipici delle copie in conflitto, non per forza tutte; porta il contenuto nel file vero, sposta il doppione in `_da_eliminare/`, poi resta un solo scrittore |
| strada D: l'agente non trova file o li legge vecchi | i file stanno solo online: rendere la cartella «disponibile offline» (Drive per desktop), «mantieni sempre su questo dispositivo» (OneDrive), «Rendi disponibile offline» (Dropbox) o «Mantieni scaricato» (iCloud) *(da confermare per Dropbox e iCloud)* |
| strada C: il caricamento è rifiutato | due cause possibili: la piattaforma salva su un ramo separato (la persona apre la richiesta di unione su GitHub e la unisce), oppure l'accesso della piattaforma non ha il permesso di caricare i file di `.github/workflows/` (il rimedio è nella fase 2, punto 1, strada C) |
| `node bin/costruisci.mjs` si ferma | il messaggio dice quale pagina e cosa correggere: correggi e rilancia |
| `node bin/controlla.mjs` dà un rosso | il rapporto dice file e riga; correggi e rilancia. Nessun valore segreto viene stampato |
| la sincronizzazione scrive «FERMO» | la tabella del capitolo 4.2 della guida, riga per riga |
| `gh auth login` chiede un codice | lo inserisce la persona nella pagina che si apre nel browser |
| il flusso su GitHub fallisce per un permesso | «Settings», «Actions», «General», «Workflow permissions»: lettura e scrittura |
| gli hook non partono | la cartella va accettata come attendibile; Node deve essere nel percorso dei programmi; la variabile `CERVELLO_HOOK` non deve valere `spenti` |
| il riepilogo su Telegram non arriva | i segreti `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` del repository; `node bin/avvisa.mjs --verifica` sul computer |
| tutto il resto | il capitolo 15 della guida, tabella «Se qualcosa non va» |
