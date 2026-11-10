const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

function mockApi(page, role, writes) {
  return page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET') writes.push({ method: route.request().method(), path: url.pathname });
    let data = { data: [] };
    if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: role }] } };
    if (url.pathname === '/api/permissoes/recursos') data = [{ id: 1, codigo: 'eventos', nome: 'Eventos', descricao: 'Eventos', categoria: 'operacao', ativo: true }, { id: 2, codigo: 'grupos', nome: 'Grupos', descricao: 'Grupos', categoria: 'operacao', ativo: true }];
    if (url.pathname === '/api/usuarios-estrutura') data = { data: [{ id: 101, estrutura_id: 2, usuario_id: 3, nome_usuario: 'Pessoa ativa', email_usuario: 'ativa@example.com', papel: 'Dono', funcao: 'Gestao', ativo: true }, { id: 102, estrutura_id: 2, usuario_id: 4, nome_usuario: 'Pessoa inativa', email_usuario: 'inativa@example.com', papel: 'Participante', funcao: null, ativo: false }] };
    if (url.pathname === '/api/usuarios-virtuais') data = { data: [{ id: 201, nome: 'Convite pendente', email: 'pendente@example.com', estrutura_id: 2, grupo_id: null, status: 'pendente', convite_enviado_em: '2026-09-01' }] };
    if (url.pathname === '/api/papeis') data = { data: [{ id: 301, nome: 'Coordenacao', descricao: 'Acesso operacional', estrutura_id: 2, nivel_hierarquico: 2, cor: '#0066FF', icone: null, ordem: 1, ativo: true, criado_em: '2026-01-01', atualizado_em: null, permissoes: [{ id: 401, recurso: 'eventos', acao: 2, escopo: 4 }] }] };
    if (route.request().method() === 'POST') await route.fulfill({ status: 204, body: '' });
    else await route.fulfill({ json: data });
  });
}

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
      await mockApi(page, 'Owner', writes);
      await page.goto(`${SMOKE_BASE_URL}/configuracoes/membros`);
      await page.getByText('Membros', { exact: true }).last().waitFor();
      await page.getByText('Pessoa ativa', { exact: true }).waitFor();
      await page.getByText('Pessoa inativa', { exact: true }).waitFor();
      assert.equal(await page.getByText('Reativar', { exact: true }).count(), 1);
      assert.equal(await page.getByText('Reenviar convite', { exact: true }).count(), 1);
      await page.getByText('Reativar', { exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(writes.some((write) => write.method === 'POST' && write.path === '/api/usuarios-estrutura/102/reativar'), true);
      await page.goto(`${SMOKE_BASE_URL}/configuracoes/papeis`);
      await page.getByText('Papeis e permissoes', { exact: true }).waitFor();
      await page.getByText('Coordenacao', { exact: true }).waitFor();
      await page.getByText('Eventos', { exact: true }).last().waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px admin autorizado`);
      await page.close();

      const blocked = await browser.newPage({ viewport: { width, height: 900 } });
      const blockedErrors = [];
      blocked.on('pageerror', (error) => blockedErrors.push(error.message));
      await blocked.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(blocked, 'Membro', []);
      await blocked.goto(`${SMOKE_BASE_URL}/configuracoes/membros`);
      await blocked.getByText('Acesso negado', { exact: true }).waitFor();
      assert.deepEqual(blockedErrors, []);
      console.log(`PASS ${width}px admin bloqueado`);
      await blocked.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
