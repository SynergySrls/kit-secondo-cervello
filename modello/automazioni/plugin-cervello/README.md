# Plugin «cervello»

Questo plugin (un pacchetto di istruzioni che l'account di Claude installa e tiene aggiornato) porta il secondo
cervello nelle chat che non vedono la cartella: cosa leggere all'avvio, il nucleo delle regole e lo strumento giusto
per ogni richiesta. Dentro c'è una sola skill (istruzioni che l'AI apre da sola quando servono): `cervello`.

| File | Cosa contiene |
|---|---|
| `skills/cervello/SKILL.md` | l'avvio in tre casi (con la cartella, con un connettore in sola lettura, senza niente), il nucleo delle regole e la tabella «Richiesta → strumento» |
| `.claude-plugin/plugin.json` | nome, versione e descrizione del plugin |
| `README.md` | questa pagina |

## Le parti generate

Nella skill, il testo fra le righe `<!-- genera: nucleo -->` e `<!-- fine: nucleo -->`, e quello fra
`<!-- genera: instradamento -->` e `<!-- fine: instradamento -->`, lo scrive `node bin/costruisci.mjs`: il primo
dalle pagine regola (è il nucleo senza la tabella degli strumenti), il secondo dalla tabella «Richiesta → strumento»
di `wiki/meta/strumenti.md`. Non si corregge a mano: si cambia la pagina e si rilancia lo script. Il resto della skill
si scrive a mano e non contiene regole.

La versione non si tocca. Lo script calcola un'impronta del contenuto del plugin, che tiene in
`.claude-plugin/impronte.json` alla radice del cervello: se il contenuto cambia, alza l'ultima cifra della versione
in `plugin.json` (da 0.1.0 a 0.1.1) e riscrive `.claude-plugin/marketplace.json`. La data dei blocchi non conta.

## Come si collega all'account

1. Il cervello sta in un repository GitHub privato (l'archivio online della cartella) e GitHub è collegato
   all'account di Claude.
2. Su claude.ai: Personalizza > Plugin > Aggiungi marketplace (il marketplace è l'elenco di plugin da cui l'account
   li installa), con l'indirizzo `{{DA COMPILARE: proprietario/repository}}` e la sincronizzazione automatica. I nomi
   dei menu possono cambiare nel tempo.
3. Si installa il plugin «cervello» dall'elenco.
4. Se nell'account c'era già una skill con lo stesso nome caricata a mano, la si spegne prima: due skill con lo
   stesso nome si confondono.

Da lì in poi, quando sul repository arriva una versione nuova, l'account si aggiorna da solo. Su un secondo account
si ripetono i passi 2 e 3.

Per gli agenti che leggono le skill dalla cartella `.agents/skills/`, si copia lì la cartella `skills/cervello`.
