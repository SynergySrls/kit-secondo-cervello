---
title: "Controlla (bin/controlla.mjs)"
type: strumento
tags: [strumento, cervello, controllo, sicurezza]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Controlla

## In breve
- Dice cosa nel cervello non è in ordine: percorsi e link rotti, caratteri vietati, frasi superate, segreti,
  strumenti non registrati, file generati indietro, routine ferme, segnaposto da compilare.
- È in sola lettura: segnala e non corregge. Rosso vuol dire da sistemare subito, giallo da guardare.
- Gira a mano, su GitHub a ogni salvataggio e ogni mattina, e dentro la sincronizzazione per tenere fuori i segreti.

## Come si lancia
Dalla cartella del cervello:
```
node bin/controlla.mjs                        rapporto completo a schermo
node bin/controlla.mjs --scrivi               aggiorna anche wiki/meta/stato-controlli.md (solo senza repository online)
node bin/controlla.mjs --json                 lo stesso rapporto in formato JSON (lo usa avvisa.mjs)
node bin/controlla.mjs --segreti f1 f2 ...    cerca i segreti solo in quei file (--json prima di --segreti: anche quali)
node bin/controlla.mjs --aiuto                come si usa
```
Il rapporto finisce con il riepilogo «N rossi, N gialli, N verdi». Codici d'uscita: 0 nessun rosso; 1 almeno un
rosso (con `--segreti`: almeno un segreto trovato); 2 opzione sconosciuta o errore d'uso.

Con `--segreti` stampa per ogni caso `file:riga  tipo`, mai il valore; con `--json --segreti` dice anche la posizione
dei file sospetti nell'elenco passato (la usa la sincronizzazione). Con `--scrivi` riscrive lo [[stato-controlli]]
solo se è cambiato qualcosa oltre la data, così non crea salvataggi inutili. Se il cervello ha un repository online,
`--scrivi` sul computer non scrive (lo dice): la pagina la scrive solo il controllo su GitHub, altrimenti le due
versioni andrebbero in conflitto alla sincronizzazione. `--scrivi --forza` scrive lo stesso.

## I controlli
Ogni controllo ha una lettera e mostra al massimo 30 casi. Se un controllo va in errore diventa rosso con la nota
«errore del controllore»: un controllo rotto non passa mai per verde.

| | Controllo | Rosso | Giallo |
|---|---|---|---|
| a | Percorsi citati che non esistono: in `AGENTS.md`, `CLAUDE.md`, pagine regola, `automazioni/` e `.claude/`, i percorsi che iniziano con `wiki/`, `bin/`, `automazioni/`, `.claude/`, `.raw/`, `_modelli/`, `.github/` e finiscono con un'estensione o con `/` | il file o la cartella non c'è | |
| b | Wikilink, risolti come fa Obsidian (per nome di file, anche con `\|alias` e `#sezione`) | due file `.md` con lo stesso nome ricevono link | link rotti |
| c | Caratteri vietati elencati in `bin/impostazioni.json` | nella zona vincolante (`AGENTS.md`, `CLAUDE.md`, nucleo, `automazioni/`, pagine regola) | altrove |
| d | Frasi superate, dalla tabella di [[frasi-superate]] | la riga dice Blocca «sì» | la riga dice Blocca «no» |
| e | Segreti e dati personali nei file tracciati da Git e in quelli nuovi che Git terrebbe (senza Git: in tutti i file di testo): chiavi di Anthropic, OpenAI, Google, GitHub, Slack e AWS, il token di un bot Telegram, chiavi private, il campo della chiave privata nei JSON, un campo «password» seguito da qualcosa che sembra una parola d'ordine vera: almeno 8 caratteri, lettere insieme a cifre o simboli (variabili, segnaposto, percorsi e nomi di gestori come 1Password non contano), un IBAN valido (con la cifra di controllo giusta), più di 50 indirizzi email in un file | qualunque caso | |
| f | Strumenti: ogni script di `bin/` compare nel registro [[strumenti]] e ogni `bin/...` citato nel registro esiste | uno dei due manca | |
| g | Frontmatter delle pagine di `wiki/` | una pagina regola non rispetta il formato | `type` o `status` mancanti o fuori dal vocabolario delle impostazioni, una chiave scritta due volte |
| h | File generati: nucleo, blocchi generati, marketplace (con [[costruisci]] in prova, senza scrivere) | qualcosa è indietro | |
| i | Battiti delle automazioni, con le cadenze della tabella «Battiti» di `automazioni/LEGGIMI.md` | il battito è più vecchio della cadenza più un giorno | il file del battito non c'è ancora («non ancora partito»), la cadenza non è scritta, l'ultimo giro dice «esito: errore» o la data non si legge |
| j | Radice del cervello | manca `AGENTS.md` o il suo blocco generato del nucleo, oppure `bin/impostazioni.json` manca o non è JSON valido (i controlli usano allora i valori predefiniti) | file di istruzioni in più (`README*`, `LEGGIMI*`, `HANDOFF*`, `ISTRUZIONI*`, `*-START.md`) |
| k | Doppioni: nomi con «(1)», « 2.», «copia di», «copy of», «- Copia» | | qualunque caso |
| l | `.gitignore`: con Git, verifica che nessuna pagina `.md` di `wiki/` e nessun file di testo di `bin/`, `automazioni/`, `.claude/` e `.github/` risulti escluso (tranne le impostazioni locali di Claude Code) | un file è escluso | |
| m | [[hot]]: voci di «In corso adesso» più vecchie di 14 giorni, file sopra i 40 KB, nessun aggiornamento da più di 7 giorni (vale la data più recente fra `updated` e le voci), righe `updated` doppie | | qualunque caso (le voci vecchie le archivia il Custode) |
| n | Segnaposto «DA COMPILARE» (tra doppie parentesi graffe) ancora presenti, e nelle pagine di `wiki/` i segnaposto dei modelli rimasti (`<...>`, date AAAA-MM-GG) | | con il conteggio per file |

