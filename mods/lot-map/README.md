# Lot Map para o Claude Code

`lot-map` é um mod para o Claude Code: um mapa ao vivo do trabalho, em um painel ao lado do chat. Cada chamada de ferramenta, passo do modelo, hook e skill envia um pulso do centro até sua estação, então você vê memória, arquivos, shell, web e agentes trabalhando, em vez de ler uma lista de comandos.

Ele roda na sua máquina e não envia nada a lugar nenhum. Local não significa cego: como qualquer mod que acompanha chamadas de ferramentas, ele recebe cada chamada inteira, e dela toma apenas os nomes. [O que ele lê e guarda](PRIVACY.md) e [as verificações que o mantêm nisso](PRINCIPLES.md).

![O mapa durante uma sessão de trabalho](docs/demo.gif)

*Uma sessão inventada, reproduzida pelo próprio código de desenho do mod. [Vídeo (MP4)](docs/demo.mp4). Ou [rode no seu navegador](https://alexeyw.github.io/lot-map/), onde a página executa o mesmo código e mostra o que cada chamada entrega ao mod e o que ele guarda.*

## Instalação

No prompt de uma sessão de terminal:

```
/plugin install lot-map --marketplace alexeyw/lot-map
```

Responda `y` para adicionar o marketplace e escolha um escopo. Pelo shell:

```bash
claude plugin install lot-map --marketplace alexeyw/lot-map
```

Se ele responder que o plugin não foi encontrado em nenhum marketplace, adicione o marketplace primeiro:

```bash
claude plugin marketplace add alexeyw/lot-map
claude plugin install lot-map@lot-map
```

No aplicativo desktop: clique em **+** ao lado da caixa de prompt, depois em **Plugins**, **Adicionar marketplace** com `alexeyw/lot-map` e então **Adicionar plugin**.

O painel se abre sozinho quando a sessão começa; com `openAtStart` desligado, ele espera por `/lot-map`. Em um terminal, precisa de pelo menos 144 colunas; caso contrário, digite `/lot-map`, e ele desenha só texto, a menos que você peça o mapa como imagem ou em pontos de braille: veja [Em um terminal](#in-a-terminal). Construído e testado no Claude Code 2.1.321 no macOS; usuários relatam que funciona também no Windows e no Linux.

Em um login Team ou Enterprise, a transcrição pode receber avisos como `lot-map: its classic.PreToolUse hook was skipped`. Desligue `guardedHooks` e eles param; [Opções](#what-it-shows) diz o que o mapa perde por isso.

## Atualização

Pelo shell:

```bash
claude plugin marketplace update lot-map
claude plugin update lot-map@lot-map
```

Depois inicie uma nova sessão. O primeiro comando é necessário: sem ele, o segundo informa a versão instalada como a mais recente.

O que mudou em cada versão está em [CHANGELOG.md](CHANGELOG.md).

## O que acende

| Estação | Quando |
| --- | --- |
| Você | suas mensagens, perguntas e arquivos enviados a você, a lista de tarefas, o plano e o que você é pedido a aprovar |
| Modelo | cada requisição ao modelo, compactação de contexto |
| Memória | a pasta de memória do Claude Code, mais o que você nomear nas opções |
| Arquivos | Read, Write, Edit, Grep, Glob, a inteligência de código de um language server e comandos de shell que só trabalham com arquivos: leem, buscam, movem, excluem ou editam no lugar (`cat`, `grep`, `mv`, `rm`, `sed`, `tee`, `find … -delete`) |
| Shell | todo outro comando de shell |
| Rede | busca e fetch web, servidores MCP, trabalho mantido no claude.ai (artifacts, projetos, designs) e comandos de shell conhecidos por alcançar a rede: `curl`, `gh`, `ssh`, `rsync`, `git push`, `npm install`, `docker pull` e semelhantes, inclusive dentro de `$(…)` |
| Navegador | ferramentas de navegador |
| Agentes | subagentes, workflows, agendamentos e espera por trabalho em segundo plano; as chamadas próprias deles partem desta estação |
| Skills | skills, busca de ferramentas e o catálogo de skills, plugins e conectores |
| Hooks | hooks de configurações que recusam uma chamada, pedem permissão, acrescentam contexto ou demoram |

No Windows, a ferramenta PowerShell é lida como o Bash, com os nomes próprios do PowerShell: `Get-Content` e `Select-String` acendem Arquivos, `Invoke-WebRequest` acende Rede. Um programa rodado pelo caminho completo é lido pelo nome, inclusive a partir de um caminho citado com espaço, e `CURL.EXE` é `curl`.

As estações de shell seguem o nome do comando, não o que ele faz: um script que abre uma conexão por conta própria, como `python -c "…"`, aparece como Shell. Um comando atrás de `sudo`, `env`, `timeout`, `nohup`, `xargs` e semelhantes é lido como o comando que ele roda, e `find … -exec` como o comando que ele recebe para rodar. O mesmo vale para um comando dentro de um loop ou condição (`for … do`, `if … then`, `while`, `!`, `{ … }`) e uma linha entregue a um shell ou ao `eval` (`bash -c "…"`). O texto de um here-document não é lido, então um arquivo escrito por um deles aparece como Arquivos, seja qual for o texto. Uma linha é lida até seus primeiros 8.000 caracteres. `npx` conta como Rede só com `-y`, pois sem isso ele roda principalmente o que já está instalado.

Um pulso sai quando algo começa e volta quando termina. Recusas e erros ficam vermelhos.

## Lendo o mapa

- **A rota.** Uma linha fina liga as últimas estações percorridas pelo loop principal, em ordem, e seu trecho mais novo se desenha sozinho. Um trecho fica 40 segundos e desaparece em 20, então um minuto após o trabalho parar só sobram os raios; a espessura deles guarda para onde o trabalho foi. Passos do modelo ficam de fora, senão todo trecho passaria por Modelo.
- **Raios gastos.** Um raio fica mais espesso e brilhante quanto mais sua estação é usada, então no fim de uma sessão o mapa mostra para onde o trabalho foi.
- **Quanto tempo.** Dois ponteiros de relógio crescem ao redor de uma estação enquanto uma chamada roda: o interno dá uma volta em um minuto, o externo em dez.
- **Trabalho em segundo plano.** Um comando enviado ao segundo plano, um monitor, um subagente em segundo plano ou um workflow fica aceso em sua estação depois que o turno que o iniciou termina, com os ponteiros crescendo, até a tarefa informar que terminou. Uma tarefa que falhou deixa o ponto vermelho. O relatório em si não aparece como mensagem sua.
- **Vários ao mesmo tempo.** Chamadas que começam juntas voam lado a lado, e a estação mostra a quantidade, como `×3`.
- **O que deu errado.** Um ponto vermelho com contagem fica numa estação de um erro ou recusa até sua próxima mensagem.
- **Memória.** Tem cor própria. Um pulso sólido é uma memória que o Claude pediu; um oco, em linha tracejada, é o que um hook trouxe sem ser pedido. Abaixo da estação, o número simples conta o primeiro e `↓` o segundo.
- **A janela de contexto.** O anel ao redor do centro se enche conforme a sessão avança, com a porcentagem acima do nome. Fica âmbar em 70% e vermelho em 90%.
- **Mudança de modelo.** O centro e a estação Modelo tocam por alguns segundos, e o feed recebe uma linha como `opus 5.5 → fable 5.2`. Isso também acontece quando uma sessão começa com modelo diferente da última sessão na mesma pasta.
- **Subagentes.** Cada um ainda em trabalho circula a estação Agentes como um ponto pequeno, e suas chamadas partem de lá.
- **A resposta.** Um anel largo sai do centro quando a resposta está pronta.

Abaixo do mapa há uma linha que diz o que roda agora e as últimas 16 linhas (com `logRows` em `fill`, quantas couberem no painel desktop): `●` rodando, `·` pronto, `✕` falhou ou foi bloqueado, `◆` mudança de modelo. Chamadas concluídas que se seguem na mesma estação se juntam em uma linha, marcada `+2` pelas duas que representa além da nomeada. Uma chamada ainda rodando nunca é empurrada da lista pelo que veio depois: fica como última linha até terminar, para que a lista e o mapa digam o mesmo. Essas linhas ocupam no máximo metade da lista; com mais chamadas rodando do que isso, a última é marcada `+22` pelas restantes.

Cada linha é uma linha só. Suas palavras são cortadas na borda do painel; seu tempo fica numa coluna à direita, com um traço para o que não levou tempo, como uma mensagem chegando, e na linha da resposta o comprimento do turno inteiro. Uma linha com rótulo longo tem um `▸` antes do tempo: pressione para ler a linha inteira e de novo para fechar. Só uma linha fica aberta por vez. Em um terminal, a linha do agora também traz a porcentagem de contexto e o modelo à direita, já que não há desenho para mostrá-los.

### Quanto cada chamada acrescenta ao contexto

O anel diz o quanto a janela de contexto está cheia, não o que a encheu. Com `contextCost` ligado, a linha de uma chamada diz aproximadamente quantos tokens o contexto cresceu com sua resposta, depois do tempo: `85 ms +42k`. No mapa, a linha de contagem de cada estação acrescenta a soma da sessão: `9 · 180k`. O número toma a cor do que está ao lado dele — o tempo na linha e a contagem no mapa — então lê bem onde quer que eles leiam, em tema claro e escuro.

É uma estimativa. O Claude Code informa a um mod sobre quantos tokens a última resposta foi respondida, então o mod vê quanto o contexto cresceu de um passo do modelo para o seguinte e atribui isso às chamadas cujas respostas acompanharam aquele passo. O crescimento também inclui as palavras do próprio modelo, o que os hooks acrescentaram e, no começo de um turno, sua mensagem.

- **Um passo atrasado.** O número de uma chamada aparece quando o próximo passo foi respondido, não quando a chamada termina. Uma chamada feita no último passo de um turno, antes de um turno interrompido ou antes de uma compactação, nunca recebe um; e uma compactação, que torna o contexto menor, não coloca número em nada.
- **Compartilhado.** Duas ou três chamadas em um passo dividem o crescimento igualmente, e seus números são marcados com `~`: `~+14k`. Com mais chamadas no mesmo passo, suas linhas não recebem nada, pois uma divisão igual daria o mesmo número a uma leitura grande e a um comando curto; quando todas estavam na mesma estação, a soma daquela estação ainda recebe o total. Uma linha dobrada soma os números de suas chamadas, marcada `~` quando algumas não têm.
- **Só o loop principal.** Um subagente enche um contexto próprio, que o Claude Code não informa: suas chamadas não recebem número. O crescimento trazido pela resposta dele aparece na chamada do loop principal que o iniciou.

As somas aparecem em todo desenho do mapa: o do aplicativo desktop, o do VS Code e a imagem do terminal, que são um mesmo desenho, e o mapa em braille, que escreve a soma de uma estação depois de sua contagem, na cor de seu nome e com o sinal de mais dos números das linhas: `Files 9 +180k`. Um terminal que mostra só as linhas as tem em sua linha de contagens, escritas da mesma forma.

O mapa em braille desenha as somas de todas as estações ou de nenhuma. Onde sua grade não tem espaço para a soma mais larga ao lado de todo nome, em painel estreito ou com nomes longos e contagens grandes, ele deixa todas de fora, mantém cada nome inteiro, e as linhas continuam com seus números. Nomes em inglês com contagens abaixo de dez cabem a partir de 50 colunas; com contagens maiores em todas as estações, precisam de até 68.

| Trabalhando | Subagentes | Um hook recusa |
| --- | --- | --- |
| ![Trabalhando](docs/map-working.png) | ![Subagentes](docs/map-agents.png) | ![Um hook recusa](docs/map-blocked.png) |

| Mudança de modelo | Depois da resposta | Cores claras |
| --- | --- | --- |
| ![Mudança de modelo](docs/map-switch.png) | ![Depois da resposta](docs/map-after.png) | ![Cores claras](docs/map-light.png) |

## Em um terminal

Um terminal mostra só as linhas. Com `terminalView` em `picture`, um terminal que mostra imagens, como kitty ou Ghostty, recebe o mapa como imagem acima das linhas, movendo-se como no aplicativo desktop. O Claude Code precisa desenhar em tela cheia. Se o painel fica abaixo da conversa e não ao lado, o Claude Code está desenhando na tela principal e as linhas ficam sozinhas: digite `/tui fullscreen` ou inicie com `CLAUDE_CODE_NO_FLICKER=1 claude`. Dentro do tmux, defina `allow-passthrough on` e `focus-events on`. Qualquer outro terminal mostra só as linhas, como antes, e o mesmo vale para um painel mais estreito que 24 colunas.

No iTerm2, a imagem precisa do iTerm2 3.7.8 ou mais recente. Versões anteriores guardam toda imagem recebida até a aba fechar: no iTerm2 3.7.7, um mapa em movimento usava cerca de 2 MB por quadro, 17 GB em cinco minutos (#81). Lá a imagem fica desligada, e uma linha acima das linhas avisa; atualize o iTerm2 ou defina `terminalView` como `braille`. O mod reconhece o iTerm2 por `TERM_PROGRAM` e, por ssh ou dentro do tmux, por `LC_TERMINAL`, e sua versão por `TERM_PROGRAM_VERSION` ou `LC_TERMINAL_VERSION`; sem a versão, a imagem fica desligada.

O mod pinta a imagem sozinho, a partir do mesmo desenho do aplicativo desktop, com letras das fontes bitmap misc-fixed da X.Org, que são de domínio público; [FONTS.md](FONTS.md) diz de onde vêm. Pinta até cinco quadros por segundo enquanto algo no mapa se move. O núcleo só respira na imagem quando algo roda, suavemente por dez minutos após a última mudança do mapa e depois um quadro a cada cinco segundos; em repouso, a imagem fica parada quando as trilhas desaparecem.

Com `theme` em `auto`, a imagem é clara ou escura conforme o `COLORFGBG` do terminal, que iTerm2, rxvt e Konsole definem; onde nada diz, é escura, e em terminal claro que não informa, defina `theme` como `light`. A imagem não tem fundo próprio, então a do terminal aparece através dela; quando é um tom diferente do cinza do painel, deixa uma caixa fraca ao redor do mapa. `paneBackground` em `transparent` tira o cinza, para que o terminal apareça atrás do mapa e das linhas, inclusive quando o terminal é transparente; definido com a cor do terminal como `#rrggbb`, pinta o painel nela. `colors` com `background=#rrggbb` dá à imagem um fundo próprio.

Tampouco um terminal diz quão altas são suas células. `cellShape` diz: quantas vezes uma célula é mais alta do que larga, 2,4 por padrão, como o iTerm2 desenha Monaco 12, e cerca de 2 para Menlo no kitty. Se a imagem deixar uma faixa vazia abaixo de si, aumente; se a faixa estiver à direita, diminua.

### O mapa em pontos de braille

Com `terminalView` em `braille`, o mapa fica acima das linhas como células de texto: pontos de braille para os raios, as estações e o centro, letras para os nomes. Não precisa de imagens, só de uma fonte com braille, então aparece no Windows Terminal e na maioria dos terminais Linux, onde `picture` não mostra nada. Nunca é um fallback: um terminal que não consegue mostrar a imagem mantém só as linhas até você escolher `braille`.

![O mapa em braille no Windows Terminal](docs/map-braille.png)

É o mesmo tabuleiro, lido da mesma forma, com o que uma célula pode carregar:

- **Estações.** Um anel vazio ainda não foi usado, um com ponto já foi, e um cheio está trabalhando agora e latece. Uma estação que terminou agora fica brilhante por alguns segundos. Vermelho é erro ou recusa, e `!1` depois do nome os conta até sua próxima mensagem; `x3` é quantas chamadas rodam lá ao mesmo tempo. Com `contextCost` ligado, a soma da estação fica depois de sua contagem, onde a grade tem espaço para a soma de todas: `Files 9 +180k`.
- **Raios.** Um raio toma a cor de sua estação com a primeira chamada e uma segunda linha com muito uso. Acende quando uma chamada começa; um pulso voa por ele e volta quando a chamada termina. O que um hook trouxe sem pedido voa de sua estação para dentro.
- **O centro.** Seu contorno é a janela de contexto, enchendo no sentido horário a partir do topo, âmbar em 70% e vermelho em 90%, com a porcentagem sobre o nome e o modelo abaixo. O nome do modelo fica brilhante por alguns segundos após uma mudança. Um anel sai do centro quando a resposta está pronta.
- **Subagentes.** Cada um ainda em trabalho circula a estação Agentes como um ponto.

O que ele não desenha, já que uma célula tem uma cor e um ponto é todo o detalhe:

- a rota entre as estações e sua trilha desbotando;
- os ponteiros do relógio ao redor de uma estação em trabalho;
- os ícones nas estações, os contornos tracejados e a respiração do centro;
- os anéis onde um pulso chega e onde o modelo muda;
- pulsos lado a lado: chamadas que começam juntas voam como uma, e `x3` diz quantas;
- a segunda contagem da memória, `↓`, do que um hook trouxe sem pedido: um número conta os dois;
- a chamada de um subagente saindo da estação Agentes: toda chamada voa do centro;
- o desbotar de um brilho: uma estação fica brilhante e depois deixa de ficar.

Suas cores são as próprias do mapa, como no aplicativo desktop. `theme` e `colors` valem; em `auto`, é claro ou escuro conforme `COLORFGBG`, como a imagem, e escuro onde nada diz, então em terminal claro que não informa, defina `theme` como `light`. `background` significa aqui o mesmo que ali:

- `solid`, o padrão: as células ficam sobre o fundo da paleta e as palavras tomam sua cor de texto, então o mapa lê em qualquer painel. O fundo do próprio painel vem do tema do Claude Code, que o mapa não consegue pedir; quando ele e o terminal diferem, como terminal claro sob tema escuro, é um mapa claro em painel escuro, como a imagem.
- `transparent`: as células não têm fundo e as palavras tomam a cor própria do terminal. Escolha onde terminal e tema do Claude Code concordam: o mapa fica no painel sem caixa ao redor. Onde diferem, as palavras mal podem ser lidas. Com `paneBackground` também em `transparent`, o mapa e o painel mostram o terminal atrás dos dois.

`layout` gira o anel. Com `motion` em `reduced`, nada voa, latece ou circula: uma chamada acende sua estação e seu raio, e os subagentes ficam ao lado dos seus.

Como a imagem, o mapa só aparece onde o painel fica ao lado da conversa. Sob o renderizador padrão do Claude Code, o painel fica abaixo da conversa e é curto demais para o mapa, então as linhas ficam sozinhas: digite `/tui fullscreen` ou inicie com `CLAUDE_CODE_NO_FLICKER=1 claude`. O mapa precisa de um corpo de painel com pelo menos 50 colunas e 25 linhas, e chega a 76 por 21; em painel menor, as linhas ficam sozinhas. Ele é pintado de novo só quando vai ficar diferente: cerca de oito vezes por segundo enquanto um pulso voa ou um subagente circula, a cada batida de uma estação em trabalho e nunca em repouso. Dez minutos após a última mudança do mapa, o que ainda roda recebe um quadro a cada cinco segundos.

## No VS Code

Na extensão do VS Code, o painel é curto e o mapa desenhado da largura do painel não cabe. Lá, e só lá, três botões ficam no fim da linha do agora. **Reduzir** e **Ampliar** desenham o mapa em uma de seis larguras, de 160 a 400 pixels, ou da largura do painel. **Ocultar mapa** dobra o painel até aquela linha, e **Mostrar mapa** traz o mapa de volta. O que você escolhe é mantido para a próxima sessão.

## Opções

A instalação as oferece em uma tela. Depois, use `/config` em um terminal ou `claude plugin configure` e reinicie a sessão. Vêm em quatro grupos abaixo. Todas têm padrão, e o mapa funciona sem nenhuma definida.

### Aparência

Cada uma delas com uma imagem de seus valores: [Como as opções aparecem](docs/options.md).

| Opção | Padrão | Significado |
| --- | --- | --- |
| `language` | `en` | `en`, `ru`, `es`, `fr`, `de`, `it` ou `pt` |
| `coreName` | `CLAUDE` | o que o círculo do meio diz, até dez caracteres |
| `theme` | `auto` | as cores do mapa: `dark`, `light` ou `auto`, escura em superfície escura e clara em clara |
| `background` | `solid` | o fundo próprio do mapa, ou `transparent`, que deixa o painel atrás aparecer. A borda ao redor dos rótulos mantém a cor do fundo, então em superfície de outro tom aparece como uma aura fraca |
| `paneBackground` | `theme` | com que o próprio painel é pintado: `theme`, o do próprio Claude Code; `transparent`, que deixa o terminal atrás aparecer, inclusive papel de parede e desfoque; ou uma cor como `#rrggbb`, para combinar com terminal opaco. Uma superfície que não consegue fazer isso mantém a sua. Veja [Em um terminal](#in-a-terminal) |
| `colors` | nenhuma | cores suas, cada uma como `name=#rrggbb`; veja [Cores próprias](#colours-of-your-own) |
| `layout` | `you-top` | onde você está no mapa: `you-top` ou `you-bottom`, que gira o anel meia volta para que você fique embaixo e a rede e o navegador em cima |
| `motion` | `full` | `full` ou `reduced`: nada voa, se espalha ou gira. Uma chamada ainda acende sua estação e pisca seu raio, a rota ainda recebe seu trecho, e esses só desbotam; os ponteiros ao redor de uma estação em execução ficam, lentos como os de um relógio |
| `textSize` | `footnote` | o tamanho das linhas sob o mapa: `caption`, `footnote` ou `body`. Um terminal tem um tamanho só e ignora isso |
| `openAtStart` | `true` | se o painel se abre sozinho quando a sessão começa. Com `false`, fica fechado até você digitar `/lot-map`; o mapa é mantido desde a primeira chamada da sessão de todo modo, então fica inteiro quando você abre |
| `logRows` | `16` | quantas linhas a lista sob o mapa mostra: `16` ou `fill`, quantas couberem no painel abaixo do mapa, nunca menos de 16. As linhas mais antigas que não cabem são cortadas embaixo, acima das chamadas ainda rodando. Só no painel acoplado do aplicativo desktop; um terminal, o editor e o aplicativo mobile mantêm 16 |

### O que ele mostra

| Opção | Padrão | Significado |
| --- | --- | --- |
| `hookReasons` | `false` | mostra a primeira linha da recusa de um hook, até 72 caracteres; desligado, o mapa diz só qual ferramenta foi parada |
| `guardedHooks` | `true` | desligue em login Team ou Enterprise em que a transcrição recebe avisos como `lot-map: its classic.PreToolUse hook was skipped`. A guarda de uma organização mantém mods longe de cinco eventos lá, e com isso desligado o mod não acrescenta hook nenhum neles. O mapa perde a estação Hooks, os registros que um hook acrescenta, a linha de um comando slash digitado e a marca de uma compactação; uma chamada que um hook recusou ainda recebe seu `✕`, como chamada falha e não bloqueada |
| `subagentNames` | `false` | o passo do modelo de um subagente diz qual subagente é, pelas poucas palavras com que foi iniciado, até 40 caracteres; desligado, diz só que é um subagente |
| `contextCost` | `false` | cada linha diz aproximadamente quantos tokens o contexto cresceu com a resposta de sua chamada, e o mapa soma o total de cada estação à sua contagem. Estimativa, mostrada um passo atrasada; veja [Quanto cada chamada acrescenta ao contexto](#what-each-call-adds-to-the-context) |
| `contextWindow` | `model` | em relação ao que o anel e sua porcentagem medem o contexto: `model`, a janela inteira do modelo, como a linha de status; ou `compaction`, a janela de compactação automática, como uma definida com `autoCompactWindow`, quando menor que a do modelo. Sem uma, ou com compactação automática desligada, `compaction` mostra o mesmo que `model`. A janela é lida no primeiro passo do modelo de uma sessão, após uma compactação e numa mudança de modelo; com `guardedHooks` desligado, não após uma compactação |

### Memória e servidores

| Opção | Padrão | Significado |
| --- | --- | --- |
| `memoryServers` | `memory` | servidores MCP cujas ferramentas acendem Memória |
| `memoryCommands` | nenhum | comandos ou scripts de shell que acendem Memória; um nome conta quando é o próprio comando ou começa com ele e `-`, `_` ou `.`, então `recall` também nomeia `recall-sync.py` |
| `memorySubcommands` | nenhum | palavras depois de um comando de memória que o mapa pode mostrar, como `add` ou `search`; sem elas, o comando vai pelo próprio nome |
| `memoryPaths` | nenhum | partes de um caminho que fazem de um arquivo uma memória |
| `memoryLabels` | nenhum | nomes curtos para ferramentas de memória, cada um como `tool=name` |
| `serverStations` | nenhum | coloca as ferramentas de um servidor MCP numa estação de sua escolha, cada uma como `server=station`, com `files`, `shell`, `web`, `browser`, `agents`, `skills` ou `you`; a linha ainda diz `servidor: ferramenta`. O que você define prevalece sobre as rotas próprias do mod para os servidores que ele conhece. Memória mantém `memoryServers`, que prevalece se um servidor estiver nos dois; uma estação desconhecida é ignorada |
| `hookRecords` | `false` | ligue se um hook seu acrescenta registros de memória numerados como `[#123]`; aparecem em Memória só pelo número. Esse número no texto de qualquer hook conta, não só de um hook de memória |

### Só em terminal

| Opção | Padrão | Significado |
| --- | --- | --- |
| `terminalView` | `text` | como o mapa aparece em um terminal: `text`, só as linhas; `picture`, o mapa como imagem acima delas em terminal que mostra imagens, no iTerm2 a partir da 3.7.8; ou `braille`, o mapa acima delas em pontos de braille, em qualquer terminal cuja fonte tenha braille. Veja [Em um terminal](#in-a-terminal) |
| `cellShape` | `2.4` | para a imagem do terminal: quantas vezes uma célula de terminal é mais alta do que larga, de 1.2 a 4, para que a imagem preencha sua caixa; veja [Em um terminal](#in-a-terminal) |

Por exemplo, rótulos em russo e seu próprio servidor de memória:

```bash
echo '{"language":"ru","memoryServers":"my-memory"}' | claude plugin configure lot-map@lot-map --values-stdin
```

O mapa em si em um terminal que não mostra imagens:

```bash
echo '{"terminalView":"braille"}' | claude plugin configure lot-map@lot-map --values-stdin
```

Sem avisos sobre hooks ignorados em login Team ou Enterprise:

```bash
echo '{"guardedHooks":"false"}' | claude plugin configure lot-map@lot-map --values-stdin
```

Todo valor é escrito como string, `"false"` e `"2.4"` inclusive, e listas são escritas com vírgulas.

| Rótulos em russo | `layout` em `you-bottom` |
| --- | --- |
| <img src="docs/map-russian.png" width="320" alt="O mapa com rótulos em russo"> | <img src="docs/map-turned.png" width="320" alt="O mapa girado, com a pessoa embaixo"> |

## Cores próprias

`colors` substitui as cores do mapa uma a uma. Defina uma, algumas ou todas as treze; o que deixar de fora fica como está.

```bash
echo '{"theme":"dark","colors":"accent=#7fb4ff,active=#b8d6ff,text=#e6edf7"}' | claude plugin configure lot-map@lot-map --values-stdin
```

| Nome | O que colore |
| --- | --- |
| `background` | o fundo do mapa e a borda ao redor dos rótulos |
| `node` | o interior de uma estação e do centro |
| `line`, `spoke` | os contornos tracejados e os raios parados |
| `text`, `label`, `faint` | o nome no centro e os rótulos acesos, os outros rótulos, as contagens |
| `accent`, `active` | a cor principal e uma estação em trabalho |
| `error` | erros e recusas |
| `memory`, `memoryActive` | a estação Memória e seu raio |
| `route` | a rota entre estações |

<img src="docs/map-colors.png" width="640" alt="O mapa em duas paletas próprias: uma azul fria e uma verde">

- Só `#rgb` e `#rrggbb` são aceitos. Qualquer outra coisa, e qualquer outro nome, conta como não definido.
- Com `theme` em `auto`, uma cor própria vale também em superfície clara, e o resto é repintado como antes. Com paleta própria completa, defina `theme` como `dark` ou `light`.
- Com `background` em `transparent`, ainda dê aqui a `background` a cor do seu painel: a borda ao redor dos rótulos a toma, e a aura desaparece.

## O que ele mostra e o que guarda

O mod não faz requisições de rede, não lê arquivos, não roda processos, não chama modelo e não acrescenta nada à conversa. Suas linhas vivem só para a sessão. O mesmo em uma página: [Privacidade](PRIVACY.md).

Como qualquer mod que acompanha chamadas de ferramentas, ele recebe a entrada inteira de cada chamada, inclusive linhas de comando e o texto escrito em arquivos. Delas toma apenas os nomes; o código que faz isso é `classify` em `hooks/classify.ts`. Um marketplace acrescentado a partir deste repositório acompanha seu branch `main`, então uma atualização traz o que quer que esteja lá: leia o diff antes de atualizar se isso importa para você.

Por padrão, ele pede ao Claude Code uma coisa: o quanto a janela de contexto está cheia, após cada passo do modelo. Com `contextCost` ligado, guarda também, da mesma resposta, quantos tokens aquilo é e coloca um número em cada linha e estação; não lê mais nada para isso. Com `contextWindow` em `compaction`, pede também como o contexto se divide, no primeiro passo do modelo de uma sessão e de novo após uma compactação ou mudança de modelo, e da resposta toma só o tamanho da janela de compactação automática. Entre sessões, guarda uma coisa: o nome do modelo usado por último em cada pasta, para poder mostrar uma mudança. Cada item é armazenado sob o caminho completo da pasta, no próprio armazenamento do plugin do Claude Code.

O que seus hooks fazem. O mod escuta o início da sessão, prompts, turnos, passos do modelo, chamadas de ferramentas, skills, compactação e, com `subagentNames` ligado, o início de um subagente, além de três eventos de hooks de configurações: `PreToolUse`, em que vê se um hook recusou a chamada, pediu permissão ou demorou, e `UserPromptSubmit` e `SessionStart`, em que vê o contexto que um hook acrescentou. Cada um de seus hooks repassa o evento como veio e devolve o que voltou como era: não muda entrada, resultado, contexto nem decisão de permissão, e não faz nenhuma própria. Seu único comando, `/lot-map`, abre o painel.

Um rótulo guarda um nome, nunca conteúdo:

- um arquivo: as duas últimas partes de seu caminho;
- um endereço web: só o host, sem login, senha, caminho ou query; um endereço que pode ser lido de duas formas mostra apenas seu scheme;
- um comando de shell ou monitor: a descrição curta que o Claude escreveu para ele, ou o nome do comando, nunca a linha de comando. A descrição são as palavras do próprio modelo, e o mod as mostra como escritas;
- uma busca: o nome da ferramenta para `Grep` e `Glob`, as palavras `web search` para busca web e `loading tools` para busca de ferramentas, no idioma do mapa, nunca o padrão ou a query;
- uma chamada de memória: o nome da ferramenta e um número de registro ou identificador curto, nunca o texto ou a query;
- um comando de memória: seu nome e a palavra seguinte só se você listou essa palavra em `memorySubcommands`;
- um subagente: a descrição curta com que foi iniciado; com `subagentNames` ligado, seus primeiros 40 caracteres também nos passos do modelo daquele subagente;
- o relatório de uma tarefa em segundo plano: que a tarefa terminou e se falhou, nunca seu resumo ou sua saída;
- a recusa de um hook: o nome da ferramenta que ele parou. Sua primeira linha aparece só com `hookReasons` ligado, porque uma recusa pode citar o que o hook encontrou.

Caracteres de controle são retirados de todo rótulo antes de ele ser desenhado.

Uma falha no mapa nunca alcança uma chamada de ferramenta ou um turno do modelo.

## Desenvolvendo

```bash
claude plugin test .
claude plugin validate .
```

As palavras ficam em `hooks/text.ts`; um novo idioma é mais uma tabela lá e mais um valor de `language` em `.claude-plugin/plugin.json`.

A imagem do terminal é feita por três arquivos: `hooks/scene.ts` lê o desenho que `drawMap` faz, `hooks/raster.ts` o pinta e `hooks/png.ts` empacota os pixels para o terminal. Um teste pinta todo tipo de desenho e falha em qualquer coisa que o pintor não conhece, então uma mudança no desenho que precise de mais SVG aparece primeiro ali. Outro, `the terminal picture's font has every letter the map writes, in every language`, nomeia as letras que um novo idioma precisa acrescentar a `hooks/font.ts`; [FONTS.md](FONTS.md) diz como refazer esse arquivo.

O mapa em braille é desenhado por `hooks/braille.ts`: um segundo desenho do mesmo tabuleiro, que toma suas estações de `STATIONS` e seus tempos de `hooks/draw.ts`. Testes em `hooks/braille.test.tsx` o mantêm fiel a toda estação nos dois layouts, e um em `hooks/lot-map.test.tsx` aos nomes de todo idioma. Algo novo no mapa ou é desenhado lá também ou entra na lista do que o braille deixa de fora, em [Em um terminal](#the-map-in-braille-dots): o `INVENTORY` em `hooks/braille.test.tsx` tem uma linha para cada coisa que o primeiro desenho mostra, um teste mantém os dois desenhos ligados a ele, e `scripts/check-surface.mjs` mantém essa lista nas mesmas linhas.

Antes de enviar uma mudança, leia [CONTRIBUTING.md](CONTRIBUTING.md). A que o mod se mantém fiel, e a verificação por trás de cada ponto, está em [PRINCIPLES.md](PRINCIPLES.md).

## Licença

[MIT](LICENSE)
