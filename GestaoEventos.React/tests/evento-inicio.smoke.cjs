const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const output = path.resolve('tests/artifacts/evento-inicio');
  fs.mkdirSync(output, { recursive: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const writes = [];
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript(token => sessionStorage.setItem('gestaoeventos.secure.auth_token', token), token);
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: {
          usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: 5,
          estrutura_nome: 'Coaching Path', grupo_nome: 'Grupo de teste', tem_estrutura: true,
          estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }],
        } };
        if (url.pathname === '/api/evento-templates') data = { data: [{
          id: 7, estrutura_id: 2, titulo: 'Encontro de acompanhamento', descricao: '', tipo_recorrencia: 0,
          intervalo: 1, dias_semana: [], duracao_padrao_minutos: 90, horario_padrao: '19:00',
          local_padrao: 'Sala principal', permitir_renomear: true, permitir_configurar_hora: true,
          permitir_configurar_dia: true, permitir_configurar_local: true, opcao_fim: 'sem-fim', status: 'ATIVO',
        }] };
        if (url.pathname === '/api/grupos') data = { data: [{ id: 5, nome: 'Grupo de teste', estrutura_id: 2 }] };
        if (url.pathname === '/api/eventos/conflitos') data = [];
        if (route.request().method() === 'POST' && url.pathname === '/api/eventos') {
          writes.push(route.request().postDataJSON()); data = { data: { id: 42 } };
        }
        if (url.pathname === '/api/eventos/42/materializar') data = { ocorrencia_id: 91 };
        if (url.pathname === '/api/ocorrencias/91/status') data = { data: { id: 91, status: 'EmAndamento' } };
        await route.fulfill({ json: data });
      });
      await page.goto('http://localhost:8083/eventos/iniciar');
      if (width < 600) {
        await page.getByText('Mais', { exact: true }).click();
        await page.getByText('Menu', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Grupos e Participantes', exact: true }).last().waitFor();
        await page.getByRole('button', { name: 'Fechar menu', exact: true }).last().click();
      }
      await page.getByRole('button', { name: 'Criar evento', exact: true }).click();
      await page.getByLabel('Titulo do evento', { exact: true }).fill('Encontro de teste');
      await page.getByLabel('Horario', { exact: true }).fill('23:30');
      if (width < 900) {
        await page.getByRole('button', { name: 'Proxima etapa', exact: true }).click();
        await page.getByRole('button', { name: 'Proxima etapa', exact: true }).click();
      }
      await page.getByLabel('Data de inicio', { exact: true }).fill('2026-12-31');
      await page.screenshot({ path: path.join(output, `form-${width}.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      assert.equal(overflow, false, `horizontal overflow at ${width}`);
      await page.getByRole('button', { name: 'Iniciar Evento', exact: true }).click();
      await page.waitForURL('**/admin/eventos/acompanhar/42?data=2026-12-31');
      assert.equal(writes.length, 1);
      assert.equal(writes[0].data_inicio, '2026-12-31T23:30:00');
      assert.equal(writes[0].titulo, 'Encontro de teste');
      assert.equal(writes[0].data_fim, '2027-01-01T01:00:00');
      assert.equal(writes[0].grupo_id, 5);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: template, form, snake_case, start and navigation`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
