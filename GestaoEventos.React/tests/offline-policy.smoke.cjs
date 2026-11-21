const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
  let writes = 0;

  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== 'GET') writes += 1;

    if (url.pathname === '/api/auth/token') {
      const payload = { sub: '3', exp: 4102444800 };
      const token = `test.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.test`;
      await route.fulfill({ json: { data: { token } } });
      return;
    }

    if (url.pathname === '/api/contexto/inicial') {
      await route.fulfill({ json: { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } } });
      return;
    }

    await route.fulfill({ json: { data: [] } });
  });

  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${SMOKE_BASE_URL}/auth/login`);
    await page.getByText('Bem-vindo de volta', { exact: true }).waitFor();

    await context.setOffline(true);
    await page.getByText('Sem conexao', { exact: true }).waitFor();
    await page.locator('input').nth(0).fill('offline@example.com');
    await page.locator('input').nth(1).fill('password');
    await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
    await page.getByText('Acao bloqueada sem conexao', { exact: false }).waitFor();
    assert.equal(writes, 0, 'login offline nao pode chamar a API');

    await context.setOffline(false);
    await page.getByText('Sem conexao', { exact: true }).waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
    await page.waitForFunction(() => document.body.innerText.includes('Jornada') || document.body.innerText.includes('Estruturas'));
    assert.equal(writes, 1, 'login online deve chamar a API uma vez');
    assert.deepEqual(errors, []);
    console.log('PASS offline bloqueia escrita, retorno online libera nova tentativa e nao cria fila');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
