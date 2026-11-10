const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await page.route('**/api/**', async (route) => {
        const url = new URL(route.request().url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/permissoes/recursos') data = { data: [] };
        if (url.pathname === '/api/grupos') data = { data: [{ id: 7, nome: 'Equipe Norte', estrutura_id: 2, nivel_hierarquico: 1, grupo_superior_id: null, tipo_grupo_id: null, criado_em: '2026-01-01' }], page_info: { total_pages: 1, total_count: 1 } };
        if (url.pathname === '/api/paineis/cockpit') data = { resumo: { total_participantes: 1, percentual_presenca: 82.5, total_eventos: 4, total_presencas: 3, total_ausencias: 1, total_justificados: 0, total_pendentes: 0, tendencia: 'crescente' }, alertas: [], grupos_filhos: [], participantes_saude: [] };
        if (url.pathname === '/api/paineis/cockpit/participantes/matriz-template') {
          const reportItems = Array.from({ length: 200 }, (_, index) => ({ tipo: 'usuario', participante_id: index + 9, nome: index === 0 ? 'Pessoa acompanhada' : `Pessoa ${index + 1}`, grupo_id: 7, grupo_nome: 'Equipe Norte', taxa_participacao: 82.5, total_presencas: 3, total_faltas: 1, total_eventos_considerados: 4, faltas_consecutivas: 0, faixa_risco: 'baixo', status_acompanhamento: 'em_dia', templates: [] }));
          data = { templates: [{ template_id: 11, template_titulo: 'Encontro mensal' }], itens: reportItems, total: reportItems.length };
        }
        await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/relatorios/frequencia`);
      await page.getByText('Relatorio de Frequencia', { exact: true }).waitFor();
      await page.getByText('Pessoa acompanhada', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Equipe Norte' }).click({ force: true });
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px relatorios`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
