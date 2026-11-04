---
description: Crea o cambia una regola del cervello come pagina, senza contraddire quelle che ci sono, e rigenera il nucleo
argument-hint: "[descrizione della regola]"
---

# /nuova-regola

Regola da scrivere: $ARGUMENTS

Una regola è una pagina sola in `wiki/concepts/`, con `type: regola`. Il metodo intero sta in
`wiki/concepts/fonte-unica.md`.

## Cosa fai
1. **Capisci la regola.** Cosa si fa o non si fa, in quale ambito vale (`tutto` o una chiave dell'elenco `ambiti` di
   `bin/impostazioni.json`), se deve stare nel nucleo, da quale fatto nasce. Se l'argomento è vuoto, ricavalo dalla
   conversazione. Se manca qualcosa di decisivo, fai una domanda sola.
2. **Cerca se esiste già.** `node bin/costruisci.mjs --elenco`, poi una ricerca per parole chiave in
   `wiki/concepts/`, in `AGENTS.md`, in `automazioni/` e in `wiki/meta/frasi-superate.md`.
   - Se esiste una regola sullo stesso tema, si cambia quella: mai una seconda pagina parallela.
   - Se la nuova regola contraddice una vecchia, la vecchia prende `status: superseded` e
     `superata-da: [nome-della-nuova]`; non si cancella.
   - Se l'utente vuole una regola che contraddice una sua decisione scritta, faglielo notare una volta, poi fai come
     dice.
3. **Scrivi la pagina** `wiki/concepts/<nome-in-minuscolo-con-trattini>.md` dal modello `_modelli/regola.md`:
   - «In breve» subito dopo il titolo, da 1 a 4 righe che iniziano con `- `, eseguibili senza aprire la pagina;
   - poi «La regola» con un esempio di cosa si fa e uno di cosa non si fa, «Perché esiste» con il fatto che l'ha fatta
     nascere, «Come si applica» se serve, «Collegamenti»;
   - nel frontmatter `fonte` dice chi l'ha decisa e quando;
   - se serve un ambito nuovo, aggiungilo all'elenco `ambiti` di `bin/impostazioni.json` con il suo titolo.
4. **Frasi superate.** Se la regola ne supera una che può ancora trovarsi scritta in giro, aggiungi una riga in
   `wiki/meta/frasi-superate.md` (la frase nelle sue varianti, la regola nuova, dove cercarla, se blocca).
5. **Rigenera e controlla.** `node bin/costruisci.mjs`: se si ferma, correggi la pagina come dice e rilancia. Poi
   `node bin/controlla.mjs` e correggi i rossi che hai causato (per esempio la frase superata ancora presente in una
   pagina: si corregge quella pagina).
6. **Index e log.** Una riga nella sezione «Regole» di `wiki/index.md`, sotto il suo ambito (la vecchia, se superata,
   passa sotto «Superate, solo storico»), e una voce in fondo a `wiki/log.md`.
7. **Rispondi** con il nome della pagina, le righe dell'In breve e cosa è stato superato.

## Cosa non fai
- Non scrivi paragrafi di regola in `AGENTS.md`, in `CLAUDE.md`, nelle memorie dell'AI, nelle skill o nei prompt delle
  routine: lì al massimo un rimando alla pagina.
- Non modifichi a mano `wiki/meta/nucleo.md` né i blocchi generati: li scrive `node bin/costruisci.mjs`.
- Non crei una seconda pagina sullo stesso tema e non cancelli la vecchia.
- Non trasformi un consiglio generale in regola: se non c'è una decisione dell'utente o un fatto che la giustifica,
  dillo e chiedi.
