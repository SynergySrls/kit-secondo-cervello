---
title: "Procedura: ingestione delle fonti"
type: procedura
tags: [procedura, ingestione, fonti]
status: current
created: 2026-11-03
updated: 2026-11-03
---

# Procedura: ingestione delle fonti

> **Cosa fa.** Fa entrare nel cervello una fonte (un documento, un'esportazione, una trascrizione, una riunione, una
> mail salvata): ne estrae i fatti in una pagina in `wiki/sources/`, aggiorna o crea le pagine dei soggetti di cui
> parla, e lascia traccia in hot, nel log e nell'index.
> **Quando gira.** A mano con `/ingerisci` (o chiedendo «ingerisci i file in .raw»); la domenica con il Custode, per
> le fonti di `.raw/` (`automazioni/custode.md`, compito 5); con una routine propria per una fonte ricorrente.
> **Questa pagina è la procedura intera.** Una routine che ingerisce dice solo di aprirla insieme ad
> `automazioni/_comune.md`. Se il prompt e questa pagina dicono cose diverse, vale la pagina.
> **Registro.** Ogni fonte ha il suo registro, `automazioni/registro-<fonte>.md`: si legge prima e si aggiorna dopo,
> sempre.

## Le fonti
- **A mano.** I file che l'utente mette in `.raw/` (o un file o una cartella che indica lui). Il loro registro è
  `automazioni/registro-<fonte>.md` con `raw` al posto di `<fonte>`.
- **Ricorrenti.** Una fonte che produce cose nuove nel tempo e si legge con un connettore: registrazioni di riunioni,
  una casella di posta, una cartella cloud, un report periodico. Ognuna ha il suo registro e, se gira da sola, il suo
  file di routine in `automazioni/routine/` (modello `_modelli/routine.md`) che rimanda qui. Il registro dice anche
  quale connettore si usa e a quale account deve essere collegato.
- **Note per il cervello** in `.raw/inbox/`: le integra il Custode (`automazioni/custode.md`, compito 1). Se le
  ingerisci a mano, segui quel compito.

## Il registro
Al primo giro di una fonte il registro non esiste: si crea con questa forma.

```
---
title: "Registro: <fonte>"
type: meta
status: current
---

# Registro: <fonte>

Connettore e account atteso: <quale, oppure «nessuno: file in .raw/»>
Ultimo giro: AAAA-MM-GG HH:MM
Ultimo arrivo entrato: AAAA-MM-GG HH:MM

## Già entrati
| Arrivato il | Id o nome del file | Pagina fonte | Note |
|---|---|---|---|

## In attesa
| Arrivato il | Id o nome del file | Perché non è entrato | Giri passati |
|---|---|---|---|
```

«Ultimo arrivo entrato» è il segno fin dove si è arrivati: una cosa è nuova se è arrivata dopo quel momento e non è
nella tabella «Già entrati».

## Autonomia
La procedura scrive nel cervello senza chiedere conferma: fonti, entità, hot, log, index, registro. In cambio è
conservativa sui fatti: ciò che non è certo si marca *(da verificare)* invece di essere affermato, e una
contraddizione con il cervello si segnala con `> [!contradiction]` invece di essere risolta d'ufficio. Sui sistemi
esterni legge e basta.

## Passi
0. **Connettori.** Per una fonte ricorrente, verifica che il connettore sia collegato all'account scritto nel registro
   (e in `wiki/meta/id-sistemi-esterni.md`). Se non lo è: non leggere, dillo e fermati (`automazioni/_comune.md`,
   sezione 5).
1. **Contesto.** `wiki/hot.md` (l'inizio basta), `wiki/index.md` e il registro della fonte. I file grandi si leggono a
   pezzi.
2. **Novità.** Elenca ciò che c'è nella fonte e non è nel registro, **ordinato per data di arrivo** (quando il file è
   arrivato, non quando è successo il fatto: una riunione di mesi fa caricata oggi è una novità di oggi).
