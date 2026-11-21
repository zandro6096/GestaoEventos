const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

function mockApi(page, role) {
  return page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let data = { data: [] };
    if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: role }] } };
    if (url.pathname === '/api/permissoes/recursos') data = { data: [] };
    await route.fulfill({ json: data });
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(page, 'Owner');
      await page.goto(`${SMOKE_BASE_URL}/configuracoes`);
      await page.getByText('Configuracoes', { exact: true }).last().waitFor();
      await page.getByText('Membros', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Abrir Membros' }).click();
      await page.getByText('Membros', { exact: true }).last().waitFor();
      await page.getByText('Nenhum membro encontrado para os filtros atuais.', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px configuracoes autorizado`);
      await page.close();

      const blocked = await browser.newPage({ viewport: { width, height: 900 } });
      const blockedErrors = [];
      blocked.on('pageerror', (error) => blockedErrors.push(error.message));
      await blocked.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(blocked, 'Membro');
      await blocked.goto(`${SMOKE_BASE_URL}/admin/membros`);
      await blocked.getByText('Acesso negado', { exact: true }).waitFor();
      assert.equal(await blocked.getByText('Esta area esta protegida', { exact: false }).count(), 0);
      assert.deepEqual(blockedErrors, []);
      console.log(`PASS ${width}px configuracoes bloqueado`);
      await blocked.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
