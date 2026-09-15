# Análise UX/UI - Formulário de Eventos
## Data: 16 de Fevereiro de 2026

---

## 🔍 PROBLEMAS IDENTIFICADOS

### 1. **Conceitual - Confusão entre "Criar Modelo" vs "Criar Evento"**

**Problema Atual:**
- Formulário "Criar Evento" mistura conceitos de **Template** e **Evento Específico**
- "Escolher Template" + "Nome Genérico" + "Nome Personalizado" confunde o usuário
- Não está claro se estou criando um modelo OU um evento específico

**Causa Raiz:**
O sistema tem 3 conceitos distintos que estão sendo misturados:
1. **Modelo de Evento** (Template) - Ex: "Célula" com regras padrão
2. **Evento Configurado** - Ex: "Célula de Crescimento" baseado no modelo
3. **Instância/Ocorrência** - Ex: Executar "Célula de Crescimento" dia 20/02 às 19h

**Solução Proposta:**
Separar claramente em 3 telas/fluxos:
- **Modelos de Evento** → Apenas admin cria (templates fixos)
- **Configurar Evento** → Criar evento baseado em modelo com permissões específicas
- **Iniciar Evento** → Executar evento configurado (marcar presença)

---

### 2. **UI - Problemas Visuais Críticos**

#### 2.1 Textos com Unicode Escapado
**Problema:** Labels aparecem como `T\u00edtulo` ao invés de `Título`
**Localização:** Múltiplos campos (Título, Descrição, etc)
**Causa:** Encoding incorreto no HTML (caracteres especiais não renderizados)
**Fix:** Remover escape sequences do HTML, usar UTF-8 nativo

#### 2.2 Placeholder do Textarea em Preto
**Problema:** Placeholder da descrição não tem cor cinza (muito escuro)
**Localização:** Campo "Descrição" (textarea)
**Fix:** Adicionar classe `placeholder:text-gray-400`

#### 2.3 Horário de Término Não Calcula
**Problema:** Campo "Horário de Término" mostra `--:--` mesmo com duração preenchida
**Localização:** Seção "QUANDO ACONTECE?"
**Causa Provável:** Signal `calcularHorarioFim()` não está reagindo corretamente
**Fix:** Revisar listeners de `valueChanges` para duracaoHoras/Minutos

#### 2.4 Switches com Ponto Preto (Feios)
**Problema:** Componente `p-inputSwitch` está renderizando com estilo incorreto
**Localização:** Seção "CONFIGURAÇÕES AVANÇADAS" (Permite Convidados, etc)
**Screenshot:** Switches aparecem com ponto preto ao invés do estilo PrimeNG padrão
**Fix:** 
- Verificar se PrimeNG theme está carregado corretamente
- Adicionar custom CSS para override se necessário

#### 2.5 Dropdown Grupos Específicos "Estranho"
**Problema:** MultiSelect não está estilizado corretamente
**Observação:** Funciona mas visualmente inconsistente
**Fix:** Revisar classes CSS do `p-multiSelect`

#### 2.6 Cards "Comidos" / Overflow
**Problema:** Fieldsets/Cards parecem cortados (baseado no print do usuário)
**Causa Provável:** Padding/margin inconsistente ou width overflow
**Fix:** Revisar grid system e container widths

---

### 3. **Funcionalidades Faltando - Permissões Granulares**

**Problema:** Configurações Avançadas não tem todas as permissões necessárias

**Campos Faltando:**
- ❌ Permite Adicionar Participante
- ❌ Permite Remover Participante  
- ❌ Permite Adicionar Responsável
- ❌ Permite Editar Local (após criação)
- ❌ Permite Editar Data (após criação)
- ❌ Permite Editar Horário (após criação)
- ❌ **NÃO** deve permitir editar Tipo de Recorrência (travado sempre)

**Apenas Existe Atualmente:**
- ✅ Permite Convidados
- ✅ Convidados Podem Convidar
- ✅ Exige Confirmação de Presença
- ✅ Limite de Participantes

---

## 🎯 FLUXO REDESENHADO (UX Proposta)

