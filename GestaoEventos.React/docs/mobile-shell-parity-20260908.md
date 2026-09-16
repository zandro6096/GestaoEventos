# Paridade do shell mobile

Comparacao feita com `GestaoEventos.Angular/src/app/libs/layout/topbar/mobile` e `sidebar/mobile`, usando captura do emulador Android em 1080x2400.

## Entregue

- Topbar mobile com logo da estrutura, nome do contexto, sino e avatar.
- Central do sino com abas `Atribuições` e `Aniversariantes`.
- Notificacoes carregadas por estrutura em `GET /api/notificacoes/internas`, com marcar uma/todas como lida nos endpoints oficiais.
- Aniversariantes carregados uma vez pelo cockpit, filtrados para os proximos 7 dias na aba do sino.
- Menu do avatar com perfil, plano para owner, troca de organizacao e logout.
- Bottom navigation com `Início`, `Eventos` e `Mais`, usando 60px e o mesmo tratamento visual do Angular.
- Bottom sheet `Mais` mantido com secoes e permissao dinamicas.

## Regra de chamadas

As consultas do shell sao cacheadas por `estruturaId` pelo TanStack Query. O sino apenas revalida a consulta existente ao abrir; nao ha timer, loop ou chamadas por item renderizado.

## Validacao

- `npm run type-check`
- `npm run lint`
- `npm run check:shell`
- `npm run check:session`
- `npm run check:analytics`
- `npm run check:architecture`
- `npm run build:web`
