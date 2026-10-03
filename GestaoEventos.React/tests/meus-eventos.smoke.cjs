const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const { existsSync } = fs;
const { resolve } = require('node:path');
const playwrightModule = process.env.PLAYWRIGHT_MODULE || resolve(process.cwd(), '..', '.codex-tmp', 'browser', 'node_modules', 'playwright');
const { chromium } = require(existsSync(playwrightModule) ? playwrightModule : 'playwright');

const ocorrencias = [
  { id: 901, evento_id: 401, evento_titulo: 'Encontro do Norte', data_hora: '2026-09-07T19:00:00', data_efetiva: '2026-09-07T19:00:00', status: 'EmAndamento', grupo_id: 11, grupo_nome: 'Grupo Norte', responsavel_id: 3, pode_confirmar_responsavel: true, recorrente: true, permitir_presenca_agrupada: true },
  { id: 904, evento_id: 401, evento_titulo: 'Encontro do Norte', data_hora: '2026-09-12T19:00:00', data_efetiva: '2026-09-12T19:00:00', status: 'Agendada', grupo_id: 11, grupo_nome: 'Grupo Norte', responsavel_id: 3, recorrente: true, permitir_presenca_agrupada: true },
  { id: 902, evento_id: 402, evento_titulo: 'Encontro do Sul', data_hora: '2026-08-20T19:00:00', data_efetiva: '2026-08-20T19:00:00', status: 'Agendada', grupo_id: 12, grupo_nome: 'Grupo Sul', responsavel_id: 3 },
  { id: 903, evento_id: 403, evento_titulo: 'Historico do Norte', data_hora: '2026-08-01T19:00:00', data_efetiva: '2026-08-01T19:00:00', status: 'Cancelada', cancelada: true, motivo_cancelamento: 'Agenda alterada', grupo_id: 11, grupo_nome: 'Grupo Norte', responsavel_id: 3 },
];
const ocorrenciasSetembro = ocorrencias.filter(item => item.data_efetiva.startsWith('2026-09'));
const ocorrenciasJanelaInicial = ocorrencias.filter(item => !item.data_efetiva.startsWith('2026-09'));

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const artifactSuffix = process.env.SMOKE_ARTIFACT_SUFFIX || 'latest';
  fs.mkdirSync('tests/artifacts/meus-eventos', { recursive: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 1200 : 1000 } });
      // As fixtures e os filtros esperados pertencem a setembro, independentemente da data da release.
      await page.clock.setFixedTime(new Date('2026-09-07T12:00:00-03:00'));
      const errors = [];
      const occurrenceRequests = [];
      const cycleRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
      await page.addInitScript(value => sessionStorage.setItem('gestaoeventos.secure.auth_token', value), token);
      await page.route('**/api/**', async route => {
        const request = route.request();
        const url = new URL(request.url());
        let body = { data: [] };
        if (url.pathname === '/api/contexto/inicial') {
          body = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        }
        if (url.pathname === '/api/ocorrencias') {
          occurrenceRequests.push(url.search);
          const isSeptemberRequest = url.searchParams.get('data_inicio')?.startsWith('2026-09-01');
          const data = isSeptemberRequest ? ocorrenciasSetembro : ocorrenciasJanelaInicial;
          body = { data, page_info: { current_page: 1, page_size: 200, total_pages: 1, total_count: data.length } };
        }
        if (url.pathname.includes('/ciclos')) cycleRequests.push(url.pathname);
        if (url.pathname === '/api/eventos/configuracoes') body = { data: [] };
        await route.fulfill({ json: body });
      });

      if (width === 390) {
        await page.goto('http://localhost:8083/jornada');
        await page.getByRole('tab', { name: 'Eventos', exact: true }).click();
        await page.waitForURL('**/eventos/meus');
      } else {
        await page.goto('http://localhost:8083/admin/eventos/meus');
      }
      await page.getByText('Encontro do Norte', { exact: true }).waitFor();
      assert.equal(await page.getByText('Meus Eventos', { exact: true }).count(), 1);
      assert.equal(width === 390 ? occurrenceRequests.some((search) => search.includes('data_inicio=2026-09-01')) : true, true);
      assert.deepEqual(cycleRequests, []);
      assert.equal(await page.getByRole('tab', { name: 'Filtrar grupo Grupo Norte', exact: true }).count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

      if (width === 390) {
        await page.getByRole('button', { name: 'Mais opções', exact: true }).click();
        await page.getByText('Estrutura', { exact: true }).waitFor();
        await page.getByText('Grupos e Participantes', { exact: true }).waitFor();
        await page.screenshot({ path: `tests/artifacts/meus-eventos/meus-${width}-${artifactSuffix}-menu.png`, fullPage: true });
        await page.getByRole('button', { name: 'Fechar menu', exact: true }).click();
      }

      await page.screenshot({ path: `tests/artifacts/meus-eventos/meus-${width}-${artifactSuffix}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Todos do ano', exact: true }).click();
      await page.getByRole('tab', { name: 'Filtrar grupo Grupo Norte', exact: true }).click();
      assert.equal(await page.getByText('Encontro do Sul', { exact: true }).count(), 0);
      assert.equal(await page.getByText('Encontro do Norte', { exact: true }).count(), 1);

      await page.getByRole('tab', { name: 'Todos os grupos', exact: true }).click();
      await page.getByText('Encontro do Sul', { exact: true }).waitFor();
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px filtro por nome de grupo`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
