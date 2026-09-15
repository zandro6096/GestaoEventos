# GestaoEventos - Frontend Architecture & Standards

**Version**: 1.0.0 | **Created**: 2026-02-15 | **Last Updated**: 2026-02-15

---

## Tech Stack

- **Angular 17+** (Standalone Components)
- **PrimeNG** (UI Components)
- **RxJS** (Reactive Programming)
- **TailwindCSS** (Styling)
- **Signals** (State Management)
- **TypeScript** (Language)

---

## I. Arquitetura de 3 Camadas (MANDATORY)

### Princípio Core
**NUNCA** misture responsabilidades. O frontend segue uma arquitetura estrita de 3 camadas:

```
Component (Apresentação)
    ↓
Business Service (Lógica + Cache)
    ↓
API Service (HTTP Puro)
    ↓
Backend API
```

### Padrão Obrigatório

```typescript
// 1. Component - Apenas apresentação
@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './evento.component.html'
})
export class EventoComponent {
  private eventoService = inject(EventoService); // Business Service
  
  eventos = signal<Evento[]>([]);
  
  ngOnInit(): void {
    this.carregarEventos();
  }
  
  carregarEventos(): void {
    this.eventoService.listar(this.estruturaId)
      .subscribe(eventos => this.eventos.set(eventos));
  }
  
  onSubmit(): void {
    if (this.form.invalid) return;
    this.eventoService.create(this.form.value)
      .subscribe(created => this.router.navigate(['/eventos', created.id]));
  }
}

// 2. Business Service - Lógica + Cache + Validações
@Injectable({ providedIn: 'root' })
export class EventoService {
  private eventoApiService = inject(EventoApiService);
  private cacheService = inject(CacheService);
  private contextService = inject(ContextService);
  
  // Estado compartilhado
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$ = this.eventosSubject.asObservable();
  
  listar(estruturaId: number): Observable<Evento[]> {
    const cacheKey = `eventos:${estruturaId}`;
    
    return this.cacheService.get(
      cacheKey,
      () => this.eventoApiService.listar(estruturaId),
      300000 // TTL 5min
    ).pipe(
      tap(eventos => this.eventosSubject.next(eventos))
    );
  }
  
  create(evento: Partial<Evento>): Observable<Evento> {
    // Lógica de negócio
    const contexto = this.contextService.contexto();
    const eventoCompleto = {
      ...evento,
      criado_por_usuario_id: contexto.usuarioId,
      estrutura_id: contexto.estruturaId
    };
    
    // Validações de negócio
    if (!this.validarRegrasNegocio(eventoCompleto)) {
      return throwError(() => new Error('Validação falhou'));
    }
    
    // Delega para API service
    return this.eventoApiService.create(eventoCompleto).pipe(
      tap(created => {
        // Atualiza cache e estado
        this.cacheService.invalidate(`eventos:${contexto.estruturaId}`);
        const eventos = this.eventosSubject.value;
        this.eventosSubject.next([...eventos, created]);
      })
    );
  }
  
  private validarRegrasNegocio(evento: any): boolean {
    // Validações complexas aqui
    return true;
  }
}

// 3. API Service - HTTP Puro (burro)
@Injectable({ providedIn: 'root' })
export class EventoApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API}/api/eventos`;
  
  listar(estruturaId: number): Observable<Evento[]> {
    const params = HelperHttp.toQueryParams({ estruturaId, skip: 0, take: 100 });
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data || []),
      map(data => HelperJson.toCamelCase<Evento[]>(data))
    );
  }
  
  create(evento: any): Observable<Evento> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  getById(id: number): Observable<Evento> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  update(id: number, evento: Partial<Evento>): Observable<Evento> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

---

## II. Estrutura de Pastas (STRICT)

