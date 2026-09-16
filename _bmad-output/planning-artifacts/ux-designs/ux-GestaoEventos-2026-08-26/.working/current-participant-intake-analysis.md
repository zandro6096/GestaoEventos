# Analise: Indicadores nos fluxos atuais de Participante

## Conclusao

O PRD/CU original considerava corretamente matriz, perfil e configuracao, mas precisava explicitar melhor o momento de entrada do dado. No produto atual, faz sentido preencher "batizado", "dizimista" ou qualquer label configurada ja no cadastro/vinculo da pessoa, porque esse e o momento em que o responsavel normalmente sabe a informacao.

## Fluxos atuais observados

- `GestaoEventos.Angular/src/app/libs/adm/eventos/add-participante/add-participante.component.*`: e o fluxo mais completo. Ele suporta pessoa existente, participante virtual, importacao, data de nascimento, endereco, funcao, escopo de participacao, selecao de varios encontros e modo matriz.
- `GestaoEventos.Angular/src/app/libs/adm/grupo/dialogs/adicionar-membro-dialog.component.*`: vincula pessoa da estrutura ao grupo ou cria convite por e-mail; tambem trata responsavel e papel.
- `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.*`: hoje edita papel estrutural e papeis customizados em `admin/membros`; e um bom ponto secundario de manutencao, mas nao substitui o cadastro/vinculo.
- Backend atual: `AddParticipanteRequest`, `AdicionarParticipanteMatrizRequest` e `CreateUsuarioVirtualRequest` aceitam identidade, contato, nascimento, endereco, escopo, grupo, papel e vinculo, mas ainda nao carregam valores dinamicos de indicadores.

## Recomendacao de UX

Criar um bloco reutilizavel `applicable-indicators-section`:

- Aparece nos fluxos de adicionar participante, adicionar membro ao grupo e editar membro da estrutura.
- Carrega apenas indicadores ativos, aplicaveis, visiveis e editaveis para Estrutura ativa, Grupo, Papel e pessoa selecionada.
- Fica opcional. Salvar sem preencher indicadores mantem o comportamento atual.
- Para pessoa existente, mostra valores atuais e grava somente campos alterados.
- Para participante virtual novo, grava os valores iniciais junto da criacao/vinculo ou imediatamente depois, sem sucesso silencioso se a segunda etapa falhar.
- Para importacao em lote, nao tenta pedir valores por pessoa dentro do modal; o melhor fluxo e importar e abrir a matriz filtrada.

## Impacto para arquitetura futura

- Frontend deve seguir a camada atual `Component -> Business Service -> API Service`; o bloco de UI nao deve chamar HTTP direto.
- Backend precisa decidir entre gravacao atomica de participante + indicadores ou retorno parcial explicito. O requisito e nao esconder falha de valores como sucesso completo.
- Permissoes de indicadores restritos precisam ser resolvidas no backend e refletidas pela UI; campos ocultos nao podem vazar por DOM, tooltip, filtro ou analytics.
- Eventos continuam sendo ocorrencias; Indicadores ficam associados a pessoa/estrutura, com grupo/evento apenas como contexto de origem quando aplicavel.
