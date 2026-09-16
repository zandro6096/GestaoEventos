const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function mockApi(page, role) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let data = { data: [] };
    if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: role }] } };
    if (url.pathname === '/api/permissoes/recursos') data = [{ id: 1, codigo: 'auditoria', nome: 'Auditoria', ativo: true }, { id: 2, codigo: 'configuracoes', nome: 'Configuracoes', ativo: true }];
    if (url.pathname === '/api/auditoria') data = { data: [{ id: 501, usuario_id: 3, nome_usuario: 'Pessoa autorizada', acao: 'UPDATE', entidade: 'Grupo', entidade_id: 9, descricao: 'Grupo atualizado', dados_antigos: '{"nome":"Antes"}', dados_novos: '{"nome":"Depois"}', criado_em: '2026-09-07T10:00:00Z' }], total: 1, skip: 0, take: 50 };
    await route.fulfill({ json: data });
  });
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(page, 'Owner');
      await page.goto('http://localhost:8083/configuracoes/auditoria');
      await page.getByText('Auditoria', { exact: true }).last().waitFor();
      await page.getByText('Grupo atualizado', { exact: true }).waitFor();
      await page.getByLabel('Ver detalhes da auditoria', { exact: true }).click();
      await page.getByText('Detalhes da alteracao', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.goto('http://localhost:8083/configuracoes/suporte');
      await page.getByText('Suporte', { exact: true }).waitFor();
      console.log(`PASS ${width}px auditoria/suporte autorizado`);
      await page.close();

      const blocked = await browser.newPage({ viewport: { width, height: 900 } });
      await blocked.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(blocked, 'Membro');
      await blocked.goto('http://localhost:8083/configuracoes/auditoria');
      await blocked.getByText('Acesso negado', { exact: true }).waitFor();
      console.log(`PASS ${width}px auditoria/suporte bloqueado`);
      await blocked.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
