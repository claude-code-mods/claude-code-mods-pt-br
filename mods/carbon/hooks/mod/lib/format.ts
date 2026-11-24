// What an answer's CO2 line says and when it raises its voice. Pure: no Claude Code API, so
// Node runs it directly (tests/run-mod-tests.mjs).

export type Lang = "fr" | "en";

export type AnswerCo2View = {
  // "16 gCO₂", or "230 gCO₂ · 14× votre médiane" for an unusual answer
  main: string;
  // "dont 3 sous-agents : 22 gCO₂", only on an unusual answer the subagents weighed on
  sub: string | null;
  isUnusual: boolean;
};

export type TurnTotals = {
  grams: number;
  subagentGrams: number;
  subagents: number;
};

export const HISTORY_SIZE = 200;
export const MIN_HISTORY = 50;
// About 1 answer in 27 stands out: above the 97th percentile of the history. The 3x
// median and the 10 g floor stay as guards: over a flat history the percentile is
// the median itself.
export const UNUSUAL_PERCENTILE = 0.97;
export const UNUSUAL_RATIO = 3;
export const UNUSUAL_FLOOR_GRAMS = 10;
export const SUBAGENT_SHARE = 0.1;

const NBSP = " ";
const UNIT = "CO₂";

// Unset, empty, C and POSIX say nothing about the language.
function isLocaleValue(value: string | undefined): value is string {
  return (
    value !== undefined &&
    value !== "" &&
    value !== "C" &&
    !value.startsWith("C.") &&
    value !== "POSIX" &&
    !value.startsWith("POSIX.")
  );
}

// Same order and sentinels as detect_equiv_set (scripts/equiv-lib.sh). With no
// variable set, the language setting decides; with none, French, as in the bash.
export function detectLang(
  envValues: Array<string | undefined>,
  setting?: string,
): Lang {
  const value = envValues.find(isLocaleValue);
  if (value !== undefined) {
    return value.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  if (setting !== undefined && setting !== "") {
    return setting.toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  return "fr";
}

// Whether one of the variables decides alone, so nothing else needs to be asked.
export function hasLangVariable(envValues: Array<string | undefined>): boolean {
  return envValues.some(isLocaleValue);
}

// The `language` setting is free text ("Français", "English", "japanese"). It goes
// to detectLang as a locale would: French when it starts with "fr", English otherwise.
export function languageSetting(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text === "" ? undefined : text;
}

function decimal(value: number, digits: number, lang: Lang): string {
  const text = value.toFixed(digits);
  return text.replace(".", ",");
}

// < 0.1 g, one decimal under 10 g, whole grams under 1 kg, then kg with one decimal.
// Rounding keeps the figure readable; the estimate itself is far less precise than one
// decimal.
export function formatGrams(grams: number, lang: Lang): string {
  if (grams < 0.1) return `<${NBSP}${decimal(0.1, 1, lang)}${NBSP}g${UNIT}`;
  const tenths = Math.round(grams * 10) / 10;
  if (tenths < 10) return `${decimal(tenths, 1, lang)}${NBSP}g${UNIT}`;
  const whole = Math.round(grams);
  if (whole < 1000) return `${whole}${NBSP}g${UNIT}`;
  const kilos = Math.round(grams / 100) / 10;
  return `${decimal(kilos, 1, lang)}${NBSP}kg${UNIT}`;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid] ?? 0;
  return sorted.length % 2 === 1 ? upper : ((sorted[mid - 1] ?? 0) + upper) / 2;
}

// Linear interpolation between the two closest ranks, q from 0 to 1.
export function percentile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (sorted.length - 1) * Math.min(Math.max(q, 0), 1);
  const lower = Math.floor(rank);
  const low = sorted[lower] ?? 0;
  const high = sorted[Math.min(lower + 1, sorted.length - 1)] ?? low;
  return low + (high - low) * (rank - lower);
}

// The current answer is compared before it joins the history.
export function isUnusual(grams: number, history: number[]): boolean {
  if (history.length < MIN_HISTORY || grams < UNUSUAL_FLOOR_GRAMS) return false;
  const m = median(history);
  return (
    m > 0 &&
    grams > UNUSUAL_RATIO * m &&
    grams > percentile(history, UNUSUAL_PERCENTILE)
  );
}

