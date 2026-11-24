# agentctl — Plano de controle de agentes para uma sessão do Claude Code

Testado com **Claude Code 2.1.288** (headless) e **2.1.289** (interativo, após o host atualizar automaticamente) (`claude plugin validate .`, `claude plugin test .`: 203 testes); 0.2.x re-verificado ao vivo na 2.1.289 (§ Verificado ao vivo, 0.2.x).
A API de mods está marcada como sujeita a mudanças entre releases; as declarações de tipo que o host escreve em
`.claude-plugin/types/` são a autoridade para a versão instalada. Execute `claude plugin validate .`
depois de toda atualização do Claude Code.

Projeto: `docs/features/agent-control-plane-mod/` neste repositório (requisitos, estudo de viabilidade,
especificação técnica, tickets de solicitação). Este diretório não faz parte do plugin sd0x-dev-flow: instalar o
plugin não instala o mod. Para instalá-lo, execute `/agentctl-setup` (ele verifica o host, instala
`agentctl@sd0xdev-marketplace` depois de você aprovar e monta sua primeira linha de tarefa; `/agentctl-setup --task`
e as skills de fluxo preparam uma proposta para você aceitar), ou carregue-o por uma
sessão com `claude --plugin-dir mods/agentctl`.

## Primeira execução

Digite o que você está fazendo — não precisa de nenhum outro comando:

```text
/agentctl 測試一下這個新功能
```

1. O mod coloca um pedido para o Claude na sua caixa de prompt (nunca o envia). Pressione **Enter**.
2. O Claude lê o projeto e esboça um escopo — o que pode editar, quais verificações contam como evidência,
   o que significa "concluído" — e o escreve com o auxiliar incluído no mod (`bin/propose.mjs`). Se
   algo não estiver claro, ele pergunta a você em vez de inventar permissões.
3. No fim daquela resposta, o mod mostra o escopo e oferece `/agentctl accept <digest>` na caixa:
   **Tab** e depois **Enter**. Aceitar vincula o escopo; não inicia nenhum trabalho.
4. Peça ao Claude para começar. `/agentctl` mostra onde as coisas estão e o que fazer a seguir — rodar as verificações
   e depois `/agentctl handoff` — e `/agentctl help` lista o restante.

Um testador que não tinha lido o projeto percorreu os passos 1–4 e a entrega sem ajuda (§ Execução sem orientação).

Enviar o pedido é um turno comum do Claude; o mod não chama nenhum modelo. As respostas usam chinês tradicional
quando sua meta está escrita em chinês, e inglês de outro modo — uma heurística simples, não detecção de localidade.

## O que ele faz

