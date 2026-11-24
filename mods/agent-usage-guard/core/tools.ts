// The tool gate: identical failing retries, and long runs of tool calls while a
// loop carries a heavy context. Each loop is judged on its own context, so a
// subagent's calls never inherit the main conversation's size.

import { highestLimit, limitDetail } from './agents.ts'
import type { Config } from './config.ts'
import { type LoopId, MAIN, type PeerRecord, type SessionState, loopOf, overrideCovers, within } from './state.ts'
import { count, duration, sentence, shortClock, tokens } from './text.ts'
import { ALLOW, type Ask, type Deny, type Verdict, refuse } from './verdict.ts'

/**
 * Tools the guard never holds: holding them loses a subagent's report, stops
 * a cleanup, or blocks the user from answering a question.
 */
const EXEMPT_TOOLS: ReadonlySet<string> = new Set([
  'SubagentHandback',
  'TaskStop',
  'AskUserQuestion',
  'ExitPlanMode',
])

/** Tools that start a turn later, on their own: a wakeup, a scheduled job. */
const SCHEDULING: ReadonlySet<string> = new Set(['ScheduleWakeup', 'CronCreate'])

export function isScheduling(tool: string): boolean {
  return SCHEDULING.has(tool)
}

/**
 * From the refusal threshold, a wakeup or scheduled job is refused like a new
 * agent: the turn it starts later would run into the limit with nobody there.
 * The agents override lifts it.
 */
export function scheduleGate(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number, request: ToolRequest): Verdict {
  if (!config.enabled || !isScheduling(request.tool) || overrideCovers(state, now, 'agents')) return ALLOW
  const limit = highestLimit(state, peers, now)
  if (!limit || limit.percent < config.limitDenyPercent) return ALLOW
  const base = `A chamada ${request.tool} foi recusada: ${limitDetail(limit)}, e a rodada que ela inicia chegaria ao limite. Conclua a etapa em andamento; o usuário pode liberar com /agent-guard allow.`
  return refuse(state, config, now, 'schedule', `schedule:${request.tool}`, base, false)
}

export type ToolRequest = {
  loop: LoopId
  tool: string
  fingerprint: string
  /** How the user names the loop in a question: "this conversation", "agent Explore". */
  label: string
}

/** How long "keep going" lasts if the loop never compacts. */
const HEAVY_LEASE_MS = 60 * 60 * 1000

const HEAVY_CONTINUE = 'Continuar'
const HEAVY_COMPACT = 'Compactar após esta rodada'
const HEAVY_STOP = 'Parar esta rodada'
const HEAVY_STOP_AGENT = 'Parar este agente'

export function toolGate(state: SessionState, config: Config, now: number, request: ToolRequest): Verdict {
  if (!config.enabled || EXEMPT_TOOLS.has(request.tool)) return ALLOW
  const lifted = overrideCovers(state, now, 'context')

  const failure = state.failures[request.fingerprint]
  if (!lifted && failure && failure.count >= config.failureMax && now - failure.last < config.windowMs) {
    const base = `Esta chamada exata ${request.tool} falhou ${failure.count} vezes seguidas, a última às ${shortClock(failure.last)}. Mude a entrada ou a abordagem, ou relate a falha, em vez de repeti-la.`
    return refuse(state, config, now, 'retry', `retry:${request.fingerprint}`, base, false)
  }

  const loop = loopOf(state, request.loop)
  if (loop.stopped) return refuseStopped(state, config, now, request.loop)

  const context = loop.context
  if (lifted || context === undefined || context < config.toolContext) return ALLOW
  const heavy = within(loop.heavyCalls, now, config.windowMs)
  loop.heavyCalls = heavy
  const leasedUntil = loop.heavyLeaseUntil
  if (heavy.length < config.toolMax || (leasedUntil !== undefined && now < leasedUntil)) {
    heavy.push(now)
    return ALLOW
  }

  const detail = `${request.label} fez ${count(heavy.length, 'chamada de ferramenta', 'chamadas de ferramenta')} nos últimos ${duration(config.windowMs)} acima de ${tokens(config.toolContext)} tokens de contexto, e cada uma relê os ${tokens(context)}`
  if (!state.canAsk) {
    const base = `${sentence(detail)}. Ninguém pode aprovar mais nesta sessão. ${request.loop === MAIN ? 'Encerre a rodada; a sessão precisa de /compact.' : 'Termine com o que tem e relate.'}`
    return refuse(state, config, now, 'tool-budget', `tool-budget:${request.loop}`, base, false)
  }
  return {
    kind: 'ask',
    family: 'heavy',
    loop: request.loop,
    trips: [{ rule: 'tool-budget', detail, leaseKey: `heavy:${request.loop}`, leaseUntil: now + HEAVY_LEASE_MS }],
    question: `${sentence(detail)}. Continuar trabalhando com ${tokens(context)} de contexto?`,
    options: request.loop === MAIN ? [HEAVY_CONTINUE, HEAVY_COMPACT, HEAVY_STOP] : [HEAVY_CONTINUE, HEAVY_STOP_AGENT],
  }
}

export type HeavyOutcome = { verdict: Verdict; compactAfterTurn: boolean }

/** Applies the user's answer to a heavy-context question; dismissing it stops the loop. */
export function resolveHeavyAsk(
  state: SessionState,
  config: Config,
  now: number,
  ask: Ask,
  answer: string | undefined,
): HeavyOutcome {
  const loop = loopOf(state, ask.loop)
  if (answer === HEAVY_CONTINUE || answer === HEAVY_COMPACT) {
    loop.heavyLeaseUntil = now + HEAVY_LEASE_MS
    loop.heavyCalls.push(now)
    return { verdict: ALLOW, compactAfterTurn: answer === HEAVY_COMPACT }
  }
  loop.stopped = true
  const typed = answer === undefined || answer === HEAVY_STOP || answer === HEAVY_STOP_AGENT ? undefined : answer
  return { verdict: refuseStopped(state, config, now, ask.loop, typed), compactAfterTurn: false }
}

/** Refuses a call in a loop the user stopped; `typed` is what they wrote in place of choosing. */
function refuseStopped(state: SessionState, config: Config, now: number, loop: LoopId, typed?: string): Deny {
  const isMain = loop === MAIN
  const said = typed === undefined ? `O usuário parou esta ${isMain ? 'rodada' : 'agente'}` : `O usuário respondeu "${typed}"`
  const next = isMain ? 'Encerre a rodada agora e recomende /compact antes da próxima tarefa.' : 'Pare de trabalhar e relate o que tem.'
  const base = `${said} at ${tokens(loopOf(state, loop).context ?? 0)} context tokens. ${next}`
  return refuse(state, config, now, 'stopped', `stopped:${loop}`, base, false)
}
