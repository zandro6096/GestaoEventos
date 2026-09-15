# GestaoEventos - Business Description

**Version**: 2.0.0 | **Created**: 2026-02-15 | **Last Updated**: 2026-03-22

---

## O que é o GestaoEventos?

**GestaoEventos** é um **SaaS (Software as a Service)** avançado de gestão de eventos com hierarquia dinâmica e permissões granulares. O sistema permite que organizações de qualquer tipo (igrejas, empresas, comunidades, escolas) gerenciem eventos, participantes, métricas e estruturas hierárquicas de forma **totalmente customizável** e **agnóstica**.

---

## Diferencial Competitivo

### 1. Estrutura 100% Agnóstica e Customizável
- **Não é específico para nenhum tipo de organização**
- Pode ser igreja (Pastor → Obreiro → Discipulador → Líder → Membro)
- Pode ser empresa (CEO → Gerente → Supervisor → Coordenador → Colaborador)
- Pode ser comunidade, escola, ONGs, etc.
- **Todos os papéis e níveis hierárquicos são dinâmicos**

### 2. Sistema de "Zoom" Visual Hierárquico
- **Quem está no topo vê tudo** (visão completa da estrutura)
- **Quem está abaixo vê apenas sua área** (escopo limitado ao seu nível)
- Navegação hierárquica com drill-down
- Métricas agregadas por nível (zoom in/out)

### 3. Multi-Estrutura por Usuário
- O mesmo usuário pode estar em **múltiplas estruturas**
- Exemplo: Líder em uma igreja E empresário com sua empresa
- Contexto ativo define o que ele vê

### 4. Templates de Eventos com Permissões Granulares
- Owner cria templates com **permissões customizáveis por campo**
- Pode travar campos (ex: recorrência semanal obrigatória)
- Pode liberar campos (ex: horário e local flexíveis)
- Garante **métricas consistentes** sem perder flexibilidade

#### Campos do Template e Controle de Travamento

| Campo | Pode travar? | Padrão quando travado |
|-------|-------------|----------------------|
| Nome genérico do evento | ✅ Sim | Nome definido pelo criador do template |
| Subtítulo/apelido personalizado | ✅ Sim | Não permite personalização |
| Recorrência (frequência) | ✅ Sim | Frequência definida no template |
| Dia(s) da semana | ✅ Sim | Dia(s) definidos no template |
| Horário de início | ✅ Sim | Horário definido no template |
| Duração estimada | ✅ Sim | Duração definida |
| Local | ✅ Sim | Local definido no template |
| Aceita convidados externos | ✅ Sim | Valor definido no template |
| Pode cancelar (flag) | ✅ Sim | `false` por padrão |
| Exigir justificativa de cancelamento | ✅ Sim | `false` por padrão |
| Pode adicionar participantes manualmente | ✅ Sim | Valor definido no template |
| Pode adicionar responsáveis auxiliares | ✅ Sim | Valor definido no template |
| Grupos incluídos automaticamente | ✅ Sim | Grupos selecionados pelo criador |

### 5. Sistema Freemium Escalável
- Começa com plano **FREE** (com limitações)
- Planos pagos mensais (BÁSICO, PRO, ENTERPRISE)
- Integração com **Stripe** para contratação e assinatura recorrente
- Validação de limites em tempo real

---

## Exemplo de Caso de Uso Real: Igreja

### Contexto
**Pastor Sandro** cria sua estrutura "Igreja Batista Central" com a seguinte hierarquia:

```
Pastor (Nível 1 - Topo)
  └─ Obreiros (Nível 2)
     └─ Discipuladores (Nível 3)
        └─ Líderes de Célula (Nível 4)
           └─ Membros (Nível 5 - Base)
```

### Passo 1: Pastor Cria Template de Evento "Célula"

O Pastor quer que **todos os líderes tenham células semanais obrigatórias** para métricas consistentes, mas com flexibilidade de personalização.

**Configuração do Template:**
- **Nome Genérico**: "Célula" (travado - não pode ser alterado)
- **Recorrência**: SEMANAL (travada - obrigatório para métricas)
- **Permissões liberadas**:
  - ✅ `pode_customizar_nome`: true (líder pode personalizar com apelido)
  - ✅ `pode_customizar_local`: true (líder escolhe onde será)
  - ✅ `pode_customizar_horario`: true (líder escolhe dia/hora)
  - ✅ `pode_adicionar_participantes`: true (líder pode convidar pessoas)
  - ✅ `pode_adicionar_responsaveis`: true (líder pode ter auxiliares)
- **Níveis permitidos**: Nível 4 (Líderes de Célula)

**Resultado**: Template criado e disponível para todos os líderes.

---

### Passo 2: Discipulador Designa Responsável pela Célula

**Discipulador Carlos** tem 5 líderes sob sua responsabilidade. Ele cria um evento baseado no template "Célula" e designa **Líder Maria** como responsável.

**Maria recebe notificação**:
- "Você foi designado(a) como responsável pela Célula"
- Pode personalizar: nome, horário, local (conforme permissões)

---

### Passo 3: Líder Personaliza a Célula

**Líder Maria** acessa o evento e personaliza:

- **Nome Personalizado**: "Simplesmente Sobrenatural" (apelido criativo)
- **Nome Completo exibido**: "Célula: Simplesmente Sobrenatural" (rastreabilidade)
- **Dia**: Sexta-feira
- **Horário**: 20h00
- **Duração**: 2 horas
- **Local**: "Rua das Flores, 123 - Apto 501"
- **Recorrência**: SEMANAL (não pode alterar - travado pelo template)

