# Painel jevmem

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

Um painel lateral para o Claude Code, ao lado do chat, que mostra o que o [jevmem](https://github.com/Avinash-jetwani/jevmem) fez com o prompt que você acabou de enviar e com o turno que terminou:

1. **Recuperado para este prompt**: cada linha de memória entregue ao Claude (seu id, tipo e texto) e quantas foram retidas.
2. **O guardião**: a última chamada sobre a qual o guardião perguntou ou que negou, com a regra e sua pontuação, associadas à chamada.
3. **Salvo no último turno**: a linha que o jevmem salvou do turno e seu tipo, ou por que o turno foi ignorado.

Cada linha tem botões `why`, `wrong` e `forget`. `forget` e `wrong` alteram `JEVMEM.md` (a linha é mantida como `[retired]`), por isso pedem confirmação antes; uma regra é retirada apenas no terminal, como funciona `jevmem trust`. O painel lê três arquivos locais em `.jevmem/` e executa o comando `jevmem` por vetor de argumentos; não envia nada a lugar nenhum e não lê chaves.

## Instalação

No Claude Code, com o marketplace jevmem adicionado (`claude plugin marketplace add Avinash-jetwani/jevmem`):

```
/plugin install jevmem-pane@jevmem
```

Requer o comando jevmem (`npm install -g jevmem`) e um projeto ativado (`jevmem setup`). O painel abre sozinho em um terminal com 144 colunas ou mais; `/jevmem` abre ou fecha em qualquer largura (encostado ao chat a partir de 110 colunas no terminal em tela cheia, acima do campo de entrada abaixo disso). Somente Claude Code: o Cursor não tem painel.

A descrição completa, com o significado de cada estado, está em [docs/pane.md](https://avinash-jetwani.github.io/jevmem/pane/).

## Fonte e licença

- Autor original: Avinash Jetwani (Avinash-jetwani)
- Repositório original: https://github.com/Avinash-jetwani/jevmem
- Licença: MIT
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
