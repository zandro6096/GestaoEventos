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
      page.on('pageerror', (error) => errors.push(error.message));
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: 5, estrutura_nome: 'Coaching Path', grupo_nome: 'Grupo de teste', tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/eventos/42') data = { data: { id: 42, titulo: 'Encontro de acompanhamento', grupo_id: 5, evento_template_id: 11, data_inicio: '2026-09-07T19:00:00' } };
        if (url.pathname === '/api/ocorrencias') data = { data: [{ id: 91, evento_id: 42, data_hora: '2026-09-07T19:00:00', status: 'EmAndamento', cancelada: false }] };
        if (url.pathname === '/api/eventos/42/participantes') data = { data: [
          { id: 700, usuario_id: 8, usuario_virtual_id: null, nome: 'Participante de teste', status: 'PENDENTE', is_virtual: false },
          { id: 701, usuario_id: 9, usuario_virtual_id: null, nome: 'Outra pessoa', status: 'PENDENTE', is_virtual: false },
        ] };
        if (url.pathname === '/api/eventos/42/ciclos') data = { data: [] };
        if (url.pathname === '/api/evento-templates') data = { data: [{ id: 11, requer_justificativa_ausencia: false }] };
        if (url.pathname === '/api/participacoes-evento' && request.method() === 'POST') { writes.push({ path: url.pathname, body: request.postDataJSON() }); data = { data: {} }; }
        if (url.pathname === '/api/participacoes-evento/lote' && request.method() === 'POST') { writes.push({ path: url.pathname, body: request.postDataJSON() }); data = { data: {} }; }
        await route.fulfill({ json: data });
      });
      await page.goto('http://localhost:8083/eventos/acompanhar/42?data=2026-09-07');
      await page.getByText('Participante de teste', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Marcar Participante de teste como presente', exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(writes[0].path, '/api/participacoes-evento');
      assert.equal(writes[0].body.evento_id, 42);
      assert.equal(writes[0].body.ocorrencia_id, 91);
      assert.equal(writes[0].body.usuario_id, 8);
      assert.equal(writes[0].body.status, 'PRESENTE');
      await page.getByRole('checkbox', { name: 'Selecionar Participante de teste', exact: true }).click();
      await page.getByRole('checkbox', { name: 'Selecionar Outra pessoa', exact: true }).click();
      await page.getByRole('button', { name: 'Marcar selecionados como ausentes', exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(writes[1].path, '/api/participacoes-evento/lote');
      assert.equal(writes[1].body.itens.length, 2);
      assert.deepEqual(writes[1].body.itens.map((item) => item.status), ['AUSENTE', 'AUSENTE']);
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px presence single and batch`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