**Participantes iniciais**:
- Membros do seu grupo (automaticamente incluídos)
- Pode adicionar convidados específicos

Maria salva e o evento fica com status **CONFIGURADO** (pronto para iniciar).

---

### Passo 4: Chegou o Dia da Célula - Líder Inicia Evento

**Sexta-feira 20h** - Maria acessa o app:

1. Vê seu evento "Célula: Simplesmente Sobrenatural"
2. Clica em **"Iniciar Evento"** (novo botão disponível)
3. Status muda para **INICIADO**
4. Novas ações disponíveis:
   - Adicionar participantes (trouxe convidado de última hora)
   - Adicionar responsável auxiliar (marido dela vai ajudar)
   - Registrar presenças
   - Ver check-ins em tempo real

**Gerenciamento de Participantes**:
- Membro João trouxe amigo Paulo (não cadastrado)
- Maria adiciona Paulo como **convidado externo**
- Paulo recebe convite por e-mail: "Deseja participar da Célula: Simplesmente Sobrenatural?"
- Paulo clica "Aceitar" e já pode fazer check-in

**Registro de Presenças**:
- João: PRESENTE ✅
- Ana: PRESENTE ✅
- Carlos: AUSENTE ❌
- Pedro: JUSTIFICADO ⚠️ (avisou que não poderia ir)
- Paulo (convidado): PRESENTE ✅

Ao final, Maria clica **"Finalizar Evento"**.

**Resultado**: Participações registradas, métricas geradas automaticamente.

---

### Passo 5: Membros Também Podem Interagir

**Membro João** recebe notificação da célula:

- Se já está no grupo, vê automaticamente o evento
- Pode confirmar presença antecipadamente (se configurado)
- Pode fazer **auto check-in** no dia (GPS opcional)
- Pode ver detalhes: local, horário, quem vai

**Convidado Paulo**:
- Recebeu convite por e-mail
- Clicou "Deseja participar?"
- Se aceitar, entra na célula e pode:
  - Ver quando será
  - Fazer check-in
  - Confirmar presença

**Se Paulo gostar, ele pode criar sua própria estrutura** (multi-estrutura).

---

### Passo 6: Discipulador Vê Saúde das Células (Zoom)

**Discipulador Carlos** tem 5 líderes. Ele acessa o dashboard e vê:

**Visão Geral:**
- Líder Maria: 85% presença ✅ (12 participantes)
- Líder Pedro: 75% presença ✅ (8 participantes)
- Líder João: 60% presença ⚠️ (5 participantes - declínio)
- Líder Ana: 90% presença ✅ (15 participantes)
- Líder Lucas: 50% presença ❌ (3 participantes - alerta crítico)

**Carlos clica em "Líder Lucas" (zoom)** para ver detalhes:
- Últimas 4 semanas: 3, 3, 2, 3 participantes
- Tendência de estagnação
- Sugestão: "Conversar com Líder Lucas - baixa participação"

**Ação de Carlos**:
- Agenda reunião com Lucas
- Oferece mentoria e suporte
- Propõe união temporária com célula de outro líder

---

### Passo 7: Obreiro Vê Todas as Redes (Zoom Hierárquico)

**Obreiro Dexter** supervisiona 10 discipuladores. Ele vê:

**Estrutura Hierárquica (Redes = Grupos Pai):**

```
Rede do Obreiro Dexter (Grupo Pai)
├─ Discipulador Carlos (5 líderes, 38 membros)
│  ├─ Rede Nação Santa (Grupo filho)
│  │  ├─ Líder Maria (12 membros)
│  │  ├─ Líder Pedro (8 membros)
│  │  └─ Líder João (5 membros)
│  └─ Rede Jerusalém (Grupo filho)
│     ├─ Líder Ana (15 membros)
│     └─ Líder Lucas (3 membros)
├─ Discipulador Ana (3 líderes, 25 membros)
├─ Discipulador João (7 líderes, 45 membros)
└─ ... (mais 7 discipuladores)
```

**Métricas Agregadas:**
- **Rede Nação Santa**: 75% presença, -2% crescimento ⚠️
- **Rede Jerusalém**: 70% presença, -5% crescimento ❌
- **Discipulador Carlos total**: 72% presença, -3% crescimento

**Obreiro Dexter identifica problema** e toma ação:
- Conversa com Discipulador Carlos
- Propõe treinamento para líderes em dificuldade
- Acompanha métricas mensais

---

### Passo 8: Pastor Vê Visão Completa (Topo)

**Pastor Sandro** acessa o dashboard e vê:

**Visão Geral da Igreja:**
- Total de Células Ativas: 45
- Total de Participantes: 520
- Taxa de Presença Geral: 78%
- Crescimento Mensal: +5%

**Visão por Obreiro:**
- Obreiro Dexter: 72% presença, -3% crescimento ⚠️
- Obreiro Maria: 82% presença, +8% crescimento ✅
- Obreiro João: 75% presença, +2% crescimento ✅

**Pastor clica em "Obreiro Dexter" (zoom)** → Vê os 10 discipuladores
**Pastor clica em "Discipulador Carlos" (zoom)** → Vê os 5 líderes
**Pastor clica em "Líder Lucas" (zoom)** → Vê histórico detalhado

**Drill-down completo**: Do topo até o detalhe de cada célula.

---

### Passo 9: Discipulador Cria Evento Personalizado (Se Liberado)

**Pastor Sandro libera** discipuladores criarem eventos customizados (ex: confraternizações).

**Discipulador Carlos** cria:
- **Nome**: "Confraternização de Líderes"
- **Data**: Sábado 15/02 às 15h
- **Local**: "Chácara do Discipulador Carlos"
- **Participantes**: Todos os 5 líderes + seus cônjuges
- **Aceita Convidados**: true
- **Recorrência**: ÚNICO (evento único)

