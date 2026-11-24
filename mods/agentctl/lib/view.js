// What the band, `/agentctl` and `/agentctl policy|events` say (requirements FR-2, FR-3, FR-17,
// FR-23; tech spec § 3.3). Pure: every input arrives as data, every line names its source and age,
// and a field whose source did not answer says so instead of showing a value.

import { checkLine } from './firstrun.js'
import { digest } from './fingerprint.js'
import { sanitize } from './sanitize.js'

// The opaque key evidence for a declared check is stored under: arguments never become a stored
// identifier in plaintext.
export function checkKey(argv) {
  return 'check-' + digest(argv.join('\u0000'))
}

// Evidence counts as current only when the check reported no error, the tree did not change during
// the run, the run's reading matches the last one, and no reading was partial.
export function evidenceCurrent(ev, fingerprint) {
  if (!fingerprint || !ev || ev.outcome !== 'ok' || !ev.before || !ev.after) return false
  if (ev.before.value !== ev.after.value || ev.after.value !== fingerprint.value) return false
  return ![ev.coverage, ev.before.coverage, ev.after.coverage, fingerprint.coverage].includes('partial')
}

// Where the task's declared checks stand on the current tree: how many there are, how many have run
// at all, and which are not current (never run, failed, or stale).
export function checkProgress(task, evidence, fingerprint) {
  const rows = (task?.executors ?? []).filter((e) => e.check).map((e) => {
    const ev = evidence?.[checkKey(e.argv)]
    // Never shortened: the line is one Claude runs, and a cut command would not match the check.
    return { argv: sanitize(checkLine(e.argv), Infinity), ran: Boolean(ev), current: evidenceCurrent(ev, fingerprint) }
  })
  return { declared: rows.length, ran: rows.filter((r) => r.ran).length, pending: rows.filter((r) => !r.current).map((r) => r.argv) }
}

// The four states a field can be in (FR-3).
export function field(label, reading, now) {
  if (!reading) return `${label}: ausente`
  if (reading.failed) return `${label}: indisponível (${reading.failed})`
  const age = Math.max(0, Math.round((now - reading.at) / 1000))
  const stale = reading.staleAfterMs !== undefined && now - reading.at > reading.staleAfterMs
  return `${label}: ${reading.value} — ${reading.source}, há ${age}s${stale ? ' (desatualizado)' : ''}`
}

// review-state.js check --format=json → a gate reading. A gate pass is a gate pass, never a test pass.
export function gateReading(run, at) {
  if (typeof run === 'string') return { failed: run, at }
  if (!run || run.exitCode !== 0) return { failed: `verificação terminou com ${run ? run.exitCode : 'sem resultado'}`, at }
  let s
  try { s = JSON.parse(run.stdout) } catch { return { failed: 'não é JSON', at } }
  const word = (p) => (!p ? '?' : p.passed ? '✅' : p.verdict === 'fail' && p.digest_match ? '⛔' : p.noted && !p.digest_match ? '⏳ desatualizado' : p.owed ? '⏳ devido' : '·')
  return { value: `code ${word(s.code_review)} · doc ${word(s.doc_review)} · precommit ${word(s.precommit)}`, source: 'verificação review-state.js', at }
}

// Usage windows are read by kind; a missing window is missing, never 0%. One account's windows are
// shown for this session only and never summed with other sessions.
export function usageReading(usage, kind, at) {
  if (!usage) return null
  const w = (usage.rateLimits ?? []).find((r) => r.kind === kind)
  if (!w) return null
  return { value: `${Math.round(w.percentUsed)}%${w.resetsAt ? ` (renova ${w.resetsAt})` : ''}`, source: `uso da sessão (${w.source ?? 'host'})`, at }
}

export function contextReading(usage, at) {
  const p = usage?.context?.percent
  return typeof p === 'number' ? { value: `${Math.round(p)}%`, source: 'uso da sessão', at } : null
}

