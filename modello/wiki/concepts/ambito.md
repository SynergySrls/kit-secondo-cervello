---
title: "Di chi è il cervello e cosa ci entra"
type: regola
ambito: tutto
nucleo: sì
ordine: 20
tags: [regola, ambito, archiviazione, segreti, dati-personali]
status: current
created: 2026-11-03
updated: 2026-11-03
fonte: "Regola di base del kit secondo cervello (03/11/2026), nata da un account condiviso tra contesti diversi e da credenziali finite nella storia del repository"
---

# Di chi è il cervello e cosa ci entra

## In breve
- Estrai, non caricare: dai documenti si estrae il dato in una pagina con il link all'originale; file pesanti e trascrizioni grezze restano fuori.
- Mai segreti né dati personali di terzi: si scrive solo dove stanno. Le pagine delicate hanno `riservato: true`.

## Regola d'ambito
Questo cervello è di {{DA COMPILARE: il tuo nome}} e contiene il lavoro per {{DA COMPILARE: attività, azienda o clienti che ci entrano}}. Restano fuori, e non si mescolano con questo, {{DA COMPILARE: i contesti separati, per esempio un secondo lavoro; se non ce ne sono, togli la frase}}: i loro materiali non si archiviano qui e le regole di qui non valgono per loro. Nel dubbio su quale contesto sia attivo in una sessione, si chiede prima di scrivere.

## La regola
Cosa entra: decisioni, fatti durevoli, persone (ruolo e rapporto), aziende e clienti, progetti, sintesi delle fonti,
regole, strumenti. Ogni soggetto ha una pagina sola.

Estrai, non caricare. Da un PDF, un foglio, una mail o una registrazione si estrae il dato in una pagina (in
`wiki/sources/` o nella pagina del soggetto) con il link all'originale. I file pesanti (PDF, documenti d'ufficio,
audio, video, immagini di lavoro) restano nell'archivio dove stanno; delle trascrizioni entra la sintesi.

Cosa non entra mai:
- segreti: password, chiavi, token, codici di accesso. Si scrive solo dove stanno: «la chiave del bot sta nella
  cartella privata, voce `telegram-token`»;
- dati personali di terzi: indirizzi, telefoni, documenti, dati bancari o sanitari. Delle persone si scrivono ruolo e
  rapporto;
- il codice dei progetti: ha un repository suo.

Una pagina che non deve uscire dal computer (una trattativa, un caso delicato) prende `riservato: true`: resta fuori
dal pacchetto per le chat di `node bin/costruisci.mjs --esporta`.

## Perché esiste

Quando lo stesso account o lo stesso computer servono a più lavori, le tracce si mescolano e una sessione non sa
per chi sta lavorando. Senza una regola su cosa entra, il cervello si riempie di siti, file pesanti e dati personali
che nessuno consulta. E una credenziale finita in un file salvato resta nella storia di Git anche dopo che il file è
stato tolto: la cura è cambiarla.

## Come si applica
Il `.gitignore` del modello esclude già credenziali e file pesanti; `node bin/controlla.mjs` cerca i segreti nei file
salvati, e la sincronizzazione tiene fuori dal salvataggio i file sospetti. Se un segreto entra per
errore si cambia la credenziale, poi si toglie il file. Il dubbio sul contesto si risolve con una domanda di una riga.

## Collegamenti
- [[dove-si-lavora]]: dove stanno le chiavi e chi scrive
- [[chiavi]]: come gli script trovano le chiavi senza mostrarle
- [[ingestione]]: come si estrae il dato da una fonte
- [[fonte-unica]]: una pagina sola per soggetto