**Notificação enviada** para todos os líderes.

**Resultado**: Discipulador tem autonomia para engajar sua rede, Pastor continua vendo tudo.

---

## Papéis Dinâmicos do Sistema

O sistema permite **papéis totalmente customizáveis** dentro de cada evento. Exemplos:

### Papéis em Eventos
- **Líder de Célula** (responsável principal)
- **Líder em Treinamento** (auxiliar aprendendo)
- **Anfitrião** (quem cede o local)
- **Intercessor** (responsável por oração)

**Qualquer participante pode ter um ou mais papéis.**

### Cursos e Estágios
O sistema rastreia cursos que participantes estão fazendo:

- **Curso**: "Líder em Ação"
- **Estágios**:
  - Fazendo (em andamento)
  - Concluiu 1x
  - Concluiu 2x (reforço)
  - Finalizado

**Vinculação**: Participante pode estar vinculado a múltiplos cursos simultaneamente.

---

## Sistema de Planos (Freemium)

### Plano FREE (Gratuito)
**Limitações:**
- 1 estrutura
- Até 3 eventos ativos
- Até 50 participantes totais
- Sem métricas históricas (apenas mês atual)
- Sem templates customizados

### Plano BÁSICO (R$ 29,90/mês)
- 1 estrutura
- Eventos ilimitados
- Até 200 participantes
- Métricas históricas (6 meses)
- Templates customizados

### Plano PRO (R$ 79,90/mês)
- 3 estruturas
- Eventos ilimitados
- Até 1.000 participantes
- Métricas históricas (2 anos)
- Templates customizados
- Relatórios avançados
- Integrações (Google Calendar, WhatsApp)

### Plano ENTERPRISE (Sob consulta)
- Estruturas ilimitadas
- Participantes ilimitados
- Métricas históricas ilimitadas
- Suporte prioritário
- API customizada
- Treinamento dedicado

**Pagamento via Stripe** com checkout hospedado e confirmação por webhook.

> Nota técnica 2026-06-26: Stripe é o provedor oficial de pagamento. O backend deve continuar resolvendo Price IDs pelo plano cadastrado, processando webhooks com idempotência e usando assinatura local como fonte para aplicação de limites.

### Comportamento dos Gates (Limites do Plano FREE)

#### Regra Geral — Aviso Proativo
Quando o usuário atingir **80% de qualquer limite**, o sistema exibe um **banner de aviso** no topo do contexto relevante:
> ⚠️ "Você está usando X de Y [recurso]. Faça upgrade para continuar crescendo."

Ao atingir **100%**, o bloqueio é aplicado conforme cada gate abaixo.

#### Gate 1 — 2ª Estrutura (limite: 1)
- **Ação**: Modal de bloqueio com CTA de upgrade
- **Mensagem**: "Seu plano FREE permite apenas 1 estrutura. Faça upgrade para criar múltiplas organizações."
- **Aviso proativo**: Banner ao criar a 1ª estrutura e atingir 80% do uso (não se aplica — limite é 1, então o aviso aparece assim que a estrutura existe e o usuário *tenta* criar outra)

#### Gate 2 — 4º Evento Ativo (limite: 3)
- **Ação**: Bloqueio na tentativa de criação com CTA de upgrade
- **Mensagem**: "Você atingiu o limite de 3 eventos ativos. Faça upgrade ou finalize um evento existente."
- **Aviso proativo**: Banner ao ter 2 eventos ativos (67% do limite)

> ℹ️ **Nota**: O Gate 2 utiliza 67% em vez do padrão de 80% pois o limite total é apenas 3. Com apenas 1 evento de diferença entre o aviso e o bloqueio, seria tarde demais para notificar no momento exato de 80% (que seria 2,4 — inexistente). Dois eventos ativos (67%) é o ponto de aviso mais próximo e útil para não surpreender o usuário.

#### Gate 3 — 51º Participante (limite: 50)
- **Ação**: Bloqueio ao tentar enviar novo convite com CTA de upgrade
- **Mensagem**: "Você atingiu o limite de 50 participantes. Faça upgrade para adicionar mais pessoas."
- **Aviso proativo**: Banner ao atingir 40 participantes (80% do limite)

#### Gate 4 — Histórico além do mês atual
- **Ação**: Seção de histórico/relatórios exibida com **blur + overlay** e CTA de upgrade
- **Mensagem**: "Histórico disponível a partir do Plano BÁSICO. Faça upgrade para ver seu histórico completo."
- **Aviso proativo**: Banner no dashboard ao usar o sistema por mais de 20 dias no mês (usuário está se aproximando do fim do período visível)

#### Gate 5 — Templates Customizados
- **Ação**: Opção de criar template customizado exibida **desabilitada** com tooltip de upgrade
- **Mensagem**: "Templates customizados disponíveis a partir do Plano BÁSICO."
- Não tem aviso proativo (é uma feature, não um limite numérico)

---

## Autenticação e Cadastro

### Métodos de Login
1. **E-mail e Senha** (cadastro padrão)
2. **Login Social**:
   - Google
   - Facebook
   - (Futuro: Microsoft, Apple)

### Fluxo de Cadastro
1. Usuário se cadastra
2. Cria sua primeira estrutura (ou aceita convite de outra)
3. Define hierarquia e papéis customizados
4. Começa a criar eventos

