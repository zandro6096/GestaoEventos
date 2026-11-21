const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const writes = [];
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), 'test.eyJzdWIiOiIzIiwiZXhwIjo0MTAyNDQ0ODAwfQ.test');
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/grupos/2') data = { data: { id: 2, nome: 'Filhos', estrutura_id: 2, nivel_hierarquico: 2, grupo_superior_id: 1, criado_em: '2026-01-01' } };
        if (url.pathname === '/api/grupos') data = { data: [{ id: 1, nome: 'Raiz', estrutura_id: 2, nivel_hierarquico: 1, grupo_superior_id: null }, { id: 2, nome: 'Filhos', estrutura_id: 2, nivel_hierarquico: 2, grupo_superior_id: 1 }] };
        if (url.pathname === '/api/grupos-membros') data = { data: [{ id: 10, grupo_id: 2, usuario_id: 8, usuario: { id: 8, nome: 'Membro atual', email: 'atual@example.com' } }] };
        if (url.pathname === '/api/responsaveis-grupo') data = { data: [{ id: 11, grupo_id: 2, usuario_id: 9, usuario: { id: 9, nome: 'Responsavel atual', email: 'resp@example.com' } }] };
        if (url.pathname === '/api/ocorrencias') data = { data: [] };
        if (url.pathname === '/api/usuarios-estrutura') data = { data: { data: [{ id: 20, estrutura_id: 2, usuario_id: 12, nome_usuario: 'Nova pessoa', email_usuario: 'nova@example.com', ativo: true }, { id: 21, estrutura_id: 2, usuario_id: 13, nome_usuario: 'Pessoa inativa', email_usuario: 'inativa@example.com', ativo: false }] } };
        if (url.pathname === '/api/usuarios-virtuais') data = { data: [{ id: 31, nome: 'Convite pendente', email: 'pendente@example.com', estrutura_id: 2, grupo_id: 2, status: 'pendente' }] };
        if (request.method() !== 'GET') writes.push({ method: request.method(), path: url.pathname, body: request.postDataJSON?.() });
        if (request.method() === 'POST' || request.method() === 'DELETE') await route.fulfill({ status: 204, body: '' });
        else await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/admin/grupos/2`);
      await page.getByRole('button', { name: 'Membros', exact: true }).click();
      await page.getByRole('button', { name: 'Adicionar membro', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Reativar', exact: true }).count(), 1);
      await page.getByRole('button', { name: 'Reativar', exact: true }).click();
      await page.getByRole('button', { name: 'Responsaveis', exact: true }).click();
      await page.getByRole('button', { name: 'Adicionar responsavel', exact: true }).click();
      await page.getByRole('button', { name: 'Reenviar convite', exact: true }).click();
      await page.getByRole('button', { name: 'Membros', exact: true }).click();
      await page.getByRole('button', { name: 'Remover membro Membro atual', exact: true }).click();
      await page.getByRole('button', { name: 'Remover', exact: true }).click();
      assert.equal(writes.some((write) => write.method === 'POST' && write.path === '/api/grupos-membros'), true);
      assert.equal(writes.some((write) => write.method === 'POST' && write.path === '/api/usuarios-estrutura/21/reativar'), true);
      assert.equal(writes.some((write) => write.method === 'POST' && write.path === '/api/usuarios-virtuais/31/enviar-convite'), true);
      assert.equal(writes.some((write) => write.method === 'DELETE' && write.path === '/api/grupos-membros/10'), true);
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px group member management`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
