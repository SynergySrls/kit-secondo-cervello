# .raw: la casella d'ingresso delle fonti

Qui si mettono le fonti grezze da far entrare nel cervello. L'AI le legge, ne estrae i fatti nelle pagine della wiki
e lascia gli originali come sono. In Obsidian questa cartella non si vede (inizia con il punto): si apre con Esplora
file o con il Finder (Cmd+Maiuscole+punto mostra le cartelle nascoste).

## Cosa ci va
- Documenti, esportazioni (fogli, elenchi, report), trascrizioni di riunioni, mail salvate, appunti.
- In `inbox/`: le note per il cervello scritte dalle chat che non possono modificarlo, salvate come
  `AAAA-MM-GG-<tema>.md` (modello in `_modelli/nota-inbox.md`). Le integra il Custode e, una volta integrate, le
  sposta in `inbox/integrate/AAAA-MM/`.

## Cosa non va su Git
Gli originali, anche quelli di testo, restano solo sul computer: `.gitignore` esclude tutto `.raw/` tranne questo
file e le note di `inbox/`. Esportazioni, trascrizioni e mail contengono recapiti e dati di altre persone, e quello
che arriva su Git resta nella sua storia. Nel cervello entra il dato estratto, con la pagina fonte che dice dove sta
l'originale. Il posto stabile degli originali è una cartella sul computer o un archivio cloud: qui stanno il tempo di
essere letti. Le routine nel cloud quindi non li vedono: le fonti si fanno entrare sul computer.

## Come si chiede l'ingestione
- In Claude Code: `/ingerisci` (tutto ciò che non è ancora entrato) oppure `/ingerisci .raw/<nome del file>`; le note
  di `inbox/` con `/ingerisci .raw/inbox`.
- Con qualunque altra AI che lavora sulla cartella: «ingerisci i file in .raw».
- Con la manutenzione a mano (prompt D del kit), una volta a settimana. Il Custode nel cloud non vede questa cartella.

La procedura è `automazioni/ingestione.md`. Cosa entra nel cervello e cosa no lo dicono le pagine regola (in
particolare `wiki/concepts/ambito.md`): questo file non contiene regole.
