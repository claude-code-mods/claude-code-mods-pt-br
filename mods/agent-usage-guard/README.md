# agent-usage-guard

> Impede que o Claude Code gaste sua janela de uso de cinco horas em dez minutos.

`agent-usage-guard` é um [mod](https://code.claude.com/docs/en/plugins/mods/overview) do Claude Code: roda dentro do Claude Code e contém gastos descontrolados antes que aconteçam. Ele lê o uso ao vivo do seu plano e contém a proliferação de subagentes, o giro de contextos pesados e os loops de retry.

<p align="center">
  <a href="https://www.producthunt.com/products/agent-usage-guard?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-agent-usage-guard" target="_blank" rel="noopener noreferrer">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1289693&amp;theme=dark">
      <img alt="agent-usage-guard on Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1289693&amp;theme=light">
    </picture>
  </a>
</p>

<p align="center">
  <img src="https://github.com/rbartoli/agent-usage-guard/releases/download/agent-usage-guard--v1.0.0/agent-usage-guard.gif" alt="Quatro cenas na interface interativa do Claude Code. A guarda pergunta antes que um prompt reescreva o cache expirado de uma sessão de 486k tokens retomada após duas horas, antes que um quinto agente paralelo comece com limite de quatro, antes da vigésima primeira chamada de ferramenta com 433k de contexto e antes de um novo agente quando os subagentes já processaram 10,9M de tokens." width="900">
</p>

<p align="center">
  <sub>Gravado na interface interativa do Claude Code com a guarda carregada. Uma <a href="demo/scripted-api.ts">API local roteirizada</a> faz o papel do Claude, então as sessões e as contagens de tokens são encenadas e nenhum uso é gasto. Toda pergunta na tela é da própria guarda. <a href="demo/render.sh">Recrie isso</a> a partir do <a href="demo/fixture/northstar-api">fixture Northstar</a>.</sub>
</p>

Ele age antes do gasto, não depois: antes de um agente começar, um prompt ser enviado ou uma ferramenta rodar. Os limites de agentes valem para todas as sessões do Claude Code nesta máquina, e a proliferação e os contextos pesados têm teto em qualquer nível de uso, não só perto do limite. Quando você está ao teclado, ele pergunta a você, na própria caixa de diálogo de perguntas do Claude Code. Quando ninguém pode responder, ele recusa e diz ao Claude por quê, para que o modelo espere, agrupe o trabalho ou pare. `/agent-guard report` mostra o que ele fez.

- **Ciente do plano.** Lê as porcentagens de 5 horas e semanais que o Claude Code informa e reserva o fim da janela para você.
- **Uma resposta cobre um tempo.** Uma aprovação suspende sua condição até que ela se resolva ou expire, então a mesma pergunta não volta chamada após chamada.
- **Local e com privacidade mínima.** Sem rede, sem processos. Armazena contagens e faixas grosseiras, nunca texto de prompt, entradas de ferramentas ou saída do modelo.
- **Falha aberta.** Se um de seus hooks falhar, o evento segue em frente: uma guarda quebrada nunca quebra sua sessão. A única exceção é um agente que ele não conseguiu julgar, que é recusado para que o Claude o inicie de novo.

## Instalação

Execute estes comandos dentro do Claude Code v2.1.287 ou mais recente:

```text
/plugin marketplace add rbartoli/agent-usage-guard
/plugin install agent-usage-guard@agent-usage-guard
/reload-plugins
```

Depois execute `/agent-guard` para ver o que ele vê, e `/agent-guard simulate concurrency` para ver a pergunta que faz quando há agentes demais, sem conter ou gastar nada. Mods vêm ligados por padrão; a [visão geral](https://code.claude.com/docs/en/plugins/mods/overview#turn-mods-on-or-off) lista as configurações que os desligam.

## Por que isso existe

Certa tarde dei ao Claude Code um prompt de pesquisa com esforço máximo. Ele gerou **394 chamadas de subagente, 341 rodando ao mesmo tempo e empurrou 84M tokens de contexto pela API em dez minutos.** Sessão encerrada: *"Claude usage limit reached."* Bloqueado até a janela reiniciar.

Não foi um caso isolado. Sessenta dias dos meus próprios logs tinham **12 bloqueios** e 166 janelas de dez minutos com rajadas de agentes. O modo de falha se multiplica: *contexto grande × loops rápidos de ferramentas × agentes paralelos × retries cegos*. Cada proteção abaixo remove um fator.

E não sou só eu: [339 subagentes a partir de um único prompt](https://www.reddit.com/r/ClaudeAI/comments/1u5d02w/), [metade de um plano semanal Max consumida por spawning recursivo](https://github.com/anthropics/claude-code/issues/68619) e execuções multiagente usando [~15× os tokens de uma sessão de chat](https://www.anthropic.com/engineering/built-multi-agent-research-system).

## O que ele faz

| Área | Regra | Padrão | O que acontece |
|---|---|---|---|
| Janelas do plano | Novos agentes precisam de aprovação quando a janela está tão cheia | 80% | pergunta; a aprovação dura até a janela reiniciar |
| | Novos agentes são recusados quando a janela está tão cheia | 95% | recusa |
| | `ScheduleWakeup` e `CronCreate` são recusados quando a janela está tão cheia, para que nenhum turno comece sozinho rumo ao limite | 95% | recusa |
| | Cada sessão é avisada uma vez para terminar sua etapa e dizer o que sobrou | 95% | acrescenta uma nota ao próximo prompt |
| | Novos agentes precisam de aprovação quando a janela de 5 horas sobe tão rápido | 20 pontos / 10 min | pergunta |
| | Novos agentes precisam de aprovação quando o ritmo dos últimos 10 minutos da janela de 5 horas a encheria em uma hora, antes de reiniciar | pelo menos 2 pontos em 2 min | pergunta |
| Agentes | Agentes rodando ao mesmo tempo, em todas as sessões desta máquina | 4 | pergunta |
| | Agentes iniciados ou retomados por 10 minutos, nesta máquina | 12 | pergunta |
| | Tokens processados por subagentes por 10 minutos, nesta máquina; uma aprovação dura uma hora | 10M | pergunta |
| | Subagentes não podem iniciar seus próprios agentes | profundidade 1 | recusa |
| Contexto | O Claude é avisado uma vez para manter o turno limitado | 300k tokens | acrescenta uma nota ao prompt |
| | Um prompt que releria tanto contexto | 500k tokens | pergunta: compactar e enviar, enviar mesmo assim ou cancelar |
| | Chamadas de ferramenta por 10 minutos enquanto uma conversa ou agente carrega tanto | 20 chamadas em 400k | pergunta: continuar, compactar depois deste turno ou parar |
| | Uma sessão pesada parada tempo suficiente para o cache do prompt expirar | 150k tokens, 1 h inativo | pergunta antes de reescrever o cache |
| Loops | A mesma chamada de ferramenta falhando repetidamente, sem outra chamada no meio | 3 falhas idênticas | recusa a retry idêntico |
| | Chamadas de agente recusadas em 10 minutos | 5 | pausa a criação de agentes por 10 min |

"Agentes" cobre subagentes, colegas de equipe de agentes, agentes de workflow e subagentes concluídos retomados com `SendMessage`. Agentes Haiku ficam de fora dos limites de agentes rodando e iniciados, seja porque o Claude pediu Haiku ou porque a própria definição do agente o escolhe; eles ainda contam para o orçamento de tokens de subagentes e para toda regra de janela do plano. Cada chamada de ferramenta é julgada no contexto do loop que a faz, então um subagente pequeno nunca herda o tamanho da conversa principal.

**Quando pergunta.** A pergunta aparece na própria caixa de diálogo do Claude Code, aquela que o Claude usa para perguntar algo a você, e a chamada espera sua resposta. Agentes iniciados em paralelo enquanto ela está aberta são contidos, e o Claude os inicia de novo quando você responde. Se você permitir, aquela condição fica permitida por um tempo: uma janela do plano até reiniciar, um contexto pesado até encolher (para chamadas de ferramenta, no máximo uma hora), as contagens de agentes por 10 minutos. Se você recusar ou dispensar a pergunta, ou ela fechar sem resposta por qualquer outro motivo, o Claude é avisado para não iniciar agentes pelos próximos 10 minutos (`AGENT_GUARD_WINDOW_SECONDS`), e não é perguntado novamente nesse tempo. Palavras digitadas chegam ao Claude, então você pode responder "use agentes haiku em vez disso".

**Quando ninguém pode responder.** Em `claude -p`, no Agent SDK e no modo `dontAsk`, um portão de agente ou ferramenta recusa em vez de perguntar. Um prompt pesado é contido com o motivo, e o mesmo vale para uma retomada pesada dormente quando o teto de uma por máquina em 10 minutos é atingido. Prompts que iniciam um turno por conta própria, como um agendamento ou o disparo de `/loop`, uma mensagem retransmitida de um canal como o Slack ou um ping do Slack, são contidos da mesma forma, mesmo em uma sessão em que alguém poderia ser perguntado; eles nunca suspendem limites. O Claude lê cada recusa como o resultado da ferramenta. Recusas repetidas da mesma condição são formuladas de modo diferente a cada vez e escalam: a segunda diz que nada mudou e para tentar outra coisa, a terceira diz para encerrar o turno. Se um hook Stop como `/goal` continua reabrindo o turno, a recusa diz que o usuário precisa decidir.

**O que mostra.** Enquanto agentes rodam nesta máquina, ou a guarda está contendo ou acabou de recusar algo, uma linha acima do prompt mostra: `Usage guard · 3 of 4 agents running · 5 of 12 started in the last 10 min · last refusal 14:22: concurrency`. Fica em negrito quando um limite é atingido ou algo está contido, e desaparece quando não há nada a dizer. O `[-]` do Claude Code ao lado a recolhe. Janelas do plano e contexto ficam na linha de status.

**O que ele não toca.** Ele nunca contém a notificação de uma tarefa em segundo plano nem a mensagem de outra sessão, pois isso perderia o resultado. Ele não bloqueia mais prompts após um limite de uso: desde a v2.1.234, o Claude Code espera no limite e continua sozinho na reinicialização (`autoContinueAtUsageLimit`). O trabalho da guarda é evitar que você chegue ao limite, e seu diário conta os bloqueios que ele não impediu. Perto do limite, ele só acrescenta uma nota: a partir de 95%, o próximo prompt de cada sessão diz ao Claude para terminar a etapa em andamento, não iniciar nada grande e encerrar o turno com o que foi feito e o que sobrou, para que um bloqueio encontre todas as sessões em uma parada limpa.

**Compactação por inatividade.** Desde a v2.1.299, o Claude Code compacta uma conversa de 200k tokens ou mais que fica ociosa por cerca de 54 minutos, antes do cache do prompt de uma hora expirar (`idleCompaction`, ligado por padrão). A guarda lê o tamanho compactado, então não pergunta sobre essa sessão. Desde a v2.1.314, ela também roda no VS Code e na aba Code do Claude Desktop, para assinantes com telemetria desligada, e no Bedrock, Vertex, Foundry e gateways LLM quando o cache de prompt de uma hora está ligado. Sua pergunta dormente cobre o que a compactação por inatividade deixa de fora: conversas de 150k a 200k tokens, sessões `claude -p` e SDK, uma máquina que estava suspensa aos 54 minutos e configurações com compactação por inatividade ou compactação automática desligadas.

**O aviso de retomada próprio do Claude Code.** Desde a v2.1.304, nos planos Pro e Max, o Claude Code avisa antes de retomar uma conversa inativa, ou de enviar para uma cujo cache esfriou enquanto ociosa, quando isso usaria uma parte perceptível do seu limite de 5 horas: você retoma de qualquer forma ou começa uma conversa nova. Isso só aparece a partir de uma fração mínima, que a Anthropic define por plano e modelo, então para a maioria dos modelos aparece só em conversas muito grandes. A pergunta dormente da guarda começa em 150k tokens, então ainda cobre a maioria das retomadas com cache frio, e nas maiores você pode ver ambas.

## Comandos

```text
/agent-guard [status]                          o que a guarda vê agora
/agent-guard allow [agents|context] [minutes]  suspende seus limites para esta sessão (padrão: todos, 10 min)
/agent-guard pause [minutes]                   o mesmo que allow, para todo limite
/agent-guard resume                            encerra uma permissão antes do fim, tira a pausa dos agentes e deixa perguntas recusadas perguntarem de novo
/agent-guard report [days]                     o que ele fez nesta máquina (padrão: 7 dias)
/agent-guard simulate <rule>                   mostra o que uma regra faz, sem conter ou gastar nada
/agent-guard help                              estes comandos
```

`/agent-guard` roda imediatamente, mesmo no meio de um turno, e nunca inicia um turno do modelo, então o Claude nunca vê uma substituição e não pode tomá-la como permissão. Só você pode suspender limites: quando outro plugin executa `/agent-guard allow` ou `pause`, a guarda recusa e diz isso na transcrição. Enviar `[allow-usage-guard]` ou `[allow-agent-burst]` sozinho como prompt, os marcadores de versões anteriores, faz o mesmo que `/agent-guard allow` ou `allow agents`.

## O que ele pode e não pode ver

Conferido com o Claude Code v2.1.316:

| Caminho | Cobertura |
|---|---|
| Subagentes, colegas de equipe e agentes de workflow | Contidos antes de começar (`agent.spawn`) |
| Um subagente concluído ao qual se envia novo trabalho com `SendMessage` | Contido antes de retomar, e contado como uma criação, uma vez |
| Um colega trazido de volta do disco (Claude Code 2.1.299 ou mais recente) | Contido antes de retomar, e contado como uma criação |
| Forks de `/subtask` e qualquer coisa que comece sem `agent.spawn` | Contados quando começam, nunca contidos: o Claude Code não oferece evento antes disso. Forks que o Claude inicia pela ferramenta Agent são contidos como qualquer agente |
| Agentes internos do Claude Code (sugestões de prompt, compactação) | Não contados |
| Porcentagens da janela do plano | Da última resposta da API em uma assinatura, inclusive em `claude -p`. Sessões com chave de API não informam nenhuma, então só valem os orçamentos de token e contagem |
| Colegas rodando em seus próprios painéis de terminal | Não visíveis: seus loops rodam em outros processos |
| Sessões em outras máquinas | Não contadas: os registros entre sessões ficam no mod store desta máquina |
| Ferramentas que a própria API executa, como o advisor | Não contíveis: nenhum evento de ferramenta dispara para elas |

Mods rodam no `claude` de um terminal, na aba Code do aplicativo desktop, no `claude -p` e no Agent SDK. Não rodam em uma sessão WSL do aplicativo desktop ([onde mods rodam](https://code.claude.com/docs/en/plugins/mods/overview#where-mods-run)).

**Nos planos Team e Enterprise**, e em máquinas com configurações gerenciadas, o Claude Code executa seu plugin embutido `cc-plugin-sec-default` antes de todos os outros, a menos que `prependPlugins` gerenciado o deixe de fora. Esse plugin repassa os eventos clássicos de hook do Claude Code aos plugins do usuário, e o Claude Code mostra uma linha para cada hook da guarda que pulou, como "agent-usage-guard: its classic.PostToolUse hook was skipped". A guarda acompanha compactações, bloqueios, `/clear` e retomadas, e hooks Stop que reabrem um turno por eventos que ainda a alcançam. Duas coisas precisam dos eventos clássicos: o modo de permissão só chega à guarda quando um agente começa, então ela pode perguntar a você no modo `dontAsk`, e forks de `/subtask` ficam sem contagem.

**Os limites nativos continuam importando.** O Claude Code limita uma sessão a 20 subagentes concorrentes (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`) e três camadas de aninhamento (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). Não há limite para o total de agentes que uma sessão inicia. Desde a v2.1.316, `CLAUDE_CODE_SUBAGENT_EFFORT` define o esforço com que os subagentes rodam quando ninguém mais o especifica, em vez do da sessão: um menor torna cada agente mais barato, e a guarda ainda limita quantos rodam. Os padrões da guarda são mais rígidos e abrangem sessões; os tetos nativos continuam sendo a parede externa para os caminhos que a guarda só conta.

## Veja o que ele fez

```text
/agent-guard report 30
```

O relatório conta bloqueios por limite de uso (cada janela bloqueada uma vez), cruzamentos de limite de janela do plano, notas de desaceleração e toda pergunta e recusa por regra, com a sua resposta. Ele lê o diário de cada sessão nesta máquina e nunca o deixa. Defina `AGENT_GUARD_JOURNAL=0` para parar de registrar.

## Segurança e privacidade

Um mod roda dentro do Claude Code com suas permissões; leia [o que um mod pode alcançar](https://code.claude.com/docs/en/plugins/mods/overview#what-a-mod-can-reach) antes de instalar um. Este tem cerca de 3.000 linhas de TypeScript sem dependências, e `claude plugin validate .` lista cada API que ele chama e cada variável de ambiente que lê:

- Não faz requisições de rede nem inicia processos. O único arquivo que lê é seu próprio `plugin.json`, para a versão que `/agent-guard status` mostra.
- Decide apenas o que as regras acima descrevem: se um agente começa, um prompt é enviado ou uma ferramenta roda. Pergunta a você sempre que você pode responder, e dá o motivo quando recusa. Lê os modos de permissão, mas nunca os altera, e não escreve configurações.
- O único prompt que ele envia é o seu. Depois de "Compactar e enviar", ele pega o prompt que você digitou na caixa e o envia sem alterações quando a compactação termina, ou o devolve se a compactação falhar. Um prompt com imagem ou menção @ permanece na caixa para você enviar, pois reenviá-lo as perderia.
- Seu hook de prompt repassa seu prompt sem alterações, acrescenta uma nota única ao Claude quando o contexto passa de 300k ou uma janela do plano chega a 95%, ou contém o prompt para perguntar primeiro (quando ninguém pode responder, diz o motivo em vez disso). Seu hook `SessionStart` não muda nada.
- Mantém seu estado no mod store, um arquivo JSON em `~/.claude/plugins/store/`. Cada sessão grava suas próprias contagens (agentes rodando, inícios e retomadas dormentes recentes, tokens de subagente por minuto, sua última leitura de 5 horas), quando foi ativa pela última vez (guardado por 30 dias, para que uma sessão retomada saiba quanto tempo ficou ociosa) e suas linhas de diário (hora, prefixo de um id de sessão, regra, nome da ferramenta, faixa de contexto como `400-500k`, janela do plano e porcentagem, número da recusa e sua resposta). Cada registro é armazenado sob o id completo da sessão, que também é o nome do arquivo de transcrição daquela sessão. Se o store parar de salvar, por exemplo por estar cheio, a linha de status avisa: outras sessões então param de contar esta.
- Nunca armazena texto de prompt, entradas de ferramentas, texto de erro ou saída do modelo. Quando um turno termina com erro de API, ele lê a última mensagem da conversa, o erro que o Claude Code mostrou, para distinguir um bloqueio por limite de uso de outras falhas. Uma chamada de ferramenta é reduzida a uma impressão digital de 13 caracteres. Nomes de agentes ficam na memória e nunca são gravados.
- Dias de diário com mais de 90 dias são excluídos (`AGENT_GUARD_JOURNAL_DAYS`).
- `demo/`, que gera o GIF acima, não faz parte do que roda. Ele inicia o Claude Code em um diretório home temporário com uma chave de API inventada para uma API local roteirizada, e não lê nenhuma credencial sua.

Defina `AGENT_GUARD=0` para desligá-lo sem desinstalar.

## Configuração

Defina estas como variáveis de ambiente, ou sob `env` em `~/.claude/settings.json`. Os tempos são em segundos; um valor que não for um número no intervalo mantém o padrão, e `/agent-guard` avisa.

| Variável | Significado (padrão) |
|---|---|
| `AGENT_GUARD` | `0`, `false`, `off` ou `no` desligam a guarda (`1`) |
| `AGENT_GUARD_JOURNAL` | `0` interrompe o diário (`1`) |
| `AGENT_GUARD_HAIKU_EXEMPT` | `0` conta agentes Haiku nos limites de agentes rodando e iniciados como qualquer outro (`1`: ficam de fora) |
| `AGENT_GUARD_JOURNAL_DAYS` | Dias de diário mantidos (`90`) |
| `AGENT_GUARD_WINDOW_SECONDS` | Janela rolante para orçamentos, consumo e recusas (`600`) |
| `AGENT_GUARD_AGENT_MAX` | Agentes rodando ao mesmo tempo nesta máquina (`4`) |
| `AGENT_GUARD_ROLLING_MAX` | Inícios e retomadas de agentes por janela nesta máquina (`12`) |
| `AGENT_GUARD_AGENT_TOKENS_MAX` | Tokens de subagente por janela nesta máquina (`10000000`) |
| `AGENT_GUARD_DEPTH_MAX` | Camadas de agentes abaixo da conversa principal (`1`) |
| `AGENT_GUARD_LIMIT_ASK_PERCENT` | Porcentagem da janela do plano a partir da qual novos agentes perguntam (`80`) |
| `AGENT_GUARD_LIMIT_DENY_PERCENT` | Porcentagem da janela do plano a partir da qual novos agentes, despertares e tarefas agendadas são recusados e cada sessão é avisada a desacelerar (`95`) |
| `AGENT_GUARD_BURN_PERCENT` | Pontos da janela de 5 horas por janela que fazem novos agentes perguntarem (`20`) |
| `AGENT_GUARD_CONTEXT_WARN` | Contexto em que o Claude é avisado uma vez a manter o turno limitado (`300000`) |
| `AGENT_GUARD_CONTEXT_HARD` | Contexto em que um prompt pergunta antes de ser enviado (`500000`) |
| `AGENT_GUARD_TOOL_CONTEXT` | Contexto acima do qual chamadas de ferramenta contam para o orçamento de ferramentas (`400000`) |
| `AGENT_GUARD_TOOL_MAX` | Chamadas de ferramenta por janela acima daquele contexto (`20`) |
| `AGENT_GUARD_DORMANT_SECONDS` | Tempo ocioso após o qual o cache de uma sessão pesada conta como expirado (`3600`) |
| `AGENT_GUARD_DORMANT_CONTEXT` | Contexto em que uma sessão ociosa conta como pesada (`150000`) |
| `AGENT_GUARD_DORMANT_MAX` | Retomadas pesadas dormentes por janela nesta máquina quando não se pode perguntar a ninguém (`1`) |
| `AGENT_GUARD_TOOL_FAILURE_MAX` | Falhas idênticas antes que a retry idêntica seja recusada (`3`) |
| `AGENT_GUARD_FUSE_MAX` | Chamadas de agente recusadas por período de fusível que pausam criações (`5`) |
| `AGENT_GUARD_FUSE_SECONDS` | O período do fusível e quanto tempo a pausa dura (`600`) |
| `AGENT_GUARD_PEER_TTL_SECONDS` | Por quanto tempo as contagens de outra sessão, ou um agente sem sinal de atividade, continuam contando (`900`) |

O padrão dormente pressupõe o cache de prompt de uma hora que assinaturas recebem dentro do uso do plano. Com chave de API ou uso extra, o cache dura cinco minutos, então defina `AGENT_GUARD_DORMANT_SECONDS=300`.

## Além do Claude Code

As regras ficam em um núcleo independente de harness (`core/`) que não faz E/S. O mod do Claude Code é seu primeiro adaptador. [docs/architecture.md](docs/architecture.md) descreve o contrato que um adaptador mantém e o que outro harness de agente precisa oferecer para aplicar cada regra.

## Testes

```sh
claude plugin validate . --strict
claude plugin test
```

`claude plugin test` roda a suíte no próprio kit de testes do Claude Code: testes unitários do núcleo e testes que disparam eventos reais do Claude Code pelos hooks, sem sessão, modelo ou rede. [TESTING.md](TESTING.md) cobre as camadas e o que cada teste prova.

## Licença

MIT
