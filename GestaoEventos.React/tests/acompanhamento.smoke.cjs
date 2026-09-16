const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  fs.mkdirSync('tests/artifacts/acompanhamento', { recursive: true });
  try {
    for (const width of [390, 1440]) {
      for (const scenario of ['success', 'cancelled', '404', '403']) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        const token = `test.${Buffer.from(JSON.stringify({ sub: '3', exp: 4102444800 })).toString('base64url')}.test`;
        await page.addInitScript(token => sessionStorage.setItem('gestaoeventos.secure.auth_token', token), token);
        let status = scenario === 'cancelled' ? 'Cancelada' : 'EmAndamento';
        const writes = [];
        const participantWrites = [];
        let hasParticipant = true;
        await page.route('**/api/**', async route => {
          const request = route.request();
          const url = new URL(request.url());
          let data = { data: [] };
          if (url.pathname === '/api/contexto/inicial') data = { data: { usuario_id: 3, usuario_nome: 'Pessoa de teste', estrutura_id: 2, grupo_id: 5,
            estrutura_nome: 'Coaching Path', grupo_nome: 'Grupo de teste', tem_estrutura: true, estruturas: [{ id: 2, nome: 'Coaching Path', papel: 'Owner' }] } };
          if (url.pathname === '/api/eventos/42') {
            if (scenario === '404' || scenario === '403') return route.fulfill({ status: Number(scenario), json: { message: scenario === '404' ? 'Evento nao encontrado.' : 'Sem permissao para este evento.' } });
            data = { data: { id: 42, titulo: 'Encontro de acompanhamento', grupo_id: 5, grupo_nome: 'Grupo de teste', data_inicio: '2026-09-07T19:00:00', pode_cancelar: true } };
          }
          if (url.pathname === '/api/ocorrencias') data = { data: [{ id: 91, evento_id: 42, data_hora: '2026-09-07T19:00:00', status, cancelada: status === 'Cancelada', motivo_cancelamento: status === 'Cancelada' ? 'Mudanca de agenda' : null }] };
          if (url.pathname === '/api/eventos/42/participantes') {
            if (request.method() === 'POST') { hasParticipant = true; participantWrites.push(request.postDataJSON()); }
            data = { data: hasParticipant ? [{ id: 700, usuario_id: 8, nome: 'Participante de teste', status: 'PENDENTE', is_virtual: false }] : [] };
          }
          if (url.pathname === '/api/eventos/42/participantes/8' && request.method() === 'DELETE') {
            hasParticipant = false; participantWrites.push(request.postDataJSON());
          }
          if (url.pathname === '/api/usuarios') data = { data: [{ id: 8, nome: 'Participante de teste' }] };
          if (url.pathname === '/api/eventos/42/ciclos') data = { data: [{ id: 4, nome: 'Ciclo atual', inicio_em: '2026-01-01', ativo: true }] };
          if (request.method() === 'PUT') { writes.push(request.postDataJSON()); status = request.postDataJSON().novo_status; data = { id: 91, status }; }
          if (url.pathname === '/api/ocorrencias/91/descancelar') { writes.push(request.postDataJSON()); status = 'Agendada'; }
          await route.fulfill({ json: data });
        });
        const route = scenario === 'success' && width === 390
          ? '/admin/eventos/42/ocorrencias?data=2026-09-07'
          : '/eventos/acompanhar/42?data=2026-09-07';
        await page.goto(`http://localhost:8083${route}`);
        if (scenario === '404' || scenario === '403') {
          await page.getByText(scenario === '404' ? 'Evento nao encontrado.' : 'Sem permissao para este evento.', { exact: true }).waitFor();
          assert.equal(await page.getByRole('button', { name: 'Adicionar participante', exact: true }).count(), 0);
        } else {
          await page.getByText('Participante de teste', { exact: true }).waitFor();
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          await page.screenshot({ path: `tests/artifacts/acompanhamento/${scenario}-${width}.png`, fullPage: true });
          if (scenario === 'success') {
            await page.getByRole('button', { name: 'Remover Participante de teste', exact: true }).click();
            await page.getByLabel('Motivo', { exact: true }).fill('Mudanca de grupo');
            await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
            await page.getByText('Nenhum participante nesta ocorrencia.', { exact: true }).waitFor();
            assert.equal(participantWrites[0].ocorrencia_id, 91);
            assert.equal(participantWrites[0].escopo, 'somente_ocorrencia');
            assert.equal(participantWrites[0].tipo, 'usuario');
            await page.getByRole('button', { name: 'Adicionar participante', exact: true }).click();
            await page.getByLabel('Nome da pessoa', { exact: true }).fill('Participante');
            await page.getByRole('button', { name: 'Buscar pessoas', exact: true }).click();
            await page.getByText('Participante de teste', { exact: true }).click();
            await page.getByText('Esta e as proximas ocorrencias', { exact: true }).click();
            await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
            await page.getByRole('button', { name: 'Remover Participante de teste', exact: true }).waitFor();
            assert.equal(participantWrites[1].usuario_id, 8);
            assert.equal(participantWrites[1].escopo, 'futuros');
          }
          if (scenario === 'cancelled') {
            assert.equal(await page.getByRole('button', { name: 'Adicionar participante', exact: true }).count(), 0);
            await page.getByRole('button', { name: 'Restaurar ocorrencia', exact: true }).click();
          } else await page.getByRole('button', { name: 'Cancelar ocorrencia', exact: true }).click();
          assert.equal(await page.getByRole('button', { name: 'Confirmar', exact: true }).isDisabled(), true);
          await page.getByLabel('Motivo', { exact: true }).fill('Mudanca de agenda');
          await page.getByRole('button', { name: 'Confirmar', exact: true }).scrollIntoViewIfNeeded();
          await page.waitForTimeout(400); // Allow the native modal slide animation to settle before capturing.
          await page.screenshot({ path: `tests/artifacts/acompanhamento/dialog-${scenario}-${width}.png`, fullPage: true });
          await page.getByRole('button', { name: 'Confirmar', exact: true }).click();
          await page.getByRole('button', { name: scenario === 'cancelled' ? 'Adicionar participante' : 'Restaurar ocorrencia', exact: true }).waitFor();
          assert.equal(writes.length, 1);
          assert.equal(writes[0].motivo, 'Mudanca de agenda');
        }
        assert.deepEqual(errors, []);
        console.log(`PASS ${width}px ${scenario}`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
