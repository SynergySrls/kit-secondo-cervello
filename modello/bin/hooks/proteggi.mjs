#!/usr/bin/env node
// Hook PreToolUse sugli strumenti Bash e PowerShell (e, come rete in più, Read e Grep): nega i comandi che
// mostrerebbero il valore di una chiave o di un segreto, con il motivo e cosa usare al posto. Tutto il resto passa.
// Cosa nega:
//   - la lettura di file nella cartella delle chiavi (cat, type, Get-Content, gc, more, less, head, tail,
//     Select-String, findstr e simili) quando il comando cita quella cartella («chiavi.cartella» di
//     bin/impostazioni.json, o CERVELLO_CHIAVI_DIR) oppure «Cervello-Privato»; con Read e Grep, un percorso dentro
//     la cartella delle chiavi (o, per Grep, la cartella che la contiene);
//   - op read e op item get con --reveal (op è il comando da terminale di un gestore di password, per esempio
//     1Password);
//   - printenv, env, set, export o Get-ChildItem env: da soli, che stampano tutte le variabili d'ambiente;
//   - gh auth token e git credential fill, che stampano le credenziali salvate;
//   - echo (o printf, Write-Output, Write-Host) di variabili d'ambiente con TOKEN, KEY, SECRET o PASSWORD come parola
//     a sé nel nome (GITHUB_TOKEN sì, MONKEY_NAME o il $key di un ciclo no) o elencate in «chiavi», printenv di
//     una di queste, oppure la variabile scritta da sola ($env:NOME in PowerShell la stampa).
// È una rete di sicurezza, non una garanzia: un comando scritto in altro modo può sfuggire. La regola resta che le
// chiavi non si leggono e non si stampano ([[dove-si-lavora]]); per sapere se ci sono: node bin/lib/chiavi.mjs --verifica.
// Pagina: wiki/entities/strumenti/hook.md · Registro: wiki/meta/strumenti.md
//
// Prova a mano:  echo {"tool_name":"Bash","tool_input":{"command":"git status"}} | node bin/hooks/proteggi.mjs
// (nessuna uscita = il comando passa; un JSON con permissionDecision «deny» = il comando è negato)
// Si spegne con CERVELLO_HOOK=spenti (regole comuni in bin/hooks/comune.mjs).

import os from 'node:os';
import path from 'node:path';
import { RADICE, ingresso, nega, esegui, cartellaChiavi, espandi, impostazioni } from './comune.mjs';

const VERIFICA = 'Per sapere se una chiave c\'è, senza vederla: node bin/lib/chiavi.mjs --verifica. Gli script la prendono da soli con bin/lib/chiavi.mjs (funzione chiave). Regola: [[dove-si-lavora]].';
const MOTIVI = {
  file: 'Negato dall\'hook proteggi: il comando leggerebbe un file della cartella delle chiavi e ne mostrerebbe il valore. Le chiavi non si leggono e non si stampano. ' + VERIFICA,
  op: 'Negato dall\'hook proteggi: op read e op item get --reveal mostrano il valore di una credenziale. Se serve a uno script, lo script la legge da solo; se serve all\'utente, la apre lui dal suo gestore di password. ' + VERIFICA,
  dump: 'Negato dall\'hook proteggi: printenv, env, set, export o Get-ChildItem env: da soli stampano tutte le variabili d\'ambiente, chiavi comprese. Si stampa solo la variabile innocua che serve (per esempio echo $HOME). ' + VERIFICA,
  credenziali: 'Negato dall\'hook proteggi: gh auth token e git credential fill stampano le credenziali salvate (il token di GitHub). Per sapere se l\'accesso funziona: gh auth status, oppure git ls-remote origin. ' + VERIFICA,
  eco: nome => `Negato dall'hook proteggi: il comando stamperebbe la variabile ${nome}, che dal nome sembra una chiave. Per sapere se è impostata senza mostrarla: node bin/lib/chiavi.mjs --verifica, oppure in bash [ -n "$${nome}" ] && echo impostata. Regola: [[dove-si-lavora]].`,
};

