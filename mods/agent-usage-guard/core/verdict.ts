// What a gate decides, and the denial ladder every model-facing refusal goes
// through, so no two refusals read the same and a retry loop ends.

import type { Config } from './config.ts'
import type { LoopId, SessionState } from './state.ts'
import { clock, duration, shortClock } from './text.ts'

export type Rule =
  // Agents, never asked: structure and runaway loops.
  | 'depth'
  | 'fuse'
  | 'limit-deny'
  // A wakeup or scheduled job, past the refusal threshold.
  | 'schedule'
  // Agents, asked when someone can answer.
  | 'concurrency'
  | 'starts'
  | 'agent-tokens'
  | 'burn'
  | 'limit'
  // A question about it is already open.
  | 'asking'
  // Tool calls.
  | 'retry'
  | 'stopped'
  | 'tool-budget'
  // Prompts.
  | 'prompt-context'
  | 'dormant'

/** One condition that tripped, and how long an approval of it lasts. */
export type Trip = {
  rule: Rule
  detail: string
  leaseKey: string
  leaseUntil: number
  /** For `agent-tokens`: the subagent tokens it counted, for the journal's bucket. */
  tokens?: number
}

export type Family = 'agents' | 'heavy' | 'prompt'

export type Allow = { kind: 'allow'; note?: string }
/** `n` is which refusal of the condition this is; a call only held back has none. */
export type Deny = { kind: 'deny'; rule: Rule; message: string; n?: number }
export type Drop = { kind: 'drop'; rule: Rule; message: string }
export type Ask = {
  kind: 'ask'
  family: Family
  loop: LoopId
  trips: Trip[]
  question: string
  options: readonly string[]
}

export type Verdict = Allow | Deny | Drop | Ask

export const ALLOW: Allow = { kind: 'allow' }

/** The chip AskUserQuestion draws beside every question the guard asks. */
export const HEADER = 'Proteção de uso'

export const SIGNATURE = 'agent-usage-guard'

/**
 * Words a refusal for the model. The first refusal of a condition states it;
 * the second says it has not changed; from the third, the model is told to end
 * the turn, or, when a Stop hook keeps reopening the turn, to hand the decision
 * to the user. Each carries its number and the time, so none is byte-identical.
 *
 * Refused agent calls also feed the fuse: `fuseMax` of them within `fuseMs`
 * pause every agent spawn in the session for `fuseMs`.
 */
export function refuse(
  state: SessionState,
  config: Config,
  now: number,
  rule: Rule,
  key: string,
  base: string,
  agent: boolean,
): Deny {
  const earlier = state.denials.filter((d) => d.key === key && now - d.at < config.windowMs)
  const n = earlier.length + 1
  state.denials.push({ at: now, key, agent, rule })
  const parts = [base]
  if (n >= 2 && state.reopened) {
    parts.push(
      'Um hook Stop reabriu esta rodada, então encerrá-la não resolve. Diga ao usuário que o agent-usage-guard está retendo isso e que /agent-guard allow libera; depois aguarde a resposta.',
    )
  } else if (n === 2) {
    parts.push(`Isso não mudou desde ${clock(earlier[0]!.at)}, então a mesma chamada falha novamente. Faça algo diferente.`)
  } else if (n >= 3) {
    parts.push('As novas tentativas continuam falhando e cada uma reenvia o contexto inteiro. Encerre a rodada e diga ao usuário o que está bloqueado.')
  }
  if (agent && state.fuseUntil === undefined) {
    const agentDenials = state.denials.filter((d) => d.agent && now - d.at < config.fuseMs).length
    if (agentDenials >= config.fuseMax) {
      state.fuseUntil = now + config.fuseMs
      parts.push(
        `São ${agentDenials} chamadas de agente recusadas em ${duration(config.fuseMs)}, então novos agentes nesta sessão ficam pausados até ${shortClock(state.fuseUntil)}.`,
      )
    }
  }
  parts.push(`[${SIGNATURE} · recusa ${n} às ${clock(now)}]`)
  return { kind: 'deny', rule, message: parts.join(' '), n }
}
