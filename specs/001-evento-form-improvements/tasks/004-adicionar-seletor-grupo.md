# Task 004: Adicionar Seletor de Grupos (Múltiplos)

**Status**: 🟢 Feature  
**Estimativa**: 1 dia  
**Prioridade**: P2  
**Depende de**: 001-corrigir-erro-400

---

## 🎯 Objetivo

Permitir escolher **para quais grupos** o evento é destinado, com **seleção múltipla** ou opção "Todos da estrutura".

**Atualmente**: Usa automaticamente o grupo do contexto (navegação)  
**Desejado**: Dropdown múltiplo ou opção "Todos"

**IMPORTANTE**: Grupo do contexto (zoom) é **apenas navegação**, não define o evento!

---

## ✅ Implementação

### [ ] 1. Atualizar FormGroup

**Arquivo**: `evento-form.component.ts`

```typescript
this.form = this.fb.group({
  // ... campos existentes

  // NOVO: Escopo + Múltiplos Grupos
  escopoEvento: ['grupos', Validators.required], // 'grupos' | 'todos' | 'pessoas'
  gruposIds: [[], Validators.required],          // Múltiplos grupos
  participantesIds: [[]]                         // OU pessoas específicas
});

// Validação condicional
this.form.get('escopoEvento')?.valueChanges.subscribe(escopo => {
  const gruposControl = this.form.get('gruposIds');
  const pessoasControl = this.form.get('participantesIds');
  
  if (escopo === 'grupos') {
    gruposControl?.setValidators([Validators.required, Validators.minLength(1)]);
    gruposControl?.enable();
    pessoasControl?.clearValidators();
    pessoasControl?.disable();
    pessoasControl?.setValue([]);
  } else if (escopo === 'pessoas') {
    pessoasControl?.setValidators([Validators.required, Validators.minLength(1)]);
    pessoasControl?.enable();
    gruposControl?.clearValidators();
    gruposControl?.disable();
    gruposControl?.setValue([]);
  } else {  // 'todos'
    gruposControl?.clearValidators();
    gruposControl?.disable();
    gruposControl?.setValue([]);
    pessoasControl?.clearValidators();
    pessoasControl?.disable();
    pessoasControl?.setValue([]);
  }
  
  gruposControl?.updateValueAndValidity();
  pessoasControl?.updateValueAndValidity();
});
```

### [ ] 2. Carregar Grupos Disponíveis

```typescript
gruposDisponiveis = signal<Grupo[]>([]);

ngOnInit(): void {
  this.carregarGruposDisponiveis();
  // ...
}

private carregarGruposDisponiveis(): void {
  const estrutura = this.estruturaService.estruturaSelecionada();
  if (!estrutura) return;

  this.grupoService.listarPorEstrutura(estrutura.id).subscribe({
    next: (grupos) => {
      this.gruposDisponiveis.set(grupos);
      
      // Pré-selecionar grupo atual
      const grupoAtual = this.estruturaService.grupoSelecionado();
      if (grupoAtual) {
        this.form.patchValue({ grupoId: grupoAtual.id });
      }
    }
  });
}
```

### [ ] 3. Atualizar Template

**Arquivo**: `evento-form.component.html`

