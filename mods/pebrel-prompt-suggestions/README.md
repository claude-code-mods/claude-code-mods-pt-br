# Previsões nativas de prompt do Claude Code

> Tradução para português (Brasil) pelo projeto claude-code-mods-pt-br. O autor e a licença originais estão no final. A versão original em inglês está em [README.en.md](README.en.md).

Este adaptador gerenciado usa os function hooks nativos do Claude Code. Foi verificado com o Claude Code 2.1.310; versões antigas não são declaradas como suportadas. Ele é carregado em um novo processo com `--plugin-dir <absolute-adapter-directory>` e `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`. Carregar um adaptador não o instala na configuração global do usuário.

O lançador deve fornecer `PEBREL_PREDICTION_ENDPOINT` (um endereço HTTP IPv4 de loopback com porta), `PEBREL_PREDICTION_TOKEN` e `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false`. A última variável desativa a inferência de previsão integrada do Claude Code para esse processo. Sem ela, o adaptador não faz nada, evitando duas requisições de inferência para o mesmo turno concluído. Nenhuma configuração global ou do modelo principal é alterada.

Só é elegível um turno principal bem-sucedido com o campo de entrada do terminal montado e vazio. `$.session.messages()` fornece texto de usuário e assistente em memória; os payloads de ferramentas não são enviados. A ponte recebe no máximo 24 mensagens, 3000 unidades UTF-16 por mensagem e 12000 unidades no total. O Pebrel controla o prompt de previsão, o provedor configurado, o idioma e outros limites de contexto. O adaptador não adiciona prompt de estilo de fala nem persistência.

O `loading_text` localizado da ponte aparece no rodapé `PromptHint` esmaecido do Claude Code, seguido de `.`, `..` e `...` a cada 400 ms. Ele não é editável e nunca é enviado a `prompt.suggest`. Um candidato concluído usa o `$.prompt.suggest({text})` nativo, então o comportamento nativo de Tab/seta direita preenche o campo sem enviá-lo. O campo continua sob controle do Claude Code.

Editar, mudanças de prompt, novos turnos, fim da sessão e um prazo de dez segundos invalidam o trabalho de interface pendente. Cada resultado verifica novamente a revisão, a sessão e o rascunho vazio. A API nativa `http.fetch` não tem sinal de abortamento: aqui o cancelamento suprime resultados obsoletos, enquanto a ponte controla o prazo de rede/requisição. Quando a interface de previsão está ociosa, não restam sondagens de disco nem timers.

Execute o contrato de comportamento com `node --test tests/*.test.mjs` e o verificador real do Claude com `claude plugin validate --strict --json <adapter-directory>`. Testes simulados não estabelecem aceitação visual nativa no terminal nem compatibilidade com uma versão não testada do Claude.

## Fonte e licença

- Autor original: Kuddev (Kuddev)
- Repositório original: https://github.com/Kuddev/pebrel
- Licença: GPL-3.0
- Tradução e localização da interface para português (Brasil): projeto claude-code-mods-pt-br