| Função | Como |
|---|---|
| Escopo da tarefa | O Claude redige uma proposta (`/agentctl-setup --task`, ou `/feature-dev`, `/bug-fix`, `/refactor` quando o mod está instalado); o mod a pré-visualiza e `/agentctl accept` digitado no seu próprio prompt vincula exatamente o que foi pré-visualizado — veja § Propostas. `/agentctl task set <json>` digitado no seu prompt também vincula uma tarefa ao worktree. Saída de ferramentas, arquivos e mensagens não podem alterá-lo — só um comando que você digita. A vinculação é por worktree, então seu próprio `task set` / `task clear` noutra sessão no mesmo worktree a substitui ou limpa. Registros de tarefa e entregas são guardados por worktree, então o mesmo id de tarefa em dois worktrees nomeia duas tarefas separadas. Um erro de armazenamento é informado como tal, e a tarefa anterior continua valendo; uma vinculação cujo registro está ausente recusa tudo exceto leituras no worktree |
| Recusa | Uma lista de negação. Gravações diretas reconhecidas em produção e gravações remotas no git são recusadas **com ou sem tarefa**; com uma tarefa vinculada, suas próprias entradas `forbid` e edições fora de suas raízes também são recusadas. Raízes de edição vinculam as ferramentas de edição (Write, Edit, NotebookEdit); um arquivo escrito por redirecionamento de shell é um comando Bash que o mod não consegue classificar, então vai para o host — a recusa diz ao Claude para não alcançar o mesmo resultado de outro modo, mas raízes não são um sandbox. Tudo que o mod não consegue classificar — scripts, shell composto, ferramentas desconhecidas — vai para a própria caixa de permissão do Claude Code ou modo automático, registrado como `delegated`. Uma negação posterior nunca é enfraquecida e uma permissão nunca é criada. **Melhor esforço**: o mod lê cada chamada de ferramenta, nunca o conteúdo de um script nem os comandos que ele inicia, então um push dentro de um script fica a cargo do host e daquele fluxo |
| Evidência | Uma execução conta quando corresponde a um executor `check` declarado — primeiro suas palavras, então argumentos acrescentados ainda contam e podem verificar menos do que o declarado, enquanto um pipe, redirecionamento ou wrapper (`npm test \| grep pass`) não conta; a resposta de aceitação e `/agentctl` nomeiam cada verificação como uma linha que a corresponde, ou — quando o formatador não consegue citar uma palavra inteira — como suas palavras JSON, que não correspondem se copiadas como estão (uma grafia corretamente citada das mesmas palavras corresponde). Uma chamada correspondente é enquadrada por leituras de árvore derivadas do Git (executores são correspondidos primeiro, então uma verificação `git status` declarada é uma verificação); uma edição posterior mostra o resultado obsoleto em até 30 s; uma verificação em segundo plano fica como "conclusão não observada" até que um resultado terminal seja visto. A evidência pertence à tarefa e à versão de política sob as quais foi observada, e uma leitura com cobertura parcial nunca é listada como verificada |
| Painel | A faixa acima do prompt é compacta: tarefa, runtime e sua duração, o que precisa de você, a leitura do portão com sua idade (e `stale` após 30 s) e a hora da última entrega. `/agentctl` é uma resposta de status compacta — o próximo passo, tarefa, o que precisa de você, o portão e a evidência; `/agentctl status --details` acrescenta saúde do armazenamento, runtime, contexto e a janela de 5 h. As linhas do portão, contexto e janela nomeiam sua origem e idade, ou dizem `missing` / `unavailable`, e cada linha de evidência seu resultado, atualidade, cobertura e idade |
| Entrega | `/agentctl handoff` — oito respostas a partir de registros, sem modelo, sem rede, sem processo; registradas por completo na reabertura (apenas transcrição); `/agentctl` sem argumentos só aponta para isso, `/agentctl last` o imprime |
| Parada | `/agentctl stop` — salva a entrega, pede o cancelamento do turno atual e lista operações acompanhadas; nunca diz "tudo parado" |

## Propostas

O Claude escreve `~/.claude/agentctl/proposals/<worktree codificado em URI>.json` (fora do worktree) pelo
`bin/propose.mjs` incluído no mod (o caminho `/agentctl <meta>`) ou pelo `agentctl-setup.js propose` do sd0x-dev-flow (skills de setup e fluxo); ambos aplicam primeiro a validação do próprio mod. No início da sessão e no
fim de cada turno principal, o mod lê o arquivo uma vez, valida de novo e mantém o objeto **efetivo**:
o worktree vem da sessão; uma proposta que nomeia outro worktree, foi redigida para uma tarefa que
já não está vinculada ou se sobrepõe a uma classe embutida é recusada (o motivo é registrado). A pré-visualização
lista cada permissão aceita com um digest SHA-256 (24 hex) na transcrição e na faixa.
Cada entrada aparece com até 160 caracteres; uma mais longa termina em `…`, e o digest — e o que aceitar
vincula — ainda cobre tudo, então descarte um rascunho cujas entradas você não consegue ver por inteiro.

| Comando | Quem | Faz |
|---|---|---|
| `/agentctl proposal` | qualquer um | Imprime a pré-visualização aguardando |
| `/agentctl accept [prefixo do digest]` | **somente seu prompt** | Vincula o objeto retido — nunca o arquivo relido — se a tarefa vinculada não mudou desde a pré-visualização |
| `/agentctl discard` | qualquer um | Descarta a proposta aguardando; a tarefa vinculada permanece |

