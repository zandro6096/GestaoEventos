# Cobrança de registros de presença

## Escopo

Configuração disponível somente no app React/Expo. O Angular permanece como
referência de comportamento e não recebe alterações.

## Configuração do template

Cada template pode definir:

- `cobranca_presenca_ativa`: habilita a cobrança automática.
- `prazo_registro_*`: prazo contado do fim da ocorrência.
- `aviso_inicial_apos_*`: primeiro aviso ao responsável.
- `aviso_vencimento_antes_*`: aviso antes do vencimento.
- `escalonamento_apos_*`: tempo após o vencimento para avisar o superior.
- `repetir_cobranca_*`: intervalo para repetir a cobrança enquanto aberta.

As unidades aceitas são `horas` e `dias`. O formulário oferece os perfis
`Agressivo`, `Padrao` e `Flexivel`, além de permitir edição individual.

## Padrão

- Cobrança ativa.
- Prazo de 7 dias.
- Primeiro aviso após 1 dia.
- Aviso na véspera.
- Escalonamento 1 dia após o vencimento.
- Repetição a cada 7 dias.

## Regras de execução

O motor de notificações deve usar o fim da ocorrência como referência, ignorar
ocorrências canceladas e encerrar a cobrança quando o registro de presença for
salvo. O próximo passo deve criar notificações idempotentes para o responsável
e para o superior, com payload para abrir a pendência ou a lista filtrada.