### **Novo Mental Model:**

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN                                                      │
│  ┌─────────────────────────────────────┐                   │
│  │  1. MODELOS DE EVENTO               │                   │
│  │  (Event Templates)                  │                   │
│  │                                     │                   │
│  │  Ex: "Célula", "Culto", "Reunião"   │                   │
│  │  - Nome do Modelo                   │                   │
│  │  - Recorrência Padrão               │                   │
│  │  - Duração Padrão                   │                   │
│  │  - Permissões (o que pode editar)   │                   │
│  └─────────────────────────────────────┘                   │
│                      ↓                                      │
└──────────────────────┼──────────────────────────────────────┘
                       ↓
┌──────────────────────┼──────────────────────────────────────┐
│  LÍDER / RESPONSÁVEL │                                      │
│  ┌─────────────────────────────────────┐                   │
│  │  2. CONFIGURAR EVENTO               │                   │
│  │  (Baseado em Modelo)                │                   │
│  │                                     │                   │
│  │  - Escolher Modelo: "Célula"        │                   │
│  │  - Dar Apelido: "Simplesmente..."   │                   │
│  │  - Definir Grupos                   │                   │
│  │  - Configurar Detalhes (se permite) │                   │
│  │  - Adicionar Responsáveis           │                   │
│  └─────────────────────────────────────┘                   │
│                      ↓                                      │
└──────────────────────┼──────────────────────────────────────┘
                       ↓
┌──────────────────────┼──────────────────────────────────────┐
│  QUALQUER RESPONSÁVEL│                                      │
│  ┌─────────────────────────────────────┐                   │
│  │  3. INICIAR EVENTO                  │                   │
│  │  (Executar Ocorrência)              │                   │
│  │                                     │                   │
│  │  - Selecionar Evento Configurado    │                   │
│  │  - Confirmar Data/Hora (ou ajustar) │                   │
│  │  - Marcar Presença dos Participantes│                   │
│  │  - Finalizar com Relatório          │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 NOVA ESTRUTURA DE TELAS

### **Tela 1: Modelos de Evento** (Admin Only)
**URL:** `/admin/eventos/modelos`

**Campos:**
- Nome do Modelo (Ex: "Célula", "Culto")
- Ícone/Cor (visual identification)
- Tipo de Recorrência (ÚNICO, DIÁRIO, SEMANAL, MENSAL, ANUAL)
- Duração Padrão (horas/minutos)
- Horário Padrão (opcional)
- Local Padrão (opcional)

**Permissões do Modelo:**
- [ ] Permite Renomear
- [ ] Permite Editar Local
- [ ] Permite Editar Dia
- [ ] Permite Editar Horário
- [ ] Permite Adicionar Participantes
- [ ] Permite Remover Participantes
- [ ] Permite Adicionar Responsáveis
- [ ] Permite Remover Responsáveis

**IMPORTANTE:** 
- Tipo de Recorrência é **SEMPRE TRAVADO** após criar modelo
- Campo "Recorrência Travada" = sempre `true`

---

### **Tela 2: Configurar Evento** (Substitui "Criar Evento")
**URL:** `/admin/eventos/configurar`

**Seção: ESCOLHER MODELO**
```
┌─────────────────────────────────────────────┐
│  Modelo de Evento *                         │
│  [Dropdown: Célula, Culto, Reunião...]     │
│  ℹ️ Escolha o tipo de evento               │
└─────────────────────────────────────────────┘
```

**Seção: IDENTIFICAÇÃO**
```
┌─────────────────────────────────────────────┐
│  Nome do Evento                             │
│  [ Célula de Crescimento ]                  │
│  (Baseado no modelo "Célula")               │
│                                             │
│  Apelido / Título Personalizado (opcional)  │
│  [ Simplesmente Sobrenatural ]              │
│  💡 Nome amigável para identificação        │
└─────────────────────────────────────────────┘
```

**Seção: PARA QUEM?**
(Mantém estrutura atual - está OK)