```
src/app/
├── core/                    # Funcionalidades core (singleton)
│   ├── guards/             # Route guards (autenticação, permissões)
│   ├── interceptors/       # HTTP interceptors (token, errors)
│   ├── models/             # Interfaces/Types (domain models)
│   └── services/           # Business services (lógica de negócio)
│       ├── auth.service.ts
│       ├── context.service.ts
│       ├── evento.service.ts
│       ├── grupo.service.ts
│       └── estrutura.service.ts
│
├── shared/                  # Recursos compartilhados
│   ├── components/         # Componentes reutilizáveis
│   │   ├── button/
│   │   ├── modal/
│   │   └── table/
│   ├── apis/               # API Services (HTTP puro)
│   │   ├── evento-api.service.ts
│   │   ├── grupo-api.service.ts
│   │   └── estrutura-api.service.ts
│   ├── services/           # Utilitários (cache, storage)
│   │   ├── cache.service.ts
│   │   ├── storage.service.ts
│   │   └── notification.service.ts
│   ├── helpers/            # Helper functions
│   │   ├── helper-json/
│   │   │   └── helper-json.ts
│   │   └── helper-http/
│   │       └── helper-http.ts
│   ├── enums/              # Enums compartilhados
│   │   ├── evento-status.enum.ts
│   │   ├── recorrencia.enum.ts
│   │   └── permissao-tipo.enum.ts
│   └── models/             # Interfaces compartilhadas
│       ├── response.model.ts
│       └── pagination.model.ts
│
├── libs/                    # Features modulares
│   ├── layout/             # Layout components
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── footer/
│   ├── adm/                # Área administrativa
│   │   ├── dashboard/
│   │   ├── evento/
│   │   │   ├── evento-list/
│   │   │   ├── evento-form/
│   │   │   └── evento-detail/
│   │   ├── grupo/
│   │   │   ├── grupo-list/
│   │   │   ├── grupo-form/
│   │   │   └── grupo-hierarchy/
│   │   └── estrutura/
│   │       ├── estrutura-list/
│   │       └── estrutura-form/
│   └── public/             # Áreas públicas
│       ├── login/
│       ├── register/
│       └── landing/
│
└── pages/                   # Páginas standalone (se necessário)
    └── not-found/
```

### Regras de Organização

