# Prompt di avvio

Testi pronti da copiare e incollare nell'AI. Ogni prompt (il testo che dai all'AI per farle fare un lavoro) sta in un
riquadro: copia tutto il riquadro, dalla prima all'ultima riga. Dove trovi una parte tra parentesi angolari, per
esempio `<percorso dell'archivio>`, sostituiscila con il tuo dato prima di incollare.

| Prompt | Quando | Dove si usa | Livello |
|---|---|---|---|
| A. Costruisci il cervello con me | la prima volta, con un agente che lavora nella cartella | Claude Code, Codex, Cursor, Antigravity, Devin Desktop | 2 |
| B. Costruisci il cervello solo in chat | la prima volta, se hai solo una chat | qualunque chat | 1 |
| C. Porta dentro un archivio che ho già | hai appunti, esportazioni di note, un vecchio vault, documenti | agente con cartella | 2 |
| D. Manutenzione settimanale a mano | non hai la routine Custode | agente con cartella | 2 |
| E. Nota per il cervello da una chat esterna | in una chat che non vede la cartella | qualunque chat | 1 |
| F. Nuova regola da una correzione che ripeto | correggi l'AI per la seconda volta sulla stessa cosa | agente con cartella, oppure chat | 1 e 2 |

I livelli sono quelli di `LEGGIMI.md` e del capitolo 2 della guida: **1, solo chat** (il cervello arriva alla chat
come file caricati, preparati da `node bin/costruisci.mjs --esporta`; la chat legge e ti dà una nota per il cervello
che salvi tu); **2, agente con cartella** (un'AI che lavora sui file del tuo computer legge `AGENTS.md`, scrive le
pagine e lancia gli script); **3, sistema completo** (repository privato su GitHub, sincronizzazione, controllo
quotidiano, routine Custode e plugin per le chat, che ha bisogno del repository).

Cosa si può fare su ciascuna piattaforma, e fino a quale livello: le schede nella cartella `piattaforme/`.

## A. Costruisci il cervello con me

Quando: la prima volta, con un agente che lavora nella cartella. Prima copia la cartella `modello/` del kit dove vuoi
tenere il cervello, fuori da Drive, OneDrive o Dropbox, dalle un nome (per esempio `Secondo-cervello`) e apri l'agente
lì dentro; in Claude Code, alla prima apertura, accetta la cartella come attendibile. Si può fare in più volte: alla
ripresa incolla di nuovo il prompt e l'agente riparte dai segnaposto rimasti.

