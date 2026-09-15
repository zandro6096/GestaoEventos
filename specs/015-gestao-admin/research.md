# Phase 0 Research: Gestão Administrativa

**Feature**: 015-gestao-admin
**Date**: 2026-03-08
**Status**: Complete — todos os NEEDS CLARIFICATION resolvidos

---

## 1. Roteamento Angular — Rotas existentes vs. gap

### Decision
As rotas `/admin/configuracoes` e `/admin/usuarios` não existem no router.
As rotas funcionais já existem mas estão soltas:
- `/admin/papeis` → `PapeisComponent` ✅
- `/admin/tipos-grupo` → `TiposGrupoComponent` ✅
- `/admin/tipos-evento` → `TiposEventoComponent` ✅
- `/admin/auditoria` → `AuditoriaComponent` ✅
- `/admin/membros/:id/editar` → `UsuarioComponent` (membros, não gestão admin) ✅

### Rationale
O menu já referencia `['/admin/configuracoes']` como item de navegação, mas a rota não
está registrada → 404 ao clicar. A solução é criar uma rota shell `admin/configuracoes`
com um `ConfiguracoesComponent` que usa `p-tabView` para sub-navegar entre as seções,
**sem** quebrar as rotas existentes (que podem continuar operacionais via deep link).

### Alternatives Considered
- Usar `<router-outlet>` com rotas filhas: mais complexo, útil só se cada aba tivesse
  URL própria com deep link. Rejeitado porque o spec não menciona deep links por aba.
- Usar `p-tabView` com lazy load de componentes: mais simples, adequado ao escopo.
  **Escolhida.**

---

## 2. Componente Container — Estrutura de sub-navegação

### Decision
`ConfiguracoesComponent` usa `p-tabView` do PrimeNG com 5 abas:
1. Papéis e Permissões
2. Tipos de Grupo
3. Tipos de Evento
4. Usuários da Estrutura
5. Auditoria

Cada aba carrega o componente filho respectivo via `@if (activeTab === N)` para lazy
rendering (não lazy route).

### Rationale
- Consistente com o padrão de tabs já usado em outros lugares do projeto
- Não requer reestruturação de rotas existentes
- `ngIf` (ou `@if`) evita renderizar todos os componentes ao mesmo tempo

### Alternatives Considered
- PrimeNG `p-steps`: inadequado, implica wizard sequencial.
- Sidebar própria de configurações: requer CSS extra, sem valor adicional.

---

## 3. ConfirmDialog — Já existe, como usar

### Decision
`ConfirmDialogComponent` está em `shared/components/confirm-dialog/` e é exportado por
`shared/index.ts`. Inputs: `visible`, `title`, `message`, `type`, `acceptLabel`, `loading`.
Outputs: `(confirm)`, `(cancel)`.

Para exclusões com impacto em cascata, o `message` será dinâmico — ex:
> "Este papel está atribuído a 12 usuários. Selecione um papel substituto antes de excluir."

### Rationale
Reutilizar o componente existente evita duplicação. Apenas estender com um slot opcional
para conteúdo extra (ex: dropdown de seleção de papel substituto) se o `message` simples
não for suficiente para o fluxo de transferência de papel.

---

## 4. Backend — Endpoints faltantes para Tipos de Grupo e Tipos de Evento

### Decision
Criar `PUT /api/tipos-grupo/{id}` e `DELETE /api/tipos-grupo/{id}` (idem para tipos-evento).

Para DELETE: antes de excluir, verificar se existem grupos/eventos vinculados ao tipo.
Se houver → retornar `400 Bad Request` com lista de registros afetados.

### Rationale
Sem `PUT/DELETE` o frontend não consegue editar nem excluir tipos criados.
A verificação de impacto antes do DELETE é um requisito funcional explícito (FR-005).

### Alternatives Considered
- `PATCH` em vez de `PUT`: rejeitado pela consistência do padrão existente no projeto
  (todos os outros recursos usam `PUT` para update completo).

---

## 5. Backend — Gestão de Usuários da Estrutura

