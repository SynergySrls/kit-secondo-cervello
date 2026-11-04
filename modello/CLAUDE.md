Le istruzioni del cervello stanno in AGENTS.md, che vale per ogni agente: qui si importano. Chi apre questo file con Read: leggi AGENTS.md.

@AGENTS.md

## Solo per Claude Code

Controlli automatici (hook), dichiarati in `.claude/settings.json`, con gli script in `bin/hooks/` ([[hook]]):
- `avvio`, all'apertura della sessione: data di hot, nucleo aggiornato o no, rossi dei controlli lanciati in quel
  momento, rami di conflitto, sincronizzazione in pausa o ferma, note da integrare, lavoro da riprendere.
- `instrada`, a ogni messaggio: fino a tre righe della tabella «Richiesta → strumento» che corrispondono alla richiesta.
- `dopo-modifica`, dopo ogni modifica di un file: caratteri vietati con il numero di riga, segreti, promemoria di
  rigenerare il nucleo.
- `proteggi`, prima di ogni comando del terminale e di ogni lettura con Read o Grep: nega quelli che mostrerebbero una
  chiave o una password e dice cosa usare al posto.

Si spengono tutti con la variabile d'ambiente `CERVELLO_HOOK=spenti`, oppure solo su alcune piattaforme con
`hook.spentiSu` in `bin/impostazioni.json`; `CERVELLO_HOOK_DEBUG=1` mostra gli errori. Partono solo se la cartella è
stata accettata come attendibile; una modifica di solito vale subito (se un hook non parte: `/hooks`, o una sessione
nuova).

Comandi:
- `/chiudi`: la chiusura di sessione di AGENTS.md, più la domanda «c'è un errore di oggi che può ripetersi?».
- `/ingerisci [file o cartella]`: la procedura `automazioni/ingestione.md` su `.raw/` o sull'argomento.
- `/nuova-regola [descrizione]`: cerca se la regola esiste già, crea la pagina dal modello, rigenera il nucleo e
  lancia i controlli.
- `/allinea-routine`: confronta i file di `automazioni/routine/` con le routine dell'account, con un sì per ogni
  modifica.

Memoria automatica: contiene solo rimandi di una riga alle pagine, mai regole o fatti suoi. Se dice altro, vale il
cervello. Modello di rimando:
- nell'indice `MEMORY.md`: `- [Tema](tema.md): wiki/concepts/<nome>.md`
- nel file del tema: «Tema: vedi wiki/concepts/<nome>.md nel cervello.»
