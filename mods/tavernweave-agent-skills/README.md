# TavernWeaveXLua Infinita

> **Lançamento oficial 2.4.0**: adiciona **suporte nativo ao Antigravity (AGY)** — modelo de plugin hospedeiro AGY, arquivos de instrução e persistência das quatro preferências de orientação — e alinha os manifests dos plugins Codex e Claude e a descrição do marketplace ao manifesto principal de instalação, restaurando a consistência de versão. Os nomes e a quantidade dos 23 Skills permanecem os mesmos. Os assets de lançamento e os arquivos de verificação estão na [página oficial do v2.4.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0). Instalações a partir do código conferem os 23 Skills pelo manifesto local; o escopo completo de validação está no CHANGELOG e no contrato DSH.

> Esta versão acrescenta o suporte nativo ao Antigravity sobre a **2.3.6** e mantém os 23 Skills. O plugin do Claude Code introduzido na 2.2.0 continua a oferecer injeção automática do Host Front Door, o agente `tavernweave` e a alternância de modo Soul acima da caixa de entrada; o pacote de plugins **TavernWeave X DSH** agora inclui o painel do cliente Hand of God (roda, janela completa,livro-mundo, banco de dados de design e animação de front-end, gerenciamento de projetos/cartões) em uma única instalação; os pontos de entrada para design e escrita delivro-mundo continuam disponíveis. Pacote completo, pacotes de plugin e arquivos de verificação estão na [página oficial do v2.4.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0); a origem e o histórico de integração estão nas [notas de atualização](docs/dual-task-upgrade.md).

<p align="center">
  <img src="docs/assets/tavernweave-v1-cover.png" alt="Um tear digital em uma taverna de fantasia, tecendo cartões de personagem, livros-mundo, materiais de design e módulos de engenharia em um fluxo de trabalho unificado" width="100%">
</p>

<p align="center"><strong>Teça inspiração, materiais, código e validação em um cartão de personagem realmente mantível.</strong></p>

O TavernWeaveXLua Infinita (abreviado TW) ajuda você a transformar ideias em cartões de personagem, páginas web ou pequenas ferramentas que podem ser usadas e continuadas. Você pode dizer diretamente o que quer fazer ou onde está o problema; a TW organiza os requisitos, propõe uma solução, produz e verifica o resultado, e explica como testá-lo em seguida. Ela organiza esse trabalho por Skills carregados por tarefa (capacidades de trabalho invocadas conforme a tarefa), com suporte para Codex, Claude Code e, por meio do pacote de plugins **TavernWeave X DSH**, para o DeepSeek Harness; o pacote DSH traz também o painel do cliente Hand of God.

