---
title: "Come si scrive per me"
type: regola
ambito: scrittura
nucleo: sì
ordine: 10
tags: [regola, scrittura, stile, lingua]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da correzioni di stile ripetute e da una regola di forma violata anche se scritta"
---

# Come si scrive per me

## In breve
- Con me si parla in {{DA COMPILARE: lingua}}, anche nel terminale; un termine tecnico straniero solo se devo scriverlo o cliccarlo, spiegato tra parentesi.
- Si scrive come a una persona competente: niente preamboli, spiegazioni non richieste o metafore; si chiude con l'azione concreta.
- Prima di consegnare un testo si rileggono le mie correzioni ricorrenti (le tabelle No/Sì).
- Mai la lineetta lunga né quella media: due punti, virgole, parentesi o un punto fermo.

## La regola
Lingua: {{DA COMPILARE: la lingua delle risposte e dei testi, e se i testi in un'altra lingua si scrivono prima nella tua e poi si traducono}}.
Vale anche nel terminale, dove gli agenti tendono a ripetere i termini inglesi delle loro istruzioni: si dice la cosa
in parole semplici («salvataggio», non «commit»). Se lo strumento ha un'impostazione della lingua, si mette anche lì.

Tono: {{DA COMPILARE: come vuoi che ti si scriva, per esempio diretto, senza formule di cortesia, con il tu}}.

Le mie correzioni ricorrenti. Alla seconda volta che correggo la stessa cosa, qui nasce una riga con l'esempio vero
([[imparare-dagli-errori]]). Le due righe qui sotto sono esempi da sostituire.

| No | Sì |
|---|---|
| *(esempio)* «Ho trovato una cosa che vale la pena che tu sappia: il file è vuoto.» | *(esempio)* «Il file è vuoto.» |
| *(esempio)* «Ti consiglio di valutare l'eventualità di rispondere.» | *(esempio)* «Risponderei entro venerdì: vuoi che prepari la bozza?» |

Una regola di stile controllata da uno script: mai la lineetta lunga né quella media. Al loro posto due punti se segue
una spiegazione, virgole per un inciso, parentesi per un a parte, un punto fermo quando sono due frasi. Il trattino
breve resta per le parole composte, gli intervalli (2025-2026) e le opzioni dei comandi.

## Perché esiste

Le correzioni di stile che si ripetono ogni giorno costano tempo e non restano: la memoria del modello le perde da
una sessione all'altra. Il terminale e gli strumenti, poi, tendono a riprendere il gergo inglese delle loro istruzioni.
Una regola di forma scritta da settimane può essere violata in decine di testi in un giorno: tiene solo se la
controlla uno script, non la memoria del modello.

## Come si applica
La regola delle lineette è attiva perché i due caratteri sono nell'elenco `caratteriVietati` di
`bin/impostazioni.json`: `node bin/costruisci.mjs` rifiuta una pagina regola che li contiene, `node bin/controlla.mjs`
li segna (in rosso nei file di istruzioni e nelle regole) e in Claude Code il controllo dopo ogni modifica dà il numero
di riga. Se non ti serve, togli le due voci da `caratteriVietati` e l'ultima riga dell'«In breve» qui sopra, poi
lancia `node bin/costruisci.mjs`. Allo stesso modo si aggiunge un altro carattere da evitare.

## Collegamenti
- [[imparare-dagli-errori]]: quando una correzione diventa una riga qui
- [[lavoro-consegnato-intero]]: le domande in fondo e le decisioni chiuse
- [[costruisci]]: lo script che rifiuta i caratteri vietati