const LETTORI = /(^|[\s;&|(`'"=:.])(cat|type|more|less|head|tail|bat|nl|od|xxd|hexdump|strings|base64|grep|egrep|fgrep|rg|awk|sed|findstr|get-content|gc|select-string|sls|readalltext|readalllines|readallbytes|readfilesync|readfile|open)(\.exe)?(?=[\s"'(]|$)/i;
const OP_READ = /(^|[\s;&|(`])op(\.exe)?\s+read(\s|$)/i;
const OP_GET = /(^|[\s;&|(`])op(\.exe)?\s+item\s+get(\s|$)/i;
const DUMP = /^(printenv|env|set|export|export\s+-p|declare\s+-[px]+|(get-childitem|gci|dir|ls|get-item)\s+env:[\\/]?\*?|\[(system\.)?environment\]::getenvironmentvariables\(\s*\))$/i;
const STAMPA = /^(echo|printf|print|write-output|write-host|write|out-host|say)(\s|$)/i;
// Un nome di variabile «da chiave»: in stile variabile d'ambiente (maiuscole, oppure letta con $env: o %NOME%), con
// la parola isolata dai trattini bassi (GITHUB_TOKEN sì, MONKEY_NAME no, $key di un ciclo no), oppure uno dei nomi
// elencati nella voce «chiavi» di bin/impostazioni.json.
const PAROLA_CHIAVE = /(^|_)(TOKEN|KEY|APIKEY|SECRET|PASSWORD|PASSWD|PWD|PASS|CREDENTIALS?)(_|$)/i;
const NOMI_CHIAVI = (() => {
  try {
    const elenco = impostazioni()?.chiavi?.elenco || {};
    return new Set(Object.values(elenco).flatMap(v => (Array.isArray(v?.env) ? v.env : [])).map(s => String(s).toUpperCase()));
  } catch { return new Set(); }
})();
const sensibile = (nome, daEnv = false) => NOMI_CHIAVI.has(String(nome).toUpperCase()) ||
  ((daEnv || /^[A-Z0-9_]+$/.test(nome)) && PAROLA_CHIAVE.test(nome));
// Comandi che stampano una credenziale salvata: il token di GitHub CLI, le credenziali di Git.
const CREDENZIALI = /(^|[\s;&|(`])(gh(\.exe)?\s+auth\s+token|git(\.exe)?\s+credential(-\w+)?\s+(fill|get))(\s|$)/i;

const norm = s => String(s || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();

// Le forme in cui un comando può citare la cartella delle chiavi.
function aghi() {
  const casa = norm(os.homedir());
  const cartella = norm(cartellaChiavi());
  const out = new Set(['cervello-privato', cartella]);
  if (cartella.startsWith(casa + '/')) {
    const rel = cartella.slice(casa.length + 1);
    if (rel.includes('/')) out.add(rel); // con almeno due livelli il nome da solo basta (cervello-privato/chiavi)
    for (const pre of ['~', '$home', '${home}', '%userprofile%', '$env:userprofile', '${env:userprofile}', '$env:home']) out.add(`${pre}/${rel}`);
  }
  return [...out].filter(a => a.length >= 6);
}

// Il comando diviso nei suoi pezzi (;, &&, ||, |, a capo), senza le parentesi, le virgolette o i prefissi davanti
// (sudo, cmd /c, bash -c, powershell -Command e simili).
const PREFISSI = /^(\$\(|@\(|\(|\{|["']|sudo\s+|time\s+|command\s+|builtin\s+|cmd(\.exe)?\s+\/[ck]\s+|(ba|z)?sh\s+-c\s+|(powershell|pwsh)(\.exe)?\s+(-\w+\s+)*?-c(ommand)?\s+)+/i;
const pezzi = comando => comando.split(/\r?\n|;|&&|\|\||\||&/)
  .map(s => s.trim().replace(PREFISSI, '').replace(/[)}"']+$/, '').trim())
  .filter(Boolean);

// Le variabili citate in un pezzo di comando, con l'indicazione se sono lette come variabili d'ambiente ($env:, %NOME%).
const variabili = s => [
  ...[...s.matchAll(/\$\{?(env:)?([A-Za-z_][A-Za-z0-9_]*)\}?/gi)].map(m => ({ nome: m[2], env: !!m[1] })),
  ...[...s.matchAll(/%([A-Za-z_][A-Za-z0-9_]*)%/g)].map(m => ({ nome: m[1], env: true })),
];
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// La cartella delle chiavi conta solo quando è citata come percorso: un nome da cercare con grep non legge niente.
const citaCartella = basso => aghi().some(a => (a.includes('/') ? basso.includes(a)
  : new RegExp(`/${escRe(a)}(/|$|[\\s"'])|(^|[\\s"'=(~])${escRe(a)}/`).test(basso)));

function motivoComando(comando) {
  if (OP_READ.test(comando) || (OP_GET.test(comando) && /--reveal\b/i.test(comando))) return MOTIVI.op;
  if (CREDENZIALI.test(comando)) return MOTIVI.credenziali;
  const basso = norm(comando);
  if (citaCartella(basso) && LETTORI.test(comando)) return MOTIVI.file;
  for (const p of pezzi(comando)) {
    if (DUMP.test(p)) return MOTIVI.dump;
    const v = variabili(p).find(x => x.nome.toLowerCase() !== 'env' && sensibile(x.nome, x.env));
    if (v && STAMPA.test(p)) return MOTIVI.eco(v.nome);
    if (v && /^\$\{?(env:)?[A-Za-z_][A-Za-z0-9_]*\}?$/i.test(p)) return MOTIVI.eco(v.nome);
    const pe = p.match(/^printenv\s+([A-Za-z_][A-Za-z0-9_]*)/i);
    if (pe && sensibile(pe[1], true)) return MOTIVI.eco(pe[1]);
    // [Environment]::GetEnvironmentVariable('NOME') da solo o in una stampa (la virgoletta finale può mancare: pezzi() la toglie)
    const ge = p.match(/getenvironmentvariable\(\s*['"]?([A-Za-z_][A-Za-z0-9_]*)/i);
    if (ge && sensibile(ge[1], true) && (/^\[/.test(p) || STAMPA.test(p))) return MOTIVI.eco(ge[1]);
    // node -p, console.log o print di process.env.NOME o di os.environ['NOME']
    const pe2 = p.match(/process\.env(?:\.|\[\s*['"`])([A-Za-z_][A-Za-z0-9_]*)|os\.environ(?:\.get\(\s*|\[\s*)['"]([A-Za-z_][A-Za-z0-9_]*)/i);
    const nomeEnv = pe2 && (pe2[1] || pe2[2]);
    if (nomeEnv && sensibile(nomeEnv, true) && /(^|\s)-p(\s|$)|--print\b|console\.(log|info|error)|print\s*\(|write\(/i.test(p)) return MOTIVI.eco(nomeEnv);
  }
  return null;
}

const confronto = p => { const r = path.resolve(p); return process.platform === 'win32' || process.platform === 'darwin' ? r.toLowerCase() : r; };
const dentro = (p, dir) => { const a = confronto(p), d = confronto(dir); return a === d || a.startsWith(d.endsWith(path.sep) ? d : d + path.sep); };

esegui(() => {
  const dati = ingresso();
  const strumento = String(dati.tool_name || '');
  const ti = dati.tool_input || {};

  if (/^(Read|Grep)$/.test(strumento)) {
    const grezzo = ti.file_path || ti.path;
    if (!grezzo || typeof grezzo !== 'string') return;
    const p = path.resolve(dati.cwd || RADICE, espandi(grezzo));
    const chiavi = cartellaChiavi();
    // Grep su una cartella che contiene quella delle chiavi la leggerebbe tutta (la cartella utente intera no: troppo larga).
    const sopra = strumento === 'Grep' && dentro(chiavi, p) && confronto(p) !== confronto(os.homedir()) && path.dirname(p) !== p;
    if (dentro(p, chiavi) || sopra) nega(MOTIVI.file);
    return;
  }

  const comando = String(ti.command || '');
  if (!comando.trim()) return;
  const motivo = motivoComando(comando);
  if (motivo) nega(motivo);
});
