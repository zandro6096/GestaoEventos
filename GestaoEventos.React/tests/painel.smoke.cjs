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
        if (url.pathname === '/api/grupos') data = { data: [{ id: 7, nome: 'Equipe Norte', estrutura_id: 2, nivel_hierarquico: 1, grupo_superior_id: null, tipo_grupo_id: null, criado_em: '2026-01-01' }] };
        if (url.pathname.startsWith('/api/painel/')) data = { data: { tipo: 'presenca-media', items: [{ id: 7, nome: 'Equipe Norte', valor: 82.5, valor_anterior: 76.5, variacao: 6, tendencia: 'crescente' }], resumo: { media_geral: 82.5, media_anterior: 76.5, variacao_media: 6, total_grupos: 1, grupos_acima: 1, grupos_abaixo: 0 }, comparativo_meses: [{ mes: 'ago/26', valor: 82.5 }] } };
        await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/admin/painel`);
      await page.getByText('Painel Comparativo', { exact: true }).waitFor();
      await page.getByText('Media de presenca', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: 'Abrir grupo Equipe Norte', exact: true }).count(), 1);
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px painel`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
