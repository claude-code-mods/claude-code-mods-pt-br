# Operator Memory para Claude Code

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

O Operator Memory oferece ao Claude Code contexto durável de projeto e usuário, mantido por agents como Markdown legível.

## Instalação

Requer Claude Code `v2.1.287` ou superior e o Operator Helper no `PATH`.

```sh
operator-helper install claude-code
```

Inicie um novo processo do Claude Code após a instalação. Execute `claude plugin list` para confirmar que `operator@operator-memory` está habilitado e pergunte ao agente se as orientações do Operator Memory estão disponíveis.

O plugin injeta o preâmbulo no prompt do sistema principal e nos prompts de tarefa dos subagents. Ele renderiza a memória uma vez por processo; reinicie o Claude Code para recarregar a memória. `/clear` não atualiza o preâmbulo em cache.

## Comandos

- `/operator:user-init` — Configura a partição do usuário.
- `/operator:project-init` — Configura o cérebro do projeto.
- `/operator:index` — Cria ou atualiza o índice do projeto.

## Atualização

O helper habilita a atualização automática do marketplace Operator durante a instalação, inclusive em instalações repetidas. Desative depois em `/plugin` → Marketplaces, se quiser.

Execute novamente `operator-helper install claude-code` ou use `claude plugin update operator@operator-memory` e reinicie o Claude Code.

Consulte o [guia do Claude Code](https://github.com/aerovato/operator-memory/blob/main/docs/harnesses/claude-code.md) para verificação, atualizações e solução de problemas. Para desenvolvimento local, execute `bun run preview:claude-code` na raiz do workspace.

## Fonte e licença

- Autor original: aerovato (aerovato)
- Repositório original: https://github.com/aerovato/operator-memory
- Licença: MIT
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
