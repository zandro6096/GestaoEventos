# GestaoEventos - Backend Architecture & Standards

**Version**: 1.0.0 | **Created**: 2026-02-15 | **Last Updated**: 2026-02-15

---

## Tech Stack

- **.NET 8** (C#)
- **Entity Framework Core** (ORM)
- **FastEndpoints** (API Framework)
- **MediatR** (CQRS)
- **AutoMapper** (Object Mapping)
- **FluentValidation** (Validation)
- **SQL Server** ou **PostgreSQL** (Database)

---

## I. Clean Architecture (NON-NEGOTIABLE)

### Princípio Core

O backend **DEVE** seguir Clean Architecture com CQRS. Esta estrutura é **obrigatória** e **não-negociável**.

### Estrutura de Camadas

```
GestaoEventos.Core (Domain Layer)
  ├── Aggregates/        # Entidades de domínio
  ├── Interfaces/        # Contratos (repositories, services)
  ├── Services/          # Domain services
  └── ValueObjects/      # Value objects (Email, CPF, etc)

GestaoEventos.UseCases (Application Layer)
  ├── Commands/          # Write operations (Create, Update, Delete)
  ├── Queries/           # Read operations (Get, List)
  └── Handlers/          # MediatR handlers (CommandHandler, QueryHandler)

GestaoEventos.Infrastructure (Infrastructure Layer)
  ├── Data/              # DbContext, migrations, configurations
  ├── Repositories/      # Implementações de IRepository
  └── Services/          # Serviços externos (email, storage, auth)

GestaoEventos.Web (Presentation Layer)
  └── [Entity]/          # FastEndpoints agrupados por entidade
      ├── Create.cs      # POST /api/entity
      ├── Update.cs      # PUT /api/entity/{id}
      ├── Delete.cs      # DELETE /api/entity/{id}
      ├── GetById.cs     # GET /api/entity/{id}
      └── List.cs        # GET /api/entity
```

### Dependências Entre Camadas

```
Web → UseCases → Core
  ↓       ↓
Infrastructure
```

**Regras:**
- ✅ Core não depende de nada (pure domain logic)
- ✅ UseCases depende apenas de Core
- ✅ Infrastructure implementa interfaces de Core e UseCases
- ✅ Web depende de UseCases e Infrastructure (DI)
- ❌ Core NUNCA pode depender de Infrastructure ou Web
- ❌ UseCases NUNCA pode depender de Infrastructure ou Web

### Fluxo obrigatório por endpoint (CQRS)

Para manter consistência e rastreabilidade de erro, todo endpoint deve seguir:

1. `Web Endpoint (FastEndpoints)` recebe request e valida.
2. Endpoint cria `Command/Query` e chama `IMediator.Send(...)`.
3. `UseCase Handler` orquestra regra de negócio.
4. `Spec/Service` encapsula filtragem e regra específica de consulta/domínio.
5. Endpoint apenas mapeia resultado para response.

**Proibido no endpoint:**
- Query direta em repositório para regra de negócio principal.
- `try/catch` genérico que converte erro real em sucesso vazio (ex.: retornar `[]` ao falhar).

**Tratamento de erro:**
- Erros devem propagar com contexto (ou virar erro de domínio explícito).
- Nunca mascarar exceção operacional com resposta “sem dados”.

---

## II. Object Calisthenics (MANDATORY)

**TODOS os códigos C# devem seguir as 9 regras de Object Calisthenics:**

### 1. ✅ Um Nível de Indentação por Método

```csharp
// ✅ CORRETO
public async Task<Result<Evento>> Handle(CreateEventoCommand request, CancellationToken ct)
{
    var evento = CreateEvento(request);
    
    if (!ValidateEvento(evento))
        return Result<Evento>.Error("Validação falhou");
    
    await _repository.AddAsync(evento, ct);
    return Result<Evento>.Success(evento);
}

// ❌ ERRADO - Múltiplos níveis
public async Task<Result<Evento>> Handle(CreateEventoCommand request, CancellationToken ct)
{
    if (request.Nome != null)
    {
        if (request.Nome.Length > 0)
        {
            if (request.Estruturaid > 0)
            {
                // Muito aninhado!
            }
        }
    }
}
```

### 2. ✅ Sem Palavra `else`

```csharp
// ✅ CORRETO - Early return
public Result Validate(Evento evento)
{
    if (evento.Nome == null)
        return Result.Error("Nome é obrigatório");
    
    if (evento.Nome.Length == 0)
        return Result.Error("Nome não pode ser vazio");
    
    return Result.Success();
}

// ❌ ERRADO - Usa else
public Result Validate(Evento evento)
{
    if (evento.Nome != null)
    {
        return Result.Success();
    }
    else
    {
        return Result.Error("Nome é obrigatório");
    }
}
```

### 3. ✅ Encapsular Tipos Primitivos

```csharp
// ✅ CORRETO - Value Object
public class Email
{
    public string Value { get; }
    
    private Email(string value)
    {
        Value = value;
    }
    
    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<Email>.Error("Email é obrigatório");
        
        if (!IsValidEmail(email))
            return Result<Email>.Error("Email inválido");
        
        return Result<Email>.Success(new Email(email));
    }
    
    private static bool IsValidEmail(string email)
    {
        return email.Contains("@"); // Simplificado
    }
}

// Uso
public class Usuario
{
    public Email Email { get; private set; }
    
    public Result SetEmail(string email)
    {
        var emailResult = Email.Create(email);
        if (!emailResult.IsSuccess)
            return emailResult;
        
        Email = emailResult.Value;
        return Result.Success();
    }
}

// ❌ ERRADO - Primitivo direto
public class Usuario
{
    public string Email { get; set; } // ❌ Sem validação
}
```

### 4. ✅ Coleções de Primeira Classe

```csharp
// ✅ CORRETO - Classe wrapper
public class Participantes
{
    private readonly List<Participacao> _items;
    
    public IReadOnlyList<Participacao> Items => _items.AsReadOnly();
    public int Count => _items.Count;
    
    public Participantes()
    {
        _items = new List<Participacao>();
    }
    
    public Result Add(Participacao participacao)
    {
        if (_items.Any(p => p.UsuarioId == participacao.UsuarioId))
            return Result.Error("Participante já existe");
        
        _items.Add(participacao);
        return Result.Success();
    }
    
    public Result Remove(int usuarioId)
    {
        var participacao = _items.FirstOrDefault(p => p.UsuarioId == usuarioId);
        if (participacao == null)
            return Result.Error("Participante não encontrado");
        
        _items.Remove(participacao);
        return Result.Success();
    }
    
    public int CountPresentes() => _items.Count(p => p.Status == ParticipacaoStatus.PRESENTE);
}

// Uso no Aggregate
public class EventoAggregate
{
    public Participantes Participantes { get; private set; }
    
    public EventoAggregate()
    {
        Participantes = new Participantes();
    }
    
    public Result AdicionarParticipante(int usuarioId)
    {
        return Participantes.Add(new Participacao(usuarioId, EventoId));
    }
}

// ❌ ERRADO - Lista primitiva exposta
public class EventoAggregate
{
    public List<Participacao> Participantes { get; set; } // ❌
}
```

### 5. ✅ Um Ponto por Linha

```csharp
// ✅ CORRETO
public int CountPresentes(EventoAggregate evento)
{
    var participantes = evento.GetParticipantes();
    var presentes = participantes.Where(p => p.IsPresente());
    return presentes.Count();
}

// ❌ ERRADO - Vários pontos
return evento.GetParticipantes().Where(p => p.IsPresente()).Count();
```

### 6. ✅ Não Abreviar

```csharp
// ✅ CORRETO
public class EventoAggregate
{
    public string NomeGenerico { get; private set; }
    public string NomePersonalizado { get; private set; }
    public DateTime DataInicio { get; private set; }
}

// ❌ ERRADO - Abreviações
public class EventoAggregate
{
    public string NomeGen { get; private set; }  // ❌
    public string NomePers { get; private set; } // ❌
    public DateTime DtInicio { get; private set; } // ❌
}
```

### 7. ✅ Manter Entidades Pequenas

```csharp
// ✅ CORRETO - Classe focada
public class EventoRecorrencia
{
    public RecorrenciaEnum Tipo { get; private set; }
    public string RRuleConfig { get; private set; }
    public DateTime? DataFimRecorrencia { get; private set; }
    public bool Travada { get; private set; }
    
    // Apenas métodos relacionados a recorrência
    public Result SetRecorrencia(RecorrenciaEnum tipo, string rrule)
    {
        // Validações e lógica
    }
    
    public bool PermiteEdicao(int nivelHierarquico)
    {
        return !Travada || nivelHierarquico == 1;
    }
}

// Uso no EventoAggregate
public class EventoAggregate
{
    public EventoRecorrencia Recorrencia { get; private set; }
    
    // EventoAggregate delega responsabilidade
    public Result ConfigurarRecorrencia(RecorrenciaEnum tipo, string rrule)
    {
        return Recorrencia.SetRecorrencia(tipo, rrule);
    }
}

// ❌ ERRADO - Classe god object com 50+ métodos
```

### 8. ✅ Máximo 2 Variáveis de Instância

```csharp
// ✅ CORRETO - Composição
public class EventoAggregate
{
    public EventoIdentidade Identidade { get; private set; }
    public EventoConfiguracao Configuracao { get; private set; }
    
    // Apenas 2 variáveis, mas encapsulam toda complexidade
}

public class EventoIdentidade
{
    public int Id { get; private set; }
    public string NomeGenerico { get; private set; }
    public string NomePersonalizado { get; private set; }
}

public class EventoConfiguracao
{
    public EventoRecorrencia Recorrencia { get; private set; }
    public EventoLocalizacao Localizacao { get; private set; }
    public EventoPermissoes Permissoes { get; private set; }
}

// ❌ ERRADO - 20 campos diretos
public class EventoAggregate
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Descricao { get; set; }
    public DateTime DataInicio { get; set; }
    public TimeSpan HorarioInicio { get; set; }
    // ... mais 15 campos
}
```

### 9. ✅ Sem Getters/Setters Públicos

```csharp
// ✅ CORRETO - Métodos com comportamento
public class EventoAggregate
{
    public int Id { get; private set; }
    public string Nome { get; private set; }
    public EventoStatusEnum Status { get; private set; }
    
    private EventoAggregate() { } // EF Core
    
    public static Result<EventoAggregate> Create(string nome, int estruturaId)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<EventoAggregate>.Error("Nome é obrigatório");
        
        var evento = new EventoAggregate
        {
            Nome = nome,
            EstruturaId = estruturaId,
            Status = EventoStatusEnum.RASCUNHO
        };
        
        return Result<EventoAggregate>.Success(evento);
    }
    
    public Result Iniciar()
    {
        if (Status != EventoStatusEnum.CONFIGURADO)
            return Result.Error("Evento deve estar configurado para ser iniciado");
        
        Status = EventoStatusEnum.INICIADO;
        IniciadoEm = DateTime.UtcNow;
        
        return Result.Success();
    }
    
    public Result Finalizar()
    {
        if (Status != EventoStatusEnum.INICIADO)
            return Result.Error("Apenas eventos iniciados podem ser finalizados");
        
        Status = EventoStatusEnum.FINALIZADO;
        FinalizadoEm = DateTime.UtcNow;
        
        return Result.Success();
    }
}

// DTOs podem ter propriedades públicas (são apenas transporte)
public record EventoRecord(
    int Id,
    string Nome,
    string Status
);

// ❌ ERRADO - Setters públicos no Aggregate
public class EventoAggregate
{
    public EventoStatusEnum Status { get; set; } // ❌ Qualquer um pode mudar!
}
```

---

## III. FastEndpoints Pattern (MANDATORY)

### Estrutura de Endpoint

Cada endpoint segue este padrão estrito:

```csharp
// 1. Request (DTO de entrada)
public class CreateEventoRequest
{
    public const string Route = "/api/eventos";
    
    public string Nome { get; set; }
    public string? Descricao { get; set; }
    public int EstruturaId { get; set; }
    public DateTime DataInicio { get; set; }
    public TimeSpan HorarioInicio { get; set; }
    public RecorrenciaEnum Recorrencia { get; set; }
}

// 2. Validator (FluentValidation)
public class CreateEventoValidator : Validator<CreateEventoRequest>
{
    public CreateEventoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres");
        
        RuleFor(x => x.EstruturaId)
            .GreaterThan(0).WithMessage("Estrutura inválida");
        
        RuleFor(x => x.DataInicio)
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Data deve ser futura");
    }
}

// 3. Endpoint (Presentation)
public class CreateEventoEndpoint : Endpoint<CreateEventoRequest, Response<EventoRecord>>
{
    private readonly IMediator _mediator;
    private readonly IMapper _mapper;
    
    public CreateEventoEndpoint(IMediator mediator, IMapper mapper)
    {
        _mediator = mediator;
        _mapper = mapper;
    }
    
    public override void Configure()
    {
        Post(CreateEventoRequest.Route);
        Roles("Admin", "Owner", "Discipulador"); // Autorização
        Description(d => d
            .Produces<Response<EventoRecord>>(201)
            .ProducesProblem(400)
            .ProducesProblem(401)
            .WithTags("Eventos"));
    }
    
    public override async Task HandleAsync(CreateEventoRequest req, CancellationToken ct)
    {
        // Mapeia Request → Command
        var command = _mapper.Map<CreateEventoCommand>(req);
        
        // Envia para handler (CQRS)
        var result = await _mediator.Send(command, ct);
        
        if (!result.IsSuccess)
        {
            await SendErrorsAsync(cancellation: ct);
            return;
        }
        
        // Mapeia Aggregate → Record (DTO saída)
        var record = _mapper.Map<EventoRecord>(result.Value);
        
        // Resposta
        await SendAsync(
            new Response<EventoRecord>(record),
            statusCode: 201,
            cancellation: ct
        );
    }
}

// 4. Command (Application)
public class CreateEventoCommand : IRequest<Result<EventoAggregate>>
{
    public string Nome { get; set; }
    public string? Descricao { get; set; }
    public int EstruturaId { get; set; }
    public DateTime DataInicio { get; set; }
    public TimeSpan HorarioInicio { get; set; }
    public RecorrenciaEnum Recorrencia { get; set; }
}

// 5. Handler (Use Case)
public class CreateEventoHandler : IRequestHandler<CreateEventoCommand, Result<EventoAggregate>>
{
    private readonly IRepository<EventoAggregate> _repository;
    private readonly IEstruturaRepository _estruturaRepository;
    
    public CreateEventoHandler(
        IRepository<EventoAggregate> repository,
        IEstruturaRepository estruturaRepository)
    {
        _repository = repository;
        _estruturaRepository = estruturaRepository;
    }
    
    public async Task<Result<EventoAggregate>> Handle(
        CreateEventoCommand request,
        CancellationToken ct)
    {
        // Validações de negócio
        var estrutura = await _estruturaRepository.GetByIdAsync(request.EstruturaId, ct);
        if (estrutura == null)
            return Result<EventoAggregate>.Error("Estrutura não encontrada");
        
        // Cria aggregate (domain logic)
        var eventoResult = EventoAggregate.Create(
            request.Nome,
            request.Descricao,
            request.EstruturaId,
            request.DataInicio,
            request.HorarioInicio,
            request.Recorrencia
        );
        
        if (!eventoResult.IsSuccess)
            return eventoResult;
        
        var evento = eventoResult.Value;
        
        // Persiste
        await _repository.AddAsync(evento, ct);
        await _repository.SaveChangesAsync(ct);
        
        return Result<EventoAggregate>.Success(evento);
    }
}

// 6. Record (DTO de saída)
public record EventoRecord(
    int Id,
    string Nome,
    string? Descricao,
    int EstruturaId,
    DateTime DataInicio,
    string HorarioInicio,
    string Recorrencia,
    string Status,
    DateTime CriadoEm
);

// 7. Mapping (AutoMapper)
public class EventoMappingProfile : Profile
{
    public EventoMappingProfile()
    {
        // Request → Command
        CreateMap<CreateEventoRequest, CreateEventoCommand>();
        
        // Aggregate → Record
        CreateMap<EventoAggregate, EventoRecord>()
            .ForMember(dest => dest.HorarioInicio, opt => opt.MapFrom(src => src.HorarioInicio.ToString(@"hh\:mm")))
            .ForMember(dest => dest.Recorrencia, opt => opt.MapFrom(src => src.Recorrencia.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
    }
}
```

---

## IV. CQRS Pattern (MANDATORY)

### Commands (Write Operations)

```csharp
// Command - Representa intenção de mudança de estado
public class UpdateEventoCommand : IRequest<Result<EventoAggregate>>
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public DateTime DataInicio { get; set; }
    // ... outros campos
}

// Handler
public class UpdateEventoHandler : IRequestHandler<UpdateEventoCommand, Result<EventoAggregate>>
{
    private readonly IRepository<EventoAggregate> _repository;
    
    public async Task<Result<EventoAggregate>> Handle(
        UpdateEventoCommand request,
        CancellationToken ct)
    {
        var evento = await _repository.GetByIdAsync(request.Id, ct);
        if (evento == null)
            return Result<EventoAggregate>.Error("Evento não encontrado");
        
        // Domain logic
        var updateResult = evento.Update(request.Nome, request.DataInicio);
        if (!updateResult.IsSuccess)
            return Result<EventoAggregate>.Error(updateResult.Error);
        
        await _repository.UpdateAsync(evento, ct);
        await _repository.SaveChangesAsync(ct);
        
        return Result<EventoAggregate>.Success(evento);
    }
}
```

### Queries (Read Operations)

```csharp
// Query - Representa consulta
public class GetEventoByIdQuery : IRequest<Result<EventoRecord>>
{
    public int Id { get; set; }
}

// Handler
public class GetEventoByIdHandler : IRequestHandler<GetEventoByIdQuery, Result<EventoRecord>>
{
    private readonly IRepository<EventoAggregate> _repository;
    private readonly IMapper _mapper;
    
    public async Task<Result<EventoRecord>> Handle(
        GetEventoByIdQuery query,
        CancellationToken ct)
    {
        var evento = await _repository.GetByIdAsync(query.Id, ct);
        if (evento == null)
            return Result<EventoRecord>.Error("Evento não encontrado");
        
        var record = _mapper.Map<EventoRecord>(evento);
        return Result<EventoRecord>.Success(record);
    }
}

// List Query com Paginação
public class ListEventosQuery : IRequest<Result<PagedResult<EventoRecord>>>
{
    public int EstruturaId { get; set; }
    public int? GrupoId { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 100;
}

public class ListEventosHandler : IRequestHandler<ListEventosQuery, Result<PagedResult<EventoRecord>>>
{
    private readonly IRepository<EventoAggregate> _repository;
    private readonly IMapper _mapper;
    
    public async Task<Result<PagedResult<EventoRecord>>> Handle(
        ListEventosQuery query,
        CancellationToken ct)
    {
        var queryable = _repository.Query()
            .Where(e => e.EstruturaId == query.EstruturaId);
        
        if (query.GrupoId.HasValue)
            queryable = queryable.Where(e => e.GruposIds.Contains(query.GrupoId.Value));
        
        var totalCount = await queryable.CountAsync(ct);
        
        var eventos = await queryable
            .OrderByDescending(e => e.CriadoEm)
            .Skip(query.Skip)
            .Take(query.Take)
            .ToListAsync(ct);
        
        var records = _mapper.Map<List<EventoRecord>>(eventos);
        
        var pagedResult = new PagedResult<EventoRecord>(
            data: records,
            totalCount: totalCount,
            page: query.Skip / query.Take + 1,
            pageSize: query.Take
        );
        
        return Result<PagedResult<EventoRecord>>.Success(pagedResult);
    }
}
```

---

## V. Repository Pattern (MANDATORY)

### Interface (Core)

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<List<T>> ListAsync(CancellationToken ct = default);
    IQueryable<T> Query();
    Task AddAsync(T entity, CancellationToken ct = default);
    Task UpdateAsync(T entity, CancellationToken ct = default);
    Task DeleteAsync(T entity, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

// Repository específico com métodos customizados
public interface IEventoRepository : IRepository<EventoAggregate>
{
    Task<List<EventoAggregate>> GetByEstruturaAsync(int estruturaId, CancellationToken ct = default);
    Task<List<EventoAggregate>> GetByGrupoAsync(int grupoId, CancellationToken ct = default);
    Task<EventoAggregate?> GetWithParticipantesAsync(int id, CancellationToken ct = default);
}
```

### Implementação (Infrastructure)

```csharp
public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;
    
    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }
    
    public virtual async Task<T?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, ct);
    }
    
    public virtual async Task<List<T>> ListAsync(CancellationToken ct = default)
    {
        return await _dbSet.ToListAsync(ct);
    }
    
    public virtual IQueryable<T> Query()
    {
        return _dbSet.AsQueryable();
    }
    
    public virtual async Task AddAsync(T entity, CancellationToken ct = default)
    {
        await _dbSet.AddAsync(entity, ct);
    }
    
    public virtual Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }
    
    public virtual Task DeleteAsync(T entity, CancellationToken ct = default)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }
    
    public virtual async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        return await _context.SaveChangesAsync(ct);
    }
}

