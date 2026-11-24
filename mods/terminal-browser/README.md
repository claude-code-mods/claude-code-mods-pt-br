# plugin terminal-browser para o Claude Code

> Este plugin é experimental e tem algumas [limitações conhecidas](#caveats).



https://github.com/user-attachments/assets/a79e7667-6fcb-49a4-9967-44d0f942102c



## Instalação

Instale o terminal-browser
```
curl -fsSL https://terminal-browser.sh/install | bash # or brew install terminal-browser
```

Certifique-se de estar na versão mais recente do claude code
```
claude update
```

Habilite os plugins de interface do claude code adicionando isto ao seu `~/.claude/settings.json`:
```json
{
  "env": { "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1" }
}
```



Instale o plugin terminal-browser
```
# configurar o marketplace
claude plugin marketplace add zenbu-labs/terminal-browser

# instalar o plugin
claude plugin install terminal-browser@terminal-browser
```

Agora você pode executar "/browser" dentro do claude code para abrir o navegador

### Atualização

Atualize o plugin do claude code
```
claude plugin update terminal-browser@terminal-browser
```

Atualize o terminal-browser
```
terminal-browser upgrade
```

### Configuração

Você pode configurar o plugin terminal-browser para incluir uma ferramenta que o claude pode usar para abrir o navegador. Isso vem desligado por padrão, pois o claude já pode usar a CLI `terminal-browser` para abrir o navegador dentro do terminal, em um painel dividido. Você pode habilitar a ferramenta adicionando o seguinte ao seu `~/.claude/settings.json`:

```json
{
  "pluginConfigs": {
    "terminal-browser@terminal-browser": {
      "options": {
        "agentTool": true
      }
    }
  }
}
```


## API do plugin terminal-browser

O plugin terminal-browser vem com uma API que você pode usar em outro plugin do claude code para abrir o navegador e carregar uma URL de forma programática. Alguns exemplos de plugins úteis que você pode construir com isso:
- comando slash `/tldraw` que abre o tldraw no painel dividido do claude code
- comando slash `/open-pr` que abre o PR associado ao branch em que você está trabalhando

```typescript
export type BrowserOpenInput = { url?: string }

export type BrowserOpenResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export type Browser = {
  open: (input: BrowserOpenInput) => Promise<BrowserOpenResult>
  close: (input?: Record<string, never>) => Promise<boolean>
}

// usage: in your plugin's hooks module
on('command.run', { command: 'tldraw' }, async ($) => {
  const result = await $.browser.open({ url: 'https://www.tldraw.com/' })
  return { text: result.ok ? 'Opened tldraw' : result.error }
})
```

## Como funciona?

O terminal-browser usa o [protocolo gráfico do kitty] para exibir pixels gerados por um navegador real dentro do terminal. Para mostrar o navegador dentro do claude code, usamos a nova [API de function hooks do claude code](https://github.com/anthropics/claude-code/issues/91870).

Os internos do terminal-browser foram extraídos para uma biblioteca JavaScript - https://github.com/zenbu-labs/terminal-browser/tree/main/pixel - caso você queira criar sua própria aplicação gráfica dentro do claude code/do terminal.


## Terminais suportados

O plugin terminal-browser para o claude code só funciona em terminais que suportam o [protocolo gráfico do kitty] e implementam [espaços reservados unicode do kitty](https://sw.kovidgoyal.net/kitty/graphics-protocol/#unicode-placeholders). Os terminais mais populares que suportam esse recurso são:
- [ghostty](https://ghostty.org)
- [kitty](https://sw.kovidgoyal.net/kitty/)

Se o seu terminal não suporta os recursos necessários, tentar abrir o navegador dentro do claude code pode bagunçar a TUI.

Além disso, todos os terminais construídos sobre o libghostty suportam este recurso; alguns exemplos são:
- [cmux](https://cmux.com/)
- [supacode](https://supacode.sh/)

Você pode encontrar mais terminais baseados no libghostty aqui: [awesome-libghostty](https://github.com/Uzaaft/awesome-libghostty)

Mesmo que o seu terminal suporte o recurso gráfico necessário, se você estiver usando um multiplexador, o plugin pode não funcionar. Isso ocorre porque os multiplexadores reescrevem a saída dos programas de terminal e quebram os comandos gráficos do terminal. O suporte ao tmux está chegando em breve (o terminal-browser funciona no tmux atualmente, só ainda não pelo plugin do claude code), e dentro do herdr o desempenho é muito ruim ao usar o plugin do claude code, mas deve melhorar em breve. Outros multiplexadores não foram testados; se não funcionar, abra uma issue e verei se podemos dar suporte.



## Ressalvas:
- depende do seu terminal suportar o [protocolo gráfico do kitty]
- a posição do mouse às vezes ficará um pouco deslocada, pois o claude code não habilita o relatório de coordenadas de pixels do mouse
- o plugin precisa fazer requisições fetch a um servidor HTTP local para se comunicar com a CLI do terminal-browser, o que pode fazer com que seu sistema operacional mostre um aviso de que o terminal quer acessar a rede local
- o claude code define uma largura mínima muito alta para a área do chat, então às vezes não é possível redimensionar o navegador para o tamanho desejado
- o plugin depende da API experimental de function hooks do claude code, que é instável, então o plugin pode quebrar entre versões

[protocolo gráfico do kitty]: https://sw.kovidgoyal.net/kitty/graphics-protocol/
