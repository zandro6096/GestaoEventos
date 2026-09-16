# Paridade do Detalhe de Grupo

A Story 4.2 e a Story 4.3 implementam `/admin/grupos/:id` e `/grupos/:id` com `GET /api/grupos/{id}`, membros por `/api/grupos-membros?grupo_id=...`, responsaveis por `/api/responsaveis-grupo?grupo_id=...` e ocorrencias relacionadas por `/api/ocorrencias` com estrutura/grupo ativos.

O detalhe valida que o grupo pertence a estrutura ativa antes de exibir dados, mantem query key com usuario/estrutura/grupo e trata falhas de acesso ou inexistencia com erro acionavel. As abas resumem hierarquia, membros, responsaveis e eventos; as mutacoes administrativas usam APIs e hook de negocio dedicados.

Evidencias: `npm run check:grupo-detalhe`, `npm run smoke:grupo-detalhe` em 390/1440 px, type-check, lint, scaffold e expo-doctor.