export function buildAnswerCo2(
  turn: TurnTotals,
  history: number[],
  lang: Lang,
): AnswerCo2View {
  const amount = formatGrams(turn.grams, lang);
  if (!isUnusual(turn.grams, history))
    return { main: amount, sub: null, isUnusual: false };
  const ratio = Math.round(turn.grams / median(history));
  const main = `${amount} · ${ratio}× ${lang === "fr" ? "votre médiane" : "sua mediana"}`;
  const share = turn.grams > 0 ? turn.subagentGrams / turn.grams : 0;
  if (turn.subagents === 0 || share < SUBAGENT_SHARE)
    return { main, sub: null, isUnusual: true };
  const n = turn.subagents;
  const grams = formatGrams(turn.subagentGrams, lang);
  const sub =
    lang === "fr"
      ? `dont ${n} sous-agent${n > 1 ? "s" : ""}${NBSP}: ${grams}`
      : `incl. ${n} subagente${n > 1 ? "s" : ""}: ${grams}`;
  return { main, sub, isUnusual: true };
}

// The single line drawn under the answer where the turn duration line is not
// (the Desktop app): only ever for an unusual answer.
export function answerLine(view: AnswerCo2View): string {
  return view.sub === null
    ? view.main
    : `${view.main} · ${view.sub}`;
}

// Two decimals, as the status line rounds it; "< 0,01 $" under a cent. French puts the
// sign after the number, English before it.
export function formatUsd(usd: number, lang: Lang): string {
  const isTiny = usd < 0.01;
  const amount = decimal(isTiny ? 0.01 : usd, 2, lang);
  const money = `${amount}${NBSP}$`;
  return isTiny ? `<${NBSP}${money}` : money;
}

// The entry pinned under the prompt. The surface already heads it with the plugin's name.
// The cost is left out when there is none to show (no price list read), never shown as 0.
// What the status line ends with follows, in its order: the quota, then the hints.
export function sessionLine(
  sessionGrams: number,
  lang: Lang,
  sessionUsd: number | null = null,
  ...after: (string | null)[]
): string {
  const fr = lang === "fr";
  const head = fr ? `Cette session${NBSP}:` : `Esta sessão${NBSP}:`;
  const total = `${head} ${formatGrams(sessionGrams, lang)}`;
  const cost = sessionUsd !== null && sessionUsd > 0 ? formatUsd(sessionUsd, lang) : null;
  return [total, cost, ...after].filter((part) => part !== null).join(" · ");
}

// The status line's two hints, for the entry: a newer release, and from the 1st to the
// 10th the month just closed with its total
export function updateHint(version: string): string {
  return `⬆ ${version} ${UPDATE_COMMAND}`;
}

const MONTH_NAMES_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MONTH_NAMES_EN = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function cardHint(month: number, grams: number, lang: Lang): string {
  const fr = lang === "fr";
  const name = (fr ? MONTH_NAMES_FR : MONTH_NAMES_EN)[month] ?? "";
  return `📊 ${name}${fr ? `${NBSP}:` : ":"} ${formatGrams(grams, lang)} · /carbon-card`;
}

// December's: the year so far
export function yearCardHint(year: number, grams: number, lang: Lang): string {
  return `📊 ${year}${lang === "fr" ? `${NBSP}:` : ":"} ${formatGrams(grams, lang)} · /carbon-card`;
}

export type RateLimit = { kind: string; percentUsed: number; resetsAt?: string };

const WEEKDAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const WEEKDAYS_EN = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const DAY_MS = 86_400_000;

