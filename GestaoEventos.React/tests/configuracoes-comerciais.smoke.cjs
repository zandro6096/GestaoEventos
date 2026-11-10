const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function mockApi(page, role) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let data = { data: [] };
    if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: role }] } };
    if (url.pathname === '/api/permissoes/recursos') data = [{ id: 1, codigo: 'grupos', nome: 'Grupos', ativo: true }, { id: 2, codigo: 'eventos', nome: 'Eventos', ativo: true }, { id: 3, codigo: 'assinatura', nome: 'Assinatura', ativo: true }, { id: 4, codigo: 'planos', nome: 'Planos', ativo: true }];
    if (url.pathname === '/api/tipos-grupo') data = { data: [{ id: 11, nome: 'Nucleo', descricao: 'Grupo principal', estrutura_id: 2, permite_subgrupos: true, nivel_hierarquico_padrao: 1, ordem: 1, ativo: true }] };
    if (url.pathname === '/api/tipos-evento') data = { data: [{ id: 12, nome: 'Encontro', descricao: 'Evento recorrente', estrutura_id: 2, permite_recorrencia: true, requer_confirmacao: false, duracao_padrao_minutos: 60, ordem: 1, ativo: true }] };
    if (url.pathname === '/api/planos') data = { data: [{ id: 21, nome: 'Profissional', descricao: 'Plano para equipes', valor: 49.9, duracao_dias: 30, ativo: true, max_estruturas: 2, max_eventos_ativos: 20, max_participantes: 200, historico_meses: 12, permite_templates_customizados: true }] };
    if (url.pathname === '/api/assinaturas/status') data = { ativo: true, plano_id: 21, plano_nome: 'Profissional', expira_em: '2026-12-31T00:00:00Z', pode_gerenciar: false, max_estruturas: 2, max_eventos_ativos: 20, max_participantes: 200, permite_templates_customizados: true };
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
      await page.goto(`${SMOKE_BASE_URL}/configuracoes/tipos`);
      await page.getByText('Tipos de grupo', { exact: true }).last().waitFor();
      await page.getByText('Nucleo', { exact: true }).waitFor();
      await page.getByText('Tipos de evento', { exact: true }).click();
      await page.getByText('Encontro', { exact: true }).waitFor();
      await page.goto(`${SMOKE_BASE_URL}/configuracoes/assinatura`);
      await page.getByText('Minha assinatura', { exact: true }).waitFor();
      await page.getByText('Profissional', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`PASS ${width}px configuracoes comerciais autorizado`);
      await page.close();

      const blocked = await browser.newPage({ viewport: { width, height: 900 } });
      await blocked.addInitScript((value) => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await mockApi(blocked, 'Membro');
      await blocked.goto(`${SMOKE_BASE_URL}/configuracoes/tipos`);
      await blocked.getByText('Acesso negado', { exact: true }).waitFor();
      console.log(`PASS ${width}px configuracoes comerciais bloqueado`);
      await blocked.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
