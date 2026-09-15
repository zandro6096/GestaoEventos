# Research: Ciclo Completo do Evento (009)

**Data**: 2026-03-12  
**Spec**: [spec.md](spec.md)  
**Status**: Fase 0 Completa — todos os NEEDS CLARIFICATION resolvidos

---

## Sumário Executivo

A pesquisa confirmou que **o backend está 95% implementado** e o **frontend tem todos os componentes criados**, mas a maioria não está conectada ao ciclo de status da ocorrência. O trabalho desta spec é de **integração e wireing**, não de criação do zero.

---

## 1. Status do Backend

### Endpoints já existentes (confirmados via código)

| Endpoint | Arquivo | Status |
|----------|---------|--------|
| `GET /api/ocorrencias` | `Web/Ocorrencia/List.cs` | ✅ Implementado |
| `PUT /api/ocorrencias/{id}/status` | `Web/Ocorrencia/UpdateStatus.cs` | ✅ Implementado |
| `POST /api/eventos/{id}/gerar-ocorrencias` | `Web/Eventos/GerarOcorrencias.cs` | ✅ Implementado |
| `POST /api/eventos/{id}/materializar-ocorrencia` | `Web/Eventos/MaterializarOcorrencia.cs` | ✅ Implementado |
| `GET/POST /api/eventos/configuracoes` | `Web/Eventos/Configuracoes/` | ✅ Implementado |
| `PUT /api/eventos/configuracoes/{id}` | `Web/Eventos/Configuracoes/UpdateConfiguracao.cs` | ✅ Implementado |
| `POST /api/eventos/configuracoes/{id}/responsaveis` | `Web/Eventos/Configuracoes/AddResponsavel.cs` | ✅ Implementado |
| `GET /api/eventos/configuracoes/{id}/historico` | `Web/Eventos/Configuracoes/GetHistorico.cs` | ✅ Implementado |
| `POST /api/excecoes-evento` | `Web/ExcecaoEvento/Create.cs` | ✅ Implementado |
| `DELETE /api/excecoes-evento/{id}` | `Web/ExcecaoEvento/Delete.cs` | ✅ Implementado |
| `PUT /api/excecoes-evento/{id}` | `Web/ExcecaoEvento/Update.cs` | ✅ Implementado |
| `GET /api/excecoes-evento/{id}` | `Web/ExcecaoEvento/GetById.cs` | ✅ Implementado |
| `GET /api/eventos/conflitos` | `Web/Eventos/Conflitos.cs` | ✅ Implementado |

### Gap identificado no backend

- **Nenhum gap crítico**: todos os endpoints necessários para os user stories P1–P3 existem.
- **Endpoint de participantes via evento**: a spec menciona `GET/POST /api/eventos/{id}/participantes` — verificar se existe ou se o fluxo usa `POST /api/participacoes`.

---

## 2. Status do Frontend

### Rotas já cadastradas em `app.routes.ts` (confirmado)

| Rota | Componente | Status |
|------|-----------|--------|
| `admin/eventos/meus` | `MeusEventosComponent` | ✅ Rota existe |
| `admin/eventos/iniciar` | `IniciarEventoComponent` | ✅ Rota existe |
| `admin/eventos/acompanhar/:id` | `AcompanharEventoComponent` | ✅ Rota existe |
| `admin/eventos/criar` | `EventoFormComponent` | ✅ Rota existe |
| `admin/eventos/:id/editar` | `EventoFormComponent` | ✅ Rota existe |
| `admin/eventos/modelos` | `ListarModelosEventoComponent` | ✅ Rota existe |

> ⚠️ **CORREÇÃO**: A spec menciona `/admin/meus-eventos` e `/admin/eventos/:id/acompanhar` — mas o roteador usa `/admin/eventos/meus` e `/admin/eventos/acompanhar/:id`. O código real deve ser a referência.

### Componentes existentes (confirmados via `find`)

| Componente | Path | Estado |
|------------|------|--------|
| `AcompanharEventoComponent` | `libs/adm/eventos/acompanhar-evento/` | Existe — sem botões INICIAR/FINALIZAR/CANCELAR |
| `MeusEventosComponent` | `libs/adm/eventos/meus-eventos/` | Existe — carrega ocorrências, sem indicador INICIADO |
| `IniciarEventoComponent` | `libs/adm/eventos/iniciar-evento/` | Existe — pendente validação de UX |
| `AddParticipanteComponent` | `libs/adm/eventos/add-participante/` | Existe — já usada no acompanhar-evento |
| `RemoverParticipanteComponent` | `libs/adm/eventos/remover-participante/` | Existe |
| `ResponsavelManagerComponent` | `libs/adm/eventos/responsavel-manager/` | Existe |
| `HistoricoViewComponent` | `libs/adm/eventos/historico-view/` | Existe — integração pendente |
| `TemplateSelectorComponent` | `libs/adm/eventos/template-selector/` | Existe |
| `ConfiguracaoFormComponent` | `libs/adm/eventos/configuracao-form/` | Existe |
| `ExcecaoEventosComponent` | `libs/adm/estrutura/eventos/excecoes/` | Existe |

---

