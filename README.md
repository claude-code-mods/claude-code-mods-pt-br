# Melhores Mods do Claude Code

[English](https://github.com/claude-code-mods/best-claude-code-mods) · [简体中文](https://github.com/claude-code-mods/claude-code-mods-zh) · [繁體中文](https://github.com/claude-code-mods/claude-code-mods-zh-tw) · [日本語](https://github.com/claude-code-mods/claude-code-mods-ja) · [한국어](https://github.com/claude-code-mods/claude-code-mods-ko) · [Español](https://github.com/claude-code-mods/claude-code-mods-es) · [Français](https://github.com/claude-code-mods/claude-code-mods-fr) · [Deutsch](https://github.com/claude-code-mods/claude-code-mods-de) · **Português (Brasil)** · [Русский](https://github.com/claude-code-mods/claude-code-mods-ru)

**Selecionados, validados e com versão fixada. Adicione uma vez, 40 mods.**

> **Todos os 40 mods estão totalmente localizados em português (Brasil).** Cada rótulo, comando, painel, prompt e README foi traduzido; as fontes dos plugins são distribuídas dentro deste repositório, então a interface já está em português (Brasil) após a instalação, sem nenhuma configuração adicional. Apenas identificadores de código, nomes de eventos de hook, skills e instruções voltadas ao modelo permanecem em inglês, para que o comportamento não mude.

Mods são plugins do Claude Code feitos de function hooks: observam, alteram ou respondem ao que o Claude Code faz, e desenham sua própria interface. Este mercado reúne os melhores mods da comunidade. Cada um é verificado com `claude plugin validate` e fixado no commit verificado, de modo que alterações posteriores do autor nunca cheguem a você sem revisão.

Requer Claude Code 2.1.287 ou superior.

## Instalação

Em uma sessão do terminal do Claude Code:

```
/plugin marketplace add claude-code-mods/claude-code-mods-pt-br
/plugin install <mod>@claude-code-mods-pt-br
```

Por exemplo `/plugin install terminal-browser@claude-code-mods-pt-br`. Execute `/plugin marketplace update claude-code-mods-pt-br` para obter novos mods e atualizações.

## Catálogo

**Permissões** em cada cartão lista o que o validador informa que o código do mod pode fazer além de desenhar a interface. Leia o código-fonte de um mod antes de instalá-lo: a validação lê o código sem executá-lo e não é uma auditoria de segurança.

### Painéis e uso

[![token-optimizer](https://raw.githubusercontent.com/alexgreensh/token-optimizer/main/docs-site/public/media/token-optimizer-desktop-status-bar.gif)](https://github.com/alexgreensh/token-optimizer/tree/e3f1a2dcad8d8999096b8a881c4d98cdba4ef1a5/desktop/token-optimizer-desktop)

#### [`token-optimizer`](https://github.com/alexgreensh/token-optimizer/tree/e3f1a2dcad8d8999096b8a881c4d98cdba4ef1a5/desktop/token-optimizer-desktop)

*por alexgreensh* · Uma barra de status de otimização de tokens que mostra para onde os tokens vão e como gastar menos.

**Permissões:** Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install token-optimizer@claude-code-mods-pt-br`

---

[![council](https://github.com/hex/claude-council/raw/main/assets/desktop-code-tab.png)](https://github.com/hex/claude-council/tree/f2f7f42122b288599cef8cea97dcc490acea98a5)

#### [`council`](https://github.com/hex/claude-council/tree/f2f7f42122b288599cef8cea97dcc490acea98a5)

*por hex* · Consulte vários agents de IA ao mesmo tempo para obter perspectivas diferentes, com um painel em fluxo contínuo e uma verificação lateral opcional.

**Permissões:** Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install council@claude-code-mods-pt-br`

---

[![codex-attachment-manager](https://github.com/chipfighter/context-attachment-manager/raw/main/docs/images/hero.gif)](https://github.com/chipfighter/context-attachment-manager/tree/d68a721b7432059c9056d546ff2a26b11b3c0e0c)

#### [`codex-attachment-manager`](https://github.com/chipfighter/context-attachment-manager/tree/d68a721b7432059c9056d546ff2a26b11b3c0e0c)

*por chipfighter* · Imagens antigas são enviadas como marcadores curtos e as originais são buscadas por ID, para que sessões longas com imagens mantenham o cache de prompt.

**Permissões:** Rede, MCP

`/plugin install codex-attachment-manager@claude-code-mods-pt-br`

---

[![cache-tax](https://github.com/karanb192/cache-tax/raw/main/site/assets/refusal.gif)](https://github.com/karanb192/cache-tax/tree/535ff33225e666e605e731d78f5ac5efe243c7c3)

#### [`cache-tax`](https://github.com/karanb192/cache-tax/tree/535ff33225e666e605e731d78f5ac5efe243c7c3)

*por karanb192* · Mantém o cache de prompt de uma hora aquecido durante pausas, pergunta antes de um envio frio e mostra o custo da reescrita.

**Permissões:** Chama modelos

`/plugin install cache-tax@claude-code-mods-pt-br`

---

[![agent-standup-band](https://atoll92.github.io/agent-standup/media/banner.png)](https://github.com/Atoll92/agent-standup/tree/846d5324f7c00f06d598c86e87ed8b51d774b3ac/plugin-band)

#### [`agent-standup-band`](https://github.com/Atoll92/agent-standup/tree/846d5324f7c00f06d598c86e87ed8b51d774b3ac/plugin-band)

*por Atoll92* · Uma linha acima do campo de entrada quando outra sessão local precisa de você e um aviso quando uma termina.

**Permissões:** Executa comandos, Lê e escreve arquivos

`/plugin install agent-standup-band@claude-code-mods-pt-br`

---

[![shunt](docs/assets/shunt.png)](https://github.com/pleaseai/shunt/tree/57182b328e92d3c70bc9ca5a1fd1ee9104cfbabb/plugins/shunt)

#### [`shunt`](https://github.com/pleaseai/shunt/tree/57182b328e92d3c70bc9ca5a1fd1ee9104cfbabb/plugins/shunt)

*por pleaseai* · Uma faixa de uso para o gateway shunt: gasto e reinício de cada janela, além do detalhamento completo de /shunt:usage.

**Permissões:** Rede, Executa comandos

`/plugin install shunt@claude-code-mods-pt-br`

---

[![tokendoctor](https://github.com/localixai/tokendoctor/raw/main/docs/demo.gif)](https://github.com/localixai/tokendoctor/tree/051fa9598f0a50ed30974b618f2911381b7dcf90)

#### [`tokendoctor`](https://github.com/localixai/tokendoctor/tree/051fa9598f0a50ed30974b618f2911381b7dcf90)

*por localixai* · Reproduz suas sessões passadas para mostrar o que cada mudança teria economizado e aplica apenas o que você escolhe.

**Permissões:** Executa comandos, Chama modelos

`/plugin install tokendoctor@claude-code-mods-pt-br`

---

[![skins](https://github.com/hellosverre/claude-skins/raw/main/docs/demo.gif)](https://github.com/hellosverre/claude-skins/tree/cf0d39f3785d5c5a4b6189ecc487b1ac479efea0)

#### [`skins`](https://github.com/hellosverre/claude-skins/tree/cf0d39f3785d5c5a4b6189ecc487b1ac479efea0)

*por hellosverre* · Skins e quinze temas para a transcrição, com cartões ricos e uma faixa de uso; /skin troca tudo ao vivo.

**Permissões:** Rede, Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install skins@claude-code-mods-pt-br`

---

[![ctx-handoff](docs/assets/ctx-handoff-mod.png)](https://github.com/cablate/ctx-handoff-mod/tree/a416713a0495be799a31f3650e18458e242270c7)

#### [`ctx-handoff`](https://github.com/cablate/ctx-handoff-mod/tree/a416713a0495be799a31f3650e18458e242270c7)

*por cablate* · Transforma o que você ensina ao Claude em notas de projeto, detecta erros comuns, mantém o cache aquecido e retoma sessões longas.

**Permissões:** Chama modelos, Lê e escreve arquivos

`/plugin install ctx-handoff@claude-code-mods-pt-br`

---

[![ripple](https://github.com/PBJ-2/clauderipple/raw/main/docs/media/demo.webp)](https://github.com/PBJ-2/clauderipple/tree/c1c6b76a9e4e7a51df2ec5907d6e41d6bf8591e3/packages/mod)

#### [`ripple`](https://github.com/PBJ-2/clauderipple/tree/c1c6b76a9e4e7a51df2ec5907d6e41d6bf8591e3/packages/mod)

*por PBJ-2* · Escolhe o esforço de raciocínio para cada prompt e um worker para cada tarefa delegada, mantém o cache aquecido e mostra para onde foi cada requisição.

**Permissões:** Rede, Executa comandos, Chama modelos, MCP, Lê e escreve arquivos

`/plugin install ripple@claude-code-mods-pt-br`

---

[![tavernweave-agent-skills](https://github.com/LiarMTTT/TavernWeave/raw/main/docs/assets/tavernweave-v1-cover.png)](https://github.com/LiarMTTT/TavernWeave/tree/f9863d2b05305457fe9ed8b0c5688d52aca400a5)

#### [`tavernweave-agent-skills`](https://github.com/LiarMTTT/TavernWeave/tree/f9863d2b05305457fe9ed8b0c5688d52aca400a5)

*por LiarMTTT* · 23 skills compartilhadas para papéis, trabalho de software e tarefas em nuvem limitadas, além de um interruptor de modo Soul acima do campo de entrada.

**Permissões:** —

`/plugin install tavernweave-agent-skills@claude-code-mods-pt-br`

---

[![agent-usage-guard](https://github.com/rbartoli/agent-usage-guard/releases/download/agent-usage-guard--v1.0.0/agent-usage-guard.gif)](https://github.com/rbartoli/agent-usage-guard/tree/02594c2620be9eb60c32e2f77d9d512d9f61b205)

#### [`agent-usage-guard`](https://github.com/rbartoli/agent-usage-guard/tree/02594c2620be9eb60c32e2f77d9d512d9f61b205)

*por rbartoli* · Contém a dispersão de subagents, prompts com contexto pesado e loops de repetição antes que consumam sua janela de uso.

**Permissões:** Chama modelos, Lê e escreve arquivos

`/plugin install agent-usage-guard@claude-code-mods-pt-br`


### Agents e subagents

[![shared-session](https://github.com/Paradigm-Study/claude-share/raw/main/docs/assets/invitation-demo.png)](https://github.com/Paradigm-Study/claude-share/tree/9d88f996ac4245c756a89b34e98cfde375028950/plugin)

#### [`shared-session`](https://github.com/Paradigm-Study/claude-share/tree/9d88f996ac4245c756a89b34e98cfde375028950/plugin)

*por Paradigm-Study* · Compartilhe uma sessão por link ou com sua equipe; colegas entram com seu próprio Claude Code e acompanham cada turno ao vivo.

**Permissões:** —

`/plugin install shared-session@claude-code-mods-pt-br`

---

[![flightdeck](https://github.com/scasella/claude-flightdeck/raw/main/docs/media/demo.gif)](https://github.com/scasella/claude-flightdeck/tree/626cc0b46d417f81bbff9f5ba3b49abaf8912a85)

#### [`flightdeck`](https://github.com/scasella/claude-flightdeck/tree/626cc0b46d417f81bbff9f5ba3b49abaf8912a85)

*por scasella* · Painel ao vivo de agents: sinais vitais do modelo, arquiteto de plantão, verificações de permissão, cartões de subagentes e registro da sessão.

**Permissões:** —

`/plugin install flightdeck@claude-code-mods-pt-br`

---

[![start](https://github.com/rsmdt/the-startup/raw/main/logo.png)](https://github.com/rsmdt/the-startup/tree/e803d51fdb423271d3dde189f5416f3ec51386a9/plugins/start)

#### [`start`](https://github.com/rsmdt/the-startup/tree/e803d51fdb423271d3dde189f5416f3ec51386a9/plugins/start)

*por rsmdt* · Comandos de orquestração de fluxos de trabalho para desenvolvimento de software agêntico.

**Permissões:** Lê e escreve arquivos

`/plugin install start@claude-code-mods-pt-br`

---

[![lane-stack](docs/assets/claude-lane-stack.png)](https://github.com/VKirill/claude-lane-stack/tree/8bac2b876b72053aa445bb9d1c7c6079bfc4ba8c/plugins/lane-stack)

#### [`lane-stack`](https://github.com/VKirill/claude-lane-stack/tree/8bac2b876b72053aa445bb9d1c7c6079bfc4ba8c/plugins/lane-stack)

*por VKirill* · Esteira de gerente de produto individual: agents orquestradores, cartilhas de faixa e comandos de entrada e retomada.

**Permissões:** Rede, Chama modelos

`/plugin install lane-stack@claude-code-mods-pt-br`


### Produtividade e contexto

[![pebrel-prompt-suggestions](https://github.com/Kuddev/pebrel/raw/main/docs/screenshots/nebula-claude-session.png)](https://github.com/Kuddev/pebrel/tree/ed9b2331340877ba3d775e38c4df6bd1a2abb1fe/pebrel_app/res/prompt-suggestions/claude)

#### [`pebrel-prompt-suggestions`](https://github.com/Kuddev/pebrel/tree/ed9b2331340877ba3d775e38c4df6bd1a2abb1fe/pebrel_app/res/prompt-suggestions/claude)

*por Kuddev* · Previsões nativas de prompt no campo vazio por meio da ponte de sessão Pebrel.

**Permissões:** Rede

`/plugin install pebrel-prompt-suggestions@claude-code-mods-pt-br`

---

[![fast-jev-compaction](docs/assets/fast-jev-compaction.png)](https://github.com/tamaratran/fast-jev-compaction/tree/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0)

#### [`fast-jev-compaction`](https://github.com/tamaratran/fast-jev-compaction/tree/e3f262a7f4d42bd8dd32ced30d26176f7cb545b0)

*por tamaratran* · Compactação literal guiada por Jev para sessões do Claude Code.

**Permissões:** Rede, Chama modelos

`/plugin install fast-jev-compaction@claude-code-mods-pt-br`

---

[![lot-map](https://github.com/alexeyw/lot-map/raw/main/docs/demo.gif)](https://github.com/alexeyw/lot-map/tree/ad60f057902765d778eedde770d337be45fac3af)

#### [`lot-map`](https://github.com/alexeyw/lot-map/tree/ad60f057902765d778eedde770d337be45fac3af)

*por alexeyw* · Um mapa ao vivo ao lado do chat: memória, arquivos, shell, web, modelo, agents, skills e hooks se acendem conforme são usados.

**Permissões:** —

`/plugin install lot-map@claude-code-mods-pt-br`

---

[![storybloq](https://raw.githubusercontent.com/Storybloq/storybloq/main/assets/board.png)](https://github.com/Storybloq/storybloq/tree/f0b4c08e3a15ffb9841e5a3058c6b1ca57607154/plugins/storybloq)

#### [`storybloq`](https://github.com/Storybloq/storybloq/tree/f0b4c08e3a15ffb9841e5a3058c6b1ca57607154/plugins/storybloq)

*por Storybloq* · Memória de projeto: tickets, issues, entregas e lições guardados em uma pasta .story no seu repositório.

**Permissões:** Lê e escreve arquivos

`/plugin install storybloq@claude-code-mods-pt-br`

---

[![just-do-it](docs/assets/claude-ops.png)](https://github.com/Lifecycle-Innovations-Limited/claude-ops/tree/e434ef7e612f2ff5769def6101fc9d984888d377/claude-ops/skills/ops-jdi/plugin)

#### [`just-do-it`](https://github.com/Lifecycle-Innovations-Limited/claude-ops/tree/e434ef7e612f2ff5769def6101fc9d984888d377/claude-ops/skills/ops-jdi/plugin)

*por Lifecycle-Innovations-Limited* · Leva o trabalho autorizado até a verificação e a entrega, e mostra problemas de configuração que precisam ser corrigidos.

**Permissões:** Executa comandos, Chama modelos

`/plugin install just-do-it@claude-code-mods-pt-br`

---

[![filetree](https://github.com/data-goblin/claude-code-filetree/raw/main/media/filetree-shimmer.gif)](https://github.com/data-goblin/claude-code-filetree/tree/1fdc3a963f2dc22a939f661ff0ff5a76646c9112)

#### [`filetree`](https://github.com/data-goblin/claude-code-filetree/tree/1fdc3a963f2dc22a939f661ff0ff5a76646c9112)

*por data-goblin* · Uma árvore de arquivos estilo IDE que mostra o que o Claude está fazendo e em qual arquivo.

**Permissões:** Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install filetree@claude-code-mods-pt-br`

---

[![jev-auto-compact](https://github.com/notque/vexjoy-agent/raw/main/docs/repo-hero.png)](https://github.com/notque/vexjoy-agent/tree/c68ac1fea2a03e437ccc95112d1e56e467a9bd00/plugins/jev-auto-compact)

#### [`jev-auto-compact`](https://github.com/notque/vexjoy-agent/tree/c68ac1fea2a03e437ccc95112d1e56e467a9bd00/plugins/jev-auto-compact)

*por notque* · Com 60% de contexto, remove chamadas de ferramenta obsoletas sem gerar nada; pula em vez de recorrer a um resumo de LLM.

**Permissões:** Rede, Chama modelos

`/plugin install jev-auto-compact@claude-code-mods-pt-br`

---

[![caliber-jev-compaction](https://github.com/caliber-ai-org/ai-setup/raw/master/assets/readme/pillars.png)](https://github.com/caliber-ai-org/ai-setup/tree/f5dbc002022a8a10acad25c1cce23ddefdc19d0d/plugin/caliber-jev-compaction)

#### [`caliber-jev-compaction`](https://github.com/caliber-ai-org/ai-setup/tree/f5dbc002022a8a10acad25c1cce23ddefdc19d0d/plugin/caliber-jev-compaction)

*por caliber-ai-org* · Compactação literal guiada por Jev para sessões do Claude Code.

**Permissões:** Rede, Chama modelos

`/plugin install caliber-jev-compaction@claude-code-mods-pt-br`

---

[![operator](https://github.com/aerovato/operator-memory/raw/main/docs/assets/change-the-loop.png)](https://github.com/aerovato/operator-memory/tree/93c3fce64f0a72adeb89fa868600eb418548ec07/packages/claude-code)

#### [`operator`](https://github.com/aerovato/operator-memory/tree/93c3fce64f0a72adeb89fa868600eb418548ec07/packages/claude-code)

*por aerovato* · Memória durável de projeto e usuário para desenvolvimento conduzido por agents.

**Permissões:** —

`/plugin install operator@claude-code-mods-pt-br`

---

[![carbon](https://github.com/gwittebolle/claude-carbon/raw/main/docs/desktop-pane.png)](https://github.com/gwittebolle/claude-carbon/tree/9ad53f1dd07fb0e11fcdb94d294ed794d660cf4b)

#### [`carbon`](https://github.com/gwittebolle/claude-carbon/tree/9ad53f1dd07fb0e11fcdb94d294ed794d660cf4b)

*por gwittebolle* · Acompanha a pegada de carbono das suas sessões do Claude Code no terminal e no aplicativo desktop.

**Permissões:** Lê e escreve arquivos

`/plugin install carbon@claude-code-mods-pt-br`

---

[![work-mode](https://github.com/danyuchn/claude-work-mode/raw/main/promo/demo-poster-en.png)](https://github.com/danyuchn/claude-work-mode/tree/e19eda1e8465308bd79a74fad295cf9b6d9cdf71/plugins/work-mode)

#### [`work-mode`](https://github.com/danyuchn/claude-work-mode/tree/e19eda1e8465308bd79a74fad295cf9b6d9cdf71/plugins/work-mode)

*por danyuchn* · Modos de sessão: auto (sem perguntas no meio da tarefa), out (delegar trabalho em lote) e wrap (convergir e finalizar).

**Permissões:** Executa comandos, Lê e escreve arquivos

`/plugin install work-mode@claude-code-mods-pt-br`

---

[![show-your-work](https://github.com/iamumeransari/claude-show-your-work/raw/main/docs/homepage.jpg)](https://github.com/iamumeransari/claude-show-your-work/tree/71e546044e3ba61b98a6938a03270da791f9ca2e)

#### [`show-your-work`](https://github.com/iamumeransari/claude-show-your-work/tree/71e546044e3ba61b98a6938a03270da791f9ca2e)

*por iamumeransari* · Mostra o trabalho concluído no terminal: capturas de tela, vídeos de cliques no aplicativo e verificações antes/depois sincronizadas.

**Permissões:** Rede, Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install show-your-work@claude-code-mods-pt-br`

---

[![inbox](docs/assets/inbox.png)](https://github.com/petekp/inbox/tree/02e441cd447edf86fc30fbd03e9117a8ead9da7a)

#### [`inbox`](https://github.com/petekp/inbox/tree/02e441cd447edf86fc30fbd03e9117a8ead9da7a)

*por petekp* · Reúne as perguntas, tarefas, descobertas e PRs que esperam por você em uma sessão.

**Permissões:** —

`/plugin install inbox@claude-code-mods-pt-br`

---

[![compact-adviser](https://github.com/kunchenguid/compact-adviser/raw/main/docs/hint-status-line.png)](https://github.com/kunchenguid/compact-adviser/tree/37fa1a665b8933de68c90014312060e862cf121a/packages/claude-mod)

#### [`compact-adviser`](https://github.com/kunchenguid/compact-adviser/tree/37fa1a665b8933de68c90014312060e862cf121a/packages/claude-mod)

*por kunchenguid* · Sugere ou executa /compact em um ponto de checagem concluído, avaliado pelo TypeSafe Jev.

**Permissões:** Rede, Chama modelos, Lê e escreve arquivos

`/plugin install compact-adviser@claude-code-mods-pt-br`


### Renderização e pré-visualização

[![terminal-browser](docs/assets/terminal-browser.webp)](https://github.com/zenbu-labs/terminal-browser/tree/fa9e5eb053d2a1da11f7ccba720a0d3d389c05a6/claude-code-plugin)

#### [`terminal-browser`](https://github.com/zenbu-labs/terminal-browser/tree/fa9e5eb053d2a1da11f7ccba720a0d3d389c05a6/claude-code-plugin)

*por zenbu-labs* · Um navegador dentro do Claude Code: visualize sites e HTML e deixe o agente controlar o navegador integrado.

**Permissões:** Rede, Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install terminal-browser@claude-code-mods-pt-br`

---

[![prismantis](https://github.com/NahumLitvin/prismantis/raw/main/docs/tour.gif)](https://github.com/NahumLitvin/prismantis/tree/3718a40abc57b836108a65bd9f01d06d3237e52d/plugin)

#### [`prismantis`](https://github.com/NahumLitvin/prismantis/tree/3718a40abc57b836108a65bd9f01d06d3237e52d/plugin)

*por NahumLitvin* · Renderização colorida e personalizável para respostas: tabelas, títulos, código, números, caminhos e links.

**Permissões:** Executa comandos, Lê e escreve arquivos

`/plugin install prismantis@claude-code-mods-pt-br`


### Segurança e proteção

[![lcu-approve](https://github.com/amontlabs/lcu/raw/main/docs/assets/approval-demo.gif)](https://github.com/amontlabs/lcu/tree/1bd45b304295c7665b559fcc32f7b3a8f1b1d859/adapters/claude-mod/lcu-approve)

#### [`lcu-approve`](https://github.com/amontlabs/lcu/tree/1bd45b304295c7665b559fcc32f7b3a8f1b1d859/adapters/claude-mod/lcu-approve)

*por amontlabs* · Aprovação por aplicativo para uso do computador: permitir nesta conversa, sempre permitir ou negar, além de um painel de aplicativos aprovados.

**Permissões:** Executa comandos, MCP, Lê e escreve arquivos

`/plugin install lcu-approve@claude-code-mods-pt-br`

---

[![agentctl](https://raw.githubusercontent.com/sd0xdev/sd0x-harness/main/banner.jpg)](https://github.com/sd0xdev/sd0x-harness/tree/b0206637edd2e44c993da12b6b30858f96bc3cdc/mods/agentctl)

#### [`agentctl`](https://github.com/sd0xdev/sd0x-harness/tree/b0206637edd2e44c993da12b6b30858f96bc3cdc/mods/agentctl)

*por sd0xdev* · Um painel de controle de agent para uma sessão: escopo da tarefa, evidências e passagem de bastão.

**Permissões:** Executa comandos, Chama modelos, Lê e escreve arquivos

`/plugin install agentctl@claude-code-mods-pt-br`

---

[![multi-core](docs/assets/cc-multi-cli-plugin.png)](https://github.com/greenpolo/cc-multi-cli-plugin/tree/66d9b0a6b06b25fd648ecd53311a647bb57e2fb4/plugins/multi-core)

#### [`multi-core`](https://github.com/greenpolo/cc-multi-cli-plugin/tree/66d9b0a6b06b25fd648ecd53311a647bb57e2fb4/plugins/multi-core)

*por greenpolo* · Use modelos do ChatGPT, Cursor, OpenCode e Antigravity em uma única sessão, alternando com /model.

**Permissões:** Rede, Chama modelos

`/plugin install multi-core@claude-code-mods-pt-br`

---

[![jevmem-pane](docs/assets/jevmem.png)](https://github.com/Avinash-jetwani/jevmem/tree/c29753ccb2c9706e417fda25efa422682358955b/pane)

#### [`jevmem-pane`](https://github.com/Avinash-jetwani/jevmem/tree/c29753ccb2c9706e417fda25efa422682358955b/pane)

*por Avinash-jetwani* · Um painel lateral que mostra o que o jevmem recuperou, o que seu guardião decidiu e o que o último turno salvou.

**Permissões:** Executa comandos, Lê e escreve arquivos

`/plugin install jevmem-pane@claude-code-mods-pt-br`


### Git, PRs e deploy

[![fm](https://github.com/kunchenguid/firstmate/raw/main/assets/banner.png)](https://github.com/kunchenguid/firstmate/tree/427056c4181c41074ad24f051f79919330df0fa5/.claude/mods/firstmate-calm)

#### [`fm`](https://github.com/kunchenguid/firstmate/tree/427056c4181c41074ad24f051f79919330df0fa5/.claude/mods/firstmate-calm)

*por kunchenguid* · Animação de trabalho do veleiro e transcrição restrita à conversa, com preferência de modo calmo compartilhada entre sessões.

**Permissões:** Lê e escreve arquivos

`/plugin install fm@claude-code-mods-pt-br`

---

[![turbo](https://github.com/tobihagemann/turbo/raw/main/assets/logo/thunderbolt-icon-256.png)](https://github.com/tobihagemann/turbo/tree/3bc6b4436d96be22497109e16e68fe4dfa323531/claude)

#### [`turbo`](https://github.com/tobihagemann/turbo/tree/3bc6b4436d96be22497109e16e68fe4dfa323531/claude)

*por tobihagemann* · Uma fábrica de software agêntica com controle humano: você decide o que construir e avalia o resultado, enquanto as skills constroem e entregam.

**Permissões:** Chama modelos, Lê e escreve arquivos

`/plugin install turbo@claude-code-mods-pt-br`

---

[![mazyos](docs/assets/MazyOS.png)](https://github.com/Mazzeo-Marketing/MazyOS/tree/d2b65b392f1ee230afb088d155fc734def5f105d)

#### [`mazyos`](https://github.com/Mazzeo-Marketing/MazyOS/tree/d2b65b392f1ee230afb088d155fc734def5f105d)

*por Mazzeo-Marketing* · Um sistema operacional de negócios em português para o Claude Code: a memória da sua empresa em toda sessão, identidade visual nas saídas e 17 skills de marketing e SEO.

**Permissões:** Lê e escreve arquivos

`/plugin install mazyos@claude-code-mods-pt-br`

---

[![engineer](docs/assets/engineer.png)](https://github.com/swingerman/engineer/tree/ae4cb5fe32007dd6a3d717c9998dcfb12b1f348e/engineer)

#### [`engineer`](https://github.com/swingerman/engineer/tree/ae4cb5fe32007dd6a3d717c9998dcfb12b1f348e/engineer)

*por swingerman* · Um kit de metodologia de engenharia agêntica disciplinada: entrada, descoberta de critérios de aceite, especificação, planejamento, implementação, verificação e endurecimento.

**Permissões:** Executa comandos, Chama modelos

`/plugin install engineer@claude-code-mods-pt-br`

## Sugerir um mod

Abra uma issue com o link para o repositório do mod. Para adicionar um você mesmo, adicione uma entrada em `community.json` (repositório, pasta, commit revisado, categoria, licença), adicione as introduções em uma linha em `readme/summaries.json`, execute `python3 scripts/build-catalog.py` e abra um pull request.

## Agradecimentos e localização

Cada mod pertence ao seu autor original e mantém sua própria licença. Além de coletá-los, este repositório também fornece uma **localização em português (Brasil)**: os plugins são empacotados em `mods/`, seus rótulos, descrições de comandos, painéis e prompts são traduzidos e a documentação de cada mod também é traduzida (a original é mantida como `README.en.md`). O autor e a licença originais são creditados ao final de cada documento. Se você quiser que uma cópia localizada seja removida ou sua atribuição alterada, por favor abra uma issue.

Projeto não oficial, não afiliado à Anthropic.
