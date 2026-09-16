const { Buffer } = require('node:buffer');
const { chromium } = require('./browser/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const route of ['admin/configuracoes', 'admin/membros']) {
      const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
      const token = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800, role: 'Owner', papel: 'Owner' })).toString('base64url')}.x`;
      const context = { usuarioId: 3, usuarioNome: 'Pessoa de teste', estruturaId: 2, grupoId: null, estruturaNome: 'Coaching Path', grupoNome: null, papel: 'Owner', papelNome: 'Owner', papelId: 1, temEstrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner', papelId: 1 }] };
      await page.addInitScript(({ authToken, initialContext }) => { localStorage.setItem('AUTH', authToken); localStorage.setItem('gestaoEventos_contexto', JSON.stringify(initialContext)); localStorage.setItem('hierarchy_context', JSON.stringify(initialContext)); }, { authToken: token, initialContext: context });
      await page.route('**/api/**', async (request) => {
        const url = new URL(request.request().url()); let data = { data: [] };
        if (url.pathname === '/api/contexto/inicial') data = { data: context };
        if (url.pathname === '/api/usuarios/3') data = { data: { id: 3, nome: 'Pessoa de teste', email: 'teste@example.com', role: 'Owner' } };
        if (url.pathname === '/api/grupos' || url.pathname.endsWith('/arvore')) data = { data: [{ id: 1, nome: 'Grupo principal', estruturaId: 2, nivelHierarquico: 1, grupoSuperiorId: null, quantidadeSubgrupos: 0 }] };
        if (url.pathname === '/api/usuarios-estrutura') data = { data: [{ id: 101, estruturaId: 2, usuarioId: 3, nomeUsuario: 'Pessoa ativa', emailUsuario: 'ativa@example.com', papel: 'Owner', ativo: true }] };
        await request.fulfill({ json: data });
      });
      await page.goto(`http://localhost:4201/${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(2500);
      await page.screenshot({ path: `GestaoEventos.Angular/tests/artifacts/angular-real-${route.replaceAll('/', '-')}-390.png`, fullPage: true }); await page.close();
    }
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
