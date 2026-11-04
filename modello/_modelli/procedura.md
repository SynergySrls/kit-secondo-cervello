---
title: "Procedura: <cosa fa>"
type: procedura
tags: [procedura]
status: current
created: AAAA-MM-GG
updated: AAAA-MM-GG
---

# Procedura: <cosa fa>

> **Cosa fa.** <In due righe.>
> **Quando gira.** <A mano, oppure con la routine `<nome>` in `automazioni/routine/`, ogni ...>
> **Questa pagina è la procedura intera.** Il prompt della routine dice solo di aprirla insieme ad
> `automazioni/_comune.md` (avvio, salvataggio, battito). Se il prompt e questa pagina dicono cose diverse, vale la
> pagina.
> **Registro.** <`automazioni/registro-<fonte>.md`: si legge prima e si aggiorna dopo, sempre. Se la procedura non
> ha un registro, togli questa riga.>

## Autonomia
<Cosa può scrivere senza chiedere e cosa no. Di solito: scrive nel cervello senza chiedere, ma è conservativa sui
fatti (ciò che non è certo si marca *(da verificare)*, le contraddizioni si segnalano con `> [!contradiction]` e non
si risolvono d'ufficio). Sui sistemi esterni legge; scrive, invia o pubblica solo con il sì dell'utente su quella
singola operazione.>

## Passi
0. **Connettori.** Prima di leggere qualunque cosa, verifica a quale account è collegato ogni connettore che usi
   (gli account attesi stanno in `wiki/meta/id-sistemi-esterni.md`). Se non è quello giusto: non leggere, non scrivere, dillo in cima
   al resoconto e fermati. Non cambiare account da solo.
1. **Contesto.** Avvio come in `automazioni/_comune.md`, poi le pagine che servono (linkate, non copiate qui).
2. **Registro.** <Data dell'ultimo giro ed elenco di ciò che è già stato fatto.>
3. **Novità.** <Come si trova cosa c'è di nuovo, ordinato per data di arrivo.>
4. **Se non c'è niente di nuovo:** aggiorna solo la riga «ultimo giro» del registro e chiudi con una riga.
5. **Per ogni novità:** <cosa si fa, passo per passo>.
6. **Scrittura:** <quali file e basta: per esempio una pagina in `wiki/sources/`, una voce in cima a «In corso
   adesso» di `wiki/hot.md`, una voce in fondo a `wiki/log.md`>.
7. **Registro aggiornato** con ciò che è entrato davvero.

## Cosa non fare
- <Il rischio tipico di questo lavoro, scritto come divieto con il motivo.>
- Non recuperare l'arretrato senza che l'utente lo chieda.

## Avvisi
<Quando avvisare l'utente: la fonte non risponde, il salvataggio non riesce, qualcosa non è entrato, c'è una
decisione da prendere (cosa ed entro quando). Mai silenzio se il cervello non è aggiornato; niente rumore se è tutto
a posto e non c'è niente di nuovo: basta la riga nel registro.>

## Verifica di fine giro
1. I file scritti si rileggono: frontmatter valido, link che puntano a pagine esistenti.
2. Nessuna contraddizione introdotta con le pagine sullo stesso tema.
3. Il registro dice esattamente ciò che è stato scritto.

## Chiusura
1. **Resoconto:** in cima gli avvisi, poi cosa è entrato e dove, le decisioni per l'utente in ordine di urgenza,
   l'esito del salvataggio. Se non c'era niente di nuovo, una riga sola.
2. **Battito e salvataggio** come in `automazioni/_comune.md`. Non si chiude mai senza dire se il salvataggio è
   riuscito.

## Collegamenti
- [[nome-pagina]]
