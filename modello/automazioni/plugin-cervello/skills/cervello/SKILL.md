---
name: cervello
description: >
  Avvio di ogni sessione con il secondo cervello di {{DA COMPILARE: nome}}: fa leggere AGENTS.md e il
  nucleo delle regole, dice quale strumento usare per ogni richiesta e come si lavora quando la cartella
  del cervello non c'è. Usala all'inizio di ogni lavoro per {{DA COMPILARE: nome}} e quando si dice
  «apri il cervello», «cosa sappiamo di», «archivia», «che strumento uso». Non copre i metodi di lavoro
  generici (scrittura, analisi, marketing), che portano le altre skill, e non vale per
  {{DA COMPILARE: i contesti che non c'entrano, per esempio i clienti di un'altra persona}}.
---

# Cervello

Questa skill è la porta d'ingresso al secondo cervello di {{DA COMPILARE: il tuo nome}}. Le parti fra le righe
`<!-- genera: ... -->` e `<!-- fine: ... -->` le scrive `node bin/costruisci.mjs` dalle pagine regola: non si
correggono qui, si corregge la pagina e si rigenera. La fonte di questo plugin è `automazioni/plugin-cervello/` nel
cervello.

Un nome fra doppie quadre, per esempio [[fonte-unica]], è una pagina del cervello: sta in `wiki/concepts/` o altrove
in `wiki/`, con lo stesso nome e l'estensione `.md`.

## 1. Prima di rispondere

