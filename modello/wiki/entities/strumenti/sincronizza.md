---
title: "Sincronizza (bin/sincronizza.mjs e bin/installa-sincronizzazione.mjs)"
type: strumento
tags: [strumento, cervello, git, sincronizzazione]
status: current
created: 2026-11-03
updated: 2026-11-03
# esporta: no, perché la pagina serve solo sul computer: resta fuori dal pacchetto per le chat
esporta: no
---

# Sincronizza

## In breve
- Salva il cervello nel repository Git e lo allinea con le modifiche fatte altrove (routine nel cloud, altri
  computer), ogni pochi minuti, senza finestre e senza domande.
- Tiene fuori dal salvataggio i file che sembrano contenere segreti e quelli troppo grandi. Se due modifiche si
  scontrano non decide da solo: parcheggia le sue su un ramo a parte e si ferma.
- `bin/installa-sincronizzazione.mjs` lo fa partire da solo: attività pianificata su Windows, agente su macOS, riga
  di pianificazione su Linux.

## Come si lancia
Dalla cartella del cervello:
```
node bin/sincronizza.mjs               un giro completo, con l'esito sullo schermo (a mano, o da un agente a fine sessione)
node bin/sincronizza.mjs --pianificato un giro senza niente sullo schermo, con il battito: lo lancia l'attività pianificata
node bin/sincronizza.mjs --prova       fa i controlli, senza salvare, senza rete e senza toccare ciò che hai già preparato con git add
node bin/sincronizza.mjs --pausa       mette in pausa i giri automatici
node bin/sincronizza.mjs --riprendi    toglie la pausa
node bin/sincronizza.mjs --secondario  segna questo computer come secondario (niente battito); --principale lo toglie
node bin/sincronizza.mjs --stato       ultime righe del registro, lock, pausa, conflitto aperto
node bin/sincronizza.mjs --aiuto      come si usa
```
Codici d'uscita: 0 giro riuscito, niente da fare, in pausa o in attesa che un conflitto venga unito; 1 giro fermo o
non riuscito (il motivo è nel registro), compreso il giro che parcheggia un conflitto; 2 opzione sconosciuta o
errore d'uso.

Le impostazioni stanno in `bin/impostazioni.json`, sezione `sincronizza`: ramo principale (`main`), prefisso dei rami
di conflitto (`conflitto/`), ogni quanti minuti gira (10), durata della pausa in ore (3), durata massima del lock in
minuti (15), misura massima di un file da salvare in MB (`maxMB`, 50: GitHub rifiuta i file oltre 100 MB).

