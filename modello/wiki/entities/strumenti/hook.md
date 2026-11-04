---
title: "Hook di Claude Code (bin/hooks/)"
type: strumento
tags: [strumento, cervello, claude-code, controllo, instradamento]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Hook di Claude Code

Un hook (controllo automatico che Claude Code lancia da solo in certi momenti) è un piccolo script che gira senza che
nessuno lo chieda: all'avvio della sessione, a ogni messaggio, dopo ogni modifica, prima di un comando.

## In breve
- Quattro controlli automatici in `bin/hooks/`, dichiarati in `.claude/settings.json`: **avvio** (lo stato del
  cervello in poche righe), **instrada** (lo strumento giusto per la richiesta), **dopo-modifica** (caratteri
  vietati, segreti, nucleo da rigenerare), **proteggi** (blocca i comandi e le letture che mostrerebbero un segreto).
- Aggiungono contesto al modello e non bloccano mai il lavoro, tranne proteggi sui comandi pericolosi.
- Si spengono con la variabile d'ambiente `CERVELLO_HOOK=spenti` (valgono anche `0`, `no`, `off`).

## I quattro hook
| Hook | Quando parte | Script | Cosa fa |
|---|---|---|---|
| avvio | all'avvio della sessione, alla ripresa, dopo `/clear` e dopo la compattazione | `bin/hooks/avvio.mjs` | poche righe: data dell'ultimo aggiornamento di [[hot]] (la più recente fra `updated` e le voci) e giorni passati; esito di `node bin/costruisci.mjs --verifica`; i rossi di `node bin/controlla.mjs` lanciato adesso (se non finisce in 4 secondi, le righe `ROSSO` dello [[stato-controlli]] con la data del rapporto e, se è vecchio, quanti giorni ha); rami di conflitto aperti (solo quelli già noti al computer, senza rete); sincronizzazione in pausa, oppure ferma (ultima riga del registro con «FERMO»); quante note ci sono in `.raw/inbox/` e quanti file in `.raw/` da ingerire; il contenuto del file `da-riprendere.md` della cartella di stato, se c'è (un lavoro da chiudere prima di altro); in fondo «Prima di rispondere leggi wiki/hot.md e wiki/index.md» |
| instrada | a ogni messaggio dell'utente | `bin/hooks/instrada.mjs` | legge la tabella «Richiesta → strumento» di [[strumenti]]; se il messaggio contiene le parole tipiche di una riga, aggiunge lo strumento da usare per primo, dove gira, cosa non usare e la pagina |
| dopo-modifica | dopo ogni Edit, Write o MultiEdit | `bin/hooks/dopo-modifica.mjs` | sul solo file toccato: caratteri vietati con i numeri di riga (con un avviso più forte nella zona vincolante: `AGENTS.md`, `CLAUDE.md`, nucleo, `automazioni/`, pagine regola); segreti con `node bin/controlla.mjs --segreti` (file, riga e tipo, mai il valore); se il file è una pagina regola, il registro degli strumenti o `AGENTS.md` e `node bin/costruisci.mjs --verifica` esce con 1, ricorda di lanciare `node bin/costruisci.mjs` |
| proteggi | prima di ogni comando Bash o PowerShell e, come rete in più, prima di ogni Read o Grep | `bin/hooks/proteggi.mjs` | nega i comandi e le letture che mostrerebbero un segreto, con il motivo e cosa usare al posto (sotto); lascia passare tutto il resto |

Le parti comuni stanno in `bin/hooks/comune.mjs`: radice del cervello, lettura dell'ingresso, frontmatter e sezioni
(salta i blocchi di codice), scrittura dell'uscita. L'uscita è JSON con i caratteri non inglesi scritti come
`\uXXXX`, così la codifica della console non conta. Ogni errore interno diventa silenzio con uscita 0: un hook rotto
non ferma mai la sessione. I processi lanciati da un hook hanno un tetto di 2 secondi.

## Come instrada riconosce le parole
- Prima colonna della tabella: parole o espressioni separate da virgole.
- Maiuscole e accenti non contano.
- Una parola di 4 lettere o meno vale solo intera (per esempio «git» non trova «digitale»).
- Una parola di 5 lettere o più vale anche se continua; da 6 lettere in su, se finisce per vocale, vale anche con
  un'altra vocale finale (per esempio «regola» trova «regole»).
- Escono al massimo 3 righe, prima quelle con più parole riconosciute; dopo la prima, non entra una riga
  riconosciuta solo da parole corte. Se ne corrispondono di più, una riga finale lo dice.
- Tace sui comandi che iniziano con `/`, sui messaggi oltre i 1.500 caratteri e sui resoconti degli agenti.