function evidenceLines(evidence, currentFingerprint, now) {
  const out = []
  for (const ev of Object.values(evidence ?? {})) {
    const fresh = currentFingerprint && ev.after && ev.after.value === currentFingerprint.value && ev.before && ev.before.value === ev.after.value
    const state = ev.outcome === 'backgrounded' ? 'iniciado, conclusão não observada'
      : ev.outcome === 'refused' ? 'recusado'
      : !ev.after || !ev.before ? 'evidência indisponível'
      : ev.before.value !== ev.after.value ? 'árvore mudou durante a execução — sem vínculo'
      : fresh && [ev.coverage, ev.before.coverage, ev.after.coverage, currentFingerprint.coverage].includes('partial') ? 'confere, mas uma leitura foi parcial'
      : fresh ? 'current'
      : 'desatualizado (árvore mudou desde então)'
    const age = Math.max(0, Math.round((now - ev.at) / 1000))
    out.push(`  ${sanitize(ev.requested, 120)}: ${ev.outcome === 'ok' ? 'nenhum erro relatado' : ev.outcome} · ${state} · ${ev.coverage ?? 'cobertura desconhecida'} · há ${age}s`)
  }
  return out
}

const REASON_LABEL = {
  input: 'aguardando sua entrada',
  permission: 'aguardando decisão de permissão',
  'policy-denied': 'recusado pela política da tarefa',
  'rate-limit': 'limite de uso atingido',
  'suspected-stall': 'sem atividade (parada não confirmada)',
}

function interventionLines(state, now) {
  return Object.entries(state.interventions ?? {}).map(([reason, v]) => {
    const age = Math.max(0, Math.round((now - v.since) / 1000))
    const detail = typeof v.detail === 'string' ? sanitize(v.detail, 120) : v.detail?.resetsAt ? `resets ${v.detail.resetsAt}` : ''
    return `  ${REASON_LABEL[reason] ?? reason}${detail ? ` — ${detail}` : ''} · desde há ${age}s`
  })
}

// Compact by default — it reaches Claude — and the diagnostic lines on `/agentctl status --details`.
// Labels say what they measure (found in a first-run test: "Observation: ok" read as "work passed").
export function statusText(m, { details = false } = {}) {
  const { now, task, state } = m
  const lines = []
  lines.push(task ? `Tarefa: ${sanitize(task.goal, 120)} (${task.id})` : 'Tarefa: nenhuma vinculada')
  const iv = interventionLines(state, now)
  lines.push(iv.length ? 'Requer atenção:' : 'Requer atenção: nada observado')
  lines.push(...iv)
  lines.push(field('Portões de revisão', m.gate, now))
  const ev = evidenceLines(m.evidence, m.fingerprint, now)
  lines.push(ev.length ? 'Evidência de execução (não é veredito de revisão):' : 'Evidência de execução: nenhuma verificação declarada foi executada')
  lines.push(...ev)
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  if (bg.length) lines.push(`Em segundo plano: ${bg.length} (${bg.map(([id]) => id).join(', ')})`)
  if (!details) {
    lines.push('Mais: /agentctl status --details · /agentctl help')
    return lines.join('\n')
  }
  lines.push(`Armazenamento de estado: ${m.health === 'ok' ? 'saudável' : m.health}`)
  lines.push(`Runtime: ${state.runtime.value}${state.runtime.tool ? ` (${state.runtime.tool})` : ''} since ${Math.max(0, Math.round((now - state.runtime.since) / 1000))}s ago · fase ${state.phase.value} · resultado ${state.result.value}`)
  // A usage reading arrives with Claude's first reply in the session; before that it is absent.
  const usage = (label, r) => (r ? field(label, r, now) : `${label}: ausente (read after Claude's first reply)`)
  lines.push(usage('Contexto', m.context))
  lines.push(usage('Janela de 5h', m.fiveHour))
  return lines.join('\n')
}

