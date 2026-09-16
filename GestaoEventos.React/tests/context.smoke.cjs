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
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: null, grupo_id: null, estrutura_nome: null, grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }, { id: 3, nome: 'Segunda estrutura', papel: 'Membro' }] } };
        await route.fulfill({ json: data });
      });
      await page.goto('http://localhost:8083/estrutura/selecionar');
      await page.getByText('Selecione uma estrutura', { exact: true }).waitFor();
      await page.getByText('Segunda estrutura', { exact: true }).click();
      await page.getByText('Minha Jornada', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px troca de estrutura e reidrata jornada`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
