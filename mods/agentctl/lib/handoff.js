// Model-free hand-over (requirements FR-15, UC-6; tech spec § 3.4). Pure: built only from records.
// It answers the eight questions and keeps three sources apart: what the user confirmed (the task),
// what tools observed (operations, evidence), and what Claude only claimed (never stored as a fact,
// so the hand-over says plainly that nothing claimed is shown as verified).

import { CAPS, sanitize } from './sanitize.js'
import { HARD_FORBIDDEN } from './policy.js'
import { evidenceCurrent } from './view.js'

const s = (x, n = 200) => sanitize(x, n)

// Each section is { heading, items, fixed }: headings and `fixed` lines always appear; `items` fill the
// remaining budget in order and the rest is counted, so the size cap never drops a heading or the
// limits disclosure (INV-005) the way truncating the finished text would.
function assemble(head, sections, cap) {
  const fixedText = [...head, ...sections.flatMap((x) => ['', x.heading, ...x.fixed])].join('\n')
  const omitLine = (n) => `- … ${n} omitidos (limite de tamanho da passagem de bastão)`
  let budget = cap - fixedText.length - sections.length * omitLine(99999).length
  const out = [...head]
  for (const x of sections) {
    out.push('', x.heading)
    let shown = 0
    for (const it of x.items) {
      if (it.length + 1 > budget) break
      out.push(it); budget -= it.length + 1; shown++
    }
    if (shown < x.items.length) out.push(omitLine(x.items.length - shown))
    out.push(...x.fixed)
  }
  return out.join('\n')
}