Mudar o arquivo depois gera uma nova pré-visualização e digest; um digest antigo não corresponde mais.
Sessões concorrentes no mesmo worktree compartilham uma vinculação e um armazenamento, que não é atômico entre
sessões: aceite na sessão que mostrou a pré-visualização.

## JSON da tarefa

```json
{
  "goal": "investigate the quiz service timeout",
  "allow": ["edit"],
  "editRoots": ["src", "tests"],
  "forbid": ["terraform apply"],
  "executors": [{ "argv": ["npm", "test"], "check": true }],
  "needsUser": [["npm", "publish"]],
  "tools": ["mcp__docs__search"],
  "acceptance": ["unit tests pass on the final tree"]
}
```

Classes proibidas embutidas se aplicam com ou sem tarefa, além das da própria tarefa: gravações em produção (`kubectl apply|delete|patch|rollout|scale|edit|replace`,
`helm install|upgrade|uninstall|rollback`, `gcloud … deploy|delete|update`) e gravações remotas no git
(`git push`, `gh pr merge`). Segredos nunca pertencem a uma tarefa: um valor parecido com credencial num campo de política é recusado.

`needsUser` só pergunta onde se viu uma pessoa responder: o terminal interativo nos modos de permissão
`default` (manual), `acceptEdits` e `auto` (`lib/verdict.js`). O modo é lido das entradas clássicas de hook a cada prompt e fim de ferramenta; até que um tenha sido visto, e em toda outra superfície ou modo — `-p`, `dontAsk`, `plan`, `bypassPermissions`, Desktop, VS Code, mobile — uma chamada `needsUser` é recusada. Um modo trocado no meio de um turno é visto no próximo fim de ferramenta.

## O que ele não é

- **Não é um limite de isolamento.** Roda com suas permissões. Acesso somente leitura em produção é tarefa das
  suas credenciais e do IAM/RBAC do alvo.
- **Não é a única linha.** Se o host pular seu hook (mod desligado, worker travado), nada aqui recusa.
  Mantenha comandos perigosos nomeados no seu próprio `permissions.deny`, por exemplo:

  ```json
  { "permissions": { "deny": ["Bash(kubectl delete:*)", "Bash(kubectl rollout:*)", "Bash(helm upgrade:*)"] } }
  ```

  Essas regras correspondem ao texto do comando, não a programas (`git -C . push` é outro texto), por isso
as duas camadas existem. `Bash(git push:*)` é deixado de fora de propósito: o `/push-ci` do sd0x-dev-flow o executa.
- Outro mod pode mudar um veredito em `tool.check`; este mod divulga isso em `/agentctl policy`.
- Executores autorizados (por exemplo `npm test`) rodam com efeitos não classificados.

## Desenvolvimento

```bash
cd mods/agentctl            # a partir da raiz do repositório
claude plugin validate .   # hooks e chamadas $: sem $.model.*, $.http.*, $.tool.register, $.prompt.submit (fill/suggest/read permitidos)
claude plugin test .       # todo *.test.ts sob tests/
```

## Release

O mod tem versão própria e é lançado sob tags `agentctl-v<versão>`
(`.github/workflows/release-agentctl.yml`), separado dos releases do sd0x-dev-flow. O Claude Code armazena em cache um
plugin instalado por versão, então uma mudança em qualquer arquivo além deste README ou `tests/` exige aumento de versão:
aumente `"version"` em `.claude-plugin/plugin.json` e execute `node .github/scripts/agentctl-version.js update`
a partir da raiz do repositório (ou `/bump-version agentctl`). O bloqueio de versão do CI falha até que ambos sejam feitos, e
o CI também roda `claude plugin validate` e `claude plugin test` aqui.

## Verificado ao vivo (2026-10-04, repositório descartável: `claude -p --plugin-dir` headless na 2.1.288, tmux interativo na 2.1.289)

