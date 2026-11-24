// The prompt gate. It never touches a prompt the user did not type, such as a
// background task's notification or another session's message: holding those
// loses results, and the context warning waits for the user's own next prompt.
// It never holds a prompt over plan limits either; Claude Code waits at a limit
// and resumes on its own.

import { highestLimit, limitDetail } from './agents.ts'
import type { Config } from './config.ts'
import { MAIN, type PeerRecord, type Scope, type SessionState, countOnMachine, overrideCovers } from './state.ts'
import { count, duration, sentence, tokens } from './text.ts'
import { ALLOW, type Allow, type Ask, type Drop, type Rule, SIGNATURE, type Verdict } from './verdict.ts'

/** Who a prompt came from, as far as the guard cares. */
export type PromptSource = 'user' | 'headless' | 'other'

export type PromptRequest = {
  source: PromptSource
  text: string
  /** Time since the session's last model response, when known. */
  idleMs?: number
}

const PROMPT_COMPACT = 'Compactar e enviar'
const PROMPT_SEND = 'Enviar mesmo assim'
const PROMPT_CANCEL = 'Cancelar'

const MARKERS: Readonly<Record<string, Scope>> = {
  '[allow-usage-guard]': 'all',
  '[allow-agent-burst]': 'agents',
}

/**
 * The bracket markers of earlier versions, when one is the whole prompt. They
 * act like `/agent-guard allow`: the prompt is not sent, so no model turn runs
 * and the model never reads the marker.
 */
export function markerScope(text: string): Scope | undefined {
  return MARKERS[text.trim().toLowerCase()]
}

export function promptGate(
  state: SessionState,
  peers: readonly PeerRecord[],
  config: Config,
  now: number,
  request: PromptRequest,
): Verdict {
  if (!config.enabled || request.source === 'other') return ALLOW
  const context = state.loops[MAIN]?.context
  if (context === undefined || overrideCovers(state, now, 'context')) return withNotes(state, peers, config, now, context)

  const hardLeased = state.leases['prompt-context'] !== undefined
  if (context >= config.contextHard && !hardLeased) {
    const detail = `esta sessão tem ${tokens(context)} tokens de contexto (limite ${tokens(config.contextHard)}) e o envio os relê todos`
    if (state.canAsk && request.source === 'user') {
      return promptAsk('prompt-context', `Esta sessão tem ${tokens(context)} tokens de contexto e o envio os relê todos; compactar primeiro reduz esta requisição e todas as seguintes. Enviar este prompt?`, detail)
    }
    return drop('prompt-context', `${detail}. Compacte a sessão primeiro ou aumente AGENT_GUARD_CONTEXT_HARD.`)
  }

  const idle = request.idleMs
  if (idle !== undefined && idle >= config.dormantMs && context >= config.dormantContext) {
    const detail = `esta sessão ficou ociosa por ${duration(idle)}, então o cache de prompt provavelmente expirou e esta requisição reescreve cerca de ${tokens(context)} tokens`
    if (state.canAsk && request.source === 'user') {
      return promptAsk('dormant', `${sentence(detail)}. Enviar este prompt?`, detail)
    }
    const recent = countOnMachine(state, peers, 'dormantResumes', now, config.windowMs)
    if (recent >= config.dormantMax) {
      return drop(
        'dormant',
        `${detail}, e ${count(recent, 'sessão ociosa pesada', 'sessões ociosas pesadas')} já retomadas nesta máquina nos últimos ${duration(config.windowMs)} (limite ${config.dormantMax}). Tente novamente depois ou compacte a sessão primeiro.`,
      )
    }
    state.dormantResumes.push(now)
  }
  return withNotes(state, peers, config, now, context)
}

/** The user chose to compact first: drop the prompt, compact, then send it, or leave it in the input box when `resend` is false. */
export type CompactThenSend = { kind: 'compact-then-send'; rule: Rule; message: string; resend: boolean }

export type PromptOutcome = Allow | Drop | CompactThenSend

/**
 * Applies the user's answer to a prompt question. Dismissing it cancels.
 * `resendable` is false for a prompt that sending it again would change.
 */
export function resolvePromptAsk(state: SessionState, ask: Ask, answer: string | undefined, resendable: boolean): PromptOutcome {
  const trip = ask.trips[0]!
  if (answer === PROMPT_COMPACT) {
    const then = resendable
      ? 'seu prompt é enviado quando terminar'
      : 'seu prompt volta para a caixa de entrada, para ser enviado quando terminar, pois enviá-lo por você removeria imagens e @ menções'
    return { kind: 'compact-then-send', rule: trip.rule, message: `${SIGNATURE}: compactando primeiro, porque ${trip.detail}; ${then}.`, resend: resendable }
  }
  if (answer === PROMPT_SEND) {
    if (trip.rule === 'prompt-context') state.leases['prompt-context'] = Number.MAX_SAFE_INTEGER
    return ALLOW
  }
  return drop(trip.rule, 'cancelado; seu prompt voltou para a caixa de entrada.')
}

function promptAsk(rule: 'prompt-context' | 'dormant', question: string, detail: string): Ask {
  return {
    kind: 'ask',
    family: 'prompt',
    loop: MAIN,
    trips: [{ rule, detail, leaseKey: rule, leaseUntil: Number.MAX_SAFE_INTEGER }],
    question,
    options: [PROMPT_COMPACT, PROMPT_SEND, PROMPT_CANCEL],
  }
}

function drop(rule: Rule, reason: string): Drop {
  return { kind: 'drop', rule, message: `${SIGNATURE}: ${reason}` }
}

/** The notes for a prompt the user chose to send, if Claude has not had them yet. */
export function promptNotes(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): string | undefined {
  const verdict = withNotes(state, peers, config, now, state.loops[MAIN]?.context)
  return verdict.kind === 'allow' ? verdict.note : undefined
}

function withNotes(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number, context: number | undefined): Verdict {
  const notes = [contextWarning(state, config, context), windDown(state, peers, config, now)].filter((n) => n !== undefined)
  return notes.length === 0 ? ALLOW : { kind: 'allow', note: notes.join('\n') }
}

/** Tells Claude once, when the context first crosses the warning threshold. */
function contextWarning(state: SessionState, config: Config, context: number | undefined): string | undefined {
  if (context === undefined || context < config.contextWarn || state.warned) return undefined
  state.warned = true
  return `${SIGNATURE}: o contexto desta sessão é de ${tokens(context)} tokens. Mantenha esta rodada limitada e recomende /compact ao usuário na próxima pausa natural.`
}

/**
 * Tells Claude once, when a plan window on this machine reaches the percentage
 * at which new agents are refused, to finish the step and hand over: parallel
 * main sessions run on after agents stop, and a lockout cuts each one off
 * wherever it is. Told again only after the window falls back below it.
 */
function windDown(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): string | undefined {
  const limit = highestLimit(state, peers, now)
  if (!limit || limit.percent < config.limitDenyPercent) {
    state.windDown = false
    return undefined
  }
  if (state.windDown) return undefined
  state.windDown = true
  return `${SIGNATURE}: ${limitDetail(limit)}. Conclua a etapa em andamento, nao comece nada grande e termine esta rodada com um breve resumo do que foi feito e do que falta, para que o trabalho continue apos a redefinicao.`
}
