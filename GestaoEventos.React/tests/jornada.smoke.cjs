const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const artifactSuffix = process.env.SMOKE_ARTIFACT_SUFFIX || 'latest';
  fs.mkdirSync('tests/artifacts/jornada', { recursive: true });
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
        if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: null, estrutura_nome: 'Coaching Path', grupo_nome: null, tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
        if (url.pathname === '/api/participacoes/frequencia') data = { data: { percentual_frequencia: 0, total_participacoes: 0, total_presencas: 0, total_ausencias: 0, total_pendentes: 0 } };
        if (url.pathname === '/api/pendencias/minhas/resumo') data = { data: { total: 2, grupos: [{ grupo_id: 21, grupo_nome: 'Grupo teste', total: 2, no_dia: 1, na_semana: 1, atrasadas: 0, maior_atraso_dias: 0 }], no_dia: 1, na_semana: 1, atrasadas: 0, maior_atraso_dias: 0 } };
        if (url.pathname === '/api/pendencias/minhas') data = { data: { itens: [{ ocorrencia_id: 31, evento_id: 41, evento_titulo: 'Encontro teste', data_hora: '2026-09-07T19:00:00', grupo_id: 21, grupo_nome: 'Grupo teste', responsavel_nome: 'Pessoa de teste' }], tem_mais: false } };
        await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/jornada`);
      await page.getByText('Eventos de hoje', { exact: true }).waitFor();
      if (width === 390) {
        // No celular o primeiro grupo com pendência já abre expandido.
        await page.getByLabel('Recolher pendencias de Grupo teste').waitFor();
        await page.getByText('Encontro teste', { exact: true }).waitFor();
        assert.equal(await page.getByText('Resolver pendencia', { exact: true }).count(), 0);
      }
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `tests/artifacts/jornada/jornada-${width}-${artifactSuffix}.png`, fullPage: true });
      console.log(`PASS ${width}px jornada com dados mockados`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