3. **Se non c'è niente di nuovo:** aggiorna solo «Ultimo giro» nel registro e chiudi con una riga.
4. **Per ogni novità, dalla più vecchia:**
   1. Leggila per intero; se è molto lunga, a blocchi. Se è vuota o non ancora pronta (per esempio una trascrizione
      non ancora prodotta), non ingerirla: mettila in «In attesa» e non spostare «Ultimo arrivo entrato» oltre la sua
      data. Se resta in attesa per più di due giri, avvisa l'utente.
   2. **Fonte.** Una pagina in `wiki/sources/` dal modello `_modelli/fonte.md` (per una riunione
      `_modelli/riunione.md`), con il nome che finisce con la data. **Estrai, non caricare:** i fatti che servono, i
      nodi veri e non l'elenco degli argomenti, i numeri con il loro periodo. Il testo grezzo e la trascrizione intera
      restano fuori; il campo `originale` dice dove sta l'originale (meglio un posto stabile, come una cartella cloud,
      che solo `.raw/` sul computer).
   3. **Soggetti.** Ogni persona, azienda, progetto o strumento di cui la fonte dice qualcosa che conta ha la sua
      pagina (tabella qui sotto). Se la pagina c'è già, si aggiorna quella: mai due pagine per lo stesso soggetto,
      quindi prima si cerca per nome e per varianti del nome. Se non c'è, si crea dal modello con quello che la fonte
      dice e nient'altro: niente conoscenza generica né ricerche esterne per completare il profilo, così chi legge
      distingue ciò che è stato detto da ciò che è stato dedotto. Un'azienda nuova nasce `status: prospect` e diventa
      `current` solo quando l'utente lo dice.
   4. **Link nei due sensi.** La fonte elenca i soggetti in `fonti-collegate` e li linka nel testo; ogni pagina
      soggetto aggiunge la fonte in `fonti`.
   5. **Incertezze.** Ciò che non è certo si marca *(da verificare)*. I nomi propri e le cifre delle trascrizioni
      automatiche sono la cosa che si sente peggio: se sono dubbi si marcano *(nome da verificare)*, non si corregge
      la grafia a intuito.
   6. **Contraddizioni.** Se la fonte dice una cosa diversa da una pagina del cervello, nella pagina si aggiunge un
      riquadro `> [!contradiction]` con le due versioni e la fonte di ciascuna. Non si sceglie d'ufficio.
   7. **Fatti durevoli** nelle pagine dei soggetti e dei progetti, non solo nella fonte.
5. **Hot, log, index.** Una voce in cima a «In corso adesso» di `wiki/hot.md` per ogni novità che conta (le piccole
   si raggruppano); una voce in fondo a `wiki/log.md` per il giro; una riga in `wiki/index.md` per ogni pagina nuova,
   nella sezione giusta: il link alla pagina, due punti, cosa contiene in una riga.
6. **Registro.** Una riga in «Già entrati» per ogni novità entrata, «Ultimo arrivo entrato» spostato in avanti,
   «Ultimo giro» aggiornato.

### Dove vanno le pagine
| Chi o cosa | Dove | Modello |
|---|---|---|
| Persona | `wiki/entities/persone/<nome-cognome>.md` | `_modelli/persona.md` |
| Azienda o cliente | `wiki/entities/aziende/<nome>.md` | `_modelli/azienda.md` |
| Progetto | `wiki/entities/progetti/<nome>.md` | `_modelli/progetto.md` |
| Strumento o servizio | `wiki/entities/strumenti/<nome>.md` | `_modelli/strumento.md` |
| Fonte | `wiki/sources/<tipo>-<tema>-AAAA-MM-GG.md` | `_modelli/fonte.md` |
| Riunione | `wiki/sources/riunione-<tema>-AAAA-MM-GG.md` | `_modelli/riunione.md` |

I nomi dei file sono in minuscolo, con i trattini al posto degli spazi e senza accenti.

## Cosa non fare
- Non recuperare l'arretrato di una fonte ricorrente senza che l'utente lo chieda: il segno nel registro esiste per
  questo.
- Non copiare nel cervello testi grezzi, trascrizioni intere o file pesanti.
- Niente segreti né dati personali di terzi: nomi e ruoli sì; recapiti, credenziali e documenti no. Al massimo si
  scrive dove stanno.
- Non modificare né cancellare gli originali in `.raw/`: restano come sono.
- Non costruire una regola o un numero da usare su una trascrizione dubbia senza aver visto la fonte primaria.
- Non dedurre una classificazione, un ruolo o un'appartenenza da come una cosa viene descritta: si scrive ciò che la
  fonte dice e si marca il resto *(da verificare)*.

## Avvisi
Il giro non passa mai in silenzio quando il cervello non è aggiornato. Si avvisa l'utente, in cima al resoconto,
quando:
- la fonte non risponde o l'accesso è scaduto;
- il salvataggio non riesce (anche dopo il ripiego su un ramo);
- ci sono novità che non è stato possibile ingerire (errore, contenuto vuoto, in attesa da più di due giri);
- una fonte contiene qualcosa che richiede una decisione (una scadenza vicina, un blocco, un numero che contraddice il
  cervello): l'avviso dice cosa ed entro quando.

Se è tutto a posto e non c'è niente di nuovo basta la riga nel registro, senza rumore.

## Verifica di fine giro
1. I file scritti si rileggono: frontmatter valido (`type` e `status` del vocabolario), link che puntano a pagine
   esistenti.
2. Nessuna seconda pagina per un soggetto che ne aveva già una.
3. Nessuna contraddizione introdotta con le pagine di `wiki/concepts/` e `wiki/sources/` sullo stesso tema.
4. Il registro dice esattamente ciò che è stato scritto.
5. Se puoi, `node bin/controlla.mjs`: i rossi causati da questo giro si correggono prima di chiudere.

## Chiusura
1. **Resoconto.** In cima gli avvisi. Poi: quante novità sono entrate e da quale fonte, quali pagine sono state
   scritte (le entità nuove a parte), le decisioni per l'utente in ordine di urgenza, l'esito del salvataggio. Se non
   c'era niente di nuovo, una riga sola.
2. **In una routine:** battito e salvataggio come in `automazioni/_comune.md`, anche quando è cambiato solo il
   registro. **A mano:** la chiusura di sessione di `AGENTS.md` (in Claude Code `/chiudi`).
