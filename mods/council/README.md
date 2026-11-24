![claude-council](assets/banner.svg)

Um plugin do Claude Code que faz a mesma pergunta a agentes de codificação com IA em paralelo. Compare as respostas quando o viés de um modelo puder enganar você: decisões de arquitetura, becos sem saída na depuração, revisões de segurança ou escolha de frameworks.

![Codex, Antigravity, Gemini e OpenAI respondem à pergunta SQLite ou Postgres enquanto o falso Kimi falha](assets/council-run.svg)

[![Tests](https://github.com/hex/claude-council/actions/workflows/tests.yml/badge.svg)](https://github.com/hex/claude-council/actions/workflows/tests.yml)

## Onde roda

| Onde | O que você recebe |
| --- | --- |
| Claude Code em um terminal | `/claude-council:ask`, todos os assentos e o painel ao lado do chat. |
| Claude Desktop, aba Code | O mesmo plugin e os mesmos comandos. O painel abre no painel lateral do Desktop. |
| Claude Desktop, chat comum | A [extensão Desktop](#claude-desktop): cinco ferramentas, um seletor de assentos e um painel de respostas no chat. macOS e Linux. |

![Aba Code do Claude Desktop: à esquerda, a síntese do Claude sobre uma pergunta de chave primária; à direita, o painel Council com a resposta de cada assento](assets/desktop-code-tab.png)

Nos dois casos, o Claude também pode chamar o council como ferramenta. Ele pergunta quais assentos e quão detalhada deve ser a resposta primeiro, depois mostra um cartão de Envio, e nada sai da sua máquina até você confirmar.

O chat claude.ai e o Cowork rodam em um sandbox que pode bloquear chamadas a outros provedores, então o council não funciona lá.

## Instalação

Você precisa de `curl` e `jq` no macOS, Linux ou Windows via Git Bash.

```text
/plugin marketplace add hex/claude-marketplace
/plugin install claude-council
```

Informe pelo menos um provedor no shell de onde você inicia o Claude Code:

```bash
export OPENAI_API_KEY="..."
# Ou GEMINI_API_KEY, XAI_API_KEY, PERPLEXITY_API_KEY,
# KIMI_API_KEY, OPENROUTER_API_KEY
```

Ou guarde as chaves na configuração do plugin. Execute `/plugin configure claude-council`, preencha as linhas de chave de API e escolha Salvar configuração. O Claude Code as mantém em seu armazenamento seguro, não em um arquivo de configurações. O mod do council define cada chave guardada como sua variável durante toda a sessão, então todo comando que o Claude Code inicia, em todo projeto, recebe a chave guardada no lugar de uma que seu shell exportou. A linha de modelos do OpenRouter aceita os ids que `OPENROUTER_MODELS` aceita, então os assentos do router também não precisam de export. Chaves guardadas exigem Claude Code 2.1.287 ou mais recente. A aba de configurações de plugin do aplicativo desktop também as aceita, para sessões naquele computador. Elas nunca chegam ao chat claude.ai nem ao Cowork. [Chaves de API](docs/REFERENCE.md#api-keys) cobre onde ficam guardadas, quando o mod não carrega e como se comporta uma chave limpa.

As CLIs `codex`, `agy` (Antigravity), `grok`, `kimi` e `cursor-agent` usam suas assinaturas existentes sem chave de API. O próprio Claude Code, a CLI do Copilot e o OpenCode também podem participar, quando nomeados em `--providers`. Um modelo local `ollama` não precisa de chave nem de rede externa. Sem nenhum desses, `--local` usa subagentes do Claude. Veja [seleção de provedores](docs/REFERENCE.md#choosing-providers) e [councils locais](docs/USAGE.md#local-council---local).

## Primeira execução em 60 segundos

Leia [o que é enviado e salvo](docs/REFERENCE.md#what-gets-sent-and-saved) antes de perguntar sobre seu código.

```text
/claude-council:status
/claude-council:ask "Should I use UUID or BIGINT primary keys for a SaaS users table?"
```

Cada provedor responde de forma independente. O Claude escreve uma síntese dos pontos de concordância, divergência e sua recomendação. Concordância não é verificação: os modelos compartilham sua descrição e suas suposições. [A síntese aponta a premissa que mudaria a resposta](docs/REFERENCE.md#reading-the-synthesis).

## Claude Desktop

O plugin precisa do Claude Code. Para um chat comum do Claude Desktop, há uma extensão Desktop, `council-<version>.mcpb`, que dá ao Claude cinco ferramentas: `council_ask`, `council_pick`, `council_result`, `council_status` e `council_settings`. Ela roda só no macOS e no Linux, porque inicia os scripts bash do council.

1. Baixe `council-<version>.mcpb` na [última versão](https://github.com/hex/claude-council/releases/latest). Para construí-la você mesmo, rode `bash extension/build.sh` em um checkout limpo. Precisa de `npm` e grava `dist/council-<version>.mcpb`.
2. Dê dois cliques no arquivo. O Desktop avisa que a extensão recebe acesso a tudo no seu computador e não é verificada pela Anthropic. Ambas as coisas valem para qualquer extensão instalada a partir de um arquivo: seu servidor roda como você, com seus arquivos e rede, e a Anthropic não a revisou. Instale só um pacote que você construiu ou em que confia.
3. Em Configurações, Extensões, Claude Council, Configurar, cole uma chave para cada provedor que quiser: Gemini, OpenAI, xAI, Perplexity, Kimi, OpenRouter. Um campo vazio deixa a API daquele provedor de fora. O Desktop guarda as chaves. Para uma pergunta, cada chave vai só para os assentos de seu próprio fornecedor: a API do fornecedor e seu agente CLI, quando instalado (`codex` recebe a chave OpenAI, `agy` a Gemini, `grok` a xAI, `kimi` a Kimi). Uma verificação de status é diferente: inicia cada agente CLI instalado, mas `claude` e `opencode` com todas as chaves definidas.
4. Em um chat, peça ao Claude para abrir as configurações do council. Um painel no chat lista os modelos de cada provedor com chave, buscados ao vivo daquele provedor. Escolha um por provedor, ou ligue até 12 modelos do OpenRouter, um assento cada. Toda alteração salva na hora e vale para a próxima pergunta.
5. Peça ao Claude para subir uma pergunta ao council. O Desktop pede sua aprovação da chamada de ferramenta, e essa aprovação é a única verificação antes de a pergunta sair da sua máquina. Um painel abaixo da chamada mostra a resposta de cada assento, ou seu erro, em um card próprio encabeçado pelo nome do assento e pelo logo de seu fornecedor, e o Claude escreve a síntese abaixo. O Desktop espera a execução inteira, de segundos a alguns minutos.

### Perguntar de uma vez

Nomeie os assentos ou um nível de detalhe (padrão, breve ou detalhado) na sua mensagem, ou diga para perguntar a todos, e o Claude executa a pergunta de uma vez, em todos os assentos padrão com detalhe padrão, a menos que você tenha nomeado outros. O Claude repassa sua pergunta como você a fez, acrescentando contexto apenas quando ela depende de mensagens anteriores que o council não vê.

### O seletor

Caso contrário, como em "pergunte ao council: qual fila devemos usar?", o Claude abre `council_pick`, um painel com a pergunta, um interruptor por assento e os três níveis de detalhe. O Claude então espera, no mesmo turno, em `council_result` pela execução do seletor.

1. Pressione Perguntar. As respostas aparecem naquele painel, e a linha abaixo diz "O Claude está escrevendo a síntese".
2. O Claude escreve a síntese sem nenhuma mensagem sua. Quando todos os assentos falham, o Claude diz o que falhou.

Quando nenhum assento responde, o painel diz isso e Perguntar volta a funcionar.

### Trocar de modelo no seletor

Em um assento de API ou do OpenRouter, o modelo em cinza é um botão: clique para escolher outro modelo da lista ao vivo daquele provedor (a do OpenRouter tem um filtro). A escolha salva na hora, como a do painel de configurações, e vale para esta pergunta e as seguintes. Um assento do OpenRouter muda só seu próprio modelo; acrescentar ou remover assentos do OpenRouter continua no painel de configurações.

### Quando o Claude não está mais esperando

O Claude espera no máximo 11,5 minutos desde que o seletor abriu. Se ele tiver parado de esperar quando as respostas chegarem, ou você pressionar Perguntar uma segunda vez no mesmo painel:

- O Desktop coloca "Sintetize as respostas do council (execução 3f9a2c)." na caixa de mensagem, sob um aviso sobre conteúdo malicioso, e a linha sob as respostas diz para pressionar Enter. O painel não pode enviar essa mensagem sozinho.
- O Claude então busca as respostas daquela execução com `council_result` e escreve a síntese.
- Se o Desktop recusar a mensagem, a linha dá em vez disso as palavras para enviar você mesmo (`Peça ao Claude: "sintetize a execução 3f9a2c do council"`).
- A extensão mantém as últimas 5 execuções em que algum assento respondeu; depois disso, pergunte ao council de novo.

Uma pergunta sem provedores nomeados vai para todo provedor com chave e para todo agente CLI que os scripts encontrarem (`codex`, `agy`, `grok`, `kimi`, `cursor-agent`, `ollama`) no seu PATH, `~/.local/bin`, `~/bin`, `/opt/homebrew/bin` ou `/usr/local/bin`. `claude`, `copilot` e `opencode` a recebem só quando a pergunta os nomeia. Um agente CLI responde com seu próprio login, então recebe a pergunta mesmo que o campo de chave de seu fornecedor esteja vazio; além da chave de seu próprio fornecedor, não recebe nenhuma chave do formulário. A [referência](docs/REFERENCE.md#claude-desktop-extension) lista os arquivos que ele mantém e seus limites.

## Recursos

| Capacidade | Guia |
|---|---|
| Perguntar a provedores juntos, ou nomear um em linguagem comum | [Exemplos de comando](docs/REFERENCE.md#command-examples) |
| Escolher provedores e fixar uma lista permanente | [Seleção de provedores](docs/REFERENCE.md#choosing-providers) |
| Atribuir papéis especialistas | [Papéis](docs/USAGE.md#specialized-roles) |
| Fazer provedores desafiarem as respostas uns dos outros | [Debate](docs/USAGE.md#debate-mode) |
| Reunir contexto de código com agentes antes de perguntar | [Modo agente](docs/USAGE.md#agent-enhanced-analysis---agents) |
| Usar subagentes do Claude sem provedor externo | [Council local](docs/USAGE.md#local-council---local) |
| Incluir arquivos relevantes ou escolher os seus | [Contexto automático](docs/USAGE.md#auto-context-injection) |
| Anexar uma captura de tela | [Entrada de imagem](docs/USAGE.md#image-input) |
| Perguntar sobre a conversa atual | [`/advise`](docs/USAGE.md#asking-about-the-conversation-itself) |
| Rodar em segundo plano e buscar o resultado | [Tarefas em segundo plano](docs/USAGE.md#background-jobs---async) |
| Exportar as respostas para um arquivo | [Exportação](docs/USAGE.md#export-to-file) |
| Mostrar só a síntese | [Modo silencioso](docs/USAGE.md#quiet-mode) |
| Ver as respostas chegando e repetir assentos que falharam | [O painel](#o-painel) |
| Receber uma nota de um assento enquanto o Claude trabalha | [Verificação lateral avisada](#verificação-lateral-avisada) |
| Fazer um segundo modelo revisar o diff antes de o Claude parar | [Revisão na porta de parada](docs/USAGE.md#stop-gate-review-opt-in-off-by-default) |
| Perguntar ao council em um chat do Claude Desktop | [Claude Desktop](#claude-desktop) |
| Chamar os scripts sem o Claude Code | [Uso direto de script](docs/REFERENCE.md#direct-script-usage) |

A [referência](docs/REFERENCE.md) lista toda flag, variável, padrão de modelo e limite. [Arquitetura](docs/ARCHITECTURE.md) cobre a implementação. [TESTING.md](TESTING.md) cobre testes, releases e como acrescentar um provedor.

## Verificação lateral avisada

![A dica de introdução, uma nota avisada, Saiba mais e um rascunho "Diga ao Claude" não enviado](assets/heads-up.svg)

Ative pela linha "Verificação lateral avisada" em `/config` ou pelo `.claude/council-heads-up.json` do projeto. Um assento, codex por padrão, verifica os turnos e resultados de ferramentas recentes enquanto o Claude trabalha. Para um Write ou um Edit, ele recebe o texto que o Claude escreveu. A nota mostra o que foi para onde. Saiba mais a expande; Diga ao Claude coloca um rascunho na caixa de prompt sem enviá-lo. Leia os [limites de dados e o interruptor](docs/REFERENCE.md#what-gets-sent-and-saved) e o [guia de verificação avisada](docs/USAGE.md#heads-up-side-check-opt-in-off-by-default).

## O painel

No Claude Code 2.1.287 ou mais recente, o painel abre dentro do Claude Code, como na animação acima. Cada assento tem uma linha com seu modelo, uma barra de estado, seu tempo e um botão para a ação atual: cancelar, repetir, abrir ou recolher. Quando a execução termina, a síntese abre no topo com as respostas recolhidas abaixo. Reabra a última execução com `/council-pane`. Dentro do tmux, o mod pergunta uma vez qual painel você quer.

O [guia do mod](mods/council-pane/README.md) lista teclas, configurações, limites e quando o mod não carrega. Ele também permite que o Claude chame o council como ferramenta; toda chamada pergunta a você primeiro.

### O que o mod executa, lê e envia

O mod não faz chamadas de rede por conta própria. Ele inicia os programas abaixo a partir de uma lista de argumentos, nunca de uma string de shell, e nunca entrega um script a `bash -c`. Seu texto chega aos provedores de modelo apenas pelos dois primeiros:

- `bash scripts/run-council.sh` quando o Claude chama a ferramenta council e você escolhe `Enviar ao council`. Isso envia sua pergunta aos provedores que você configurou.
- `bash scripts/heads-up.sh`, só com a verificação lateral avisada ligada. Lê a transcrição desta sessão (por padrão os últimos 5 turnos e até 8 resultados de ferramentas de 2.000 caracteres cada) e envia esse resumo a um assento, `codex` a menos que você escolha outro. O diretório da execução guarda `digest.md` e `prompt.md`, exatamente o que saiu da máquina, até que o mod leia o resultado e os remova. O assento codex roda nesse diretório com um home codex próprio: seu modelo e esforço, um link para seu `auth.json` para que uma renovação de token chegue ao seu login (sem ele, seu `CODEX_API_KEY` ou `OPENAI_API_KEY` autentica o codex), e nenhum de seus plugins, hooks, `AGENTS.md`, skills ou servidores MCP.
- `bash scripts/query-council.sh --list-default-models` quando o Claude chama a ferramenta council, para listar os assentos que ele pode oferecer e verificar os que ele nomeia. Lê sua configuração e não envia nada.
- `bash scripts/seat-info.sh discover`, `model <assento>` ou `allowlisted <assento>` durante `/heads-up setup` e `/heads-up on <assento>`. Verifica quais assentos esta máquina pode rodar e não envia nada.
- `codex debug models` durante `/heads-up setup` com o assento codex, para listar seus modelos. Esse comando pertence ao codex, e assim como qualquer requisição que ele faça.
- `kill -0 <pid>` para verificar se uma execução do council ainda está viva. Não envia sinal.
- `rm -rf` e `mv -f` em seus próprios diretórios de execução sob `$TMPDIR/council-mod.<id da sessão>`, para limpar uma execução concluída e responder à oferta de repetição.

Ele grava arquivos nesse diretório `$TMPDIR`, incluindo `model.json` e `avoid.txt`, que `heads-up.sh` lê. Fora dele, grava um arquivo, `.claude/council-heads-up.json` no projeto, e somente a partir de `/heads-up setup`, `/heads-up on`, `/heads-up off` ou do `Desligar` de uma nota. Esse arquivo é o interruptor da verificação avisada. O próprio Claude Code não o lê.

Ele define variáveis de ambiente no processo do próprio Claude Code. Com uma chave de API ou a lista de modelos do OpenRouter guardada na configuração do plugin, ele define aquela variável, como `OPENAI_API_KEY` ou `OPENROUTER_MODELS`, quando a sessão começa. Todo comando que o Claude Code inicia depois disso recebe o valor guardado no lugar do que seu shell exporta, como um export faria. Antes de uma execução do council, ele define `COUNCIL_MOD_PANE_DIR`.

Ele toca no prompt em dois lugares. Com `wake_on_async_done` ligado, ele envia `A tarefa do council em segundo plano <id> terminou. Busque com /claude-council:result <id> e faça um resumo.` uma vez que uma tarefa em segundo plano termina. O `Diga ao Claude` de uma nota coloca um rascunho na caixa de prompt, e você decide se o envia.

Ele lê o texto de cada comando Bash que o Claude roda, apenas para detectar uma chamada a `run-council.sh`. Logo antes dessa chamada, ele define `COUNCIL_MOD_PANE_DIR` para que a execução desenhe neste painel, e o limpa quando o tmux é dono do painel. Lê `TMPDIR` e `TMUX`. Liga a configuração `claude-council.heads_up` somente quando você escolhe "todos os projetos" em `/heads-up setup`.

![Respostas reais de SQLite ou Postgres chegam no tmux ao lado da falha do falso Kimi e da oferta de repetição](assets/tmux-pane.svg)

Sem o mod, o tmux abre um painel lateral que transmite as respostas e o status de cada provedor. Oferece repetir assentos que falharam. Esc fecha. `--no-pane` ou `COUNCIL_NO_PANE=1` desligam isso. Fora dos dois modos de painel, as respostas chegam no chat. Veja [integração com terminal](docs/REFERENCE.md#display--terminal-integration).

As animações do council e do tmux mostram respostas reais à pergunta "Um aplicativo de demonstração de nó único deve usar SQLite ou Postgres?" Codex e Antigravity usam assinaturas; Gemini e OpenAI usam suas APIs. Kimi é um fixture de limite de taxa. A animação da verificação avisada usa um assento falso e um host real do Claude Code. [Scripts de captura e quadros brutos](assets/capture/README.md) registram como reproduzi-las.

## O que um assento CLI carrega

Todo assento CLI roda a partir de um diretório vazio, `$TMPDIR/claude-council-<uid>/seat`, em que `<uid>` é seu id numérico de usuário. O `CLAUDE.md`, `AGENTS.md`, regras, skills, hooks e servidores MCP do projeto de onde você pergunta não chegam lá. O diretório não limita o que um assento pode ler: o codex, por exemplo, ainda pode abrir qualquer arquivo pelo caminho completo.

O diretório é somente leitura. Isso impede que um assento grave um arquivo ali, mas não impede um assento que muda o modo antes. Um assento também se recusa a começar se encontrar qualquer coisa ali, e nomeia o caminho para você olhar antes de remover. Um arquivo que chega enquanto outros assentos rodam pode alcançá-los; o próximo assento a iniciar se recusa. Um assento também se recusa a começar quando `TMPDIR` fica dentro de um repositório git, e o nomeia: uma CLI tomaria o repositório inteiro como projeto do assento.

Os assentos abaixo também rodam com um home próprio, em `$TMPDIR/claude-council-<uid>/seat-home`. Ele só tem links para o que a CLI precisa para entrar e começar. Só você pode abrir qualquer um dos diretórios, e um assento se recusa a iniciar quando um deles pertence a outro usuário ou é um link simbólico.

| Assento | Não carrega mais | Ainda carrega |
|---|---|---|
| `cursor-cli` | Skills e plugins de `~/.cursor`, `~/.claude`, `~/.codex`, `~/.grok` e `~/.agents`, hooks do Cursor e do Claude, `~/.cursor/mcp.json` | Comandos de equipe do seu painel Cursor (lidos do bundle da CLI, não vistos em uma execução) |
| `grok-cli` | Plugins do Claude, skills de `~/.agents`, a memória do grok entre sessões | Sua config `~/.grok` e os hooks em `~/.grok/hooks`, pois nenhuma config do grok os desliga. O home do assento tem links para sua chave de login (macOS) e `~/.docker/run`, para o socket do Docker Desktop |
| `antigravity` | No macOS: suas regras, skills, servidores MCP e conversas salvas em `~/.gemini` | No Linux: tudo sob `~/.gemini`, porque não é confirmado onde o agy guarda seu login lá |
| `opencode` | As skills, agentes e `CLAUDE.md` de `~/.claude` e `~/.agents` | Seu login e histórico de sessão em `~/.local/share/opencode` |
| `codex` | Seus plugins, hooks, skills, memórias e servidores MCP. Cada pergunta recebe seu próprio home codex com seu modelo, seu esforço e um link para `auth.json` | Nada. Sem `auth.json` e com `cli_auth_credentials_store` definido como `keyring` ou `auto`, seu login fica no keyring do sistema, que o codex não consegue ler de outro home, então o assento roda sob seu próprio home codex e a resposta começa com uma nota. Um `OPENAI_API_KEY` exportado não muda isso; um `CODEX_API_KEY` exportado ainda autentica o codex à frente de qualquer login, como quando você roda o codex você mesmo. Defina `cli_auth_credentials_store = "file"` e rode `codex login` de novo para isolá-lo. Sem login algum, o assento para e diz isso |
| `claude-cli` | O status do git e as instruções de commit que um repositório acrescenta | Política de administrador e instruções da sua organização |
| `kimi-cli`, `copilot-cli` | Os arquivos do projeto | Seu home: hooks do kimi em `~/.kimi-code/config.toml`, skills do copilot em `~/.copilot` e `~/.agents` |

Cursor e Antigravity mantêm o modelo escolhido em suas próprias configurações: o assento o lê do seu home real e o repassa. No Windows, os assentos mantêm seu home, porque as CLIs nativas o encontram por `USERPROFILE`. [Isolamento de assentos](docs/ARCHITECTURE.md) tem os detalhes de cada um.

## Solução de problemas

| Problema | Correção |
|---|---|
| Clonou o repositório e nada carrega | Não clone em `~/.claude/plugins/`. `pluginDirectories` não é uma configuração. Siga [rodando a partir de um clone local](docs/REFERENCE.md#running-from-a-local-clone). |
| Nenhum provedor encontrado | Execute `/claude-council:status`. Exporte chaves no shell que inicia o Claude Code, guarde-as com `/plugin configure claude-council`, ou use `--local`. |
| Uma chave guardada não é usada | Depois de salvar uma com `claude plugin configure` em um shell, reinicie o Claude Code. Chaves guardadas exigem o mod do council, que carrega no Claude Code 2.1.287 ou mais recente e não sob `--safe-mode` ou `disableAllHooks`. Sem ele, exporte a chave no seu shell. |
| Outro modelo respondeu | Um cabeçalho como `grok-4.7 (grok-latest unavailable)` registra um [fallback de modelo](docs/REFERENCE.md#model-fallback). Definir a variável `_MODEL` daquele provedor desativa o fallback. |
| Sem painel | Use tmux, ou atualize para o Claude Code 2.1.287 ou mais recente para ter o painel dentro do Claude Code. O [guia do mod](mods/council-pane/README.md) lista o que impede seu carregamento. |
| Atualizando | Execute `/plugin update claude-council` e reinicie o Claude Code. |
