# Inicio de evento - Story 3.3

Implementado em 2026-09-08 nas rotas `/eventos/iniciar` e `/admin/eventos/iniciar`.
Referencia: Angular `libs/adm/eventos/iniciar-evento/iniciar-evento.component.ts`.

## Contratos e comportamento

- GET `/api/evento-templates`: modelos disponiveis pelo escopo autenticado, com paginacao.
- GET `/api/grupos`: destinos da estrutura, filtrados pela facade `can(criar,eventos)`.
- GET `/api/eventos/conflitos`: verifica sobreposicao real de eventos ativos no mesmo grupo/estrutura e impede criacao nesses casos.
- POST `/api/eventos`: payload snake_case, grupo positivo e horario local sem deslocamento.
- POST `/api/eventos/{id}/materializar`: materializa a primeira ocorrencia.
- PUT `/api/ocorrencias/{id}/status`: inicia como `EmAndamento`.
- Navegacao por evento ID e dia local; retorno a Meus Eventos quando criacao nao fornece ID ou inicio posterior falha.
- Falha apos criacao bloqueia novo submit; contexto/permissao/offline sao revalidados entre etapas.
- React Hook Form + Zod; campos travados pelo modelo, data real, termino coerente e mensagens de validacao por campo.
- Wizard mobile em tres etapas, alinhado ao Angular: dados principais, destino/confirmacao e periodo. No desktop as etapas permanecem abertas para leitura e edicao continua.
- Endereco estruturado com CEP, logradouro, numero, complemento, bairro, cidade e UF; o payload continua enviando `local` composto no contrato existente.
- `rrule` 2.8.1, ja utilizado no Angular, gera recorrencia sem implementar um motor proprio.
- Analytics: visualization transversal, entrance na selecao, simulation no envio, confirmation separada para criacao e inicio.

## Evidencia

- `npm run check:evento-inicio`: testes executam schema, service e adaptador HTTP reais; validam datas, restricoes, contexto, conflitos, snake_case e falha parcial.
- `npm run smoke:evento-inicio`: Playwright com Edge e API interceptada; 390x900 e 1440x900, criacao unica e navegacao, sem erro JS ou overflow horizontal.
- Screenshots em `tests/artifacts/evento-inicio/form-{390,1440}.png`.
- O smoke requer Playwright resolvivel por `PLAYWRIGHT_MODULE` ou instalado no ambiente de testes, e servidor local na porta 8083.
- Nao foi realizado teste autenticado contra producao ou em dispositivo Android/iOS.

## Lacunas que impedem declarar paridade total

- `Eventos/Conflitos.cs` consulta `EventosConflitoSpec`, que filtra eventos ativos do mesmo grupo/estrutura por sobreposição de intervalo. O client trata a resposta e erros operacionais.
- `CreateEventoRequest` nao aceita selecao de responsaveis. A configuracao posterior pertence ao acompanhamento; nao enviar campos ficticios na criacao.
- O backend ja resolve `grupo_e_filhos` com a hierarquia completa. A facade visual do React ainda usa o grupo ativo para decisões síncronas de navegação; a autoridade final permanece no backend e a ampliação da facade continua registrada para uma evolução de contexto hierárquico.
- Acompanhamento continua na Story 3.4. A navegacao foi verificada ate a rota existente.

Atualizacao de patches Expo 57.0.20 e Expo Router 57.0.19 para atender ao expo-doctor no ambiente atual.
