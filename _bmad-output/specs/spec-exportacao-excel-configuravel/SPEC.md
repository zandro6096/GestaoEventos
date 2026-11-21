---
id: SPEC-exportacao-excel-configuravel
companions:
  - ../../planning-artifacts/prds/prd-exportacao-excel-configuravel-2026-10-25/prd.md
  - ../../planning-artifacts/prds/prd-exportacao-excel-configuravel-2026-10-25/addendum.md
  - ../../planning-artifacts/ux-designs/ux-GestaoEventos-2026-10-25/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-GestaoEventos-2026-10-25/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-GestaoEventos-2026-10-25/ARCHITECTURE-SPINE.md
sources: []
---

# Exportação Excel configurável por Estrutura

## Why

Esta oportunidade elimina a cópia manual de dados para planilhas com padrões diferentes por Estrutura. Hoje o relatório de frequência oferece CSV, mas lideranças precisam de arquivos Excel no formato usado por seus Grupos e com acesso autorizado; a experiência atual não entrega esse arquivo de forma completa em web, iOS e Android. Mapear planilhas é trabalho técnico; por isso (revisão 2026-11-10) os modelos são preparados sob encomenda pela equipe da plataforma e o cliente apenas exporta.

## Capabilities

- **CAP-1 — Administração restrita à equipe da plataforma**
  - **intent:** Somente administradores da plataforma (`PlatformAdmins:UsuarioIds`) criam, mapeiam, validam, publicam e desativam modelos, cada um vinculado a exatamente uma Estrutura. No piloto, por script/SQL.
  - **success:** Nenhuma superfície ou endpoint do cliente cria, altera ou publica modelos; nenhum modelo é visível em outra Estrutura.

- **CAP-2 — Mapear por configuração declarativa**
  - **intent:** A equipe associa campos do catálogo a destinos do modelo e define repetições por pessoa e por Grupo numa Configuração de mapeamento versionada, sem código.
  - **success:** A validação aponta campos inexistentes, destinos duplicados/incompatíveis e conflitos com fórmulas; um arquivo de teste com dados reais restritos ao escopo do líder de referência (ex.: Daniel) é comparado com a planilha atual dele, pode ser enviado a ele, é auditado, apagado depois e não é registrado como exportação.

- **CAP-3 — Publicar versões confiáveis**
  - **intent:** A equipe publica e substitui versões de modelos de uma Estrutura sem alterar versões já usadas.
  - **success:** Cada modelo tem no máximo uma versão publicada ativa; a confirmação de exportação valida e fixa a versão ativa usada.

- **CAP-4 — Revisar e exportar dados autorizados**
  - **intent:** Uma liderança com permissão dinâmica de exportação (ou o Dono) escolhe um modelo publicado, período e Grupos autorizados, revisa os dados e gera a planilha; modelo único, último período e Grupos vêm sugeridos. Sem modelo publicado, o CSV segue disponível e o Dono é orientado a enviar a planilha por e-mail ou WhatsApp da plataforma.
  - **success:** O arquivo contém exatamente as linhas exibidas na prévia de exportação; mudança de autorização ou escopo impede a geração ou entrega integralmente.

- **CAP-5 — Entregar arquivos nas plataformas do produto**
  - **intent:** A pessoa baixa ou compartilha o resultado em web, iOS ou Android.
  - **success:** O sistema só confirma a entrega após o arquivo estar pronto, identifica formato/modelo/versão e mantém a exportação CSV disponível.

- **CAP-6 — Auditar sem armazenar o conteúdo exportado**
  - **intent:** Responsáveis acompanham publicação e resultado das exportações sem reter linhas pessoais da planilha.
  - **success:** O histórico identifica pessoa, Estrutura, modelo/versão, filtros, resultado e horário; conteúdo da planilha não aparece em logs, auditoria ou analytics.

## Constraints

- Administração de modelos é exclusiva da equipe da plataforma; pedidos de modelo chegam fora do app. Leituras, prévias e exportações usam a Estrutura ativa e permissões dinâmicas atuais, inclusive para Grupos descendentes somente quando o escopo existente permitir.
- Aceitar `.xlsx` e `.xlsm`; preservar fórmulas e VBA embutido sem executar macros, links externos ou conexões. Nunca sobrescrever células de fórmula; solicitar recálculo ao abrir sem prometer cálculo em todos os leitores.
- Usar somente o catálogo explícito de campos já existentes e autorizados; não permitir SQL, scripts, fórmulas ou código arbitrário enviados pelo usuário.
- A prévia de exportação e o arquivo usam o mesmo snapshot temporário protegido. Revalidar permissões antes de consumir e entregar o arquivo; apagar o snapshot após conclusão ou expiração.
- Validação de modelos, preparação de prévias e geração são operações assíncronas com estado consultável e recuperação de falhas.
- Exportação oferece capacidade completa em web, iOS e Android (configuração é interna), com controles acessíveis por teclado e leitores de tela.
- Usar terminologia agnóstica do produto: Estrutura, Grupo, Evento e pessoa. Não assumir contexto de igreja ou empresa.
- Preferir processador de planilhas com licença aberta; o protótipo Open XML SDK 3.5.1 não é aprovado para produção antes do teste de compatibilidade `.xlsm`.
- Mudanças de schema usam SQL idempotente, não migrations EF Core geradas.

## Non-goals

- Telas de configuração/mapeamento para o cliente, solicitação de modelo dentro do app e cobrança por modelo personalizado.
- Executar, criar ou alterar macros/VBA, conexões externas ou automações de planilha.
- Permitir código, SQL ou fórmulas arbitrárias, ou calcular resultados de fórmulas no produto.
- Importar alterações feitas no Excel, agendar envios, enviar exportações por e-mail ou compartilhar modelos entre Estruturas.
- Garantir o cálculo das fórmulas em todos os leitores XLSX/XLSM.

## Success signal

A equipe da plataforma publica o modelo de Daniel para a Estrutura dele e uma liderança exporta os Grupos sob seu escopo; o arquivo abre no formato correspondente, mantém fórmulas/VBA aprovados e corresponde exatamente à prévia. No piloto, as metas propostas são 98% de geração válida bem-sucedida, modelo aceito pelo líder de referência com no máximo 2 versões corretivas, 3 ciclos mensais consecutivos de uso pelo líder piloto e zero exportações confirmadas fora do escopo; essas metas ainda são hipóteses, não gates de lançamento.

## Assumptions

- O primeiro catálogo parte dos campos já disponíveis no relatório de frequência e só inclui outros campos existentes quando autorizados.
- A liderança Daniel representa o perfil exportador; o primeiro modelo é `Discipulado - DANIEL.xlsm` (prompt/10.11.26/).
- Os números de sucesso do PRD são metas iniciais do piloto, não compromissos de release.

## Open Questions

- O Open XML SDK 3.5.1 preserva fórmulas, VBA, estilos, abas auxiliares ocultas e referências do modelo sanitizado em um round-trip? Se não, qual processador aberto atende aos mesmos critérios?
- Quais limites de upload/saída, tamanho de snapshot, linhas/abas, concorrência do worker e prazos de retenção o piloto deve adotar?
- Quando a API existente migrará de .NET 8 para .NET 10, antes do fim do suporte do .NET 8 em 10/11/2026?
- Qual o formato/schema concreto da Configuração de mapeamento?
- Quais identificadores de permissão, rotas, contratos de API e módulos de seleção/compartilhamento de arquivos cada plataforma deve usar?
