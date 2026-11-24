import type { RowSpec } from './rows'

export type ShortcutKey = { key: string; label: string; terminal?: true }
export type ShortcutGroup = { title: string; keys: ShortcutKey[] }

const GROUPS: readonly ShortcutGroup[] = [
  {
    title: 'Mover',
    keys: [
      { key: 'j / k', label: 'abaixo / acima' },
      { key: 'h / l', label: 'recolher ou ir ao pai / expandir' },
      { key: 'o, Enter', label: 'abrir um arquivo ou alternar uma pasta' },
      { key: 'z', label: 'saltar para uma pasta' },
      { key: 'Space', label: 'Quick Look no macOS', terminal: true },
    ],
  },
  {
    title: 'Buscar',
    keys: [
      { key: 's', label: 'focalizar a busca' },
      { key: 'i', label: 'buscar na pasta sob o cursor' },
      { key: 'c / r', label: 'diferenciar maiúsculas / expressão regular' },
      { key: 'q', label: 'buscar conteúdo de arquivos em vez de nomes' },
    ],
  },
  {
    title: 'Arquivos e ações',
    keys: [
      { key: 'd', label: 'diff' },
      { key: 'click', label: 'selecionar uma linha' },
      { key: 'ctrl+click', label: 'adicionar ou remover uma linha; alt+click no macOS' },
      { key: 'shift+click', label: 'selecionar o intervalo a partir da âncora' },
      { key: 'shift+j / k', label: 'estender a seleção para baixo / cima' },
      { key: 'v / V', label: 'adicionar ou remover a linha / limpar as marcações' },
      { key: 'y / Y', label: 'copiar caminho relativo / absoluto' },
      { key: 'u', label: 'copiar o nome' },
      { key: 't', label: 'shell em um painel tmux ou herdr' },
      { key: 'x', label: 'proteger das edições do Claude' },
      { key: 'w', label: 'arquivos escritos fora do repositório' },
    ],
  },
  {
    title: 'Visualizar',
    keys: [
      { key: 'p', label: 'pré-visualização ou mapa de árvore', terminal: true },
      { key: 'f / b', label: 'paginar a pré-visualização', terminal: true },
      { key: '[ / ]', label: 'página anterior / próxima de PDF ou Word', terminal: true },
      { key: 'a', label: 'recolher automaticamente' },
      { key: 'n / g / m', label: 'ordenar por nome / git / valor' },
    ],
  },
  {
    title: 'Painel',
    keys: [
      { key: '?', label: 'mostrar ou ocultar esta lista', terminal: true },
      { key: 'ctrl+x tab', label: 'passar o teclado para o painel', terminal: true },
      { key: 'alt+l', label: 'passar o teclado para a árvore', terminal: true },
      { key: 'alt+h', label: 'back to the prompt', terminal: true },
      { key: '/filetree keys', label: 'configurar alt+l e alt+h', terminal: true },
      { key: 'Esc', label: 'back to the prompt', terminal: true },
    ],
  },
]

export const SCROLL_KEYS: ReadonlySet<string> = new Set(['up', 'down', 'j', 'k', 'pageup', 'pagedown', 'f', 'b', 'home', 'end'])

export function shortcutGroups(desktop: boolean): ShortcutGroup[] {
  return GROUPS.map(g => ({ title: g.title, keys: g.keys.filter(k => !desktop || !k.terminal) })).filter(g => g.keys.length > 0)
}

export function shortcutRows(accent: string, muted: string): RowSpec[] {
  const groups = shortcutGroups(false)
  const width = Math.max(...groups.flatMap(g => g.keys.map(k => k.key.length))) + 2
  const rows: RowSpec[] = [{ id: '', left: [{ t: ' Atalhos de teclado', b: true, c: accent }], right: [{ t: '? fecha ', c: muted }] }]
  for (const g of groups) {
    rows.push({ id: '', left: [{ t: ' ' }], right: [] })
    rows.push({ id: '', left: [{ t: ` ${g.title}`, b: true }], right: [] })
    for (const k of g.keys) rows.push({ id: '', left: [{ t: `   ${k.key.padEnd(width)}`, c: accent }, { t: k.label }], right: [] })
  }
  return rows
}
