-- 20260701 - Endereço estruturado em Eventos e evento_templates
--
-- Contexto: o formulário de evento/modelo coleta CEP/logradouro/número/etc,
-- mas o backend só guardava a string composta em `endereco`/`local_padrao`.
-- Isso impedia recarregar os campos estruturados na edição e refletir o
-- endereço ao criar um evento a partir de um modelo.
--
-- `evento_templates` já tinha esses campos no domínio/DTO/mapeamento do backend,
-- mas as colunas NUNCA existiram no banco (causa do "Modelos falta CEP").
--
-- Colunas nullable e aditivas — seguro rodar em produção.
-- Idempotência: rode apenas uma vez; ADD COLUMN falha se a coluna já existir.

ALTER TABLE `Eventos`
  ADD COLUMN `cep` varchar(9) NULL,
  ADD COLUMN `logradouro` varchar(200) NULL,
  ADD COLUMN `numero` varchar(20) NULL,
  ADD COLUMN `complemento` varchar(100) NULL,
  ADD COLUMN `bairro` varchar(100) NULL,
  ADD COLUMN `cidade` varchar(100) NULL,
  ADD COLUMN `estado` varchar(2) NULL;

ALTER TABLE `evento_templates`
  ADD COLUMN `cep` varchar(9) NULL,
  ADD COLUMN `logradouro` varchar(200) NULL,
  ADD COLUMN `numero` varchar(20) NULL,
  ADD COLUMN `complemento` varchar(100) NULL,
  ADD COLUMN `bairro` varchar(100) NULL,
  ADD COLUMN `cidade` varchar(100) NULL,
  ADD COLUMN `estado` varchar(2) NULL;