```text
Costruiamo insieme il mio secondo cervello in questa cartella. È una cartella di file markdown che tu leggi e aggiorni: regole, persone, aziende, progetti, fonti. Parlami in italiano semplice; quando usi una parola tecnica inglese, spiegala tra parentesi la prima volta.

PRIMA DI TUTTO
1. Leggi AGENTS.md (in Claude Code arriva da CLAUDE.md), wiki/meta/strumenti.md, wiki/hot.md, wiki/index.md e i modelli in _modelli/. Non chiedermi il permesso di leggerli.
2. Controlla con node --version e git --version se ci sono Node (versione 18 o più recente) e Git. Se manca Node, dimmi in due righe come installarlo e intanto vai avanti con l'intervista: gli script li lanciamo dopo. Se manca Git va bene lo stesso: il salvataggio lo facciamo più avanti. Se c'è Git e git rev-parse --show-toplevel dice che questa cartella sta dentro un altro repository, fermati e dimmelo.
3. Lancia node bin/controlla.mjs: il controllo n elenca, file per file, i segnaposto {{DA COMPILARE: ...}}. È la lista di ciò che dobbiamo riempire.
4. Dimmi in cinque righe cosa hai trovato e come procediamo.

L'INTERVISTA
Fammi le domande un blocco alla volta, al massimo cinque domande brevi per blocco, ognuna con un esempio di risposta. Aspetta le mie risposte. Se dico «salta» o «non so», metti la domanda in wiki/hot.md, sezione «Aperti (da chiarire)», e vai avanti. Dopo ogni blocco scrivi subito nei file e dimmi in tre righe cosa hai scritto e dove.

1. Chi sono e cosa faccio: nome, lavoro, per chi lavoro, cosa voglio che il cervello mi aiuti a fare.
   Va in: AGENTS.md, sezione «Chi»; bin/impostazioni.json, voci «persona» e «marketplace.proprietario»; wiki/concepts/ambito.md, sezione «Regola d'ambito»; automazioni/plugin-cervello/.claude-plugin/plugin.json, voce «author»; i segnaposto del nome nella descrizione e nel testo di automazioni/plugin-cervello/skills/cervello/SKILL.md, in automazioni/routine/routine-custode.md e in wiki/hot.md; il motivo per cui creo il cervello va nella prima voce di wiki/log.md.
2. Aziende, clienti e progetti: quali sono, cosa fanno, a che punto siamo.
   Va in: una pagina per ciascuno in wiki/entities/aziende/ (modello _modelli/azienda.md; type «cliente» per un cliente, status «prospect» finché non c'è un accordo) e in wiki/entities/progetti/ (modello _modelli/progetto.md).
3. Le persone con cui lavoro: solo ruolo e rapporto, niente recapiti né altri dati personali.
   Va in: wiki/entities/persone/ (modello _modelli/persona.md), con i link alle loro aziende e ai progetti.
4. Gli strumenti e i servizi che uso (posta, archivi nel cloud, gestionale, negozio online, calendario, altre AI) e dove stanno i miei documenti.
   Va in: wiki/meta/mappa-del-cervello.md (compila le righe che valgono; lascia come sono le righe del plugin, della routine Custode e del repository, che servono al livello 3; togli solo le righe d'esempio che non mi riguarderanno mai); wiki/meta/id-sistemi-esterni.md (a quale account deve essere collegato ogni connettore, cioè ogni collegamento tra un'AI e un servizio); le sigle e i nomi propri in wiki/meta/glossario.md.
5. I contesti da non mescolare: un secondo lavoro, i clienti di un'altra persona, la vita privata.
   Va in: il terzo segnaposto della «Regola d'ambito» in wiki/concepts/ambito.md e l'ultimo segnaposto della descrizione in SKILL.md. Se non ce ne sono, togli la frase come dice il segnaposto.
6. Cosa non devi mai fare.
   Ogni divieto che vale sempre diventa una pagina regola in wiki/concepts/ dal modello _modelli/regola.md. Prima controlla con node bin/costruisci.mjs --elenco che non esista già una regola sullo stesso tema: in quel caso si cambia quella.
7. Come voglio che scrivi e le correzioni che ti faccio sempre.
   Va in: wiki/concepts/come-scrivere-per-me.md (lingua, tono, tabella No/Sì con i miei esempi veri al posto dei due esempi). La lingua scritta lì vale anche per le routine, il cui prompt rimanda a questa pagina; la voce «lingua» di bin/impostazioni.json è solo un'annotazione, che nessuno script legge.
8. I lavori delicati: quelli prima dei quali bisogna aprire una pagina o controllare una fonte (un preventivo, una mail a un cliente, un post pubblico).
   Va in: AGENTS.md, sezione «Seconda azione», una riga per lavoro con le pagine da aprire prima.
9. Cosa vorrei che facessi da solo ogni giorno o ogni settimana.
   Non creare routine adesso: scrivi le idee in wiki/hot.md, sezione «Aperti (da chiarire)», come proposte per il livello 3. Chiedimi anche se ho una cartella nel cloud dove le chat possono lasciarmi note: va nel segnaposto di automazioni/custode.md (se non c'è, «nessuna»).
10. I dati sensibili da tenere fuori: cosa non deve mai entrare nel cervello.
    Va in: wiki/concepts/ambito.md, sezione «La regola», nell'elenco di ciò che non entra mai. Una pagina che non deve uscire dal computer prende riservato: true nel frontmatter (le righe tra --- in cima alla pagina). Se ti do una password o una chiave, non scriverla da nessuna parte: dimmi che va nella cartella privata delle chiavi indicata in bin/impostazioni.json.

COME SCRIVI
- Scrivi solo ciò che ti ho detto; ciò che non è certo lo marchi *(da verificare)*. Niente conoscenza generica per riempire le pagine.
- Ogni pagina nuova nasce dal suo modello in _modelli/, con la data di oggi al posto di AAAA-MM-GG, e ha la sua riga in wiki/index.md, nella sezione giusta.
- Le righe d'esempio che non valgono si tolgono: il testo *(esempio)* non resta.
- Se una regola vale solo per un tipo di lavoro, le dai un ambito nuovo e lo aggiungi all'elenco «ambiti» di bin/impostazioni.json con il suo titolo.
- Non toccare wiki/meta/nucleo.md né il testo tra <!-- genera: ... --> e <!-- fine: ... --> in AGENTS.md e in SKILL.md: li riscrive lo script, anche i segnaposto che contengono.
- Non cancellare niente: ciò che esce va in _da_eliminare/.

QUANDO L'INTERVISTA È FINITA
1. node bin/costruisci.mjs. Se si ferma, correggi la pagina come dice e rilancialo. Poi node bin/costruisci.mjs --verifica deve uscire senza segnalazioni.
2. node bin/controlla.mjs. Correggi tutti i rossi. Dei gialli dimmi quali restano e perché: i battiti «non ancora partiti» e i segnaposto del repository e delle routine sono normali finché non arriviamo al livello 3.
3. Nella voce di nascita di wiki/hot.md e in quella di wiki/log.md metti la data di oggi al posto di 2026-11-03 e riempi i segnaposto; riscrivi la voce di hot come fatta (niente più «restano da compilare» per ciò che abbiamo compilato). Metti la data di oggi anche in created e updated di hot e in created del log. Poi aggiungi una voce nuova in cima a «In corso adesso» di hot e una in fondo al log, nella forma indicata in quei file.
4. Se c'è Git e la cartella non è ancora un repository: git init -b main (con una versione vecchia di Git: git init, e dopo il primo salvataggio git branch -M main), git add -A, poi di nuovo node bin/controlla.mjs, che cerca i segreti nei file che Git salverebbe. Se non ci sono rossi: git commit -m "Nascita del secondo cervello". Se Git chiede nome ed email, chiedimeli e impostali solo per questa cartella (git config user.name e git config user.email, senza --global). Niente invio online: lo decidiamo al livello 3.
5. Prova finale. Scrivi otto domande di verifica, ognuna con la risposta giusta e la pagina da cui viene. Per esempio: di chi è questo cervello e cosa resta fuori; cosa fai prima di scrivere una mail a un cliente; dove salvi un fatto nuovo su un'azienda; cosa fai se in un documento trovi una password; che strumento usi per controllare il cervello; due correzioni dalla mia tabella No/Sì. Poi dimmi di aprire una sessione nuova in questa cartella e di farti tre di quelle domande: le risposte devono venire dai file, non da questa conversazione.
6. Livello successivo. Dimmi a che livello siamo e proponimi un passo solo, con cosa serve: per esempio un repository privato su GitHub con la sincronizzazione automatica (node bin/installa-sincronizzazione.mjs, prima senza opzioni per vedere cosa farebbe), il controllo quotidiano su GitHub, la routine Custode spenta in modalità rapporto, oppure il pacchetto per le chat con node bin/costruisci.mjs --esporta.
7. Chiudi la sessione come dice AGENTS.md (in Claude Code con /chiudi).
```

