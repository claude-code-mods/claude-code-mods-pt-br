# fast-jev-compaction

Plugin do Claude Code que substitui o resumo da compactação por decisões do Jev: cada chamada e resultado de ferramenta é pontuado em uma requisição rápida, os obsoletos são descartados ou truncados, e tudo que fica permanece literal. Também pode ser usado como biblioteca npm.

## O quê e por quê

A maioria das compactações de contexto pede a um LLM que resuma os turnos antigos. Um resumo tem perdas: um caminho de arquivo, erro exato, restrição ou comando pode desaparecer mesmo quando importa depois. Esta biblioteca nunca reescreve nada. Ela apenas exclui chamadas e resultados de ferramentas que o Jev diz não serem mais necessários, e pergunta ao Jev mostrando a conversa inteira. Os textos do usuário e do assistente permanecem literais e na ordem original.

O repositório é ao mesmo tempo um pacote npm (`src/`) e um plugin do Claude Code (`hooks/`, `.claude-plugin/`) que usa o pacote para substituir o resumo embutido da compactação do Claude Code pelas mensagens originais.

## Como funciona

1. Cada `tool_use` é pareado com seu `tool_result` pelo `tool_use_id`. Chamadas na primeira mensagem ou nas mensagens `preserveRecentMessages` mais recentes são fixadas e nunca tocadas.
2. O **estado** enviado ao Jev é toda a conversa até aqui, da mais antiga para a mais recente, com cada resultado de ferramenta substituído por uma nota curta (`ok, 4213 chars (omitted)`). As entradas das ferramentas são incluídas, os textos são incluídos, nada é resumido.
3. O estado é ajustado a `maxStateTokens` (25k por padrão) em etapas, cada uma aplicada só se a anterior não bastou: entradas de ferramentas truncadas para 1000, depois 200, depois 60 caracteres; textos longos reduzidos a início + fim, começando pelas mensagens mais antigas não fixadas; mensagens antigas não fixadas recolhidas em uma nota `[… N chars omitted …]`; chamadas antigas de ferramenta reduzidas a uma linha cada (`t12 Read file_path=src/a.ts → ok 480ch`); mensagens antigas sem chamadas omitidas; sequências de mensagens antigas só com chamadas fundidas em uma entrada. Se ainda não couber, a compactação lança erro. Tokens são estimados sem tokenizer (uma palavra por seis letras, meio token por dígito, ~um por outro símbolo), calibrado para ficar um pouco acima das contagens que o Jev informa.
4. Para cada chamada não fixada, o Jev recebe duas perguntas `noul`: a **chamada** deve ficar (saber que ela foi feita, com sua entrada, ainda importa), e o **resultado** deve ficar literal (seu conteúdo ainda é necessário e reexecutar a ferramenta não resolveria).
5. As perguntas são divididas em quantas requisições forem necessárias para que estado + perguntas caibam em `maxRequestTokens` (30k por padrão, abaixo do limite de 32k do Jev). O mesmo estado completo é reenviado em cada requisição; as requisições rodam em paralelo e as respostas são mescladas.
6. Decisões por chamada, comparadas com `keepThreshold`:
   - `keepResult ≥ threshold` → mantém chamada e resultado;
   - senão `keepCall ≥ threshold` → mantém a chamada, trunca o resultado nos primeiros `truncateHeadChars` caracteres mais uma nota de uma linha;
   - senão → remove a chamada junto com seu resultado.
7. A lista de mensagens é reconstruída: uma mensagem que perde todo o conteúdo é removida, mensagens intocadas são devolvidas como os mesmos objetos, e nenhum resultado fica sem sua chamada.

Falhas do Jev, respostas malformadas, chave ausente ou um histórico que não cabe lançam erro; quem chama (ou o hook do Claude Code) decide o que fazer como fallback.

## Instalação e uso

```sh
npm install fast-jev-compaction
export TYPESAFE_API_KEY=...
```

```ts
import { compactMessages, reductionRatio, type Message } from 'fast-jev-compaction';

const transcript: Message[] = [
  { role: 'user', text: 'Fix the failing test. Never edit src/generated.', toolUses: [] },
  {
    role: 'assistant',
    text: '',
    toolUses: [{ tool_use_id: 'toolu_1', tool: 'Read', input: { file_path: 'src/a.ts' } }],
  },
  { role: 'user', text: '', toolUses: [], toolResults: [{ tool_use_id: 'toolu_1', text: '…file…' }] },
  // …
];

const result = await compactMessages(transcript, { preserveRecentMessages: 4 });
console.log(result.messages, result.decisions, result.stats);
if (reductionRatio(result) < 0.25) {
  // not worth it: keep the original transcript, or summarize instead
}
```

`Message` é um subconjunto do `SessionMessage` do Claude Code, então uma transcrição de sessão pode ser passada diretamente.

