# Task 001: Corrigir Erro 400 ao Criar Evento

**Status**: 🔴 Bloqueador  
**Estimativa**: 1 dia  
**Prioridade**: P0  
**Depende de**: Nenhuma

---

## 🐛 Problema

Ao tentar criar evento, retorna erro 400:

```json
{
  "status_code": 400,
  "message": "One or more errors occurred!",
  "errors": {
    "usuario_id": ["Usuário ID deve ser maior que 0"],
    "estrutura_id": ["Estrutura ID deve ser maior que 0"],
    "grupo_id": ["Grupo ID deve ser maior que 0"],
    "inicio_em": ["Data de início é obrigatória"]
  }
}
```

**Causa Raiz:**
- Frontend não está enviando `usuario_id`, `estrutura_id`, `grupo_id`
- Frontend não está enviando data no formato correto (ISO 8601)
- Frontend não está usando snake_case (backend espera)

---

## 🔄 Fluxo de Contexto vs Dados do Formulário

### ⚠️ IMPORTANTE: Separação de Responsabilidades

#### 1️⃣ **Context (ContextService)** - Quem está usando o sistema

```typescript
// Contexto do usuário logado (para navegação)
{
  usuarioId: 123,        // Quem está logado
  estruturaId: 456,      // Qual estrutura está vendo (se tiver múltiplas)
  grupoAtual: 789        // Onde está navegando (zoom visual)
}
```

**Preenchido em:**
- `usuarioId`: Após login (do token JWT)
- `estruturaId`: 
  - Se tiver **1 estrutura**: pré-seleciona automaticamente
  - Se tiver **múltiplas**: usuário escolhe no menu
- `grupoAtual`: Ao navegar com zoom (sidebar)

#### 2️⃣ **Form Data** - O que está sendo criado

```typescript
// Dados do formulário (escolha do usuário)
{
  estruturaId: 456,         // Para qual estrutura (se tiver múltiplas)
  gruposIds: [789, 790],    // Para quais grupos (múltipla seleção)
  participantesIds: [],     // OU pessoas específicas
  titulo: "Reunião",
  dataInicio: "2026-02-15",
  // ...
}
```

**Escolhido pelo usuário no formulário!**

---

### 🔐 Autenticação: Guard, NÃO Component!

**❌ ERRADO** (quebra de responsabilidade):
```typescript
// evento-form.component.ts
ngOnInit(): void {
  if (!this.authService.isAuthenticated()) {  // ❌ NÃO!
    this.router.navigate(['/login']);
  }
}
```

**✅ CORRETO** (usar Guard):
```typescript
// app.routes.ts
{
  path: 'admin/eventos/criar',
  component: EventoFormComponent,
  canActivate: [AuthGuard]  // ✅ Guard valida autenticação
}

// auth.guard.ts
canActivate(): boolean {
  if (!this.authService.isAuthenticated()) {
    this.router.navigate(['/login']);
    return false;
  }
  return true;
}
```

---

### 🎯 Fluxo Correto

#### Passo 1: Login
```typescript
// auth.service.ts
login(email, senha).subscribe(response => {
  // Backend retorna estruturas do usuário
  const estruturas = response.estruturas;
  
  this.contextService.setContexto({
    usuarioId: response.usuario_id,  // ✅ Do token
    token: response.token,
    estruturas: estruturas,
    estruturaId: estruturas.length === 1 ? estruturas[0].id : null,  // ✅ Auto-seleciona se tiver 1
    grupoAtual: null
  });

  // Se tiver múltiplas, redireciona para escolher
  if (estruturas.length > 1) {
    this.router.navigate(['/selecionar-estrutura']);
  } else {
    this.router.navigate(['/dashboard']);
  }
});
```

#### Passo 2: Formulário de Evento
```typescript
// evento-form.component.ts
ngOnInit(): void {
  const contexto = this.contextService.contexto();
  
  // ✅ Usuario_id vem do contexto (quem está criando)
  this.usuarioLogado = contexto.usuarioId;
  
  // Se tiver MÚLTIPLAS estruturas, mostrar dropdown
  if (contexto.estruturas.length > 1) {
    this.estruturas = contexto.estruturas;
    this.form.get('estruturaId')?.enable();
  } else {
    // Se tiver 1, pré-seleciona
    this.form.patchValue({ estruturaId: contexto.estruturaId });
    this.form.get('estruturaId')?.disable();
  }
  
  // Carregar grupos disponíveis
  this.carregarGruposDisponiveis();
}

onSubmit(): void {
  const formData = this.form.value;
  const contexto = this.contextService.contexto();
  
  const request = {
    // Do contexto (quem está fazendo)
    usuario_id: contexto.usuarioId,  // ✅ Quem está criando
    
    // Do formulário (o que está sendo criado)
    estrutura_id: formData.estruturaId,        // ✅ Para qual estrutura
    grupos_ids: formData.gruposIds,            // ✅ Para quais grupos (múltiplos!)
    participantes_ids: formData.participantesIds || [],  // OU pessoas específicas
    
    titulo: formData.titulo,
    inicio_em: formData.dataInicio.toISOString(),
    // ...
  };
  
  this.eventoService.create(request).subscribe(...);
}
```

