// `/agent-guard` and its arguments. The command runs without a model turn and
// the model cannot run it, and the adapter refuses an override another plugin
// runs, so an override is always the user's. The model does read the
// command's reply with its next request.

import { SIMULATED, type SimulatedRule } from './simulate.ts'
import { MAIN, type Scope, type SessionState, loopOf } from './state.ts'
import { duration, sentence, shortClock } from './text.ts'
import { USAGE, scopeName } from './status.ts'

export type Command =
  | { action: 'status' }
  | { action: 'allow'; scope: Scope; minutes: number }
  | { action: 'resume' }
  | { action: 'report'; days: number }
  | { action: 'simulate'; rule: SimulatedRule }
  | { action: 'help'; error?: string }

export const DEFAULT_ALLOW_MINUTES = 10
const MAX_ALLOW_MINUTES = 8 * 60
const DEFAULT_REPORT_DAYS = 7
const MAX_REPORT_DAYS = 3650

export function parseCommand(args: string): Command {
  const words = args.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const [verb, ...rest] = words
  if (verb === undefined || verb === 'status') return { action: 'status' }
  if (verb === 'help') return { action: 'help' }
  if (verb === 'resume') return { action: 'resume' }
  if (verb === 'report') {
    const days = rest[0] === undefined ? DEFAULT_REPORT_DAYS : Number(rest[0])
    if (!Number.isInteger(days) || days < 1 || days > MAX_REPORT_DAYS) return { action: 'help', error: `"${rest[0]}" não é um número de dias` }
    return { action: 'report', days }
  }
  if (verb === 'simulate') {
    const rule = SIMULATED.find((r) => r === rest[0])
    if (rule) return { action: 'simulate', rule }
    const rules = SIMULATED.join(', ')
    return { action: 'help', error: rest[0] === undefined ? `nomeie uma regra para simular: ${rules}` : `"${rest[0]}" não é uma regra; as regras são ${rules}` }
  }
  if (verb === 'allow' || verb === 'pause') {
    let scope: Scope = 'all'
    let minutes = DEFAULT_ALLOW_MINUTES
    for (const word of rest) {
      if (verb === 'allow' && (word === 'agents' || word === 'context' || word === 'all')) {
        scope = word
        continue
      }
      const n = Number(word.replace(/m(in(utes?)?)?$/, ''))
      if (!Number.isInteger(n) || n < 1 || n > MAX_ALLOW_MINUTES) {
        return { action: 'help', error: `"${word}" não é ${verb === 'allow' ? 'agents, context ou ' : ''}um número de minutos de 1 a ${MAX_ALLOW_MINUTES}` }
      }
      minutes = n
    }
    return { action: 'allow', scope, minutes }
  }
  return { action: 'help', error: `subcomando desconhecido "${verb}"` }
}

/** Lifts limits for this session, and forgets the declines and the fuse they cover. */
export function applyOverride(state: SessionState, now: number, scope: Scope, minutes: number): string {
  const until = now + minutes * 60_000
  state.override = { until, scope }
  if (scope !== 'context') {
    delete state.fuseUntil
    delete state.refusals.agents
    state.denials = state.denials.filter((d) => !d.agent)
  }
  if (scope !== 'agents') {
    for (const loop of Object.values(state.loops)) loop.stopped = false
    state.failures = {}
  }
  return `${sentence(scopeName(scope))} liberado por ${duration(minutes * 60_000)}, até ${shortClock(until)}. /agent-guard resume encerra antes.`
}

/** Ends an override and clears declined questions, so the guard asks again. */
export function resumeGuard(state: SessionState): string {
  const had = state.override !== undefined
  delete state.override
  state.refusals = {}
  delete state.fuseUntil
  state.denials = state.denials.filter((d) => !d.agent)
  loopOf(state, MAIN).stopped = false
  return had
    ? 'Os limites voltam a valer.'
    : 'Nenhuma liberação estava ativa. Perguntas recusadas foram limpas, então a proteção pergunta novamente.'
}

export function helpText(error?: string): string {
  return error ? `${sentence(error)}.\n\n${USAGE}` : USAGE
}