Para trazer seu próprio transporte, implemente `JevAsker` (um método `ask(state, questions)`) e chame `compact(messages, asker, options)`; `buildJevRequest` e `parseJevResponse` dão o corpo da requisição HTTP e a validação da resposta. Os blocos (`collectToolCalls`, `fitState`, `batchCalls`, `decideCall`, `applyDecisions`) também são exportados.

`apiKey` tem como padrão `process.env.TYPESAFE_API_KEY`. Nunca faça commit da chave nem a coloque em um arquivo de código.

## Opções

| Opção | Padrão | Descrição |
| --- | --- | --- |
| `apiKey` | `TYPESAFE_API_KEY` | Chave da API TypeSafe (`compactMessages`/`JevClient`) |
| `model` | `jev-latest` | Nome do modelo Jev |
| `baseUrl` | `https://api.typesafe.ai/v1/systemone` | Endpoint do System One |
| `fetch` | `fetch` nativo | Implementação de fetch injetável para testes |
| `goal` | últimas 3 mensagens do usuário | Descrição da tarefa em andamento incluída no estado |
| `keepThreshold` | `0.5` | Probabilidade mínima de manutenção para uma chamada ou resultado ficar |
| `preserveRecentMessages` | `6` | Mensagens mais recentes nunca tocadas (a primeira sempre é mantida) |
| `maxStateTokens` | `25000` | Teto estimado de tokens para o estado |
| `maxRequestTokens` | `30000` | Teto estimado para estado mais um lote de perguntas |
| `truncateHeadChars` | `300` | Caracteres de um resultado de ferramenta descartado mantidos antes da nota |

`result.stats` informa contagens de mensagens e caracteres antes e depois, as contagens de decisões por motivo, o tamanho do estado em tokens estimados, qual etapa de ajuste foi necessária e o número de requisições.

## Limitações

- Só chamadas e resultados de ferramentas são candidatos; mensagens de texto nunca são removidas ou encurtadas na saída (são apenas abreviadas no estado que o Jev vê).
- Tamanhos de token são estimativas a partir de contagens de caracteres, não de um tokenizer.
- A calibração é por requisição; uma probabilidade não é prova de que um resultado é seguro para excluir. O assistente sempre pode reexecutar a ferramenta.
- O estado completo é repetido em cada requisição, então um histórico perto do teto de estado custa uma requisição a cada poucas perguntas.

## Plugin do Claude Code

A raiz do repositório é um plugin de function hooks do Claude Code: `hooks/fast-jev.ts` é um adaptador fino que passa transcrições de `session.compact` pelo `src/` e recorre ao resumo embutido do Claude Code em caso de erro ou redução insuficiente. Veja [`hooks/README.md`](hooks/README.md) para configuração e a referência de tipos do Claude Code 2.1.274.

### Instalar no Claude Code

Function hooks são um recurso de acesso antecipado do Claude Code (2.1.274+), então a flag de opt-in precisa ser definida onde quer que o Claude Code rode, por exemplo em `~/.claude/settings.json`:

```json
{ "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1", "TYPESAFE_API_KEY": "<sua chave>" } }
```

Depois adicione este repositório como marketplace de plugins e instale o plugin, pelo shell ou por comandos slash dentro de uma sessão:

```sh
claude plugin marketplace add tamaratran/fast-jev-compaction
claude plugin install fast-jev-compaction@fast-jev-compaction
```

A instalação pede as opções do plugin (chave de API, limiares, `truncateHeadChars`, …); deixe nos padrões para usar `TYPESAFE_API_KEY` do ambiente. Reinicie o Claude Code ou execute `/reload-plugins`. A partir daí, `/compact` (e a compactação automática) passa pelo Jev: o aviso diz `fast-jev-compaction: kept N/M messages, no summary (…)` quando o histórico podado substituiu o resumo embutido, ou `fallback to built-in summary (…)` quando o Jev não conseguiu remover o suficiente (sessões curtas, ou quando falha).

Para rodar a partir de um checkout sem instalar: `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir .` a partir da raiz do repositório. Não é preciso publicar nada; o marketplace é apenas o `.claude-plugin/marketplace.json` do repositório.

## Desenvolvimento

```sh
npm install
npm run typecheck        # biblioteca + hook
npm test
npm run build
npm run validate:plugin  # claude plugin validate
TYPESAFE_API_KEY="$(cat ~/.typesafe_key)" npm run demo
```

Os testes unitários usam um Jev falso e nunca contactam a TypeSafe. A demo é a verificação de rede ao vivo.

## Demo animada (macOS)

`demo/JevDemo` é um pequeno aplicativo SwiftUI nativo que reproduz uma versão roteirizada e dramatizada do fluxo de compactação dentro de um terminal estilo Claude Code: as chamadas de ferramentas de uma transcrição preparada são pontuadas, resultados e chamadas que o Jev deixa ir ficam vermelhos e desaparecem, e o resto permanece literal. Ele nunca chama a API; existe para ser gravado em tela.

```sh
demo/JevDemo/build.sh   # compila demo/JevDemo/build/JevDemo.app e o abre
```

Pressione espaço no app para reproduzir do início.
