const SMOKE_BASE_URL = process.env.GESTAOEVENTOS_SMOKE_BASE_URL || 'http://localhost:8083';
const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const token = `test.${Buffer.from(JSON.stringify({ sub: "3", exp: 4102444800 })).toString("base64url")}.test`;
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      const writes = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(
        (value) =>
          sessionStorage.setItem("gestaoeventos.secure.auth_token", value),
        token,
      );
      await page.route("**/api/**", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname;
        let data = { data: [] };
        if (request.method() !== "GET")
          writes.push({
            method: request.method(),
            path,
            body: request.postDataJSON?.(),
          });
        if (path === "/api/contexto/inicial")
          data = {
            data: {
              usuario_id: 3,
              usuario_nome: "Pessoa de teste",
              estrutura_id: 2,
              grupo_id: null,
              estrutura_nome: "Coaching Path",
              grupo_nome: null,
              tem_estrutura: true,
              estruturas: [{ id: 2, nome: "Coaching Path", papel: "Owner" }],
            },
          };
        if (path === "/api/permissoes/recursos")
          data = {
            data: [
              {
                id: 1,
                codigo: "eventos",
                nome: "Eventos",
                descricao: "Eventos",
                categoria: "operacao",
                ativo: true,
              },
            ],
          };
        if (path === "/api/evento-templates")
          data = {
            data: [
              {
                id: 41,
                titulo: "Celula semanal",
                descricao: "Reuniao semanal.",
                estrutura_id: 2,
                tipo_recorrencia: 2,
                intervalo: 1,
                dias_semana: ["quarta"],
                duracao_padrao_minutos: 60,
                status: "ATIVO",
              },
            ],
          };
        if (path === "/api/grupos")
          data = {
            data: [
              {
                id: 7,
                nome: "Equipe Norte",
                estrutura_id: 2,
                nivel_hierarquico: 1,
                grupo_superior_id: null,
              },
            ],
          };
        if (path === "/api/eventos/conflitos") data = { data: [] };
        if (request.method() === "POST" && path === "/api/eventos")
          data = { data: { id: 88 } };
        await route.fulfill({ json: data });
      });
      await page.goto(`${SMOKE_BASE_URL}/admin/eventos/criar`);
      await page.getByText("Criar Evento", { exact: true }).first().waitFor();
      await page.getByLabel("Nome base").fill("Reuniao de equipe");
      await page.getByText("Continuar", { exact: true }).click();
      await page.getByLabel("Data de inicio").fill("2026-12-31");
      await page.getByLabel("Hora de inicio").fill("19:30");
      await page.getByText("Continuar", { exact: true }).click();
      await page.getByText("Continuar", { exact: true }).click();
      await page.getByText("Equipe Norte", { exact: true }).click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.getByText("Criar evento", { exact: true }).click();
      await page.waitForTimeout(900);
      assert.equal(
        writes.some(
          (write) => write.method === "POST" && write.path === "/api/eventos",
        ),
        true,
      );
      assert.equal(
        writes.find(
          (write) => write.method === "POST" && write.path === "/api/eventos",
        ).body.titulo,
        "Reuniao de equipe",
      );
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px criacao direta de evento`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
