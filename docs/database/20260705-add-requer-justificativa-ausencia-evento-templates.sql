-- Adiciona a flag "Requer justificativa ao faltar" no modelo de evento.
-- Quando 1, marcar Ausente/Justificado na presença exige um motivo (modal no front).
-- Coluna backward-compatible (NOT NULL DEFAULT 0). Aplicada direto em prod (sem migration EF,
-- pois o app usa EnsureCreated e não roda migrations no startup).
--
-- Banco: seven_gestao_eventos (RDS prod)

ALTER TABLE evento_templates
  ADD COLUMN requer_justificativa_ausencia TINYINT(1) NOT NULL DEFAULT 0
  AFTER requer_justificativa_remocao;
