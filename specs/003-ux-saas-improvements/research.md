# Research Notes: UX & SaaS Platform Enhancements

**Feature**: 003-ux-saas-improvements  
**Created**: February 12, 2026  
**Status**: In Progress

## Phase 0: Technology Research

### 1. Mercado Pago SDK Integration

**Decision Required**: Payment processing SDK for Brazilian market

**Investigation**:
- ❌ `MercadoPago` package (v1.0.x): Incompatible with .NET 8 (targets .NET Framework only)
  - Error: NU1701 - Package restored using .NETFramework instead of net8.0
  - Dependency conflicts: Old versions of Newtonsoft.Json (3.5.8) vs project requirement (13.0.3+)
  - Dependency conflicts: RestSharp 102.7.0 (ancient version)
  
- ❌ `MercadoPagoSDK` package: Does not exist on NuGet

**Options**:

**Option A: REST API Integration (Recommended)** ✅
- Use HttpClient directly with Mercado Pago REST API
- Official API documentation: https://www.mercadopago.com.br/developers/pt/reference
- Endpoints needed:
  - `POST /checkout/preferences` - Create payment preference
  - `POST /v1/payments` - Process payment
  - Webhooks for payment notifications
- **Pros**:
  - Full control over implementation
  - No dependency on outdated SDKs
  - .NET 8 compatible
  - Better for long-term maintenance
- **Cons**:
  - More code to write
  - Need to implement authentication, serialization, error handling manually

**Option B: Mercado Pago .NET SDK (Modern Fork)**
- Search for community-maintained .NET Core compatible forks
- GitHub: `mercadopago/sdk-dotnet` repository
- Check if official repo has been updated for .NET Core/.NET 8
- **Status**: Needs investigation

**Option C: Wrap JavaScript SDK**
- Use Mercado Pago JavaScript SDK (MercadoPago.js) for client-side tokenization
- Backend only validates webhooks and stores transaction data
- **Pros**:
  - Official SDK well-maintained
  - Client-side card tokenization (PCI compliance easier)
- **Cons**:
  - Less control on backend
  - Still need REST API for server-side operations

**Recommendation**: **Option A + Option C Hybrid**
1. Frontend: Use MercadoPago.js for card tokenization (PCI compliant)
2. Backend: REST API integration using HttpClient with strongly-typed DTOs
3. Implementation:
   - Create `MercadoPagoService` in `Infrastructure/Services/`
   - Use `IHttpClientFactory` for resilient HTTP calls
   - Implement webhook signature verification
   - Store credentials in `appsettings.json` with User Secrets for dev

**Next Steps**:
- [ ] Create `MercadoPagoService.cs` with REST API methods
- [ ] Create DTOs for payment preferences, payment creation, webhook notifications
- [ ] Configure User Secrets for TEST credentials: `dotnet user-secrets set "MercadoPago:AccessToken" "TEST-xxx"`
- [ ] Test sandbox environment with PIX, credit card, boleto flows

---

### 2. Organization Chart Library

**Decision Required**: Component library for hierarchical visualization (FR-010)

**Options Evaluated**:

**Option A: PrimeNG OrganizationChart** ✅ **SELECTED**
- **Status**: Already installed (primeng@19.1.3)
- Component: `p-organizationChart`
- **Pros**:
  - Native Angular component
  - Already part of tech stack (zero new dependencies)
  - Vertical tree layout (matches clarification requirement)
  - Supports expand/collapse, selection, styling
  - TypeScript support out of the box
  - PrimeNG theming compatibility
- **Cons**:
  - Less flexible than D3 for complex customizations
  - Performance with >1000 nodes not optimal (but acceptable for our scale)
- **Verdict**: Best choice given existing investment in PrimeNG

**Option B: ngx-graph**
- GitHub: `swimlane/ngx-graph`
- **Pros**:
  - Powerful graph visualization
  - Multiple layout algorithms (dagre, d3-force)
  - Good for complex networks
- **Cons**:
  - Overkill for simple tree visualization
  - Additional dependency
  - Steeper learning curve
- **Verdict**: Too complex for requirements

**Option C: D3.js + Custom Component**
- Library: d3-hierarchy
- **Pros**:
  - Ultimate flexibility
  - Best performance for large trees
  - Custom animations and interactions
- **Cons**:
  - Significant development effort
  - D3 learning curve
  - Maintenance burden
  - Need to wrap in Angular component
- **Verdict**: Not justified for MVP

**Selected**: **PrimeNG OrganizationChart**

