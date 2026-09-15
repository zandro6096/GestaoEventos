# Quickstart: Gestão Administrativa (015-gestao-admin)

**Data**: 2026-03-08
**Branch**: `015-gestao-admin`

---

## Pré-requisitos

- .NET 8 SDK instalado
- Node.js 18+ e npm instalados
- SQL Server em execução (ou LocalDB)
- Banco de dados migrado com a schema atual

---

## 1. Aplicar migrations da feature

```bash
dotnet ef database update \
  --project src/GestaoEventos.Infrastructure \
  --startup-project src/GestaoEventos.Web
```

> As migrations desta feature incluem correções de auditoria e ajustes de ocorrências/eventos.

---

## 2. Subir o backend

```bash
cd GestaoEventos.API/src/GestaoEventos.Web
dotnet run --launch-profile https
# API disponível em https://localhost:5259
```

Ou via task do VS Code: **"API Server"**

---

## 3. Verificar novos endpoints (após implementação)

```bash
# Listar usuários da estrutura com filtros
curl -s "https://localhost:5259/api/usuarios-estrutura?estrutura_id=1&papel_id=1&status=ativo&take=10" | jq .

# Editar tipo de grupo (novo PUT)
curl -s -X PUT "https://localhost:5259/api/tipos-grupo/1" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Célula","icone":"pi-users","cor":"#10B981","estrutura_id":1,"permite_subgrupos":true}' | jq .

# Log de auditoria com filtros avançados
curl -s "https://localhost:5259/api/auditoria?estrutura_id=1&entidade=Papel&acao=UPDATE&data_inicio=2026-03-01&data_fim=2026-03-31&take=10" | jq .
```

---

## 4. Subir o frontend

```bash
cd GestaoEventos.Angular
npx ng serve --port 4200
```

Ou via task do VS Code: **"Angular Dev Server"**

---

## 5. Acessar a página de Configurações

1. Login: `https://localhost:4200/auth/login`
2. Após login → dashboard → menu lateral → **"Configurações"** (ícone `pi-sliders-h`)
3. URL: `https://localhost:4200/admin/configuracoes`
4. Abas disponíveis: Papéis | Tipos de Grupo | Tipos de Evento | Usuários | Auditoria

---

## 6. Testar fluxos principais

### Criar papel com permissões
1. Aba "Papéis e Permissões" → botão **"+ Novo Papel"**
2. Preencher nome (ex: "Coordenador"), selecionar permissões por módulo
3. Salvar → papel aparece na lista

### Excluir tipo de grupo em uso
1. Aba "Tipos de Grupo" → clicar no ícone de lixeira de um tipo vinculado a grupos
2. Sistema retorna bloqueio com mensagem contextual de impacto e quantidade de registros afetados
3. Ação é bloqueada até ajustar os vínculos

### Remover usuário da estrutura preservando histórico
1. Aba "Usuários" → filtrar por papel ou nome
2. Clicar em remover → `ConfirmDialog` com aviso sobre preservação de histórico
3. Confirmar → usuário some da lista (status `inativo`) mas presenças são mantidas

### Exportar auditoria em CSV
1. Aba "Auditoria" → filtrar por entidade, ação e período
2. Botão **"Exportar CSV"** → download de `auditoria-YYYY-MM-DD.csv`

---

## 7. Rodar testes

```bash
# Backend — unit + integration
cd GestaoEventos.API
dotnet test tests/ --no-build -v minimal

# Frontend — unit
cd GestaoEventos.Angular
npx ng test --no-watch --code-coverage

# E2E (opcional — requer API + frontend rodando)
npx cypress run --spec "cypress/e2e/admin-configuracoes/**"
```

---

## Estrutura de arquivos criados nesta feature

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `libs/adm/admin/configuracoes/configuracoes.component.ts` | Frontend novo | Shell container com `p-tabView` |
| `libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.ts` | Frontend novo | Listagem + ações de usuários |
| `app.routes.ts` | Frontend edit | Adicionar rota `/admin/configuracoes` |
| `shared/constants/router.ts` | Frontend edit | Novas constantes de rota |
| `Endpoints/TiposGrupo/Update.cs` | Backend novo | PUT /api/tipos-grupo/{id} |
| `Endpoints/TiposGrupo/Delete.cs` | Backend novo | DELETE /api/tipos-grupo/{id} |
| `Endpoints/TiposEvento/Update.cs` | Backend novo | PUT /api/tipos-evento/{id} |
| `Endpoints/TiposEvento/Delete.cs` | Backend novo | DELETE /api/tipos-evento/{id} |
| `Endpoints/UsuariosEstrutura/List.cs` | Backend novo | GET /api/usuarios-estrutura |
| `Endpoints/UsuariosEstrutura/Update.cs` | Backend novo | PUT /api/usuarios-estrutura/{id}/papel |
| `Endpoints/UsuariosEstrutura/Delete.cs` | Backend novo | DELETE /api/usuarios-estrutura/{id} |
| `Migrations/*_FixAuditoriasEstruturaIdTypo.cs` | Migration | Corrigir typo na coluna |