#### Verificação de E-mail após Cadastro
- **MVP**: A verificação de e-mail é **obrigatória para autenticar**.
- Após criar a conta, o sistema envia e-mail de confirmação com token válido por **24 horas**.
- Enquanto não confirmado, o login retorna bloqueio com mensagem orientando confirmação e opção de **reenvio do e-mail**.
- O usuário só acessa onboarding/dashboard após validar o link de confirmação.

### Recuperação de Senha
1. Usuário clica **"Esqueci minha senha"** na tela de login.
2. Informa o e-mail cadastrado.
3. Recebe um **link de redefinição por e-mail** (validade de **24 horas**).
4. Clica no link → é levado para a tela de **definição de nova senha**.
5. Define nova senha (mínimos idênticos ao cadastro: 8 caracteres, com letras e números).
6. É redirecionado para o login com mensagem de sucesso: *"Senha redefinida com sucesso. Faça login com a nova senha."*

> 🔒 **Segurança**: Se o e-mail informado não estiver cadastrado, o sistema exibe uma resposta **genérica e não-reveladora**: *"Se esse e-mail estiver cadastrado, você receberá as instruções em breve."* — Isso evita enumeração de contas.

---

## Perfil do Usuário

### O que o usuário pode editar
| Campo | Editável? | Observação |
|-------|-----------|------------|
| Nome completo | ✅ Sim | Alteração imediata |
| Foto de perfil | ✅ Sim | Upload de imagem — tamanho máximo: **2 MB** |
| E-mail | ✅ Sim | Requer confirmação no **novo** e-mail antes de aplicar |
| Senha | ✅ Sim | Requer informar a senha atual para confirmar |
| Data de criação da conta | ❌ Não | Campo de sistema, somente leitura |
| Histórico de participações | ❌ Não | Dados imutáveis para integridade de métricas |
| Vínculo com estruturas | ❌ Não | Gerenciado pelos responsáveis hierárquicos |

### Alterar E-mail
1. Usuário informa o novo e-mail nas configurações de perfil.
2. Sistema envia link de confirmação para o **novo endereço de e-mail**.
3. Enquanto não confirmado, o e-mail antigo permanece ativo.
4. Após confirmação, o e-mail é atualizado e o antigo é invalidado para login.

### Alterar Senha via Perfil
1. Usuário informa a senha **atual** (obrigatório).
2. Informa a nova senha e confirmação.
3. Salva — sessões ativas em outros dispositivos são encerradas.

### Deletar Conta
Ver seção **"Saída de Estrutura & Exclusão de Conta"** para o fluxo completo, incluindo bloqueio por ownership e conversão para usuário virtual.

---

## Onboarding

### Princípio Geral
O onboarding é **guiado, estilo tour de jogo** — apresenta missões mínimas com progresso visual para incentivar o usuário a explorar o produto. O tour é **não obrigatório** (pode ser pulado a qualquer momento), **exceto o Passo 1** (criar a estrutura), pois sem uma estrutura o produto não tem função.

### Progresso Visual
A barra de progresso é **puramente visual** — não desbloqueia features nem concede recompensas funcionais. Serve apenas como guia e incentivo de conclusão.

### Missão Mínima (Cenário A — Fundador)

| Passo | Missão | Obrigatório? |
|---|---|---|
| 1 | Criar a estrutura (nome + tipo) | ✅ Sim — sem isso o produto não funciona |
| 2 | Escolher template de hierarquia ou criar do zero | Não (pode pular) |
| 3 | Criar o primeiro grupo | Não (pode pular) |
| 4 | Convidar a primeira pessoa | Não (pode pular) |
| 5 | Criar o primeiro evento | Não (pode pular) |

### Templates de Hierarquia
Ao criar a estrutura, são oferecidos **templates prontos** para acelerar a configuração:
- Igreja (Pastor → Obreiro → Discipulador → Líder → Membro)
- Empresa (CEO → Diretor → Gerente → Supervisor → Colaborador)
- Escola (Diretor → Coordenador → Professor → Aluno)
- ONG (Presidente → Coordenador → Voluntário → Beneficiário)
- Em branco (totalmente customizado)

### Estado "Limbo" — Conta Criada sem Estrutura
Se o usuário pular o passo 1 (improvável, mas possível via navegação direta), o sistema exibe uma **tela de boas-vindas** com o tour disponível e um CTA proeminente: **"Criar sua Estrutura"**. O dashboard permanece vazio até a estrutura ser criada.

### Cenário B — Usuário Convidado para uma Estrutura
- Cadastro **pré-preenchido** com nome e e-mail fornecidos pelo solicitante
- Usuário **pode alterar o nome** no momento do cadastro (o solicitante pode ter abreviado)
- O convite já vem **atrelado a um nível hierárquico** definido por quem convidou
- Ao entrar, o usuário visualiza imediatamente **seu nível e todos os níveis abaixo** dele (escopo correto desde o primeiro acesso)
- O tour de onboarding **não é exibido** — o usuário já tem contexto definido

### Cenário C — Usuário Convidado para um Evento Específico
- O usuário entra **diretamente no grupo** ao qual o evento pertence
- **Cadastro é obrigatório** — não existe presença anônima no sistema
- Após o cadastro, o usuário já está vinculado ao grupo e pode registrar presença no evento

---

## Métricas e Relatórios Avançados

### Tipos de Métricas Disponíveis

#### 1. Métricas de Participação
- Taxa de presença por evento
- Taxa de presença por grupo (célula, rede)
- Taxa de presença por responsável (líder)
- Comparativo mensal/trimestral/anual

#### 2. Métricas de Crescimento
- Crescimento de participantes (%)
- Crescimento por grupo
- Crescimento por responsável
- Tendências (crescendo, estável, declinando)

