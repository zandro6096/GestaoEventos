# API Contracts: Evento Form Improvements

**Feature**: 001-evento-form-improvements  
**Date**: 2026-01-31  
**Phase**: 1 - Design

---

## Overview

Este diretório documenta os contratos de API utilizados pela feature. Backend já existe e está correto - esta documentação serve como referência para o frontend.

---

## Endpoints Used

| Method | Path | Purpose | Frontend Usage |
|--------|------|---------|----------------|
| POST | `/api/eventos` | Criar novo evento | evento-form.component.ts (onSubmit) |
| GET | `/api/eventos?estrutura_id={id}` | Listar eventos da estrutura | evento-list.component.ts |
| GET | `/api/grupos?estrutura_id={id}` | Listar grupos para multi-select | evento-form.component.ts (ngOnInit) |
| GET | `/api/eventos/conflitos` | Verificar conflitos de horário | eventoService.verificarConflitos() |

---

## POST /api/eventos

### Request

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body** (snake_case):
```json
{
  "titulo": "Reunião Semanal",
  "descricao": "Reunião de planejamento",
  "data_inicio": "2026-02-15T20:00:00Z",
  "data_fim": "2026-02-15T21:30:00Z",
  "local": "Sala 3",
  "tipo_recorrencia": "SEMANAL",
  "rrule": "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261231T235959Z",
  "data_fim_recorrencia": "2026-12-31T23:59:59Z",
  "usuario_id": 42,
  "estrutura_id": 10,
  "grupos_ids": [5, 8, 12],
  "permite_convidados": true,
  "convidados_podem_convidar": false,
  "exige_confirmacao": true,
  "limite_participantes": 50
}
```

**Validation Rules**:
- `titulo`: required, max 200 chars
- `data_inicio`: required, ISO 8601
- `data_fim`: required, >= data_inicio
- `tipo_recorrencia`: required, enum ["UNICO", "DIARIO", "SEMANAL", "MENSAL", "ANUAL", "CUSTOMIZADO"]
- `usuario_id`: required, must exist
- `estrutura_id`: required, must exist
- `grupos_ids`: required, min 1 item, all must belong to estrutura_id
- `data_fim_recorrencia`: required if tipo_recorrencia != "UNICO"
- `rrule`: valid RFC 5545 format
- Max 365 occurrences generated

### Response

**Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "titulo": "Reunião Semanal",
    "descricao": "Reunião de planejamento",
    "data_inicio": "2026-02-15T20:00:00Z",
    "data_fim": "2026-02-15T21:30:00Z",
    "local": "Sala 3",
    "tipo_recorrencia": "SEMANAL",
    "rrule": "FREQ=WEEKLY;BYDAY=SA;UNTIL=20261231T235959Z",
    "data_fim_recorrencia": "2026-12-31T23:59:59Z",
    "estrutura_id": 10,
    "usuario_id": 42,
    "grupos_ids": [5, 8, 12],
    "status": "PUBLICADO",
    "criado_em": "2026-01-31T14:22:00Z",
    "atualizado_em": null,
    "quantidade_ocorrencias": 46
  },
  "message": "Evento criado com sucesso"
}
```

**Error (400 Bad Request)**:
```json
{
  "success": false,
  "errors": [
    {
      "field": "data_fim",
      "message": "Data fim deve ser maior que data início"
    },
    {
      "field": "grupos_ids",
      "message": "Selecione pelo menos um grupo"
    }
  ],
  "message": "Validação falhou"
}
```

**Error (422 Unprocessable Entity)** - Limite excedido:
```json
{
  "success": false,
  "errors": [
    {
      "field": "data_fim_recorrencia",
      "message": "Limite de 365 ocorrências excedido. Este evento geraria 520 ocorrências. Ajuste a data fim ou frequência."
    }
  ],
  "message": "Limite de ocorrências excedido"
}
```

**Error (401 Unauthorized)**:
```json
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

**Error (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Você não tem permissão para criar eventos nesta estrutura"
}
```

---

## GET /api/grupos

### Request

**Query Parameters**:
```
estrutura_id=10  (required)
```

**Headers**:
```
Authorization: Bearer {jwt_token}
```

### Response

**Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "nome": "Grupo Jovens",
      "descricao": "Grupo de jovens 18-30 anos",
      "estrutura_id": 10,
      "grupo_pai_id": null,
      "responsavel_id": 15
    },
    {
      "id": 8,
      "nome": "Células Zona Norte",
      "descricao": null,
      "estrutura_id": 10,
      "grupo_pai_id": 5,
      "responsavel_id": 22
    }
  ],
  "total": 2
}
```

---

## GET /api/eventos/conflitos

### Request

**Query Parameters**:
```
grupos_ids=5,8,12
data_inicio=2026-02-15T20:00:00Z
data_fim=2026-02-15T21:30:00Z
```