1. **core/** - Serviços singleton, usados globalmente
2. **shared/** - Código reutilizável em múltiplos features
3. **libs/** - Features específicos, agrupados por domínio
4. **Standalone Components** - Todos os componentes devem ser standalone

---

## III. Separation of Concerns (NON-NEGOTIABLE)

### 1. Guards - Controle de Acesso

**Responsabilidade**: APENAS verificar acesso a rotas

**✅ O que DEVE fazer:**
- Verificar autenticação (`isAuthenticated`)
- Verificar permissões (`hasRole`, `hasPermission`)
- Redirecionar usuário não autorizado

**❌ O que NÃO DEVE fazer:**
- Lógica de negócio
- Manipulação de dados
- Validação de formulários
- Validação de contexto (use Business Service)

**Exemplo Correto:**
```typescript
// ✅ auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  
  return true;
};

// ✅ role.guard.ts
export const roleGuard = (roles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (!authService.hasAnyRole(roles)) {
      router.navigate(['/access-denied']);
      return false;
    }
    
    return true;
  };
};
```

**Exemplo Errado:**
```typescript
// ❌ ERRADO - Lógica de negócio no guard
export const estruturaGuard: CanActivateFn = () => {
  const estruturaService = inject(EstruturaService);
  const router = inject(Router);
  
  const estrutura = estruturaService.estruturaSelecionada(); // ❌ Validação de contexto!
  if (!estrutura) {
    router.navigate(['/selecionar-estrutura']);
    return false;
  }
  
  return true;
};

// ✅ SOLUÇÃO - Validar contexto no Component ou Resolver
export class EventoComponent implements OnInit {
  ngOnInit(): void {
    const contexto = this.contextService.contexto();
    if (!contexto.estruturaId) {
      this.router.navigate(['/selecionar-estrutura']);
    }
  }
}
```

---

### 2. Components - Apresentação e Interação

**Responsabilidade**: UI e captura de input do usuário

**✅ O que DEVE fazer:**
- Renderizar UI
- Capturar input do usuário
- Validar formulários (client-side)
- Chamar Business Services para operações
- Gerenciar estado local do component

**❌ O que NÃO DEVE fazer:**
- Validação de autenticação (usar Guard)
- Lógica de negócio complexa (usar Business Service)
- Chamadas HTTP diretas (usar API Service via Business Service)
- Transformação de dados complexa (usar Business Service)

**Exemplo Correto:**
```typescript
// ✅ evento-form.component.ts
@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './evento-form.component.html'
})
export class EventoFormComponent implements OnInit {
  private eventoService = inject(EventoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  form = this.criarFormulario();
  loading = signal(false);
  
  ngOnInit(): void {
    const eventoId = this.route.snapshot.params['id'];
    if (eventoId) {
      this.carregarEvento(eventoId);
    }
  }
  
  private criarFormulario(): FormGroup {
    return new FormGroup({
      nome: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      descricao: new FormControl(''),
      dataInicio: new FormControl('', Validators.required),
      horarioInicio: new FormControl('', Validators.required)
    });
  }
  
  carregarEvento(id: number): void {
    this.loading.set(true);
    this.eventoService.getById(id).subscribe({
      next: evento => {
        this.form.patchValue(evento);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const eventoId = this.route.snapshot.params['id'];
    
    const action = eventoId
      ? this.eventoService.update(eventoId, this.form.value)
      : this.eventoService.create(this.form.value);
    
    action.subscribe({
      next: evento => {
        this.router.navigate(['/eventos', evento.id]);
      },
      error: () => this.loading.set(false)
    });
  }
}
```

**Exemplo Errado:**
```typescript
// ❌ ERRADO - Validação de autenticação no component
ngOnInit(): void {
  if (!this.authService.isAuthenticated()) {  // ❌ Use Guard!
    this.router.navigate(['/login']);
    return;
  }
  
  this.carregarDados();
}

// ❌ ERRADO - Chamada HTTP direta
onSubmit(): void {
  this.http.post('/api/eventos', this.form.value) // ❌ Use Business Service!
    .subscribe(...);
}

// ❌ ERRADO - Lógica de negócio complexa
onSubmit(): void {
  const evento = this.form.value;
  
  // ❌ Lógica de negócio no component
  if (evento.recorrencia === 'SEMANAL') {
    evento.rrule = this.calcularRRule(evento); // ❌ Deve estar no Service!
  }
  
  this.eventoService.create(evento).subscribe(...);
}
```

---

### 3. Business Services - Lógica de Negócio

**Localização**: `src/app/core/services/`

**Responsabilidade**: Lógica de negócio, cache, estado compartilhado

**✅ O que DEVE fazer:**
- Regras de negócio
- Transformação de dados complexa
- Cache local (via CacheService)
- Estado compartilhado (signals ou subjects)
- Validações de negócio
- Orquestração de múltiplas API calls

**❌ O que NÃO DEVE fazer:**
- Chamadas HTTP diretas (usar API Service)
- Conversão camelCase ↔ snake_case (isso é responsabilidade do API Service)

**Exemplo Completo:**
```typescript
// ✅ evento.service.ts (Business Service)
@Injectable({ providedIn: 'root' })
export class EventoService {
  private eventoApiService = inject(EventoApiService);
  private cacheService = inject(CacheService);
  private contextService = inject(ContextService);
  private notificationService = inject(NotificationService);
  
  // Estado compartilhado
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$ = this.eventosSubject.asObservable();
  
  eventoSelecionado = signal<Evento | null>(null);
  
  listar(estruturaId: number, grupoId?: number): Observable<Evento[]> {
    const cacheKey = `eventos:${estruturaId}:${grupoId || 'all'}`;
    
    return this.cacheService.get(
      cacheKey,
      () => this.eventoApiService.listar(estruturaId, grupoId),
      300000 // TTL 5min
    ).pipe(
      tap(eventos => this.eventosSubject.next(eventos))
    );
  }
  
  getById(id: number): Observable<Evento> {
    return this.eventoApiService.getById(id).pipe(
      tap(evento => this.eventoSelecionado.set(evento))
    );
  }
  
  create(evento: Partial<Evento>): Observable<Evento> {
    // Lógica de negócio: enriquecer com contexto
    const contexto = this.contextService.contexto();
    const eventoCompleto: any = {
      ...evento,
      criado_por_usuario_id: contexto.usuarioId,
      estrutura_id: evento.estrutura_id || contexto.estruturaId
    };
    
    // Validações de negócio
    if (!this.validarRegrasNegocio(eventoCompleto)) {
      return throwError(() => new Error('Validação de negócio falhou'));
    }
    
    // Delega para API service
    return this.eventoApiService.create(eventoCompleto).pipe(
      tap(created => {
        // Invalida cache
        this.cacheService.invalidate(`eventos:${created.estruturaId}`);
        
        // Atualiza estado
        const eventos = this.eventosSubject.value;
        this.eventosSubject.next([...eventos, created]);
        
        // Notificação
        this.notificationService.success('Evento criado com sucesso!');
      })
    );
  }
  
  update(id: number, evento: Partial<Evento>): Observable<Evento> {
    return this.eventoApiService.update(id, evento).pipe(
      tap(updated => {
        // Invalida cache
        this.cacheService.invalidate(`eventos:${updated.estruturaId}`);
        
        // Atualiza estado
        const eventos = this.eventosSubject.value.map(e =>
          e.id === updated.id ? updated : e
        );
        this.eventosSubject.next(eventos);
        
        this.notificationService.success('Evento atualizado!');
      })
    );
  }
  
  delete(id: number): Observable<void> {
    return this.eventoApiService.delete(id).pipe(
      tap(() => {
        // Remove do estado
        const eventos = this.eventosSubject.value.filter(e => e.id !== id);
        this.eventosSubject.next(eventos);
        
        this.notificationService.success('Evento removido!');
      })
    );
  }
  
  iniciarEvento(id: number): Observable<Evento> {
    // Lógica de negócio: alterar status
    return this.eventoApiService.iniciar(id).pipe(
      tap(evento => {
        this.eventoSelecionado.set(evento);
        this.notificationService.success('Evento iniciado!');
      })
    );
  }
  
  private validarRegrasNegocio(evento: any): boolean {
    // Validações complexas
    if (!evento.nome || evento.nome.trim().length === 0) {
      this.notificationService.error('Nome é obrigatório');
      return false;
    }
    
    if (evento.recorrencia === 'SEMANAL' && !evento.dia_semana) {
      this.notificationService.error('Dia da semana é obrigatório para eventos semanais');
      return false;
    }
    
    return true;
  }
}
```

---

### 4. API Services - HTTP Puro

**Localização**: `src/app/shared/apis/`

**Responsabilidade**: APENAS chamadas HTTP

**✅ O que DEVE fazer:**
- Chamadas HTTP (GET, POST, PUT, DELETE)
- Conversão camelCase ↔ snake_case (usando HelperJson)
- Construção de query params (usando HelperHttp)
- Tratamento de erros HTTP básico

**❌ O que NÃO DEVE fazer:**
- Lógica de negócio
- Cache (isso é responsabilidade do Business Service)
- Validações de negócio
- Notificações ao usuário
- Gerenciamento de estado

**Padrão Obrigatório:**
```typescript
// ✅ evento-api.service.ts (API Service)
import { environment } from '../../../environments/environment';
import { HelperJson } from '../../helpers/helper-json/helper-json';
import { HelperHttp } from '../../helpers/helper-http/helper-http';

@Injectable({ providedIn: 'root' })
export class EventoApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.API}/api/eventos`;  // ✅ Usa environment.API
  
  listar(estruturaId: number, grupoId?: number): Observable<Evento[]> {
    const params = HelperHttp.toQueryParams({
      estruturaId,
      grupoId,
      skip: 0,
      take: 100
    });
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data || []),  // Extrai do PageResult
      map(data => HelperJson.toCamelCase<Evento[]>(data))
    );
  }
  
  getById(id: number): Observable<Evento> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  create(evento: any): Observable<Evento> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  update(id: number, evento: any): Observable<Evento> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // Ações específicas do domínio
  iniciar(id: number): Observable<Evento> {
    return this.http.post<any>(`${this.apiUrl}/${id}/iniciar`, {}).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  finalizar(id: number): Observable<Evento> {
    return this.http.post<any>(`${this.apiUrl}/${id}/finalizar`, {}).pipe(
      map(response => HelperJson.toCamelCase<Evento>(response))
    );
  }
  
  adicionarParticipante(eventoId: number, usuarioId: number): Observable<void> {
    const payload = HelperJson.toSnakeCase({ usuarioId });
    return this.http.post<void>(`${this.apiUrl}/${eventoId}/participantes`, payload);
  }
  
  removerParticipante(eventoId: number, usuarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventoId}/participantes/${usuarioId}`);
  }
}
```

---

## IV. Environment e API URLs (MANDATORY)

### Configuração de Environment

**SEMPRE use `environment.API` para configurar base URL dos serviços:**

```typescript
// environment.ts (desenvolvimento)
export const environment = {
  production: false,
  API: 'https://localhost:57678'  // Backend direto (SEM /api no final)
};

// environment.prod.ts (produção)
export const environment = {
  production: true,
  API: 'https://api.gestao-eventos.com'  // Backend de produção
};
```

### Uso nos API Services

```typescript
// ✅ CORRETO
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventoApiService {
  private apiUrl = `${environment.API}/api/eventos`;  // ✅ Resultado: https://localhost:57678/api/eventos
  
  listar(): Observable<Response> {
    return this.http.get(this.apiUrl);
  }
}

// ❌ ERRADO - Hardcoded
private apiUrl = '/api/eventos';  // ❌ Dependente de proxy

// ❌ ERRADO - /api/ duplicado
private apiUrl = `${environment.API}/api/api/eventos`;  // ❌
```

### Regras
- ✅ `environment.API` contém apenas o domínio: `https://localhost:57678`
- ✅ API Services adicionam `/api/` + recurso: `${environment.API}/api/eventos`
- ✅ Query params devem ser em `snake_case` (backend .NET FastEndpoints espera isso)
- ❌ NUNCA hardcode URLs
- ✅ Proxy (`proxy.conf.json`) é opcional - apenas para CORS em dev

---

## V. Convenções de URLs RESTful (MANDATORY)

### Padrão de Rotas

```typescript
// ✅ CORRETO - Entidade principal (sempre com /api/)
GET /api/eventos              // Listar todos
GET /api/eventos/{id}         // Obter um específico
POST /api/eventos             // Criar
PUT /api/eventos/{id}         // Atualizar
DELETE /api/eventos/{id}      // Deletar

// ✅ CORRETO - Subentidades (recurso aninhado)
GET /api/eventos/{id}/participantes       // Participantes de um evento
POST /api/eventos/{id}/participantes      // Adicionar participante
DELETE /api/eventos/{id}/participantes/{userId}  // Remover participante
POST /api/eventos/{id}/iniciar            // Iniciar evento
POST /api/eventos/{id}/finalizar          // Finalizar evento

// ✅ CORRETO - Filtros com Query Params (snake_case)
GET /api/eventos?estrutura_id=6&grupo_id=10&skip=0&take=50

// ❌ ERRADO - camelCase nos query params
GET /api/eventos?estruturaId=6&grupoId=10  // ❌ Backend espera snake_case

// ❌ ERRADO - Sem /api/ prefix
GET /eventos  // ❌ Falta /api/
```

### Regra de Ouro
- Se você quer recursos **DE uma entidade específica** → use subentidade: `/entidade/{id}/subentidade`
- Se você quer **filtrar** uma entidade → use query params: `/entidade?filtro=valor`
- Se você quer uma entidade específica → vá direto: `/entidade/{id}`

---

## VI. Utility Helpers (MANDATORY)

### Princípio DRY
**Use helpers centralizados existentes. Não recrie funcionalidades já implementadas.**

### 1. HelperJson - Transformações de Case

**Localização**: `src/app/shared/helpers/helper-json/helper-json.ts`

**Uso obrigatório para:**
- Converter objetos `camelCase` ↔ `snake_case`
- Transformar responses do backend (snake_case → camelCase)
- Transformar requests para backend (camelCase → snake_case)

**Métodos disponíveis:**
- `HelperJson.toCamelCase<T>(obj)`: snake_case → camelCase (recursivo)
- `HelperJson.toSnakeCase<T>(obj)`: camelCase → snake_case (recursivo, converte Dates para ISO)
- `HelperJson.toSnakeCaseLetter(str)`: Converte string individual

**Exemplo:**
```typescript
import { HelperJson } from '@shared/helpers/helper-json/helper-json';

// ✅ CORRETO - API Service
@Injectable({ providedIn: 'root' })
export class EventoApiService {
  create(evento: any): Observable<any> {
    const payload = HelperJson.toSnakeCase(evento);
    return this.http.post('/api/eventos', payload)
      .pipe(map(res => HelperJson.toCamelCase(res)));
  }
}

// ❌ ERRADO - Recriar lógica
private toSnakeCase(obj: any): any {
  // Reimplementar transformação...  ❌ NÃO FAZER
}
```

### 2. HelperHttp - Query Params

**Localização**: `src/app/shared/helpers/helper-http/helper-http.ts`

**Uso obrigatório para:**
- Construir HttpParams de objetos
- Conversão automática camelCase → snake_case em query strings
- Tratamento de Dates (converte para ISO 8601)

**Métodos disponíveis:**
- `HelperHttp.toQueryParams(obj)`: Converte objeto para HttpParams

**Exemplo:**
```typescript
import { HelperHttp } from '@shared/helpers/helper-http/helper-http';

// ✅ CORRETO
listarPorHorario(gruposIds: number[], dataInicio: Date): Observable<any> {
  const params = HelperHttp.toQueryParams({ gruposIds, dataInicio });
  // Gera: ?grupos_ids=1,2,3&data_inicio=2026-01-31T10:00:00Z
  return this.http.get('/api/eventos', { params });
}

// ❌ ERRADO - Construir params manualmente
const params = new HttpParams()
  .set('grupos_ids', gruposIds.join(','))  // ❌ Duplica lógica
  .set('data_inicio', dataInicio.toISOString());
```

---

## VII. Context vs Form Data

### Conceito
Diferenciar **contexto do usuário** vs **dados do formulário**

### Context (ContextService)
Estado global do usuário:
- `usuarioId`: Quem está logado (sempre do token)
- `estruturaId`: Qual estrutura está vendo (se tiver múltiplas)
- `grupoAtual`: Onde está navegando (zoom visual)

### Form Data (formulário)
Dados que o usuário está inserindo:
- `gruposIds[]`: Para quais grupos o evento é (escolha do usuário)
- `participantesIds[]`: Quais pessoas (escolha do usuário)
- `estruturaId`: Qual estrutura (se usuário tem múltiplas)

### Exemplo Correto:

```typescript
// ✅ CORRETO - Separação clara
onSubmit(): void {
  const contexto = this.contextService.contexto();
  const formData = this.form.value;
  
  const request = {
    // Do contexto (quem está fazendo)
    usuario_id: contexto.usuarioId,  // Quem está criando
    
    // Do formulário (o que está sendo criado)
    estrutura_id: formData.estruturaId,  // Para qual estrutura
    grupos_ids: formData.gruposIds,      // Para quais grupos
    participantes_ids: formData.participantesIds,  // Quais pessoas
    titulo: formData.titulo,
    // ...
  };
  
  this.eventoService.create(request).subscribe(...);
}
```

---

## VIII. Naming Conventions

### Files

```typescript
// Business Services (core/services/)
evento.service.ts
grupo.service.ts
estrutura.service.ts

// API Services (shared/apis/)
evento-api.service.ts
grupo-api.service.ts
estrutura-api.service.ts

// Components
evento-list.component.ts
evento-form.component.ts
evento-detail.component.ts

// Models (interfaces)
evento.model.ts
grupo.model.ts
estrutura.model.ts

// Enums
evento-status.enum.ts
recorrencia.enum.ts
permissao-tipo.enum.ts

// Helpers
helper-json.ts
helper-http.ts
```

### Classes e Interfaces

```typescript
// Interfaces (models)
export interface Evento { ... }
export interface Grupo { ... }
export interface Estrutura { ... }

// Enums
export enum EventoStatusEnum {
  RASCUNHO = 'RASCUNHO',
  CONFIGURADO = 'CONFIGURADO',
  INICIADO = 'INICIADO',
  FINALIZADO = 'FINALIZADO'
}

// Services
export class EventoService { ... }
export class EventoApiService { ... }

// Components
export class EventoListComponent { ... }
export class EventoFormComponent { ... }
```

---

## IX. State Management

### Signals (Angular 17+)

Use **Signals** para estado local e compartilhado:

```typescript
// ✅ Component state
export class EventoListComponent {
  eventos = signal<Evento[]>([]);
  loading = signal(false);
  selectedEvento = signal<Evento | null>(null);
  
  carregarEventos(): void {
    this.loading.set(true);
    this.eventoService.listar().subscribe({
      next: eventos => {
        this.eventos.set(eventos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

// ✅ Business Service state (compartilhado)
@Injectable({ providedIn: 'root' })
export class EventoService {
  eventoSelecionado = signal<Evento | null>(null);
  
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$ = this.eventosSubject.asObservable();
}
```

### RxJS Subjects

Use **Subjects** quando precisar de Observable stream:

```typescript
// ✅ Business Service com BehaviorSubject
@Injectable({ providedIn: 'root' })
export class EventoService {
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  eventos$ = this.eventosSubject.asObservable();
  
  listar(): Observable<Evento[]> {
    return this.eventoApiService.listar().pipe(
      tap(eventos => this.eventosSubject.next(eventos))
    );
  }
}

// ✅ Component consome o Observable
export class EventoListComponent implements OnInit {
  eventos$ = this.eventoService.eventos$;
  
  ngOnInit(): void {
    this.eventoService.listar().subscribe();
  }
}
```

---

## X. Forms e Validação

### Reactive Forms (Obrigatório)

```typescript
// ✅ CORRETO - Reactive Forms
export class EventoFormComponent implements OnInit {
  form: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.form = this.criarFormulario();
  }
  
  private criarFormulario(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: [''],
      dataInicio: ['', Validators.required],
      horarioInicio: ['', Validators.required],
      duracao: [2, [Validators.required, Validators.min(1)]],
      recorrencia: ['UNICO', Validators.required],
      estruturaId: ['', Validators.required],
      gruposIds: [[], Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.eventoService.create(this.form.value).subscribe({
      next: evento => this.router.navigate(['/eventos', evento.id]),
      error: error => this.handleError(error)
    });
  }
  
  get nomeControl(): FormControl {
    return this.form.get('nome') as FormControl;
  }
}
```

### Validações Customizadas

```typescript
// Validators customizados
export class CustomValidators {
  static dataFutura(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const data = new Date(control.value);
      const hoje = new Date();
      
      return data > hoje ? null : { dataPassado: true };
    };
  }
  
  static horarioValido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      return regex.test(control.value) ? null : { horarioInvalido: true };
    };
  }
}

// Uso
this.form = this.fb.group({
  dataInicio: ['', [Validators.required, CustomValidators.dataFutura()]],
  horarioInicio: ['', [Validators.required, CustomValidators.horarioValido()]]
});
```

---

## XI. Error Handling

### Interceptor Global

```typescript
// http-error.interceptor.ts
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private notificationService = inject(NotificationService);
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Erro desconhecido';
        
        if (error.error instanceof ErrorEvent) {
          // Erro client-side
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro server-side
          errorMessage = `Código: ${error.status}\nMensagem: ${error.message}`;
        }
        
        this.notificationService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

### Component Error Handling

```typescript
// ✅ CORRETO - Tratamento de erros no component
carregarEventos(): void {
  this.loading.set(true);
  
  this.eventoService.listar().subscribe({
    next: eventos => {
      this.eventos.set(eventos);
      this.loading.set(false);
    },
    error: error => {
      console.error('Erro ao carregar eventos:', error);
      this.loading.set(false);
      // Interceptor já exibiu notificação
    }
  });
}
```

---

## XII. Acessibilidade (WCAG 2.1 Level AA)

### Regras Obrigatórias

1. **Labels em todos os inputs**
```html
<!-- ✅ CORRETO -->
<label for="nome">Nome do Evento</label>
<input id="nome" type="text" formControlName="nome" />

<!-- ❌ ERRADO -->
<input type="text" placeholder="Nome" />
```

2. **Roles ARIA**
```html
<!-- ✅ CORRETO -->
<div role="alert" *ngIf="form.errors">Formulário inválido</div>
<button role="button" aria-label="Criar evento">Criar</button>
```

3. **Contraste de cores** (mínimo 4.5:1)

4. **Navegação por teclado**
```typescript
// ✅ CORRETO - Suporte a Enter
@HostListener('keydown.enter')
onEnterKey(): void {
  this.onSubmit();
}
```

---

## XIII. Performance

### Lazy Loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'eventos',
    loadComponent: () => import('./libs/adm/evento/evento-list/evento-list.component')
      .then(m => m.EventoListComponent)
  },
  {
    path: 'eventos/:id',
    loadComponent: () => import('./libs/adm/evento/evento-detail/evento-detail.component')
      .then(m => m.EventoDetailComponent)
  }
];
```

### Change Detection

```typescript
// ✅ OnPush para performance
@Component({
  selector: 'app-evento-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class EventoListComponent { }
```

### TrackBy em *ngFor

```typescript
// ✅ CORRETO - TrackBy
trackByEventoId(index: number, evento: Evento): number {
  return evento.id;
}

// Template
<div *ngFor="let evento of eventos(); trackBy: trackByEventoId">
  {{ evento.nome }}
</div>
```

---

## XIV. Testing

### Unit Tests (Jasmine + Karma)

```typescript
describe('EventoService', () => {
  let service: EventoService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventoService, EventoApiService]
    });
    
    service = TestBed.inject(EventoService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('deve listar eventos', () => {
    const mockEventos = [{ id: 1, nome: 'Teste' }];
    
    service.listar(1).subscribe(eventos => {
      expect(eventos.length).toBe(1);
      expect(eventos[0].nome).toBe('Teste');
    });
    
    const req = httpMock.expectOne(`${environment.API}/api/eventos?estrutura_id=1&skip=0&take=100`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockEventos });
  });
  
  afterEach(() => {
    httpMock.verify();
  });
});
```

### E2E Tests (Cypress)

```typescript
describe('Evento CRUD', () => {
  beforeEach(() => {
    cy.visit('/eventos');
    cy.login('admin@test.com', '123456');
  });
  
  it('deve criar novo evento', () => {
    cy.get('[data-cy=btn-novo-evento]').click();
    cy.get('[data-cy=input-nome]').type('Célula Teste');
    cy.get('[data-cy=input-data]').type('2026-12-31');
    cy.get('[data-cy=btn-salvar]').click();
    
    cy.contains('Evento criado com sucesso');
    cy.url().should('include', '/eventos/');
  });
});
```

---

## XV. Code Quality Standards

### Lint (ESLint)
- **Zero erros** em produção
- **Zero warnings** em PRs

### Coverage
- Unit tests: **mínimo 70%**
- E2E tests: fluxos críticos cobertos

### Performance Budgets
- Initial bundle: < 500kb
- Lazy loaded chunks: < 200kb each
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

---

## Governança

### Code Review Checklist

Antes de aprovar PR, verificar:

- [ ] Arquitetura de 3 camadas respeitada (Component → Business Service → API Service)
- [ ] Separation of Concerns (guards, components, services)
- [ ] Helpers utilizados (HelperJson, HelperHttp)
- [ ] Environment.API usado para URLs
- [ ] Query params em snake_case
- [ ] Conversão camelCase ↔ snake_case nos API Services
- [ ] Context separado de Form Data
- [ ] Signals ou Subjects para estado
- [ ] Reactive Forms com validações
- [ ] Error handling implementado
- [ ] Testes unitários (cobertura mínima 70%)
- [ ] Acessibilidade (labels, ARIA, contraste)
- [ ] Performance (lazy loading, trackBy, OnPush)
- [ ] Lint: 0 erros/warnings
- [ ] Naming conventions

---

**Este documento é a fonte única de verdade para arquitetura e padrões de frontend do GestaoEventos.**

Para outras referências:
- Business: Ver [business.md](business.md)
- Backend: Ver [backend.md](backend.md)
- Constitution: Ver [constitution.md](constitution.md)
