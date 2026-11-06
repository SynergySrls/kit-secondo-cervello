# Kit «secondo cervello»

Un secondo cervello è una cartella di file di testo che un'AI legge prima di ogni lavoro e aggiorna dopo: chi sei,
cosa è in corso, persone, progetti, decisioni e le regole che vuoi siano rispettate.
Questo kit ti dà la cartella già pronta (vuota, con le sue istruzioni), gli script (piccoli programmi) che la tengono
in ordine e la guida.
Le regole si scrivono una volta, una pagina per regola; uno script ne fa il riassunto che arriva a ogni AI.
Dei controlli automatici trovano ciò che la memoria dell'AI dimentica: link rotti, segreti, regole non rispettate.
Funziona con qualunque AI, perché tutto sta in file aperti, markdown (testo semplice con pochi segni) e Git (la storia
di ogni modifica), e non dentro una piattaforma.

Versione del kit: 1.1, del 2026-11-06 (in più `INSTALLA.md`). La prima voce del log del tuo cervello la riporta; per portare in un cervello
già in uso gli script di un kit più nuovo, vedi la guida, capitolo 14.6.

## Tre strade

| Livello | Tempo | Cosa ti serve | Cosa costa | Come funziona |
|---|---|---|---|---|
| 1. Solo chat | 15 minuti | qualunque AI con progetti e file caricati; Node (il programma che fa girare gli script) per preparare il pacchetto | il piano gratuito o base dell'AI, con i suoi limiti di progetti e file (scheda in `piattaforme/`) | il cervello si legge dalla chat; si aggiorna con le note per il cervello che salvi tu |
| 2. Agente con cartella | da un'ora a due ore e mezza, compresa l'installazione dei programmi | Claude Code o un altro agente che legge `AGENTS.md`, Node; Obsidian per guardare | il piano dell'AI che comprende l'agente (scheda in `piattaforme/`) | l'agente legge e scrive il cervello sul tuo computer; con Claude Code partono anche gli hook (controlli automatici) |
| 3. Sistema completo | mezza giornata | in più un repository privato su GitHub (l'archivio online con la storia dei file), la sincronizzazione automatica, il controllo quotidiano, la routine Custode (un lavoro che l'AI fa da sola ogni sera), il plugin per le chat (un pacchetto di istruzioni che l'account installa, dal repository) | GitHub e Telegram gratuiti bastano; le routine nel cloud chiedono un piano a pagamento della piattaforma e ne consumano i limiti | il cervello si salva, si controlla e si riordina da solo, e le regole arrivano anche alle chat del telefono |

Si sale da un livello all'altro senza rifare niente. Se non sai quale scegliere, parti dal 2.

## Cosa c'è nel kit

```
LEGGIMI.md           questa pagina
GUIDA.md             la guida completa: idee, livelli passo per passo, uso quotidiano, regole, errori da evitare
PROMPT-DI-AVVIO.md   il prompt da incollare nell'AI la prima volta
INSTALLA.md          le istruzioni per un'AI con il terminale che installa e costruisce tutto, dall'inizio alla fine
piattaforme/         una scheda per famiglia di AI (Claude, ChatGPT e Codex, Google, Microsoft e GitHub, altri),
                     ognuna con la data di verifica
modello/             il cervello vuoto: è questa la cartella che copi e diventa tua
prova-kit.mjs        la prova automatica del kit (per chi lo modifica)
CLAUDE.md            istruzioni per chi fa manutenzione al kit (non servono per usarlo)
```

## Da dove partire

**La via più corta:** apri un agente con il terminale (Claude Code, Codex, Cursor o un altro) e chiedigli di leggere e
seguire `INSTALLA.md` di questo kit. Fa lui i passi qui sotto, ti intervista e ti dice cosa resta da fare a te
(gli accessi e le chiavi li fai sempre tu). A mano, invece:

1. Leggi il capitolo 0 di `GUIDA.md` («In una pagina») e scegli il livello (capitolo 2).
2. Apri la scheda della tua AI in `piattaforme/`.
3. Copia la cartella `modello/` in una cartella tua, fuori da Drive, OneDrive, Dropbox e simili, poi incolla il prompt
   (il testo da dare all'AI) A di `PROMPT-DI-AVVIO.md`; solo chat: il prompt B. Se hai già note, un vault di Obsidian
   o un'altra app di appunti: prima il prompt A, poi il C (il vecchio archivio resta dov'è e viene solo letto).
4. Segui il capitolo del tuo livello: livello 1 capitolo 5, livello 2 capitolo 3, livello 3 capitoli 3 e 4.

Non lavorare dentro la cartella del kit: il tuo cervello è la copia di `modello/`.