## 3. Modelo de Status da Ocorrência (ESCLARECIDO)

### Decisão
O backend usa o enum `StatusOcorrencia` com os seguintes valores:

```csharp
Agendada    = 0   // Ocorrência criada, aguardando
EmAndamento = 1   // Evento iniciado
Realizada   = 2   // Evento finalizado com presenças
Cancelada   = 3   // Cancelado (via botão ou ExcecaoEvento)
Reagendada  = 4   // Data/hora ajustada
```

### Mapeamento UI → API

| Botão na UI | `novo_status` no body | Endpoint |
|------------|----------------------|---------|
| `[Iniciar ▶]` | `"EmAndamento"` | `PUT /api/ocorrencias/{id}/status` |
| `[Finalizar]` | `"Realizada"` | `PUT /api/ocorrencias/{id}/status` |
| `[Cancelar]` | `"Cancelada"` | `PUT /api/ocorrencias/{id}/status` + campo `motivo` |

> **Nota**: A spec usa `CRIADA→INICIADA→FINALIZADA→CANCELADA` como terminologia conceitual. O sistema real usa `Agendada→EmAndamento→Realizada|Cancelada`. A UI deve traduzir com labels amigáveis.

---

## 4. Estrutura de Dados (CLARIFICADO)

### Decisão
O modelo correto de entidades no backend (confirmado via código):

- **`EventoTemplate`** → criado pelo Owner; define recorrência, campos travados, permissões `podeCustomizar*`
- **`EventoConfiguracao`** → criado pelo Responsável a partir de um template; contém `Dia`, `Hora`, `Local`, `MembrosIds`, `ResponsavelId`
- **`OcorrenciaEvento`** → instância em data específica; tem `Status`, `DataHora`, `ExcecaoEventoId`
- **`ExcecaoEvento`** → pula uma data específica; `Tipo`, `Data`, `Motivo`, `EventoId`
- **`ResponsavelEvento`** → co-responsável; vincula usuário à `EventoConfiguracao`

### Alternativas consideradas
- Usar `Evento` diretamente como raiz: ❌ Rejeitado — o backend usa `EventoTemplate` + `EventoConfiguracao` como separação clara owner/responsável
- Novo endpoint de status: ❌ Rejeitado — `PUT /api/ocorrencias/{id}/status` já serve exatamente esse propósito

---

## 5. Template-Selector e Campos Travados (CLARIFICADO)

### Decisão
A `EventoConfiguracao` referencia o `EventoTemplate` por ID. O template contém campos `podeCustomizar*` (booleanos). O `ConfiguracaoFormComponent` já existe; o gap é:
1. Carregar o template ao selecionar no `TemplateSelectorComponent`
2. Desabilitar campos no formulário quando `podeCustomizarX = false`
3. Preencher campos com valores do template como `defaultValue` quando travados

### Rationale
O `TemplateSelectorComponent` e `ConfiguracaoFormComponent` já existem separados — isso sugere que a lógica de composição precisa conectá-los. O `EventoFormComponent` provavelmente precisa ser atualizado para incluir/orquestrar esses dois.

---

## 6. Cálculo de Próxima Ocorrência em "Meus Eventos" (CLARIFICADO)

### Decisão
O `MeusEventosComponent` usa `OcorrenciaApiService.listar()` que retorna `dataHora` de cada ocorrência. A "próxima ocorrência" é calculada filtrando ocorrências com `status = 'Agendada'` e `dataHora > agora`, ordenando por data ASC e pegando a primeira.

- **Frontend**: filtragem/ordenação pode ser feita no cliente dado volume baixo (< 100 ocorrências por usuário).
- **Alternativa via RRule no cliente**: ❌ desnecessária — backend já armazena e retorna ocorrências por `GET /api/ocorrencias?evento_id=X`.

---

## 7. Integração ExcecaoEvento (CLARIFICADO)

### Decisão
O fluxo de pular ocorrência usa:
1. `POST /api/excecoes-evento` com `{ evento_id, data, tipo: "CANCELAMENTO", motivo }`  
2. O backend vincula a `ExcecaoEvento` à `OcorrenciaEvento` correspondente e chama `ocorrencia.Cancelar(motivo, excecaoId)`
3. Para restaurar: `DELETE /api/excecoes-evento/{id}` — remove a exceção e reverte o status

O `ExcecaoEventosComponent` em `libs/adm/estrutura/eventos/excecoes/` já existe mas precisa ser integrado ao `HistoricoViewComponent`.

---

## Decisões Consolidadas

| Decisão | Escolha | Alternativas |
|---------|---------|-------------|
| Ciclo de status | `PUT /api/ocorrencias/{id}/status` com enum `StatusOcorrencia` | Novo endpoint específico |
| Campos travados | Desabilitar inputs via `FormControl.disable()` quando `podeCustomizar* = false` | CSS `pointer-events: none` |
| Próxima ocorrência | Filtrar `status=Agendada` do response existente | Endpoint dedicado |
| Exceções | `POST /api/excecoes-evento` + `DELETE` para restaurar | PATCH na ocorrência |
| Status visual "em andamento" | Badge colorido `EmAndamento` no card de `MeusEventos` | Ícone de pulsar |