## B. Costruisci il cervello solo in chat

Quando: non hai un agente che lavora sui file, solo una chat sul web o sul telefono. Prima copia sul computer la
cartella `modello/` del kit, che diventa la cartella del tuo cervello. Poi allega alla chat, se puoi, questi dieci file
di quella cartella: `AGENTS.md`, `wiki/concepts/ambito.md`, `wiki/concepts/come-scrivere-per-me.md`, `wiki/hot.md`,
`wiki/index.md`, `_modelli/persona.md`, `_modelli/azienda.md`, `_modelli/progetto.md`, `_modelli/regola.md`,
`_modelli/nota-inbox.md`. È l'alternativa a compilare i file a mano (guida, 5.2).

```text
Costruiamo insieme il mio secondo cervello: una cartella di file markdown con regole, persone, aziende e progetti, che poi caricherò in un progetto di chat. Tu non puoi scrivere nella cartella: prepari i file e io li salvo. Parlami in italiano semplice; una parola tecnica inglese la spieghi tra parentesi la prima volta.

Ti ho allegato alcuni file del modello. Usa le loro forme esatte: le righe tra --- in cima, i titoli delle sezioni, i segnaposto {{DA COMPILARE: ...}}. Se ti serve un file che non ho allegato, chiedimelo: non inventare la struttura.

1. L'INTERVISTA. Fammi le domande un blocco alla volta, al massimo cinque domande brevi per blocco, e aspetta le risposte. Se dico «salta», la domanda va tra gli aperti. I blocchi: chi sono e cosa faccio; aziende, clienti e progetti; le persone con cui lavoro (solo ruolo e rapporto, niente recapiti); gli strumenti e i servizi che uso e dove stanno i miei documenti; i contesti da non mescolare; cosa non devi mai fare; come voglio che scrivi e le correzioni che faccio sempre; i lavori delicati, prima dei quali bisogna aprire una pagina o una fonte; cosa vorrei che un'AI facesse da sola ogni giorno o ogni settimana; i dati sensibili da tenere fuori. Se ti do una password o una chiave, non scriverla in nessun file.

2. I FILE, UNO PER VOLTA. Dopo l'intervista prepara un file per messaggio, intero, in un blocco di testo; nella prima riga del messaggio scrivi il percorso dove salvarlo dentro la cartella (per esempio wiki/concepts/ambito.md). Aspetta che ti scriva «salvato» prima di passare al successivo. L'ordine:
   a. AGENTS.md: non riscrivere il file intero. Dammi solo il testo nuovo delle sezioni «Chi» e «Seconda azione, prima di un lavoro delicato», ognuna in un blocco a parte, e dimmi di incollarlo al posto del segnaposto della sezione;
   b. wiki/concepts/ambito.md: la sezione «Regola d'ambito» e, nella sezione «La regola», ciò che non entra mai;
   c. wiki/concepts/come-scrivere-per-me.md: lingua, tono e la tabella No/Sì con le mie correzioni vere al posto degli esempi;
   d. una pagina per ogni azienda, cliente, progetto e persona, dai modelli di _modelli/, nelle cartelle wiki/entities/aziende/, wiki/entities/progetti/ e wiki/entities/persone/;
   e. una pagina regola in wiki/concepts/ per ogni divieto che vale sempre, dal modello _modelli/regola.md;
   f. le righe da aggiungere a wiki/index.md (una per pagina nuova, nella sezione giusta) e la voce da mettere in cima a «In corso adesso» di wiki/hot.md;
   g. i valori di «persona» e di «marketplace.proprietario» per bin/impostazioni.json: dimmi solo quali righe cambiare.
   Scrivi solo ciò che ti ho detto; ciò che non è certo lo marchi *(da verificare)*. Metti la data di oggi al posto di AAAA-MM-GG.

3. COME LO CARICO IN UN PROGETTO. Alla fine spiegami in passi brevi:
   - se sul mio computer c'è Node (il programma che fa girare gli script del kit; si controlla scrivendo node --version in un terminale): dalla cartella del cervello lancio node bin/costruisci.mjs e poi node bin/costruisci.mjs --esporta; nel campo delle istruzioni del progetto incollo il contenuto di esporta/istruzioni-chat.md; tra i file del progetto carico i file esporta/conoscenza-*.md;
   - se Node non c'è: preparami tu, in due messaggi, (1) il testo per le istruzioni del progetto, sotto gli 8.000 caratteri, con chi sono, i lavori delicati della «Seconda azione», «all'inizio di ogni chat di' che lavori su una copia di sola lettura; prima di rispondere leggi il file conoscenza-01-inizio.md», le righe «In breve» delle regole raggruppate come nel nucleo e la regola della nota per il cervello scritta per intero (quando nasce un fatto da ricordare, alla fine della risposta: fuori dal blocco il nome AAAA-MM-GG-<tema>.md; nel blocco la forma esatta di _modelli/nota-inbox.md, con title, type, data, da e le tre sezioni); (2) un file conoscenza-01-inizio.md con hot, index, il modello _modelli/nota-inbox.md e le pagine nuove, ognuna introdotta da una riga ===== wiki/percorso.md =====. Dimmi che è una soluzione provvisoria, da sostituire con il pacchetto di --esporta appena ho Node;
   - in ogni caso: quando la chat mi dà una nota per il cervello, la salvo nella cartella .raw/inbox/ come AAAA-MM-GG-<tema>.md; quando cambio una regola, ricarico istruzioni e file.
   Per i passi precisi della mia piattaforma rimandami alla sua scheda nella cartella piattaforme/ del kit.
```