#### 3. Métricas de Saúde
- Eventos cancelados (%)
- Ausências justificadas vs não justificadas
- Taxa de check-in (pontualidade)
- Convidados convertidos em membros

#### 4. Drill-Down Hierárquico
- Clicar em qualquer métrica para ver detalhes
- Zoom progressivo: Estrutura → Rede → Discipulador → Líder → Evento
- Identificação de problemas específicos

### Alertas Automáticos
- ⚠️ Taxa de presença abaixo de 60%
- ⚠️ Declínio de participantes por 3 semanas consecutivas
- ⚠️ Eventos cancelados com frequência
- ✅ Crescimento acima de 10% no mês

---

## Histórico e Auditoria

### Rastreamento Completo
- **Histórico de mudanças**: Quem alterou o evento, quando, o quê
- **Histórico de responsáveis**: Transferência de liderança
- **Histórico de participações**: Todas as presenças/ausências
- **Histórico de estrutura**: Mudanças na hierarquia

### Acesso ao Histórico de Auditoria

| Perfil | Nível de acesso |
|--------|----------------|
| **Owner da estrutura** | Log completo de auditoria — todas as entidades, todos os eventos |
| **Líderes intermediários** | Apenas o histórico das entidades sob sua responsabilidade (seus grupos e seus eventos) |
| **Membros comuns** | Sem acesso ao log de auditoria |
| **Qualquer membro** | Pode visualizar o próprio **histórico pessoal de participações** (`/jornada`) |

### Casos de Uso
1. "Quem era o líder da Célula X em janeiro de 2025?"
2. "Quantas vezes João faltou nos últimos 6 meses?"
3. "Quando o evento foi cancelado e por quê?"

---

## Saída de Estrutura & Exclusão de Conta

### Conceito: Usuário Virtual
O sistema distingue dois tipos de usuário:
- **Usuário Real**: tem conta ativa, faz login, recebe notificações
- **Usuário Virtual**: não tem conta (ou a conta foi excluída) — existe apenas como registro histórico, sem acesso ao sistema

Usuários virtuais são criados em dois casos:
1. Convidado externo que nunca criou conta
2. Usuário real que excluiu sua conta

### Saída de uma Estrutura (Desvincular Membro)

#### Quem pode remover
| Ação | Quem pode executar |
|---|---|
| Membro se auto-remove | O próprio membro |
| Remover outro membro | Qualquer nível hierárquico acima do membro |

#### O que acontece ao sair
- Histórico de participações, presenças e eventos **permanece registrado** (soft delete — dados não são apagados)
- O membro perde acesso à estrutura imediatamente
- Se o membro era **responsável de eventos ativos**: o **superior imediato vira responsável automaticamente**
- O registro do membro nos eventos históricos é mantido (identificado pelo nome)

### Exclusão de Conta

#### Bloqueio por Ownership
Se o usuário for o **único Owner** de uma ou mais estruturas com membros ativos:
- O sistema **bloqueia a exclusão**
- Exibe mensagem: "Você é o único administrador de [Estrutura X]. Transfira a administração antes de excluir sua conta."
- O usuário deve **transferir a ownership** para outro membro antes de prosseguir

#### Conversão para Usuário Virtual
Após a exclusão confirmada:
1. A conta é desativada — login impossível
2. O usuário **vira um registro virtual** (sem e-mail, sem senha, sem acesso)
3. Todo o histórico (presenças, eventos, responsabilidades passadas) **permanece vinculado ao usuário virtual**
4. Nas telas do sistema, o nome aparece como **"[Nome] (inativo)"** ou equivalente
5. Métricas e relatórios **não são afetados** — integridade histórica preservada

---

## Eventos Fixos vs Flexíveis

### Eventos Fixos (Travados)
**Exemplo: Conferência Anual**

Pastor cria evento:
- **Nome**: "Conferência de Avivamento 2026"
- **Data**: 10/12/2026 (fixa, não pode ser alterada)
- **Horário**: 19h (fixo)
- **Local**: "Auditório da Igreja Central" (fixo)
- **Recorrência**: ANUAL (fixa)
- **Participantes**: Toda a estrutura (fixo)

**Ninguém pode editar**, apenas visualizar e confirmar presença.

### Eventos Flexíveis
**Exemplo: Célula Semanal**

Líder tem controle sobre:
- Nome personalizado
- Horário (dentro da semana)
- Local (pode mudar conforme disponibilidade)

**Mas recorrência é travada (SEMANAL)** para garantir métricas consistentes.

---

## Cancelamento de Evento

### Quem Pode Cancelar

| Perfil | Pode cancelar? | Condição |
|---|---|---|
| **Criador do evento** | ✅ Sempre | — |
| **Qualquer nível hierárquico ACIMA do criador** | ✅ Sempre | — |
| **Responsável designado** (abaixo do criador) | ⚠️ Condicional | Somente se o criador marcou `pode_cancelar = true` nas configurações do evento |
| **Outros participantes** | ❌ Nunca | — |

### Configuração pelo Criador
O criador do evento pode definir dois checkboxes ao criar/editar o evento:
- `pode_cancelar` — permite que o responsável designado cancele o evento
- `exigir_justificativa_cancelamento` — torna o motivo obrigatório ao cancelar

### Fluxo de Cancelamento

1. Usuário com permissão clica em "Cancelar Evento"
2. Sistema exibe modal de confirmação
3. Se `exigir_justificativa_cancelamento = true` → campo de motivo é **obrigatório**
4. Se `exigir_justificativa_cancelamento = false` → campo de motivo é **opcional**
5. Usuário confirma → evento muda para status **CANCELADO**
6. Notificação enviada a todos os participantes **com conta real** (não usuários virtuais):
   - 📧 E-mail com motivo (se informado)
   - 💬 WhatsApp — Fase 2

