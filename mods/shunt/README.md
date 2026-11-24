# shunt

Um **Claude Mod** — um plugin do Claude Code cujo comportamento é um módulo de [function hooks](https://github.com/anthropics/claude-code/issues/91870) — que mostra o uso em uma faixa acima do prompt — o pool de contas compartilhadas do gateway [shunt](https://github.com/pleaseai/shunt) quando no shunt, caso contrário os próprios limites de taxa do Claude da sessão — e responde `/shunt:usage` com o detalhamento completo do pool.

```
shunt · 5H 5% ↻1h 41m · WK 46% ↻1d 7h · Fable 31% ↻1d 7h ⚠ anthropic degraded
```

```
> /shunt:usage

shunt: pool — degraded   http://127.0.0.1:3001

  5h    ▓▓▓▓▓▓░░░░  62% left   resets 04:11
  7d    ▓▓▓▓▓▓▓▓░░  81% left   resets Sun 01:11
  fable ▓▓░░░░░░░░  19% left   resets Sun 01:11

  claude  ok         5h  71%  7d  84%  fable  19%
  codex   exhausted  5h   0%  7d  40%  fable    —

  headroom left, averaged over the pool's accounts; a shared figure, not a promise about your next request
```

O mod lê o endpoint [`GET /usage`](https://shunt.sh/reference/endpoints/) do gateway e o imprime. Ele responde ao comando sozinho — o hook retorna sem chamar `next`, então nada é enviado ao modelo e a resposta não custa tokens.

## A faixa de uso

Em um gateway shunt, a faixa mostra o pool, marcado como `shunt ·`. Cada figura é o quanto da janela está **usado** — `1 - remaining`, a mesma média do pool que o comando informa como folga — seguido do tempo até o reset mais cedo daquela janela. Usado em vez de restante, para ler da mesma forma que o próprio `/usage` do Claude Code e que a faixa lê a partir do shunt. Uma figura fica âmbar a partir de 70% e vermelha a partir de 90%. Cada provedor agrupado cujo status não seja `ok` é sinalizado ao fim (`⚠ anthropic degraded`: âmbar para `degraded`, vermelho para `exhausted` ou `capped`), ou o próprio pool quando nenhum provedor é listado. Uma janela que nenhuma conta informa é omitida.

Fora do shunt — sem gateway configurado, um gateway que responde `GET /usage` com 404, uma resposta de sucesso que não é um relatório de pool, ou uma que não agrupa nenhum provedor — a faixa mostra os próprios limites de taxa da sessão, sem marca, como `$.session.usage()` e `session.measure` os informam:

```
5H 5% ↻1h 41m · WK 46% ↻1d 7h
```

No shunt, ele lê `GET /usage` quando a sessão começa, a cada minuto depois e após cada turno — no momento em que o pool acabou de ser gasto — e ignora os limites próprios da sessão, que vêm da conta do pool que respondeu por último. Um token recusado (401 ou 403), um gateway inalcançável, outro status de erro ou um auxiliar `shunt gateway token` que falha é uma falha no shunt, então é sinalizado em vez de substituído: `shunt · ⚠ credential refused`, ou `shunt · ⚠ gateway login unavailable` para o auxiliar. Sem gateway nem limites de taxa (uma chave de API enviada direto para a Anthropic), a faixa não desenha nada. O que outro plugin desenha na faixa fica à esquerda.

Recolha a faixa para a sessão com seu `[-]` (ctrl+x ctrl+a), ou desligue-a com a opção `usageBand` abaixo.

## Lendo os números

`remaining` é a fração da capacidade combinada do pool ainda **utilizável**, então `62%` significa que 62% da folga sobra, não que 62% foi gasto. É `mean(clamp(cap - utilization, 0, 1))` sobre as contas não desabilitadas que informam a janela, onde `cap` é o limite rígido `max_utilization` da conta para aquela janela (`100%` quando não definido): nove contas esgotadas mais uma nova sem limite leem `10%`, não `100%`, e uma conta a 44% sob um limite de 50% conta apenas `6%`. Uma conta que um limite já exclui das requisições da janela conta zero; um limite de 5h ou 7d a exclui de toda requisição, inclusive as do Fable.

É um **agregado do pool, não uma previsão** — o roteamento também pesa disponibilidade, modelo, afinidade de sessão e prioridade, então uma figura saudável não é promessa de que sua próxima requisição seja admitida. Para o pior caso ciente de roteamento, use `GET /api/oauth/usage`.

| Janela | O que cobre |
| ------- | -------------- |
| `5h`    | A janela de sessão rolante de 5 horas |
| `7d`    | A janela semanal compartilhada |
| `fable` | A janela semanal com escopo no Fable (`7d_oi`) |

Uma janela lê `—` quando nenhuma conta não desabilitada a informa. Contas ChatGPT/Codex preenchem `5h` e `7d` a partir de cabeçalhos de resposta `x-codex-*` e não têm sinal próprio com escopo no Fable.

`pool` é o agregado de todos os provedores agrupados; as linhas abaixo dele são o mesmo agregado por provedor agrupado, então uma sessão roteada para um provedor pode ler a folga desse provedor em vez da figura misturada. O endpoint nunca carrega nomes de contas, contagens, prioridades nem números por conta — esse detalhe fica atrás do `GET /admin/api/pool`, acessível só por administradores.

## Pré-requisitos

1. **Aponte o Claude Code para o seu gateway**, como você já faz para rotear por ele:

   ```bash
   export ANTHROPIC_BASE_URL=http://127.0.0.1:3001
   export ANTHROPIC_AUTH_TOKEN=<seu token de cliente>
   ```

2. **Habilite o endpoint** no gateway. `GET /usage` é opcional e requer `[server.auth]` (tokens de cliente) ou `[server.gateway]` (login do gateway), ao lado da tabela `[server.usage]` no `shunt.toml`:

   ```toml
   [server.auth]

   # A presença sozinha opta por isso; a tabela não recebe chaves.
   [server.usage]
   ```

   Com `[server.gateway]` em vez de `[server.auth]`, veja as [sessões `shunt gateway claude`](#sessões-shunt-gateway-claude) abaixo. `[server.auth]` toma seus tokens do ambiente em vez do TOML — por padrão `SHUNT_CLIENT_TOKENS`, como pares `name:token` — e o gateway falha ao iniciar quando está indefinido. Exporte-o onde o gateway roda, usando o mesmo token que você definiu como `ANTHROPIC_AUTH_TOKEN` acima:

   ```bash
   export SHUNT_CLIENT_TOKENS="claude-code:<seu token de cliente>"
   ```

3. **Rode o Claude Code com function hooks habilitados** — o recurso está em acesso antecipado:

   ```bash
   CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
   ```

Sem o passo 3 não há faixa, e o comando ainda existe, mas recorre a `commands/usage.md`, que pede ao modelo para ler o endpoint com uma chamada de ferramenta em vez disso.

## Instalação

```
/plugin marketplace add pleaseai/shunt
/plugin install shunt@shunt
```

## Configuração

Uma opção, uma linha em `/config` (armazenada em settings.json sob `pluginConfigs`):

| Opção | Padrão | Finalidade |
| ------ | ------- | ------- |
| `usageBand` | `true` | Mostra a faixa acima do prompt. Desligada, o mod não registra nenhuma faixa e não faz polling; `/shunt:usage` ainda responde |

O mod lê cinco variáveis de ambiente e não escreve nenhuma. Por padrão, ele envia a credencial própria da sessão ao gateway para o qual a sessão já envia toda mensagem, então não alcança nenhum host que a sessão já não estivesse usando; `SHUNT_BASE_URL` é a única exceção deliberada e aponta para um gateway que você nomeia. Sem URL base definida, ele não pede nada em vez de enviar a credencial para a API da Anthropic.

| Variável | Finalidade |
| -------- | ------- |
| `SHUNT_BASE_URL` | A URL base do gateway; sobrepõe `ANTHROPIC_BASE_URL` |
| `ANTHROPIC_BASE_URL` | O gateway por onde esta sessão já roteia |
| `SHUNT_TOKEN` | O token de cliente; sobrepõe ambos abaixo, enviado como `Authorization: Bearer` |
| `ANTHROPIC_AUTH_TOKEN` | Enviado como `Authorization: Bearer`, como o Claude Code envia |
| `ANTHROPIC_API_KEY` | Enviado como `x-api-key`, como o Claude Code envia |

`SHUNT_BASE_URL` é o que permite ler o pool de um gateway enquanto roteia o tráfego por outro.

### Sessões `shunt gateway claude`

`shunt gateway claude` limpa `ANTHROPIC_AUTH_TOKEN` e `ANTHROPIC_API_KEY` do ambiente que entrega ao Claude Code e conecta `apiKeyHelper` a `shunt gateway token` em vez disso; o Claude Code consome a saída do auxiliar sozinho e nunca a reexporta. Quando nenhuma das variáveis acima contém uma credencial, o mod então lê as configurações mescladas (incluindo `--settings`) e, se `apiKeyHelper` for o próprio do shunt — `shunt gateway token`, pelo nome simples ou por caminho — o executa diretamente, sem shell, e envia o token de login do gateway que ele imprime como `Authorization: Bearer`. Como não há shell, um `~/` inicial em um caminho de auxiliar não citado é expandido para o diretório home (`HOME`, senão `USERPROFILE`) pelo próprio mod; um `'~/…'` citado permanece literal, como em um shell. O login pertence ao gateway com que a sessão fala (`ANTHROPIC_BASE_URL`), então é enviado apenas quando `SHUNT_BASE_URL` está indefinido ou soletra essa mesma URL base — comparado como string após remover espaços e barras finais, então `localhost` e `127.0.0.1` contam como diferentes — e o auxiliar nem sequer roda caso contrário; para ler o pool de outro gateway, exporte `SHUNT_TOKEN` para ele. Se esse auxiliar falhar — saída não zero, sem saída ou impossível de iniciar — a faixa sinaliza `shunt · ⚠ gateway login unavailable` e `/shunt:usage` diz para rodar `shunt gateway login`, em vez de mostrar silenciosamente os limites próprios da sessão.

O token é reutilizado por cinco minutos, então um polling a cada minuto não roda o auxiliar a cada minuto. Um token reutilizado que o gateway recusa é descartado e o auxiliar perguntado mais uma vez, pois um refresh pode tê-lo rotacionado. Qualquer outro `apiKeyHelper` — um gerenciador de senhas, um script que pede — nunca é rodado: o mod o rodaria a cada poucos minutos por uma figura de uso. Em tal sessão, exporte `SHUNT_TOKEN` com um token de cliente `[server.auth]` em vez disso, ou a faixa recorre aos próprios limites de taxa da sessão.

O gateway tem que aceitar um login de gateway em `GET /usage`, o que precisa de uma build do shunt que autentique logins `[server.gateway]` lá; `[server.usage]` com apenas `[server.gateway]` configurado é suficiente.

## Por que `/shunt:usage` e não `/usage`

`/usage` é o comando próprio embutido do Claude Code, e o engine se recusa a deixar um plugin tomar o nome de um comando embutido:

```
$.command.register: "/usage" refused: it is the built-in /usage
```

`$.command.register` toma um nome global simples. Um comando em **markdown** de um plugin é namespaced pelo plugin, então `commands/usage.md` em um plugin chamado `shunt` lista como `shunt:usage` e não colide com nada. O módulo de hooks então intercepta `command.run` para esse nome e responde diretamente.

## Layout

| Caminho | O que é |
| ---- | ---------- |
| `hooks/register.tsx` | Os hooks: `command.run` em `shunt:usage`, e o `session.start`, `session.measure`, `turn.complete` e `ui.render` da faixa em `AbovePrompt` |
| `hooks/endpoint.ts` | Resolve a URL do gateway e o cabeçalho de credencial |
| `hooks/report.ts` | Lê um corpo de `GET /usage`, de forma defensiva |
| `hooks/reading.ts` | Transforma uma ida e volta em um relatório ou um problema, completo e breve |
| `hooks/views.ts` | Renderiza as barras, porcentagens e horários de reset do comando |
| `hooks/band.ts` | As células, alertas, níveis e contagens regressivas da faixa, a partir do pool ou dos próprios limites da sessão |
| `hooks/names.ts` | O nome do comando e os textos fixos |
| `types/index.d.ts` | O contrato `$.state`: o snapshot do pool, os limites da sessão e o relógio de que a faixa desenha |
| `commands/usage.md` | O comando e o fallback sem function hooks |
| `tests/*.spec.ts` | Suite Vitest sobre os módulos puros |
| `tests/mod/*.test.tsx` | Suite do engine sobre os hooks, rodada por `claude plugin test` |

## Desenvolvimento

```bash
# A análise estática de efeitos colaterais: quais eventos ele hooka, quais chamadas $ e variáveis de ambiente lê e escreve.
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude plugin validate plugins/shunt

# A suite dos módulos puros e o typecheck (ambos os gates do CI).
cd plugins/shunt && npm ci && npm run typecheck && npm test

# Os hooks contra o próprio engine: a faixa e o comando, com o gateway, o relógio e o ambiente mockados. Precisa de um binário do Claude Code, então o CI não roda.
claude plugin test plugins/shunt

# Rodar a partir do código contra um gateway ao vivo.
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir plugins/shunt
```

`hooks/register.tsx` é o único arquivo de hooks que importa `claude-code`. Typecheck dele precisa do próprio `claude-code.d.ts` do engine, que o Claude Code escreve no projeto do autor do plugin via `/plugin-types`; os outros módulos não importam nada do engine, por isso a suite os cobre sem isso. Pela mesma razão, `tsconfig.json` exclui `hooks/register.tsx` de `npm run typecheck`, junto com `tests/mod`, a suite do engine — essa exclusão é deliberada, não um esquecimento, e typecheck desse único arquivo significa rodar `/plugin-types` antes.

> Function hooks estão em acesso antecipado. Módulos de hooks carregam apenas onde estão habilitados, e a API contra a qual este mod foi escrito pode mudar entre releases do Claude Code sem aviso.

## Licença

MIT OR Apache-2.0, correspondendo ao projeto shunt.
