# Melhores Mods do Claude Code

{{languages}}

**Selecionados, validados e com versão fixada. Adicione uma vez, {{count}} mods.**

> **Todos os {{count}} mods estão totalmente localizados em português (Brasil).** Cada rótulo, comando, painel, prompt e README foi traduzido; as fontes dos plugins são distribuídas dentro deste repositório, então a interface já está em português (Brasil) após a instalação, sem nenhuma configuração adicional. Apenas identificadores de código, nomes de eventos de hook, skills e instruções voltadas ao modelo permanecem em inglês, para que o comportamento não mude.

Mods são plugins do Claude Code feitos de function hooks: observam, alteram ou respondem ao que o Claude Code faz, e desenham sua própria interface. Este mercado reúne os melhores mods da comunidade. Cada um é verificado com `claude plugin validate` e fixado no commit verificado, de modo que alterações posteriores do autor nunca cheguem a você sem revisão.

Requer Claude Code 2.1.287 ou superior.

## Instalação

Em uma sessão do terminal do Claude Code:

```
/plugin marketplace add claude-code-mods/claude-code-mods-pt-br
/plugin install <mod>@claude-code-mods-pt-br
```

Por exemplo `/plugin install terminal-browser@claude-code-mods-pt-br`. Execute `/plugin marketplace update claude-code-mods-pt-br` para obter novos mods e atualizações.

## Catálogo

**Permissões** em cada cartão lista o que o validador informa que o código do mod pode fazer além de desenhar a interface. Leia o código-fonte de um mod antes de instalá-lo: a validação lê o código sem executá-lo e não é uma auditoria de segurança.

{{catalog}}

## Sugerir um mod

Abra uma issue com o link para o repositório do mod. Para adicionar um você mesmo, adicione uma entrada em `community.json` (repositório, pasta, commit revisado, categoria, licença), adicione as introduções em uma linha em `readme/summaries.json`, execute `python3 scripts/build-catalog.py` e abra um pull request.

## Agradecimentos e localização

Cada mod pertence ao seu autor original e mantém sua própria licença. Além de coletá-los, este repositório também fornece uma **localização em português (Brasil)**: os plugins são empacotados em `mods/`, seus rótulos, descrições de comandos, painéis e prompts são traduzidos e a documentação de cada mod também é traduzida (a original é mantida como `README.en.md`). O autor e a licença originais são creditados ao final de cada documento. Se você quiser que uma cópia localizada seja removida ou sua atribuição alterada, por favor abra uma issue.

Projeto não oficial, não afiliado à Anthropic.
