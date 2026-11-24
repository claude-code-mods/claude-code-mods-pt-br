# Token Optimizer Desktop

Uma barra de status para o aplicativo desktop do Claude. Ela aparece acima do seu prompt e mostra a qualidade da sessão, o preenchimento do contexto, a contagem regressiva do cache e seus limites de 5 horas e semanal, com o Clawd encenando o que a sessão está fazendo.

## Instalação

Ela vem dentro do plugin Token Optimizer (`hooks/hooks.json` nomeia o `hooks/register.tsx` desta pasta sob `modules`), então não há nada extra para instalar. Esta pasta mantém seu próprio manifesto apenas para que seus testes rodem isoladamente com `claude plugin test`. `npm run typecheck` e `npm test` cobrem os módulos puros (CI); `npm run typecheck:engine` verifica `hooks/` e `tests/engine/` em relação às declarações da API de plugins do Claude Code, que só a CLI claude escreve, então roda localmente.

Requer Claude Code 2.1.287 ou mais recente e o recurso de mods da Anthropic. A Anthropic pode desligar os mods remotamente; quando desligados, nada quebra — a barra simplesmente não aparece. O terminal mantém sua linha de status atual. Não há suporte para o VS Code.

Para verificar se está ativa, abra uma sessão desktop do Claude com o plugin Token Optimizer habilitado. Procure a faixa do Token Optimizer acima do prompt, com o Clawd e a contagem regressiva do cache. Se ela não aparecer, verifique se o plugin está habilitado, se os mods estão disponíveis e se `TOKEN_OPTIMIZER_STATUS_BAR` não é `0`; depois reinicie a sessão. O `hooks/hooks.json` do plugin registra `desktop/token-optimizer-desktop/hooks/register.tsx`.

Para verificar o agendamento sem usar sua sessão, execute `python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action --selftest`. Ele imprime `PASS` ou `FAIL` e usa um diretório de dados temporário. Diagnósticos de ações falhas são registrados no diretório de dados do Token Optimizer como `mod-actions.log`.

## O que você ganha

- Uma frase sobre a coisa mais urgente, com no máximo um botão.
- Cinco marcadores com cartões ao passar o mouse: nota de qualidade, preenchimento do contexto, contagem regressiva do cache, limite de 5 horas e limite semanal.
- **A seta ao lado do Clawd** abre uma linha extra: branch, tempo de sessão, chamadas de ferramentas, compactações (se houver), quando o último checkpoint foi salvo (de qualquer tipo, ou um relevante de uma sessão anterior) e os tokens que o Token Optimizer economizou para você nos últimos 30 dias — o mesmo total mostrado no painel.
- Botões: **Limpar** (compacta com as orientações do Token Optimizer), **Começar do zero** (no segundo clique salva um checkpoint, limpa e entrega isso à sua primeira mensagem) e **Manter aquecido** (atualização manual do cache com um clique, apenas enquanto o cache está quente, nunca automática, usa uma pequena quantidade de uso).
- **Painel completo**: um link em texto simples no fim da linha expandida, nos dois tamanhos da faixa (a faixa recolhida não mostra). Clicar nele executa `measure.py dashboard`, o mesmo comando da skill `token-dashboard`: ele regenera a página do painel e a abre no seu navegador padrão (`open` no macOS, `xdg-open` no Linux, associação de arquivos no Windows). Enquanto executa, a faixa diz "Abrindo o painel."; se falhar, a faixa diz "Não foi possível abrir o painel." por alguns segundos e nada mais acontece. Um segundo clique durante a execução é ignorado. O link é um Button desenhado com o estilo `plain` (sua prop está na lista de permissões do Button do engine no Claude Code 2.1.287, 2.1.294 e 2.1.296, lida das strings de cada build; testado na 2.1.294 a 2.1.296). O clique executa `measure.py dashboard --user`: `--user` marca isso como um clique de pessoa para que o orçamento de 20 segundos do hook não interrompa uma reconstrução pesada (cerca de 80 segundos a frio num histórico real e pesado), e a faixa espera até 5 minutos. Somente este link espera tanto: Limpar e Começar do zero ainda desistem após 2 minutos.

A contagem regressiva do cache é uma estimativa: 1 hora nos planos Claude, 5 minutos na API, medida da própria sessão quando possível.

## Configurações

`TOKEN_OPTIMIZER_STATUS_BAR=0` esconde a barra e `TOKEN_OPTIMIZER_STATUS_BAR_ANIMATE=0` mantém o Clawd parado, definidos no bloco `env` de `~/.claude/settings.json`. `TOKEN_OPTIMIZER_STATUS_BAR_TIME_FORMAT=24h` (ou `12h`) força o formato do relógio usado para os horários de renovação dos limites; sem isso, eles seguem sua localidade.

O botão `–` ao lado da seta encolhe a faixa para uma linha e `+` a traz de volta; a seta ainda abre a linha de detalhes abaixo dela, e a escolha é lembrada entre sessões e reinícios. `TOKEN_OPTIMIZER_STATUS_BAR_SIZE=slim` define o tamanho inicial antes de uma escolha ser armazenada, e a linha de status do terminal usa a mesma variável para imprimir uma linha.

O marcador de contexto mede em relação à sua própria janela de compactação quando você define uma: `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, `/autocompact` ou a configuração `autoCompactWindow`, dentro dos limites de 100K–1M do Claude Code e nunca acima da janela do modelo. Uma janela dada apenas com `--autocompact` para uma única execução não é visível para ele.

## Documentação completa

Veja o [README do Token Optimizer](../../README.md#desktop-status-bar) e a página do site de documentação "aplicativo desktop do Claude".

Para reservar uma tentativa de Manter aquecido pela CLI, envie um recibo JSON pela entrada padrão:

```bash
printf '%s' '{"action":"warm-prepare","action_id":"ATTEMPT_ID","session_id":"SESSION_ID","timestamp":UNIX_SECONDS,"transcript_path":"/path/to/SESSION_ID.jsonl","byte_size":FILE_SIZE,"transcript_mtime":FILE_MTIME}' | python3 <plugin>/skills/token-optimizer/scripts/measure.py mod-action
```

Substitua os marcadores pelo tamanho exato e pelo horário de modificação do arquivo de transcrição atual, por um ID de tentativa único e pelo horário Unix atual. A resposta é JSON. Isso reserva a tentativa; quem chama deve executar a requisição de aquecimento e enviar seu uso como um recibo `warm`, ou enviar `warm-cancel` se ela não for executada.
