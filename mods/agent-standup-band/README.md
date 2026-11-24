# Agent Standup band

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

![Agent Standup](.claude-plugin/icon.png)

Uma linha acima do campo de entrada do Claude Code quando outra sessão neste computador precisa de você:

    ✋ web-shop (VS Code) needs an approval
    Agent Standup · /agent-standup:open shows them all   Hide

e um aviso curto quando uma começa a esperar por você ou termina seu turno. Você permanece na sessão em que está trabalhando e ainda fica sabendo quando outra está presa em uma pergunta ou aprovação.

É um mod: um plugin dos function hooks do Claude Code. Ele desenha no terminal e na aba Code do aplicativo desktop do Claude. No VS Code, a [extensão Agent Standup](https://marketplace.visualstudio.com/items?itemName=DoubleGeste.agent-standup) mostra o mesmo na barra de status.

## Instalação

No Claude Code 2.1.294 ou superior:

    /plugin install agent-standup-band --marketplace Atoll92/agent-standup

Com uma versão anterior, ele carrega mas não faz nada: essas versões não executam mods (e antes de 2.1.221 no terminal, 2.1.269 em outros lugares, também não gravam o status que ele lê).

Para ver todas as sessões como uma chamada de equipe ao vivo, instale também o plugin principal: `/plugin install agent-standup --marketplace Atoll92/agent-standup` e depois `/agent-standup:open`.

## O que ele lê e executa

- A cada 4 segundos, o arquivo de status que o Claude Code mantém para cada sessão aberta, em `~/.claude/sessions/<pid>.json` (ou sob `CLAUDE_CONFIG_DIR`): qual sessão, sua pasta e se está ocupada, ociosa ou esperando por você. Não são as conversas. Uma sessão iniciada por um programa com `claude -p` fica de fora: suas perguntas vão para esse programa. Um aplicativo Agent SDK (Zed, um aplicativo caseiro) é mantido, pois pode mostrar seus menus a uma pessoa.
- `ps`, para verificar se uma sessão que disse estar esperando ainda está rodando: uma sessão que travou deixa seu arquivo para trás.

Ele não escreve nada e não envia nada a lugar nenhum.

## Mais

Código e issues: https://github.com/Atoll92/agent-standup. Não oficial: não afiliado nem endossado pela Anthropic. Licença MIT.

## Fonte e licença

- Autor original: Atoll92 (Atoll92)
- Repositório original: https://github.com/Atoll92/agent-standup
- Licença: MIT
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
