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
        const request = route.request();
        const url = new URL(request.url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/grupos/2') data = { data: { id: 2, nome: 'Filhos', estrutura_id: 2, nivel_hierarquico: 2, grupo_superior_id: 1, tipo_grupo_id: null, criado_em: '2026-01-01' } };
        if (url.pathname === '/api/grupos' && request.method() === 'GET') data = { data: [{ id: 1, nome: 'Raiz', estrutura_id: 2, nivel_hierarquico: 1, grupo_superior_id: null }, { id: 2, nome: 'Filhos', estrutura_id: 2, nivel_hierarquico: 2, grupo_superior_id: 1 }] };
        if (url.pathname === '/api/grupos-membros') data = { data: [{ id: 10, grupo_id: 2, usuario_id: 8, usuario: { id: 8, nome: 'Membro', email: 'membro@example.com' } }] };
        if (url.pathname === '/api/responsaveis-grupo') data = { data: [{ id: 11, grupo_id: 2, usuario_id: 9, usuario: { id: 9, nome: 'Responsavel', email: 'resp@example.com' } }] };
        if (url.pathname === '/api/ocorrencias') data = { data: [] };
        await route.fulfill({ json: data });
      });
      await page.goto('http://localhost:8083/admin/grupos/2');
      await page.getByText('Filhos', { exact: true }).waitFor();
      await page.getByText('Raiz / Filhos', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Membros', exact: true }).click();
      await page.getByText('Membro', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px group detail`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
