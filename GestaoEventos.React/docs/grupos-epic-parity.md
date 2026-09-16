# Auditoria de paridade da Epic 4

## Cobertura entregue

- Lista `/admin/grupos` e `/grupos` com hierarquia, busca, filtro de nivel e leitura da estrutura ativa.
- Detalhe `/admin/grupos/:id` com resumo, membros, responsaveis e eventos relacionados.
- Gestao de membros e responsaveis com adicao/remocao de usuarios reais, convites por email e reenvio de convite virtual pendente.
- Guard de leitura e revalidacao de mutacao por permissao dinamica; queries carregam usuario, estrutura e grupo no escopo.
- Erros de API, 403, grupo fora da estrutura ativa, vazio e loading permanecem estados distintos ou acionaveis.

## Evidencia executavel

- `npm run check:grupos`
- `npm run check:grupo-detalhe`
- `npm run check:grupo-membros`
- `npm run smoke:grupos`
- `npm run smoke:grupo-detalhe`
- `npm run smoke:grupo-membros`
- `npm run check:grupos-parity`
- `npm run type-check`, `npm run lint`, `npm run test:scaffold`, `npm run check:platform`

Os smokes cobrem 390px e 1440px. O smoke de membros exercita adicionar membro, reenviar convite pendente e remover membro.

## Pendencias de contrato

O produto produtivo desativa vinculos por `DELETE /api/usuarios-estrutura/{id}` e reativa por `POST /api/usuarios-estrutura/{id}/reativar`. A UI usa o vínculo existente, reativa a pessoa e só depois conclui a associação ao grupo.
