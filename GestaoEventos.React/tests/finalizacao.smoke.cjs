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
      const writes = [];
      let status = 'EmAndamento';
      page.on('pageerror', (error) => errors.push(error.message));
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: 5, estrutura_nome: 'Coaching Path', grupo_nome: 'Grupo de teste', tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/eventos/42') data = { data: { id: 42, titulo: 'Encontro de acompanhamento', grupo_id: 5, data_inicio: '2026-09-07T19:00:00' } };
        if (url.pathname === '/api/ocorrencias' && request.method() === 'GET') data = { data: [{ id: 91, evento_id: 42, data_hora: '2026-09-07T19:00:00', status, cancelada: false }] };
        if (url.pathname === '/api/eventos/42/participantes') data = { data: [
          { id: 700, usuario_id: 8, usuario_virtual_id: null, nome: 'Pessoa presente', status: 'PRESENTE', is_virtual: false },
          { id: 701, usuario_id: 9, usuario_virtual_id: null, nome: 'Pessoa pendente', status: 'PENDENTE', is_virtual: false },
        ] };
        if (url.pathname === '/api/eventos/42/ciclos') data = { data: [] };
        if (url.pathname === '/api/ocorrencias/91/status' && request.method() === 'PUT') {
          const body = request.postDataJSON();
          writes.push(body);
          status = body.novo_status;
          data = { data: { id: 91, evento_id: 42, data_hora: '2026-09-07T19:00:00', status, cancelada: false } };
        }
        await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/eventos/acompanhar/42?data=2026-09-07`);
      await page.getByRole('button', { name: 'Finalizar ocorrencia', exact: true }).click();
      await page.getByText('Deixar como pendente', { exact: true }).click();
      await page.getByLabel('Observacoes gerais', { exact: true }).fill('Encerramento validado');
      await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
      await page.getByText('Realizada', { exact: true }).waitFor();
      assert.equal(writes.length, 1);
      assert.equal(writes[0].novo_status, 'Realizada');
      assert.equal(writes[0].observacoes, 'Encerramento validado');
      assert.equal(writes[0].usuario_id, 3);
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px finalization`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