```html
<div class="form-section">
  <h2 class="section-title">
    <i class="pi pi-users"></i>
    Para Quem?
  </h2>

  <!-- Escopo -->
  <div class="form-group">
    <label>Este evento é para:</label>
    
    <div class="radio-group">
      <label class="radio-label">
        <input type="radio" formControlName="escopoEvento" value="grupos" />
        <span class="radio-text">
          <i class="pi pi-users"></i>
          Grupos específicos (múltiplos)
        </span>
      </label>
      
      <label class="radio-label">
        <input type="radio" formControlName="escopoEvento" value="todos" />
        <span class="radio-text">
          <i class="pi pi-globe"></i>
          Todos da estrutura
        </span>
      </label>
      
      <label class="radio-label">
        <input type="radio" formControlName="escopoEvento" value="pessoas" />
        <span class="radio-text">
          <i class="pi pi-user"></i>
          Pessoas específicas
        </span>
      </label>
    </div>
  </div>

  <!-- Dropdown de Grupos (MÚLTIPLO) -->
  <div
    *ngIf="form.get('escopoEvento')?.value === 'grupos'"
    class="form-group fade-in"
  >
    <label>Selecione os Grupos <span class="required">*</span></label>
    
    <p-multiSelect
      formControlName="gruposIds"
      [options]="gruposDisponiveis()"
      optionLabel="nome"
      optionValue="id"
      placeholder="Escolha um ou mais grupos"
      [filter]="true"
      filterBy="nome"
      [showClear]="true"
      display="chip"
    >
      <ng-template let-grupo pTemplate="item">
        <div class="grupo-item">
          <span class="grupo-nome">{{ grupo.nome }}</span>
          <span class="grupo-path">{{ grupo.hierarquia }}</span>
        </div>
      </ng-template>
    </p-multiSelect>
    
    <small class="hint">
      <i class="pi pi-info-circle"></i>
  const contexto = this.contextService.contexto();
  
  let gruposIds: number[] = [];
  let participantesIds: number[] = [];
  
  if (formData.escopoEvento === 'todos') {
    // Para "todos", enviar array vazio (backend interpreta como "todos")
    gruposIds = [];
  } else if (formData.escopoEvento === 'grupos') {
    // Múltiplos grupos selecionados
    gruposIds = formData.gruposIds || [];
  } else if (formData.escopoEvento === 'pessoas') {
    // Pessoas específicas
    participantesIds = formData.participantesIds || [];
  }

  const request = {
    usuario_id: contexto.usuarioId,           // Quem está criando
    estrutura_id: formData.estruturaId,       // Para qual estrutura
    grupos_ids: gruposIds,                    // ✅ Array de grupos
    participantes_ids: participantesIds,      // ✅ OU array de pessoas
    para_todos: formData.escopoEvento === 'todos',  // ✅ Flag"participantesIds"
      [options]="pessoasDisponiveis()"
      optionLabel="nome"
      optionValue="id"
      placeholder="Escolha uma ou mais pessoas"
      [filter]="true"
      filterBy="nome,email"
      [showClear]="true"
      display="chip"
    >
      <ng-template let-pessoa pTemplate="item">
        <div class="pessoa-item">
          <span class="pessoa-nome">{{ pessoa.nome }}</span>
          <span class="pessoa-email">{{ pessoa.email }}</span>
        </div>
      </ng-template>
    </p-multiSelect>
  </div>

  <!-- Info quando Todos -->
  <div
    *ngIf="form.get('escopoEvento')?.value === 'todos'"
    class="alert alert-info fade-in"
  >
    <i class="pi pi-info-circle"></i>
    Este evento será visível para toda a estrutura.
  </div>
</div>
```

### [ ] 4. Atualizar Lógica de Submit

```typescript
onSubmit(): void {
  // ... código existente

  const formData = this.form.value;
  
  let grupoId: number;
  
  if (formData.escopoEvento === 'todos') {
    const estrutura = this.estruturaService.estruturaSelecionada();
    grupoId = estrutura?.grupoRaizId || 0;
  } else {
    grupoId = formData.grupoId;
  }

  const request = {
    // ...
    grupo_id: grupoId,
    // ...
  };

  // ...
}
```

---

## 🧪 Testes de Aceitação

### ✅ Cenário 1: Selecionar Grupo Específico
```
DADO que seleciono "Um grupo específico"
ENTÃO deve mostrar dropdown de grupos
E posso filtrar por nome
```

### ✅ Cenário 2: Criar Evento para Todos
```
DADO que seleciono "Todos da estrutura"
ENTÃO dropdown deve sumir
E evento é vinculado ao grupo raiz
```

---

## ✅ Critérios de Conclusão

- [ ] Radio buttons funcionando
- [ ] Dropdown com filtro
- [ ] Validação condicional
- [ ] Evento para "Todos" usa grupoRaizId
- [ ] Todos os cenários passam