Dettagli che contano:
- Restano sempre fuori `.git/`, `node_modules/`, `_da_eliminare/`, `esporta/` e `.raw/`; i modelli di `_modelli/`
  restano fuori dai controlli sui link.
- Il controllo a non legge `.claude/settings.local.json`: lo scrive Claude Code da solo ed è escluso da Git.
- Nel controllo a non contano i segnaposto (`AAAA`, `<...>`, `{{`, `*`), le righe che dicono «non esiste» o «da
  creare» e i percorsi sotto `automazioni/battiti/`.
- Nel controllo c sono esenti i file elencati in `esentiStile` (la tabella delle frasi superate e lo stato dei
  controlli, che i caratteri vietati li citano per forza).
- Nel controllo d la ricerca ignora maiuscole, asterischi, apici inversi, virgolette e a capo. Non contano: le righe
  con una negazione poco prima della frase (mai, niente, nessun, non si, invece di, né, anziché), le righe che dicono
  «superat», «abolit» o «non vale più», le sezioni di storia, origine, «perché esiste» e log, le pagine superate o
  archiviate, il log, hot e i suoi archivi. Le pagine indicate nella colonna «Superata da» sono escluse.
- Il controllo e non guarda `bin/controlla.mjs`, che contiene i modelli delle chiavi da cercare.
- Le soglie del controllo m (14 giorni, 40 KB) sono quelle di `hot` in `bin/impostazioni.json`.
- Il controllo n guarda solo i file `.md`, `.json`, `.yml` e `.txt` scritti a mano: non conta le copie generate
  (nucleo, blocchi generati, `marketplace.json`), i modelli di `_modelli/` (che usano `<...>`) e la sintassi del
  segnaposto citata tra apici inversi.
- Lo stato dei controlli non è una fonte: resta fuori dai controlli, così il rapporto non cambia per il solo fatto
  di essere stato scritto.

## Cosa NON fa
- Non corregge niente e non scrive niente, tranne `wiki/meta/stato-controlli.md` con `--scrivi`.
- Non stampa mai il valore di un segreto: solo file, riga e tipo.
- Trova solo ciò che gli si elenca: una frase superata che non è in tabella o una parola d'ordine scritta in prosa
  possono sfuggire.
- Non manda avvisi: li manda [[avvisa]] leggendo il suo rapporto in JSON.

## Dove gira
- Sul computer, a mano, con Node 18 o più recente. Nessuna dipendenza.
- Su GitHub, con `.github/workflows/controllo.yml`: a ogni salvataggio sul ramo principale che tocca `wiki/`,
  `automazioni/`, `bin/`, `AGENTS.md`, `CLAUDE.md` o `.claude/`, ogni giorno alle 6:00 del tempo universale (in
  Italia le 7 d'inverno e le 8 d'estate) e a mano.
  Lì riscrive lo stato dei controlli e lo salva nel repository. Nel giro quotidiano e in quello lanciato a mano, se ci
  sono rossi, il passo finale fallisce: così GitHub manda una mail al proprietario (non a ogni salvataggio, che con la
  sincronizzazione arriva ogni pochi minuti).
- Nella [[sincronizza|sincronizzazione]]: prima di ogni salvataggio i file in uscita passano da `--segreti`.
- Nei controlli automatici di Claude Code ([[hook]]): all'avvio l'hook lancia `--json` e riporta i rossi di adesso
  (se non finisce entro 4 secondi, legge le righe `ROSSO` dello stato dei controlli e dice quanto è vecchio); dopo
  ogni modifica il file toccato passa da `--segreti`.

## Collegamenti
- [[stato-controlli]]: l'ultimo rapporto salvato.
- [[frasi-superate]]: la tabella del controllo d.
- [[costruisci]]: i file generati del controllo h.
- [[avvisa]]: gli avvisi sul telefono.
- [[imparare-dagli-errori]]: un errore ripetibile diventa una pagina, e se si può una riga di controllo.