export function bandText(m) {
  const { task, state, now } = m
  const iv = Object.keys(state.interventions ?? {})
  const attention = iv.length ? `⚠ ${iv.map((r) => REASON_LABEL[r] ?? r).join(', ')}` : 'nenhuma atenção necessária'
  const head = task ? `agentctl · ${sanitize(task.goal, 40)}` : 'agentctl · sem tarefa'
  const rt = `${state.runtime.value}${state.runtime.tool ? `:${state.runtime.tool}` : ''} ${Math.max(0, Math.round((now - state.runtime.since) / 1000))}s`
  let gate = 'portões ausentes'
  if (m.gate?.failed) gate = 'portões indisponíveis'
  else if (m.gate) {
    const age = Math.max(0, Math.round((now - m.gate.at) / 1000))
    const stale = m.gate.staleAfterMs !== undefined && now - m.gate.at > m.gate.staleAfterMs
    gate = `${m.gate.value} (${age}s${stale ? ', desatualizado' : ''})`
  }
  const resume = m.checkpoint ? ` · última passagem de bastão ${new Date(m.checkpoint.savedAt).toISOString()}` : ''
  const proposal = m.pending ? ` · proposta ${m.pending.digest.slice(0, 8)} aguardando — /agentctl accept` : ''
  return `${head} · ${rt} · ${attention} · ${gate}${proposal}${resume}${m.health === 'ok' ? '' : ` · ${m.health}`}`
}

export const LIMITS = [
  'Este mod é um controle e uma exibição, não um limite de isolamento; o acesso somente leitura em produção é garantido por credenciais e pelas permissões do alvo.',
  'Se o host ignorar o hook deste mod (falha do worker, mod desativado), nada aqui recusa; mantenha comandos perigosos nomeados em suas regras permissions.deny.',
  'As regras nativas de permissão correspondem ao texto do comando, não a programas; outro mod pode mudar um veredito em tool.check.',
  'Executores autorizados são executados com seus efeitos não classificados.',
]

export function policyText(task) {
  if (!task) return ['Nenhuma tarefa vinculada: as classes internas de gravação em produção e gravação remota em git continuam recusadas; todo o resto vai para o fluxo de permissão do host.', ...LIMITS].join('\n')
  const one = (x) => (Array.isArray(x) ? x.join(' ') : Array.isArray(x?.argv) ? x.argv.join(' ') + (x.check ? ' (check)' : '') : String(x))
  const fmt = (xs) => (xs?.length ? xs.map((x) => sanitize(one(x), 200)).join('; ') : 'none')
  return [
    `Tarefa ${task.id} · versão da política ${task.policyVersion ?? 1}`,
    ...(task.recordMissing ? ['O registro da tarefa vinculada está ausente: tudo, exceto leituras dentro da árvore de trabalho, é recusado. Defina a tarefa novamente.'] : []),
    `Árvore de trabalho: ${sanitize(task.worktree, 200)}`,
    `Edições: ${(task.allow ?? []).includes('edit') ? `permitidas em ${fmt(task.editRoots ?? ['.'])}` : 'não permitidas'}`,
    `Proibido (tarefa): ${fmt(task.forbid)} · mais as classes internas de gravação em produção e gravação remota em git`,
    `Executores autorizados: ${fmt(task.executors)}`,
    `Precisa de pessoa: ${fmt(task.needsUser)}`,
    `Outras ferramentas permitidas: ${fmt(task.tools)}`,
    'Todo o resto vai para o fluxo de permissão do host (ou modo automático): o mod não o classifica.',
    'Melhor esforço: o mod lê cada chamada de ferramenta, nunca o conteúdo de um script ou os comandos que ele inicia.',
    ...LIMITS,
  ].join('\n')
}

export function eventsText(decisions, n, now) {
  const list = (decisions ?? []).slice(-n)
  if (!list.length) return 'Nenhuma decisão registrada nesta sessão.'
  return list.map((d) => `há ${Math.max(0, Math.round((now - d.at) / 1000))}s · ${d.outcome} · ${d.tool} · ${sanitize(d.requested, 160)} · ${sanitize(d.rule, 160)}`).join('\n')
}
