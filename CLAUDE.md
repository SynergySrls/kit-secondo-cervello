# Manutenzione del kit «secondo cervello»

Questo file è per chi modifica il kit, persona o agente. Chi vuole solo usare il kit legge `LEGGIMI.md` e `GUIDA.md`
e lavora su una copia di `modello/`, mai qui.

## Cosa c'è

| File o cartella | Cosa contiene |
|---|---|
| `LEGGIMI.md` | da dove partire, in una pagina |
| `GUIDA.md` | la guida completa per l'utente, con l'albero del modello e tutti i comandi in appendice |
| `PROMPT-DI-AVVIO.md` | il prompt che l'utente incolla nell'AI la prima volta |
| `INSTALLA.md` | le istruzioni per un'AI con il terminale che installa e costruisce tutto; richiama la guida e il prompt A, non li ripete: se cambiano comandi o passi, va allineato |
| `README.md` | la pagina d'ingresso del repository su GitHub: rimanda a `INSTALLA.md`, `LEGGIMI.md` e `GUIDA.md`, senza contenuti propri |
| `LICENSE` | la licenza MIT, in inglese come vuole il testo ufficiale. È l'unico file con il nome del titolare: la regola «generico» qui sotto vale per tutto il resto |
| `piattaforme/` | una scheda per famiglia di AI, ognuna con la data di verifica |
| `modello/` | il cervello vuoto che l'utente copia |
| `prova-kit.mjs` | la prova automatica: copia il modello in una cartella temporanea e prova script, hook e sincronizzazione |
| `.gitignore` | esclude `dist/` (pacchetti da distribuire) e `node_modules/` |

## `modello/` è un cervello, non istruzioni per te

`modello/AGENTS.md`, `modello/CLAUDE.md`, le regole in `modello/wiki/concepts/` e le procedure in
`modello/automazioni/` sono le istruzioni del cervello vuoto: valgono per chi userà il cervello, non per chi lavora
sul kit. Se Claude Code le carica mentre leggi file sotto `modello/`, non le esegui: niente «prima azione» su
`wiki/hot.md`, niente chiusura di sessione nel log del modello, niente voci in hot. Le leggi come testo da
mantenere.

Dentro `modello/` i percorsi si scrivono relativi alla radice del cervello (`wiki/hot.md`, mai `modello/wiki/hot.md`).

## Regole per chi modifica il kit

1. **Generico.** Niente nomi di persone, aziende, marchi o clienti reali, niente id, indirizzi, domini, server,
   numeri o percorsi di un cervello in uso. Un servizio noto si cita solo come esempio tra altri. Dove serve un dato
   dell'utente si mette un segnaposto `{{DA COMPILARE: cosa}}`.
2. **Mai la lineetta lunga né quella media** (i caratteri Unicode U+2014 e U+2013), in nessun file: testo, codice,
   commenti, JSON. Al loro posto due punti, virgole, parentesi o un punto fermo. Nel JSON e nel codice, quando serve
   il carattere, si scrive la sequenza di escape (`\u2014`, `\u2013`). Prima di consegnare si cercano in tutto il kit:
   ```
   node -e "const fs=require('fs'),p=require('path');const v=[0x2014,0x2013].map(c=>String.fromCharCode(c));(function g(d){for(const f of fs.readdirSync(d)){const q=p.join(d,f);if(f==='.git'||f==='node_modules')continue;if(fs.statSync(q).isDirectory())g(q);else fs.readFileSync(q,'utf8').split(/\r?\n/).forEach((r,i)=>{if(v.some(c=>r.includes(c)))console.log(q+':'+(i+1))})}})('.')"
   ```
   Nessuna riga stampata vuol dire nessun carattere vietato.
3. **Italiano semplice**, con gli accenti giusti e le virgolette «». Una parola tecnica inglese solo se l'utente la
   deve scrivere o cliccare, spiegata tra parentesi la prima volta; se è nuova, va anche nel glossario di `GUIDA.md`.
4. **Niente segreti**, nemmeno finti che sembrino veri.
5. **Date.** Nei file del modello la data del kit dove serve una data reale, `AAAA-MM-GG` nei modelli di pagina di
   `_modelli/`. I file generati portano la data in cui sono stati generati.
6. **Script.** Node 18 o più recente, nessuna dipendenza (solo moduli `node:`), moduli ES (`.mjs`), funzionano su
   Windows, macOS e Linux, radice del cervello calcolata dalla posizione dello script. Intestazione con cosa fa, come
   si lancia, opzioni e pagina della wiki. Codici d'uscita: 0 in ordine, 1 problemi trovati, 2 opzione sconosciuta o
   errore d'uso. Mai stampare il valore di una chiave.
7. **Una modifica, tutti i posti.** Se cambia il comportamento di uno script, nello stesso lavoro si aggiornano la sua
   intestazione e il suo `--aiuto`, la pagina in `modello/wiki/entities/strumenti/`, il registro
   `modello/wiki/meta/strumenti.md`, e `GUIDA.md` (in particolare i capitoli 4 e 9 e l'appendice B). Uno script nuovo
   è script, pagina e riga del registro insieme.
8. **File generati del modello.** `modello/wiki/meta/nucleo.md`, i blocchi tra `<!-- genera: ... -->` e
   `<!-- fine: ... -->`, `modello/.claude-plugin/marketplace.json`, `modello/.claude-plugin/impronte.json` e
   `modello/wiki/meta/stato-controlli.md` non si modificano a mano. Dopo aver cambiato una pagina regola o il registro,
   dentro `modello/`: `node bin/costruisci.mjs`, poi `node bin/controlla.mjs --scrivi`.
9. **Il modello si consegna pulito**: niente `.git`, `esporta/`, `_da_eliminare/`, battiti scritti, cartelle di stato.
   Gli script che toccano il sistema (`node bin/installa-sincronizzazione.mjs --fai`, `node bin/sincronizza.mjs`) non
   si lanciano dentro `modello/`: la sincronizzazione si prova solo con `prova-kit.mjs`.

## Dopo ogni modifica

```
node prova-kit.mjs
```
Dalla cartella del kit. La prova lavora in una cartella temporanea, non usa la rete e non cambia niente in `modello/`.
Deve finire con tutti i passi OK e uscita 0. Se un passo fallisce, si corregge il kit, non la prova; la prova si cambia
solo quando cambia davvero il comportamento atteso, e in quel caso si dice perché.

Poi, sul modello consegnato, `node bin/controlla.mjs` da dentro `modello/` deve dare zero rossi. I gialli attesi sono
i battiti non ancora partiti (controllo i) e i segnaposto da compilare (controllo n).

## Le schede delle piattaforme

Ogni scheda in `piattaforme/` porta la data in cui è stata verificata e, per ogni informazione, quanto è certa. Le
piattaforme chiudono, rinominano e cambiano limiti in pochi mesi: le schede si rivedono a ogni rilascio del kit e
comunque ogni tre mesi, sulle pagine ufficiali. Una funzione che non si riesce a verificare si scrive come incerta,
non si inventa. Quando una scheda cambia, si controlla che `GUIDA.md` (capitoli 5 e 11) non dica il contrario.