// A subscription's quota as the terminal status line shows it: the 5-hour window, "Usage
// 23 % ↻14:00", or without one (a verified Ultra account has none) the weekly window,
// "Usage 41 % 7j ↻jeu.", its reset as a weekday while more than a day away. Rounded half
// to even like the status line's awk printf "%.0f" (22.5 reads 22 on both), capped at 100,
// the reset in local time; a window whose reset has passed is over. Null off a
// subscription or before the first response has reported a window.
export function quotaText(
  limits: readonly RateLimit[] | undefined,
  lang: Lang,
  now: number = Date.now(),
): string | null {
  const resetOf = (limit: RateLimit) =>
    limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt);
  // A reset that does not parse leaves the window open: NaN <= now is false
  const open = (kind: string) =>
    limits?.find(
      (limit) =>
        limit.kind === kind && Number.isFinite(limit.percentUsed) && !(resetOf(limit) <= now),
    );
  const fiveHour = open("five_hour");
  const window = fiveHour ?? open("seven_day");
  if (window === undefined) return null;
  const weekly = fiveHour === undefined;
  const fr = lang === "fr";
  const used = Math.max(0, window.percentUsed);
  const floor = Math.floor(used);
  const rounded =
    used - floor === 0.5 ? (floor % 2 === 0 ? floor : floor + 1) : Math.round(used);
  const percent = Math.min(100, rounded);
  const head =
    (fr ? `Usage ${percent}${NBSP}%` : `Uso ${percent}${NBSP}%`) + (weekly ? " 7d" : "");
  const reset = resetOf(window);
  if (Number.isNaN(reset)) return head;
  const d = new Date(reset);
  if (weekly && reset - now >= DAY_MS) {
    return `${head} ↻${(fr ? WEEKDAYS_FR : WEEKDAYS_EN)[d.getDay()]}`;
  }
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${head} ↻${time}`;
}

// Shown once per machine, the same on every surface.
export function welcomeText(lang: Lang): string {
  return lang === "fr"
    ? "Le CO₂ s'affiche maintenant pour chaque réponse."
    : "O CO₂ agora aparece para cada resposta.";
}

export function pushHistory(history: number[], grams: number): number[] {
  if (!(grams > 0)) return history;
  return [...history, grams].slice(-HISTORY_SIZE);
}

// The claude-carbon status line already shows the session total: no second one.
export function isCarbonStatusLine(command: unknown): boolean {
  return (
    typeof command === "string" &&
    command.includes("claude-carbon") &&
    command.includes("statusline.sh")
  );
}

// ── The /carbon-panel pane ──────────────────────────────────────────────────

// The pane's tab: the plugin's name, as the person asked for it
export function paneTitle(_lang: Lang): string {
  return "claude-carbon";
}

export function commandDescription(lang: Lang): string {
  return lang === "fr"
    ? "Votre molécule de CO₂ et l'historique de vos sessions"
    : "Sua molécula de CO₂ e o histórico das suas sessões";
}

// Shown once per machine to someone already welcomed before the pane existed.
export function paneHint(lang: Lang): string {
  return lang === "fr"
    ? "Tapez /carbon-panel pour voir votre molécule et l'historique de vos sessions."
    : "Digite /carbon-panel para ver sua molécula e o histórico das suas sessões.";
}

export function paneUnplaced(lang: Lang): string {
  return lang === "fr"
    ? `Le panneau carbone ne peut pas s'ouvrir ici${NBSP}: élargissez la fenêtre ou mettez Claude Code à jour.`
    : "O painel de carbono não pode abrir aqui: amplie a janela ou atualize o Claude Code.";
}

// The molecule's line: the session so far, and its ratio to the median of past sessions.
export function currentLine(
  grams: number,
  sessionMedian: number | null,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const head = fr ? `Cette session${NBSP}:` : `Esta sessão${NBSP}:`;
  const total = `${head} ${formatGrams(grams, lang)}`;
  if (sessionMedian === null || !(sessionMedian > 0) || !(grams > 0)) return total;
  const r = grams / sessionMedian;
  const ratio =
    r >= 10 ? `${Math.round(r)}` : decimal(r, r >= 1 ? 1 : 2, lang);
  return `${total} · ${ratio}×${NBSP}${fr ? "votre médiane" : "sua mediana"}`;
}

// Before 10 past sessions the colour compares with a starting reference (0.5 kgCO₂),
// said simply to someone who just arrived
export function colorNote(pastSessions: number, lang: Lang): string {
  return lang === "fr"
    ? `Couleur provisoire${NBSP}: elle s'ajustera à vos habitudes après 10 sessions (${pastSessions} pour l'instant).`
    : `Cor provisória: ela se ajusta aos seus hábitos após 10 sessões (${pastSessions} até agora).`;
}

// No history file. `missing` names the tools the SessionStart hook found absent (jq,
// sqlite3): without them no database is created.
export function noHistoryText(lang: Lang, missing: string[] | null = null): string {
  if (missing !== null && missing.length > 0) {
    const tools = missing.join(lang === "fr" ? " et " : " e ");
    return lang === "fr"
      ? `Pour enregistrer vos sessions, installez ${tools} puis relancez Claude Code (voir le README).`
      : `Para registrar suas sessões, instale ${tools} e reinicie o Claude Code (veja o README).`;
  }
  return lang === "fr"
    ? "Aucun historique pour l'instant (voir le README)."
    : "Ainda não há histórico (veja o README).";
}

// Shown once, to someone whose database the SessionStart hook created by itself
export function autoSetupText(lang: Lang): string {
  return lang === "fr"
    ? "Vos sessions sont maintenant enregistrées sur cette machine, y compris celles déjà sur le disque. Rien n'est envoyé."
    : "Suas sessões agora são registradas nesta máquina, incluindo as que já estão em disco. Nada é enviado a lugar algum.";
}

export function emptyRangeText(lang: Lang): string {
  return lang === "fr"
    ? "Aucune session sur cette période."
    : "Nenhuma sessão neste período.";
}


