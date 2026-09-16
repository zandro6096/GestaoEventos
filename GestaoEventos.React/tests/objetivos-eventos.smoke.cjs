const assert = require("node:assert/strict");
const { Buffer } = require("node:buffer");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

function template() {
  return {
    id: 41,
    titulo: "Celula semanal",
    descricao: "Reuniao semanal da equipe.",
    tipo: "Evento",
    estrutura_id: 2,
    tipo_recorrencia: 2,
    intervalo: 1,
    dias_semana: ["quarta"],
    duracao_padrao_minutos: 60,
    status: "ATIVO",
  };
}

function objective() {
  return {
    id: 51,
    nome: "Presenca minima",
    descricao: "Acompanhar presenca no ciclo.",
    estrutura_id: 2,
    evento_template_id: 41,
    evento_template_titulo: "Celula semanal",
    tipo: "presenca_valida",
    escopo: "individual",
    data_inicio_referencia: "vinculo_template",
    prazo_quantidade: 2,
    prazo_unidade: "meses",
    meta_quantidade: 1,
    papel_alvo_id: null,
    papel_alvo_nome: null,
    papel_origem_id: null,
    papel_origem_nome: null,
    ativo: true,
    grupos_ids: [],
    tipos_grupo_ids: [],
    criado_em: "2026-01-01T00:00:00Z",
  };
}

async function mockApi(page, writes) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.method() !== "GET")
      writes.push({
        method: request.method(),
        path,
        body: request.postDataJSON?.(),
      });
    let data = { data: [] };
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
    if (path === "/api/evento-objetivos") data = { data: [objective()] };
    if (path === "/api/evento-templates")
      data = {
        data: [template()],
        paged_info: {
          page_number: 1,
          page_size: 100,
          total_pages: 1,
          total_records: 1,
        },
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
        page_info: { total_pages: 1 },
      };
    if (path === "/api/tipos-grupo")
      data = { data: [{ id: 8, nome: "Celula", ativo: true }] };
    if (path === "/api/papeis")
      data = { data: [{ id: 9, nome: "Lider", ativo: true, permissoes: [] }] };
    if (path === "/api/evento-objetivos/preview")
      data = {
        data: {
          estrutura_id: 2,
          evento_template_id: 41,
          evento_template_titulo: "Celula semanal",
          grupos_ids: [],
          tipos_grupo_ids: [],
          grupos_afetados: 1,
          participantes_alvo_estimados: 12,
        },
      };
    if (
      (request.method() === "POST" ||
        request.method() === "PUT" ||
        request.method() === "PATCH") &&
      path !== "/api/evento-objetivos/preview"
    )
      data = { data: objective() };
    await route.fulfill({ json: data });
  });
}

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
      await mockApi(page, writes);
      await page.goto("http://localhost:8083/admin/eventos/objetivos");
      await page.getByText("Objetivos", { exact: true }).first().waitFor();
      await page.getByText("Presenca minima", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Novo objetivo" }).click();
      await page.getByLabel("Nome do objetivo").fill("Novo objetivo de teste");
      await page.getByText("Selecione um modelo", { exact: true }).click();
      await page.getByText("Celula semanal", { exact: true }).last().click();
      await page.getByText("Atualizar estimativa", { exact: true }).click();
      await page.getByText(/1 grupos afetados/).waitFor();
      await page.getByText("Criar objetivo", { exact: true }).last().click();
      await page.waitForTimeout(150);
      assert.equal(
        writes.some(
          (write) =>
            write.method === "POST" && write.path === "/api/evento-objetivos",
        ),
        true,
      );
      await page
        .getByRole("button", { name: "Editar Presenca minima" })
        .click();
      await page.getByText("Editar objetivo", { exact: true }).waitFor();
      await page.getByText("Atualizar objetivo", { exact: true }).click();
      await page.waitForTimeout(150);
      assert.equal(
        writes.some(
          (write) =>
            write.method === "PUT" && write.path === "/api/evento-objetivos/51",
        ),
        true,
      );
      await page
        .getByRole("button", { name: "Pausar Presenca minima" })
        .click();
      await page.waitForTimeout(150);
      assert.equal(
        writes.some(
          (write) =>
            write.method === "PATCH" &&
            write.path === "/api/evento-objetivos/51/status",
        ),
        true,
      );
      assert.deepEqual(errors, []);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      console.log(`PASS ${width}px objetivos de eventos`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