### Registro Histórico
Evento cancelado **nunca é excluído** — permanece no histórico com status `CANCELADO` para alimentar as métricas de saúde (% de eventos cancelados).

### Cancelamento de Ocorrência vs Série (Eventos Recorrentes)

#### Cancelar uma ocorrência específica
- Cancela **apenas aquela data/instância** do evento recorrente.
- As demais ocorrências da série **continuam normalmente**.
- A ocorrência cancelada aparece no histórico com status `CANCELADO`.
- O sistema registra uma **exceção no padrão de recorrência** (`excecao_evento`) para identificar a instância cancelada sem afetar as demais.

#### Cancelar toda a série (encerrar evento recorrente)
- Cancela **todas as ocorrências futuras** da série.
- O histórico de todas as ocorrências passadas é **mantido integralmente**.
- O evento muda para status **`ENCERRADO`** (distinto de `CANCELADO` — encerramento é intencional e definitivo).
- Esta ação requer **confirmação explícita** via modal de aviso: *"Você está encerrando todas as ocorrências futuras. Esta ação não pode ser desfeita."*
- Somente o **criador do evento** ou qualquer nível hierárquico **acima** do criador pode encerrar uma série.

---

## Agrupamentos e "Redes"

### Conceito
**"Rede" não é uma entidade separada** - é apenas um **Grupo Pai** que contém outros grupos (células).

### Estrutura
```typescript
Grupo {
  id: number;
  nome: string;               // "Rede Nação Santa"
  grupo_superior_id?: number; // ID do grupo pai (null se raiz)
  grupos_filhos: Grupo[];     // Subgrupos (células)
  responsavel_id: number;     // Discipulador responsável
}
```

### Navegação
- Usuário clica em "Rede Nação Santa" → Sistema lista `grupos_filhos` (células)
- Usuário clica em "Célula Maria" → Sistema mostra evento + participantes

### Benefícios
- Simplicidade: tudo é Grupo (hierarquia uniforme)
- Flexibilidade: pode ter N níveis de agrupamento
- Métricas agregadas: "Rede X" é soma de todas células filhas

---

## Regras de Criação de Eventos (Recorrência Avançada)

### Recorrência com RRule (RFC 5545)

O sistema suporta **recorrência complexa** usando padrão iCalendar (RRule):

**Exemplos:**

#### 1. Evento Semanal
```
Recorrência: SEMANAL
Dias: Sexta-feira
Horário: 20h
```

#### 2. Evento Quinzenal
```
Recorrência: SEMANAL
Intervalo: 2 (a cada 2 semanas)
Dias: Sábado
```

#### 3. Evento Mensal (Primeira Segunda-feira)
```
Recorrência: MENSAL
Dia da Semana: Segunda-feira
Posição: Primeira
```

#### 4. Evento Mensal (Último Domingo)
```
Recorrência: MENSAL
Dia da Semana: Domingo
Posição: Última
```

#### 5. Evento Anual
```
Recorrência: ANUAL
Data: 10/12 (todo dia 10 de dezembro)
```

#### 6. Evento com Data de Término
```
Recorrência: SEMANAL
Data Início: 01/01/2026
Data Fim: 31/12/2026 (termina no final do ano)
```

**Flexibilidade Total**: Sistema permite criar qualquer padrão de recorrência.

---

## Responsáveis Múltiplos

### Conceito
Eventos podem ter **múltiplos responsáveis** colaborando:

- **Responsável Principal**: Criador ou designado
- **Responsáveis Auxiliares**: Podem ser adicionados (se permitido)

### Permissões
- **Principal**: Controle total (pode adicionar/remover auxiliares)
- **Auxiliares**: Podem registrar presenças, adicionar participantes (se permitido)

### Caso de Uso
**Líder Maria** designa:
- **Líder em Treinamento João** como auxiliar
- João pode gerenciar evento junto com Maria
- João aprende na prática (mentoria)

### Reatribuição de Responsável Principal

Reatribuir o responsável principal de um evento/série é uma operação excepcional
e auditada, usada quando a pessoa deixa de ocupar aquele escopo operacional.

Regras:
- Owner pode reatribuir dentro de qualquer grupo da estrutura.
- Responsável comum só pode reatribuir eventos de grupos descendentes ao seu grupo.
- A pessoa responsável pelo próprio grupo não deve reatribuir seus próprios eventos;
  a validação deve vir do responsável acima.
- Evento, configuração recorrente e template podem bloquear a operação com
  `permitir_reatribuicao_responsavel = false`.
- A confirmação exige motivo e grava auditoria com origem, destino, executor e
  critério de validação hierárquica.

---

## Convites e Participação

### Fluxo de Convite para Evento
1. Responsável cria evento e inclui grupos
2. Sistema identifica membros dos grupos automaticamente
3. Envia notificação: "Você foi incluído(a) em [Evento]"
4. Membro acessa e vê detalhes

### Convites por E-mail (Participante Externo)
Se o participante não está cadastrado:
1. Responsável adiciona o e-mail manualmente
2. Sistema envia: "Você foi convidado(a) para [Evento]"
3. Convidado clica: "Deseja participar?"
4. **Cadastro é obrigatório** para aceitar — não há presença anônima
5. Após cadastro, entra no grupo do evento automaticamente

### Convites para a Estrutura (Gestão de Membros)

#### Regra de Permissão em Cascata
> Um usuário só pode **convidar pessoas para grupos abaixo do seu** se quem o adicionou à estrutura concedeu a permissão `pode_gerenciar_subgrupos = true`.