## C. Porta dentro un archivio che ho già

Quando: hai già appunti, un'esportazione di note (da un'app di note o da un'altra AI), una cartella di documenti, e
vuoi che il cervello ne contenga i fatti. Con un agente che lavora nella cartella del cervello; l'archivio può stare
fuori (ne indichi il percorso) o in una sottocartella di `.raw/`. Prima costruisci il cervello con il prompt A: la
regola d'ambito serve per decidere cosa entra. Se l'archivio è un vault di Obsidian o una cartella di note, non
copiarci dentro il modello: il cervello nasce in una cartella nuova e il vecchio archivio resta dov'è, anche se è in
una cartella sincronizzata, perché viene solo letto.

```text
Voglio portare nel mio secondo cervello un archivio che ho già: <percorso dell'archivio>. Si lavora in quattro fasi e non si passa alla successiva senza il mio sì. Prima leggi AGENTS.md, wiki/hot.md, wiki/index.md, wiki/concepts/ambito.md e automazioni/ingestione.md.

FASE 1, INVENTARIO, IN SOLA LETTURA. Non spostare, non modificare e non copiare niente. Guarda tutto l'archivio e dimmi: quanti file, di che tipo, quanto pesano, di che periodo; i temi principali; i soggetti che ricorrono (persone, aziende, clienti, progetti) e quali hanno già una pagina nel cervello; le istruzioni per un'AI che trovi (vecchi prompt, regole, memorie esportate); i doppioni e le versioni diverse dello stesso documento; i file che contengono password, chiavi o dati personali di altre persone (dimmi file e tipo, mai il valore); ciò che sembra vecchio o fuori dall'ambito del cervello. Se i file sono tanti, lavora a campioni per cartella e dimmi quanto hai letto davvero.

FASE 2, PROPOSTA. Una tabella: gruppo di file, quanti sono, cosa ne estrai, dove va nel cervello (pagina esistente da aggiornare o pagina nuova, con il modello di _modelli/), cosa resta fuori e perché. Poi le regole candidate, prese dalle istruzioni che hai trovato: non le copi, me le proponi. Poi le contraddizioni con ciò che il cervello dice già. Poi l'ordine delle mosse, dalla più utile, una mossa per gruppo.

FASE 3, DECISIONI. Al massimo dieci domande numerate, a cui rispondo sì o no. Aspetta le risposte.

FASE 4, UNA MOSSA PER VOLTA. Ogni mossa segue automazioni/ingestione.md, con il registro automazioni/registro-archivio.md (lo crei alla prima mossa nella forma che la procedura indica), così possiamo riprendere in un'altra sessione.
- Estrai, non caricare: dai documenti estrai i fatti in pagine fonte in wiki/sources/, con il campo «originale» che dice dove sta il file. Gli originali restano dove sono; dei testi lunghi entra la sintesi.
- Un soggetto, una pagina: prima cerchi se esiste (anche con le varianti del nome), poi aggiorni quella o ne crei una dal modello. Link nei due sensi.
- Mai due file con lo stesso nome nel cervello: se una nota dell'archivio si chiama come una pagina che c'è già, scegli un altro nome.
- Ciò che non è certo lo marchi *(da verificare)*; le contraddizioni le segnali con > [!contradiction] e non le risolvi.
- Niente password, chiavi o dati personali di altre persone: al massimo dove stanno.
- Le regole entrano solo come pagine regola, con il mio sì, come dice .claude/commands/nuova-regola.md.
- Alla fine di ogni mossa: righe nuove in wiki/index.md, una voce in hot e una nel log, node bin/costruisci.mjs se hai toccato una regola, node bin/controlla.mjs con i rossi corretti, e il salvataggio (se c'è la sincronizzazione, node bin/sincronizza.mjs; se c'è Git senza sincronizzazione, un salvataggio a mano con un messaggio che dice la mossa).
Dopo la prima mossa fermati e mostrami il risultato. Se il formato va bene, continua una mossa dopo l'altra e fermati solo quando serve una decisione nuova. Alla fine fai fare una lettura indipendente del risultato (in Claude Code all'agente verificatore) e chiudi con il resoconto: cosa è entrato, cosa è rimasto fuori, cosa resta da decidere.

Non cancellare niente, né nell'archivio né nel cervello: ciò che esce dal cervello va in _da_eliminare/.
```