Estas linhas registram a versão 0.1.0. Desde a 0.2.0, uma chamada não classificada é delegada ao host em vez
 de recusada, e os comandos de proposta existem; as linhas 0.2.x vêm depois da tabela.

| Verificação | Resultado |
|---|---|
| Carregar e `/agentctl` sob `-p` | Carrega só para a sessão; responde em ~3,7 s sem turno do modelo |
| `task set` de um prompt `-p` | Recusado: um prompt `-p` não tem a marca `composer`. Execuções headless não podem definir tarefa; defina-a de um prompt interativo |
| Chamadas Bash proibidas e não classificadas | Recusadas antes de rodar, com a regra nomeada (`task-forbid: …`, `unclassified: python3 has no adapter`) |
| Uma leitura permitida (`git status`) | Foi para o caminho de permissão do próprio host e rodou |
| Uma verificação com saída diferente de zero (`sh check.sh` → exit 1) | Registrada como `error`: uma saída Bash diferente de zero chega ao mod como `isError` |
| Enquadramento da evidência | Leituras de antes/depois registradas, cobertura `git-hybrid` |
| Duas sessões concorrentes | Ambos os registros de sessão escritos; o registro da tarefa mantido |
| Processos restantes após a saída | Nenhum |
| Custo da leitura da árvore | ~90 ms com 500 arquivos alterados/não rastreados; ~75 ms num repositório limpo de 974 arquivos |
| Janela de 5 h após um turno do modelo (V7) | `1% (resets …)` lido do host, com origem e idade |
| Verificação em segundo plano (V5, metade background) | Fechada pela notificação de tarefa do host (`<task-id>`, `<status>`) como `error` — sem polling. `TaskGet` é a ferramenta de lista de tarefas; `GetTask` lê tarefas em segundo plano |
| Chamadas de ferramenta de subagente (V4) | Um `danger-cmd` de subagente foi recusado pela mesma regra |
| `ask` sob `-p` (V3, só `-p`) | Com uma cópia de sonda respondendo `ask`, nenhuma das configurações headless testadas (com e sem regra de permissão para Bash) rodou o comando na 2.1.288 — o `ask` da sonda não foi aprovado automaticamente |
| `/agentctl stop` com entrada de stream sob `-p` (V6) | A entrada foi processada depois que o turno terminou, então `immediate` não se aplica ali; a resposta disse que nenhum turno em execução foi observado — nunca "parado" |
| Chamadas de ferramenta MCP (V4) | Uma ferramenta MCP de sonda foi recusada como não classificada até a tarefa a nomear, então rodou |
| Terminal interativo no tmux (V10) | A faixa renderiza texto CJK da meta corretamente em 80 e 50 colunas, quebrando em duas e três linhas |
| `/agentctl stop` durante ferramenta de primeiro plano em execução, interativo (V6) | Rodou imediatamente (`immediate`); o turno foi cancelado; o host moveu o comando em execução ao segundo plano, onde continuou — a resposta o listou como em execução e nunca disse "parado"; quando terminou, a notificação do host fechou sua evidência |
| `ask` no terminal interativo em modo manual (V3) | Com uma cópia de sonda respondendo `ask`, o host mostrou seu próprio diálogo de aprovação com o motivo do mod (Sim / Não, sem "não perguntar de novo"); recusar interrompeu a chamada; reexecutado com o código entregue (manual: diálogo; `dontAsk`: recusado pelo mod), e com cópia de sonda sob `acceptEdits` e `auto` (diálogo) e `dontAsk` (recusado). As strings enviadas pelo host foram lidas de um hook clássico comum `UserPromptSubmit` (2.1.289): `default`, `acceptEdits`, `auto`, `plan` e `dontAsk` chegam literalmente; num modelo sem modo automático (Haiku), `--permission-mode auto` recai para `default` |
| Início interativo (encontrado ao vivo) | `session.start` e a primeira renderização da faixa chegam juntos; duas construções de contexto concorrentes deixaram a faixa num contexto órfão (`gates missing`). Corrigido: uma construção compartilhada |
| Instalar, desligar, desinstalar (Sinal 12) | Instalado de marketplace local, rodou, desligado (`/agentctl` sumiu), desinstalado: nenhum processo do mod restou, as configurações `permissions` byte-idênticas. O próprio host deixou uma chave vazia `extraKnownMarketplaces`, um diretório de cache de plugin e um `installed_plugins.json` vazio; o mod deixa só seu arquivo de armazenamento. Tudo foi restaurado e verificado byte-idêntico depois |