// Implementação específica
public class EventoRepository : Repository<EventoAggregate>, IEventoRepository
{
    public EventoRepository(AppDbContext context) : base(context) { }
    
    public async Task<List<EventoAggregate>> GetByEstruturaAsync(
        int estruturaId,
        CancellationToken ct = default)
    {
        return await _dbSet
            .Where(e => e.EstruturaId == estruturaId)
            .OrderByDescending(e => e.CriadoEm)
            .ToListAsync(ct);
    }
    
    public async Task<List<EventoAggregate>> GetByGrupoAsync(
        int grupoId,
        CancellationToken ct = default)
    {
        return await _dbSet
            .Where(e => e.GruposIds.Contains(grupoId))
            .ToListAsync(ct);
    }
    
    public async Task<EventoAggregate?> GetWithParticipantesAsync(
        int id,
        CancellationToken ct = default)
    {
        return await _dbSet
            .Include(e => e.Participacoes)
            .FirstOrDefaultAsync(e => e.Id == id, ct);
    }
}
```

---

## VI. Entity Framework Configurations

### DbContext

```csharp
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<EventoAggregate> Eventos => Set<EventoAggregate>();
    public DbSet<GrupoAggregate> Grupos => Set<GrupoAggregate>();
    public DbSet<EstruturaAggregate> Estruturas => Set<EstruturaAggregate>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Aplica todas as configurações
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
    
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Auditoria automática
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is IAuditable && (e.State == EntityState.Added || e.State == EntityState.Modified));
        
        foreach (var entry in entries)
        {
            var auditable = (IAuditable)entry.Entity;
            
            if (entry.State == EntityState.Added)
            {
                auditable.CriadoEm = DateTime.UtcNow;
            }
            
            auditable.AtualizadoEm = DateTime.UtcNow;
        }
        
        return base.SaveChangesAsync(ct);
    }
}
```

### Entity Configuration (Fluent API)

```csharp
public class EventoConfiguration : IEntityTypeConfiguration<EventoAggregate>
{
    public void Configure(EntityTypeBuilder<EventoAggregate> builder)
    {
        builder.ToTable("Eventos");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .ValueGeneratedOnAdd();
        
        builder.Property(e => e.NomeGenerico)
            .HasColumnName("nome_generico")
            .HasMaxLength(100)
            .IsRequired();
        
        builder.Property(e => e.NomePersonalizado)
            .HasColumnName("nome_personalizado")
            .HasMaxLength(100);
        
        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();
        
        builder.Property(e => e.Recorrencia)
            .HasColumnName("recorrencia")
            .HasConversion<string>()
            .IsRequired();
        
        builder.Property(e => e.DataInicio)
            .HasColumnName("data_inicio")
            .IsRequired();
        
        builder.Property(e => e.CriadoEm)
            .HasColumnName("criado_em")
            .IsRequired();
        
        builder.Property(e => e.AtualizadoEm)
            .HasColumnName("atualizado_em");
        
        // Relacionamentos
        builder.HasOne(e => e.Estrutura)
            .WithMany()
            .HasForeignKey(e => e.EstruturaId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Owned entities (Value Objects)
        builder.OwnsOne(e => e.Localizacao, loc =>
        {
            loc.Property(l => l.Endereco).HasColumnName("localizacao_endereco");
            loc.Property(l => l.Travada).HasColumnName("localizacao_travada");
        });
        
        // Collections
        builder.HasMany(e => e.Participacoes)
            .WithOne()
            .HasForeignKey("EventoId")
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(e => e.EstruturaId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.DataInicio);
    }
}
```

---

## VII. Naming Conventions

### Aggregates

```csharp
EventoAggregate
GrupoAggregate
EstruturaAggregate
UsuarioAggregate
```

### Commands

```csharp
CreateEventoCommand
UpdateEventoCommand
DeleteEventoCommand
IniciarEventoCommand
FinalizarEventoCommand
```

### Queries

```csharp
GetEventoByIdQuery
ListEventosQuery
GetEventosAtivosPorEstruturaQuery
```

### Handlers

```csharp
CreateEventoHandler
UpdateEventoHandler
GetEventoByIdHandler
ListEventosHandler
```

### Endpoints

```csharp
Create.cs      // POST
Update.cs      // PUT
Delete.cs      // DELETE
GetById.cs     // GET /{id}
List.cs        // GET
```

### Requests

```csharp
CreateEventoRequest
UpdateEventoRequest
DeleteEventoRequest
ListEventosRequest
```

### Records (DTOs de saída)

```csharp
EventoRecord
GrupoRecord
EstruturaRecord
```

### Validators

```csharp
CreateEventoValidator
UpdateEventoValidator
```

---

## VIII. Result Pattern (Error Handling)

### Result Class

```csharp
public class Result
{
    public bool IsSuccess { get; }
    public string Error { get; }
    
