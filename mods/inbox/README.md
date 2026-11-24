# Inbox

Tenho TDAH. Trabalhar com um agente no formato de thread de chat exige muito esforço cognitivo. A quantidade de coisas que você precisa manter na cabeça se acumula quanto mais a sessão dura. As perguntas, bugs, ideias e tarefas começam a se amontoar e se misturar, dificultando manter tudo sob controle.

O Inbox traz alívio imediato ao dar ao seu agente um lugar organizado e estável para apresentar tudo que precisa de decisão. O Inbox também garante que seu agente sempre ofereça um conjunto proativo e antecipado de ações rápidas em cada item, incluindo uma ação recomendada.

Melhor ainda: o Inbox dá ao seu agente um lugar para apresentar questões e oportunidades latentes, que ele talvez ignorasse para se concentrar exclusivamente na tarefa em mãos.

O Inbox está disponível para o Claude Code no terminal e no aplicativo desktop, para o Codex no aplicativo desktop do ChatGPT e para o omp no terminal. No aplicativo Herdr, ele também pode abrir em um painel ao lado do terminal. Cada variante foi feita especificamente para cada plataforma, mas funciona da mesma forma fundamental em todas.

## Como funciona
https://github.com/user-attachments/assets/a493119c-4d8b-46e0-a18a-bd0ecf041b6b


## Instalação

Se você é como eu, basta colar um link para este repositório do GitHub no seu agente e pedir para instalá-lo.

Se prefere fazer do jeito tradicional, continue...

### Claude Code

Em uma sessão do Claude Code no terminal, digite:

```
/plugin install inbox --marketplace petekp/inbox
```

Responda `y` para adicionar o marketplace e escolha um escopo. Ele começa a funcionar naquela sessão. Uma instalação no escopo de usuário também cobre as sessões Code no aplicativo desktop do Claude nesta máquina.

Para instalar pelo aplicativo desktop do Claude, abra uma sessão Code:

1. Clique em **+** ao lado do prompt, depois em **Plugins** e em **Gerenciar plugins**.
2. Na página de Plugins, clique em **Adicionar** no canto superior direito, depois em **Adicionar marketplace** e em **Adicionar de um repositório**.
3. Digite `petekp/inbox`, escolha **inbox / petekp** na lista e clique em **Sincronizar**.
4. No Inbox, clique em **Adicionar a este computador**.
5. Volte à sua sessão e digite `/inbox` para abrir o painel.

Isso o instala para sua conta de usuário, então também funciona no terminal. `/plugin` não roda no aplicativo desktop, e o inbox não alcança as sessões em nuvem do app.

Se sua organização gerencia o Claude Code, um inbox que você mesmo instala funciona com duas diferenças. Após `/clear` ou uma retomada, ele carrega a lista daquela conversa na sua primeira mensagem. Um prompt de permissão chega ao inbox cerca de um segundo e meio depois de aparecer. Para ter tudo, peça a um administrador para listar o inbox nas configurações gerenciadas da organização.

Para atualizar, execute estes comandos e depois `/reload-plugins` em qualquer sessão já aberta:

```sh
claude plugin marketplace update inbox
claude plugin update inbox
```