**Seção: DETALHES** (Condicional - conforme permissões do modelo)
```
┌─────────────────────────────────────────────┐
│  📅 Data de Início *                        │
│  [20/02/2026] 🗓️                            │
│                                             │
│  🕐 Horário de Início *                     │
│  [19:00]                                    │
│  (Padrão do modelo, editável se permitido)  │
│                                             │
│  ⏱️ Duração                                  │
│  [2] horas  [0] minutos                     │
│  Horário de Término: 21:00                  │
│                                             │
│  📍 Local / Endereço                        │
│  [Casa do João - Rua das Flores, 123]       │
│  (Editável se modelo permitir)              │
└─────────────────────────────────────────────┘
```

**Seção: RECORRÊNCIA** (Baseado no modelo - NÃO editável)
```
┌─────────────────────────────────────────────┐
│  🔁 Tipo: SEMANAL                           │
│  🔒 (Definido pelo modelo, não pode mudar)  │
│                                             │
│  Dias da Semana: [Qui]                      │
│  Repetir Até: [31/12/2026] 🗓️               │
│                                             │
│  📋 Próximas 5 Ocorrências:                 │
│  • 20/02/2026 às 19:00                      │
│  • 27/02/2026 às 19:00                      │
│  • 06/03/2026 às 19:00                      │
│  • 13/03/2026 às 19:00                      │
│  • 20/03/2026 às 19:00                      │
└─────────────────────────────────────────────┘
```

**Seção: PERMISSÕES E RESPONSÁVEIS**
```
┌─────────────────────────────────────────────┐
│  👥 Responsáveis do Evento *                │
│  [MultiSelect: João Silva, Maria Santos]    │
│                                             │
│  Permissões dos Responsáveis:               │
│  ✅ Podem adicionar participantes           │
│  ✅ Podem remover participantes             │
│  ❌ Podem adicionar outros responsáveis     │
│  ❌ Podem editar local                      │
│  ❌ Podem editar horário                    │
│  (Baseado nas permissões do modelo)         │
└─────────────────────────────────────────────┘
```

**Botões:**
```
[Cancelar]  [Salvar Rascunho]  [Configurar e Ativar]
```

---

### **Tela 3: Iniciar Evento** (Execução de Ocorrência)
**URL:** `/admin/eventos/iniciar`

**Objetivo:** Marcar presença de uma ocorrência específica do evento configurado

**Fluxo:**
1. Selecionar Evento Configurado (dropdown com eventos ativos)
2. Confirmar Data/Hora da ocorrência (ou próxima ocorrência automática)
3. Lista de Participantes com checkboxes (Presente/Ausente/Justificado)
4. Adicionar Participantes "de última hora" (se permitido)
5. Observações da ocorrência
6. Finalizar com Relatório

**Seção: ESCOLHER EVENTO**
```
┌─────────────────────────────────────────────┐
│  Evento a Iniciar *                         │
│  [Dropdown: Célula Simplesmente...]         │
│                                             │
│  Próxima Ocorrência:                        │
│  📅 20/02/2026 às 19:00                     │
│  📍 Casa do João - Rua das Flores, 123      │
│                                             │
│  [ ] Usar outra data/hora (se permitido)    │
└─────────────────────────────────────────────┘
```

**Seção: PRESENÇA**
```
┌─────────────────────────────────────────────┐
│  👥 Participantes Esperados (15)            │
│                                             │
│  [✅] João Silva                            │
│  [✅] Maria Santos                          │
│  [❌] Pedro Oliveira                        │
│  [⚠️] Ana Costa (Justificou ausência)       │
│  ...                                        │
│                                             │
│  [+ Adicionar Visitante]                    │
└─────────────────────────────────────────────┘
```

**Seção: OBSERVAÇÕES**
```
┌─────────────────────────────────────────────┐
│  📝 Observações desta Ocorrência            │
│  [Textarea: O que aconteceu hoje...]        │
│                                             │
│  📊 Resumo:                                 │
│  • Presentes: 12                            │
│  • Ausentes: 2                              │
│  • Justificados: 1                          │
│  • Taxa de Presença: 80%                    │
└─────────────────────────────────────────────┘
```

**Botões:**
```
[Cancelar]  [Salvar Rascunho]  [Finalizar Evento]
```

---

## 🔧 CORREÇÕES TÉCNICAS NECESSÁRIAS