    protected Result(bool isSuccess, string error)
    {
        IsSuccess = isSuccess;
        Error = error ?? string.Empty;
    }
    
    public static Result Success() => new Result(true, string.Empty);
    public static Result Failure(string error) => new Result(false, error);
}

public class Result<T> : Result
{
    public T Value { get; }
    
    private Result(bool isSuccess, T value, string error) : base(isSuccess, error)
    {
        Value = value;
    }
    
    public static Result<T> Success(T value) => new Result<T>(true, value, string.Empty);
    public static Result<T> Failure(string error) => new Result<T>(false, default!, error);
}
```

### Uso

```csharp
public async Task<Result<EventoAggregate>> Handle(
    CreateEventoCommand request,
    CancellationToken ct)
{
    // Validação
    if (string.IsNullOrWhiteSpace(request.Nome))
        return Result<EventoAggregate>.Failure("Nome é obrigatório");
    
    // Criação do aggregate
    var eventoResult = EventoAggregate.Create(request.Nome, request.EstruturaId);
    if (!eventoResult.IsSuccess)
        return eventoResult;
    
    var evento = eventoResult.Value;
    
    // Persistência
    await _repository.AddAsync(evento, ct);
    await _repository.SaveChangesAsync(ct);
    
    return Result<EventoAggregate>.Success(evento);
}

// No endpoint
var result = await _mediator.Send(command, ct);

if (!result.IsSuccess)
{
    AddError(result.Error);
    await SendErrorsAsync(cancellation: ct);
    return;
}

await SendAsync(new Response<EventoRecord>(result.Value), 201, ct);
```

---

## IX. Autenticação e Autorização

### JWT Configuration

```csharp
// Program.cs ou Startup
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
        };
    });

