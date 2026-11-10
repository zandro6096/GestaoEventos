const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

function template() {
  return { id: 41, titulo: 'Celula semanal', descricao: 'Reuniao semanal da equipe e acompanhamento dos participantes.', tipo: 'Evento', criador_id: 3, estrutura_id: 2, tipo_recorrencia: 2, intervalo: 1, dias_semana: ['quarta'], duracao_padrao_minutos: 60, horario_padrao: '19:30:00', local_padrao: 'Sala principal', opcao_fim: 'flexivel', data_fim: null, max_ocorrencias: null, permitir_configurar_dia: true, permitir_configurar_hora: true, permitir_configurar_local: true, permitir_renomear: true, permitir_add_responsaveis: false, permitir_remover_responsaveis: false, permitir_add_participantes: true, permitir_remover_participantes: false, requer_justificativa_remocao: false, requer_justificativa_ausencia: false, permitir_reatribuicao_responsavel: true, permitir_presenca_agrupada: true, permitir_reabertura: true, grupos_ids: [7], tipos_grupo_ids: [], papeis_ids: [], status: 'ATIVO', criado_em: '2026-01-01T00:00:00Z' };
}

async function mockApi(page, writes) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.method() !== 'GET') writes.push({ method: request.method(), path, body: request.postDataJSON?.() });
    let data = { data: [] };
    if (path === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
    if (path === '/api/permissoes/recursos') data = { data: [{ id: 1, codigo: 'eventos', nome: 'Eventos', descricao: 'Eventos', categoria: 'operacao', ativo: true }] };
    if (path === '/api/evento-templates') data = { data: [template()], paged_info: { page_number: 1, page_size: 20, total_pages: 1, total_records: 1 } };
    if (path === '/api/evento-templates/41') data = { data: template() };
    if (path === '/api/grupos') data = { data: [{ id: 7, nome: 'Equipe Norte', estrutura_id: 2, nivel_hierarquico: 1, grupo_superior_id: null }] };
    if (request.method() === 'DELETE') data = { data: template() };
    if (request.method() === 'POST' || request.method() === 'PUT') data = { data: template() };
    await route.fulfill({ json: data });
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      const writes = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(page, writes);
      await page.goto(`${SMOKE_BASE_URL}/admin/eventos/modelos`);
      await page.getByText('Modelos de Evento', { exact: true }).first().waitFor();
      await page.getByText('Celula semanal', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Novo modelo' }).count(), 1);
      await page.getByRole('button', { name: 'Novo modelo' }).click();
      await page.getByText('Criar Modelo de Evento', { exact: true }).waitFor();
      await page.getByLabel('Titulo do modelo').fill('Novo modelo de teste');
      await page.getByLabel('Descricao').fill('Descricao suficiente para validar o cadastro do modelo.');
      await page.getByText('Criar modelo', { exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(writes.some((write) => write.method === 'POST' && write.path === '/api/evento-templates'), true);
      await page.goto(`${SMOKE_BASE_URL}/admin/eventos/modelos`);
      await page.getByText('Celula semanal', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Editar Celula semanal' }).click();
      await page.getByText('Editar Modelo de Evento', { exact: true }).waitFor();
      await page.getByText('Atualizar modelo', { exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(writes.some((write) => write.method === 'PUT' && write.path === '/api/evento-templates/41'), true);
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px modelos de eventos`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