const RANGE_LABELS: Record<string, [string, string]> = {
  "7d": ["7 j", "7 d"],
  "30d": ["30 j", "30 d"],
  "1y": ["12 mois", "12 meses"],
  all: ["Tout", "Tudo"],
  custom: ["Personnalisée", "Personalizado"],
};
function pick(pair: [string, string] | undefined, lang: Lang): string {
  return pair === undefined ? "" : lang === "fr" ? pair[0] : pair[1];
}

export function rangeLabel(range: string, lang: Lang): string {
  return pick(RANGE_LABELS[range], lang);
}


function countOf(n: number, step: string, lang: Lang): string {
  const fr = lang === "fr";
  if (step === "week") return fr ? `${n} semaine${n > 1 ? "s" : ""}` : `${n} ${n > 1 ? "semanas" : "semana"}`;
  if (step === "month") return fr ? `${n} mois` : `${n} ${n > 1 ? "meses" : "mês"}`;
  return `${n} ${n > 1 ? "sessões" : "sessão"}`;
}

// Under the stripes: what one stripe is, and the median their colours measure against
const PER: Record<string, [string, string]> = {
  day: ["jour", "dia"],
  week: ["semaine", "semana"],
  month: ["mois", "mês"],
};
// Before three periods with sessions in them there is nothing to colour: the stripes
// wait, and say what they will show
export function stripesWaitText(step: string, filled: number, lang: Lang): string {
  const fr = lang === "fr";
  const units: Record<string, [string, string]> = {
    day: ["jours", "dias"],
    week: ["semaines", "semanas"],
    month: ["mois", "meses"],
  };
  const unit = pick(units[step], lang);
  return fr
    ? `Vos bandes de couleur apparaissent après 3 ${unit} d'usage (${filled} pour l'instant)${NBSP}: une par période, du bleu au rouge selon son CO₂.`
    : `Suas faixas de cor aparecem após 3 ${unit} de uso (${filled} até agora): uma por período, do azul ao vermelho conforme seu CO₂.`;
}

export function stripesCaption(step: string, stripeMedian: number | null, lang: Lang): string {
  const fr = lang === "fr";
  const unit = pick(PER[step], lang);
  const one = fr ? `une bande par ${unit}` : `uma faixa por ${unit}`;
  if (stripeMedian === null) return one;
  const per = fr ? ` par ${unit}` : ` por ${unit}`;
  return `${one} · ${fr ? "médiane" : "mediana"} ${formatGrams(stripeMedian, lang)}${per}`;
}

// The period's figure, the pane's main one
export function periodHeadline(grams: number, lang: Lang): string {
  return lang === "fr"
    ? `${formatGrams(grams, lang)} sur la période`
    : `${formatGrams(grams, lang)} no período`;
}

export function sessionsCount(n: number, lang: Lang): string {
  return countOf(n, "session", lang);
}

// The custom range's fields: a date typed day first, or as 2026-05-01
export function datePlaceholder(lang: Lang): string {
  return "DD/MM/AAAA";
}

export function dateInvalid(lang: Lang): string {
  return lang === "fr"
    ? `Date non reconnue${NBSP}: tapez-la comme 01/05/2026.`
    : "Data não reconhecida: digite-a como 01/05/2026.";
}

// A day key shown back in its field: "01/05/2026"
export function dayInputValue(key: string): string {
  const [y, m, d] = key.split("-");
  return `${d ?? ""}/${m ?? ""}/${y ?? ""}`;
}

export function fromLabel(lang: Lang): string {
  return lang === "fr" ? "Du" : "De";
}

export function toLabel(lang: Lang): string {
  return lang === "fr" ? "au" : "a";
}

export function waitingText(lang: Lang): string {
  return lang === "fr"
    ? `Cette session${NBSP}: en attente de la première réponse`
    : "Esta sessão: aguardando a primeira resposta";
}



const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_EN = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

// A day ("22 août", "Aug 22", with the year when asked), or a month for monthly
// stripes ("août 2026", "Aug 2026").
export function dateLabel(
  ms: number,
  step: string,
  lang: Lang,
  withYear = false,
): string {
  const d = new Date(ms);
  const month = (lang === "fr" ? MONTHS_FR : MONTHS_EN)[d.getMonth()] ?? "";
  if (step === "month") return `${month}${NBSP}${d.getFullYear()}`;
  const year = withYear ? `${NBSP}${d.getFullYear()}` : "";
  return `${d.getDate()}${NBSP}${month}${year}`;
}