services.AddAuthorization(options =>
{
    options.AddPolicy("Owner", policy => policy.RequireRole("Owner"));
    options.AddPolicy("Discipulador", policy => policy.RequireRole("Owner", "Discipulador"));
    options.AddPolicy("Lider", policy => policy.RequireRole("Owner", "Discipulador", "Lider"));
});
```

### Uso no Endpoint

```csharp
public override void Configure()
{
    Post("/api/eventos");
    Roles("Owner", "Discipulador"); // Apenas estes papéis
    // Ou
    Policies("Owner"); // Usa policy
}
```

---

## X. Validation (FluentValidation)

### Validator

```csharp
public class CreateEventoValidator : Validator<CreateEventoRequest>
{
    public CreateEventoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(100).WithMessage("Nome deve ter no máximo 100 caracteres");
        
        RuleFor(x => x.EstruturaId)
            .GreaterThan(0).WithMessage("Estrutura inválida");
        
        RuleFor(x => x.DataInicio)
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Data deve ser futura ou hoje");
        
        RuleFor(x => x.HorarioInicio)
            .Must(BeValidTime).WithMessage("Horário inválido");
        
        RuleFor(x => x.Recorrencia)
            .IsInEnum().WithMessage("Recorrência inválida");
        
        When(x => x.Recorrencia == RecorrenciaEnum.SEMANAL, () =>
        {
            RuleFor(x => x.DiaSemana)
                .NotNull().WithMessage("Dia da semana é obrigatório para eventos semanais")
                .InclusiveBetween(0, 6).WithMessage("Dia da semana deve estar entre 0 (domingo) e 6 (sábado)");
        });
    }
    
    private bool BeValidTime(TimeSpan horario)
    {
        return horario >= TimeSpan.Zero && horario < TimeSpan.FromDays(1);
    }
}
```

---

## XI. Database Conventions

### Column Names (snake_case)

```csharp
// ✅ CORRETO - snake_case
nome_generico
nome_personalizado
data_inicio
horario_inicio
estrutura_id
criado_em
atualizado_em