## La cartella di stato
Sta fuori dal cervello, così non finisce mai su Git: `~/.cervello-sync/<nome della cartella del cervello>/`
(la tilde è la cartella dell'utente), oppure la cartella indicata dalla variabile d'ambiente `CERVELLO_SYNC_DIR`.
Dentro:
- `sync.log`: il registro dei giri; oltre i 2 MB viene ruotato, così non cresce senza fine.
- `sync.lock`: numero del processo e ora di partenza. Impedisce due giri insieme; vale solo se quel processo è ancora
  vivo e il lock ha meno di 15 minuti, altrimenti si ignora.
- `pausa`: se esiste ed è più giovane di 3 ore, il giro esce subito; se è più vecchia, il giro la toglie e riparte.
  La crea `--pausa`, la toglie `--riprendi`.
- `conflitto.txt`: c'è un conflitto parcheggiato; dice su quale ramo.
- `secondario`: file segnale che si crea con `--secondario` sui computer che non sono il principale. Lì il giro non scrive il
  battito, così due computer non si scontrano ogni mattina sullo stesso file.
- `da-riprendere.md`: file segnale facoltativo, non lo usa questo script. Si scrive a mano (o lo scrive un agente)
  quando un lavoro è rimasto a metà, e il controllo all'avvio di Claude Code ([[hook]]) lo mostra in cima alla
  sessione successiva.

## Un giro, passo per passo
1. Se c'è la pausa ancora valida, esce.
2. Prende il lock (se un altro giro è in corso, esce).
3. Disattiva ogni richiesta di credenziali a schermo: se Git non può autenticarsi, il giro fallisce e lo scrive nel
   registro, invece di aspettare qualcuno.
4. Si ferma e lo scrive («FERMO» nel registro) se c'è un rebase, un merge, un cherry-pick o un revert rimasto a
   metà, se un file ha un conflitto non risolto (segni `<<<<<<<` dentro), se il cervello non è sul ramo principale
   (se il ramo principale non esiste ancora, per esempio il repository è nato su `master`, consiglia
   `git branch -m main`), o se la cartella non è la radice del suo repository Git (così non salva mai un repository
   che sta sopra). Va sistemato a mano.
5. Al primo giro pianificato del giorno (`--pianificato`), se il computer non è secondario, scrive il battito
   `automazioni/battiti/sincronizza.txt`. I giri lanciati a mano non lo scrivono: il battito dice che la
   sincronizzazione automatica è viva.
6. `git add -A`. I file più grandi di `maxMB` escono dal salvataggio, e il registro dice quali. Gli altri passano a
   `node bin/controlla.mjs --segreti`, a gruppi: quelli sospetti escono dal salvataggio (`git reset` su quel file) e
   il registro lo dice, senza il valore. Se il controllo stesso va in errore, finisce il tempo o risponde in modo che
   non si capisce, per prudenza resta fuori tutto il gruppo.
7. Salva con il messaggio «Sync automatico da <nome del computer>, AAAA-MM-GG HH:MM».
8. Se il repository non ha un remoto, si ferma qui: il salvataggio resta solo locale.
9. Scarica le novità dal remoto (`fetch`). Se il remoto è nuovo e vuoto, fa il primo caricamento del ramo
   (`git push -u`, che collega il ramo locale a quello remoto: così anche i comandi scritti a mano sanno dove andare)
   e finisce.
10. Se c'è un conflitto parcheggiato: se quel ramo è già stato unito nel ramo principale del remoto (lo fa il Custode
    o l'utente), riprende spostando sopra i salvataggi nati dopo (`rebase --onto`); se anche questi vanno in
    conflitto, li parcheggia su un ramo nuovo come al punto 11. Se il ramo non è ancora unito, aspetta e non fa altro.
11. `git pull --rebase --autostash`. Se fallisce: annulla il rebase, crea il ramo
    `conflitto/<computer>-AAAAMMGG-HHMM` sulla punta del lavoro locale, lo carica sul remoto, scrive `conflitto.txt`
    ed esce con 1.
12. `git push`. Se il remoto lo rifiuta perché un file è troppo grande, si ferma con FERMO e scrive la via d'uscita
    (`git reset --soft origin/main`, togliere il file, lasciar ripartire). Se nel punto 11 Git, rimettendo a posto i
    file tenuti fuori, ha lasciato un conflitto, carica i salvataggi e poi si ferma con FERMO: il file va sistemato a
    mano, e finché resta così il giro non salva niente.

## Installare il giro automatico
```
node bin/installa-sincronizzazione.mjs          mostra cosa farebbe, senza fare niente
node bin/installa-sincronizzazione.mjs --fai    lo fa
node bin/installa-sincronizzazione.mjs --togli  toglie il giro automatico
```
- **Windows**: un'attività pianificata «Secondo cervello - sincronizza <nome della cartella>», ogni 10 minuti, che
  lancia Node attraverso `conhost.exe --headless`: nessuna finestra si apre. Subito dopo permette i giri anche a
  batteria (un'attività creata con `schtasks` di suo si ferma quando il portatile è staccato dalla corrente); se
  questo secondo passo non riesce, lo dice e spiega come farlo a mano.
- **macOS**: un file in `~/Library/LaunchAgents/` (`it.secondo-cervello.sincronizza.<nome>.plist`) che parte
  all'accesso e poi ogni 10 minuti, caricato con `launchctl load`.
- **Linux**: una riga nella pianificazione dell'utente (crontab) che ogni 10 minuti entra nella cartella e lancia lo
  script.

In tutti e tre i casi lo script parte con `--pianificato`: niente sullo schermo (cron manderebbe una mail a ogni
giro) e il battito del giorno.

Il percorso di Node è quello con cui si lancia l'installatore. Se si sposta il cervello o si cambia versione di Node
si rilancia con `--fai`. Il giro pianificato usa sempre la cartella di stato predefinita: la variabile
`CERVELLO_SYNC_DIR` serve alle prove e l'attività pianificata non la vede. Codici d'uscita dell'installatore: 0 in
ordine, 1 comando di sistema non riuscito, 2 opzione sconosciuta.

## Cosa NON fa
- Non risolve i conflitti: li parcheggia su un ramo `conflitto/...` e aspetta. Li unisce il Custode
  (`automazioni/custode.md`) o l'utente.
- Non salva i file che sembrano contenere segreti e non stampa mai il valore trovato.
- Non apre finestre e non fa domande: è pensato per girare nascosto. Lanciato a mano scrive l'esito sullo schermo;
  con `--pianificato` (l'attività pianificata) no.
- Non manda avvisi: se smette di girare se ne accorge il [[controlla|controllo]], perché il battito `sincronizza`
  invecchia (cadenza «ogni 3 giorni» in `automazioni/LEGGIMI.md`), e lo dice [[avvisa]].
- Non copia il cervello su cartelle sincronizzate (Drive, OneDrive, Dropbox): se si vuole una copia di sola lettura
  è un lavoro a parte ([[dove-si-lavora]]).

## Dove gira
Sul computer dove si lavora con la cartella, con Git e Node 18 o più recente: Windows, macOS e Linux. Solo un
computer è il principale; sugli altri si lancia una volta `node bin/sincronizza.mjs --secondario`. Le routine nel cloud non
lo usano: salvano da sole come dice `automazioni/_comune.md`. A computer spento non gira, e il battito lo mostra.

## Collegamenti
- [[dove-si-lavora]]: una sola copia scrivibile, il repository come fonte di verità.
- [[controlla]]: il controllo dei segreti usato prima del salvataggio.
- [[hook]]: all'avvio di Claude Code mostra la pausa e i rami di conflitto aperti.
