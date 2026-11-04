---
title: "Avvisa (bin/avvisa.mjs)"
type: strumento
tags: [strumento, cervello, avvisi, telegram]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Avvisa

## In breve
- Manda un messaggio sul telefono, con un bot di Telegram: `node bin/avvisa.mjs "testo"`.
- Su GitHub legge il rapporto del [[controlla|controllo]] e manda subito i rossi gravi (segreti, routine ferme); il
  lunedì, e quando il flusso è lanciato a mano, manda una riga di riepilogo anche se è tutto verde.
- Senza le chiavi del bot non si rompe: scrive il messaggio solo a schermo ed esce con 0.

## Come si lancia
Dalla cartella del cervello:
```
node bin/avvisa.mjs "testo"                         manda il testo
node bin/avvisa.mjs --da-controllo esito.json       legge il rapporto in JSON del controllo e decide cosa mandare
node bin/avvisa.mjs --da-controllo esito.json --riepilogo   come sopra, con la riga di riepilogo anche se non è lunedì
node bin/avvisa.mjs --verifica                      dice se trova il token e la chat, senza mostrarli
node bin/avvisa.mjs --trova-chat                    con il token già salvato, stampa il numero della chat (serve una volta)
node bin/avvisa.mjs --aiuto                         come si usa
```
Codici d'uscita: 0 messaggio mandato, niente da mandare, oppure niente chiavi (il testo resta solo a schermo); 1
invio non riuscito, oppure con `--verifica` manca il token o la chat; 2 opzione sconosciuta o errore d'uso (anche un
file `esito.json` che non esiste). Con `--da-controllo` un invio non riuscito si scrive ed esce 0, per non fermare il
controllo su GitHub; se il file non si legge, manda un avviso che lo dice. Telegram si aspetta al massimo 15 secondi.

## Cosa manda con `--da-controllo`
- Subito, a ogni giro: i rossi del controllo e (segreti e dati personali nei file). I rossi del controllo i (battiti
  delle automazioni, cioè una routine o la sincronizzazione che non gira più) solo nel giro quotidiano e in quello
  lanciato a mano, non a ogni salvataggio: un battito fermo non cambia ogni dieci minuti.
- Il lunedì, quando il flusso è lanciato a mano su GitHub (Run workflow), oppure con `--riepilogo`: una riga di
  riepilogo con i conteggi, anche quando è tutto verde. Serve a capire che il canale funziona: se il lunedì il
  messaggio non arriva, è rotto il controllo oppure mancano le chiavi.

Il file `esito.json` lo produce `node bin/controlla.mjs --json`.

## Le chiavi
Token del bot e numero della chat si leggono con [[chiavi]], con i nomi `telegram-token` e `telegram-chat`:
- sul computer, nei file `telegram-token.txt` e `telegram-chat.txt` della cartella privata delle chiavi, oppure nelle
  variabili d'ambiente `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`;
- su GitHub, nei segreti del repository con quei due nomi (facoltativi: senza, il controllo gira lo stesso e gli
  avvisi restano nel registro del lavoro di GitHub).

Come si ottengono, in breve: su Telegram si crea un bot con BotFather (il bot ufficiale per creare bot), che
restituisce il token, e lo si salva come `telegram-token`; poi si scrive un messaggio qualunque al proprio bot e
`node bin/avvisa.mjs --trova-chat` stampa il numero della chat, da salvare come `telegram-chat`. Il token non si
scrive mai nell'indirizzo del browser: resterebbe nella cronologia. Dopo: `node bin/avvisa.mjs --verifica`, poi
`node bin/avvisa.mjs "prova"`.

## Cosa NON fa
- Non stampa mai il token; il numero della chat solo con `--trova-chat`, che serve proprio a trovarlo.
- Non decide cosa è grave: lo decide il controllo; avvisa sceglie solo quali rossi mandare subito.
- Non risponde ai messaggi: è a senso unico.
- Senza chiavi non avvisa nessuno: per questo il riepilogo del lunedì è l'unico modo per accorgersi del silenzio.

## Dove gira
Su GitHub, come passo del lavoro `.github/workflows/controllo.yml`, dopo il controllo. Sul computer, a mano o da
altri script. Le routine nel cloud non lo usano: se si fermano se ne accorge il controllo, perché il loro battito
invecchia.

## Collegamenti
- [[controlla]]: da dove vengono i rossi.
- [[chiavi]]: dove stanno token e chat.
- [[sincronizza]]: il suo battito è tra quelli controllati.
