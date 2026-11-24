// What the user sees without asking: one status line while something needs
// attention, and the `/agent-guard` command's text.

import { highestLimit } from './agents.ts'
import type { Config } from './config.ts'
import { MAIN, type PeerRecord, type Scope, type SessionState, countOnMachine, runningAgents } from './state.ts'
import { count, duration, shortClock, tokens, windowName } from './text.ts'

/** The line under the prompt, or undefined when there is nothing to say. */
export function statusLine(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): string | undefined {
  if (!config.enabled) return undefined
  const parts = liftedOrPaused(state, now)
  const limit = highestLimit(state, peers, now)
  if (limit && limit.percent >= config.limitDenyPercent) {
    parts.push(`janela ${windowName(limit.kind)} ${limit.percent}%: novos agentes recusados`)
  } else if (limit && limit.percent >= config.limitAskPercent) {
    parts.push(`janela ${windowName(limit.kind)} ${limit.percent}%: novos agentes precisam de aprovação`)
  }
  const context = state.loops[MAIN]?.context
  if (context !== undefined && context >= config.contextHard) {
    parts.push(`contexto ${tokens(context)}: /compact recomendado`)
  } else if (context !== undefined && context >= config.contextWarn) {
    parts.push(`contexto ${tokens(context)}`)
  }
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/** Which questions are open now, for the band. */
export type Asking = { agents: boolean; context: boolean }

/**
 * The band above the prompt: the guard's own state while it has something to
 * say, the agents on this machine against their limits first. `alert` when a
 * limit is reached or the guard is holding something.
 */
export function bandLine(
  state: SessionState,
  peers: readonly PeerRecord[],
  config: Config,
  now: number,
  asking: Asking,
): { text: string; alert: boolean } | undefined {
  if (!config.enabled) return undefined
  const window = config.windowMs
  const running = runningAgents(state) + peers.reduce((sum, p) => sum + p.running, 0)
  const starts = countOnMachine(state, peers, 'starts', now, window)
  const declined = state.refusals.agents !== undefined && now < state.refusals.agents ? state.refusals.agents : undefined
  const paused = state.fuseUntil !== undefined && now < state.fuseUntil ? state.fuseUntil : undefined
  const refusal = state.denials.filter((d) => now - d.at < window).at(-1)

  const parts: string[] = []
  if (running > 0 || starts > 0) parts.push(`${running} de ${config.agentMax} agentes em execução`)
  if (starts > 0) parts.push(`${starts} de ${config.rollingMax} iniciados nos últimos ${duration(window)}`)
  if (asking.agents) parts.push('perguntando sobre iniciar agentes')
  if (asking.context) parts.push('perguntando sobre o tamanho do contexto')
  if (declined !== undefined) parts.push(`novos agentes recusados até ${shortClock(declined)}`)
  if (paused !== undefined) parts.push(`novos agentes pausados até ${shortClock(paused)}`)
  if (refusal) parts.push(`última recusa ${shortClock(refusal.at)}: ${refusal.rule}`)
  if (parts.length === 0) return undefined

  const holding = asking.agents || asking.context || declined !== undefined || paused !== undefined || refusal !== undefined
  const full = running >= config.agentMax || starts >= config.rollingMax
  return { text: `Proteção de uso · ${parts.join(' · ')}`, alert: holding || full }
}

/** When the band changes with no event to redraw it: a start, a refusal, a decline or the pause ages out. */
export function bandExpiry(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): number | undefined {
  if (!config.enabled) return undefined
  const window = config.windowMs
  const aging = [...state.starts, ...peers.flatMap((p) => p.starts), ...state.denials.map((d) => d.at)].map((t) => t + window)
  const later = [...aging, state.refusals.agents, state.fuseUntil].filter((t): t is number => t !== undefined && t > now)
  return later.length > 0 ? Math.min(...later) : undefined
}

/** When the line changes with no event to redraw it: an allow or the fuse ends, or the most-used plan window resets. */
export function statusLineExpiry(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): number | undefined {
  if (!config.enabled) return undefined
  const times = [state.override?.until, state.fuseUntil, highestLimit(state, peers, now)?.resetsAt]
  const later = times.filter((t): t is number => t !== undefined && t > now)
  return later.length > 0 ? Math.min(...later) : undefined
}

/** What is lifted or paused now, worded alike in the status line and the report. */
function liftedOrPaused(state: SessionState, now: number): string[] {
  const parts: string[] = []
  if (state.override && now < state.override.until) {
    parts.push(`${scopeName(state.override.scope)} liberado até ${shortClock(state.override.until)}`)
  }
  if (state.fuseUntil !== undefined && now < state.fuseUntil) {
    parts.push(`novos agentes pausados até ${shortClock(state.fuseUntil)}`)
  }
  return parts
}

export function scopeName(scope: Scope): string {
  if (scope === 'agents') return 'limites de agentes'
  if (scope === 'context') return 'limites de contexto'
  return 'todos os limites'
}

/** The text `/agent-guard` and `/agent-guard status` print. */
export function statusReport(
  state: SessionState,
  peers: readonly PeerRecord[],
  config: Config,
  now: number,
  problems: readonly string[],
  version?: string,
  storeFailure?: string,
): string {
  const running = version ? ` (${version})` : ''
  if (!config.enabled) return `Desativado${running}: AGENT_GUARD está configurado para desativar.`
  const window = config.windowMs
  const lines = [`Ativado${running}.`]

  const peerRunning = peers.reduce((sum, p) => sum + p.running, 0)
  const starts = countOnMachine(state, peers, 'starts', now, window)
  lines.push(
    `Agents: ${runningAgents(state)} running aqui, ${peerRunning} em ${count(peers.length, 'outra sessão', 'outras sessões')} (limit ${config.agentMax}); ${starts} started in the last ${duration(window)} (limit ${config.rollingMax}).`,
  )

  const limits = Object.values(state.limits).filter((r) => r.resetsAt === undefined || r.resetsAt > now)
  if (limits.length > 0) {
    const text = limits
      .map((r) => `${windowName(r.kind)} ${r.percent}%${r.resetsAt === undefined ? '' : ` (renova ${shortClock(r.resetsAt)})`}`)
      .join(', ')
    lines.push(`Janelas do plano: ${text}. Novos agentes pedem aprovação a partir de ${config.limitAskPercent}% e são recusados a partir de ${config.limitDenyPercent}%.`)
  } else {
    lines.push('Janelas do plano: ainda sem leitura (chega com a próxima resposta em uma assinatura).')
  }

  const context = state.loops[MAIN]?.context
  lines.push(
    `Context: ${context === undefined ? 'desconhecido até a próxima resposta' : `${tokens(context)} tokens`} (warn ${tokens(config.contextWarn)}, ask before a prompt from ${tokens(config.contextHard)}).`,
  )

  const held = liftedOrPaused(state, now)
  for (const [key, until] of Object.entries(state.leases)) {
    if (now < until) held.push(`${key} aprovado${until < Number.MAX_SAFE_INTEGER ? ` até ${shortClock(until)}` : ' até o contexto diminuir'}`)
  }
  for (const [key, until] of Object.entries(state.refusals)) if (now < until) held.push(`${key} recusado até ${shortClock(until)}`)
  if (held.length > 0) lines.push(`Agora: ${held.join('; ')}.`)
  for (const problem of problems) lines.push(`Config: ${problem}.`)
  if (storeFailure !== undefined) {
    lines.push(`Armazenamento: a proteção não pôde salvar suas contagens (${storeFailure}), então outras sessões nesta máquina não contam os agentes desta. O diário também pode perder linhas.`)
  }
  lines.push('', USAGE)
  return lines.join('\n')
}

export const USAGE = [
  'Comandos:',
  '  /agent-guard allow [agents|context] [minutes]   suspende os limites da proteção nesta sessão (padrão: todos, 10 min)',
  '  /agent-guard pause [minutes]                     igual a allow, para todos os limites',
  '  /agent-guard resume                              encerra uma liberação ou pausa antes do fim e limpa perguntas recusadas',
  '  /agent-guard report [days]                       o que a proteção fez nesta máquina (padrão 7 dias)',
  '  /agent-guard simulate <rule>                     mostra o que uma regra faz, sem reter nada nem gastar nada',
  '  /agent-guard status                              este resumo',
].join('\n')