## D. Manutenzione settimanale a mano

Quando: non hai ancora la routine Custode (livello 3) e vuoi tenere in ordine il cervello. Una volta a settimana, con
un agente nella cartella. Fa a mano il lavoro della procedura `automazioni/custode.md`.

```text
Fai la manutenzione settimanale del mio secondo cervello: il lavoro del Custode, fatto a mano. Leggi AGENTS.md, poi apri automazioni/custode.md e fai i suoi compiti come con MODALITA: azione, con queste differenze.
- Lavori nella cartella, non su un clone del repository: l'avvio e il salvataggio di automazioni/_comune.md non valgono. All'inizio, se c'è la sincronizzazione, lancia node bin/sincronizza.mjs --stato e dimmi se è in pausa, ferma o con un conflitto aperto. Alla fine, se c'è Git, salva con node bin/sincronizza.mjs (salva anche senza repository online) e dimmi la riga che stampa; senza Node, a mano: git add -A, git commit e, solo se git remote elenca origin, git pull --rebase origin main e git push origin main; senza Git, niente.
- Compito 1, le note per il cervello: prima chiedimi se ho note salvate altrove (sul telefono, nella casella cloud) da mettere in .raw/inbox/; poi integra quelle che ci sono.
- Compito 3, i rami di conflitto: solo se c'è un repository online. Se due versioni dello stesso testo si scontrano, prima di scegliere mostrami le due versioni.
- Compito 5, le fonti di .raw/: qui, sul computer, le fonti le vedi (non vanno su Git). A ogni manutenzione fanne entrare fino a cinque, le più vecchie per prime, seguendo automazioni/ingestione.md.
In più:
- node bin/costruisci.mjs --verifica e, se esce con 1, node bin/costruisci.mjs;
- node bin/controlla.mjs (con --scrivi solo se il cervello non ha un repository online: con il repository la pagina di stato la scrive GitHub): correggi i rossi; dei gialli correggi quelli semplici (link rotti, frontmatter, doppioni) e dimmi gli altri;
- rileggi la sezione «Aperti (da chiarire)» di wiki/hot.md e dimmi quali si possono chiudere;
- battito: se la riga «custode» della tabella «Battiti» in automazioni/LEGGIMI.md dice ancora «ogni giorno», chiedimi se cambiarla in «settimanale», con «manutenzione a mano» come chi lo scrive. Se dice «settimanale», a fine lavoro scrivi automazioni/battiti/custode.txt come dice automazioni/_comune.md: così il controllo mi avvisa se salto una settimana.
Chiudi con un resoconto di massimo dieci righe (in cima ciò che richiede me, in ordine di urgenza) e con una voce in fondo a wiki/log.md, titolo «## AAAA-MM-GG. Custode (a mano)».
```