### 1. **Corrigir Unicode Escapado**
**Arquivos:** `evento-form.component.html`
**Mudança:** 
```diff
- T\u00edtulo Completo
+ Título Completo

- Descri\u00e7\u00e3o
+ Descrição

- Nome Gen\u00e9rico
+ Nome Genérico
```

### 2. **Corrigir Placeholder Textarea**
```diff
<textarea 
  pInputTextarea
  formControlName="descricao"
- class="w-full">
+ class="w-full placeholder:text-gray-400">
```

### 3. **Corrigir Horário de Término**
**Arquivo:** `evento-form.component.ts`
**Verificar:** Listeners de `duracaoHoras` e `duracaoMinutos` estão atualizando o computed signal corretamente

### 4. **Corrigir Switches (PrimeNG)**
**Arquivo:** `styles.scss` ou component-level CSS
**Adicionar:**
```scss
p-inputSwitch {
  .p-inputswitch {
    // Garantir que theme PrimeNG seja aplicado
    @apply inline-block;
  }
  
  .p-inputswitch-slider {
    // Remover ponto preto
    background: var(--surface-300);
  }
  
  .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
    background: var(--primary-color);
  }
}
```

### 5. **Adicionar Permissões Faltando**
**Arquivo:** `evento-form.component.html`
**Adicionar em CONFIGURAÇÕES AVANÇADAS:**
```html
<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteAdicionarParticipantes"></p-inputSwitch>
    <span>Permite Adicionar Participantes</span>
  </label>
</div>

<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteRemoverParticipantes"></p-inputSwitch>
    <span>Permite Remover Participantes</span>
  </label>
</div>

<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteAdicionarResponsaveis"></p-inputSwitch>
    <span>Permite Adicionar Responsáveis</span>
  </label>
</div>

<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteEditarLocal"></p-inputSwitch>
    <span>Permite Editar Local</span>
  </label>
</div>

<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteEditarData"></p-inputSwitch>
    <span>Permite Editar Data</span>
  </label>
</div>

<div class="field col-12 md:col-6">
  <label class="flex items-center gap-2">
    <p-inputSwitch formControlName="permiteEditarHorario"></p-inputSwitch>
    <span>Permite Editar Horário</span>
  </label>
</div>
```

### 6. **Corrigir Fieldsets Overflow**
**Verificar:** Container principal tem `max-width` ou padding correto
```scss
.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

p-fieldset {
  margin-bottom: 1.5rem;
  
  ::ng-deep .p-fieldset-content {
    padding: 1.5rem;
  }
}
```

---

## 📊 RESUMO EXECUTIVO

### **Problemas Críticos (Bloqueadores):**
1. ❌ Confusão conceitual Template vs Evento vs Ocorrência
2. ❌ Unicode escapado (textos corrompidos)
3. ❌ Horário de término não calcula

### **Problemas de UX (Alta Prioridade):**
1. ⚠️ Falta separação clara: Modelo → Configurar → Iniciar
2. ⚠️ Faltam permissões granulares (6 campos)
3. ⚠️ Switches com estilo incorreto

### **Problemas Visuais (Média Prioridade):**
1. 🎨 Placeholder textarea preto
2. 🎨 Dropdown grupos "estranho"
3. 🎨 Cards overflow

---

## ✅ RECOMENDAÇÃO FINAL

### **Abordagem Recomendada:**

1. **CURTO PRAZO (Correções Rápidas):**
   - Corrigir unicode escapado
   - Corrigir horário de término
   - Corrigir switches
   - Adicionar placeholder correto no textarea

2. **MÉDIO PRAZO (Refatoração UX):**
   - Separar tela "Criar Evento" em "Configurar Evento"
   - Remover campos confusos (Nome Genérico, Nome Personalizado)
   - Implementar fluxo claro: Template → Apelido
   - Adicionar todas as permissões faltando

3. **LONGO PRAZO (Nova Feature):**
   - Criar tela "Iniciar Evento" completa
   - Implementar marcar presença
   - Relatórios de ocorrências

### **Mental Model Correto:**
```
MODELO (Admin cria) 
  → EVENTO CONFIGURADO (Líder customiza com apelido)
    → OCORRÊNCIA (Qualquer responsável executa)
```

Essa separação clara evita toda a confusão atual e torna o sistema intuitivo.