**Exemplo:**
```
Obreiro convida Discipulador Carlos
  └─ com pode_gerenciar_subgrupos = true
     → Carlos PODE convidar Líderes para grupos abaixo dele

Obreiro convida Discipulador Ana
  └─ com pode_gerenciar_subgrupos = false
     → Ana NÃO PODE convidar ninguém — apenas participa
```

#### Definição do Nível Hierárquico no Convite
- Quem convita **escolhe o nível hierárquico** do convidado no momento do convite
- O nível define o **escopo de visão** e as **permissões** do convidado desde o primeiro acesso
- O convidado não pode alterar seu próprio nível — apenas quem está acima pode mudar

#### Fluxo de Convite para Estrutura
1. Usuário com permissão acessa a gestão do grupo
2. Clica em "Convidar membro"
3. Informa nome + e-mail + nível hierárquico + `pode_gerenciar_subgrupos`
4. Sistema envia e-mail de convite
5. Convidado se cadastra (com nome pré-preenchido — pode alterar)
6. Entra diretamente no nível e grupo definidos pelo solicitante

### Expiração de Convites

| Tipo de convite | Prazo de validade |
|-----------------|------------------|
| Convite para estrutura | **7 dias** a partir do envio |
| Convite para evento externo | **No dia do evento** ou **24h após o envio**, o que ocorrer primeiro |

- Convite expirado: exibe tela *"Este convite expirou. Entre em contato com quem te convidou para solicitar um novo."*
- **Reenvio**: O solicitante pode reenviar o convite a qualquer momento, gerando um novo link. O link anterior é **invalidado automaticamente**.
- **Anti-spam**: Um mesmo e-mail pode receber no máximo **3 convites** para a mesma estrutura antes de o sistema bloquear novos envios. O solicitante é informado do bloqueio e orientado a contactar o convidado por outro canal.

### Auto Check-in
- Participante pode fazer **auto check-in** no dia do evento.
- O líder responsável pelo evento pode **habilitar ou desabilitar** o check-in por GPS nas configurações do evento.
- **Quando GPS habilitado**: raio padrão de **500 metros** do local definido no evento. O líder pode ajustar o raio (mínimo: **100m**, máximo: **5km**).
- **Check-in sem GPS** (fallback): sempre disponível — o participante clica em *"Confirmar presença"* manualmente, independente de localização.
- **Funcionamento offline**: participante confirma presença localmente; o registro é **sincronizado automaticamente** quando a conexão for restaurada.
- **Override manual**: o responsável pelo evento pode registrar presença manualmente por qualquer participante, ignorando a validação por GPS.

---

## Multi-Contexto — Troca de Estrutura

### Switcher de Contexto
- Localização: **dropdown no header**, sempre acessível
- **Visível somente quando o usuário possui 2 ou mais estruturas** — oculto para usuários com apenas 1 estrutura
- Exibe o nome e ícone/avatar da estrutura atualmente ativa

### Comportamento ao Trocar de Contexto
1. Usuário clica no dropdown e seleciona outra estrutura
2. Conteúdo atual faz **fade out suave** (150ms)
3. **Skeleton screen** animado é exibido (silhueta dos cards/dashboard)
4. Novo conteúdo carrega e faz **fade in**
5. URL e estado da aplicação refletem o novo contexto

### Login com Múltiplas Estruturas
- Ao fazer login, o sistema **vai diretamente para a última estrutura ativa** (sem tela de seleção intermediária).
- O usuário pode trocar a qualquer momento via o **switcher de contexto no header**.
- O **pop-up de seleção de estrutura** aparece **apenas** no primeiro login após o usuário aceitar convite em uma segunda estrutura e ainda não ter uma "última estrutura ativa" definida (ex: nunca fez login antes naquela sessão). Após a primeira escolha, o sistema memoriza e não exibe mais o pop-up no login.

### Isolamento de Contexto
- Cada estrutura tem hierarquia, eventos, permissões e métricas **completamente isolados**
- Nada de uma estrutura vaza para outra

---

## Exibição do Usuário Virtual

### Conceito
Um **usuário virtual** é qualquer participante sem conta ativa:
- Convidado externo que nunca criou conta
- Ex-membro que excluiu a conta

### Como Aparece nas Telas

| Contexto | Exibição |
|---|---|
| **Listas de membros ativos** | Aparece normalmente, sem marcação de inativo |
| **Histórico de eventos/presenças** | Aparece com nome normal |
| **Perfil/detalhes** | Exibe `"[Nome] (inativo)"` |
| **Buscas** | Aparece nos resultados sem distinção visual |

> **Regra**: O usuário virtual é indistinguível nas listas — age como qualquer participante sem conta. Só ao abrir o perfil detalhado aparece a marcação `(inativo)`.

### Reativação
Se um usuário virtual (ex-membro) se recadastrar com o mesmo e-mail:
- O sistema **reactiva o vínculo** com o histórico existente
- Volta ao estado de usuário real automaticamente

---

## Cenários Adicionais

### Cenário: Estrutura de Empresa

**CEO João** cria estrutura "Tech Solutions Ltda":

**Hierarquia:**
```
CEO (Nível 1)
├─ Diretores (Nível 2)
│  ├─ Gerentes (Nível 3)
│  │  ├─ Supervisores (Nível 4)
│  │  │  └─ Colaboradores (Nível 5)
```

**Eventos:**
- **Reunião Semanal de Equipe** (template travado)
- **One-on-One** (flexível, gerente agenda com colaborador)
- **All-Hands Mensal** (fixo, CEO -> todos)
- **Treinamentos** (cursos com estágios)