## E. Nota per il cervello da una chat esterna

Quando: in una chat che non vede la cartella e non ha il pacchetto del cervello (il pacchetto di `--esporta` contiene
già questa istruzione). Incolla E1 all'inizio della chat, oppure nelle istruzioni personalizzate della piattaforma;
se te ne dimentichi, a fine chat incolla E2. La nota che ricevi la salvi nella cartella `.raw/inbox/` del cervello: la
integra il Custode, o la prossima sessione con la cartella.

E1, all'inizio:

```text
Alla fine di questa conversazione, se è nato qualcosa da ricordare (una decisione, un accordo, un numero, una persona o un'azienda nuova, una scadenza, una correzione al modo in cui scrivi), scrivi una NOTA PER IL CERVELLO. Il mio secondo cervello è una cartella di file che tu non puoi modificare: la nota la salvo io nella sua casella d'ingresso.

Forma della nota, in un blocco di testo che posso copiare:
- nome del file: AAAA-MM-GG-<tema>.md (data di oggi, tema in due o tre parole minuscole unite da trattini);
- in cima, tra due righe ---, tre righe: type: nota-inbox, data: AAAA-MM-GG, da: <quale AI e dove, per esempio «chat dal telefono»>;
- tre sezioni: «## Cosa è successo o si è deciso» (i fatti con la data, chi e i numeri esatti; separa ciò che è stato detto da ciò che hai dedotto), «## Dove va nel cervello» (la pagina da aggiornare se la conosci, oppure il tipo di pagina: persona, azienda, progetto, fonte, regola), «## Da verificare» (ciò che non è certo e le decisioni che spettano a me).
Niente password, chiavi o codici di accesso, niente recapiti o dati personali di altre persone: al massimo dove stanno. Se non c'è niente da ricordare, scrivi soltanto «Niente per il cervello».
```

