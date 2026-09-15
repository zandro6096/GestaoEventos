-- =====================================================================
-- 20260629 - Reparo: recorrência semanal gerando TODOS os dias
-- =====================================================================
-- Sintoma: evento recorrente semanal (ex.: "Imparável Culto Família")
-- passou a mostrar uma ocorrência por DIA (seg..sáb além de dom),
-- todas como "Ciclo não identificado · sem ciclo".
--
-- Causa raiz (dados): a linha em `evento_recorrencias` ficou com
-- tipo = 2 (Semanal) mas `dias_semanais` NULL ou "[]".
-- Em RecorrenciaService.IsDataValida, Semanal sem dias_semanais é
-- tratado como "todo dia" -> gera todos os dias entre inicio_em e fim.
--
-- Este script:
--   1) DIAGNOSTICA o evento e a recorrência.
--   2) Corrige `dias_semanais` para o dia da semana de `inicio_em`
--      (ou um valor explícito que você definir).
--   3) (Opcional) Remove ocorrências materializadas em dias errados
--      que NÃO tenham presença registrada.
--
-- ⚠️ Rode os SELECTs primeiro. Ajuste @evento_id. Faça backup.
-- ⚠️ NÃO execute em produção sem revisar cada passo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Defina o evento alvo (preencha o id após o diagnóstico).
-- ---------------------------------------------------------------------
SET @evento_id := NULL;   -- <<< PREENCHER (ex.: 123)

-- ---------------------------------------------------------------------
-- 1) DIAGNÓSTICO — achar o evento pelo título (confirme o id)
-- ---------------------------------------------------------------------
SELECT id, titulo, inicio_em, horario, endereco, grupo_id, status
FROM Eventos
WHERE titulo LIKE '%Imparável Culto Família%'
ORDER BY id DESC;

-- Recorrência atual do evento alvo
SELECT r.evento_id, r.tipo, r.intervalo, r.dias_semanais, r.rrule,
       r.fim_recorrencia, r.max_ocorrencias,
       e.inicio_em,
       DAYOFWEEK(e.inicio_em) - 1 AS dow_inicio_0dom  -- 0=Dom .. 6=Sáb
FROM evento_recorrencias r
JOIN Eventos e ON e.id = r.evento_id
WHERE r.evento_id = @evento_id;

-- Ocorrências materializadas (para ver os dias duplicados)
SELECT id, data_hora, DAYNAME(data_hora) AS dia, status, cancelada
FROM ocorrencias_evento
WHERE evento_id = @evento_id
ORDER BY data_hora;

-- ---------------------------------------------------------------------
-- 2) CORREÇÃO da recorrência
--    Define dias_semanais = [dia da semana do inicio_em].
--    Se o culto é no domingo, isso resulta em "[0]".
--    Se quiser forçar um dia específico, troque a expressão por ex. '[0]'.
-- ---------------------------------------------------------------------
-- Pré-visualização do valor que será gravado:
SELECT CONCAT('[', DAYOFWEEK(e.inicio_em) - 1, ']') AS novo_dias_semanais
FROM Eventos e
WHERE e.id = @evento_id;

-- START TRANSACTION;

-- UPDATE evento_recorrencias r
-- JOIN Eventos e ON e.id = r.evento_id
-- SET r.dias_semanais = CONCAT('[', DAYOFWEEK(e.inicio_em) - 1, ']'),
--     r.atualizado_em = UTC_TIMESTAMP()
-- WHERE r.evento_id = @evento_id
--   AND r.tipo = 2;                       -- só recorrência semanal

-- ---------------------------------------------------------------------
-- 3) (OPCIONAL) Limpar ocorrências materializadas em dias errados
--    Remove apenas as que NÃO são do dia correto E NÃO têm presença.
--    Ajuste o "= 0" (domingo) se o dia correto for outro.
-- ---------------------------------------------------------------------
-- Confira antes o que será apagado:
-- SELECT o.id, o.data_hora, DAYNAME(o.data_hora) AS dia, o.status
-- FROM ocorrencias_evento o
-- WHERE o.evento_id = @evento_id
--   AND (DAYOFWEEK(o.data_hora) - 1) <> 0                       -- <> domingo
--   AND NOT EXISTS (SELECT 1 FROM participacoes_evento p
--                   WHERE p.ocorrencia_evento_id = o.id);       -- sem presença

-- DELETE o FROM ocorrencias_evento o
-- WHERE o.evento_id = @evento_id
--   AND (DAYOFWEEK(o.data_hora) - 1) <> 0
--   AND NOT EXISTS (SELECT 1 FROM participacoes_evento p
--                   WHERE p.ocorrencia_evento_id = o.id);

-- ---------------------------------------------------------------------
-- 4) (OPCIONAL) Restaurar o endereço apagado na edição
--    A edição em branco gravou endereco = '' (ou NULL).
--    Se houver histórico, busque o valor anterior; senão, preencha à mão.
-- ---------------------------------------------------------------------
-- Tentar recuperar de mudancas_evento / auditorias (se registrado):
-- SELECT * FROM mudancas_evento WHERE evento_id = @evento_id ORDER BY id DESC;
-- SELECT * FROM auditorias WHERE entidade = 'Evento' AND entidade_id = @evento_id ORDER BY id DESC;

-- UPDATE Eventos SET endereco = '<<ENDEREÇO CORRETO>>' WHERE id = @evento_id;

-- COMMIT;     -- confira tudo antes de COMMIT; use ROLLBACK se algo estiver errado.

-- ---------------------------------------------------------------------
-- 5) VALIDAÇÃO pós-correção
-- ---------------------------------------------------------------------
-- SELECT evento_id, tipo, dias_semanais, rrule FROM evento_recorrencias WHERE evento_id = @evento_id;
-- SELECT id, data_hora, DAYNAME(data_hora), status FROM ocorrencias_evento WHERE evento_id = @evento_id ORDER BY data_hora;