O código atual é o **TavernWeaveXLua Infinita 2.4.0 (lançamento oficial)**, com suporte nativo ao Antigravity (AGY), persistência das quatro preferências de orientação e correção da consistência de versão entre hosts; são 23 Skills nativos, com nomes e quantidade inalterados. O plugin do Claude Code introduzido na 2.2.0 continua a oferecer injeção automática do Host Front Door, o agente `tavernweave` e a alternância de modo Soul (ver [plugin do Claude Code](#plugin-do-claude-code)); o pacote de plugins **TavernWeave X DSH** traz embutido o painel do cliente Hand of God, e os pontos de entrada para design e escrita de livros-mundo continuam disponíveis. O identificador de instalação `tavernweave-agent-skills`, os nomes dos Skills existentes e o endereço do repositório seguem a versão original, para facilitar a conferência da atualização. O pacote completo e os arquivos de verificação estão na [página oficial do v2.4.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0); as páginas históricas de [v2.2.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.2.0), [v2.1.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.1.0), [v1.9.1](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.1) e [v1.9.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v1.9.0) foram mantidas.

**O principal objetivo do plugin unificado é permitir que usuários com permissão invoquem a TW em tarefas longas na nuvem dots.** Codex e dots compartilham o `TavernWeave-Codex-v2.4.0.zip`; não há uma versão cloud separada. A TW oferece Skills e materiais de referência; execução em nuvem, continuidade, armazenamento persistente e ferramentas vêm do host real. Uma instalação local não é sincronizada automaticamente com a conta dots. O modo de uso e os pontos de entrada da conta estão no **[guia do plugin unificado](docs/plugin-guide.md)**.

A TW pode projetar ou reescrever um livro-mundo isoladamente: primeiro esclarece os limites do conhecimento, o texto e as condições de acionamento, depois escolhe entre entradas nativas, saída condicional, leitura explícita ou uma solução mista local. O conteúdo do livro-mundo é entregue separadamente do cartão inteiro, da construção de mundo, das variáveis e da depuração em execução; a otimização de orçamento exige medição real, e o efeito do modelo exige observação no host correspondente. Tarefas comuns de software e de criação de cartões compartilham a mesma metodologia de esclarecimento de requisitos e especificação de prompts, e decisões já tomadas podem ser reaproveitadas diretamente.

Segue o método de criação Lua de Tinta confirmado na 1.9.0: o cartão completo tem como núcleo a frase de abertura e o livro-mundo, organizados em texto puro, MVU Zod ou híbrido, com acréscimos de mundo, variáveis e métodos de criação de personagens. O front-end primeiro pesquisa os requisitos e o design relacionado, usando como referência padrão os requisitos de design da Awwwards; a interface permanece limpa e o texto evita clichês conforme o uso.

Se você quiser escrever apenas uma regra de prompt para um cartão, pode pedir isso diretamente. O agente preserva o sentido original e a força das restrições, entregando o texto ou a entrada do livro-mundo conforme pedido. Quando a ferramenta de vinculação de campos encontra um erro de tipo `bindings`, ela retorna um diagnóstico claro em vez de lançar uma exceção de método de array. A 1.9.0 corrigiu o problema em que uma falha de exportação de componente no Windows podia deixar arquivos pela metade; arquivos que não podem ser limpos são listados explicitamente. As mudanças de versão estão no [registro de atualizações](CHANGELOG.md).

O quadro de progresso do projeto continua sendo gerado pelo `orchestrate-project-blueprint` dentro de cada projeto: mostra barras de progresso de implementação/validação gerais e por módulo, expande pontos de verificação e evidências, e guarda ideias, bugs e falas de revisão. O quadro pode ler o escopo e os requisitos de validação no projeto geral e o estado atual, as evidências e a próxima porta no NEXT; a sincronização mostra primeiro as diferenças e reconfere quando a origem, o feedback ou as evidências mudam. Novas ideias não ampliam automaticamente o escopo confirmado, e percentuais não substituem automaticamente a validação do responsável ou do host real. O modo de uso está em [quadro de progresso do projeto](docs/project-progress-board.md).

A biblioteca de obras continua a aceitar novelas, materiais originais/de fãs e referências de texto e imagem da internet, entregando por padrão Markdown editável + índice JSONL, com exportação para SQLite; a busca pode ser feita por origem, versão de adaptação e estágio de conhecimento. Veja [instruções da biblioteca de obras](docs/work-library.md).

Todas as capacidades continuam a respeitar a linguagem simples e a explicação de termos; iniciante, iniciante intermediário, proficiente e experiente são escolhidos pelo usuário. Refinamento de texto, revisão completa e de arquitetura, brainstorms, biblioteca de design embutida, Soul e orientação para assumir cartões antigos continuam disponíveis. A verificação da instalação usa o manifesto da máquina da versão efetivamente obtida; o carregamento real pelo cliente e as medições de qualidade/token de cada obra permanecem como verificações separadas.

> O conteúdo original do TavernWeave usa a [PolyForm Noncommercial License 1.0.0](LICENSE). Uso não comercial, modificação e distribuição são permitidos; sem autorização adicional do detentor dos direitos, as versões original, modificada e redistribuída não podem ser usadas para fins comerciais. Ao distribuir, mantenha a licença e os avisos de direitos autorais. Conteúdo de terceiros continua sujeito às [respectivas licenças](THIRD_PARTY_NOTICES.md).

## Comece em uma frase

Para criação de cartões comum ou Vibe Code:

```text
Quero usar a TavernWeave para criar 【descreva a obra que você quer】.
Primeiro examine os arquivos existentes e organize algo pequeno que eu possa testar; explique em linguagem simples por que recomenda isso e o que preciso decidir.
```

Se você já tem arquivos de cartão, pode começar assim:

```text
Assumi este cartão de personagem e quero 【continuar a partir do original / criar uma versão derivada】.
Primeiro me ajude a entender o cartão original, indicando quais materiais existem e o que precisa ser preservado; depois escolhamos juntos a primeira alteração.
```

## Colabore no ritmo que você escolher

| Nível de orientação | O que você recebe |
| --- | --- |
| Iniciante | Um pequeno passo por vez, com explicação detalhada de onde agir, por quê, termos e resultado esperado |
| Iniciante intermediário | Uma pequena etapa por vez, com a mesma explicação detalhada de como fazer, relação entre etapas, prós e contras das opções e como verificar |
| Proficiente | Etapas rotineiras agrupadas, com decisões principais, razões e resultados de validação |
| Experiente | No dia a dia, conclusões, alterações, diferenças e evidências diretas, com menos ensino básico repetido |

Você pode dizer diretamente "a partir de agora use o nível iniciante intermediário" ou "mude meu nível para experiente". Antes de salvar, o local e o escopo reais são explicados; escolhas existentes são preservadas nas atualizações; sem escolha, não há classificação automática. "Seja breve desta vez" afeta só esta explicação. **Todos os níveis ainda explicam em detalhes quando necessário ou ao corrigir um bug, a menos que você diga explicitamente que isso não é necessário para o escopo em questão.**

Os termos necessários são explicados na primeira aparição, com uma comparação no contexto da tarefa entre "termo original / linguagem simples / significado concreto". Linguagem simples e nível de orientação são independentes da personalidade Soul e do refinamento de texto; sair de um desses modos não apaga sua escolha. As regras e exemplos completos estão em [comunicação e orientação compartilhadas](skills/consult-tavernweave-library/references/communication-and-guidance.md).

## Formas opcionais de expressão e colaboração

Versão de orientação carinhosa:

```text
Atong, me ajude!
```

Versão de estudo rígida:

```text
MTTT.sir, me cobre!
```

Versão ovo de páscoa de revisão de front-end:

```text
Matador de Almas！
```

Para fechar o projeto geral e a primeira versão a partir de um desejo:

```text
Modo brainstorm
```

Para fazer as três lentes Soul participarem juntas do brainstorm:

```text
Modo brainstorm, com as três lentes Soul
```

Para executar a primeira versão congelada após a confirmação do projeto:

```text
Execute a primeira versão conforme o blueprint
```

Para revalidar toda a trajetória de crescimento Vibe Code a partir das evidências atuais:

```text
Espelho
```

Para gerar apenas um formulário de avaliação textual completo, copiável e salvável:

```text
Espelho, quero apenas o formulário de avaliação em texto, sem o quadro
```

Para sair da camada de personalidade:

```text
Soul, volte ao lugar
```

O Soul continua sendo uma camada portátil no nível da tarefa. Atong e MTTT.sir são duas projeções de ensino do método público MTTT; Matador de Almas revisa o front-end como um ovo de páscoa não oficial de Johnny Silverhand — pode ser sarcástico, mas precisa apresentar evidências e propor correções. A reunião dos três assentos é apenas três lentes marcadas do mesmo agente, compartilhando fatos, permissões, no máximo 1–2 decisões necessárias por rodada (no total, até 4) e o mesmo registro de fechamento; não são três modelos independentes. Ela não ganha automaticamente o histórico do ChatGPT nem RAG privado, não persiste permanentemente entre novas tarefas e não amplia permissões de arquivo, Git, rede, publicação ou produção.

## Refinamento de texto e revisão completa/de arquitetura · v1.4.0

Diga "refine este trecho", "tire o tom de IA" ou "tire o clichê" para receber diretamente uma versão refinada que preserva o sentido original. O padrão é uma leve polimento, mas você pode pedir reestruturação ou reescrita profunda; conteúdo técnico como configuração de personagem, números, código, macros e variáveis mantém as restrições originais.

| Uso | Ativar | Desativar |
| --- | --- | --- |
| Única vez | Refine este trecho... | Termina após a entrega |
| Persistente na tarefa atual | Ativar modo de refinamento contínuo | Sair do modo de refinamento |
| Persistente no workspace | Ativar modo de refinamento neste workspace | Desativar modo de refinamento do workspace |
| Persistente no cliente | Ativar modo de refinamento globalmente para este cliente | Desativar modo de refinamento global do cliente |

O modo contínuo cobre texto criado, textos externos, explicações cotidianas, planos e relatórios de revisão; preserva citações, código, modelos obrigatórios e evidências. Modos persistentes mostram primeiro os arquivos de regras reais e as diferenças, e só gravam em um bloco separado após a concordância do responsável. Instalar/atualizar a TW não ativa isso automaticamente. Sair da tarefa afeta só a tarefa atual; "ver estado do modo de refinamento" distingue os escopos e as evidências de carregamento do host.

A "revisão completa" olha todo o escopo acordado; a "revisão de arquitetura" acompanha responsabilidades, dependências, estados e caminhos críticos; a "revisão completa de arquitetura" combina as duas. Vale para software e cartões de personagem. O relatório registra o que foi verificado, parcialmente verificado, não lido e excluído, e entrega todas as descobertas com evidências. Também é possível dizer "Matador de Almas，revisão completa de arquitetura", mantendo o estilo Soul; o resumo tem no máximo três itens e o relatório completo não é cortado. A revisão entrega primeiro resultados somente leitura.

## Entrada em cinco camadas

```text
Host Front Door（entrada local opcional）
  -> Soul（Atong / MTTT.sir / Matador de Almas / três lentes, opcional）
    -> Orquestração de brainstorm（projeto geral + First Playable + blueprint/conjunto de blueprints，opcional）
      -> Library（A0 + guia ST + design/animação + Wiki de origem + página de escolha）
        -> Skills de engenharia distribuídos pelo manifesto da máquina（criação, componentes, API, UI, depuração, verificação de crescimento, build, validação etc.）
```

- **Host Front Door (entrada local opcional)** conecta linguagem simples contínua, roteamento de tarefas e regras de colaboração ao cliente local; na instalação do plugin do Claude Code, é injetado automaticamente pelo hook SessionStart, alternando com um bloco em `CLAUDE.md` (ver [plugin do Claude Code](#plugin-do-claude-code)). O nível do usuário é salvo separadamente e preservado ao atualizar a entrada; correspondência de arquivos e carregamento real pelo cliente são verificados separadamente.
- **Soul (personalidade opcional)** altera o tom e a forma de ensinar dentro do nível de orientação escolhido pelo usuário, sem alterar fatos, permissões ou resultados de validação.
- **A orquestração de brainstorm** controla o número de rodadas de direção, decisões de quatro estados, limites da primeira versão e o tamanho do blueprint; nenhuma etapa ativa pode proliferar recursivamente sem base. Problemas reais podem ser divididos temporariamente, mas após resolver ou confirmar o bloqueio, o ramal deve ser fechado e o fluxo volta à etapa pai.
- **A Library** é distribuída como um todo e lida sob demanda; instalar uma vez não significa carregar a biblioteca inteira a cada rodada.
- **Os Skills de engenharia** continuam com o trabalho real. Personalidade e materiais não substituem a autoridade do runtime de destino.

## Conjunto de Skills

| Skill | Responsabilidade principal |
| --- | --- |
| `activate-tavernweave-soul` | Ativa, alterna ou desativa os modos Atong / MTTT.sir / Matador de Almas no nível da tarefa; Johnny é a personalidade de ovo de páscoa para revisão de front-end e não salva RAG privado |
| `build-work-library` | Organiza novelas, materiais originais e de fãs, referências textuais e visuais da internet; busca por origem, filtro por versão/estágio, edição manual, continuação em lotes, Markdown＋JSONL e exportação SQLite |
| `consult-tavernweave-library` | Roteamento obrigatório para A0, os 31 guias oficiais ST e o guia experimental C8, e consulta sob demanda de 462 itens de design, 194 de animação, 86 conceitos, 1.609 entradas de ledger destilado e páginas de escolha offline |
| `orchestrate-project-blueprint` | Fecha o desejo de um cartão ou de Vibe Code comum em projeto geral, First Playable, conjunto de blueprints em níveis, NEXT e portas de execução anti-recursão; pode convocar a reunião dos três assentos Soul; quadro de progresso do projeto, percentuais e registro de feedback, e sincronização projeto geral/NEXT |
| `reflect-on-vibe-code-growth` | Reavalia toda a rede de capacidades Vibe Code a partir do Codex/Chat/projeto atual e das evidências entregues, gerando um formulário de avaliação textual completo e copiável à parte e um relatório interativo de sete capítulos, comparando com escalas comparáveis marcos históricos imutáveis e mantendo um histórico local append-only anonimizado |
| `worldbook-design-and-writing` | Planeja, divide, mescla, revisa e refina livros-mundo de forma isolada; escolhe em conjunto entre caminhos nativos, de modelo ou mistos locais, preservando semântica e limites de conhecimento; API precisa e validação em execução ficam com capacidades especializadas |
| `tavern-card-builder` | Identifica o tipo de cartão e as dependências, mantém a autoridade de criação, a cadeia de origens dos materiais, o livro-mundo, MVU, CoT, a abertura e os limites da arquitetura de memória |
| `sillytavern-card-components` | Divisão de cartões sem perdas, limites de componentes, registry/receitas e consistência de ida e volta |
| `sillytavern-component-update` | Atualização por componente, artefatos de teste importáveis e entrega ao pipeline do cartão inteiro, impedindo reempacotamento silencioso |
| `sillytavern-render-regex-pipeline` | Valida com fixtures a semântica de regex, placement, exibição/prompt, profundidade e estágio |
| `sillytavern-rolecard-security` | Verificação somente leitura de injeção, execução dinâmica, formato de credenciais, carregamento remoto e riscos de permissão entre frames |
| `sillytavern-database-rolecards` | Estrutura de tabelas, mensagens em camadas, vinculação e migrações idempotentes; compatibilidade de mesmo nível do C8 continua experimental |
| `sillytavern-extension-dev` | scaffolding mínimo de extensão UI, manifest, ciclo de vida, snapshot de capacidades e porta de versão |
| `sillytavern-rolecard-performance` | Orçamento anonimizado, regressões e amostragem de runtime real nomeada |
| `sillytavern-media-live2d-runtime` | Mídia, áudio, Live2D, pré-carregamento, provedores, fallback e limpeza |
| `sillytavern-card-pipeline` | Pré-verificação de dependências, adaptação para desenvolvimento ao vivo, montagem, JSON/PNG, sincronização do livro-mundo e porta de publicação |
| `sillytavern-api-reference` | Verificação de APIs sensíveis à versão de ST, Tavern Helper, STScript, EJS, macros e MVU |
| `sillytavern-runtime-debug` | Rastreia iframe, console, DOM, estilos, dados e ciclo de vida no SillyTavern real |
| `sillytavern-embedded-ui` | Página de abertura, barra de estado, centro de controle, gavetas, janelas flutuantes e interação mobile; especificações para montar sandboxes opcionais por obra, simulação conjunta, comparação de estados e ajuste de sliders |
| `code-quality-workflow` | Revisão completa/de arquitetura, registro de cobertura, descobertas completas, portas, correções mínimas, regressões e Finish Mode |
| `rewrite-natural-prose` | Refinamento de texto preservando sentido e estrutura técnica, com modos de única vez, persistente na tarefa e persistente no workspace/cliente com autorização separada |
| `shadcn-tailwind-ui` | Construção de interfaces de produto acessíveis com React, shadcn/ui, Radix e Tailwind |
| `rolecard-workshop-ops` | Diagnóstico e operação de cadeias de publicação configuráveis, protegendo coordenadas e credenciais de produção |

## Fronteira pública da Library

Uma instalação traz ao mesmo tempo:

- A lista de verificação geral A0, comopré-requisito permanente para tarefas de escrita;
- Os 31 guias oficiais do STDB e 1 guia C8 explicitamente marcado como experimental;
- 462 itens de design, 194 itens de animação, 86 índices de conceito e 1.609 entradas de ledger destilado, após a triagem de 243/243 rotas pelo AFV;
- 86 conceitos/Wiki locais diretamente relacionados, 89 sandboxes técnicas locais próprias e uma página unificada de escolha offline;
- Manifesto SHA-256 com origem, licença, contagem de anonimização e nível de arquivo.

Explicitamente não são distribuídos: o modelo-mestre do responsável A1, o antigo B1 imperativo, arquivos de processo, evidências locais, AFV raw/caixa de entrada, os 243 JSONs de triagem de origem, RAG privado, logs, credenciais e domínios de conhecimento sem relação; mantemos apenas recibos agregados de triagem sem texto privado. "Adicionar aos candidatos" na página de escolha significa apenas `proposed`, e não adoção, instalação, aprovação de licença ou validação real na taverna.

A página de escolha offline fica no diretório de instalação:

```text
skills/consult-tavernweave-library/assets/picker/index.html
```

## Criação, continuidade e validação

Projetos longos usam Markdown + YAML front matter + blocos estruturados restritos para manter uma única autoridade de criação. Confirmações, candidatos, pendências, vetos, implementação, evidência automática, evidência real do host e aceitação do responsável não podem ser misturados. Quando o usuário diz "continue", primeiro restauramos a autoridade, o Git/working tree, os artefatos e a próxima porta, sem revisitar configurações congeladas.

As evidências são registradas por camada:

```text
Código-fonte -> testes automatizados -> artefato offline -> navegador/desktop -> SillyTavern real -> aceitação manual -> autorização de publicação
```

Nenhuma camada pode passar pela seguinte; automação nunca pode gravar `driver-accepted` por conta própria.

## Tutorial passo a passo

Na primeira vez com a TavernWeave, ou para aprender a comandar o agente em criação de cartões, depuração e validação, leia: [Tutorial TavernWeave · introdução à criação de cartões com Vibe Code](https://liarmttt.github.io/TavernWeave/).

## Instalação e atualização

Usuários Codex podem ver primeiro [uso e instalação específicos para Codex](docs/codex-skills.md): a página distingue os locais de descoberta de plugins e Skills independentes e oferece uma entrada Python de instalação/verificação sem PowerShell (por padrão, pré-visualização somente leitura; só grava após aplicação explícita).

As etapas a seguir são para **instalação local** no Codex ou Claude Code. Para ativação e uso do plugin na conta dots, veja o [guia do plugin unificado](docs/plugin-guide.md); a instalação local não sincroniza automaticamente com a nuvem. O instalador deve usar como fonte o manifesto completo de `skills/` do repositório, criando diretórios ausentes, e não apenas sobrescrever Skills já existentes na máquina. Host Front Door é um reforço local opcional; antes de instalar, veja o arquivo de regras de destino e as diferenças:

```text
Instale e habilite este repositório de Skills por completo:
https://github.com/LiarMTTT/TavernWeave

Não sobrescreva apenas as Skills já existentes nesta máquina. Use o diretório skills/ completo do repositório como referência; após a instalação, confira a quantidade total pela lista da máquina (2.3.0: 23/23; 1.9.1 publicada: 22/22) e confirme separadamente a presença de worldbook-design-and-writing, build-work-library, activate-tavernweave-soul, consult-tavernweave-library, orchestrate-project-blueprint, reflect-on-vibe-code-growth, rewrite-natural-prose e da página de seleção offline da Library.

Detecte se estou usando Codex ou Claude Code, explique que o TavernWeave Host Front Door é um aprimoramento local opcional; mostre primeiro os caminhos de destino, os blocos controlados e o diff e só instale depois da minha confirmação. Não altere regras de usuário fora dos blocos controlados.
```

Atualização:

```text
Atualize a TavernWeave instalada por completo para a versão mais recente deste repositório:
https://github.com/LiarMTTT/TavernWeave

A atualização precisa comparar “quais diretórios o repositório deveria ter” com “quais estão realmente instalados”, criar as Skills novas e não apenas modificar as antigas; verifique também se a Host Front Door está ausente, desatualizada ou com divergência, e apresente explicitamente as três opções “atualizar a front door / ver o diff primeiro / atualizar apenas as Skills”. Ao concluir, devolva dois comprovantes e crie uma nova tarefa para validar a descoberta pelo host local. A importação na conta dots deve ser verificada separadamente conforme o guia do plugin.
```

Se o host ou o agente usa o modo de instalação portátil de "copiar cada Skill para um diretório de projeto", execute na raiz do repositório:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<raiz real de Skills>'
```

Para tratar a front door global durante a instalação, escolha explicitamente o host e deixe o script perguntar:

```powershell
# Codex：o destino padrão é $CODEX_HOME\AGENTS.md；se não definido, ~/.codex/AGENTS.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<raiz real de Skills>' -AgentHost Codex -HostFrontDoorAction Prompt

# Claude Code：o destino padrão é ~/.claude/CLAUDE.md
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-tavernweave.ps1 -TargetSkillRoot '<raiz real de Skills>' -AgentHost Claude -HostFrontDoorAction Prompt
```

A instalação mantém apenas o bloco de comentário versionado `tavernweave-host-front-door`; arquivos existentes recebem primeiro um backup, instalações repetidas são idempotentes, e marcadores duplicados/incorretos e caminhos de link são rejeitados. Para pré-visualizar ou instalar separadamente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Preview
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\manage-host-front-door.ps1 -AgentHost Codex -Action Install
```

Modificar regras globais é uma porta de execução separada; o agente não pode gravar silenciosamente só porque algo foi "recomendado". Codex/Claude precisam criar uma nova tarefa ou reiniciar para redescobrir; o recibo da front door também não pode fingir que o Skill Soul foi realmente invocado.

Depois de instalar ou atualizar, a verificação deve ser executada nos **locais de varredura reais**, não apenas no repositório de código. O verificador recusa, por padrão, usar o próprio diretório de código da TavernWeave como destino de instalação:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify-install.ps1 -TargetRoot '<raiz real do plugin ou raiz de Skills>'
```

O número de Skills no recibo aprovado deve corresponder ao manifesto de instalação da fonte usada. O exemplo abaixo usa o código de 23 Skills da 2.3.0; o pacote original publicado da 1.9.1 ainda é 22/22:

```text
INSTALLATION VERIFIED: 23/23
Library: present-and-matched
Library picker: present
Soul: present-and-matched
Host rediscovery: required-new-task
```

Se a verificação também receber o host e o arquivo de regras, o recibo mostra ainda `Host Front Door: current|missing-block|outdated|drifted`; é um status recomendado e não altera o julgamento da integridade dos arquivos de Skills conforme o manifesto da máquina.

Skills pessoais sem relação no diretório de destino são preservadas; os diretórios oficiais da TavernWeave no manifesto devem corresponder arquivo a arquivo ao código atual. O último nível do destino de gravação deve ser chamado explicitamente `skills`; o script de instalação recusa raízes de unidade, raízes de usuário, destinos dentro do repositório de código e links de diretório, e reverte Skills oficiais existentes se a substituição falhar.

Após a verificação completa da versão correspondente, crie uma nova tarefa ou reinicie a sessão para que o host local redescubra os Skills. Na nova tarefa ainda é preciso invocar de fato o design e escrita de livros-mundo, Soul, orquestração de brainstorm, Espelho e Library; o recibo de instalação não pode substituir a descoberta pelo host. O pacote de plugins v2.4.0, `TavernWeave-DSH-v2.4.0.tgz` (DeepSeek Harness) e os arquivos de verificação SHA-256 estão na [página oficial de lançamento](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0).

Mantenedores que desejam apenas verificar a árvore de código antes de publicar podem usar explicitamente `-AllowSourceTree`; essa opção não serve para o recibo de instalação de usuários comuns.

## Plugin Antigravity / AGY

Usuários Antigravity / AGY devem ver primeiro [build, instalação e verificação do plugin nativo](host-adapters/antigravity/README.md). O pacote reutiliza os 23 Skills, carrega a front door por regras persistentes e traz adaptações para o agente AGY e para a persistência de configurações; validação estrita e testes no cliente são registrados separadamente. A conversão de importação do plugin Claude na raiz do repositório não é o caminho de instalação do pacote nativo AGY.

## Plugin do Claude Code

Desde a 2.2.0, o próprio repositório é um marketplace de plugins do Claude Code (`.claude-plugin/`). No Claude Code, execute:

```text
/plugin marketplace add LiarMTTT/TavernWeave
/plugin install tavernweave-agent-skills@tavernweave
```

O plugin tem quatro partes; as três primeiras correspondem um a um ao pacote DSH:

| Componente | Arquivo | Correspondência DSH |
| --- | --- | --- |
| 23 Skills, com nomes prefixados por `tavernweave-agent-skills:` | `skills/` | provedor de Skills |
| Injeção automática do Host Front Door: a cada início de sessão, a front door é adicionada como contexto da sessão (requer `node` no PATH) | [`hooks/hooks.json`](hooks/hooks.json), [`hooks/session-start-front-door.mjs`](hooks/session-start-front-door.mjs) | seção de system prompt |
| Agente `tavernweave`: persona exclusiva da TW, com conjunto de ferramentas igualmente enxuto (sem rede e sem subagentes) | [`agents/tavernweave.md`](agents/tavernweave.md) | predefinição `TavernWeave X DSH` |
| Alternância de modo Soul: uma linha `Soul Atong ▸` acima da caixa de entrada, que ao expandir permite escolher o modo e apenas preenche a instrução correspondente na caixa, para você enviar | [`hooks/soul-switch.tsx`](hooks/soul-switch.tsx) (`modules` em `hooks/hooks.json`) | mini janela flutuante Soul do Hand of God (no CC, só este elemento de interface é mantido) |

O agente `tavernweave` pode iniciar a sessão principal: `claude --agent tavernweave-agent-skills:tavernweave`; ou você pode pedir ao Claude em uma sessão comum para entregar tarefas da TW a ele. Se você copiou os Skills para `~/.claude/skills`, pode remover essa cópia ao migrar para o plugin, evitando Skills duplicados com o mesmo nome.

A alternância de modo Soul usa a interface de function hooks de plugins do Claude Code (marcada oficialmente como early access). Ela e o hook da front door estão no mesmo `hooks/hooks.json`, e foi confirmado que ambos carregam no Claude Code 2.1.299; não foi verificado se versões anteriores ignoram o campo `modules`. A alternância registra apenas a instrução Soul que você realmente enviou, não confirma que o Soul foi ativado; ela nunca envia mensagens por você. Testes de interface são executados com `claude plugin test .`.

### Eliminando duplicação com o bloco do CLAUDE.md

A front door precisa existir em apenas um lugar. Na inicialização, o hook verifica os arquivos de instrução que serão carregados nesta sessão: `$CLAUDE_CONFIG_DIR/CLAUDE.md` (ou `~/.claude/CLAUDE.md`, se não definido) e `CLAUDE.md`, `.claude/CLAUDE.md` e `CLAUDE.local.md` em cada nível do diretório atual até a raiz. O bloco controlado nesses arquivos tem prioridade:

| Situação | Comportamento do hook |
| --- | --- |
| Nenhum desses arquivos tem um bloco `tavernweave-host-front-door` | Injeta a front door incluída no plugin |
| Já existe um bloco da mesma versão | Não injeta; o bloco do arquivo prevalece |
| Já existe um bloco de outra versão | Não injeta a front door, apenas acrescenta um aviso de divergência de versão; o bloco do arquivo continua valendo |
| Variável de ambiente `TAVERNWEAVE_FRONT_DOOR=off` | Não injeta nada |

- Usuários que instalaram pelo marketplace de plugins não precisam usar `manage-host-front-door.ps1` para gravar no `CLAUDE.md`. Se já gravaram e querem passar a ter o blocos atualizado pelo plugin, execute `manage-host-front-door.ps1 -AgentHost Claude -Action Remove` (o script faz backup primeiro).
- Usuários que instalaram por ZIP ou copiando `skills/` não têm esse hook e devem continuar gravando no `CLAUDE.md` como descrito acima.
- O nível de orientação (bloco `tavernweave-guidance-preference`) não é afetado e continua salvo separadamente no `CLAUDE.md`.

Status de validação: a estrutura dos hooks, do agente e da alternância Soul, as regras de eliminação de duplicação, o formato de saída e a consistência das instruções são verificados offline por [`tests/claude-plugin.test.mjs`](tests/claude-plugin.test.mjs); o comportamento de interface da alternância Soul é verificado por [`hooks/soul-switch.test.tsx`](hooks/soul-switch.test.tsx) nas superfícies de terminal e desktop; a injeção real em uma nova sessão do Claude Code, a inicialização com `--agent` e a invocação por subagente ainda não foram validadas em máquina real (ver `claudePlugin.hostLoading` no manifesto de instalação).

## DeepSeek Harness

Desde a 2.1.0, o DSH é instalado por um pacote de plugin separado, **não** copie `skills/` para `.agents/skills`, e não é necessário escrever `AGENTS.md`:

1. Baixe `TavernWeave-DSH-v2.4.0.tgz` na [página de lançamento v2.4.0](https://github.com/LiarMTTT/TavernWeave/releases/tag/v2.4.0); ou execute `node scripts/build-dsh-plugin.mjs` na árvore de código para gerar localmente o pacote `TavernWeave-DSH-v2.4.0.tgz`;
2. DSH Desktop: barra lateral **Plugins → Adicionar plugin → Instalar plugin de terceiros → caminho local/tarball**, e habilite o bundle após a instalação;
3. Crie uma nova tarefa e selecione **TavernWeave X DSH** no preset do agente.

Perfis CLI/Web usam `dsh plugin --profile <perfil> add <caminho local|tarball|endereço git|nome do pacote>`; o perfil `desktop` é gerenciado pelo shell do Desktop e não deve ser chamado diretamente pela CLI.

O pacote de plugin traz diretamente os 23 Skills e o Host Front Door (injetado como seção de system prompt); instalação, atualização e desinstalação passam pelo mecanismo de plugins do DSH. Composição detalhada, contrato de máquina e portas de runtime estão em [host-adapters/dsh/README.md](host-adapters/dsh/README.md). O DSH ainda está em Developer Preview. A 2.1.0 concluiu a validação em máquina real no DSH Desktop `0.2.1-rc.2` da página de plugins, seleção de preset, diretório de 23 Skills, Front Door, Soul e terminal com permissão total; efeito do modelo, Linux/WSL e taverna real continuam como itens de validação separados. Workspaces com ponto de reanálise do OneDrive precisam mudar para permissão total ou usar um diretório comum sob workspace-write (ver contrato `knownEnvironmentIssues`).