1. **Con la cartella del cervello** (un agente aperto nella cartella, o un'app a cui la cartella è collegata): leggi
   `AGENTS.md` e fai quello che dice, cioè `wiki/hot.md`, `wiki/index.md` e poi la pagina che serve. Il cervello vale
   su questa skill.
2. **Senza cartella, ma con un connettore che legge il repository o una sua copia**: leggi da lì gli stessi file, in
   sola lettura, e dillo in una riga. Se il nucleo che trovi lì (`wiki/meta/nucleo.md`, riga `aggiornato`) è più
   recente della data dei blocchi qui sotto, vale quello.
3. **Senza niente**: lavora con il nucleo qui sotto e dillo in una riga.

Senza cartella non si scrive nel cervello. Quando nasce un fatto da ricordare, alla fine prepara una NOTA PER IL
CERVELLO che l'utente salverà in `.raw/inbox/` come `AAAA-MM-GG-<tema>.md`: frontmatter con `type: nota-inbox`,
`data` e `da` (quale AI o superficie), poi le sezioni «Cosa è successo o si è deciso», «Dove va nel cervello» e «Da
verificare».

## 2. Le regole (nucleo)

<!-- genera: nucleo -->
> Generato il 2026-11-06 da `node bin/costruisci.mjs` dalle pagine regola: non si modifica a mano.
> Per cambiare una regola si cambia la sua pagina (sezione «In breve») e si rilancia lo script.

Qui ogni regola è in breve; la regola intera sta nella pagina linkata. Se una memoria, una skill o un plugin dicono
altro, vale questo nucleo.

### Prima di tutto: di chi è questa sessione

Questo cervello è di {{DA COMPILARE: il tuo nome}} e contiene il lavoro per {{DA COMPILARE: attività, azienda o clienti che ci entrano}}. Restano fuori, e non si mescolano con questo, {{DA COMPILARE: i contesti separati, per esempio un secondo lavoro; se non ce ne sono, togli la frase}}: i loro materiali non si archiviano qui e le regole di qui non valgono per loro. Nel dubbio su quale contesto sia attivo in una sessione, si chiede prima di scrivere. ([[ambito]])

### Valgono sempre

#### Fonte unica delle istruzioni e attribuzione ([[fonte-unica]])
- Le istruzioni sono una sola: `AGENTS.md` più le pagine regola, riassunte nel [[nucleo]]; se una memoria, una skill o un plugin dicono altro, vale il cervello.
- Prima di creare qualcosa si cerca se esiste già e non lo si contraddice: il vecchio diventa `superseded` con `superata-da`, mai un doppione.
- Ogni regola o numero citato punta a una pagina, il resto è «prassi generale, non regola mia»; una regola vale solo nel suo `ambito`.

#### Di chi è il cervello e cosa ci entra ([[ambito]])
- Estrai, non caricare: dai documenti si estrae il dato in una pagina con il link all'originale; file pesanti e trascrizioni grezze restano fuori.
- Mai segreti né dati personali di terzi: si scrive solo dove stanno. Le pagine delicate hanno `riservato: true`.

#### Dove si lavora e dove si scrive ([[dove-si-lavora]])
- Si scrive in una copia sola, la cartella del cervello (con Git fa fede il repository); mai modificare attraverso un connettore o una seconda copia sincronizzata: nascono doppioni. Se il cervello sta in un archivio cloud per scelta (strada D in [[mappa-del-cervello]]), scrive un solo computer e lì niente Git.
- Chi non può scrivere legge in sola lettura, lo dice e prepara una nota per `.raw/inbox/`.
- Le chiavi stanno nella cartella privata fuori dal cervello: non si leggono e non si stampano.

#### Leggi il cervello prima di analizzare ([[leggi-prima-di-analizzare]])
- Prima di un'analisi o di un report si leggono hot, index e le fonti già presenti, e si dice da cosa si parte.
- Un numero che contraddice il cervello si segnala e si verifica prima di concludere.
- A fine lavoro i fatti durevoli vanno nelle pagine, non solo nella risposta.

#### Verificato, non dedotto ([[verificato-non-dedotto]])
- Un'assenza non si deduce: si cerca per nome o id e si guarda se l'elenco è troncato o i dati convertiti male.
- Una correzione si verifica sull'effetto al giro successivo, non rileggendo l'impostazione.
- Sui sistemi esterni vale la lettura dal vivo, non lo stato scritto nel cervello, che si corregge subito.

#### Sistemi esterni: si legge sempre, si scrive con il sì ([[sistemi-esterni]])
- Sui sistemi esterni si legge liberamente; si scrive, si invia, si pubblica o si cancella solo con il sì su quella operazione.
- Ciò che si crea fuori nasce in bozza o spento.
- Prima di usare un connettore si controlla l'account collegato: se è sbagliato ci si ferma e lo si dice.
- Un oggetto che si sostituisce intero si rilegge prima e si verifica dopo.

#### Lo strumento giusto per ogni richiesta ([[strumento-giusto]])
- Per una richiesta operativa si usa lo strumento della tabella «Richiesta → strumento», senza chiedere quale.
- Prima di dire «non esiste» si leggono [[strumenti]] e l'elenco di `bin/`.
- Mai un secondo strumento sullo stesso compito: si estende quello che c'è; uno strumento nuovo è script, pagina e riga del registro insieme.

#### Il lavoro si consegna intero ([[lavoro-consegnato-intero]])
- Il lavoro si consegna finito, mai fermo in attesa di un permesso che nessuno ha chiesto.
- I dubbi vanno in fondo, in una lista di massimo dieci domande sì o no.
- Le decisioni dell'utente sono chiuse; un rilievo si dice una volta sola.
- Non si cancella nulla: ciò che esce va in `_da_eliminare/` e la svuota l'utente.

#### Ogni errore che può ripetersi diventa una pagina ([[imparare-dagli-errori]])
- Un errore che può ripetersi diventa una pagina (regola o concetto) nella stessa sessione: il log non protegge.
- Una correzione che l'utente ripete diventa una riga No/Sì in [[come-scrivere-per-me]].
- Dopo una modifica in blocco si fa una lettura indipendente del risultato.

### Testi che leggerà qualcun altro

#### Come si scrive per me ([[come-scrivere-per-me]])
- Con me si parla in {{DA COMPILARE: lingua}}, anche nel terminale; un termine tecnico straniero solo se devo scriverlo o cliccarlo, spiegato tra parentesi.
- Si scrive come a una persona competente: niente preamboli, spiegazioni non richieste o metafore; si chiude con l'azione concreta.
- Prima di consegnare un testo si rileggono le mie correzioni ricorrenti (le tabelle No/Sì).
- Mai la lineetta lunga né quella media: due punti, virgole, parentesi o un punto fermo.

### Le altre regole (si aprono quando servono)

Nessuna, per ora.
<!-- fine: nucleo -->

## 3. Quale strumento per ogni richiesta

La tabella viene dal registro degli strumenti, `wiki/meta/strumenti.md`.

<!-- genera: instradamento -->
| Parole tipiche | Strumento, per primo | Dove gira | Da non usare | Pagina |
|---|---|---|---|---|
| nuova regola, regola nuova, cambiare una regola, cambia una regola, nucleo | `/nuova-regola`, o la pagina e poi `node bin/costruisci.mjs` | computer con Node | regole in `AGENTS.md` o nelle memorie; nucleo a mano | [[fonte-unica]] |
| controlla il cervello, controllo del cervello, link rotti, segnaposto | `node bin/controlla.mjs` ([[stato-controlli]] lo scrive GitHub; senza repository online `--scrivi`) | computer, GitHub | stato dei controlli a mano | [[controlla]] |
| sincronizza, sincronizzazione, salva su github, salvataggio su github, conflitto di sincronizzazione | `node bin/sincronizza.mjs` (`--stato`) | computer principale con Git | una cartella sincronizzata (strada D); un agente nel cloud (strada C), che salva con commit e push | [[sincronizza]] |
| ingerisci, ingestione, fonte nuova, archivia | `/ingerisci` o `automazioni/ingestione.md` | dove si scrive | il file intero nel cervello | [[ingestione]] |
| chiudi, chiusura, fine sessione | `/chiudi` (chiusura di `AGENTS.md`) | dove si scrive | chiudere senza hot e log | [[log]] |
| altra ai, altre ai, chat esterna, esporta, file di conoscenza | `node bin/costruisci.mjs --esporta` | computer con Node | pagine copiate a mano nelle chat | [[costruisci]] |
| chiave, password, token, credenziali, segreto | `node bin/lib/chiavi.mjs --verifica` (mai il valore) | computer | file delle chiavi letti o stampati | [[chiavi]] |
| avviso, telefono, telegram, notifica | `node bin/avvisa.mjs "testo"` | computer, GitHub | | [[avvisa]] |
| strumento nuovo, script nuovo, strumento che non esiste, script che non trovo, manca uno strumento | [[strumenti]] e `bin/`: si estende quello che c'è | ovunque | un secondo strumento | [[strumento-giusto]] |
<!-- fine: instradamento -->

## 4. Le altre skill

Le skill generiche (scrittura, analisi, marketing e simili) portano un metodo, non le regole: se dicono altro, vale
il nucleo qui sopra.

Questa stessa cartella `skills/cervello` si può copiare in `.agents/skills/` per gli agenti che leggono le skill da
lì.