export function handoff({ task, state, evidence, fingerprint, decisions, now, sessionId }) {
  // When the last tree reading was taken: the hand-over starts no process, so it never re-reads.
  const seenAt = typeof fingerprint?.at === 'number' ? ` em ${new Date(fingerprint.at).toISOString()}` : ''
  const head = [
    `# Passagem de bastão — ${task ? s(task.goal, 120) : 'nenhuma tarefa vinculada'}`,
    '',
    `Gerada de registros estruturados em ${new Date(now).toISOString()} (sessão ${s(sessionId, 60)}); nenhum modelo foi chamado.`,
  ]
  const sec = []
  sec.push({ heading: '## 1. Objetivo', items: [], fixed: [task ? s(task.goal, 500) : 'Nenhuma tarefa foi declarada nesta sessão.'] })
  const scope = []
  if (task) {
    scope.push(`- Árvore de trabalho: ${s(task.worktree)}`)
    scope.push(`- Edições: ${(task.allow ?? []).includes('edit') ? `permitidas em ${(task.editRoots ?? ['.']).map((r) => s(r)).join(', ')}` : 'não permitidas'}`)
    scope.push(`- Executores autorizados: ${(task.executors ?? []).map((e) => s(e.argv.join(' '))).join('; ') || 'nenhum'}`)
    scope.push(`- Proibido: ${(task.forbid ?? []).map((f) => s(Array.isArray(f) ? f.join(' ') : f)).join('; ') || 'nenhum'}, mais ${[...new Set(HARD_FORBIDDEN.map((h) => h.rule))].join(', ')}`)
    if (task.acceptance?.length) scope.push(`- Condições de aceitação: ${task.acceptance.map((a) => s(a)).join('; ')}`)
  }
  sec.push({ heading: '## 2. Escopo permitido e proibido', items: scope, fixed: task ? [] : ['- Nenhum escopo foi declarado.'] })
  const ops = Object.entries(state.ops ?? {})
  const edits = ops.filter(([, o]) => ['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(o.tool) && o.outcome === 'ok')
  sec.push({ heading: '## 3. O que mudou', items: [], fixed: [
    fingerprint ? `- Árvore: HEAD ${s(fingerprint.head, 60)}, ${fingerprint.changedCount ?? '?'} caminho(s) alterado(s) ou não rastreado(s) (${fingerprint.coverage})${seenAt ? `, lida${seenAt}` : ''}` : '- Árvore: não lida para esta passagem de bastão',
    // Only the edit tools are counted here; a file changed through Bash shows in the tree line above
    // (found in an uncoached run: "Edits observed: 0" beside a changed README read as "nothing changed").
    `- Chamadas de ferramentas de edição nesta sessão: ${edits.length} (alterações feitas via Bash não são contadas aqui; a linha da árvore é o registro)`,
  ] })
  const ev = Object.values(evidence ?? {})
  const matches = (e) => fingerprint && e.after && e.before && e.before.value === e.after.value && e.after.value === fingerprint.value && e.outcome === 'ok'
  // Partial coverage is never "verified": what a reading did not cover may have changed — the
  // before, the after and the last reading must each be complete. The same rule `/agentctl` uses.
  const current = (e) => evidenceCurrent(e, fingerprint)
  const verified = ev.filter(current).map((e) => `- ${s(e.requested)} — nenhum erro relatado, confere com a última leitura da árvore${seenAt} (${e.coverage})`)
  sec.push({ heading: '## 4. Verificado (evidência de execução na última leitura da árvore)', items: verified, fixed: verified.length ? [] : ['- Nada.'] })
  const notVerified = ev.filter((e) => !current(e)).map((e) => {
    const why = e.outcome === 'backgrounded' ? 'iniciado, conclusão não observada' : e.outcome !== 'ok' ? `outcome ${e.outcome}` : !e.after || !e.before ? 'evidência indisponível' : e.before.value !== e.after.value ? 'árvore mudou durante a execução' : matches(e) ? 'cobertura parcial — parte da árvore não foi lida' : 'desatualizado — a árvore mudou desde então'
    return `- ${s(e.requested)} — ${why}`
  })
  sec.push({ heading: '## 5. Não verificado', items: notVerified, fixed: ['- Qualquer coisa que o Claude afirmou como feita, aprovada ou corrigida sem um registro de evidência acima é apenas seu próprio julgamento.'] })
  const open = ops.filter(([, o]) => o.endedAt === undefined && o.outcome !== 'refused')
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  const running = [
    ...open.map(([id, o]) => `- ${s(o.requested)} (${o.tool}, ${o.outcome}) — ${id}`),
    ...bg.map(([id, b]) => `- segundo plano ${s(id, 60)} — ${b.status}${b.asOf ? ` as of ${new Date(b.asOf).toISOString()}` : ''}`),
  ]
  sec.push({ heading: '## 6. Ainda em execução ou desconhecido', items: running, fixed: running.length ? [] : ['- Nada observado como ainda em execução. Processos não acompanhados não podem ser confirmados de nenhuma forma.'] })
  const iv = Object.keys(state.interventions ?? {})
  sec.push({ heading: '## 7. Próxima etapa', items: [], fixed: [iv.length ? `- Resolver: ${iv.map((x) => s(x, 60)).join(', ')}` : '- Nada registrado. Decida pelas seções 4 a 6.'] })
  const refused = (decisions ?? []).filter((d) => d.outcome === 'deny' || d.outcome === 'unknown' || d.outcome === 'needs-user-refused')
  sec.push({ heading: '## 8. Ainda não permitido', items: [], fixed: [
    ...(refused.length ? refused.slice(-10).map((d) => `- ${s(d.requested)} — ${s(d.rule)}`) : ['- Nenhuma chamada foi recusada nesta sessão; o escopo proibido na seção 2 continua valendo.']),
    '- Aprovações anteriores não se transferem: ao retomar, cada chamada é classificada novamente e o host pergunta de novo.',
    // INV-005: what this mod cannot refuse is disclosed here as in /agentctl policy, never silent.
    '- Limites: se o host ignorar o hook deste mod (falha do worker, mod desativado), nada aqui recusou; outro mod pode mudar um veredito em tool.check. Regras rígidas pertencem a permissions.deny.',
  ] })
  return assemble(head, sec, CAPS.handoff)
}
