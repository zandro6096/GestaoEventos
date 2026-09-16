# Fechamento de gaps da migração React

Atualizado em 2026-09-08 após comparação com o Angular produtivo.

## Fechado nesta rodada

- Edição de evento existente no acompanhamento, usando `GET/PUT /api/eventos/{id}`.
- Fila semanal com paginação, filtros de risco/status/template/responsável, expansão e atualização do acompanhamento via `PUT`.
- Exportação local do relatório de frequência em CSV: download no web e compartilhamento no Android/iOS.
- Resumo de objetivos de papel por evento no cockpit e marcador de objetivos nas células da matriz.
- Confirmação de que conflitos usam `EventosConflitoSpec` para sobreposição de eventos ativos no mesmo grupo e estrutura.

## Ainda depende de decisão ou contrato

- PDF/Excel nativo e agendamento de relatórios: o Expo ainda não tem módulo universal de arquivo/compartilhamento instalado e não existe endpoint de agendamento.
- Drawer de perfil, histórico e acompanhamento individual avançado de objetivos: o backend atual só entrega os resumos e itens já usados no cockpit/matriz.
- Suporte por ticket: não existe endpoint de chamados; o app mantém o canal oficial de email.
- `grupo_e_filhos` na facade síncrona do cliente: o backend já resolve a hierarquia e continua sendo a autoridade; a facade visual ainda precisa de um cache de hierarquia para liberar decisões locais por descendente.
- Validação final com conta produtiva no Android Studio e ambiente de produção: é gate manual de release, não é substituído por mock.

## Ambiente de validação

- `npm run type-check`: aprovado.
- `npm run lint`: aprovado.
- `npm run check:cockpit`: aprovado.
- `npm run check:relatorios`: aprovado.
- `npm run check:architecture`: aprovado.
- `npm run check:parity`: aprovado.
- `npm run check:offline-policy`: aprovado.
- `npm run build:web`: aprovado.
- `dotnet build GestaoEventos.API.sln --no-restore`: aprovado, 0 warnings e 0 errors.
- Smokes Playwright não foram executados neste checkout porque o módulo `playwright` não está instalado.