// A stripe's tooltip in the desktop app.
export function stripeTitle(
  start: number,
  step: string,
  grams: number,
  sessions: number,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const when =
    step === "week"
      ? `${fr ? "semaine du" : "semana de"} ${dateLabel(start, "session", lang)}`
      : dateLabel(start, step, lang);
  const amount = grams > 0 ? formatGrams(grams, lang) : fr ? "aucune session" : "nenhuma sessão";
  return sessions === 0
    ? `${when} · ${amount}`
    : `${when} · ${amount} · ${countOf(sessions, "session", lang)}`;
}

// Against the same length of time just before: "+12 % par rapport aux 30 jours
// d'avant". Nothing when there is nothing before to compare with.
const BEFORE: Record<string, [string, string]> = {
  "7d": ["aux 7 jours d'avant", "aos 7 dias anteriores"],
  "30d": ["aux 30 jours d'avant", "aos 30 dias anteriores"],
  "1y": ["aux 12 mois d'avant", "aos 12 meses anteriores"],
  custom: ["à la période d'avant", "ao período anterior"],
};

// The change against the period before, in whole percent; null when there is none
export function changePercent(grams: number, previous: number): number | null {
  return previous > 0 ? Math.round(((grams - previous) / previous) * 100) : null;
}
export function compareText(
  grams: number,
  previous: number,
  range: string,
  lang: Lang,
): string | null {
  const before = BEFORE[range];
  const change = changePercent(grams, previous);
  if (before === undefined || change === null) return null;
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  const amount = `${sign}${Math.abs(change)}${NBSP}%`;
  return lang === "fr"
    ? `${amount} par rapport ${before[0]}`
    : `${amount} em relação ${before[1]}`;
}

// ── Model families, as the session block names them ─────

const FAMILY_NAMES: Record<string, string> = {
  fable: "Fable",
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
};
export function familyName(f: string): string {
  return FAMILY_NAMES[f] ?? f;
}