// ❌ ERRADO - camelCase ou PascalCase
nomeGenerico
NomeGenerico
dataInicio
```

### Table Names (PascalCase Plural)

```csharp
Eventos
Grupos
Estruturas
Usuarios
Participacoes
```

### Foreign Keys

```csharp
estrutura_id     // Referência para Estruturas
grupo_id         // Referência para Grupos
usuario_id       // Referência para Usuarios
evento_id        // Referência para Eventos
```

---

## XII. Migrations

### Criar Migration

```bash
dotnet ef migrations add NomeDaMigration --project GestaoEventos.Infrastructure --startup-project GestaoEventos.Web
```

### Aplicar Migration

```bash
dotnet ef database update --project GestaoEventos.Infrastructure --startup-project GestaoEventos.Web
```

### Reverter Migration

```bash
dotnet ef migrations remove --project GestaoEventos.Infrastructure --startup-project GestaoEventos.Web
```

---

## XIII. Testing

### Unit Tests (xUnit)

```csharp
public class CreateEventoHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        var mockRepository = new Mock<IRepository<EventoAggregate>>();
        var handler = new CreateEventoHandler(mockRepository.Object);
        
        var command = new CreateEventoCommand
        {
            Nome = "Célula Teste",
            EstruturaId = 1,
            DataInicio = DateTime.Today.AddDays(7),
            HorarioInicio = TimeSpan.FromHours(20),
            Recorrencia = RecorrenciaEnum.SEMANAL
        };
        
        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        
        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Célula Teste", result.Value.NomeGenerico);
    }
    
    [Fact]
    public async Task Handle_NomeVazio_ReturnsError()
    {
        // Arrange
        var mockRepository = new Mock<IRepository<EventoAggregate>>();
        var handler = new CreateEventoHandler(mockRepository.Object);
        
        var command = new CreateEventoCommand
        {
            Nome = "",
            EstruturaId = 1
        };
        
        // Act
        var result = await handler.Handle(command, CancellationToken.None);
        
        // Assert
        Assert.False(result.IsSuccess);
        Assert.Contains("Nome é obrigatório", result.Error);
    }
}
```

### Integration Tests

```csharp
public class EventoEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public EventoEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task CreateEvento_ValidRequest_Returns201()
    {
        // Arrange
        var request = new CreateEventoRequest
        {
            Nome = "Célula Integration Test",
            EstruturaId = 1,
            DataInicio = DateTime.Today.AddDays(7),
            HorarioInicio = TimeSpan.FromHours(20),
            Recorrencia = RecorrenciaEnum.SEMANAL
        };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/eventos", request);
        
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var content = await response.Content.ReadFromJsonAsync<Response<EventoRecord>>();
        Assert.NotNull(content);
        Assert.NotNull(content.Data);
        Assert.Equal("Célula Integration Test", content.Data.Nome);
    }
}
```

---

## XIV. Code Quality Standards

### Cobertura de Testes
- **Unit tests**: mínimo 80%
- **Integration tests**: fluxos críticos cobertos

### SonarQube Compliance
- Code smells: 0
- Bugs: 0
- Security hotspots: 0
- Code duplication: < 3%

### Code Review Checklist

- [ ] Clean Architecture respeitada (camadas corretas)
- [ ] Object Calisthenics seguido (9 regras)
- [ ] FastEndpoints pattern completo (Request, Validator, Endpoint, Command/Query, Handler, Record, Mapping)
- [ ] CQRS implementado (Commands separados de Queries)
- [ ] Repository pattern utilizado
- [ ] Result pattern para error handling
- [ ] Naming conventions (Aggregates, Commands, Queries, Handlers, Endpoints)
- [ ] FluentValidation para validações
- [ ] Auditoria automática (IAuditable)
- [ ] Entity configurations (Fluent API)
- [ ] snake_case nos nomes de colunas
- [ ] JWT/Authorization configurado
- [ ] Testes unitários (cobertura mínima 80%)
- [ ] Testes de integração (fluxos críticos)

---

## XV. Performance

### Async/Await

```csharp
// ✅ CORRETO - Async ao longo da stack
public async Task<Result<EventoAggregate>> Handle(CreateEventoCommand request, CancellationToken ct)
{
    var evento = EventoAggregate.Create(request.Nome);
    await _repository.AddAsync(evento, ct);
    await _repository.SaveChangesAsync(ct);
    return Result<EventoAggregate>.Success(evento);
}

