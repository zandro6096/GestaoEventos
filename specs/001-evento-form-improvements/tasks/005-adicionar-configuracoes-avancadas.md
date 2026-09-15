# Task 005: Adicionar Configurações Avançadas de Permissões

**Status**: 🟢 Feature  
**Estimativa**: 1 dia  
**Prioridade**: P3  
**Depende de**: 001-corrigir-erro-400

---

## 🎯 Objetivo

Expor configurações de permissões que o backend já suporta mas o frontend não mostra.

**Backend aceita** (segundo `Create.CreateRequest.cs`):
- PermitirConfigurarDia
- PermitirConfigurarHora
- PermitirConfigurarLocal
- PermitirRenomear
- PermitirAddResponsaveis
- PermitirRemoverResponsaveis
- PermitirAddParticipantes
- PermitirRemoverParticipantes
- RequerJustificativaRemocao

---

## ✅ Implementação

### [ ] 1. Atualizar FormGroup

**Arquivo**: `evento-form.component.ts`

```typescript
this.form = this.fb.group({
  // ... campos existentes

  // NOVO: Permissões
  permissoes: this.fb.group({
    permitirConfigurarDia: [false],
    permitirConfigurarHora: [false],
    permitirConfigurarLocal: [false],
    permitirRenomear: [false],
    permitirAddResponsaveis: [false],
    permitirRemoverResponsaveis: [false],
    permitirAddParticipantes: [false],
    permitirRemoverParticipantes: [false],
    requerJustificativaRemocao: [false]
  })
});
```

### [ ] 2. Adicionar State para Colapsável

```typescript
mostrarConfigAvancadas = signal(false);

toggleConfigAvancadas(): void {
  this.mostrarConfigAvancadas.update(v => !v);
}
```

### [ ] 3. Lógica Condicional (Justificativa depende de Remover)

```typescript
ngOnInit(): void {
  // ...
  
  this.form.get('permissoes.permitirRemoverParticipantes')?.valueChanges
    .subscribe(podeRemover => {
      const justificativaControl = this.form.get('permissoes.requerJustificativaRemocao');
      
      if (!podeRemover) {
        justificativaControl?.setValue(false);
        justificativaControl?.disable();
      } else {
        justificativaControl?.enable();
      }
    });
}
```

### [ ] 4. Atualizar Template

**Arquivo**: `evento-form.component.html`

```html
<div class="form-section config-avancadas">
  <h2 class="section-title collapsible" (click)="toggleConfigAvancadas()">
    <i class="pi pi-cog"></i>
    Configurações Avançadas
    <i [class]="mostrarConfigAvancadas() ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
  </h2>

  <div *ngIf="mostrarConfigAvancadas()" class="config-content fade-in" formGroupName="permissoes">
    <p class="config-description">
      Configure o que níveis hierárquicos <strong>abaixo</strong> podem personalizar.
    </p>

    <div class="permissoes-grid">
      <label class="checkbox-label">
        <p-checkbox formControlName="permitirConfigurarDia" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Alterar dia da semana</strong>
          <small>Permite mudar quando o evento acontece</small>
        </span>
      </label>

      <label class="checkbox-label">
        <p-checkbox formControlName="permitirConfigurarHora" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Alterar horário</strong>
          <small>Permite ajustar hora de início</small>
        </span>
      </label>

      <label class="checkbox-label">
        <p-checkbox formControlName="permitirConfigurarLocal" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Alterar local</strong>
          <small>Permite mudar onde acontece</small>
        </span>
      </label>

      <label class="checkbox-label">
        <p-checkbox formControlName="permitirRenomear" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Renomear evento</strong>
          <small>Permite mudar o título</small>
        </span>
      </label>

      <label class="checkbox-label">
        <p-checkbox formControlName="permitirAddParticipantes" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Adicionar participantes</strong>
          <small>Permite incluir novos participantes</small>
        </span>
      </label>

      <label class="checkbox-label">
        <p-checkbox formControlName="permitirRemoverParticipantes" binary="true"></p-checkbox>
        <span class="checkbox-text">
          <strong>Remover participantes</strong>
          <small>Permite excluir participantes</small>
        </span>
      </label>

      <label 
        class="checkbox-label"
        [class.disabled]="!form.get('permissoes.permitirRemoverParticipantes')?.value"
      >
        <p-checkbox
          formControlName="requerJustificativaRemocao"
          binary="true"
          [disabled]="!form.get('permissoes.permitirRemoverParticipantes')?.value"
        ></p-checkbox>
        <span class="checkbox-text">
          <strong>Requer justificativa ao remover</strong>
          <small>Obriga informar motivo</small>
        </span>
      </label>
    </div>

    <div class="alert alert-info">
      <i class="pi pi-lightbulb"></i>
      <strong>Dica:</strong> Marque apenas as permissões necessárias.
    </div>
  </div>
</div>
```

### [ ] 5. Atualizar Submit

```typescript
onSubmit(): void {
  // ... código existente

  const permissoes = formData.permissoes;

  const request = {
    // ... campos existentes
    
    // ADICIONAR PERMISSÕES
    permitir_configurar_dia: permissoes.permitirConfigurarDia,
    permitir_configurar_hora: permissoes.permitirConfigurarHora,
    permitir_configurar_local: permissoes.permitirConfigurarLocal,
    permitir_renomear: permissoes.permitirRenomear,
    permitir_add_responsaveis: permissoes.permitirAddResponsaveis,
    permitir_remover_responsaveis: permissoes.permitirRemoverResponsaveis,
    permitir_add_participantes: permissoes.permitirAddParticipantes,
    permitir_remover_participantes: permissoes.permitirRemoverParticipantes,
    requer_justificativa_remocao: permissoes.requerJustificativaRemocao
  };

  // ...
}
```

### [ ] 6. Adicionar CSS

```scss
.config-avancadas {
  .section-title.collapsible {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    padding: 16px;
    background: var(--surface-50);
    border-radius: 8px;

    &:hover {
      background: var(--surface-100);
    }
  }

  .permissoes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .checkbox-label {
    display: flex;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    cursor: pointer;

    &:hover:not(.disabled) {
      background: var(--surface-hover);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .checkbox-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }
}
```

---

## 🧪 Testes de Aceitação

### ✅ Cenário 1: Expandir/Colapsar
```
QUANDO clico em "⚙️ Configurações Avançadas"
ENTÃO seção deve expandir
E mostrar 9 checkboxes
```

### ✅ Cenário 2: Marcar Permissões
```
QUANDO marco:
  ☑ Permitir alterar horário
  ☑ Permitir alterar local
E crio o evento
ENTÃO request contém:
  permitir_configurar_hora: true
  permitir_configurar_local: true
```

### ✅ Cenário 3: Justificativa Condicional
```
DADO que "Remover participantes" está desmarcado
ENTÃO "Requer justificativa" deve estar desabilitado
```

---

## ✅ Critérios de Conclusão

- [ ] Seção colapsável funcionando
- [ ] 9 checkboxes visíveis
- [ ] Justificativa habilitada condicionalmente
- [ ] Permissões enviadas corretamente
- [ ] Padrão é false
- [ ] Todos os cenários passam
