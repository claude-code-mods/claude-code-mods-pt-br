# lane-stack (plugin do Claude Code)

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

A metade voltada ao Claude do Claude Lane Stack: agents de PM, comandos de barra e skills de cartilha.

Instale pelo marketplace do repositório (não copiando para `~/.claude/agents` / `~/.claude/skills`):

```bash
claude plugin marketplace add VKirill/claude-lane-stack
claude plugin install lane-stack@claude-lane-stack -y
```

`./install.sh` registra esse marketplace do GitHub com `autoUpdate: true` e ainda sincroniza o runtime do host (`bin/`, quadro e perfis de escrita) em `~/.agents`. Os arquivos do host não são atualizados automaticamente — execute `./install.sh` novamente. Para usar o checkout local: `LANE_INSTALL_LOCAL_MARKETPLACE=1 ./install.sh`.

As skills usam o namespace `/lane-stack:<skill>`. Folha de consulta de trabalho: `/lane-stack:info` ou `/info`. Para falar de um novo aplicativo ou serviço: `/lane-stack:app-architect`. Documentação viva: `/lane-stack:docs-maintain`. Corpus de fatos: `/lane-stack:lane-memory`. As cartilhas de PM (`orchestrator-lanes`, `orchestrator-workflow`, `info`, `app-architect`) existem apenas neste plugin e em `~/.agents/pm-skills` — não são copiadas para o catálogo compartilhado de escrita.

## Fonte e licença

- Autor original: VKirill (VKirill)
- Repositório original: https://github.com/VKirill/claude-lane-stack
- Licença: MIT
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