---

## ✅ Checklist de Implementação

### [ ] 1. Criar AuthGuard (se não existir)

**Arquivo**: `auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@shared/services/auth/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
```

**Adicionar nas rotas**:
```typescript
// app.routes.ts
{
  path: 'admin/eventos/criar',
  component: EventoFormComponent,
  canActivate: [authGuard]  // ✅ Guard valida autenticação
}
```

### [ ] 2. Atualizar `onSubmit()` no Component

**Arquivo**: `evento-form.component.ts`

```typescript
onSubmit(): void {
  if (this.form.invalid) {
    this.marcarTodosCamposComoTocados();
    this.erro.set('Formulário inválido');
    return;
  }

  this.limparMensagens();
  this.carregando.set(true);

  const formData = this.form.value;
  const contexto = this.contextService.contexto();

  // ✅ usuario_id vem do CONTEXTO (quem está criando)
  // ✅ estrutura_id vem do FORMULÁRIO (escolha do usuário)
  // ✅ grupos_ids vem do FORMULÁRIO (múltiplos grupos)
  
  const request = {
    usuario_id: contexto.usuarioId,           // ✅ Quem está criando
    estrutura_id: formData.estruturaId,       // ✅ Para qual estrutura
    grupos_ids: formData.gruposIds || [],     // ✅ Para quais grupos (múltiplos!)
    participantes_ids: formData.participantesIds || [],  // OU pessoas específicas
    
    titulo: formData.titulo,
    descricao: formData.descricao || '',
    inicio_em: new Date(formData.dataInicio).toISOString(),
    fim_em: this.calcularFim(formData.dataInicio, formData.duracao).toISOString(),
    local: formData.local || '',
    recorrente: formData.tipoRecorrencia !== 'nenhuma',
    tipo_recorrencia: formData.tipoRecorrencia !== 'nenhuma' ? formData.tipoRecorrencia : null
  };

  console.log('[EventoForm] Enviando:', request);

  this.eventoService.create(request).subscribe({
    next: () => {
      this.sucesso.set('Evento criado com sucesso!');
      setTimeout(() => this.router.navigate(['/admin/eventos']), 1500);
    },
    error: (err) => {
      this.erro.set(this.extrairMensagemErro(err));
      this.carregando.set(false);
    }
  });
}

private calcularFim(inicio: Date, duracao: {horas: number, minutos: number}): Date {
  const fim = new Date(inicio);
  fim.setHours(fim.getHours() + duracao.horas);
  fim.setMinutes(fim.getMinutes() + duracao.minutos);
  return fim;
}
```

### [ ] 2. Criar Helper para Extrair Erro

```typescript
private extrairMensagemErro(err: any): string {
  if (err.error?.errors) {
    const erros: string[] = [];
    Object.entries(err.error.errors).forEach(([campo, mensagens]) => {
      if (Array.isArray(mensagens)) {
        mensagens.forEach(msg => erros.push(`${campo}: ${msg}`));
      }
    });
    return erros.join('\n');
  }

  return err.error?.message || 'Erro ao criar evento';
}
```

### [ ] 3. Atualizar `ngOnInit()` - Estrutura e Grupos

**ATENÇÃO**: Não validar autenticação aqui (Guard faz isso)!

```typescript
ngOnInit(): void {
  const contexto = this.contextService.contexto();
  
  // 1. Estrutura: Se tiver múltiplas, usuário escolhe; se tiver 1, pré-seleciona
  if (contexto.estruturas.length > 1) {
    this.estruturas.set(contexto.estruturas);
    this.form.get('estruturaId')?.enable();
  } else if (contexto.estruturas.length === 1) {
    this.form.patchValue({ estruturaId: contexto.estruturas[0].id });
    this.form.get('estruturaId')?.disable();
  }
  
  // 2. Carregar grupos disponíveis da estrutura
  this.carregarGruposDisponiveis();
  
  // 3. Inicializar formulário
  this.inicializarFormulario();
  this.configurarListeners();
}

private carregarGruposDisponiveis(): void {
  const estruturaId = this.form.get('estruturaId')?.value;
  if (!estruturaId) return;
  
  this.grupoService.listarPorEstrutura(estruturaId).subscribe({
    next: (grupos) => {
      this.gruposDisponiveis.set(grupos);
    },
    error: (err) => {
      console.error('Erro ao carregar grupos:', err);
    }
  });
}
```

### [ ] 3. Validar Contexto Completo no `ngOnInit()`

