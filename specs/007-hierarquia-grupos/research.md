# Research: 007-hierarquia-grupos

**Branch**: `007-hierarquia-grupos` | **Date**: 2026-03-08  
**Status**: Complete — todas as NEEDS CLARIFICATION resolvidas

---

## Decisão 1: Estratégia de Visualização Hierárquica

**Decision**: Componente recursivo Angular com `p-tree` (PrimeNG) como base + estilo customizado para cards com indicadores de métricas.

**Rationale**:  
- `p-tree` já está disponível no PrimeNG e suporta nós expansíveis/colapsáveis nativamente.  
- A API do `p-tree` usa `TreeNode[]` que mapeia diretamente para a estrutura `Grupo[]` com `GruposFilhos`.  
- Evita construção de componente recursivo do zero, mantendo conformidade com a regra "PrimeNG quando resolve".

**Alternatives considered**:  
- Componente recursivo puro (ng-template + ngTemplateOutlet): mais flexível mas sem vantagem real aqui.  
- d3.js org-chart: overkill para o escopo MVP, adiciona dependência.  
- Lista flat com indentação por `nivelHierarquico`: não suporta collapse/expand nativo.

---

## Decisão 2: Endpoint `/api/grupos/hierarquia`

**Decision**: O endpoint **existe** no backend. O `core/services/grupo.service.ts` já chama `GET /api/grupos/hierarquia`. Confirmar se está registrado no Web layer antes da implementação.

**Rationale**:  
- O serviço Angular `obterHierarquia()` já faz `GET {baseUrl}/hierarquia`.  
- O modelo `Grupo.cs` tem `GruposFilhos: List<Grupo>?` — estrutura em árvore já suportada.  
- Se não registrado no FastEndpoints, criar `List.ListGrupoHierarquiaRequest.cs`.

**Alternatives considered**:  
- Montar hierarquia no frontend a partir de lista flat (agrupar por `GrupoSuperiorId`): viável como fallback, mas preferível retornar árvore pronta do backend para evitar N+1.

---

## Decisão 3: Drill-Down — Rota vs Estado Local

**Decision**: Drill-down via **estado local + signal** na mesma rota `/admin/grupos`, sem nova rota.

**Rationale**:  
- A spec pede zoom hierárquico sem mencionar nova rota.  
- Breadcrumb dinâmico já existe (`HierarchyBreadcrumbDirective`) e pode ser alimentado por signal de contexto.  
- Preserva a URL `admin/grupos` evitando complexidade de route params para cada grupo.

**Alternatives considered**:  
- Rota `/admin/grupos/:id` com drill-down por param: mais navegável por link direto, mas a spec não requer deep-linking.  
- Modal para detalhes do grupo: afasta do padrão visual de zoom hierárquico.

---

## Decisão 4: Gestão de Responsáveis — UI Inline no Detail Panel

**Decision**: Seção "Responsáveis" dentro de um **p-drawer (Sidebar)** ou **expansion panel** no detalhe do grupo, em vez de modal separado.

**Rationale**:  
- Endpoints `POST /api/responsaveis-grupo` e `DELETE /api/responsaveis-grupo/{id}` já existem.  
- O componente `ConfigurarPermissoesResponsavelComponent` já está importado no `grupo.component.ts`.  
- Usar Sidebar (drawer lateral) alinha com o padrão já usado para detalhe de grupo (SidebarModule importado).

**Alternatives considered**:  
- Dialog separado: `DialogService` já está importado mas drawer é menos intrusivo.  
- Página dedicada `/admin/grupos/:id/responsaveis`: desnecessária para o MVP.

---

## Decisão 5: Indicadores por Grupo (totalMembros, totalSubgrupos)

**Decision**: Usar o modelo `MetadadosGrupo` já existente (`totalMembros`, `totalMembrosAtivos`, `totalSubgrupos`, `totalEventosAtivos`) que é populado no `GrupoCompleto`.

**Rationale**:  
- `GrupoCompleto` em `core/models/grupo.model.ts` já tem `metadados?: MetadadosGrupo`.  
- `shared/apis/grupo/model/grupo-completo.model.ts` também tem `MetadadosGrupo`.  
- Backend precisa preencher esses campos no handler de listagem hierárquica.

**Alternatives considered**:  
- Chamada separada por grupo para métricas: N+1 inaceitável para hierarquias com 50+ grupos.  
- Calcular no frontend (count de `subgrupos.length`): ok para subgrupos mas não para membros.

---

## Decisão 6: Busca de Usuários para Adicionar Membro/Responsável

**Decision**: Reutilizar `AdicionarMembroDialogComponent` existente para membros; criar seção inline para responsáveis usando `p-autoComplete` com `GET /api/usuarios?estrutura_id=X`.

**Rationale**:  
- `AdicionarMembroDialogComponent` já está implementado e importado no `grupo.component.ts`.  
- Para responsáveis, o contrato precisa `usuarioId` + papel (papel vem de `GET /api/papeis`).  
- `p-autoComplete` com lazy search evita carregar todos os usuários de uma vez.

**Alternatives considered**:  
- p-dropdown com lista completa: inviável para estruturas com 500+ usuários.  
- Reutilizar o mesmo dialog para responsáveis e membros: papéis diferentes, UX confusa.

---

## Decisão 7: Papel (Role) na Criação de ResponsavelGrupo

**Decision**: O campo `papel` em `POST /api/responsaveis-grupo` usa `GET /api/papeis?estrutura_id=X` para popular os papéis disponíveis.

**Rationale**:  
- O endpoint `GET /api/papeis` está documentado na spec como já existente.  
- O modelo `Responsavel` em Angular tem `recursos: Recurso[]`, que mapeia para permissões associadas ao papel.  
- Papéis são por estrutura, então sempre filtrar por `estrutura_id`.

**Alternatives considered**:  
- Enum fixo de papéis: rígido demais, ignora configurabilidade por estrutura do SaaS.

---

## Decisão 8: Proteção contra Ciclo Hierárquico

**Decision**: Validação **no backend** via `GrupoService.cs` ao criar/atualizar grupo com `GrupoSuperiorId`; UI exibe erro do Result pattern sem lógica duplicada no frontend.

**Rationale**:  
- Backend já tem `GrupoService.cs` e `IGrupoService.cs` — local correto para regra de domínio.  
- A validação de ciclo requer consulta ao banco (checar se candidato a pai é descendente do grupo) — não pode ser feita puramente no front.  
- FR-008 da spec exige proteção; não precisa UI especial, mensagem de erro é suficiente.

**Alternatives considered**:  
- Ocultar grupos descendentes no dropdown de "Grupo Pai": UX preventiva, pode ser feita no frontend como complemento, mas não como única proteção.

---

## Decisão 9: TipoGrupo — Campo Obrigatório ou Opcional no Formulário

**Decision**: `TipoGrupoId` é **opcional** no formulário (null permitido), pois a spec diz "tipo de grupo" mas não marca como obrigatório.

**Rationale**:  
- `Grupo.cs` no backend não tem `TipoGrupoId` na entidade raiz (comentado no código antigo).  
- A spec (FR-004) diz "campos: nome, tipo de grupo, e grupo pai (opcional)" — tipo não marcado como obrigatório.  
- Assumir que TipoGrupo é identificador de nível semântico (Célula, Rede) mas não requisito técnico para criar grupo.

**Alternatives considered**:  
- Tornar obrigatório: bloqueia estruturas que não usam tipagem de nível (ex: empresa com hierarquia custom).
