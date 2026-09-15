# Task 002: Corrigir Preview de Próximas Ocorrências

**Status**: 🔴 Bug  
**Estimativa**: 0.5 dia  
**Prioridade**: P0  
**Depende de**: 001-corrigir-erro-400

---

## 🐛 Problema

O preview de próximas ocorrências **NÃO respeita** o limite definido pelo usuário:

```typescript
// evento-form.component.ts - Linha 155 (BUGADO)
const maxOcorrencias = Math.min(5, this.form.get('maxOcorrencias')?.value || 5);
// ☝️ Sempre retorna 5! Mesmo se usuário definiu 3 ou 10
```

**Reprodução:**
1. Criar evento com recorrência semanal
2. Definir "Máximo de Ocorrências: 3"
3. Preview mostra 5 ocorrências (ERRADO!)

---

## ✅ Solução

### [ ] 1. Corrigir Lógica no `atualizarProximasOcorrencias()`

**Arquivo**: `evento-form.component.ts`

```typescript
private atualizarProximasOcorrencias(): void {
  const tipo = this.form.get('tipoRecorrencia')?.value;
  if (tipo === 'nenhuma') {
    this.proximasOcorrencias.set([]);
    return;
  }

  // CORREÇÃO AQUI:
  const maxDefinido = this.form.get('maxOcorrencias')?.value;
  let maxParaPreview: number;

  if (maxDefinido && maxDefinido > 0) {
    // Mostrar no máximo 10 no preview, mas respeitar o limite
    maxParaPreview = Math.min(maxDefinido, 10);
  } else {
    // Se não definiu limite, mostrar 5 como preview
    maxParaPreview = 5;
  }

  const ocorrencias: ProximaOcorrencia[] = [];
  const inicioEm = this.form.get('inicioEm')?.value;

  for (let i = 0; i < maxParaPreview; i++) {
    let data = new Date(inicioEm);

    switch (tipo) {
      case 'diaria':
        data.setDate(data.getDate() + i);
        break;
      case 'semanal':
        data.setDate(data.getDate() + i * 7);
        break;
      case 'mensal':
        data.setMonth(data.getMonth() + i);
        break;
      case 'anual':
        data.setFullYear(data.getFullYear() + i);
        break;
    }

    ocorrencias.push({ data });
  }

  this.proximasOcorrencias.set(ocorrencias);
}
```

### [ ] 2. Atualizar Template com Indicação de Total

**Arquivo**: `evento-form.component.html`

```html
<div *ngIf="proximasOcorrencias().length > 0" class="preview-ocorrencias">
  <h4>
    👁️ Próximas {{ proximasOcorrencias().length }} ocorrências:
    <span *ngIf="maxMostradoMenorQueTotal()" class="badge">
      (Total: {{ getTotalOcorrencias() }})
    </span>
  </h4>
  
  <ul>
    <li *ngFor="let ocorrencia of proximasOcorrencias(); let i = index">
      <span class="numero">{{ i + 1 }}.</span>
      <span class="data">{{ ocorrencia.data | date:'dd/MM/yyyy HH:mm' }}</span>
    </li>
  </ul>
  
  <p *ngIf="maxMostradoMenorQueTotal()" class="info">
    ... e mais {{ getTotalOcorrencias() - proximasOcorrencias().length }} ocorrências
  </p>
</div>
```

### [ ] 3. Adicionar Helpers no Component

```typescript
maxMostradoMenorQueTotal(): boolean {
  const total = this.form.get('maxOcorrencias')?.value;
  return total && total > this.proximasOcorrencias().length;
}

getTotalOcorrencias(): number {
  return this.form.get('maxOcorrencias')?.value || 0;
}
```

---

## 🧪 Testes de Aceitação

### ✅ Cenário 1: Limite de 3 Ocorrências
```
DADO que configuro:
  - Repetir: Semanal
  - Max Ocorrências: 3
QUANDO o preview é gerado
ENTÃO deve mostrar EXATAMENTE 3 ocorrências
```

### ✅ Cenário 2: Limite de 50 Ocorrências
```
DADO que configuro:
  - Repetir: Mensal
  - Max Ocorrências: 50
QUANDO o preview é gerado
ENTÃO deve mostrar 10 primeiras
E deve indicar "... e mais 40 ocorrências"
```

### ✅ Cenário 3: Sem Limite
```
DADO que configuro:
  - Repetir: Semanal
  - Max Ocorrências: vazio
QUANDO o preview é gerado
ENTÃO deve mostrar 5 ocorrências
```

---

## ✅ Critérios de Conclusão

- [ ] Preview respeita exatamente o limite definido
- [ ] Se limite > 10, mostra 10 + indicação
- [ ] Se sem limite, mostra 5
- [ ] Todos os 3 cenários passam