- Ele faz duas chamadas ao Sonnet após cada resposta do Claude, uma para as linhas e outra para a aba Status. Veja [Custo](#custo).
- Foi construído e testado com Claude Code 2.1.300.

### Codex

```sh
codex plugin marketplace add petekp/inbox
codex plugin add inbox@inbox
```

Se seu shell disser `command not found: codex`, use a cópia dentro do aplicativo ChatGPT no lugar de `codex` nos dois comandos:

```sh
/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex
```

Depois, no aplicativo desktop do ChatGPT, confie nos hooks do plugin: clique no ícone de gancho ao lado da configuração de aprovação do prompt e em Permitir todos. Se o ícone não estiver lá, abra Configurações, depois Hooks, depois Inbox e Confie em todos. O Codex só executa os hooks de um plugin depois que você os confia. No Codex 0.164.0 e posteriores, uma atualização interrompe os hooks, então confie neles de novo após cada atualização. Para abrir o inbox, abra o painel lateral e escolha o menu ⋯ ao lado de Novo e depois Inbox. Isso foi verificado em 2026-11-14 no aplicativo ChatGPT com o Codex 0.169.

[codex/README.md](codex/README.md) cobre atualizações e como rodar o comando `codex` de dentro do aplicativo.

### omp

```sh
omp plugin marketplace add petekp/inbox
omp plugin install inbox@inbox-omp
```

O inbox começa a funcionar na próxima sessão do omp. `omp plugin list` o mostra como `inbox@inbox-omp`. Ele lê `.omp-plugin/marketplace.json`, que o omp procura antes da pasta `.claude-plugin/` que o Claude Code lê.

Para atualizar, execute estes comandos e reinicie o omp:

```sh
omp plugin marketplace update inbox-omp
omp plugin upgrade inbox@inbox-omp
```

Após cada resposta, o inbox faz duas chamadas ao modelo, uma para atualizar as linhas e outra para escrever a aba Status. Ele usa a primeira destas que seu omp consegue executar:

1. O modelo indicado pela sua função `@inbox`.
2. O Sonnet mais recente dos seus provedores, com `anthropic` primeiro.
3. Sua função `@smol`.

Para definir `@inbox`, adicione-o sob `modelRoles` no `config.yml` do omp e reinicie o omp:

```yaml
modelRoles:
  inbox: anthropic/claude-sonnet-5-5
```

Só o Sonnet foi testado. Outro modelo pode funcionar, mas ninguém verificou quão bem.

Seu provedor cobra cada chamada pela taxa daquele modelo.

Se `@inbox` não está definido, ou nomeia um modelo que o omp não consegue usar, como um modelo desconhecido ou um em que você não entrou, o inbox usa a próxima opção. O rodapé do painel mostra o modelo usado. Um modelo que o omp consegue usar mas falha ao ser chamado não cai para o próximo: aquela atualização falha, e a próxima resposta a tenta de novo. Sem um modelo utilizável, o rodapé diz "no inbox model: set @inbox" e o inbox não consegue atualizar.

### Para todos

A aba PRs precisa da GitHub CLI, `gh`, autenticada.

## Usando

Digite `/inbox` no Claude Code ou no omp, ou abra a aba Inbox no aplicativo ChatGPT. O inbox tem quatro abas: Status, Asks, Finds e PRs.

O inbox começa vazio. Dê uma tarefa ao seu agente, e as primeiras linhas vêm após a resposta dele: uma pergunta que ele fez a você, com as respostas como botões, e o Status do trabalho. No Claude Code, a linha acima do prompt aparece assim que o inbox tem algo.

Para ver tudo com itens de exemplo, execute `/inbox demo` no Claude Code ou no omp. Os cliques neles mudam só os exemplos. No Claude Code, pressione Ocultar demonstração ou execute o comando de novo para voltar. `/inbox demo recording` deixa de fora os avisos que marcam os exemplos, para vídeo. No omp, eles duram até o painel fechar.

### Status

Onde está o trabalho da sessão, para alguém que volta a ela sem contexto. A página nomeia o foco atual da sessão e depois cada parte do trabalho com seu andamento. Uma parte parada há um dia diz há quanto tempo. Subagentes e outros trabalhos rodando sob uma parte aparecem abaixo dela. Uma parte que espera uma pergunta ou tarefa sua diz isso, e Ver a abre. Uma linha marca onde você viu por último, então o que mudou desde então fica acima dela. O trabalho concluído dobra em uma contagem que você pode abrir.

Você pode definir uma meta com uma linha de chegada, como "2.5 na loja". A página então agrupa o trabalho sob os marcos da meta, e o inbox mantém a meta e seus marcos atualizados. Você pode editar ou remover a meta quando quiser. Uma que você digitou permanece até ser atingida. Uma que o inbox inferiu avança quando o trabalho avança.

A página é um guia do trabalho, não um log. A segunda chamada ao modelo após cada resposta a escreve. Quando essa chamada falha, a página diz isso.

### Asks

Perguntas que o agente fez a você e tarefas que só você pode fazer.

O agente não precisa fazer nada de especial para colocar uma pergunta aqui. Após cada resposta, um modelo lê o que o agente escreveu e registra cada pergunta nela, com suas respostas possíveis. A resposta recomendada pelo agente vem primeiro. Pressione uma resposta e ela vai ao agente como sua mensagem, alguns segundos depois, para que Desfazer possa corrigir um clique errado. Você também pode digitar sua própria resposta ou pressionar Explicar para que o agente diga mais antes de você decidir.

Quando a pergunta é uma escolha de design, como dois layouts ou duas formas de construir um recurso, Comparar faz o agente testar cada resposta contra seu código e cria uma página que as mostra lado a lado, aberta a partir da pergunta. A página começa com a escolha do agente, e a resposta do agente dá a escolha, o motivo e o caminho da página. Onde o agente pode rodar um subagent em segundo plano, a comparação roda lá, para que você continue trabalhando. A pergunta diz "Comparando…" até o agente responder. Após 30 minutos sem resposta, diz "Nenhuma comparação voltou", e você pode pressionar Comparar de novo.

Uma tarefa é algo como entrar em uma conta ou adicionar uma chave de API. Vem com botões para suas etapas, como copiar um comando ou abrir um arquivo. No Claude Code, rodar o comando com `!` fecha a tarefa quando ela tem sucesso. Descartar remove uma tarefa que você não fará, sem mensagem ao agente.

### Finds

Bugs, riscos e ideias que o agente notou fora da tarefa em que está trabalhando. O agente os registra e continua sua tarefa, e você decide depois quais explorar. Corrigir em uma issue ou Fazer em uma ideia entrega isso ao agente. Registrar issue faz o agente registrá-la no seu rastreador, como Linear ou GitHub, ou vincular a issue que já a cobre. Responder envia suas próprias palavras sobre isso. Explicar faz o agente dizer por que importa e o que corrigir envolveria, sem agir. Discutir conversa sobre isso, e Descartar o remove.

### PRs

Pull requests desta sessão e do seu branch atual. Cada um está marcado como Bloqueado, Pronto ou Aguardando, e lista o que o bloqueia: comentários de revisão esperando por você, verificações falhando e conflitos de merge. Botões entregam o trabalho ao agente: tratar um comentário de revisão ou todos, redigir uma resposta, corrigir uma verificação falha, resolver conflitos ou fazer merge. Corrigir e Resolver conflitos aparecem só enquanto o GitHub ainda mostra o problema. Um PR que faz merge ou é fechado sai da aba sozinho, com Desfazer para mantê-lo lá. Limpar mesclados e fechados, no topo da aba, limpa os que ficaram, exceto o do seu branch atual.

Seu agente também pode colocar os PRs em uma ordem, como qual fazer merge primeiro. A aba então os lista primeiro, numerados, sob o motivo e a razão da ordem. Quando um PR ranqueado muda, a aba avisa e oferece Ranquear de novo.

### Ele se mantém atualizado

Quando você responde a uma pergunta na sua própria mensagem, uma tarefa é concluída ou o agente corrige um achado, o inbox fecha o item. Itens fechados dobram abaixo dos abertos, cada um com como terminou. Um que você descartou mantém Reabrir ali pelo resto da sessão.

O agente também lê o inbox. Ao lado de cada um dos seus prompts, ele vê o que ainda está aberto e o que você respondeu, mesmo após a conversa ser compactada.

Cada clique mostra o que fez na hora. Discutir diz "Discutindo…" até o agente responder, e depois "✓ Discutido".

### Em cada aplicativo

A Ajuda lista as teclas e o significado de cada marca.

- **Terminal:** cada ação mostra a letra que a executa. As teclas numéricas trocam de aba, e `j` e `k` movem para cima e para baixo. No Status, elas movem entre as linhas que têm um botão, e a letra ao lado de um botão o pressiona. ctrl+x tab move o foco do prompt para a linha acima dele, depois para o painel e depois de volta ao prompt.
- **Aplicativo desktop do Claude:** você clica. Digite `/inbox` para abrir o painel. Cliques no painel são verificados no engine do Claude Code 2.1.309 e posteriores. Na 2.1.295, um clique após uma pressão só podia devolver o foco ao painel.
- **Aplicativo ChatGPT:** você clica ou pressiona as mesmas teclas do terminal. A aba não mostra letras.
- **Aplicativo Herdr:** veja [Painel do Herdr](#painel-do-herdr).
- **omp:** `/inbox` abre o painel sobre a conversa, e esc o fecha. Cada ação mostra a letra que a executa, e Responder é `t`. As setas movem entre linhas e entre os botões de uma linha, e enter pressiona o botão focado. Tab ou as teclas numéricas trocam de aba. No Status, `j` e `k` movem entre as linhas com botão, e as setas acima e abaixo rolam a página.

No Claude Code, uma linha acima do prompt conta o que precisa de você e os achados esperando, com um botão que abre o painel. Quando o Claude para por erro, uma segunda linha diz o motivo, com um botão Retomar após erro de API. O aplicativo ChatGPT não tem essa linha. O omp tem uma linha com as mesmas contagens. Diz que `/inbox` abre o painel e não tem linha de parada.

### Painel do Herdr

Em um terminal do aplicativo Herdr, o inbox pode abrir em um painel ao lado do terminal.

1. Inicie o Claude Code ou o omp em um terminal do Herdr e digite `/inbox`. Na primeira vez, o inbox abre no terminal e pergunta "Instalar o mod Herdr do inbox?". Pressione Instalar. O aplicativo ChatGPT faz a mesma pergunta na aba Inbox.
2. Digite `/inbox` de novo. O inbox abre em um painel à direita do terminal. O botão Abrir inbox do Claude Code faz o mesmo. Se você pressionou Instalar em outra sessão ou aplicativo e o inbox ainda abre no terminal, reinicie o Claude Code.
3. O painel mostra o inbox do terminal em que você focou por último em sua aba. Tem Asks, Finds e PRs, e você pode pressionar todo botão. ← e → trocam de aba, `j` e `k` movem entre linhas e esc devolve as teclas ao terminal. A Ajuda lista o resto.

Não instalar salva sua resposta. Execute `/inbox herdr` no Claude Code ou no omp para ser perguntado de novo.

A Codex CLI não tem `/inbox`. Abra o painel para ela com `herdr-app do pane.split '{"direction":"right","pane":"<id do painel>","mod":"inbox"}'`, tirando o id do painel de `herdr-app ls`.

Dentro de um painel do Herdr, o Claude Code, o omp e a Codex CLI também reportam à barra lateral do Herdr, como tokens de painel:

| Token | Guarda |
|---|---|
| `inbox` | O que espera por você, em uma linha |
| `inbox-needs-you`, `inbox-findings`, `inbox-prs` | A contagem da aba sozinha, como `2`. `inbox-needs-you` é da aba Asks e `inbox-findings` da aba Finds. Vazio quando a aba não tem nada esperando. |
| `inbox-stop` | Por que o agente parou. Os tokens de contagem ficam vazios até a parada terminar, para dar espaço na barra lateral. |
| `inbox-focus` | No que a sessão está focada, a partir do Status. Uma sessão que iniciou esta como delegada do Herdr a mostra como linha da delegada. Nenhuma linha da barra lateral precisa disso. |

Para distinguir as contagens pela cor de cada aba, adicione esta linha a `rows` sob `[ui.sidebar.agents]` na config do Herdr:

```toml
[
  { token = "$inbox-stop", fg = "#ffa3b0" },
  { token = "$inbox-needs-you", fg = "#ffae42" },
  { token = "$inbox-findings", fg = "#cab0ff" },
  { token = "$inbox-prs", fg = "#8cc8c0" },
],
```

O Herdr coloca ` · ` entre os tokens que têm valor e omite a linha quando nenhum tem.

## Custo

No Claude Code, o inbox acrescenta duas coisas:

| O que o inbox acrescenta | Tokens | Custo em preços de API |
|---|---|---|
| Uma chamada ao Sonnet após cada resposta do Claude, para atualizar o inbox | 3–4k de entrada, cerca de 2k em cache. 100–250 de saída. | Cerca de 0,5 centavo por resposta, ou 1 centavo após 5 minutos ocioso |
| Uma segunda chamada ao Sonnet, para escrever a aba Status | Cerca de 1,2k de entrada e 14–44 de saída numa troca curta (três execuções de avaliação: 1.175–1.214 de entrada). Uma atualização depois de uma conversa longa lê mais: 1.358 de entrada e 100 de saída naquela execução. | Menos que a primeira chamada, que lê cerca de 3k de entrada |
| Suas instruções e ferramentas, enviadas em toda requisição que o Claude faz | Cerca de 1.350, em cache | Menos de 0,1 centavo por requisição |

Em um plano Claude, isso conta para seus limites de uso.

No Codex, a atualização após cada resposta roda pelo binário `codex` dentro do aplicativo desktop, com seu login Codex. Faz duas chamadas por resposta. Cada uma leva cerca de 12.000 tokens de entrada de instruções básicas, que toda chamada `codex exec` inclui, mais seu próprio prompt. A chamada única anterior vinha a cerca de 16.000. Conta para o uso do seu plano.

## O que ele executa, envia e altera

Isto cobre o mod do Claude Code. [codex/README.md](codex/README.md) cobre o plugin do Codex. A extensão omp roda as mesmas consultas `gh`. Sua requisição de atualização passa pela própria conexão do omp com o provedor do modelo usado e contém as mesmas coisas da requisição do Claude Code.

**O que sai da sua máquina.** Três coisas, e nada mais:

- Após cada resposta do Claude, o inbox envia duas requisições ao Sonnet para a Anthropic pela própria conexão de modelo do Claude Code. Ambas contêm seu último prompt, a resposta do Claude, os itens abertos do inbox e uma linha para cada ferramenta que o Claude rodou. Uma linha de ferramenta diz algo como `ran: npm test` ou `edited src/app.ts`. [Custo](#custo) dá o tamanho da requisição.
- Quando o inbox pode ter perdido um turno, ele pede ao mesmo modelo, com as mesmas duas chamadas, para atualizá-lo a partir da conversa inteira. Ele faz fork da conversa para isso, ou lê a transcrição após uma retomada.
- Para preencher a aba PRs, ele roda consultas `gh` somente leitura: `gh pr view` e `gh api graphql` para threads de revisão. Elas chegam ao GitHub com seu próprio login `gh`. O inbox nunca lê seu token do GitHub.

**Programas que ele inicia.**

| Programa | Quando |
|---|---|
| `gh` | Para preencher a aba PRs |
| `open` | Quando você pressiona um botão que abre um link, arquivo ou pasta |
| `test -x` | Antes de abrir um arquivo. Um executável é mostrado no Finder, não rodado. |
| `herdr pane report-metadata` | Só dentro de um painel do Herdr, para mostrar o que espera por você e a contagem de cada aba na barra lateral do Herdr |

**Mensagens que ele envia como você.** Quando você pressiona um botão de resposta ou ação, o inbox envia ao Claude uma mensagem em seu nome. A mensagem é a resposta escolhida, ou um pedido sobre o item, como pedir ao Claude para corrigir um achado. Retomar, num turno parado, envia `Continue`. Toda mensagem que ele envia começa com um clique seu. Quando você marca como Feita uma tarefa que o Claude espera, o inbox avisa o Claude alguns segundos depois, ou quando o turno em andamento do Claude termina.

**O que ele acrescenta ao contexto do Claude.**

- Suas instruções, cerca de 1.350 tokens, em toda requisição.
- Uma nota ao lado do seu prompt quando você responde a uma das perguntas numeradas do Claude, ou quando o inbox mudou desde a última vez que o Claude o viu.
- Seus itens abertos após a conversa ser compactada, para que o Claude os mantenha.

**O que seus hooks veem.**

- Chamadas de ferramenta. O inbox lê cada chamada para escrever as linhas de ferramenta acima, para mostrar uma pergunta enquanto a caixa de diálogo do Claude está aberta e para encontrar um PR que esta sessão abre com `gh pr create`. Ele repassa cada chamada sem alteração, exceto chamadas às suas próprias duas ferramentas. `record` salva uma pergunta, tarefa ou achado e `close` fecha um item. O inbox responde a eles sozinho, então rodam sem prompt de permissão.
- Prompts de permissão. Enquanto o Claude Code pede sua aprovação para uma chamada de ferramenta, o inbox mostra uma linha para ela e repassa o pedido sem alteração. Ele nunca aprova nem nega um prompt de permissão.
- Descrições de ferramentas. Ele lista suas próprias duas ferramentas ao Claude antecipadamente, em vez de atrás de uma busca de ferramentas. Não mexe nas descrições de outras ferramentas.
- Comandos de shell que você roda com `!` e sua saída. Um comando que roda sem nada no stderr fecha uma tarefa que pediu para você rodá-lo.
- Inícios de sessão. Após `/clear`, uma retomada ou um fork, o inbox carrega os itens daquela conversa. Repassa o evento sem alteração.
- Sua configuração de tema, para combinar as cores.

**O que ele mantém.** O inbox salva os itens de cada sessão e os PRs que acompanha no armazenamento de plugins do Claude Code nesta máquina. Mantém as 40 sessões mais recentes e exclui as mais antigas. Um item pode resumir parte da conversa, então pode nomear as pessoas nela. Nada vai para o autor do plugin.

Ele também adiciona o comando `/inbox`.

## Desenvolvendo

[docs/developing.md](docs/developing.md) explica como rodar e compilar o inbox a partir de um clone.