// ❌ ERRADO - Blocking
var evento = _repository.AddAsync(evento).Result; // ❌ Deadlock risk
```

### Paginação

```csharp
// ✅ CORRETO - Sempre paginar queries
public class ListEventosQuery
{
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 100;
}

var eventos = await _repository.Query()
    .Where(e => e.EstruturaId == estruturaId)
    .OrderByDescending(e => e.CriadoEm)
    .Skip(query.Skip)
    .Take(query.Take)
    .ToListAsync(ct);
```

### Índices

```csharp
// Entity Configuration
builder.HasIndex(e => e.EstruturaId); // FK sempre indexada
builder.HasIndex(e => e.Status); // Campos filtrados frequentemente
builder.HasIndex(e => e.DataInicio);
builder.HasIndex(e => new { e.EstruturaId, e.Status }); // Índice composto
```

---

## Governança

### Enforcement
- **Roslyn Analyzers** verificam Object Calisthenics
- **CI/CD gates** verificam compliance
- **Code reviews** obrigatórios
- **SonarQube** integrado

---

**Este documento é a fonte única de verdade para arquitetura e padrões de backend do GestaoEventos.**

Para outras referências:
- Business: Ver [business.md](business.md)
- Frontend: Ver [frontend.md](frontend.md)
- Constitution: Ver [constitution.md](constitution.md)