**Papéis em Reuniões:**
- Facilitador
- Apresentador
- Tomador de Notas
- Participante

**Métricas:**
- Taxa de participação em reuniões
- Pontualidade (via check-in)
- Treinamentos concluídos
- Crescimento de equipes

**Resultado**: Mesma plataforma, contexto diferente.

---

### Cenário: Multi-Estrutura

**Maria** é:
- **Líder de Célula** na "Igreja Batista Central"
- **Gerente de Projetos** na "Tech Solutions Ltda"

**Experiência de Maria (login normal):**
1. Login no app → sistema vai **direto para a última estrutura ativa** (ex: Igreja Batista Central — último contexto usado).
2. Vê eventos de célula imediatamente.
3. Para trocar → clica no switcher de contexto no header → seleciona "Tech Solutions Ltda" → vê reuniões de trabalho.

> ℹ️ **Exceção**: Se Maria acabou de aceitar um convite para a segunda estrutura e ainda não tem "última estrutura" definida, o sistema exibe o pop-up de seleção **apenas nesse primeiro acesso**. Após escolher, o comportamento volta ao padrão (login direto na última ativa).

**Cada contexto tem:**
- Hierarquia própria
- Eventos próprios
- Permissões próprias
- Métricas próprias

**Sistema não mistura** as estruturas (isolamento total).

---

## Resumo dos Diferenciais

1. ✅ **100% Agnóstico** - Serve para qualquer tipo de organização
2. ✅ **Hierarquia Customizável** - Papéis e níveis dinâmicos
3. ✅ **Zoom Hierárquico** - Topo vê tudo, base vê apenas sua área
4. ✅ **Multi-Estrutura** - Usuário pode estar em N organizações
5. ✅ **Templates com Permissões Granulares** - Controle fino sobre o que pode ser editado
6. ✅ **Métricas Consistentes** - Rastreamento por nome genérico + recorrência
7. ✅ **Drill-Down Completo** - Clique e veja detalhes (zoom progressivo)
8. ✅ **Responsáveis Múltiplos** - Colaboração e mentoria
9. ✅ **Papéis Dinâmicos** - Papéis customizados por evento
10. ✅ **Cursos e Estágios** - Rastreamento de treinamentos
11. ✅ **Recorrência Avançada** - Suporte completo a RRule (iCalendar)
12. ✅ **Eventos Fixos e Flexíveis** - Controle fino sobre editabilidade
13. ✅ **Freemium Escalável** - Planos para todos os tamanhos
14. ✅ **Histórico e Auditoria** - Rastreamento completo de mudanças
15. ✅ **Auto Check-in** - Participantes confirmam presença facilmente

---

## Notificações

### Canais por Fase

| Canal | Fase | Observação |
|---|---|---|
| 🔔 In-app (sino/badge) | MVP | Sempre disponível para usuários logados |
| 📧 E-mail | MVP | Essencial — único canal para novos usuários |
| 💬 WhatsApp | Fase 2 | Meta API — maior taxa de abertura no BR |
| 📱 Push (mobile/PWA) | Fase 3 | Requer app mobile |

### Regra de Canal por Perfil do Destinatário

> O canal enviado depende se o destinatário já tem conta no sistema.

| Situação do destinatário | Canal utilizado |
|---|---|
| **Novo usuário** (sem conta) | 📧 E-mail APENAS |
| **Usuário cadastrado + online** | 🔔 In-app |
| **Usuário cadastrado + offline** | 📧 E-mail |

### Matriz de Notificações — MVP

| # | Gatilho | Novo usuário | Usuário cadastrado |
|---|---|---|---|
| 1 | Convite para estrutura | 📧 E-mail | 🔔 In-app |
| 2 | Designado responsável de evento | — | 🔔 In-app + 📧 E-mail |
| 3 | Convite para evento externo | 📧 E-mail | 🔔 In-app |
| 4 | Evento iniciado | — | 🔔 In-app |
| 5 | Lembrete pré-evento | — | 🔔 In-app + 📧 E-mail |
| 6 | Evento finalizado / presença registrada | — | 🔔 In-app |
| 7 | Alerta de saúde (gestor) | — | 🔔 In-app + 📧 E-mail |
| 8 | Ação pendente (convite aguardando) | — | 🔔 In-app |

### Configurabilidade
- **MVP**: Notificações são **fixas e obrigatórias** — o usuário não pode desativar canais individualmente
- **Fase 2**: Configuração de preferências de notificação por canal e por tipo de gatilho

---

## Roadmap Futuro

### Fase 1 (MVP - Atual)
- ✅ Estrutura e hierarquia customizável
- ✅ Eventos com templates
- ✅ Participação e presenças
- ✅ Métricas básicas
- ✅ Notificações in-app + e-mail (fixas e obrigatórias)

### Fase 2 (Q2 2026)
- Integração WhatsApp (notificações)
- Configuração de preferências de notificação
- Integrações (Google Calendar)
- Relatórios em PDF/Excel
- Dashboard personalizado

### Fase 3 (Q3 2026)
- App Mobile (iOS e Android)
- Check-in com QR Code
- Gamificação (conquistas, badges)
- Integração com sistemas de doação

### Fase 4 (Q4 2026)
- IA para sugestões (próximos eventos, pessoas a convidar)
- Previsões de presença (machine learning)
- Chatbot para suporte
- API pública para integrações customizadas

---

**Este documento descreve o modelo de negócio e funcionalidades do GestaoEventos.**

Para detalhes técnicos:
- Frontend: Ver [frontend.md](frontend.md)
- Backend: Ver [backend.md](backend.md)
