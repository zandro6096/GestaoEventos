# Correções Aplicadas - Separation of Concerns

**Data**: 31/01/2026  
**Motivo**: Feedback do usuário sobre quebra de responsabilidades

---

## 🚨 Problemas Identificados

1. **Guard vs Component**: Validação de autenticação estava no component, não em Guard
2. **Context vs Form**: Confusão entre dados de navegação (context) e dados do formulário
3. **Seleção Única vs Múltipla**: Formulário não permitia selecionar múltiplos grupos
4. **Múltiplas Estruturas**: Não havia tratamento para usuário com 2+ estruturas

---

## ✅ Correções Aplicadas

### 1. Constitution.md Atualizada

Adicionada seção **VI. Separation of Concerns (NON-NEGOTIABLE)** com:

#### 1.1 Guards
- **Responsabilidade**: Controle de acesso a rotas
- **Fazer**: Verificar autenticação, verificar permissões, redirecionar
- **NÃO fazer**: Lógica de negócio, manipulação de dados, validação de formulários

#### 1.2 Components  
- **Responsabilidade**: Apresentação e interação
- **Fazer**: Renderizar UI, capturar input, validar formulários, chamar services
- **NÃO fazer**: Validar autenticação (usar Guard), lógica de negócio complexa, HTTP direto

#### 1.3 Services
- **Business Services**: Regras de negócio, transformação, cache, estado
- **API Services**: Apenas HTTP, transformação snake_case ↔ camelCase

#### 1.4 Context vs Form Data
- **Context**: `usuarioId` (quem), `estruturaId` (navegação), `grupoAtual` (zoom)
- **Form**: `estruturaId` (escolha), `gruposIds[]` (múltiplos), `participantesIds[]`

---

### 2. Task 001 Corrigida

#### Antes (❌ Errado):
```typescript
// evento-form.component.ts
ngOnInit(): void {
  if (!this.authService.isAuthenticated()) {  // ❌ NÃO!
    this.router.navigate(['/login']);
  }
}

onSubmit(): void {
  const grupo = this.estruturaService.grupoSelecionado();  // ❌ Do contexto
  const request = {
    grupo_id: grupo.id  // ❌ Único grupo do contexto
  };
}
```

#### Depois (✅ Correto):
```typescript
// auth.guard.ts
export const authGuard = () => {
  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

// evento-form.component.ts
ngOnInit(): void {
  // Guard já validou autenticação ✅
  
  // Estrutura: pré-seleciona se tiver 1, dropdown se tiver múltiplas
  if (contexto.estruturas.length === 1) {
    this.form.patchValue({ estruturaId: contexto.estruturas[0].id });
  }
}

onSubmit(): void {
  const formData = this.form.value;
  const request = {
    usuario_id: contexto.usuarioId,      // ✅ Quem está criando
    estrutura_id: formData.estruturaId,  // ✅ Escolha do usuário
    grupos_ids: formData.gruposIds,      // ✅ Múltiplos grupos
    participantes_ids: formData.participantesIds  // ✅ OU pessoas
  };
}
```

---

### 3. Task 004 Corrigida

#### Mudanças:

**Antes**: Seleção única de grupo  
**Depois**: Seleção múltipla + opção "Todos" + opção "Pessoas específicas"

```typescript
// FormGroup
gruposIds: [[], Validators.required],          // ✅ Array (múltiplos)
participantesIds: [[]],                        // ✅ OU pessoas
escopoEvento: ['grupos']  // 'grupos' | 'todos' | 'pessoas'

// Template
<p-multiSelect
  formControlName="gruposIds"
  [options]="gruposDisponiveis()"
  display="chip"
  placeholder="Escolha um ou mais grupos"
></p-multiSelect>

// Submit
const request = {
  grupos_ids: formData.gruposIds,       // [789, 790] ✅
  participantes_ids: formData.participantesIds,
  para_todos: formData.escopoEvento === 'todos'
};
```

---

## 📋 Checklist de Validação

### Constitution
- [x] Seção VI adicionada (Separation of Concerns)
- [x] Guards vs Components documentado
- [x] Context vs Form Data documentado
- [x] Exemplos de código adicionados

### Task 001
- [x] AuthGuard criado
- [x] Validação de autenticação removida do component
- [x] Múltiplas estruturas tratadas (pré-seleciona ou dropdown)
- [x] Grupos vêm do formulário, não do contexto

### Task 004
- [x] Seleção múltipla de grupos implementada
- [x] Opção "Todos da estrutura" adicionada
- [x] Opção "Pessoas específicas" adicionada
- [x] p-multiSelect substituiu p-dropdown

---

## 🎯 Resultados

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Autenticação** | No component | No Guard ✅ |
| **Seleção de Grupos** | 1 grupo (contexto) | Múltiplos (formulário) ✅ |
| **Múltiplas Estruturas** | Não tratado | Pré-seleciona ou dropdown ✅ |
| **Pessoas Específicas** | Não tinha | Adicionado ✅ |
| **Separação de Responsabilidades** | Misturada | Bem definida ✅ |

---

## 📝 Notas para Próximas Iterações

1. **Sempre consultar constitution.md** antes de implementar
2. **Guards** para controle de acesso, nunca no component
3. **Context** é navegação, **Form** é dados
4. **Seleção múltipla** é padrão para recursos relacionais (grupos, pessoas)
5. **Auto-seleção** quando houver apenas 1 opção
