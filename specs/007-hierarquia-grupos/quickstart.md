# Quickstart: 007-hierarquia-grupos

**Branch**: `007-hierarquia-grupos` | **Data**: 2026-03-08

---

## Pré-requisitos

1. .NET 8 SDK instalado (`dotnet --version` → 8.x.x)  
2. Node.js 20+ e npm instalados (`node --version` → 20.x.x)  
3. SQL Server ou SQLite configurado em `appsettings.Development.json`  
4. Backend rodando: `http://localhost:5259`  
5. Frontend rodando: `http://localhost:4200`

---

## Iniciar o Ambiente

### Backend

```bash
cd GestaoEventos.API
dotnet run --project src/GestaoEventos.Web/GestaoEventos.API.Web.csproj --launch-profile https
```

### Frontend

```bash
cd GestaoEventos.Angular
npx ng serve --port 4200
```

Ou usar as tasks VS Code:
- `Angular Dev Server`
- `API Server`

---

## Endpoints Relevantes para esta Feature

| Método | URL                                    | Propósito                              |
|--------|----------------------------------------|----------------------------------------|
| GET    | `/api/grupos?estrutura_id=1`           | Lista grupos flat (paginada)           |
| GET    | `/api/grupos/hierarquia?estrutura_id=1`| ⚠️ Confirmar se existe no Web layer   |
| POST   | `/api/grupos`                          | Criar novo grupo                       |
| PUT    | `/api/grupos/{id}`                     | Atualizar grupo                        |
| DELETE | `/api/grupos/{id}`                     | Deletar grupo                          |
| GET    | `/api/grupos-membros?grupo_id=1`       | Listar membros do grupo                |
| POST   | `/api/grupos-membros`                  | Adicionar membro                       |
| DELETE | `/api/grupos-membros/{id}`             | Remover membro                         |
| GET    | `/api/responsaveis-grupo?grupo_id=1`   | Listar responsáveis do grupo           |
| POST   | `/api/responsaveis-grupo`              | Adicionar responsável                  |
| DELETE | `/api/responsaveis-grupo/{id}`         | Remover responsável                    |
| GET    | `/api/papeis?estrutura_id=1`           | Papéis disponíveis para responsável    |
| GET    | `/api/usuarios?estrutura_id=1`         | Buscar usuários para vincular          |

---

## Verificação Manual — Hierarquia

### 1. Confirmar endpoint `/api/grupos/hierarquia`

```bash
curl -s "http://localhost:5259/api/grupos/hierarquia?estrutura_id=1" | head -c 300
```

**Esperado**: `{ "data": [ { "id": 1, "nome": "...", "grupos_filhos": [...] } ] }`  
**Se 404**: endpoint ainda não registrado no FastEndpoints → criar `List.ListGrupoHierarquiaRequest.cs`

### 2. Criar grupo raiz

```bash
curl -s -X POST "http://localhost:5259/api/grupos" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Grupo Raiz Teste","estrutura_id":1}'
```

### 3. Criar grupo filho

```bash
curl -s -X POST "http://localhost:5259/api/grupos" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Grupo Filho Teste","estrutura_id":1,"grupo_superior_id":1}'
```

### 4. Verificar nível hierárquico

```bash
curl -s "http://localhost:5259/api/grupos/2" | python3 -m json.tool | grep nivel
```

---

## Fluxos de Teste na UI

### Fluxo 1 — Visualização Hierárquica

1. Acesse `http://localhost:4200/admin/grupos`
2. Confirme que grupos aparecem em árvore com expansão/colapso
3. Expanda um grupo com filhos → filhos aparecem indentados
4. Clique no nome de um grupo → zoom naquele grupo (breadcrumb atualiza)
5. Clique no breadcrumb de nível superior → retorna ao nível anterior

### Fluxo 2 — Criar Grupo

1. Clique em "Novo Grupo"
2. Preencha: nome, tipo (opcional), grupo pai (opcional)
3. Confirme → grupo aparece na posição correta na hierarquia

### Fluxo 3 — Gestão de Membros

1. Na hierarquia, clique em um grupo para expandir o painel lateral
2. Acesse a seção "Membros"
3. Clique "Adicionar Membro" → busca por nome/e-mail → confirma
4. Membro aparece na lista
5. Clique em "Remover" → confirmação → membro removido

### Fluxo 4 — Gestão de Responsáveis

1. No painel lateral do grupo, acesse a seção "Responsáveis"
2. Se lista vazia: aviso visual + CTA para adicionar
3. Clique "Adicionar Responsável" → busca usuário → define cargo
4. Responsável aparece na lista
5. Clique "Remover" → responsável perde acesso de gestão

---

## Arquivos para Modificar

### Frontend

| Arquivo                                | Ação                                        |
|----------------------------------------|---------------------------------------------|
| `libs/adm/grupo/grupo.component.ts`    | Converter visualização de tabela para árvore|
| `libs/adm/grupo/grupo.component.html`  | Adicionar `p-tree`, cards com indicadores   |
| `libs/adm/grupo/grupo.component.scss`  | Estilos do tree + cards hierárquicos        |
| `core/services/grupo.service.ts`       | Verificar `obterHierarquia()` + responsáveis|
| `shared/apis/grupo/grupo-api.service.ts`| Adicionar método para GET /hierarquia       |
| `app.routes.ts`                        | Descomentar rota `estrutura/hierarquia`     |

### Backend (se necessário)

| Arquivo                                                              | Ação                             |
|----------------------------------------------------------------------|----------------------------------|
| `GestaoEventos.Web/Grupos/List.ListGrupoHierarquiaRequest.cs`        | Criar se endpoint não existir    |
| `GestaoEventos.UseCases/Grupos/ListHierarquia/...`                   | Handler para árvore com metadados|

---

## Variáveis de Ambiente

```env
# GestaoEventos.Angular/src/environments/environment.ts
API=http://localhost:5259
```

---

## Problemas Comuns

| Problema                                 | Solução                                                           |
|------------------------------------------|-------------------------------------------------------------------|
| `/api/grupos/hierarquia` retorna 404     | Endpoint não registrado — criar FastEndpoint + UseCase            |
| Árvore não expande                       | Verificar mapeamento `GrupoCompleto.subgrupos → TreeNode.children`|
| Membros não carregam no painel lateral   | Verificar `GET /api/grupos-membros?grupo_id=X`                    |
| Dialog de responsável não abre          | Verificar `DialogService` registrado no providers do componente   |