E2, alla fine, se non avevi incollato E1:

```text
Prima di chiudere, scrivi la NOTA PER IL CERVELLO di questa conversazione: ciò che è nato da ricordare (decisioni, accordi, numeri, persone o aziende nuove, scadenze, correzioni al modo in cui scrivi). Il mio secondo cervello è una cartella di file che tu non puoi modificare: la nota la salvo io.

Forma, in un blocco di testo che posso copiare: nome del file AAAA-MM-GG-<tema>.md; in cima, tra due righe ---, le righe type: nota-inbox, data: AAAA-MM-GG, da: <quale AI e dove>; poi le sezioni «## Cosa è successo o si è deciso» (fatti con data, chi e numeri esatti, separando ciò che è stato detto da ciò che hai dedotto), «## Dove va nel cervello» e «## Da verificare». Niente password, chiavi o dati personali di altre persone. Se non c'è niente da ricordare, scrivi soltanto «Niente per il cervello».
```

## F. Nuova regola da una correzione che ripeto

Quando: ti accorgi di correggere l'AI per la seconda volta sulla stessa cosa. In Claude Code c'è già il comando
`/nuova-regola <descrizione>`, che fa lo stesso lavoro; questo prompt serve con gli altri agenti, e anche in una chat,
dove l'AI prepara la pagina e la salvi tu.

```text
Ti ho già corretto più volte su questo: <la correzione, con un esempio di come lo hai scritto tu e di come lo volevo io>. Voglio che diventi una regola del mio secondo cervello, così non dipende dalla tua memoria.

1. Capisci di che tipo è.
   - Se riguarda il modo di scrivere (una parola, un giro di frase, il tono): diventa una riga della tabella No/Sì di wiki/concepts/come-scrivere-per-me.md, con il mio esempio vero. Se è un carattere da non usare mai, proponimi anche di aggiungerlo a «caratteriVietati» in bin/impostazioni.json, così lo controlla lo script.
   - Se riguarda il modo di lavorare (cosa fare, cosa non fare, prima di cosa): diventa una pagina regola.
2. Cerca se esiste già: node bin/costruisci.mjs --elenco, poi una ricerca per parole chiave in wiki/concepts/, AGENTS.md, automazioni/ e wiki/meta/frasi-superate.md. Se c'è una regola sullo stesso tema, cambi quella: mai una seconda pagina. Se la nuova contraddice una vecchia, la vecchia prende status: superseded e superata-da: [nome-della-nuova], e non si cancella.
3. Scrivi la pagina wiki/concepts/<nome-in-minuscolo-con-trattini>.md dal modello _modelli/regola.md: «In breve» subito dopo il titolo, da una a quattro righe che iniziano con «- » e si possono eseguire senza aprire la pagina; «La regola» con un esempio di cosa si fa e uno di cosa non si fa; «Perché esiste» con la mia correzione e la data di oggi; «Collegamenti». Nel frontmatter: ambito («tutto», oppure una chiave dell'elenco «ambiti» di bin/impostazioni.json), nucleo: sì se deve valere sempre, fonte con chi l'ha decisa e quando.
4. Se la regola supera una frase che può essere ancora scritta da qualche parte, aggiungi una riga in wiki/meta/frasi-superate.md.
5. node bin/costruisci.mjs (se si ferma, correggi la pagina come dice), poi node bin/controlla.mjs e correggi i rossi che hai causato.
6. Una riga in wiki/index.md, sezione «Regole», sotto il suo ambito; una voce in fondo a wiki/log.md.
7. Rispondimi con il nome della pagina, le righe dell'«In breve» e cosa è stato superato.

Se non vedi la cartella del cervello: preparami la pagina intera in un blocco di testo, con il percorso dove salvarla, e le righe da aggiungere a index e log; poi ricordami di lanciare node bin/costruisci.mjs.
```