### Decision
Criar 3 novos endpoints:
- `GET /api/usuarios-estrutura?estrutura_id=X&papel_id=Y&page=N` — listar com filtros
- `PUT /api/usuarios-estrutura/{usuario_id}/papel` — alterar papel do usuário na estrutura
- `DELETE /api/usuarios-estrutura/{usuario_id}` — remover da estrutura (preserva histórico)

Distinto de `/api/usuarios` (que gerencia contas do sistema). Este endpoint opera
na tabela de junção `EstruturaUsuario` (usuário ↔ estrutura).

### Rationale
O endpoint `/api/usuarios` lista contas do sistema sem filtro por estrutura ou papel.
Para a tela de "Usuários da Estrutura" precisamos de filtragem e operações na relação
usuário↔estrutura, não na conta do usuário em si.

### Alternatives Considered
- Estender `/api/usuarios` com query params de estrutura: possível, mas mistura
  "gestão de conta" com "gestão de vínculo". Rejeitado pela clareza de responsabilidade.

---

## 6. Typo no banco — `EstruuraId` em Auditorias

### Decision
Corrigir via migration: renomear coluna `EstruuraId` → `EstruturaId` na tabela `Auditorias`.
Atualizar a entidade `Auditoria` e qualquer query que referencie o campo.

### Rationale
O typo impede código legível e causa confusão em queries. É uma correção segura (apenas
renomear coluna) que não muda estrutura de dados.

### Alternatives Considered
- Manter o typo e criar um alias no EF: rejeitado — corrigir na origem é sempre melhor.

---

## 7. Papéis padrão do sistema — Proteção contra edição

### Decision
Papéis com `nivel_hierarquico = 0` (ou flag `is_sistema = true` — verificar no Core)
são somente leitura. O frontend oculta botões Editar/Excluir para esses papéis.
O backend valida e retorna `403 Forbidden` se tentativa de PUT/DELETE nesses papéis.

### Rationale
Papéis padrão (OWNER, ADMIN etc.) são usados internamente pelo sistema. Editá-los
quebraria permissões e guards que dependem de valores fixos.

---

## 8. Proteção contra orphan owner (owner sem substituto)

### Decision
No handler `RemoverUsuarioDaEstrutura`, verificar se o usuário é o único owner da
estrutura. Se sim → retornar `422 Unprocessable Entity` com mensagem:
"Não é possível remover o único owner da estrutura. Designe outro owner antes de prosseguir."

O frontend exibe esse erro no `ConfirmDialogComponent` como mensagem de aviso antes
de habilitar a ação.

### Rationale
Requisito explícito de Edge Case + FR-008. Evitar estruturas sem owner.

---

## 9. Exportação de auditoria em CSV

### Decision
Implementar no frontend: após carregar os dados filtrados, usar uma função Angular pura
para gerar CSV do array em memória e fazer download via `Blob + URL.createObjectURL`.
**Sem endpoint de export no backend**.

### Rationale
Volume de dados é pequeno (< 1000 registros por filtro típico). Evitar endpoint extra.
Padrão já pode existir em outros relatórios do projeto (verificar `relatorios/`).

### Alternatives Considered
- Endpoint backend retornando CSV: desnecessário para o volume. Rejeitado.

---

## Resumo de Decisões

| # | Decisão | Impacto |
|---|---------|---------|
| 1 | Rota shell `/admin/configuracoes` + `p-tabView` | Angular router + novo componente |
| 2 | `ConfirmDialogComponent` reutilizado para destructive actions | Sem novo componente |
| 3 | `PUT/DELETE /api/tipos-grupo/{id}` e tipos-evento | 4 novos endpoints backend |
| 4 | `GET/PUT/DELETE /api/usuarios-estrutura` (novo grupo) | 3 novos endpoints backend |
| 5 | Migration: corrigir typo `EstruuraId` → `EstruturaId` | 1 migration EF |
| 6 | Papéis padrão somente-leitura: frontend + backend | Guard no PUT/DELETE /api/papeis |
| 7 | Proteção orphan owner no handler de remoção | Lógica no UseCases |
| 8 | CSV de auditoria gerado no frontend | Sem endpoint extra |
