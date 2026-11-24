# prismantis

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

Um mod do Claude Code que redesenha as respostas do Claude em cores: tabelas, títulos, listas, citações, código realçado, números, caminhos e links, diagramas e gráficos Mermaid, além de linhas de ferramentas, em 17 temas, com botões de copiar. Execute `/prismantis setup` para escolher uma aparência ou `/prismantis demo` para ver tudo que ele desenha.

Capturas de tela, todas as opções e o registro de mudanças estão no [README completo](https://github.com/NahumLitvin/prismantis#readme).

## O que ele executa, lê e altera

O Prismantis não faz chamadas de rede. Tudo abajo permanece na sua máquina.

- **Programas.** Clicar em `⧉ html` ou `▣ png` executa o auxiliar de área de transferência com a tabela, o diagrama ou a figura copiada na entrada padrão: `osascript` no macOS, `powershell.exe` no Windows (ele lê `SystemRoot` para encontrá-lo) ou `copyq` no Linux. Com `latex` ativado, ele executa `ratex-render` do seu `PATH` com as fórmulas da resposta na entrada padrão. Nada mais é executado.
- **Arquivos.** Ele lê um PNG local que uma resposta vincula como imagem Markdown, de até 2 MB, para desenhá-lo no kitty ou Ghostty. Ele relê os PNGs que `ratex-render` grava em `$TMPDIR/prismantis-latex-<session>-<id>`. Ele não escreve arquivos por conta própria.
- **Configurações.** `/prismantis setup` e `/prismantis theme` salvam sua escolha via `/config`, apenas nas opções próprias do prismantis (`prismantis.theme`, `prismantis.tableStyle` e as outras etapas de configuração). Nada mais nas suas configurações é alterado.
- **Cores do aplicativo desktop.** Apenas enquanto `desktopColors` é `match`: no início da sessão e em `/prismantis theme`, ele define as cores do aplicativo desktop para a sessão via `$.theme.set`, a partir da paleta atual. Voltar `desktopColors` para `off` chama `$.theme.clear()` uma vez. Ele nunca limpa no início da sessão nem em uma recarga.
- **Hooks.** Ele desenha via `ui.render`, responde ao comando `/prismantis` via `command.run`, observa sua própria linha `desktopColors` em `config.set`, adiciona a nota de [dicas de diagrama](https://github.com/NahumLitvin/prismantis#diagram-hints) voltada apenas ao modelo e, com `keyPointHint` ativado, a nota de pontos-chave em `prompt.submit`, e adiciona `$.prismantis.markdown` para [outros mods](https://github.com/NahumLitvin/prismantis#other-mods) em `engine.create`. `prismantis.markdown` é o próprio evento dessa chamada.

## Licença

[MIT](LICENSE), de Nahum Litvin. O código e as paletas de terceiros incluídos são creditados em [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Fonte e licença

- Autor original: Nahum Litvin (NahumLitvin)
- Repositório original: https://github.com/NahumLitvin/prismantis
- Licença: MIT
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
