# Quickstart: Ciclo Completo do Evento (009)

**Objetivo**: Guia prático para implementar e testar a spec em 2026-03-12.

---

## Pré-requisitos

| Requisito | Versão | Verificar |
|-----------|--------|-----------|
| .NET | 8 | `dotnet --version` |
| Angular CLI | 17+ | `npx ng version` |
| PostgreSQL/SQL Server | Qualquer | DB rodando com migrations aplicadas |

---

## 1. Subir o ambiente

```bash
# Terminal 1 — API
cd GestaoEventos.API/src/GestaoEventos.Web
dotnet run --launch-profile https
# API: https://localhost:57678

# Terminal 2 — Frontend
cd GestaoEventos.Angular
npx ng serve --port 4200
# UI: http://localhost:4200
```

---

## 2. Verificar endpoints disponíveis

Teste rápido dos endpoints que você vai usar:

```bash
# Substituir TOKEN pelo token JWT obtido via POST /api/auth/login
TOKEN="eyJ..."

# Listar ocorrências do usuário (usuario_id=1, estrutura_id=1)
curl -sk https://localhost:57678/api/ocorrencias?usuario_id=1&estrutura_id=1 \
  -H "Authorization: Bearer $TOKEN" | jq '.data[0]'

# Esperado: objeto OcorrenciaRecord com status "Agendada"
```

---

## 3. Gaps a implementar (por prioridade)

### P1 — Botões de ciclo de status no `AcompanharEventoComponent`

**Arquivo**: `src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.ts`

**O que falta**:
- Botão `[Iniciar ▶]` → chama `ocorrenciaApi.atualizarStatus(ocorrenciaId, { novoStatus: 'EmAndamento' })`
- Botão `[Finalizar]` → chama `atualizarStatus(ocorrenciaId, { novoStatus: 'Realizada' })`
- Botão `[Cancelar]` → abre dialog de confirmação + campo motivo, depois chama `atualizarStatus`
- Signal `statusAtual` refletindo o status da ocorrência atual

**Snippet de referência**:
```typescript
iniciarEvento(): void {
  this.ocorrenciaApi
    .atualizarStatus(this.ocorrenciaId, { novoStatus: 'EmAndamento' })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (ocorrencia) => {
        this.statusAtual.set(ocorrencia.status);
      },
      error: (err) => this.erro.set('Erro ao iniciar evento')
    });
}
```

---

### P1 — Indicador visual de "Em Andamento" no `MeusEventosComponent`

**Arquivo**: `src/app/libs/adm/eventos/meus-eventos/meus-eventos.component.ts`

**O que falta**:
- Ocorrências com `status = 'EmAndamento'` devem ter badge colorido
- Card clicável → navega para `admin/eventos/acompanhar/:ocorrenciaId`

```html
<!-- No template, para cada card de ocorrência -->
<span *ngIf="ocorrencia.status === 'EmAndamento'" 
      class="badge-live">● Em Andamento</span>
```

---

### P1 — Template-selector no form de criação

**Arquivo**: `src/app/libs/adm/eventos/configuracao-form/configuracao-form.component.ts`

**O que falta**:
- Ao selecionar template, carregar campos do `EventoTemplate`
- Para cada campo `podeCustomizar* = false`: `formControl.disable()` + exibir valor do template como texto
- Para cada campo `podeCustomizar* = true`: campo editável habilitado

```typescript
onTemplateSelecionado(template: EventoTemplate): void {
  this.templateSelecionado.set(template);
  
  if (!template.podeCustomizarHora) {
    this.form.get('hora')?.disable();
    this.form.get('hora')?.setValue(template.horarioPadrao);
  } else {
    this.form.get('hora')?.enable();
  }
  // ... mesmo para dia, local, nome
}
```

---

### P2 — Histórico de ocorrências (`HistoricoViewComponent`)

**Arquivo**: `src/app/libs/adm/eventos/historico-view/historico-view.component.ts`

**O que falta**:
- Carregar via `ocorrenciaApi.listar(usuarioId, estruturaId, 100, eventoId)`
- Exibir tabela com colunas: Data, Status badge, Presentes, Ações
- Ação "Pular esta ocorrência" disponível apenas para status `Agendada`

---

### P3 — Exceções de recorrência (`ExcecaoEventosComponent`)

**Arquivo**: `src/app/libs/adm/estrutura/eventos/excecoes/excecoes-eventos.component.ts`

**O que falta**:
- Botão "Pular ocorrência" → `POST /api/excecoes-evento`
- Botão "Restaurar" → `DELETE /api/excecoes-evento/{id}`
- Integração com `HistoricoViewComponent` para mostrar exceções

---

## 4. Testar o fluxo completo (critério de aceite SC-001)

Tempo alvo: < 2 minutos da criação até a primeira presença.

```
1. Login como responsável
2. Menu → Eventos → Iniciar Evento
3. Clicar [Configurar] em template disponível
4. Preencher campos liberados (dia, hora, local)
5. Salvar → redireciona para Meus Eventos
6. Clicar [Iniciar ▶] na ocorrência do dia → status vira EmAndamento
7. Tela de acompanhamento abre automaticamente
8. Clicar [+ Participante] → buscar por nome → confirmar
9. Registrar presença (✓) para participante
10. Clicar [Finalizar] → confirmar → status Realizada
```

---

## 5. Referências rápidas

| O que | Onde |
|-------|------|
| Componente acompanhar | `libs/adm/eventos/acompanhar-evento/` |
| Componente meus-eventos | `libs/adm/eventos/meus-eventos/` |
| Serviço de ocorrências | `shared/apis/ocorrencia/ocorrencia-api.service.ts` |
| Entidade OcorrenciaEvento | `GestaoEventos.Core/Aggregates/EventoAggregate/OcorrenciaEvento.cs` |
| Endpoint status | `GestaoEventos.Web/Ocorrencia/UpdateStatus.cs` |
| Contrato OpenAPI | `specs/009-ciclo-evento/contracts/api-ciclo-evento.yaml` |
| Modelo de dados | `specs/009-ciclo-evento/data-model.md` |
| Pesquisa / decisões | `specs/009-ciclo-evento/research.md` |