Remoção: `--plugin-dir` não instala nada e não muda configuração. Os dados próprios do mod ficam em
`~/.claude/plugins/store/agentctl_*.json` (sessões, tarefas, checkpoints) e as propostas redigidas em
`~/.claude/agentctl/proposals/`; exclua-os para removê-lo.

## Verificado ao vivo, 0.2.x (2026-10-05, clone descartável com remoto bare descartável, 2.1.289, Haiku)

| Verificação | Resultado |
|---|---|
| `git push` direto sem tarefa vinculada (`-p`) | Recusado `remote-git-write` antes de rodar; o remoto ficou vazio |
| `python3 -c …` não classificado e um script que faz push (`/bin/bash -p push.sh`, `-p`) | Ambos passados ao host e executados; o push do script chegou ao git (rejeitado pelo próprio remoto descartável, não pelo mod) — a cegueira a scripts divulgada |
| Proposta escrita por `agentctl-setup.js propose`, início interativo | A pré-visualização foi registrada no início da sessão com o digest do auxiliar, e a faixa nomeou a proposta aguardando |
| `/agentctl accept <digest>` digitado no prompt | Vinculou o escopo pré-visualizado como nova tarefa; sem `base`, o auxiliar não imprimiu digest, o mod preencheu a tarefa vinculada e aceitou seu próprio digest |
| Uma verificação declarada, uma chamada não classificada, uma edição fora das raízes e um push direto (tarefa vinculada) | Verificação registrada como evidência `current`; `python3` delegado e listado como tal por `/agentctl events`; a edição recusada com `edit outside the allowed roots`; o push recusado com `remote-git-write` |
| Um arquivo não rastreado acrescentado de fora | A verificação leu `stale (tree changed since)` em até 32 s |
| `/agentctl handoff`, reabrir, `/agentctl`, `/agentctl last` | A entrega informa quando a árvore foi lida e lista a verificação obsoleta sob Não verificado; ao reabrir, a transcrição a mostra, `/agentctl` sem argumentos imprime uma linha de ponteiro, `/agentctl last` imprime tudo |
| Encontrado ao vivo e corrigido na 0.2.1 | Um arquivo de proposta aceito foi relido pela sessão seguinte como rascunho obsoleto (agora lembrado por worktree); a recusa embutida dizia "the task's scope", e o Claude então propôe ampliar a tarefa (agora: "a built-in class no task can lift"); linhas da transcrição diziam `agentctl: agentctl:` |
| Custo das duas sondas `-p` | 2–3 turnos cada, ≈ US$ 0,06 cada no Haiku; as respostas, pré-visualizações e faixa do próprio mod não chamam modelo |
| Teste adversarial independente (Codex, 2026-10-05), corrigido na 0.2.2 | Um caminho absoluto ou em maiúsculas de programa (`/usr/bin/git push`, `GIT push`) escapava das classes embutidas; uma raiz de edição como `../other` autorizava escritas fora do worktree; o limite da proposta contava caracteres, não bytes UTF-8; sem tarefa vinculada, chamadas delegadas não eram registradas em `/agentctl events`. Concordância de digest, chaves de protótipo, recusa de outro worktree, particionamento de evidência e cobertura parcial resistiram |

## Verificado ao vivo, 0.3.0 (2026-10-07, clone descartável com remoto descartável, tmux interativo, Haiku)

Sinal 13, percorrido na 2.1.289 (passos 1–3) e de novo desde o início na 2.1.292:

