# Key Screen Coverage

Fast path de UX para Indicadores de Acompanhamento. Nenhum mock visual foi renderizado neste ciclo; os contratos `DESIGN.md` e `EXPERIENCE.md` sao a fonte de verdade para arquitetura e criacao de epicos/stories.

| Surface | Coverage | Notes |
|---|---|---|
| Configurar Indicadores | Spine-only | Lista administrativa com CRUD, status, ordem, aplicabilidade, alvo e classificacao. |
| Indicador Form | Spine-only | Drawer/tela com validacoes de tipo, opcoes, sensibilidade e aplicabilidade. |
| Adicionar Participante > Acompanhamento inicial | Spine-only | Bloco reutilizavel dentro do modal atual de participantes, depois de identidade/escopo/funcao e antes de salvar. |
| Adicionar Membro ao Grupo > Acompanhamento inicial | Spine-only | Bloco reutilizavel dentro do dialog atual de grupo, recalculado por grupo/papel/pessoa. |
| Membro da Estrutura > Acompanhamento | Spine-only | Secao/aba no dialog atual de editar membro, como manutencao secundaria. |
| Grupo > Acompanhamento | Spine-only | Matriz desktop/tablet Participante x Indicador com filtros, sticky headers e edicao inline. |
| Mobile Acompanhamento | Spine-only | Cards por Participante, linhas editaveis e bottom sheets. |
| Participante > Acompanhamento | Spine-only | Drawer/perfil com resumo, pendencias e historico. |
| Historico do Indicador | Spine-only | Timeline por indicador, com origem e conflitos de merge. |
| Cursos futuro | Out of scope | Sem surface no MVP; apenas compatibilidade conceitual. |

Mock prioritario se o time decidir aprofundar visualmente depois: Grupo > Acompanhamento desktop, Mobile Acompanhamento e o bloco `Indicadores aplicaveis` dentro do modal de adicionar participante.