**Headers**:
```
Authorization: Bearer {jwt_token}
```

### Response

**Success (200 OK)** - Sem conflitos:
```json
{
  "success": true,
  "data": {
    "tem_conflito": false,
    "eventos": []
  }
}
```

**Success (200 OK)** - Com conflitos:
```json
{
  "success": true,
  "data": {
    "tem_conflito": true,
    "eventos": [
      {
        "id": 100,
        "titulo": "Ensaio de Louvor",
        "data_inicio": "2026-02-15T19:30:00Z",
        "data_fim": "2026-02-15T21:00:00Z",
        "grupos_ids": [5, 8],
        "grupos_comuns": [5, 8]
      }
    ]
  }
}
```

---

## Frontend Integration

### evento-api.service.ts

```typescript
import { HelperJson } from '@shared/helpers/helper-json/helper-json';
import { HelperHttp } from '@shared/helpers/helper-http/helper-http';

@Injectable({ providedIn: 'root' })
export class EventoApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/eventos';
  
  create(evento: any): Observable<any> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.post(this.baseUrl, payload)
      .pipe(map(response => HelperJson.toCamelCase(response)));
  }
  
  listarPorHorario(
    gruposIds: number[],
    dataInicio: Date,
    dataFim: Date
  ): Observable<any[]> {
    const queryParams = HelperHttp.toQueryParams({
      gruposIds,  // Será convertido para grupos_ids
      dataInicio,
      dataFim
    });
    
    return this.http.get(`${this.baseUrl}/conflitos`, { params: queryParams })
      .pipe(map(response => HelperJson.toCamelCase(response)));
  }
}
```

### evento.service.ts

```typescript
@Injectable({ providedIn: 'root' })
export class EventoService {
  private eventoApiService = inject(EventoApiService);
  private cacheService = inject(CacheService);
  
  create(eventoFormData: EventoFormData): Observable<Evento> {
    // 1. Validar limite de ocorrências (FR-010)
    const validacao = this.validarLimiteOcorrencias(eventoFormData);
    if (!validacao.valido) {
      return throwError(() => new Error(validacao.erro));
    }
    
    // 2. Transformar EventoFormData para Evento
    const evento = this.formDataToEvento(eventoFormData);
    
    // 3. Chamar API
    return this.eventoApiService.create(evento).pipe(
      tap(created => this.invalidarCache(created.estruturaId))
    );
  }
  
  verificarConflitos(
    gruposIds: number[],
    dataInicio: Date,
    dataFim: Date
  ): Observable<{ temConflito: boolean; eventos: Evento[] }> {
    return this.eventoApiService
      .listarPorHorario(gruposIds, dataInicio, dataFim)
      .pipe(
        map(response => ({
          temConflito: response.data.tem_conflito,
          eventos: response.data.eventos
        }))
      );
  }
  
  private validarLimiteOcorrencias(formData: EventoFormData): ValidationResult {
    // Implementação conforme research.md #4
  }
  
  private formDataToEvento(formData: EventoFormData): Evento {
    // Combinar dataInicio + horaInicio
    // Calcular dataFim baseado em duração
    // Construir RRule se recorrente
  }
}
```

---

## Error Handling

### Component

```typescript
onSubmit(): void {
  if (this.form.invalid) {
    this.marcarCamposComoTocados();
    return;
  }
  
  this.loading = true;
  
  this.eventoService.create(this.form.value)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (evento) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Evento criado com sucesso!'
        });
        this.router.navigate(['/eventos']);
      },
      error: (error) => {
        this.tratarErro(error);
      }
    });
}

private tratarErro(error: any): void {
  if (error.status === 400 && error.error?.errors) {
    // Validation errors - exibir no formulário
    error.error.errors.forEach((err: any) => {
      const camelField = _.camelCase(err.field);  // lodash já importado via HelperJson
      const control = this.form.get(camelField);
      if (control) {
        control.setErrors({ backend: err.message });
      }
    });
    
    this.messageService.add({
      severity: 'error',
      summary: 'Erro de Validação',
      detail: 'Corrija os campos destacados'
    });
  } else if (error.status === 422) {
    // Limite excedido
    this.messageService.add({
      severity: 'warn',
      summary: 'Limite Excedido',
      detail: error.error.errors[0].message,
      life: 10000  // 10 segundos
    });
  } else {
    // Generic error
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: error.error?.message || 'Erro ao criar evento'
    });
  }
}
```

---

## Summary

✅ Backend endpoints documentados com requests/responses reais  
✅ Validações client-side + server-side mapeadas  
✅ Error handling strategy definida  
✅ Transformação camelCase ↔ snake_case nas camadas certas  
✅ Integration examples para API Service e Business Service

**Próximo passo**: quickstart.md - Guia rápido de desenvolvimento