// The car factor as the pane prints it, the unit spelled out: "142 gCO₂/km, ADEME 2025"
export function carTag(tag: string): string {
  return tag.replace(/(\d)\s*g\//, `$1${NBSP}gCO₂/`);
}

// A subagent's molecule, on hover: "Sous-agent 2 · 12 gCO₂"
export function subagentTitle(n: number, grams: number, lang: Lang): string {
  return `${lang === "fr" ? "Sous-agent" : "Subagente"} ${n} · ${formatGrams(grams, lang)}`;
}

export function subagentsAlt(n: number, lang: Lang): string {
  return lang === "fr"
    ? `${n} sous-agent${n > 1 ? "s" : ""} de cette session, une petite molécule chacun, colorée selon son CO₂`
    : `${n} subagente${n > 1 ? "s" : ""} desta sessão, uma pequena molécula para cada um, colorida conforme seu CO₂`;
}

// More subagents than the row shows: "+4"
export function moreAgentsText(n: number): string {
  return `+${n}`;
}

// The context window's fill: "Contexte 42 %"
export function contextText(percentUsed: number, lang: Lang): string {
  const p = `${Math.round(percentUsed)}${NBSP}%`;
  return lang === "fr" ? `Contexte ${p}` : `Contexto ${p}`;
}

// The running session, under its line: "12 réponses · 3 sous-agents · Opus"
export function sessionStatsText(
  answers: number,
  subagents: number,
  f: string | null,
  lang: Lang,
): string {
  const fr = lang === "fr";
  const parts = [
    fr ? `${answers} réponse${answers > 1 ? "s" : ""}` : `${answers} ${answers > 1 ? "respostas" : "resposta"}`,
    fr ? `${subagents} sous-agent${subagents > 1 ? "s" : ""}` : `${subagents} ${subagents > 1 ? "subagentes" : "subagente"}`,
  ];
  if (f !== null) parts.push(familyName(f));
  return parts.join(" · ");
}

// The pane's last line: who made it, and the version for a team
export const AUTHOR_URL = "https://www.linkedin.com/in/gwittebolle/";
// The French site is at the root; only the English one has a prefix
export function teamUrl(lang: Lang): string {
  return lang === "fr"
    ? "https://tokenclimate.com/?ref=carbon-panel"
    : "https://tokenclimate.com/en?ref=carbon-panel";
}

// The project's home: its README says what the tool does and leads to the methodology
export const REPO_URL = "https://github.com/gwittebolle/claude-carbon";
export function repoLabel(lang: Lang): string {
  return lang === "fr" ? "En savoir plus sur claude-carbon" : "Saiba mais sobre o claude-carbon";
}

// A newer release, at the top of the foot: what to ask Claude, the plugin command
// The one command for every install: the skill updates the plugin, the clone, or both
export const UPDATE_COMMAND = "/carbon-update";
export function updateText(version: string, lang: Lang): string {
  return lang === "fr"
    ? `Version ${version} disponible${NBSP}: tapez ${UPDATE_COMMAND}, puis redémarrez.`
    : `A versão ${version} está disponível: digite ${UPDATE_COMMAND} e reinicie.`;
}

// The foot's two credit lines, a label and a colon each, the link after it
export function builtByLabel(lang: Lang): string {
  return lang === "fr" ? `Développé par${NBSP}:` : "Criado por:";
}
export function forTeamLabel(lang: Lang): string {
  return lang === "fr" ? `Découvrez la version entreprise${NBSP}:` : "Conheça a versão empresarial:";
}

export function blockTitle(kind: "session" | "usage", lang: Lang): string {
  if (kind === "session") return lang === "fr" ? "Cette session" : "Esta sessão";
  return lang === "fr" ? "Mon usage" : "Meu uso";
}

// The tiles at the top of the desktop pane: a label over a figure
const TILE_LABELS: Record<string, [string, string]> = {
  period: ["Sur la période", "No período"],
  change: ["Par rapport à avant", "Em relação ao anterior"],
  sessions: ["Sessions", "Sessions"],
  cost: ["Valeur au prix API", "Valor a preço de API"],
  car: ["En voiture", "De carro"],
};
export function tileLabel(kind: string, lang: Lang): string {
  return pick(TILE_LABELS[kind], lang);
}

// "+29 %", "-18 %"
export function changeValue(change: number): string {
  const sign = change > 0 ? "+" : change < 0 ? "-" : "";
  return `${sign}${Math.abs(change)}${NBSP}%`;
}

// "27 616 $", "$27,616", "12,30 $"
export function moneyValue(usd: number, lang: Lang): string {
  return costText(usd, lang).replace(lang === "fr" ? " au prix API" : " a preços de API", "");
}

// Under the value tile, so it holds whoever pays: a subscription, an API key, extra
// usage, or sessions of several kinds. Which session was billed how is not recorded.
export function apiValueNote(lang: Lang): string {
  return lang === "fr"
    ? `Le prix de cet usage facturé à l'API${NBSP}; un abonnement Pro, Max ou Ultra en couvre tout ou partie.`
    : "O que este uso custa quando cobrado pela API; uma assinatura Pro, Max ou Ultra cobre parte ou todo ele.";
}

// "12,34 $ au prix API", "$12.34 at API prices"
export function costText(usd: number, lang: Lang): string {
  // Whole dollars from a thousand up, grouped: "27 608 $", "$27,608"
  const money =
    usd >= 1000
      ? lang === "fr"
        ? `${thousands(usd, lang)}${NBSP}$`
        : `$${thousands(usd, lang)}`
      : formatUsd(usd, lang);
  return lang === "fr" ? `${money} au prix API` : `${money} a preços de API`;
}

function thousands(n: number, lang: Lang): string {
  const whole = String(Math.round(n));
  const sep = NBSP;
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// "≈ 1 680 km en voiture (142 g/km, ADEME 2025)", the reports' and cards' car line
export function equivalenceText(
  grams: number,
  car: { divisor: number; label: string; tag: string },
  lang: Lang,
): string {
  return `≈${NBSP}${thousands(grams / car.divisor, lang)} ${car.label} (${carTag(car.tag)})`;
}

// The car tile's figure, the period's CO2 in the locale's unit: "≈ 1 684 km"
export function carValue(
  grams: number,
  car: { divisor: number; unit: string },
  lang: Lang,
): string {
  const distance = grams / car.divisor;
  // Under a unit, "≈ 0 km" reads as nothing at all
  if (distance < 1) return `<${NBSP}1 ${car.unit}`;
  return `≈${NBSP}${thousands(distance, lang)} ${car.unit}`;
}

// The blocks a person can show or hide in the pane, under the gear

const BLOCK_LABELS: Record<string, [string, string]> = {
  compare: ["Comparaison", "Comparação"],
  cost: ["Coût API", "Custo da API"],
  equivalence: ["Équivalence", "Equivalência"],
  projects: ["Projets", "Projetos"],
  detail: ["Détail", "Detalhe"],
};
export function blockLabel(block: string, lang: Lang): string {
  return pick(BLOCK_LABELS[block], lang);
}

// ── The "Détail" block: a period's tokens, energy and CO2 by kind of token ──
const KIND_LABELS: Record<string, [string, string]> = {
  input: ["Entrée", "Entrada"],
  cacheWrite: ["Cache écrit", "Gravação do cache"],
  cacheRead: ["Cache relu", "Leitura do cache"],
  output: ["Sortie", "Saída"],
};
export function kindLabel(kind: string, lang: Lang): string {
  return pick(KIND_LABELS[kind], lang);
}

// Above each bar: what it splits
export function detailBarLabel(bar: "tokens" | "co2", lang: Lang): string {
  if (bar === "tokens") return "Tokens";
  return lang === "fr" ? `${UNIT} et énergie` : `${UNIT} e energia`;
}

// 820, 12k, 371M, then billions with one decimal: 25,3 Md / 25.3B
export function formatTokens(n: number, lang: Lang): string {
  if (n >= 999.5e6)
    return lang === "fr" ? `${decimal(n / 1e9, 1, lang)}${NBSP}Md` : `${decimal(n / 1e9, 1, lang)} bi`;
  const space = NBSP;
  if (n >= 999.5e3) return `${Math.round(n / 1e6)}${space}M`;
  if (n >= 1000) return `${Math.round(n / 1e3)}${space}k`;
  return String(Math.round(n));
}

// Wh under a kWh, then kWh (one decimal under 100), then MWh
export function formatWh(wh: number, lang: Lang): string {
  if (wh < 999.5) return `${Math.round(wh)}${NBSP}Wh`;
  const kwh = wh / 1000;
  if (kwh < 99.95) return `${decimal(kwh, 1, lang)}${NBSP}kWh`;
  if (kwh < 999.5) return `${Math.round(kwh)}${NBSP}kWh`;
  return `${decimal(kwh / 1000, 1, lang)}${NBSP}MWh`;
}

// One decimal, "98,4 %", "< 0,1 %" for a share that is there but rounds to nothing,
// "0 %" for none; a space before % in both languages, as the rest of the pane writes it
export function formatShare(share: number, lang: Lang): string {
  if (share <= 0) return `0${NBSP}%`;
  if (share < 0.0005) return `<${NBSP}${decimal(0.1, 1, lang)}${NBSP}%`;
  return `${decimal(share * 100, 1, lang)}${NBSP}%`;
}

// Under a kind's name: "23,8 Md tokens (98,4 %) · 21,6 kWh · 6,2 kgCO₂ (60,9 %)"
export function detailLine(
  part: { tokens: number; tokenShare: number; wh: number; grams: number; gramShare: number },
  lang: Lang,
): string {
  return (
    `${formatTokens(part.tokens, lang)} tokens (${formatShare(part.tokenShare, lang)}) · ` +
    `${formatWh(part.wh, lang)} · ${formatGrams(part.grams, lang)} (${formatShare(part.gramShare, lang)})`
  );
}

export function detailTotalLine(
  total: { tokens: number; wh: number; grams: number },
  lang: Lang,
): string {
  return (
    `Total${NBSP}: ${formatTokens(total.tokens, lang)} tokens · ` +
    `${formatWh(total.wh, lang)} · ${formatGrams(total.grams, lang)}`
  );
}

// What a hovered part of a bar says: its kind, its figures on that bar, its share
// "Cache relu · 23,9 Md tokens · 98,4 %", "Cache relu · 535 kWh · 153,5 kgCO₂ · 60,9 %"
export function detailHover(
  part: { kind: string; tokens: number; tokenShare: number; wh: number; grams: number; gramShare: number },
  bar: "tokens" | "co2",
  lang: Lang,
): string {
  const name = kindLabel(part.kind, lang);
  return bar === "tokens"
    ? `${name} · ${formatTokens(part.tokens, lang)} tokens · ${formatShare(part.tokenShare, lang)}`
    : `${name} · ${formatWh(part.wh, lang)} · ${formatGrams(part.grams, lang)} · ${formatShare(part.gramShare, lang)}`;
}

// The methodology, straight from the detail
export const METHODOLOGY_URL =
  "https://github.com/gwittebolle/claude-carbon/blob/main/METHODOLOGY.md#the-panes-detail-by-kind-of-token";
export function methodologyLabel(lang: Lang): string {
  return lang === "fr" ? "Lire la méthodologie" : "Leia a metodologia";
}

// When some sessions of the period are left out: stored with older factors, or the
// running one before its first answer
export function detailCoverage(n: number, total: number, lang: Lang): string {
  return lang === "fr"
    ? `Sur ${n} des ${total} sessions de la période${NBSP}: les autres ont été enregistrées avec des facteurs plus anciens.`
    : `Em ${n} das ${total} sessões do período: as demais foram registradas com fatores mais antigos.`;
}

// Before the hook has written the tokens by kind: after the next answer
export function detailWaitText(lang: Lang): string {
  return lang === "fr"
    ? "Le détail s'affichera après la prochaine réponse."
    : "O detalhe aparece após a próxima resposta.";
}

export function detailAlt(bar: "tokens" | "co2", lang: Lang): string {
  return lang === "fr"
    ? `Répartition ${bar === "tokens" ? "des tokens" : `du ${UNIT}`} entre entrée, cache écrit, cache relu et sortie`
    : `Distribuição dos ${bar === "tokens" ? "tokens" : UNIT} entre entrada, gravação do cache, leitura do cache e saída`;
}

export function showLabel(lang: Lang): string {
  return lang === "fr" ? "Afficher" : "Mostrar";
}


// The button that puts /carbon-card in the prompt, for the person to send. The card
// covers the calendar year so far (the one just ended, over the first days of January),
// whatever range the pane shows: the label says which.
export function cardButtonLabel(year: number, lang: Lang): string {
  return lang === "fr" ? `Obtenir ma carte ${year}` : `Obter meu cartão de ${year}`;
}

// After the button filled the prompt: what is there and what to do
export function cardReadyText(lang: Lang): string {
  return lang === "fr"
    ? `/carbon-card est dans le prompt${NBSP}: appuyez sur Entrée pour créer la carte.`
    : "/carbon-card está no prompt: pressione Enter para criar o cartão.";
}

// The prompt could not take it (a dialog is open, or no prompt box here)
export function cardFillFailed(lang: Lang): string {
  return lang === "fr"
    ? `Le prompt n'a pas pu recevoir /carbon-card${NBSP}: tapez-le vous-même.`
    : "O prompt não pôde receber /carbon-card: digite-o você mesmo.";
}

// When the prompt already holds a draft, the button leaves it alone and says why
export function cardDraftBusy(lang: Lang): string {
  return lang === "fr"
    ? `Le prompt contient déjà un brouillon${NBSP}: videz-le pour obtenir la carte.`
    : "O prompt já contém um rascunho: limpe-o para obter o cartão.";
}


function percent(share: number): string {
  const p = Math.round(share * 100);
  return p < 1 ? `<${NBSP}1${NBSP}%` : `${p}${NBSP}%`;
}


// A project as a bar, left-aligned so bars compare whatever the font:
// "███████ 41 % carbonara · 103,5 kgCO₂"
export function projectBarLine(
  project: string,
  grams: number,
  share: number,
  lang: Lang,
): string {
  const name = project === "" ? (lang === "fr" ? "sans projet" : "sem projeto") : project;
  const bar = "█".repeat(Math.max(1, Math.round(share * 16)));
  return `${bar} ${percent(share)} ${name} · ${formatGrams(grams, lang)}`;
}

// The rest after the projects listed
export function otherProjectsLine(count: number, grams: number, share: number, lang: Lang): string {
  const fr = lang === "fr";
  const label = fr
    ? `${count} autre${count > 1 ? "s" : ""} projet${count > 1 ? "s" : ""}`
    : `${count} outro${count > 1 ? "s" : ""} projeto${count > 1 ? "s" : ""}`;
  return `${label} · ${formatGrams(grams, lang)} · ${percent(share)}`;
}

export function mascotAlt(lang: Lang): string {
  return lang === "fr"
    ? "Molécule de CO₂ en pixels, colorée selon cette session par rapport à votre médiane, du bleu (en dessous) au rouge (au-dessus)"
    : "Molécula de CO₂ em pixels, colorida conforme esta sessão em relação à sua mediana, do azul (abaixo) ao vermelho (acima)";
}

// The scale under the molecule, read aloud: where this session sits on it
export function scaleAlt(cls: number | null, lang: Lang): string {
  const fr = lang === "fr";
  if (cls === null)
    return fr
      ? "Échelle des couleurs, du bleu (sous votre médiane) au rouge (au-dessus)"
      : "Escala de cores, do azul (abaixo da sua mediana) ao vermelho (acima)";
  return fr
    ? `Échelle des couleurs, du bleu au rouge : cette session est en ${cls + 1}e position sur 8`
    : `Escala de cores, do azul ao vermelho: esta sessão está na posição ${cls + 1} de 8`;
}

export function stripesAlt(lang: Lang): string {
  return lang === "fr"
    ? "Une bande par période, la plus ancienne à gauche, du bleu (sous la médiane) au rouge (au-dessus)"
    : "Uma faixa por período, a mais antiga à esquerda, do azul (abaixo da mediana) ao vermelho (acima)";
}