**Implementation Plan**:
```typescript
// Component usage
<p-organizationChart
  [value]="hierarchyData"
  [collapsible]="true"
  selectionMode="single"
  (onNodeSelect)="onDrillDown($event)"
>
  <ng-template let-node pTemplate="default">
    <div class="org-node">
      <div class="node-name">{{ node.label }}</div>
      <div class="node-stats">
        <span>{{ node.data.eventCount }} eventos</span>
        <span>{{ node.data.attendanceRate }}% presença</span>
      </div>
    </div>
  </ng-template>
</p-organizationChart>
```

**Data Structure**:
```typescript
interface TreeNode {
  label: string;
  type: 'person' | 'group' | 'level';
  expanded?: boolean;
  styleClass?: string;
  data: {
    id: number;
    eventCount: number;
    attendanceRate: number;
    canDrillDown: boolean;
  };
  children?: TreeNode[];
}
```

---

### 3. i18n Strategy (ngx-translate)

**Decision Required**: Internationalization architecture (FR-035)

**Selected**: **ngx-translate** ✅ **IMPLEMENTED**
- **Status**: Installed (@ngx-translate/core@17.0.0, @ngx-translate/http-loader@17.0.0)
- **Configuration**: Completed in `app.config.ts` with default language 'pt-br'
- **Translation File**: Created at `assets/i18n/pt-br.json` with comprehensive initial translations

**Architecture**:
```
assets/i18n/
├── pt-br.json (active - 300+ keys)
├── en.json (future - prepared structure)
└── es.json (future - prepared structure)
```

**Usage Pattern** (3-Layer Architecture compliance):
```typescript
// Component (Layer 1 - Presentation only)
constructor(private translate: TranslateService) {}

ngOnInit() {
  this.buttonLabel = this.translate.instant('common.save');
}

// Or with async pipe
<button>{{ 'common.save' | translate }}</button>
```

**Translation Keys Organization**:
- `common.*` - Shared UI elements (save, cancel, etc.)
- `auth.*` - Authentication flows
- `validation.*` - Form validation messages
- `errors.*` - Error messages mapped from API error codes
- `dashboard.*`, `events.*`, `hierarchy.*`, etc. - Feature-specific translations

**MVP Scope**:
- Only PT-BR active
- Architecture prepared for future languages
- All strings externalized (no hardcoded text)

**Known Issues**:
- ngx-translate has deprecation warnings for Angular 17+
  - Alternative considered: `@angular/localize` (official i18n solution)
  - Decision: Stick with ngx-translate for MVP (well-known, team familiarity)
  - Can migrate to @angular/localize in Phase 8 (post-launch) if needed

---

### 4. Rolling 30-Day Window Query Optimization

**Decision Required**: Efficient query for event limits per subscription plan (FR-024)

**Requirement**: Count events created in last 30 days by user, respecting hierarchy context

**SQL Strategy**:

**Option A: Simple WHERE clause** (Recommended for MVP)
```sql
SELECT COUNT(*) 
FROM Events 
WHERE UserId = @userId 
  AND CreatedAt >= DATEADD(day, -30, GETUTCDATE())
  AND Status != 'Deleted'
```

**Optimization**:
- Composite index: `IX_Events_UserId_CreatedAt_Status (UserId, CreatedAt DESC, Status)`
- Query plan: Index Seek (efficient)
- Expected performance: <10ms for millions of rows

**Option B: Materialized view with daily aggregation**
```sql
CREATE VIEW vw_UserEventCounts AS
SELECT 
  UserId,
  CAST(CreatedAt AS DATE) as EventDate,
  COUNT(*) as DailyCount
FROM Events
WHERE Status != 'Deleted'
GROUP BY UserId, CAST(CreatedAt AS DATE)
```
- **Pros**: Pre-aggregated, ultra-fast queries
- **Cons**: Complex maintenance, storage overhead, not real-time
- **Verdict**: Overkill for MVP scale (500 users × 5-10 events/month = 2,500 events/month)

**Selected**: **Option A** with proper indexing

**Implementation**:
```csharp
// In SubscriptionAggregate or EventLimit ValueObject
public class EventLimit
{
    private const int ROLLING_WINDOW_DAYS = 30;
    
    public static async Task<int> GetUsageInWindowAsync(
        int userId, 
        IEventRepository eventRepo)
    {
        var startDate = DateTime.UtcNow.AddDays(-ROLLING_WINDOW_DAYS);
        return await eventRepo.CountAsync(
            e => e.UserId == userId 
              && e.CreatedAt >= startDate 
              && e.Status != EventStatus.Deleted
        );
    }
}
```

**Migration Script** (Phase 2 - Foundation):
```sql
-- Add index for rolling window queries
CREATE NONCLUSTERED INDEX IX_Events_UserId_CreatedAt_Status
ON Events (UserId, CreatedAt DESC, Status)
INCLUDE (Id)
WHERE Status != 'Deleted';
```

---

### 5. Permission Conflict Resolution Algorithm

**Decision Required**: Logic when user has multiple conflicting permissions (FR-013, FR-018)

**Clarification Decision**: "Most Restrictive Wins" (security-first approach)

**Scenarios**:
1. User is Owner of Event A → has all permissions
2. User is assigned as Participant with "View Only" → restrictions apply
3. **Conflict**: User is Owner AND assigned as "View Only" participant
   - Resolution: Owner permissions win (most permissive in this case shows Owner intent)
   - Correction: Actually "most restrictive" means if explicitly set to view-only, honor that

**Revised Algorithm** (clarification: "most restrictive"):

```csharp
public class PermissionConflictResolver
{
    public EventPermissionSet ResolvePermissions(
        User user, 
        Event evento, 
        IEnumerable<EventPermission> userPermissions)
    {
        // 1. If user is event owner -> all permissions (unless explicitly denied)
        if (evento.OwnerId == user.Id)
        {
            // Check if there's an explicit deny
            var explicitDeny = userPermissions
                .FirstOrDefault(p => p.UserId == user.Id && p.IsDeny);
            if (explicitDeny != null)
                return explicitDeny.Permissions; // Honor explicit deny
            
            return EventPermissionSet.All; // Full permissions
        }
        
        // 2. Aggregate all permission grants
        var allGrants = userPermissions
            .Where(p => !p.IsDeny)
            .Select(p => p.Permissions)
            .ToList();
        
        // 3. Aggregate all explicit denies
        var allDenies = userPermissions
            .Where(p => p.IsDeny)
            .Select(p => p.Permissions)
            .ToList();
        
        // 4. Start with granted permissions
        var result = allGrants.Any() 
            ? allGrants.Aggregate((a, b) => a | b) // Bitwise OR
            : EventPermissionSet.None;
        
        // 5. Remove denied permissions (most restrictive wins)
        if (allDenies.Any())
        {
            var deniedMask = allDenies.Aggregate((a, b) => a | b);
            result = result & ~deniedMask; // Bitwise AND NOT
        }
        
        return result;
    }
}

[Flags]
public enum EventPermissionSet
{
    None = 0,
    View = 1 << 0,          // 0001
    Edit = 1 << 1,          // 0010
    Delete = 1 << 2,        // 0100
    MarkAttendance = 1 << 3, // 1000
    All = View | Edit | Delete | MarkAttendance
}
```

**Example**:
```
User has 3 permissions assigned:
1. Group A: View | Edit (0011)
2. Group B: View | Delete (0101)
3. Explicit Deny: Edit (0010)

Step 1: Aggregate grants: 0011 | 0101 = 0111 (View | Edit | Delete)
Step 2: Aggregate denies: 0010 (Edit)
Step 3: Apply deny: 0111 & ~0010 = 0101 (View | Delete)

Final: User can View and Delete, but NOT Edit
```

**Edge Cases**:
- No permissions assigned → inherit from group/hierarchy level default
- Owner with explicit deny → deny wins (security first)
- Hierarchical permissions (drill-down context) → apply same logic at each level

---

### 6. Error Handling Strategy

**Decision Required**: User-friendly error messages without exposing technical details (FR-007)

**Architecture**: **Error Interceptor + Code Mapping**

**Frontend** (`ErrorHandlerInterceptor`):
```typescript
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const userMessage = mapErrorToUserMessage(error);
      
      // Show toast notification
      inject(ToastrService).error(
        userMessage.message,
        userMessage.title,
        { timeOut: 5000, closeButton: true }
      );
      
      // Log technical details to console (dev only)
      if (!environment.production) {
        console.error('API Error:', error);
      }
      
      return throwError(() => new UserFriendlyError(userMessage));
    })
  );
};

function mapErrorToUserMessage(error: HttpErrorResponse): ErrorMessage {
  // Check for custom error code from backend
  const errorCode = error.error?.code;
  
  if (errorCode && ERROR_CODE_MAP[errorCode]) {
    return ERROR_CODE_MAP[errorCode];
  }
  
  // Fallback to HTTP status mapping
  switch (error.status) {
    case 400:
      return {
        title: 'Dados Inválidos',
        message: error.error?.message || 'Verifique os dados e tente novamente.',
        code: 'VALIDATION_ERROR'
      };
    case 401:
      return {
        title: 'Não Autorizado',
        message: 'Sua sessão expirou. Faça login novamente.',
        code: 'UNAUTHORIZED'
      };
    case 403:
      return {
        title: 'Acesso Negado',
        message: 'Você não tem permissão para realizar esta ação.',
        code: 'FORBIDDEN'
      };
    case 404:
      return {
        title: 'Não Encontrado',
        message: 'O recurso solicitado não foi encontrado.',
        code: 'NOT_FOUND'
      };
    case 500:
    default:
      return {
        title: 'Erro no Servidor',
        message: 'Ocorreu um erro. Nossa equipe foi notificada. Tente novamente em alguns instantes.',
        code: 'SERVER_ERROR',
        showRetry: true
      };
  }
}

const ERROR_CODE_MAP: Record<string, ErrorMessage> = {
  'SUBSCRIPTION_LIMIT_EXCEEDED': {
    title: 'Limite Atingido',
    message: 'Você atingiu o limite de eventos do seu plano. Faça upgrade para criar mais eventos.',
    code: 'SUBSCRIPTION_LIMIT_EXCEEDED',
    action: { label: 'Ver Planos', route: '/subscription' }
  },
  'INVITE_EXPIRED': {
    title: 'Convite Expirado',
    message: 'Este convite expirou. Solicite um novo convite ao administrador.',
    code: 'INVITE_EXPIRED'
  },
  'PERMISSION_DENIED': {
    title: 'Permissão Negada',
    message: 'Você não tem permissão para editar este evento.',
    code: 'PERMISSION_DENIED'
  },
  'INVALID_HIERARCHY_DEPTH': {
    title: 'Hierarquia Inválida',
    message: 'A estrutura excede o limite máximo de 6 níveis.',
    code: 'INVALID_HIERARCHY_DEPTH'
  }
};
```

**Backend** (FastEndpoints):
```csharp
public class CreateEventEndpoint : Endpoint<CreateEventRequest, EventResponse>
{
    public override async Task HandleAsync(CreateEventRequest req, CancellationToken ct)
    {
        try
        {
            var result = await Mediator.Send(new CreateEventCommand(req), ct);
            
            if (result.IsSuccess)
            {
                await SendOkAsync(result.Value, ct);
            }
            else
            {
                // Map domain errors to API error responses
                await SendErrorAsync(result.Error, ct);
            }
        }
        catch (SubscriptionLimitExceededException ex)
        {
            await SendAsync(new ErrorResponse
            {
                Code = "SUBSCRIPTION_LIMIT_EXCEEDED",
                Message = "Event limit exceeded for current subscription plan",
                Severity = "warning"
            }, 403, ct);
        }
        catch (Exception ex)
        {
            // Log exception with full stack trace
            Logger.LogError(ex, "Unexpected error creating event");
            
            // Return generic user-friendly message
            await SendAsync(new ErrorResponse
            {
                Code = "SERVER_ERROR",
                Message = "An unexpected error occurred",
                Severity = "error"
            }, 500, ct);
        }
    }
}

private async Task SendErrorAsync(Error error, CancellationToken ct)
{
    var (statusCode, errorCode) = error switch
    {
        ValidationError => (400, "VALIDATION_ERROR"),
        NotFoundError => (404, "NOT_FOUND"),
        UnauthorizedError => (401, "UNAUTHORIZED"),
        ForbiddenError => (403, "FORBIDDEN"),
        _ => (500, "SERVER_ERROR")
    };
    
    await SendAsync(new ErrorResponse
    {
        Code = errorCode,
        Message = error.Message,
        Details = error.ValidationErrors
    }, statusCode, ct);
}
```

**Benefits**:
- Zero technical jargon visible to users
- Consistent error UX across entire app
- Actionable error messages with retry/navigation options
- Detailed logging for debugging (server-side)
- Error codes enable tracking and analytics

---

## Summary of Decisions

| Research Topic | Decision | Status |
|----------------|----------|--------|
| Mercado Pago SDK | REST API + MercadoPago.js hybrid | ⚠️ To Implement |
| Org Chart Library | PrimeNG OrganizationChart | ✅ Selected (already installed) |
| i18n Strategy | ngx-translate | ✅ Implemented |
| Rolling Window Query | Simple WHERE + Index | ✅ Design Complete |
| Permission Conflicts | Most Restrictive Wins (bitwise ops) | ✅ Design Complete |
| Error Handling | Interceptor + Code Mapping | ✅ Design Complete |

**Next Steps**:
1. Implement `MercadoPagoService` with REST API integration (Phase 2 - Foundation T019)
2. Create database indexes for optimized queries (Phase 2 - Foundation T022)
3. Implement `PermissionConflictResolver` (Phase 2 - Foundation T015)
4. Implement `ErrorHandlerInterceptor` (Phase 2 - Foundation T023)

**Notes**:
- All decisions align with Phase 0 requirements from plan.md
- Architecture choices favor maintainability over complexity
- MVP-focused: pragmatic solutions that scale to expected load (500 users, 1000-5000 events)
