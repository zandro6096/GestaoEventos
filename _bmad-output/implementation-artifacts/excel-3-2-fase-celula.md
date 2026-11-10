---
story: "Exportação Excel — Story 3.2: Fase da célula com histórico"
epic: epics-exportacao-excel-configuravel.md (Epic 3)
status: implementada; banco de prod aplicado; API e app aguardando deploy
date: 2026-11-10
---

# Story 3.2 — Fase da célula com histórico

## O que foi feito

**Banco** (`GestaoEventos.API/docs/database/20261110-fases-evento.sql`, idempotente, aplicado em local e **prod** em 2026-11-10)
- `evento_template_fases`: opções de fase por modelo de evento (nome, ordem, ativo). Removida do modelo = inativa; histórico preservado.
- `evento_fases_historico`: evento, fase, vigente_desde (data), registrado_por_id, registrado_em, observação. Nunca sobrescrito.
- Prod: modelo "Célula" (template 1, estrutura 6) com Evangelismo, Comunhão, Edificação, Multiplicação. Histórico vazio até os líderes registrarem.

**API** (arquivos novos; tabela própria para não tocar o modelo de evento, que tem outra frente não commitada)
- `Core/Aggregates/EventoAggregate/EventoFase.cs`, `Specifications/EventoFaseSpecs.cs`; mapeamento em `AppDbContext.MapperEventoFases`.
- `UseCases/Eventos/Fases/EventoFasesUseCases.cs`; `Web/Eventos/FaseEndpoints.cs`:
  - `GET/PUT /api/evento-templates/{id}/fases` — PUT exige líder da estrutura do modelo (regra de rota).
  - `GET /api/eventos/{id}/fase` (leitura do evento) — opções, fase vigente hoje, histórico com autor.
  - `POST /api/eventos/{id}/fase` (gerenciar o evento; rota + handler) — valida fase do modelo (nome canônico, sem diferenciar maiúsculas), data não futura, não repetir a fase vigente na data.
- Regras de rota em `RegrasDeRotaAcesso` + casos em `RegrasDeRotaAcessoTests`.
- Testes: `tests/Clean.Architecture.UnitTests/UseCases/Eventos/EventoFasesHandlersHandle.cs` (7 casos). Rodados em projeto isolado (69/69 com as regras de rota) porque o projeto de testes unitários já não compilava por testes antigos desatualizados.

**App React**
- `services/api/fases-api.ts`; `features/eventos/acompanhamento/FaseEventoCard.tsx` (cartão "Fase" no acompanhamento: atual + desde, Alterar com opções, data dd/mm/aaaa, observação, histórico; analytics entrance/simulation/confirmation).
- `EventoTemplateFormScreen.tsx`: seção "Fases do evento" (uma por linha), gravada após salvar o modelo.
- `tsc --noEmit` sem erros. Testado no navegador contra API local (390 px): registrar, recusar inválida, exibir histórico.

**Exportação Excel**
- `extrator/extrair_rede.py`: fase vigente no fim do mês (eventos Célula) e `data_comunhao` (primeira entrada em Comunhão). Mapeamento Daniel: `Q3` (Fase da Célula) → Discipulador "Etapa Célula". Verificado com dados locais: set=Evangelismo, out=Comunhão (15/10), nov=Edificação.

## Revisão de UX (Sally) e alternativa A — 2026-11-10

Avaliação inicial: cartão 5,5/10, formulário 7,5/10. Protótipo com 3 alternativas (https://claude.ai/artifact/N1QbuP4KNrtCAXbsSLinDa); Sandro escolheu **A — selo no cabeçalho + folha inferior**. Implementado:
- `FaseEventoCard.tsx` → `FaseChip` (selo na linha de selos com a fase **da data da ocorrência**; tracejado "Definir fase" quando vazio) + `FaseAtualNota` ("Fase atual: X · desde" quando difere) + folha inferior: fases em ordem (concluídas ✓, ATUAL, PRÓXIMA pré-selecionada), "Começou em" com calendário nativo (web: dd/mm/aaaa validado ao salvar), observação recolhida, botão "Mudar para X" desabilitado na fase atual, histórico com autor, aviso "Fase alterada para X". Sem permissão: folha só com histórico. Nada aparece enquanto carrega ou sem fases no modelo.
- API: `pode_alterar` no `GET /api/eventos/{id}/fase`; `GET /api/evento-templates/{id}/fases` devolve `uso` (eventos por fase). 71 testes passando.
- `FasesModeloEditor.tsx`: lista numerada (subir/descer/remover, alvos 44px), adicionar com validação (repetida, 60 caracteres, 20 fases) e aviso ao remover fase em uso.
- Validado no navegador (390 px) contra API local: selo em data passada, folha, mesma fase bloqueada, salvar com aviso, editor e aviso de remoção. `tsc` sem erros.

## Pendências
- **Deploy da API**: o working tree da API tem alterações de outra frente não commitadas (modelo de evento, push, pendências); publicar agora levaria tudo junto.
- **App**: precisa de build/publicação (EAS) para chegar aos líderes.
- **Angular**: não recebeu a tela de fase.
- Banco local recebeu a coluna `adicionar_novos_participantes_em_todos_eventos` (script da outra frente, já existente em prod) para o app local carregar modelos.