```typescript
ngOnInit(): void {
  this.verificarContextoCompleto();  // ✅ PRIMEIRA COISA
  this.inicializarFormulario();
  this.configurarListeners();
}

private verificarContextoCompleto(): void {
  const contexto = this.contextService.contexto();
  const estrutura = this.estruturaService.estruturaSelecionada();
  const grupo = this.estruturaService.grupoSelecionado();

  // ❌ Não está logado
  if (!contexto?.usuarioId) {
    this.erro.set('❌ Você precisa estar logado');
    this.router.navigate(['/login']);
    return;
  }

  // ⚠️ NãoGarantir que Serviços Estão Populando Contexto

**VERIFICAR se esses métodos existem e estão sendo chamados:**

#### A) No `auth.service.ts` (ou onde faz login):

```typescript
// ✅ Após login bem-sucedido
login(email: string, senha: string): Observable<any> {
  return this.http.post('/api/auth/login', { email, senha })
    .pipe(
      tap(response => {
        // CRITICAL: Atualizar contexto com usuarioId
        this.contextService.setContexto({
          usuarioId: response.usuario_id,  // ✅
          token: response.token,
          papel: response.papel,
          estruturas: response.estruturas,
          estruturaId: null,
          grupoId: null
        });
      })
    );
}
```

#### B) No `estrutura.service.ts`:

```typescript
// ✅ Já existe, mas verificar se está atualizando contexto
selecionarEstrutura(estrutura: Estrutura): void {
  localStorage.setItem('estruturaSelecionada', JSON.stringify(estrutura));
  
  // CRITICAL: Atualizar contexto
  const ctx = this.contextService.contexto();
  this.contextService.setContexto({
    ...ctx,
    estruturaId: estrutura.id  // ✅
  });
}

selecionarGrupo(grupo: Grupo): void {
  localStorage.setItem('grupoSelecionado', JSON.stringify(grupo));
  
  // CRITICAL: Atualizar contexto
  const ctx = this.contextService.contexto();
  this.contextService.setContexto({
    ...ctx,
    grupoId: grupo.id  // ✅
  });
}
```

### [ ] 5. Testar com Postman/Insomnia (Backend)

Antes de testar no frontend, validar que backend aceita:

```bash
POST /api/eventos
{
  "usuario_id": 1,
  "estrutura_id": 1,
  "grupo_id": 1,
  "titulo": "Teste",Incompleto

#### 2A: Não está logado
```
DADO que não estou logado (usuarioId = null)
QUANDO tento acessar /admin/eventos/criar
ENTÃO deve redirecionar para /login
E mostrar erro "❌ Você precisa estar logado"
```

#### 2B: Não selecionou estrutura
```
DADO que estou logado MAS não selecionei estrutura
QUANDO tento acessar formulário
ENTÃO deve redirecionar para /selecionar-estrutura
E mostrar erro "⚠️ Selecione uma estrutura primeiro"
```

#### 2C: Não selecionou grupo
```
DADO que selecionei estrutura MAS não selecionei grupo (via zoom)
QUANDO abro formulário
ENTÃO formulário deve estar desabilitado
E mostrar erro "⚠️ Use o navegador hierárquico para selecionar um grupo"
```

Deve retornar `201 Created`. estruturaId: estrutura.id,
    grupoId: grupo.id
  });
}
```

### [ ] 4. Testar com Postman/Insomnia

Antes de testar no frontend, validar que backend aceita:

```bash
POST /api/eventos
{
  "usuario_id": 1,
  "estrutura_id": 1,
  "grupo_id": 1,
  "titulo": "Teste",
  "descricao": "Teste",
  "inicio_em": "2026-02-15T20:00:00.000Z",
  "fim_em": "2026-02-15T22:00:00.000Z",
  "local": "Igreja",
  "recorrente": false
}
```

---

## 🧪 Testes de Aceitação

### ✅ Cenário 1: Criar Evento com Sucesso
```
DADO que estou logado
E tenho estrutura e grupo selecionados
QUANDO preencho:
  - Título: "Teste"
  - Data Início: 01/02/2026 20:00
  - Data Fim: 01/02/2026 22:00
E clico em "Criar Evento"
ENTÃO request deve conter:
  ✅ usuario_id: 123
  ✅ estrutura_id: 456
  ✅ grupo_id: 789
  ✅ inicio_em: "2026-02-01T20:00:00.000Z"
E evento deve ser criado (201)
```

### ✅ Cenário 2: Validar Contexto Ausente
```
DADO que não tenho estrutura selecionada
QUANDO abro formulário
ENTÃO deve mostrar erro:
  "⚠️ Selecione uma estrutura e grupo antes de criar evento"
E formulário deve estar desabilitado
```

### ✅ Cenário 3: Tratar Erro 400
```
DADO que backend retorna 400:
  {"errors": {"titulo": ["Título já existe"]}}
QUANDO tento criar evento
ENTÃO deve mostrar:
  "titulo: Título já existe"
E deve parar loading
```

---

## ✅ Critérios de Conclusão

- [ ] Request contém `usuario_id`, `estrutura_id`, `grupo_id`
- [ ] Datas no formato ISO 8601
- [ ] snake_case nos nomes de campos
- [ ] Evento é criado sem erro 400
- [ ] Erros do backend exibidos corretamente
- [ ] Logs de debug no console
- [ ] Todos os 3 cenários de teste passam
