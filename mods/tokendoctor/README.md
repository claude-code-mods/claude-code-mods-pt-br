<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo.svg">
    <img src="docs/logo-light.svg" width="72" height="72" alt="tokendoctor">
  </picture>
</p>

<h1 align="center">tokendoctor</h1>

<p align="center">
  <strong>O mesmo Claude Code por até 38% menos</strong>
  <br>
  Reexecuta suas próprias sessões passadas para mostrar quanto cada mudança teria economizado e altera apenas o que você escolhe.
</p>

<p align="center">
  <a href="https://github.com/localixai/tokendoctor/actions/workflows/ci.yml"><img src="https://github.com/localixai/tokendoctor/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/github/v/tag/localixai/tokendoctor?label=version" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="#install">Instalação</a> &bull;
  <a href="https://tokendoctor.localix.ai/docs">Documentação</a> &bull;
  <a href="https://tokendoctor.localix.ai">Site</a> &bull;
  <a href="CHANGELOG.md">Changelog</a>
</p>

<p align="center">
  <img src="docs/demo.gif" alt="tokendoctor numa sessão real do Claude Code: /tokendoctor:sessions e depois a tendência diária" width="880">
</p>

**Suas sessões passadas decidem, não o benchmark de ninguém.** Quanto uma configuração economiza depende de como você trabalha: quanto duram suas sessões, quais modelos você usa, qual é o trabalho. Um número das sessões de outra pessoa, inclusive das minhas, diz pouco sobre as suas. Por isso o tokendoctor começa olhando para as suas.

**① Olhe para os últimos 30 dias.** `/tokendoctor:sessions` reexecuta cada sessão que você teve, requisição por requisição, em janelas de compactação de 200K, 300K, 400K e 600K, e mostra o que cada uma teria custado. Ele apenas lê suas transcrições, não faz chamadas ao modelo e não muda nada. O número é um limite superior: uma reexecução não consegue ver trabalho que o modelo refaria depois de um resumo.

**② Mude apenas o que suas sessões mostram que compensa — e desfaça.** `/tokendoctor:optimize` propõe mudanças com base nesses números e confere suas configurações com a documentação do Claude Code; ele aplica apenas as que você escolhe, cada uma mostrada antes como um diff. `/tokendoctor undo` desfaz qualquer uma delas.

**③ Opcional: deslizar em vez de resumir.** Quando o Claude Code pararia para resumir a conversa, o tokendoctor descarta a saída antiga de ferramentas e mantém todas as mensagens. Não há chamada ao modelo, então leva milissegundos, não um minuto.

## Instalação

```bash
claude plugin marketplace add localixai/tokendoctor
claude plugin install tokendoctor@tokendoctor
```

Reinicie o Claude Code e execute `/tokendoctor:sessions` para ver quanto seus últimos 30 dias teriam custado em cada janela. Nada muda até você escolher.

## O que ele encontrou nas minhas sessões

Cada requisição envia a conversa inteira ao modelo. Em modelos com janela de 1M, o Claude Code compacta só perto de 967K tokens, então o fim de uma sessão longa é a parte cara. Para mim, dois terços do custo da thread principal foram para requisições com mais de 400K de contexto.

Por isso defini uma janela de 400K e Sonnet para os subagentes. Comparando o mês anterior com a semana seguinte, cerca de 23K e 19K requisições na thread principal, o contexto por requisição caiu de 412K para 219K e o custo por requisição caiu 38% nos preços de tabela da API. É o antes e depois de uma pessoa, não um experimento controlado.

O custo é mais resumos, e cada um é uma pausa: 79 segundos em média nas minhas sessões. É para isso que serve o deslizamento. Suas sessões podem mostrar algo completamente diferente — é justamente por isso que vale olhar para elas primeiro.

## O que o benchmark mostra

No [benchmark](bench/README.md), o Claude Code constrói um projeto TypeScript contra testes que não pode alterar, então uma execução só conta se os testes passam. O custo é por tarefa, no Haiku 5.5:

| Comparação | Custo | Tempo |
| --- | --- | --- |
| Deslizar contra um resumo, um dia de trabalho | −19% | −33% |
| Deslizar contra um resumo, um harness de avaliação | −35% | −28% |
| Deslizar contra um resumo, uma tarefa curta | +6% | −17% |
| Apenas as dicas de configuração, contra o Claude Code como vem de fábrica | mais caro em 3 de 4 execuções | |
| As dicas e o deslizamento, uma semana de trabalho | −11% a −21% | |

Todos os testes passaram em todas as execuções. As dicas sozinhas não compensaram aqui porque essas tarefas raramente passam de 400K, que é onde a janela começa a importar. Se as suas sessões também não passam, sua reexecução mostrará isso, e você deve deixar sua janela como está. Todas as execuções, inclusive as que perderam, estão em [bench/HISTORY.md](bench/HISTORY.md).

<p align="center">
  <img src="docs/dashboard.png" alt="O painel do tokendoctor do autor: 57% do gasto foi o Claude relendo a conversa" width="880"><br>
  <sub><code>/tokendoctor:dashboard</code>: para onde foi cada token, por dia, modelo, subagente e projeto. Um único arquivo local; este é o meu.</sub>
</p>

## Comandos

| Comando | O que faz |
| --- | --- |
| `/tokendoctor:sessions [days]` | Reexecuta suas sessões passadas (30 dias, ou `days`) em janelas menores: quanto cada uma economizaria e para onde foram seus tokens. Apenas leitura. |
| `/tokendoctor:audit` | Suas configurações, memória e CLAUDE.md conferidos com a documentação, por gravidade. Apenas leitura. |
| `/tokendoctor:dashboard [days]` | Abre um painel local de todas as sessões nesta máquina. |
| `/tokendoctor:optimize [focus]` | Propõe até cinco mudanças com base nos seus números e aplica as que você escolhe. |
| `/tokendoctor [name] [value]` | Mostra, explica ou altera uma configuração, sem chamada ao modelo. |
| `/tokendoctor undo [n]` | Lista todas as mudanças feitas pelo tokendoctor e desfaz uma delas. |

Nada sai da sua máquina: a única chamada de rede é para duas páginas públicas da documentação do Claude Code, uma vez por dia. Ele nunca troca seus modelos por conta própria.

## Documentação

**[tokendoctor.localix.ai/docs](https://tokendoctor.localix.ai/docs)** traz o resto: as [38 verificações](https://tokendoctor.localix.ai/docs/audit), cada [configuração](https://tokendoctor.localix.ai/docs/settings), [como o deslizamento funciona](https://tokendoctor.localix.ai/docs/slide) (e os logins de Team e Enterprise), os comandos pelo shell, as [medições](https://tokendoctor.localix.ai/docs/proof) e os [limites](https://tokendoctor.localix.ai/docs/limits). Para trabalhar no próprio tokendoctor, veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT
