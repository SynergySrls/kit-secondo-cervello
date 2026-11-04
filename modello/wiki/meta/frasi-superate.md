---
title: "Frasi superate"
type: meta
status: evergreen
created: 2026-11-03
updated: 2026-11-03
tags: [meta, regole, controlli]
---

# Frasi superate

Frasi di regole vecchie che non devono più comparire nei file. `node bin/controlla.mjs` le cerca a ogni giro: rosso se
la riga dice «sì» nella colonna Blocca, giallo se dice «no».

Quando una regola nuova ne supera una vecchia, nello stesso lavoro si aggiunge qui la frase vecchia con le sue
varianti ([[fonte-unica]]). Di solito servono due righe per frase: una con Blocca «sì» per i file che danno istruzioni
(`AGENTS.md` · `CLAUDE.md` · `type: regola` · `automazioni/**`) e una con Blocca «no» per il resto (`wiki/**`).

Come si compila una riga:
- Frase: una o più varianti tra «», separate da « · ». Basta il pezzo che si riconosce, non la frase intera.
- Superata da: il link alla regola nuova. Quella pagina non viene cercata, perché cita la frase per vietarla.
- Dove cercarla: percorsi o modelli tra apici inversi separati da « · », oppure `type: regola` per tutte le pagine
  regola.
- Blocca: «sì» o «no».

Nella ricerca maiuscole, asterischi, apici inversi, virgolette e a capo non contano. Non contano come presenze: una
riga con una negazione nei 45 caratteri prima della frase (mai, niente, nessun, non si, invece di, né, anziché), le
righe che dicono che la frase è superata, abolita o che «non vale più», le sezioni di storia, origine, «perché esiste»
e log, le pagine superate o archiviate, il log, hot e i suoi archivi.

La riga qui sotto è un esempio: si sostituisce con la prima frase vera.

| Frase | Superata da | Dove cercarla | Blocca |
|---|---|---|---|
| «frase di esempio da sostituire» | [[fonte-unica]] | `wiki/concepts/**` | no |

## Dove stanno oggi fuori dal cervello

Copie fuori dalla cartella che contengono ancora una frase superata e vanno corrette a mano: prompt delle routine
sull'account, skill caricate a mano, istruzioni incollate in una chat. Il controllo non le vede.
- Nessuna, per ora.
