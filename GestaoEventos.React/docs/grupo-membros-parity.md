# Paridade de membros e responsaveis

## Escopo

O detalhe React do grupo permite listar e remover membros/responsaveis, adicionar usuarios reais, criar convite por email e reenviar convite de usuario virtual pendente. As mutacoes usam os contratos reais do backend e revalidam permissao dinamica, contexto ativo e conectividade.

## Estados de pessoa

- Usuario ativo: `Adicionar`.
- Usuario ou usuario virtual inativo: `Reativar`, sem apresentar reenviar convite.
- Usuario virtual pendente/expirado: `Reenviar convite`.
- Usuario virtual ativo/aceito: permanece informativo no diretorio; o backend atual nao aceita esse tipo no POST de membro/responsavel.

## Lacuna de backend

O backend possui `DELETE /api/usuarios-estrutura/{id}` para desativacao e `POST /api/usuarios-estrutura/{id}/reativar` para reativacao idempotente do vinculo. O React usa o ID do vinculo, reativa a pessoa e conclui o vinculo ao grupo sem usar reenviar convite como substituto.

## Evidencias

- `check:grupo-membros`
- `smoke:grupo-membros` em 390px e 1440px
- `type-check`, `lint`, `check:platform`
