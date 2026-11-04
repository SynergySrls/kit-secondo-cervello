---
title: "Chiavi (bin/lib/chiavi.mjs)"
type: strumento
tags: [strumento, cervello, chiavi, sicurezza]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Chiavi

## In breve
- Un solo modulo trova le chiavi (token, codici di accesso ai servizi) per tutti gli script: prima nelle variabili
  d'ambiente, poi nei file della cartella privata, fuori dal cervello e mai su Git.
- Le chiavi non si leggono, non si stampano e non si scrivono nel cervello: qui c'è solo dove stanno.
- Per sapere se una chiave c'è: `node bin/lib/chiavi.mjs --verifica`, che dice dove la trova senza mostrarla.

## Come si lancia
Dalla cartella del cervello:
```
node bin/lib/chiavi.mjs --verifica            per ogni chiave dell'elenco: trovata in variabile, trovata in file, mancante
node bin/lib/chiavi.mjs --verifica <nome>     lo stesso, solo per quella chiave
node bin/lib/chiavi.mjs --aiuto               come si usa
```
Codici d'uscita: 0 in ordine (senza nomi l'elenco è solo informativo ed esce 0 anche se manca una chiave
facoltativa); 1 manca almeno una delle chiavi chieste per nome; 2 opzione sconosciuta. Un nome con barre o `..` è
rifiutato.

Dentro uno script di `bin/`:
```
import { chiave, dove } from './lib/chiavi.mjs';
const token = chiave('telegram-token');   // il valore, oppure l'errore ChiaveMancante
console.log(dove('telegram-token'));      // dove l'ha trovata, senza leggerla
```
`chiave(nome)` restituisce il valore oppure lancia l'errore `ChiaveMancante`, che dice il nome della chiave e i posti
in cui l'ha cercata, mai un valore.

## Dove cerca, in quest'ordine
1. Le variabili d'ambiente scritte per quella chiave nell'elenco (per esempio `TELEGRAM_BOT_TOKEN`). È il modo usato
   su GitHub, dove le chiavi stanno nei segreti del repository.
2. Il file scritto per quella chiave, dentro la cartella privata indicata in `bin/impostazioni.json`, sezione
   `chiavi.cartella` (nel modello `~/Cervello-Privato/chiavi`, dove la tilde è la cartella dell'utente). Per usare
   un'altra cartella senza cambiare le impostazioni: variabile d'ambiente `CERVELLO_CHIAVI_DIR`.

L'elenco delle chiavi sta in `bin/impostazioni.json`, sezione `chiavi.elenco`. Il modello ne ha due:

| Chiave | Variabile d'ambiente | File | A cosa serve |
|---|---|---|---|
| `telegram-token` | `TELEGRAM_BOT_TOKEN` | `telegram-token.txt` | il bot che manda gli avvisi ([[avvisa]]) |
| `telegram-chat` | `TELEGRAM_CHAT_ID` | `telegram-chat.txt` | la chat in cui arrivano gli avvisi |

## Aggiungere una chiave
1. Una riga nuova in `chiavi.elenco` di `bin/impostazioni.json`: il nome, le variabili d'ambiente che la possono
   contenere, il nome del file.
2. Il valore in quel file, dentro la cartella privata, scritto dall'utente (la cartella non sta nel cervello e non è
   sincronizzata su cartelle condivise).
3. `node bin/lib/chiavi.mjs --verifica` per controllare che la trovi.
4. Nella pagina dello strumento che la usa si scrive il nome della chiave, mai il valore.

## Cosa NON fa
- Non stampa mai un valore, nemmeno con `--verifica`.
- Non crea le chiavi, non le copia, non le manda da nessuna parte: non è un gestore di password.
- Non protegge da chi apre il file a mano: per questo il controllo automatico proteggi ([[hook]]) blocca in Claude
  Code i comandi che leggerebbero la cartella delle chiavi o stamperebbero le variabili.

## Dove gira
Ovunque giri uno script del cervello. Sul computer legge la cartella privata; su GitHub e nelle routine nel cloud
trova solo ciò che è nelle variabili d'ambiente (i segreti del repository o dell'ambiente). Le routine nel cloud,
di norma, non hanno chiavi: uno strumento che ne ha bisogno gira sul computer.

## Collegamenti
- [[dove-si-lavora]]: le chiavi stanno nella cartella privata, fuori dal cervello.
- [[ambito]]: mai segreti nelle pagine, si scrive solo dove stanno.
- [[controlla]]: il controllo e cerca i segreti finiti per sbaglio nei file.