| Passo | Resultado |
|---|---|
| `/agentctl 幫 …/README 加一行測試說明` | O pedido preencheu a caixa vazia em chinês tradicional com o caminho do auxiliar de `$.plugin.root`; nada foi enviado ou vinculado |
| Enter | O Claude rodou o `--help` do auxiliar, leu o projeto, achou o arquivo ausente e **perguntou** em vez de inventar escopo; depois da resposta, escreveu a proposta pelo auxiliar |
| Pré-visualização | Mostrada no fim do turno com seu digest e "vincula apenas o escopo; não inicia trabalho"; a faixa nomeou a proposta aguardando |
| Tab + Enter | Aceito a partir da sugestão; a resposta nomeou o próximo passo |
| "start the work" | A edição dentro da raiz aceita foi ao próprio prompt de permissão do host; a verificação declarada foi registrada como evidência atual |
| `/agentctl`, `handoff`, reabrir, `last` | O status começou com o próximo passo; a entrega listou a verificação como validada com seu horário de leitura; a reabertura apontou para ela, `last` a imprimiu |
| Uma segunda meta com a tarefa vinculada | O auxiliar entregou sob a tarefa vinculada; a pré-visualização dizia "Substitui: tarefa …"; Tab + Enter a substituiu |

Encontrado e corrigido durante o percurso: na 2.1.292, a própria sugestão de próximo prompt do host ("確認") tomou a caixa, então Tab + Enter teria enviado aquela palavra ao Claude — o mod agora substitui a sugestão do host pela linha de aceitação enquanto uma proposta aguarda, e a oferece de novo no fim de cada turno; a última linha da resposta de aceitação ficou em inglês numa sessão em chinês; com tarefa vinculada, a resposta de preenchimento dizia "nada está vinculado". Hesitações registradas: o O Claude uma vez tentou ler os próprios arquivos do mod fora do worktree (recusado no prompt do host); o idioma da cópia reseta a cada nova sessão.

## Execução sem orientação, 0.3.0 (2026-10-07, Codex como usuário de primeira vez, tmux interativo, clone descartável)

O testador recebeu só `/agentctl <o que você está fazendo>` e não leu nem `docs/` nem o código deste mod. Descrever → Enter → pré-visualização (≈ 72 s, escopo só README, três verificações) → Tab + Enter → "comece o trabalho" → `/agentctl` → `/agentctl handoff`: concluído em seis passos sem ajuda externa. Corrigido na 0.3.1 a partir do que encontrou:

| Encontrado | 0.3.1 |
|---|---|
| A entrega dizia "Edições observadas: 0" ao lado de um README alterado (o Claude editara via Bash) | A linha conta chamadas de ferramenta de edição e diz que mudanças via Bash estão na linha da árvore |
| O Claude rodou os testes com pipe para `grep`; a entrega chamou a verificação de obsoleta enquanto o Claude a chamou de aprovada | A resposta de aceitação nomeia as verificações a rodar literalmente; `/agentctl` as pede de novo pelo nome |
| Com o trabalho pronto, `/agentctl` ainda dizia "peça ao Claude para começar o trabalho" | O próximo passo segue as verificações declaradas: trabalhe e as rode, rode de novo o que não está atual, ou entregue |
| Um Write fora das raízes foi recusado, depois o mesmo arquivo foi escrito com heredoc Bash | A recusa diz ao Claude para não alcançar o resultado de outro modo; esta seção e § O que ele faz afirmam que raízes vinculam só as ferramentas de edição |
| O Claude fez uma pergunta e escreveu uma proposta no mesmo turno | O pedido de redação diz para esperar a resposta antes de escrever |

Deixado como está: a execução levou minutos porque o próprio `CLAUDE.md` do clone exige duas rodadas de revisão para uma mudança de documento, não por causa do mod.

## Não verificado

V3 no Desktop, VS Code e mobile, e sob `plan` e `bypassPermissions` (aceitar o aviso do modo bypass é decisão do operador, então não foi exercitado): `needsUser` continua recusado nesses casos. A faixa foi verificada no tmux, não por SSH.