## Cosa blocca proteggi
- La lettura di file nella cartella delle chiavi (`cat`, `type`, `Get-Content`, `gc`, `more`, `less`, `head`, `tail`,
  `Select-String`, `findstr` e simili con un percorso che contiene la cartella `chiavi` delle impostazioni, quella di
  `CERVELLO_CHIAVI_DIR` o `Cervello-Privato`), anche dentro `cmd /c`, `bash -c` o `powershell -Command`.
- Gli strumenti Read e Grep di Claude Code su un file della cartella delle chiavi; Grep anche sulla cartella che la
  contiene (la cartella utente intera no).
- `op read`, e `op item get` con `--reveal` (il programma da riga di comando di un gestore di password).
- `printenv` o `env` da soli (e i loro simili, come `set`, `export` o `Get-ChildItem env:` da soli), che stamperebbero
  tutte le variabili d'ambiente.
- `gh auth token` e `git credential fill`, che stampano le credenziali salvate.
- `echo` (o `printf`, `Write-Output`, `Write-Host`) di una variabile d'ambiente con TOKEN, KEY, SECRET o PASSWORD
  come parola a sé nel nome (`GITHUB_TOKEN` sì; `MONKEY_NAME` o il `$key` di un ciclo no) o elencata nella voce
  `chiavi` delle impostazioni, `printenv` di una di queste, la variabile scritta da sola (in PowerShell `$env:NOME`
  la stampa), `[Environment]::GetEnvironmentVariable('NOME')`, `node -p` o `console.log` di `process.env.NOME`.
- La cartella delle chiavi conta solo quando il comando la cita come percorso: `grep -rn "Cervello-Privato" wiki/`,
  che cerca il nome nelle pagine, passa.

Al posto di questi comandi: `node bin/lib/chiavi.mjs --verifica` per sapere se una chiave c'è, e la funzione
`chiave()` dentro gli script per usarla senza vederla ([[chiavi]]).

## Le impostazioni
In `.claude/settings.json` (va su Git; i permessi di un solo computer restano in `.claude/settings.local.json`, che
non ci va):
```
SessionStart      startup|resume|clear|compact   node "$CLAUDE_PROJECT_DIR/bin/hooks/avvio.mjs"          10 secondi
UserPromptSubmit  (ogni messaggio)               node "$CLAUDE_PROJECT_DIR/bin/hooks/instrada.mjs"       5 secondi
PostToolUse       Edit|Write|MultiEdit           node "$CLAUDE_PROJECT_DIR/bin/hooks/dopo-modifica.mjs"  10 secondi
PreToolUse        Bash|PowerShell|Read|Grep      node "$CLAUDE_PROJECT_DIR/bin/hooks/proteggi.mjs"       5 secondi
```
Su PreToolUse ci sono anche Read e Grep perché leggono un file delle chiavi senza passare dal terminale. Per tenere
proteggi solo sui comandi del terminale si toglie `|Read|Grep` da quella riga.
Gli hook partono solo dopo che la cartella è stata accettata come attendibile in Claude Code, e una modifica a
questo file vale dalla sessione successiva.

## Come si spengono
- Su tutto: variabile d'ambiente `CERVELLO_HOOK` con valore `0`, `no`, `off` o `spenti`.
- Su un sistema operativo: in `bin/impostazioni.json`, `hook.spentiSu` con `win32` (Windows), `darwin` (macOS) o
  `linux`. Vuoto vuol dire «accesi ovunque». Serve, per esempio, se le routine nel cloud (che girano su Linux e
  ricevono lo stesso `.claude/settings.json` dal repository) non devono lanciarli.
- Per vedere gli errori interni invece del silenzio: `CERVELLO_HOOK_DEBUG=1`.

## Come si provano a mano
Dalla cartella del cervello, in un terminale Bash (su Windows Git Bash):
```
echo '{"source":"startup"}' | node bin/hooks/avvio.mjs
echo '{"prompt":"voglio cambiare una regola"}' | node bin/hooks/instrada.mjs
echo '{"tool_name":"Write","tool_input":{"file_path":"wiki/hot.md"}}' | node bin/hooks/dopo-modifica.mjs
echo '{"tool_name":"Bash","tool_input":{"command":"printenv"}}' | node bin/hooks/proteggi.mjs
```

## Cosa NON fanno
- Non correggono niente: dicono cosa non va e lasciano fare al modello.
- Non leggono la rete: i rami di conflitto sono quelli che il computer conosce già.
- Non funzionano fuori da Claude Code: le altre AI non li lanciano, e per loro valgono `AGENTS.md` e il
  [[controlla|controllo]] su GitHub.
- proteggi non è una cassaforte: ferma gli errori più comuni, non chi vuole davvero leggere un file.

## Collegamenti
- [[strumento-giusto]]: la regola che instrada aiuta a rispettare.
- [[strumenti]]: la tabella che instrada legge.
- [[costruisci]] e [[controlla]]: gli script che dopo-modifica e avvio interrogano.
- [[chiavi]]: dove stanno le chiavi e come si usano senza vederle.
