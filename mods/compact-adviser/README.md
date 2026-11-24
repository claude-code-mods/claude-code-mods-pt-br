<h1 align="center">compact-adviser</h1>

<p align="center">
  <a href="https://github.com/kunchenguid/compact-adviser/blob/main/LICENSE"
    ><img
      alt="License"
      src="https://img.shields.io/badge/license-MIT-green?style=flat-square"
  /></a>
  <a
    href="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue?style=flat-square"
    ><img
      alt="Platform"
      src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue?style=flat-square"
  /></a>
  <a href="https://x.com/kunchenguid"
    ><img
      alt="X"
      src="https://img.shields.io/badge/X-@kunchenguid-black?style=flat-square"
  /></a>
  <a href="https://discord.gg/Wsy2NpnZDu"
    ><img
      alt="Discord"
      src="https://img.shields.io/discord/1439901831038763092?style=flat-square&label=discord"
  /></a>
</p>

**compact-adviser** é um plugin de agente que responde a uma única pergunta: devo usar /compact agora?

![Linha de status do compact adviser: "Compact adviser: o trabalho parece concluído ou registrado. Execute /compact para economizar tokens." exibida acima do prompt de um terminal](https://raw.githubusercontent.com/kunchenguid/compact-adviser/main/docs/hint-status-line.png)

Ele usa o [Jev](https://typesafe.ai) para julgar instantaneamente se a sessão atual está provavelmente em um ponto seguro para compactar.

Ele pode dar uma dica para executar `/compact` — ou, no Pi e no Claude Code, se você optar por isso, pode executá-lo automaticamente no momento certo. A Codex CLI e o Grok são apenas de dica: nada fora de suas sessões pode disparar `/compact`.

O julgamento é feito por duas perguntas curtas ao Jev em uma única requisição (a unidade está concluída? é trabalho prático ou coordenação?), compostas em código em uma única pontuação. O piso da dica é 0,90 enquanto o contexto está quase vazio (até cerca de 10%) e relaxa até 0,50 perto de 90% de ocupação — uma dica errada custa mais quando ainda há espaço. "Cheio" significa o ponto em que o host compacta: no Claude Code é o limite de compactação automática quando habilitada; nos outros, a janela do modelo. Se você prefere compactar bem antes disso (contextos longos custam mais a cada turno), defina um orçamento de contexto: o piso então relaxa conforme o contexto se aproxima do menor valor entre seu orçamento e aquele ponto. O modo automático é o mesmo critério, mais uma confirmação no primeiro uso.

## Início rápido

Pré-requisitos: Node 22+ (22.18+ para Codex e Grok) e um destes: [Pi](https://pi.dev) 0.82.0 ou mais recente (verificado na **0.85.1**), Claude Code 2.1.274 ou mais recente (verificado na **2.1.275**), Codex CLI 0.153.0 ou mais recente (verificada na **0.153.4**), ou [Grok Build](https://docs.x.ai/build/overview) 1.0.34 ou mais recente (verificado na **1.0.34**), além de uma [chave de API da TypeSafe](https://console.typesafe.ai/settings/keys). Forneça-a como `TYPESAFE_API_KEY` no ambiente de inicialização ou coloque-a no `./.env` do diretório da sessão; Pi e Claude Code também podem salvá-la pelas configurações, enquanto Codex e Grok contam com uma CLI externa do compact-adviser. Jev é o modelo de decisão estruturada da TypeSafe; este pacote faz a ele duas perguntas curtas de classificação e nunca pede que ele escreva um resumo.

Instalar o pacote é consentir em enviar o contexto elegível de checkpoint à TypeSafe quando houver uma chave e os demais critérios dos produtos passarem. Com `TYPESAFE_BASE` definido, esse contexto e a chave vão para essa base em vez disso.

### Pi

```sh
pi install npm:compact-adviser
```

Reinicie o Pi ou execute `/reload` e depois `/compact-adviser`.
`/compact-adviser status` deve dizer `Key: env`, `Key: saved` ou `Key: .env`.

Para instalar pelo git: `pi install git:github.com/kunchenguid/compact-adviser` (use `-l` para instalação local ao projeto).

### Claude Code

Este plugin usa o Claude Mod, um recurso experimental que exige `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` no seu ambiente.

```sh
claude plugin marketplace add kunchenguid/compact-adviser
claude plugin install compact-adviser@compact-adviser
CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude
```

Depois, `/compact-adviser`.

### Codex CLI

O suporte ao Codex é **somente para macOS e Linux**. Os hooks do plugin rodam por `sh` POSIX, de acordo com o selo de plataforma deste repositório; o Windows não é suportado nesta entrega.

```sh
codex plugin marketplace add kunchenguid/compact-adviser
codex plugin add compact-adviser@compact-adviser
```

Reinicie o Codex e revise o hook em `/hooks` uma vez, para que ele seja confiável. Após um checkpoint concluído, o conselho aparece como uma linha `↳ Hook · Compact adviser: ...` abaixo da resposta.

O Codex é **apenas de dica**: não há superfície que permita a outro processo executar `/compact`, então não há modo automático. As configurações ficam em uma pequena CLI em vez de um comando slash; peça ao Codex por "compact-adviser status" e a skill incluída a executa, ou execute-a você mesmo:

```sh
node "$(ls -d "${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/compact-adviser/*/ | tail -1)src/cli.ts" status
```

### Grok Build

O Grok é **apenas de dica**: nada fora de uma sessão em execução pode disparar `/compact`, então não há modo automático aqui. A dica é pintada na linha de status e nunca entra no contexto do modelo.

```sh
grok plugin install kunchenguid/compact-adviser#packages/grok-plugin --trust
```

(Instale pelo subdiretório, não pela raiz do repositório: o Grok também lê o índice de marketplace do Claude neste repositório, então um `grok plugin marketplace add` simples oferece dois plugins de mesmo nome e se recusa a instalar sem qualificação.)

Depois há duas etapas únicas, pois o Grok não deixa um plugin fazê-las por você. Inicie o Grok e execute:

```
/compact-adviser-install
```

Isso grava `${GROK_HOME:-~/.grok}/hooks/compact-adviser.json`, porque **o Grok 1.0.34 lista o `hooks/hooks.json` de um plugin, mas nunca o carrega em uma sessão**. Hooks no seu próprio home do Grok são sempre confiáveis, então nada mais é necessário; exclua esse arquivo para removê-los. Pelo shell, o comando é `node "$(node -e 'const l=JSON.parse(require("child_process").execFileSync("grok",["plugin","list","--json"],{encoding:"utf8"})); const p=(Array.isArray(l)?l:[]).find(x=>x&&x.name==="compact-adviser"); if(!p||typeof p.path!=="string") throw new Error("compact-adviser is not installed"); process.stdout.write(p.path)')/bin/adviser.ts" install`. Após `install`, `${GROK_HOME:-~/.grok}/compact-adviser/adviser.sh` resolve o plugin instalado no momento da mesma forma.

Depois cole o bloco `[ui.status_line]` que o `install` imprimiu no caminho config.toml que ele indicou e reinicie o Grok. A linha de status vem desligada por padrão, e só a sua própria configuração pode ligá-la — um plugin não pode, e nem um repositório. O Grok tem uma única linha de status, então este script também pinta os segmentos embutidos (`cwd`, `model`, `context`). O modo de renderização mínima não tem linha de status alguma.

No Grok, salve a chave da TypeSafe como `TYPESAFE_API_KEY`, em um `.env` do cwd, ou com o comando `key` da CLI em um shell fora do Grok. Não digite segredos depois de um comando slash do Grok; o Grok acrescenta essas palavras ao modelo.

## Se ele não fizer nada

| Sintoma | Causa |
| --- | --- |
| A TypeSafe exige pagamento (HTTP 402) | Verifique a cobrança e os créditos da conta TypeSafe; esperar sozinho não resolve uma exigência de pagamento. O contexto permanece inalterado. |
| `Key: missing` em `/compact-adviser status` (Pi, Claude Code) ou `/compact-adviser` (Grok) | Não há `TYPESAFE_API_KEY` no ambiente de inicialização, nas configurações salvas ou no `./.env` da sessão |
| Nenhum comando `/compact-adviser` no Claude Code | `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` não é exatamente `1` |
| Comando existe, sem dica | O contexto está abaixo do mínimo fixo de 40.000 tokens, a sessão não está ociosa, ou o último turno não foi uma resposta final definida |
| Claude Code: "tráfego não essencial" | `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` bloqueia requisições de rede do plugin |
| Sem dica no Codex | O hook não é confiável (revise em `/hooks`), o Node é mais antigo que 22.18, ou o hook não encontra o Node — o Codex reconstrói seu PATH, então defina `COMPACT_ADVISER_NODE` com um caminho absoluto para `node` |
| Grok: nenhuma linha de dica | `[ui.status_line]` não está definido no `config.toml` indicado pelo `install`, ou o Grok está em modo de renderização mínima |
| Grok: sem dica após um turno concluído | `/compact-adviser-install` não foi executado, então nenhum hook Stop está julgando |
| Pi print / RPC / JSON, Claude `-p` ou `codex exec` | O adviser fica inerte em sessões não interativas detectadas de forma confiável |
| Nada, em nenhum host | `COMPACT_ADVISER_DISABLE` está com um valor verdadeiro |

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `TYPESAFE_API_KEY` | A chave do Jev; uma chave salva ou o `./.env` da sessão é usada quando indefinida |
| `TYPESAFE_BASE` | Substitui a URL base da API TypeSafe, `https://api.typesafe.ai` por padrão; a requisição vai para `<base>/v1/systemone` sem barra final. Lida apenas do ambiente de inicialização, nunca de configuração salva ou `./.env`. Precisa ser uma URL `https`; `http` simples só é aceito para um host loopback (`127.0.0.1`, `[::1]`, `localhost`). Qualquer outro valor, ou um que traga credenciais, query ou fragmento, é erro de configuração: sem requisição e sem conselho |
| `COMPACT_ADVISER_DISABLE` | `1`, `true`, `yes` ou `on` (em qualquer caixa) deixa a sessão inerte: sem requisição à TypeSafe, sem dica, sem compactação automática, sem comando. Tem prioridade sobre um modo `hint` ou `auto` salvo |
| `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` | Apenas Claude Code; precisa ser exatamente `1` para o mod carregar |
| `COMPACT_ADVISER_NODE` | Apenas Codex; caminho absoluto para um executável Node 22.18 ou mais recente quando o hook não encontra um em seu PATH reconstruído |

Exporte `COMPACT_ADVISER_DISABLE=1` para sessões de agente sem supervisão, em que ninguém vai ler o conselho.

## O que é enviado à TypeSafe

| Incluído | Não enviado |
| --- | --- |
| Restrições limitadas do usuário, até as últimas 64 respostas e resultados de ferramentas visíveis (cortados), trechos curtos de resultados de ferramentas, um resumo existente, nomes de artefatos salvos, marcadores de omissão | Prompts de sistema, raciocínio oculto, imagens, variáveis de ambiente, a chave de API no contexto do modelo e no corpo da requisição, transcrições completas |
| Tentativa de redação de padrões conhecidos de chaves e de resultados óbvios de arquivos sensíveis | Uma garantia. Desinstale ou defina o modo Off para material que não deve sair da máquina |

As requisições vão para `https://api.typesafe.ai/v1/systemone`, ou `<TYPESAFE_BASE>/v1/systemone` quando definido, têm limite de 32.000 bytes UTF-8 serializados e nunca tratam um erro como julgamento afirmativo.
A chave de API da TypeSafe nunca entra no contexto do modelo nem no corpo da requisição; ela é enviada como cabeçalho Authorization para autenticar a chamada.
Detalhes: [SECURITY.md](https://github.com/kunchenguid/compact-adviser/blob/main/SECURITY.md).

## Como funciona

```
turno definido
      │
      ▼
┌───────────────────┐
│ portões locais baratos │  modo, mínimo de 40k, sessão ociosa, chave, resfriamentos
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ TypeSafe Jev      │  pontuação concluído × formato, piso desliza 0,90→0,50 com o uso
└─────────┬─────────┘
          ▼
 dica: execute /compact     ou, com auto explícito, compactação nativa
```

A compactação automática está disponível no Pi e no Claude Code. No Codex, o mesmo julgamento só produz a dica, como uma linha `↳ Hook ·` no histórico. No Grok, as duas metades são processos separados: um hook `Stop` julga e registra um veredito, e o script `[ui.status_line]` lê esse veredito e pinta a dica. O hook do Grok sempre permite a parada e não imprime nada, então a dica nunca pode voltar para o modelo.

No Claude Code, uma configuração opcional `beforeCompactPrompt` (vazia por padrão; defina em `/config`) executa um turno antes dessa compactação automática, e só após o modo auto ser confirmado. Defina-a como `/stow` para executar o comando `stow` antes. O Claude Code não expande comandos slash nem menções `@file` em um prompt enviado por plugin, e rejeita um prompt de plugin que começa com `/`, então um valor que começa com `/` é executado como comando em vez de enviado ao modelo como texto. Se você enviar seu próprio prompt ou executar um comando nesse meio tempo, ou se o turno for interrompido, der erro ou não terminar em 5 minutos, nada é compactado. Modo dica, desligado e configuração vazia permanecem iguais. Pi, Codex e Grok não têm essa configuração.

## Uso

| Comando | Efeito |
| --- | --- |
| `/compact-adviser` (Pi e Claude Code) | Configurações (modo, mínimo, log de requisições, chave de API da TypeSafe) |
| `/compact-adviser auto` / `hint` / `off` (Pi e Claude Code) | Salva esse modo; auto pede confirmação no primeiro uso |
| `/compact-adviser status` (Pi e Claude Code) | Modo, mínimo, orçamento, contexto, origem da chave (`env` / `saved` / `.env` / `missing`), resfriamento |
| `/compact-adviser threshold 60000` (Pi e Claude Code) | Salva um mínimo absoluto de tokens |
| `/compact-adviser budget 450000` / `budget off` (Pi e Claude Code) | Salva um orçamento de contexto: o piso da dica relaxa totalmente nessa quantidade de tokens, ou no ponto de compactação do host se for menor (desligado por padrão) |
| `/compact-adviser snooze` / `dismiss` (Pi e Claude Code) | Suprime as próximas três trocas, ou limpa a dica atual |
| `beforeCompactPrompt` em `/config` (Claude Code) | Texto opcional executado antes da compactação automática. Vazio por padrão. `/stow` executa esse comando |
| `/compact-adviser` (Grok) | Mostra status; não acrescente argumentos, pois o Grok os envia ao modelo |
| `/compact-adviser-hint` / `/compact-adviser-off` (Grok) | Salva modo apenas de dica, ou desativa o adviser |
| `/compact-adviser-snooze` / `/compact-adviser-dismiss` (Grok) | Suprime as próximas três trocas, ou limpa a dica atual |
| `/compact-adviser-install` (Grok) | Registra os hooks e imprime o bloco de linha de status para colar no `config.toml` indicado |
| `${GROK_HOME:-$HOME/.grok}/compact-adviser/adviser.sh threshold 60000` (shell do Grok) | Salva um mínimo absoluto de tokens; `budget <tokens\|off>` salva um orçamento de contexto; `help` lista as outras configurações exclusivas do shell |

No Codex, os mesmos comandos são argumentos do `src/cli.ts` do plugin (`status`, `hint`, `off`, `threshold`, `budget <tokens|off>`, `log on|off`, `key set|clear|status`) em vez de um comando slash, porque plugins do Codex não podem registrar um comando com código por trás. O Codex não tem snooze nem dismiss: a CLI não sabe qual sessão está atual.

## Perfis de julgamento

Um [perfil de julgamento](https://github.com/kunchenguid/compact-adviser/blob/main/docs/judge-profiles.md) opcional altera as duas perguntas, o peso da pontuação ou a curva do piso sem mudar os padrões entregues. Os quatro hosts aceitam a mesma string JSON limitada na configuração `profile`. Mantenha o modo dica ao avaliar um perfil. Perfis inválidos desativam o conselho, e carregar um perfil nunca concede consentimento para o modo automático.

## Avaliação

A avaliação local do julgamento usa checkpoints reais de sessão para pontuar quando o adviser deve sugerir `/compact`. A curva abaixo vem de um conjunto de referência com atenção a follow-ups (96 checkpoints, 40 sessões): conforme a janela de contexto se enche, o limite da pontuação relaxa de **0,90** (≤10% usado) para **0,50** (≥90% usado), de modo que a **recall aumenta** enquanto a precisão se mantém alta — favorecendo economia de tokens quando a compactação vai ser forçada de qualquer forma.

![Use o Jev para responder "devo usar /compact agora?" — a precisão se mantém alta enquanto a recall aumenta conforme o contexto usado vai de ≤10% a ≥90%](https://raw.githubusercontent.com/kunchenguid/compact-adviser/main/docs/eval-usage-floor-curve.png)

O harness de avaliação de julgamento fica em [packages/pi-extension/eval/](https://github.com/kunchenguid/compact-adviser/blob/main/packages/pi-extension/eval/README.md). Não é um conjunto de dados publicado: aponte-o para suas próprias sessões e mantenha as transcrições localmente.
